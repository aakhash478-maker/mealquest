import React, { useState, useMemo } from 'react';
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
  Coins,
  Scale,
  Activity,
  Heart,
  HelpCircle,
  Flame,
  ArrowRight,
  Utensils,
  Camera,
  FileText,
  Clipboard,
  Mic,
  Check,
  X,
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
import { generateRecommendation } from '../utils/recommendationEngine';
import { evaluateActualMeal } from '../utils/ratingEngine';
import { playButtonClick, playLevelUpFanfare, playQuestFanfare } from '../utils/soundEffects';
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

  // Local inventory draft state so user can edit prices/quantities
  const [localItems, setLocalItems] = useState<FoodItem[]>(currentInventory);
  const [inventorySavedFeedback, setInventorySavedFeedback] = useState(false);

  // Menu Import Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalTab, setImportModalTab] = useState<'paste' | 'image' | 'file' | 'voice'>('paste');

  // New food manual input states
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPrice, setNewFoodPrice] = useState<number>(20);
  const [newFoodQuantity, setNewFoodQuantity] = useState<number>(1);
  const [newFoodCategory, setNewFoodCategory] = useState<FoodCategory>('MAIN FOOD');
  const [addFoodError, setAddFoodError] = useState('');

  // Recommendation state (initialized with current inventory recommendation so it is immediately active)
  const [recommendation, setRecommendation] = useState<MealRecommendation | null>(() => {
    return generateRecommendation(inventories[activeMeal] || [], profile, activeMeal, spentToday);
  });

  // Actual meal logging states
  const [structuredActualItems, setStructuredActualItems] = useState<ActualMealItem[]>([]);
  const [actualFoodText, setActualFoodText] = useState('');
  const [actualQuantity, setActualQuantity] = useState<number>(1);
  const [actualCost, setActualCost] = useState<number>(60);
  const [mealLogSuccess, setMealLogSuccess] = useState<ActualMealLog | null>(null);

  // Sync local items and recalculate recommendation ONLY when activeMeal tab actually changes
  const activeMealRef = React.useRef(activeMeal);
  React.useEffect(() => {
    if (activeMealRef.current !== activeMeal) {
      activeMealRef.current = activeMeal;
      const currentItems = inventories[activeMeal] || [];
      setLocalItems(currentItems);
      setRecommendation(generateRecommendation(currentItems, profile, activeMeal, spentToday));
      setMealLogSuccess(null);
      setStructuredActualItems([]);
      setActualFoodText('');
    }
  }, [activeMeal, inventories, profile, spentToday]);

  // Handle edit price
  const handlePriceChange = (id: string, price: number) => {
    const validPrice = Math.max(0, isNaN(price) ? 0 : price);
    setLocalItems(prev => prev.map(item => (item.id === id ? { ...item, price: validPrice } : item)));
  };

  // Handle edit quantity
  const handleQuantityChange = (id: string, qty: number) => {
    const validQty = Math.max(0, isNaN(qty) ? 0 : qty);
    setLocalItems(prev => prev.map(item => (item.id === id ? { ...item, quantity: validQty } : item)));
  };

  // Handle edit category
  const handleCategoryChange = (id: string, cat: FoodCategory) => {
    setLocalItems(prev => prev.map(item => (item.id === id ? { ...item, category: cat } : item)));
  };

  // Handle remove food
  const handleRemoveItem = (id: string) => {
    playButtonClick();
    const updated = localItems.filter(item => item.id !== id);
    setLocalItems(updated);
    onUpdateInventory(activeMeal, updated);
  };

  // Open import modal
  const handleOpenImport = (tab: 'paste' | 'image' | 'file' | 'voice') => {
    playButtonClick();
    setImportModalTab(tab);
    setIsImportModalOpen(true);
  };

  // Handle newly imported items from modal
  const handleImportItems = (items: FoodItem[]) => {
    const existingNames = new Set(localItems.map(i => i.name.toLowerCase()));
    // Combine items, avoiding exact duplicates or updating them
    const newOnes: FoodItem[] = [];
    const updatedLocal = localItems.map(item => {
      const match = items.find(im => im.name.toLowerCase() === item.name.toLowerCase());
      if (match) {
        return { ...item, price: match.price, quantity: match.quantity, category: match.category };
      }
      return item;
    });

    for (const item of items) {
      if (!existingNames.has(item.name.toLowerCase())) {
        newOnes.push(item);
      }
    }

    const combined = [...updatedLocal, ...newOnes];
    setLocalItems(combined);
    onUpdateInventory(activeMeal, combined);
    setInventorySavedFeedback(true);
    setTimeout(() => setInventorySavedFeedback(false), 2500);
  };

  // Auto-detect category when typing new food name
  const handleNewFoodNameChange = (val: string) => {
    setNewFoodName(val);
    setAddFoodError('');
    if (val.trim().length > 2) {
      setNewFoodCategory(detectFoodCategory(val));
    }
  };

  // Add new food
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();
    if (!newFoodName.trim()) {
      setAddFoodError('Please enter a food name.');
      return;
    }

    const newItem: FoodItem = {
      id: `${activeMeal[0]}-${Date.now()}`,
      name: newFoodName.trim(),
      price: Math.max(0, newFoodPrice),
      quantity: Math.max(1, newFoodQuantity),
      category: newFoodCategory
    };

    const updated = [...localItems, newItem];
    setLocalItems(updated);
    onUpdateInventory(activeMeal, updated);

    // Reset inputs
    setNewFoodName('');
    setNewFoodPrice(20);
    setNewFoodQuantity(1);
    setAddFoodError('');
  };

  // Save current prices & quantities
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
    // Save any pending edits
    onUpdateInventory(activeMeal, localItems);

    const rec = generateRecommendation(localItems, profile, activeMeal, spentToday);
    setRecommendation(rec);

    // Scroll smoothly to recommendation container and highlight
    setTimeout(() => {
      const el = document.getElementById('recommendation-result-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  // Structured Actual Meal Actions
  const handleApplyRecommendedToActual = () => {
    if (!recommendation || recommendation.items.length === 0) return;
    playButtonClick();
    const structured = recommendation.items.map(i => ({
      food: i.food.name,
      quantity: i.quantity,
      price: i.unitPrice
    }));
    setStructuredActualItems(structured);
    const summary = structured.map(i => `${i.quantity} × ${i.food}`).join(' + ');
    setActualFoodText(summary);
    setActualCost(recommendation.totalCost);
    setActualQuantity(structured.reduce((acc, i) => acc + i.quantity, 0));
  };

  const handleAddDishToActual = (food: FoodItem) => {
    playButtonClick();
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

      // Sync text and cost
      const summary = updated.map(i => `${i.quantity} × ${i.food}`).join(' + ');
      setActualFoodText(summary);
      const cost = updated.reduce((acc, i) => acc + (i.price || 0) * i.quantity, 0);
      setActualCost(cost);
      setActualQuantity(updated.reduce((acc, i) => acc + i.quantity, 0));
      return updated;
    });
  };

  const handleUpdateItemQty = (foodName: string, delta: number) => {
    playButtonClick();
    setStructuredActualItems(prev => {
      const updated = prev
        .map(i => {
          if (i.food === foodName) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as ActualMealItem[];

      const summary = updated.map(i => `${i.quantity} × ${i.food}`).join(' + ');
      setActualFoodText(summary);
      const cost = updated.reduce((acc, i) => acc + (i.price || 0) * i.quantity, 0);
      setActualCost(cost);
      setActualQuantity(updated.reduce((acc, i) => acc + i.quantity, 0));
      return updated;
    });
  };

  // Log Actual Meal
  const handleLogActualMeal = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();
    if (!actualFoodText.trim()) {
      alert('Please enter what you actually ate.');
      return;
    }

    const expectedMealBudget = Math.round(profile.dailyBudget * 0.4);
    const ratingBreakdown = evaluateActualMeal(
      actualFoodText,
      actualQuantity,
      actualCost,
      activeMeal,
      profile,
      expectedMealBudget,
      localItems
    );

    const newLog: ActualMealLog = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      dateKey: new Date().toISOString().split('T')[0],
      mealType: activeMeal,
      recommendedSummary: recommendation && recommendation.items.length > 0
        ? recommendation.items.map(i => `${i.quantity} × ${i.food.name}`).join(' + ')
        : 'None generated',
      recommendedCost: recommendation ? recommendation.totalCost : 0,
      actualFoodSummary: actualFoodText.trim(),
      actualQuantity,
      actualCost: Math.max(0, actualCost),
      rating: ratingBreakdown.finalScore,
      ratingBreakdown,
      structuredItems: structuredActualItems.length > 0 ? structuredActualItems : undefined
    };

    onLogMeal(newLog);
    setMealLogSuccess(newLog);

    // Award XP (+50 XP) & check level up
    const newXp = profile.xp + 50;
    const oldLevel = Math.floor(profile.xp / 150) + 1;
    const newLevel = Math.floor(newXp / 150) + 1;

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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 }
      });
    }

    // Scroll smoothly to success scorecard
    setTimeout(() => {
      document.getElementById('meal-logged-feedback-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const mealTabInfo = {
    morning: { label: '🌅 Morning', subtitle: 'Breakfast Quest', color: 'from-amber-500/20 to-purple-900/40' },
    afternoon: { label: '☀️ Afternoon', subtitle: 'Lunch Quest', color: 'from-indigo-500/20 to-purple-900/40' },
    night: { label: '🌙 Night', subtitle: 'Dinner Quest', color: 'from-purple-900/30 to-slate-900/50' }
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
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-300">
            <Swords className="w-4 h-4 text-amber-400" />
            <span>CORE MEAL COMBINATION ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-rpg tracking-wide">
            ⚔️ Hotel Food Inventory & Decision Quest
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Manage foods currently available at your hotel, adjust prices & quantities, and generate practical recommendations.
          </p>
        </div>

        {/* Meal Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-purple-500/30">
          {(['morning', 'afternoon', 'night'] as MealType[]).map(meal => {
            const isSelected = activeMeal === meal;
            const hasLog = todayLogs[meal];
            return (
              <button
                key={meal}
                id={`tab-${meal}`}
                onClick={() => {
                  playButtonClick();
                  setActiveMeal(meal);
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-700 text-amber-300 shadow-md glow-purple border border-purple-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{mealTabInfo[meal].label}</span>
                {hasLog && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Already logged today" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* SMART MENU INPUT QUICK ACTION BAR */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-indigo-950/60 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono uppercase text-slate-300 font-bold">
            Import Menu for {mealTabInfo[activeMeal].label}:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-import-menu-image"
            type="button"
            onClick={() => handleOpenImport('image')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>📷 Upload Menu Image</span>
          </button>

          <button
            id="btn-import-menu-file"
            type="button"
            onClick={() => handleOpenImport('file')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>📄 Upload Menu File</span>
          </button>

          <button
            id="btn-import-menu-paste"
            type="button"
            onClick={() => handleOpenImport('paste')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Clipboard className="w-3.5 h-3.5 text-purple-400" />
            <span>📋 Paste Menu</span>
          </button>

          <button
            id="btn-import-menu-voice"
            type="button"
            onClick={() => handleOpenImport('voice')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>🎤 Voice Input</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inventory Table on Left, Actions / Add Food on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Food Inventory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl rpg-card border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div>
                <h2 className="text-lg font-bold font-rpg text-white flex items-center gap-2">
                  <span>{mealTabInfo[activeMeal].label} Available Inventory</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono">
                    {localItems.length} items
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Unit prices & quantities are <strong className="text-amber-300">editable</strong>. Total cost updates in real time. Items with 0 quantity will be excluded.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-save-inventory"
                  onClick={handleSaveInventory}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  title="Save edited prices & quantities to local storage"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Inventory</span>
                </button>

                <button
                  id="btn-reset-defaults"
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-all border border-slate-700"
                  title="Reset to default menu items and prices"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {inventorySavedFeedback && (
              <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Inventory prices and quantities saved successfully to your local quest storage!</span>
              </div>
            )}

            {/* Inventory List Table */}
            {localItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm space-y-2">
                <p>No food items in this meal's inventory.</p>
                <p className="text-xs text-purple-300">Use the smart menu import bar above or add dishes manually using the form on the right.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-purple-500/20 text-[11px] uppercase font-mono">
                      <th className="pb-2 font-medium">Food Name</th>
                      <th className="pb-2 font-medium">Category / Role</th>
                      <th className="pb-2 font-medium w-24">Price (₹)</th>
                      <th className="pb-2 font-medium w-20">Quantity</th>
                      <th className="pb-2 font-medium w-20">Total (₹)</th>
                      <th className="pb-2 font-medium text-right w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {localItems.map(item => {
                      const totalItemCost = item.price * item.quantity;
                      let badgeColor = 'bg-slate-800 text-slate-300';
                      if (item.category === 'MAIN FOOD') badgeColor = 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40';
                      else if (item.category === 'PROTEIN') badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
                      else if (item.category === 'VEGETABLE') badgeColor = 'bg-green-950/80 text-green-300 border-green-500/40';
                      else if (item.category === 'SIDE / ACCOMPANIMENT') badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
                      else if (item.category === 'DRINK') badgeColor = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
                      else if (item.category === 'FRIED / HEAVY') badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500/40';

                      return (
                        <tr key={item.id} className={`hover:bg-purple-950/20 transition-colors ${item.quantity === 0 ? 'opacity-50' : ''}`}>
                          {/* Name */}
                          <td className="py-2.5 font-bold text-white">
                            {item.name}
                            {item.quantity === 0 && (
                              <span className="ml-2 text-[10px] text-rose-400 font-mono">(Out of Stock)</span>
                            )}
                          </td>

                          {/* Category Badge / Selector */}
                          <td className="py-2.5">
                            <select
                              value={item.category}
                              onChange={e => handleCategoryChange(item.id, e.target.value as FoodCategory)}
                              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${badgeColor} bg-slate-900 cursor-pointer focus:outline-none`}
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
                              <span className="text-slate-400 mr-1">₹</span>
                              <input
                                id={`input-price-${item.id}`}
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={e => handlePriceChange(item.id, parseFloat(e.target.value))}
                                className="w-16 px-1.5 py-1 rounded bg-slate-900 border border-purple-500/30 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                              />
                            </div>
                          </td>

                          {/* Editable Quantity */}
                          <td className="py-2.5">
                            <input
                              id={`input-qty-${item.id}`}
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={e => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                              className="w-14 px-1.5 py-1 rounded bg-slate-900 border border-purple-500/30 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                            />
                          </td>

                          {/* Subtotal Calculation */}
                          <td className="py-2.5 font-mono text-amber-300 font-bold">
                            ₹{totalItemCost}
                          </td>

                          {/* Delete Button */}
                          <td className="py-2.5 text-right">
                            <button
                              id={`btn-remove-${item.id}`}
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title={`Remove ${item.name}`}
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <div className="pt-3 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Daily Budget: <strong className="text-white">₹{profile.dailyBudget}</strong> | Spent Today: <strong className="text-slate-300">₹{spentToday}</strong> | Remaining: <strong className="text-amber-400">₹{remainingDailyBudget}</strong>
              </div>

              <button
                id="btn-generate-recommendation"
                onClick={handleGenerate}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-rpg text-base font-bold tracking-wider border border-purple-400 shadow-xl glow-purple cursor-pointer flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <Swords className="w-5 h-5 text-amber-300" />
                <span>⚔️ GENERATE RECOMMENDATION</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Add Food & Quick Context Panel */}
        <div className="space-y-4">
          {/* Add Food Card */}
          <div className="p-5 rounded-2xl rpg-card border border-purple-500/30 space-y-4">
            <h3 className="text-base font-bold font-rpg text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>＋ ADD FOOD TO {mealTabInfo[activeMeal].label.toUpperCase()}</span>
            </h3>

            <form onSubmit={handleAddFood} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Food Name</label>
                <input
                  id="input-add-food-name"
                  type="text"
                  placeholder="e.g. Chapati, Egg, Paneer"
                  value={newFoodName}
                  onChange={e => handleNewFoodNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-purple-500/30 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Price (₹)</label>
                  <input
                    id="input-add-food-price"
                    type="number"
                    min="0"
                    value={newFoodPrice}
                    onChange={e => setNewFoodPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-purple-500/30 text-white text-xs sm:text-sm font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Quantity</label>
                  <input
                    id="input-add-food-qty"
                    type="number"
                    min="1"
                    value={newFoodQuantity}
                    onChange={e => setNewFoodQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-purple-500/30 text-white text-xs sm:text-sm font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Category Role</label>
                <select
                  id="select-add-food-category"
                  value={newFoodCategory}
                  onChange={e => setNewFoodCategory(e.target.value as FoodCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-purple-500/30 text-white text-xs sm:text-sm font-mono focus:border-purple-400 focus:outline-none cursor-pointer"
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
                <p className="text-rose-400 text-xs">{addFoodError}</p>
              )}

              <button
                id="btn-submit-add-food"
                type="submit"
                className="w-full py-2.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs font-rpg tracking-wider cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>ADD TO INVENTORY</span>
              </button>
            </form>
          </div>

          {/* Active Personalization Context Card */}
          <div className="p-4 rounded-xl rpg-card border border-purple-500/20 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-purple-300 font-bold font-mono">
              <span>🎯 ACTIVE PROFILE FILTER</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Diet Preference:</span>
                <strong className={profile.foodPreference === 'Vegetarian' ? 'text-emerald-300' : 'text-purple-300'}>
                  {profile.foodPreference}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avoided:</span>
                <span className="truncate max-w-[140px] text-rose-300">{profile.foodsToAvoid || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Health:</span>
                <span className={profile.condition !== 'Normal day' ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                  {profile.condition}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECOMMENDATION RESULT SECTION (PROMINENT, IMPOSSIBLE TO MISS) */}
      {/* ========================================================================= */}
      {!recommendation ? (
        <div
          id="recommendation-result-container"
          className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 via-purple-950/40 to-slate-900/90 border-2 border-dashed border-purple-500/40 shadow-xl text-center space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-center gap-2 text-amber-400 font-rpg text-xl font-extrabold tracking-wide">
            <Swords className="w-6 h-6 text-amber-300 animate-pulse" />
            <span>⚔️ YOUR MEAL QUEST RECOMMENDATION</span>
          </div>
          <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
            Your personalized recommendation for <strong className="text-white">{mealTabInfo[activeMeal].subtitle}</strong> will appear right here between your inventory and actual meal log.
          </p>
          <button
            id="btn-generate-rec-central"
            onClick={handleGenerate}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-rpg text-base font-bold tracking-wider border border-purple-400 shadow-2xl glow-purple cursor-pointer transition-all transform hover:scale-[1.03] inline-flex items-center gap-2"
          >
            <Swords className="w-5 h-5 text-amber-300" />
            <span>⚔️ GENERATE RECOMMENDATION</span>
          </button>
          <div className="text-[11px] font-mono text-purple-300/80">
            Click above to calculate the optimal meal combination from your current hotel menu.
          </div>
        </div>
      ) : (
        <div id="recommendation-result-container" className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4">
          {/* Missing main food or no practical meal available */}
          {(recommendation.status === 'NO_MAIN_FOOD' || recommendation.status === 'NO_AVAILABLE_FOOD' || (recommendation.status === 'OVER_BUDGET' && recommendation.items.length === 0)) && (
            <div className="p-6 rounded-2xl bg-amber-950/70 border-2 border-amber-500 shadow-2xl text-amber-200 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-300 font-bold text-xl font-rpg">
                <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
                <span>⚠️ NO PRACTICAL MEAL AVAILABLE</span>
              </div>
              <p className="text-base leading-relaxed text-white font-medium">
                {recommendation.errorMessage}
              </p>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 text-xs sm:text-sm text-amber-200 font-mono space-y-1">
                <strong className="text-amber-300 block font-bold">Details:</strong>
                <span>
                  {recommendation.whyBreakdown.mainFoodReason !== 'None available.' && recommendation.whyBreakdown.mainFoodReason}
                  {recommendation.whyBreakdown.avoidReason && ` ${recommendation.whyBreakdown.avoidReason}`}
                  {recommendation.whyBreakdown.budgetReason && ` ${recommendation.whyBreakdown.budgetReason}`}
                </span>
              </div>
            </div>
          )}

          {/* SUCCESSFUL / VALID RECOMMENDATION */}
          {recommendation.items.length > 0 && (
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900/95 to-indigo-950/80 border-2 border-purple-400 shadow-2xl glow-purple space-y-6">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/30">
                <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-amber-400 font-bold">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>⚔️ YOUR MEAL QUEST RECOMMENDATION</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-purple-900/70 border border-purple-400/40 text-purple-200 font-semibold">
                    {mealTabInfo[activeMeal].subtitle}
                  </span>
                  {recommendation.recommendationScore && (
                    <span className="px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-xs font-mono text-emerald-300 flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Score {recommendation.recommendationScore}/10
                    </span>
                  )}
                </div>
              </div>

              {/* PROMINENT SUGGESTION HERO BOX */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950/70 to-slate-950 border-2 border-amber-400/80 shadow-2xl space-y-4">
                <div className="text-amber-400 font-rpg font-black text-xl sm:text-2xl tracking-wide flex items-center gap-2">
                  <span>👉 MEALQUEST SUGGESTS YOU EAT:</span>
                </div>

                <div className="space-y-3 py-1">
                  {recommendation.items.map((selection, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-white font-rpg"
                    >
                      <span className="text-3xl shrink-0">{getRoleIcon(selection.role)}</span>
                      <span className="text-amber-300">
                        {selection.quantity} × {selection.food.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* COST & REMAINING BUDGET */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-purple-500/30">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] uppercase font-mono text-slate-400 font-bold">💰 COST</span>
                      <span className="text-2xl font-black font-mono text-amber-300">₹{recommendation.totalCost}</span>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-400">
                      {recommendation.items.map(i => `${i.quantity}×₹${i.unitPrice}`).join(' + ')}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] uppercase font-mono text-slate-400 font-bold">💰 REMAINING BUDGET</span>
                      <span className={`text-2xl font-black font-mono ${
                        profile.dailyBudget - spentToday - recommendation.totalCost >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}>
                        ₹{Math.max(0, profile.dailyBudget - spentToday - recommendation.totalCost)}
                      </span>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-400">
                      after this meal
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Items Display */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-purple-300 font-bold block">
                  Dishes in Recommended Combination:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recommendation.items.map((selection, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/40 flex flex-col justify-between shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 uppercase font-bold flex items-center gap-1">
                            <span>{getRoleIcon(selection.role)}</span>
                            <span>{selection.role}</span>
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white mt-2">
                          {selection.quantity} × {selection.food.name}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-purple-500/20 flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-400">₹{selection.unitPrice} each</span>
                        <span className="text-amber-300 font-bold text-sm">₹{selection.subtotal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: 🧠 WHY THIS COMBINATION? */}
              <div id="why-this-combination-box" className="p-5 rounded-xl bg-slate-900/90 border border-purple-500/50 space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold font-rpg text-lg tracking-wide border-b border-purple-500/30 pb-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>🧠 WHY THIS COMBINATION?</span>
                </div>

                {/* Individual dish rationale cards */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono uppercase text-purple-300 font-bold block">
                    Selected Items Explanation:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendation.items.map((selection, idx) => {
                      const ir = recommendation.itemReasons.find(r => r.name.toLowerCase() === selection.food.name.toLowerCase());
                      return (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 flex items-start gap-3">
                          <span className="text-2xl shrink-0 mt-0.5">{getRoleIcon(selection.role)}</span>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <strong className="text-white text-sm font-bold">{selection.quantity} × {selection.food.name}</strong>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 uppercase font-bold">
                                {selection.role}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                              {selection.role === 'MAIN FOOD' && 'Selected as the main/base food. '}
                              {selection.role === 'PROTEIN' && 'Added as a protein source. '}
                              {selection.role === 'SIDE / ACCOMPANIMENT' && 'Used as an accompaniment to the main food. '}
                              {selection.role === 'VEGETABLE' && 'Added for fresh vegetable nutrients & fiber. '}
                              {ir?.reason || `${selection.food.name} completes this balanced combination.`}
                            </p>
                            <div className="text-[11px] font-mono text-amber-300/90">
                              ₹{selection.unitPrice} each × {selection.quantity} = ₹{selection.subtotal}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overall Factors Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/20 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <span>💰</span>
                      <span>Budget</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.budgetReason}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/20 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-300">
                      <span>🚫</span>
                      <span>Avoid List</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.avoidReason || (profile.foodsToAvoid ? `Foods on your avoid list (${profile.foodsToAvoid}) were excluded.` : 'No foods on avoid list.')}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/20 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <span>🥗</span>
                      <span>Preference</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.preferenceReason}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/20 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                      <span>❤️</span>
                      <span>Current Condition</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.conditionReason || `Status: ${profile.condition}. Balanced digestion suitable for a regular day.`}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/20 text-xs space-y-1 sm:col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                      <span>⚖️</span>
                      <span>Profile Context</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {recommendation.whyBreakdown.profileContextReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: 💰 COST / BUDGET */}
              <div id="cost-budget-section" className="p-5 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold font-rpg text-base">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span>💰 COST / BUDGET TRACKING</span>
                  </div>
                  <span className="text-xs font-mono text-purple-300">
                    {mealTabInfo[activeMeal].subtitle} Coin Breakdown
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-purple-500/20">
                    <span className="block text-[10px] text-slate-400 uppercase font-mono">Daily Budget</span>
                    <span className="text-lg font-bold text-white">₹{profile.dailyBudget}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/70 border border-purple-500/20">
                    <span className="block text-[10px] text-slate-400 uppercase font-mono">Spent Before Meal</span>
                    <span className="text-lg font-bold text-slate-300">₹{spentToday}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/70 border border-amber-500/40">
                    <span className="block text-[10px] text-amber-400 uppercase font-mono">Recommended Cost</span>
                    <span className="text-lg font-bold text-amber-300">₹{recommendation.totalCost}</span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    profile.dailyBudget - spentToday - recommendation.totalCost >= 0
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-mono opacity-80">Remaining After Meal</span>
                    <span className="text-lg font-bold">
                      ₹{profile.dailyBudget - spentToday - recommendation.totalCost}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personalization used */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/20 space-y-2">
                <span className="text-xs uppercase font-mono font-bold text-purple-300">
                  🎯 Personalization Context Evaluated
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-500">📏 Height</span>
                    <span className="text-slate-200 font-bold">{profile.heightCm} cm</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-500">⚖️ Weight</span>
                    <span className="text-slate-200 font-bold">{profile.weightKg} kg</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-500">🥗 Preference</span>
                    <span className="text-slate-200 font-bold">{profile.foodPreference}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-500">🤒 Condition</span>
                    <span className="text-amber-300 font-bold">{profile.condition}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-500">🪙 Budget HP</span>
                    <span className="text-slate-200 font-bold">₹{profile.dailyBudget}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-500">💪 Power Ref</span>
                    <span className="text-purple-300 font-bold truncate block" title={profile.powerDescription}>
                      {profile.powerDescription ? profile.powerDescription.slice(0, 14) + '...' : 'Heroic'}
                    </span>
                    <span className="text-[9px] text-slate-500 block">Fun reference</span>
                  </div>
                </div>
              </div>

              {/* SECTION: 🔄 ALTERNATIVES */}
              {recommendation.alternatives.length > 0 && (
                <div id="alternatives-section" className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-rpg text-purple-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>🔄 OTHER QUEST OPTIONS (ALTERNATIVES FROM HOTEL)</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {recommendation.alternatives.length} valid option{recommendation.alternatives.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {recommendation.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 text-xs space-y-2.5 flex flex-col justify-between shadow-md hover:border-purple-400/60 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <strong className="text-amber-300 text-sm font-rpg">{alt.title}</strong>
                            <span className="font-mono text-white font-bold px-2 py-0.5 rounded bg-slate-800 border border-purple-500/20">
                              ₹{alt.totalCost}
                            </span>
                          </div>
                          <div className="text-white font-medium text-xs leading-relaxed">
                            {alt.itemsSummary}
                          </div>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed pt-2 border-t border-purple-500/20">
                          <strong className="text-purple-300 block mb-0.5">Why primary recommendation is preferred:</strong>
                          <span>{alt.whyPrimaryPreferred}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action to Actual Meal Log */}
              <div className="pt-4 border-t border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  Did you eat this recommended combination at the hotel?
                </div>
                <button
                  id="btn-apply-rec-to-actual"
                  type="button"
                  onClick={handleApplyRecommendedToActual}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-amber-300 font-bold text-xs font-rpg tracking-wider border border-purple-400 shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>📋 USE THIS AS MY ACTUAL MEAL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: 🍽️ WHAT DID YOU ACTUALLY EAT? (DISTINCT ACTUAL MEAL LOGGING) */}
      {/* ========================================================================= */}
      <div id="actual-meal-entry-card" className="p-6 rounded-2xl rpg-card border border-purple-500/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Utensils className="w-4 h-4" />
              <span>POST-MEAL QUEST VERIFICATION</span>
            </div>
            <h2 className="text-xl font-extrabold text-white font-rpg">
              🍽️ WHAT DID YOU ACTUALLY EAT?
            </h2>
            <p className="text-xs text-slate-400">
              The recommendation is guidance; record what you actually ate to earn XP and receive an accurate transparent rating.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
            Current Quest: {mealTabInfo[activeMeal].subtitle}
          </span>
        </div>

        {/* Clear Guidance vs Reality distinction banner */}
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="font-bold font-mono text-amber-300 block">
              🛡️ RECOMMENDATION vs ACTUAL MEAL:
            </span>
            <span className="text-slate-300">
              MealQuest recommended a balanced option, but you may have eaten something different at the hotel. Add the dishes below!
            </span>
          </div>

          {recommendation && recommendation.items.length > 0 && (
            <button
              id="btn-use-recommended-meal"
              type="button"
              onClick={handleApplyRecommendedToActual}
              className="px-3 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-amber-300 font-bold text-xs border border-purple-400 cursor-pointer shadow transition-all whitespace-nowrap"
            >
              📋 Use Recommended Combination
            </button>
          )}
        </div>

        {/* Quick-add chips from current inventory */}
        {localItems.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">
              Quick tap from hotel menu:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {localItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddDishToActual(item)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-900/50 border border-purple-500/30 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-purple-400" />
                  <span>{item.name}</span>
                  <span className="text-[10px] text-amber-300 font-mono">₹{item.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Structured dishes selected list */}
        {structuredActualItems.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2">
            <span className="text-xs font-mono text-amber-300 uppercase font-bold block">
              Dishes in Actual Meal:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {structuredActualItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950 border border-purple-500/20 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <strong className="text-white block">{item.food}</strong>
                    {item.price ? (
                      <span className="text-slate-400 font-mono text-[10px]">
                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(item.food, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold font-mono text-amber-300">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(item.food, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
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
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Dishes Summary (e.g. "2 Dosa + 1 Egg + Sambar" or "Rice + Sambar + Poriyal")
              </label>
              <input
                id="input-actual-food"
                type="text"
                placeholder="Type the actual items you ate or use buttons above"
                value={actualFoodText}
                onChange={e => setActualFoodText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Actual Total Cost (₹)
              </label>
              <input
                id="input-actual-cost"
                type="number"
                min="0"
                value={actualCost}
                onChange={e => setActualCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-amber-300 font-mono text-xs sm:text-sm font-bold focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Portion Count / Quantity:</span>
              <input
                id="input-actual-qty"
                type="number"
                min="1"
                max="10"
                value={actualQuantity}
                onChange={e => setActualQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-16 px-2 py-1 rounded bg-slate-900 border border-purple-500/30 text-white font-mono text-xs text-center"
              />
              <span>servings</span>
            </div>

            <button
              id="btn-log-meal-quest"
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-rpg font-bold tracking-wider text-sm border border-emerald-400 shadow-xl glow-green cursor-pointer flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>⚔️ LOG ACTUAL MEAL & GET RATING (+50 XP)</span>
            </button>
          </div>
        </form>

        {/* POST-MEAL RATING SCORECARD & TRANSPARENT BREAKDOWN */}
        {mealLogSuccess && (
          <div
            id="meal-logged-feedback-card"
            className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/60 to-purple-950/60 border-2 border-emerald-500/60 space-y-4 animate-in fade-in"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold font-rpg text-white">
                  ⭐ MEAL RATING: <span className="text-emerald-300">{mealLogSuccess.rating} / 10</span>
                </h3>
              </div>

              <div className="text-xs font-mono text-amber-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                +50 Quest XP Earned!
              </div>
            </div>

            {/* Score Factors Breakdown */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-mono font-bold text-emerald-300 block">
                WHY THIS RATING?
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/20">
                  <span className="block text-[10px] text-slate-400">🍽️ Structure</span>
                  <strong className="text-white">{mealLogSuccess.ratingBreakdown.mealStructure.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 truncate">{mealLogSuccess.ratingBreakdown.mealStructure.notes}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/20">
                  <span className="block text-[10px] text-slate-400">💪 Protein</span>
                  <strong className="text-white">{mealLogSuccess.ratingBreakdown.protein.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 truncate">{mealLogSuccess.ratingBreakdown.protein.notes}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/20">
                  <span className="block text-[10px] text-slate-400">🥗 Variety / Side</span>
                  <strong className="text-white">{mealLogSuccess.ratingBreakdown.variety.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 truncate">{mealLogSuccess.ratingBreakdown.variety.notes}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/20">
                  <span className="block text-[10px] text-slate-400">🔢 Quantity</span>
                  <strong className="text-white">{mealLogSuccess.ratingBreakdown.quantityPortion.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 truncate">{mealLogSuccess.ratingBreakdown.quantityPortion.notes}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/20">
                  <span className="block text-[10px] text-slate-400">💰 Budget Fit</span>
                  <strong className="text-white">{mealLogSuccess.ratingBreakdown.budget.score} / 2.0</strong>
                  <span className="block text-[9px] text-slate-500 truncate">{mealLogSuccess.ratingBreakdown.budget.notes}</span>
                </div>
              </div>

              {/* Deductions or Constructive Notes */}
              {mealLogSuccess.ratingBreakdown.penalties.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                  <strong className="text-rose-300 font-bold block">Score Adjustments & Deductions:</strong>
                  {mealLogSuccess.ratingBreakdown.penalties.map((pen, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span>▸ {pen.label}: {pen.reason}</span>
                      <span className="font-mono text-rose-400 font-bold">-{pen.points} pts</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Narrative explanation */}
              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-purple-500/20">
                "{mealLogSuccess.ratingBreakdown.whyExplanation}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
