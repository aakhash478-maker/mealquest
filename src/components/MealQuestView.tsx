import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Swords,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Activity,
  HelpCircle,
  Flame,
  Utensils,
  Camera,
  FileText,
  Clipboard,
  Mic,
  Minus,
  Star
} from 'lucide-react';
import {
  ActualMealItem,
  ActualMealLog,
  FoodCategory,
  FoodItem,
  MealRecommendation,
  MealType,
  PlayerProfile
} from '../types';
import { detectFoodCategory } from '../utils/foodClassifier';
import { generateRecommendation, formatServingItem, getAgeGroup } from '../utils/recommendationEngine';
import { evaluateActualMeal } from '../utils/ratingEngine';
import { playButtonClick, playLevelUpFanfare, playQuestFanfare } from '../utils/soundEffects';
import { formatLocalDateTime, formatLocalDateWithWeekday, getLocalDateKey } from '../utils/dateUtils';
import { MenuImportModal } from './MenuImportModal';

const getRoleIcon = (role: FoodCategory): string => {
  switch (role) {
    case 'MAIN FOOD': return '🍽️';
    case 'PROTEIN': return '🥚';
    case 'VEGETABLE': return '🥦';
    case 'SIDE / ACCOMPANIMENT': return '🥣';
    case 'DRINK': return '☕';
    case 'FRIED / HEAVY': return '🍟';
    default: return '🍴';
  }
};

interface MealQuestViewProps {
  initialMealType?: MealType;
  inventories: Record<MealType, FoodItem[]>;
  onUpdateInventory: (meal: MealType, items: FoodItem[]) => void;
  onResetInventory: (meal: MealType) => void;
  profile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  spentToday: number;
  onLogMeal: (mealLog: ActualMealLog) => void;
  todayLogs: Record<MealType, ActualMealLog | undefined>;
}

export const MealQuestView: React.FC<MealQuestViewProps> = ({
  initialMealType = 'morning',
  inventories,
  onUpdateInventory,
  onResetInventory,
  profile,
  onUpdateProfile,
  spentToday,
  onLogMeal,
  todayLogs
}) => {
  const [activeMeal, setActiveMeal] = useState<MealType>(initialMealType);
  const currentInventory = inventories[activeMeal] || [];

  // Local inventory draft state so user can edit prices
  const [localItems, setLocalItems] = useState<FoodItem[]>(currentInventory);
  const [inventorySavedFeedback, setInventorySavedFeedback] = useState(false);

  // Menu Import Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New food manual input states
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPrice, setNewFoodPrice] = useState<number>(20);
  const [newFoodCategory, setNewFoodCategory] = useState<FoodCategory>('MAIN FOOD');
  const [addFoodError, setAddFoodError] = useState('');

  // Recommendation state
  const [recommendation, setRecommendation] = useState<MealRecommendation | null>(() => {
    return generateRecommendation(inventories[activeMeal] || [], profile, activeMeal, spentToday);
  });

  // Post-meal logging states
  const [actualFoodText, setActualFoodText] = useState('');
  const [actualQuantity, setActualQuantity] = useState(1);
  const [actualCost, setActualCost] = useState(0);
  const [structuredActualItems, setStructuredActualItems] = useState<ActualMealItem[]>([]);
  const [actualLogError, setActualLogError] = useState('');
  const [mealLogSuccess, setMealLogSuccess] = useState<ActualMealLog | null>(todayLogs[activeMeal] || null);

  // Sync state when active meal tab changes
  const handleSwitchMeal = (meal: MealType) => {
    setActiveMeal(meal);
    const items = inventories[meal] || [];
    setLocalItems(items);
    setNewFoodName('');
    setNewFoodPrice(20);
    setAddFoodError('');
    setActualFoodText('');
    setActualQuantity(1);
    setActualCost(0);
    setStructuredActualItems([]);
    setActualLogError('');
    setMealLogSuccess(todayLogs[meal] || null);

    const rec = generateRecommendation(items, profile, meal, spentToday);
    setRecommendation(rec);
  };

  // When parent inventories change externally
  React.useEffect(() => {
    setLocalItems(inventories[activeMeal] || []);
  }, [inventories, activeMeal]);

  // Update recommendation if profile or spentToday changes
  React.useEffect(() => {
    const rec = generateRecommendation(localItems, profile, activeMeal, spentToday);
    setRecommendation(rec);
  }, [profile, spentToday, activeMeal]);

  // Update local item price
  const handlePriceChange = (id: string, newPrice: number) => {
    const updated = localItems.map(item =>
      item.id === id ? { ...item, price: Math.max(0, isNaN(newPrice) ? 0 : newPrice) } : item
    );
    setLocalItems(updated);
  };

  // Update local item category
  const handleCategoryChange = (id: string, newCategory: FoodCategory) => {
    playButtonClick();
    const updated = localItems.map(item =>
      item.id === id ? { ...item, category: newCategory } : item
    );
    setLocalItems(updated);
    onUpdateInventory(activeMeal, updated);
  };

  // Delete item from inventory
  const handleRemoveItem = (id: string) => {
    playButtonClick();
    const updated = localItems.filter(item => item.id !== id);
    setLocalItems(updated);
    onUpdateInventory(activeMeal, updated);
  };

  // Auto-classify name as user types
  const handleNewFoodNameChange = (val: string) => {
    setNewFoodName(val);
    setAddFoodError('');
    if (val.trim().length > 1) {
      const detected = detectFoodCategory(val);
      setNewFoodCategory(detected);
    }
  };

  // Add imported items from Modal
  const handleImportItems = (items: FoodItem[]) => {
    const updated = [...localItems, ...items];
    setLocalItems(updated);
    onUpdateInventory(activeMeal, updated);
    setInventorySavedFeedback(true);
    setTimeout(() => setInventorySavedFeedback(false), 2500);

    // Auto regenerate recommendation
    const rec = generateRecommendation(updated, profile, activeMeal, spentToday);
    setRecommendation(rec);
  };

  // Add custom food to inventory
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();

    if (!newFoodName.trim()) {
      setAddFoodError('Please enter a valid food name.');
      return;
    }

    const exists = localItems.some(
      item => item.name.toLowerCase() === newFoodName.trim().toLowerCase()
    );
    if (exists) {
      setAddFoodError(`"${newFoodName.trim()}" is already in this meal's inventory.`);
      return;
    }

    const newItem: FoodItem = {
      id: `custom-${Date.now()}`,
      name: newFoodName.trim(),
      price: Math.max(0, newFoodPrice),
      category: newFoodCategory
    };

    const updated = [...localItems, newItem];
    setLocalItems(updated);
    onUpdateInventory(activeMeal, updated);

    setNewFoodName('');
    setNewFoodPrice(20);
    setAddFoodError('');
  };

  // Save current inventory prices
  const handleSaveInventory = () => {
    playButtonClick();
    onUpdateInventory(activeMeal, localItems);
    setInventorySavedFeedback(true);
    setTimeout(() => setInventorySavedFeedback(false), 2500);
  };

  // Reset inventory to defaults
  const handleResetDefaults = () => {
    playButtonClick();
    onResetInventory(activeMeal);
  };

  // Generate recommendation & scroll to result
  const handleGenerate = () => {
    playButtonClick();
    playQuestFanfare();
    onUpdateInventory(activeMeal, localItems);

    const rec = generateRecommendation(localItems, profile, activeMeal, spentToday);
    setRecommendation(rec);

    setTimeout(() => {
      const el = document.getElementById('recommendation-result-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  // Actual Meal actions
  const handleAddDishToActual = (food: FoodItem) => {
    playButtonClick();
    setActualLogError('');
    setStructuredActualItems(prev => {
      const existing = prev.find(i => i.food.toLowerCase() === food.name.toLowerCase());
      let updated: ActualMealItem[];
      if (existing) {
        updated = prev.map(i =>
          i.food.toLowerCase() === food.name.toLowerCase()
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updated = [...prev, { food: food.name, quantity: 1, price: food.price }];
      }

      const summary = updated.map(i => `${i.quantity} × ${i.food}`).join(' + ');
      setActualFoodText(summary);

      const totalCalculatedCost = updated.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      );
      setActualCost(totalCalculatedCost);

      const totalQuantity = updated.reduce((sum, item) => sum + item.quantity, 0);
      setActualQuantity(Math.max(1, totalQuantity));

      return updated;
    });
  };

  const handleUpdateItemQty = (foodName: string, delta: number) => {
    playButtonClick();
    setStructuredActualItems(prev => {
      const updated = prev
        .map(i => {
          if (i.food.toLowerCase() === foodName.toLowerCase()) {
            return { ...i, quantity: i.quantity + delta };
          }
          return i;
        })
        .filter(i => i.quantity > 0);

      const summary = updated.map(i => `${i.quantity} × ${i.food}`).join(' + ');
      setActualFoodText(summary);

      const totalCalculatedCost = updated.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      );
      setActualCost(totalCalculatedCost);

      const totalQuantity = updated.reduce((sum, item) => sum + item.quantity, 0);
      setActualQuantity(Math.max(1, totalQuantity));

      return updated;
    });
  };

  // Log Actual Meal
  const handleLogActualMeal = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();

    if (!actualFoodText.trim()) {
      setActualLogError('Please enter or tap the foods you actually ate.');
      return;
    }

    if (actualCost < 0 || isNaN(actualCost)) {
      setActualLogError('Please enter a valid cost (₹).');
      return;
    }

    setActualLogError('');

    // Evaluate against rating engine
    const ratingBreakdown = evaluateActualMeal(
      actualFoodText,
      actualQuantity,
      actualCost,
      activeMeal,
      recommendation,
      profile,
      spentToday
    );

    const newLog: ActualMealLog = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      dateKey: getLocalDateKey(),
      mealType: activeMeal,
      recommendedSummary: recommendation && recommendation.items.length > 0
        ? recommendation.items.map(s => formatServingItem(s.food.name, s.recommendedQuantity)).join(' + ')
        : 'None',
      recommendedCost: recommendation ? recommendation.totalCost : 0,
      recommendedGeneratedAt: recommendation ? recommendation.generatedAt : Date.now(),
      recommendedItems: recommendation ? recommendation.items : [],
      actualFoodSummary: actualFoodText.trim(),
      actualQuantity,
      actualCost,
      rating: ratingBreakdown.finalScore,
      ratingBreakdown,
      structuredItems: structuredActualItems
    };

    onLogMeal(newLog);
    setMealLogSuccess(newLog);

    // Award XP (+50 XP) & check level up (using consistent 200 XP per level)
    const newXp = profile.xp + 50;
    const oldLevel = Math.floor(profile.xp / 200) + 1;
    const newLevel = Math.floor(newXp / 200) + 1;

    let updatedBadges = [...profile.unlockedBadges];
    if (!updatedBadges.includes('⚔️ Quest Starter')) {
      updatedBadges.push('⚔️ Quest Starter');
    }
    if (ratingBreakdown.finalScore >= 8.5 && !updatedBadges.includes('🏆 Healthy Choice')) {
      updatedBadges.push('🏆 Healthy Choice');
    }

    onUpdateProfile({
      ...profile,
      xp: newXp,
      level: newLevel,
      unlockedBadges: updatedBadges
    });

    if (newLevel > oldLevel) {
      playLevelUpFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      playQuestFanfare();
    }
  };

  const mealTabInfo = {
    morning: { label: '🌅 Breakfast', subtitle: 'Breakfast Quest' },
    afternoon: { label: '☀️ Lunch', subtitle: 'Lunch Quest' },
    night: { label: '🌙 Dinner', subtitle: 'Dinner Quest' }
  };

  const remainingDailyBudget = Math.max(0, profile.dailyBudget - spentToday);

  return (
    <div id="meal-quest-view" className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Menu Import Modal */}
      <MenuImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onAddItems={handleImportItems}
        mealTitle={mealTabInfo[activeMeal].label}
      />

      {/* Header & Meal Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold">
            <Swords className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>HOTEL FOOD INVENTORY & MEAL FORMULATION</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400 font-semibold">{formatLocalDateWithWeekday()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-rpg tracking-wide">
            Hotel Food Inventory & Decision Quest
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Manage foods currently available at your hotel, adjust prices, and generate practical recommendations.
          </p>
        </div>

        {/* Meal Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#161522] border border-purple-200 dark:border-purple-900/50 shadow-xs">
          {(['morning', 'afternoon', 'night'] as MealType[]).map(meal => {
            const isSelected = activeMeal === meal;
            const hasLog = todayLogs[meal];
            return (
              <button
                key={meal}
                id={`tab-${meal}`}
                onClick={() => {
                  playButtonClick();
                  handleSwitchMeal(meal);
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-700 dark:bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{mealTabInfo[meal].label}</span>
                {hasLog && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Already logged today" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* SMART MENU INPUT QUICK ACTION BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-mono uppercase text-slate-700 dark:text-slate-300 font-bold">
            Import Menu for {mealTabInfo[activeMeal].label}:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-import-menu-image"
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            <span>📷 Upload Menu Image</span>
          </button>

          <button
            id="btn-import-menu-file"
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            <span>📄 Upload Menu File</span>
          </button>

          <button
            id="btn-import-menu-paste"
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Clipboard className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            <span>📋 Paste Menu</span>
          </button>

          <button
            id="btn-import-menu-voice"
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Mic className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            <span>🎤 Voice Input</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inventory Table on Left, Actions / Add Food on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Food Inventory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold font-rpg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{mealTabInfo[activeMeal].label} Available Dishes</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-mono font-bold">
                    {localItems.length} dishes
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Unit prices are editable. Every dish listed here is currently available at the hotel.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-save-inventory"
                  onClick={handleSaveInventory}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="Save edited prices to local storage"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Inventory</span>
                </button>

                <button
                  id="btn-reset-defaults"
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                  title="Reset to default menu items and prices"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {inventorySavedFeedback && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Inventory prices saved successfully to your local quest storage!</span>
              </div>
            )}

            {/* Inventory Explanation Note */}
            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5 text-[11px] leading-relaxed">
                <strong className="text-purple-950 dark:text-purple-300 font-mono font-bold">Hotel Food Availability: </strong>
                <span>
                  Foods listed below are currently available at the hotel. MealQuest recommends practical serving portions (e.g. 2–3 Idlis, 1 Dosa) independently based on food type, age group, and budget.
                </span>
              </div>
            </div>

            {/* Inventory List Table */}
            {localItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
                <p>No food items in this meal's inventory.</p>
                <p className="text-xs text-purple-700 dark:text-purple-400">Use the smart menu import bar above or add dishes manually using the form on the right.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-mono font-bold">
                      <th className="pb-2 font-medium">Food Name</th>
                      <th className="pb-2 font-medium">Category / Role</th>
                      <th className="pb-2 font-medium w-32">Price (₹)</th>
                      <th className="pb-2 font-medium text-right w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {localItems.map(item => {
                      let badgeColor = 'bg-slate-50 dark:bg-[#1E1D2D] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                      if (item.category === 'MAIN FOOD') badgeColor = 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
                      else if (item.category === 'PROTEIN') badgeColor = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
                      else if (item.category === 'VEGETABLE') badgeColor = 'bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/60';
                      else if (item.category === 'SIDE / ACCOMPANIMENT') badgeColor = 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
                      else if (item.category === 'DRINK') badgeColor = 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60';
                      else if (item.category === 'FRIED / HEAVY') badgeColor = 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';

                      return (
                        <tr key={item.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                          {/* Name */}
                          <td className="py-2.5 font-bold text-slate-900 dark:text-slate-100">
                            <span>{item.name}</span>
                          </td>

                          {/* Category Badge / Selector */}
                          <td className="py-2.5">
                            <select
                              value={item.category}
                              onChange={e => handleCategoryChange(item.id, e.target.value as FoodCategory)}
                              className={`text-[11px] font-mono px-2 py-1 rounded-lg border ${badgeColor} cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500`}
                            >
                              <option value="MAIN FOOD">MAIN FOOD</option>
                              <option value="PROTEIN">PROTEIN</option>
                              <option value="VEGETABLE">VEGETABLE</option>
                              <option value="SIDE / ACCOMPANIMENT">SIDE / ACCOMPANIMENT</option>
                              <option value="DRINK">DRINK</option>
                              <option value="FRIED / HEAVY">FRIED / HEAVY</option>
                            </select>
                          </td>

                          {/* Editable Price */}
                          <td className="py-2.5">
                            <div className="flex items-center">
                              <span className="text-slate-500 dark:text-slate-400 mr-1 font-bold">₹</span>
                              <input
                                id={`input-price-${item.id}`}
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={e => handlePriceChange(item.id, parseFloat(e.target.value))}
                                className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:border-purple-600 focus:outline-none"
                              />
                            </div>
                          </td>

                          {/* Delete Button */}
                          <td className="py-2.5 text-right">
                            <button
                              id={`btn-remove-${item.id}`}
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title={`Remove ${item.name}`}
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick Engine Action: Generate Recommendation */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Daily Budget: <strong className="text-slate-900 dark:text-slate-100">₹{profile.dailyBudget}</strong> | Spent: <strong className="text-slate-900 dark:text-slate-100">₹{spentToday}</strong> | Remaining: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">₹{remainingDailyBudget}</strong>
              </div>

              <button
                id="btn-generate-recommendation"
                onClick={handleGenerate}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-rpg text-sm font-bold tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <Swords className="w-4 h-4 text-amber-300" />
                <span>GENERATE RECOMMENDATION</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Add Food & Quick Context Panel */}
        <div className="space-y-4">
          {/* Add Food Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-4 transition-colors">
            <h3 className="text-base font-bold font-rpg text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Add Dish to {mealTabInfo[activeMeal].label}</span>
            </h3>

            <form onSubmit={handleAddFood} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Food Name</label>
                <input
                  id="input-add-food-name"
                  type="text"
                  placeholder="e.g. Chapati, Egg, Paneer"
                  value={newFoodName}
                  onChange={e => handleNewFoodNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Price per serving (₹)</label>
                <input
                  id="input-add-food-price"
                  type="number"
                  min="0"
                  value={newFoodPrice}
                  onChange={e => setNewFoodPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category Role</label>
                <select
                  id="select-add-food-category"
                  value={newFoodCategory}
                  onChange={e => setNewFoodCategory(e.target.value as FoodCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono focus:border-purple-600 focus:outline-none cursor-pointer"
                >
                  <option value="MAIN FOOD">MAIN FOOD (Rice, Dosa, Idli, Chapati, Pongal)</option>
                  <option value="PROTEIN">PROTEIN (Egg, Chicken, Dal, Paneer, Fish)</option>
                  <option value="VEGETABLE">VEGETABLE (Poriyal, Salad, Keerai, Subzi)</option>
                  <option value="SIDE / ACCOMPANIMENT">SIDE / ACCOMPANIMENT (Sambar, Curd, Rasam)</option>
                  <option value="DRINK">DRINK (Tea, Coffee, Juice)</option>
                  <option value="FRIED / HEAVY">FRIED / HEAVY (Vada, Fried Chicken)</option>
                </select>
              </div>

              {addFoodError && (
                <p className="text-rose-600 dark:text-rose-400 text-xs">{addFoodError}</p>
              )}

              <button
                id="btn-submit-add-food"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs font-rpg tracking-wider cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>ADD DISH TO MENU</span>
              </button>
            </form>
          </div>

          {/* Active Personalization Context Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-2.5 text-xs transition-colors">
            <div className="flex items-center justify-between text-purple-900 dark:text-purple-300 font-bold font-mono">
              <span>ACTIVE CONSTRAINTS</span>
              <Activity className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Diet Preference:</span>
                <strong className={profile.foodPreference === 'Vegetarian' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}>
                  {profile.foodPreference}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Avoided:</span>
                <span className="truncate max-w-[140px] text-rose-700 dark:text-rose-400 font-medium">{profile.foodsToAvoid || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Condition:</span>
                <span className={profile.condition !== 'Normal day' ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-slate-900 dark:text-slate-200'}>
                  {profile.condition}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECOMMENDATION RESULT SECTION */}
      {/* ========================================================================= */}
      {!recommendation ? (
        <div
          id="recommendation-result-container"
          className="p-8 rounded-2xl bg-white dark:bg-[#161522] border-2 border-dashed border-purple-200 dark:border-purple-900/50 shadow-xs text-center space-y-3 transition-colors"
        >
          <div className="flex items-center justify-center gap-2 text-purple-800 dark:text-purple-300 font-rpg text-xl font-extrabold tracking-wide">
            <Swords className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>MEAL QUEST RECOMMENDATION</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Your personalized combination for <strong>{mealTabInfo[activeMeal].subtitle}</strong> will appear right here.
          </p>
          <button
            id="btn-generate-rec-central"
            onClick={handleGenerate}
            className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-rpg text-sm font-bold tracking-wider shadow-xs cursor-pointer transition-all inline-flex items-center gap-2"
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>GENERATE RECOMMENDATION</span>
          </button>
        </div>
      ) : (
        <div id="recommendation-result-container" className="space-y-4 pt-2">
          {/* Missing main food or no practical meal available */}
          {(recommendation.status === 'NO_MAIN_FOOD' || recommendation.status === 'NO_AVAILABLE_FOOD' || recommendation.status === 'NO_COMPLETE_MEAL' || (recommendation.status === 'OVER_BUDGET' && recommendation.items.length === 0)) && (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/60 shadow-xs text-amber-950 dark:text-amber-200 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 font-bold text-lg font-rpg">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  {recommendation.status === 'NO_MAIN_FOOD' || recommendation.status === 'NO_COMPLETE_MEAL'
                    ? 'NO PRACTICAL COMPLETE MEAL AVAILABLE'
                    : 'NO PRACTICAL MEAL AVAILABLE'}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                {recommendation.errorMessage}
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161522] border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 font-mono space-y-1">
                <strong className="text-amber-950 dark:text-amber-200 block font-bold">Portion & Inventory Check:</strong>
                <span>
                  {recommendation.portionCheck}
                  {recommendation.whyBreakdown.mainFoodReason !== 'None available.' && ` • ${recommendation.whyBreakdown.mainFoodReason}`}
                  {recommendation.whyBreakdown.budgetReason && ` • ${recommendation.whyBreakdown.budgetReason}`}
                </span>
              </div>
            </div>
          )}

          {/* SUCCESSFUL / VALID RECOMMENDATION */}
          {recommendation.items.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#161522] border-2 border-purple-200 dark:border-purple-900/50 shadow-sm space-y-6 transition-colors">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>RECOMMENDED MEAL COMBINATION</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Generated on: <span className="text-slate-800 dark:text-slate-200 font-semibold">{formatLocalDateTime(recommendation.generatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-300 font-semibold">
                    {mealTabInfo[activeMeal].subtitle}
                  </span>
                  {recommendation.recommendationScore && (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      Score {recommendation.recommendationScore}/10
                    </span>
                  )}
                </div>
              </div>

              {/* LIMITED PORTION WARNING BANNER */}
              {recommendation.isLimitedPortion && recommendation.limitedPortionWarning && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <strong className="text-amber-950 dark:text-amber-200 font-bold font-mono uppercase tracking-wide block">
                      Limited Portion Advisory
                    </strong>
                    <p className="leading-relaxed text-amber-900 dark:text-amber-300">
                      {recommendation.limitedPortionWarning}
                    </p>
                  </div>
                </div>
              )}

              {/* PROMINENT SUGGESTION HERO BOX */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/40 to-white dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-[#161522] border-2 border-purple-300 dark:border-purple-800/60 shadow-xs space-y-4">
                <div className="text-purple-950 dark:text-purple-200 font-rpg font-extrabold text-lg sm:text-xl tracking-wide flex items-center gap-2">
                  <span>👉 MealQuest Suggests You Eat:</span>
                </div>

                <div className="py-1 space-y-1">
                  <div className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-200 font-rpg tracking-wide leading-snug">
                    {recommendation.items.map(s => formatServingItem(s.food.name, s.recommendedQuantity)).join(' + ')}
                  </div>
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>
                      Practical serving portion for a {getAgeGroup(profile.age || 21)} ({profile.age || 21} yrs) {mealTabInfo[activeMeal].subtitle} meal — based on dietary heuristics and hotel availability.
                    </span>
                  </div>
                </div>

                {/* PORTION CHECK & DECISION SUMMARY */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-purple-200 dark:border-purple-800/50 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="font-mono font-bold text-purple-900 dark:text-purple-300 uppercase flex items-center gap-1.5 text-[11px]">
                      <span>⚖️</span>
                      <span>Portion Balance Check</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {recommendation.portionCheck}
                    </span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block mb-0.5">Portion Decision:</strong>
                    <p>{recommendation.portionDecision}</p>
                  </div>
                </div>

                {/* COST & REMAINING BUDGET */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-200 dark:border-purple-800/60">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-purple-100 dark:border-purple-900/40 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="block text-[11px] uppercase font-mono text-slate-500 dark:text-slate-400 font-bold">Estimated Cost</span>
                      <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">₹{recommendation.totalCost}</span>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {recommendation.items.map(i => `${i.recommendedQuantity}×₹${i.unitPrice}`).join(' + ')}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-purple-100 dark:border-purple-900/40 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="block text-[11px] uppercase font-mono text-slate-500 dark:text-slate-400 font-bold">Remaining Budget</span>
                      <span className={`text-2xl font-black font-mono ${
                        profile.dailyBudget - spentToday - recommendation.totalCost >= 0
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        ₹{Math.max(0, profile.dailyBudget - spentToday - recommendation.totalCost)}
                      </span>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      after this meal
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Items Display */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400 font-bold block">
                  Dishes in Recommended Combination:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recommendation.items.map((selection, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white dark:bg-[#1E1D2D] border border-purple-100 dark:border-purple-900/40 flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 uppercase font-bold flex items-center gap-1 border border-purple-200 dark:border-purple-800/60">
                            <span>{getRoleIcon(selection.role)}</span>
                            <span>{selection.role}</span>
                          </span>
                        </div>
                        <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                          {formatServingItem(selection.food.name, selection.recommendedQuantity)}
                        </div>
                        <div className="text-[11px] text-purple-700 dark:text-purple-400 font-mono mt-0.5 font-semibold">
                          Suggested Serving Portion
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500 dark:text-slate-400">₹{selection.unitPrice} each</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">₹{selection.subtotal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: WHY THIS COMBINATION? */}
              <div id="why-this-combination-box" className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold font-rpg text-base border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Why this combination?</span>
                </div>

                {/* Individual dish rationale cards */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block">
                    Selected Items Explanation:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendation.items.map((selection, idx) => {
                      const ir = recommendation.itemReasons.find(r => r.name.toLowerCase() === selection.food.name.toLowerCase());
                      return (
                        <div key={idx} className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-start gap-3">
                          <span className="text-2xl shrink-0 mt-0.5">{getRoleIcon(selection.role)}</span>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 dark:text-slate-100 text-sm font-bold">
                                {formatServingItem(selection.food.name, selection.recommendedQuantity)}
                              </strong>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#161522] text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 uppercase font-bold">
                                {selection.role}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                              {selection.role === 'MAIN FOOD' && 'Selected as the primary energy base. '}
                              {selection.role === 'PROTEIN' && 'Added as a vital protein source. '}
                              {selection.role === 'SIDE / ACCOMPANIMENT' && 'Used as an accompaniment to the main dish. '}
                              {selection.role === 'VEGETABLE' && 'Added for fresh vegetable nutrients & fiber. '}
                              {ir?.reason || `${selection.food.name} completes this balanced combination.`}
                            </p>
                            <div className="text-[11px] font-mono text-purple-800 dark:text-purple-300 font-semibold">
                              ₹{selection.unitPrice} each × {selection.recommendedQuantity} = ₹{selection.subtotal}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overall Factors Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <span>💰</span>
                      <span>Budget</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.budgetReason}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-400">
                      <span>🚫</span>
                      <span>Avoid List</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.avoidReason || (profile.foodsToAvoid ? `Foods on your avoid list (${profile.foodsToAvoid}) were excluded.` : 'No foods on avoid list.')}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
                      <span>🥗</span>
                      <span>Preference</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.preferenceReason}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-400">
                      <span>❤️</span>
                      <span>Current Condition</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.conditionReason || `Status: ${profile.condition}. Balanced digestion suitable for a regular day.`}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-xs space-y-1 sm:col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300">
                      <span>⚖️</span>
                      <span>Profile Context</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.profileContextReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: COST / BUDGET */}
              <div id="cost-budget-section" className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold font-rpg text-base">
                    <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Food Budget Tracking</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {mealTabInfo[activeMeal].subtitle} Breakdown
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Daily Budget</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">₹{profile.dailyBudget}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Spent Before Meal</span>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">₹{spentToday}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                    <span className="block text-[10px] text-purple-700 dark:text-purple-300 uppercase font-mono font-bold">Recommended Cost</span>
                    <span className="text-lg font-bold text-purple-950 dark:text-purple-200">₹{recommendation.totalCost}</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    profile.dailyBudget - spentToday - recommendation.totalCost >= 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-mono font-bold opacity-80">Remaining After Meal</span>
                    <span className="text-lg font-bold">
                      ₹{profile.dailyBudget - spentToday - recommendation.totalCost}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alternatives */}
              {recommendation.alternatives.length > 0 && (
                <div id="alternatives-section" className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-rpg text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Other Quest Options (Alternatives From Hotel)</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {recommendation.alternatives.length} valid option{recommendation.alternatives.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {recommendation.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-white dark:bg-[#1E1D2D] border border-purple-100 dark:border-purple-900/40 text-xs space-y-2.5 flex flex-col justify-between shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <strong className="text-purple-900 dark:text-purple-300 text-sm font-rpg">{alt.title}</strong>
                            <span className="font-mono text-slate-900 dark:text-slate-100 font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60">
                              ₹{alt.totalCost}
                            </span>
                          </div>
                          <div className="text-slate-800 dark:text-slate-200 font-medium text-xs leading-relaxed">
                            {alt.itemsSummary}
                          </div>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                          <strong className="text-purple-900 dark:text-purple-300 block mb-0.5">Why primary recommendation is preferred:</strong>
                          <span>{alt.whyPrimaryPreferred}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Navigation to Actual Meal Log */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Recommendation is guidance. Ready to record? Enter what you actually consumed at the hotel below.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('actual-meal-entry-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-900 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800/60 shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>⬇️ Log What You Actually Ate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: WHAT DID YOU ACTUALLY EAT? (DISTINCT ACTUAL MEAL LOGGING) */}
      {/* ========================================================================= */}
      <div id="actual-meal-entry-card" className="p-6 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-bold">
              <Utensils className="w-4 h-4" />
              <span>POST-MEAL QUEST VERIFICATION</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-rpg">
              What did you actually eat?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The recommendation is guidance; record what you actually ate to earn XP and receive an accurate transparent rating.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-bold">
            Current Quest: {mealTabInfo[activeMeal].subtitle}
          </span>
        </div>

        {/* Clear Guidance vs Reality distinction banner */}
        <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="font-bold font-mono text-purple-950 dark:text-purple-300 block flex items-center gap-1.5">
              <span>🛡️</span>
              <span>STRICT SEPARATION — RECOMMENDATION vs ACTUAL MEAL:</span>
            </span>
            <span className="text-slate-600 dark:text-slate-400 leading-relaxed">
              MealQuest recommended a balanced portion based on hotel inventory. What did you actually eat? Tap dishes from the hotel menu below or enter your exact food and spend.
            </span>
          </div>
        </div>

        {/* Validation Error Banner */}
        {actualLogError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-mono animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{actualLogError}</span>
          </div>
        )}

        {/* Quick-add chips from current inventory */}
        {localItems.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold block">
              Quick tap from hotel menu:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {localItems.map(item => {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddDishToActual(item)}
                    className="px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 bg-white dark:bg-[#1E1D2D] hover:bg-purple-50 dark:hover:bg-purple-950/50 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 text-slate-700 dark:text-slate-300 shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>{item.name}</span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono">₹{item.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Structured dishes selected list */}
        {structuredActualItems.length > 0 && (
          <div className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
            <span className="text-xs font-mono text-purple-900 dark:text-purple-300 uppercase font-bold block">
              Dishes in Actual Meal:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {structuredActualItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs shadow-2xs"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 block">{item.food}</strong>
                    {item.price ? (
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(item.food, -1)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold font-mono text-purple-900 dark:text-purple-300">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(item.food, 1)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleLogActualMeal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dishes Summary (e.g. "2 Dosa + 1 Egg + Sambar" or "Rice + Sambar + Poriyal")
              </label>
              <input
                id="input-actual-food"
                type="text"
                placeholder="Type the actual items you ate or use buttons above"
                value={actualFoodText}
                onChange={e => setActualFoodText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Actual Total Cost (₹)
              </label>
              <input
                id="input-actual-cost"
                type="number"
                min="0"
                value={actualCost}
                onChange={e => setActualCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm font-bold focus:border-purple-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <span>Portion Count / Quantity:</span>
              <input
                id="input-actual-qty"
                type="number"
                min="1"
                max="10"
                value={actualQuantity}
                onChange={e => setActualQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs text-center"
              />
              <span>servings</span>
            </div>

            <button
              id="btn-log-meal-quest"
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-rpg font-bold tracking-wider text-sm shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>LOG ACTUAL MEAL & GET RATING (+50 XP)</span>
            </button>
          </div>
        </form>

        {/* POST-MEAL RATING SCORECARD */}
        {mealLogSuccess && (
          <div
            id="meal-logged-feedback-card"
            className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-4 animate-in fade-in"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100 dark:border-purple-900/40">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold font-rpg text-slate-900 dark:text-slate-100">
                  Meal Rating: <span className="text-purple-800 dark:text-purple-300">{mealLogSuccess.rating} / 10</span>
                </h3>
              </div>

              <div className="text-xs font-mono text-purple-900 dark:text-purple-300 bg-white dark:bg-[#161522] px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800/60 font-bold shadow-2xs">
                +50 Quest XP Earned!
              </div>
            </div>

            {/* Score Factors Breakdown */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-mono font-bold text-purple-900 dark:text-purple-300 block">
                Why this rating?
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">🍽️ Structure</span>
                  <strong className="text-slate-900 dark:text-slate-100">{mealLogSuccess.ratingBreakdown.mealStructure.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 truncate">{mealLogSuccess.ratingBreakdown.mealStructure.notes}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">💪 Protein</span>
                  <strong className="text-slate-900 dark:text-slate-100">{mealLogSuccess.ratingBreakdown.protein.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 truncate">{mealLogSuccess.ratingBreakdown.protein.notes}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">🥗 Variety / Side</span>
                  <strong className="text-slate-900 dark:text-slate-100">{mealLogSuccess.ratingBreakdown.variety.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 truncate">{mealLogSuccess.ratingBreakdown.variety.notes}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">🔢 Quantity</span>
                  <strong className="text-slate-900 dark:text-slate-100">{mealLogSuccess.ratingBreakdown.quantityPortion.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 truncate">{mealLogSuccess.ratingBreakdown.quantityPortion.notes}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">💰 Budget Fit</span>
                  <strong className="text-slate-900 dark:text-slate-100">{mealLogSuccess.ratingBreakdown.budget.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 truncate">{mealLogSuccess.ratingBreakdown.budget.notes}</span>
                </div>
              </div>

              {/* Deductions or Constructive Notes */}
              {mealLogSuccess.ratingBreakdown.penalties.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <strong className="text-rose-900 dark:text-rose-300 font-bold block">Score Adjustments & Deductions:</strong>
                  {mealLogSuccess.ratingBreakdown.penalties.map((pen, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span>▸ {pen.label}: {pen.reason}</span>
                      <span className="font-mono text-rose-700 dark:text-rose-300 font-bold">-{pen.points} pts</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Narrative explanation */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-[#1E1D2D] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                "{mealLogSuccess.ratingBreakdown.whyExplanation}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
