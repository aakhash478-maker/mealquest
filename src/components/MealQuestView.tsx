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
  Utensils
} from 'lucide-react';
import {
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

  // New food input states
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPrice, setNewFoodPrice] = useState<number>(20);
  const [newFoodQuantity, setNewFoodQuantity] = useState<number>(1);
  const [newFoodCategory, setNewFoodCategory] = useState<FoodCategory>('MAIN FOOD');
  const [addFoodError, setAddFoodError] = useState('');

  // Recommendation state
  const [recommendation, setRecommendation] = useState<MealRecommendation | null>(null);

  // Actual meal logging states
  const [actualFoodText, setActualFoodText] = useState('');
  const [actualQuantity, setActualQuantity] = useState<number>(1);
  const [actualCost, setActualCost] = useState<number>(60);
  const [mealLogSuccess, setMealLogSuccess] = useState<ActualMealLog | null>(null);

  // Sync local items when activeMeal changes
  React.useEffect(() => {
    setLocalItems(inventories[activeMeal]);
    setRecommendation(null);
    setMealLogSuccess(null);
  }, [activeMeal, inventories]);

  // Handle edit price
  const handlePriceChange = (id: string, price: number) => {
    const validPrice = Math.max(0, isNaN(price) ? 0 : price);
    setLocalItems(prev => prev.map(item => (item.id === id ? { ...item, price: validPrice } : item)));
  };

  // Handle edit quantity
  const handleQuantityChange = (id: string, qty: number) => {
    const validQty = Math.max(1, isNaN(qty) ? 1 : qty);
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

  // Generate recommendation
  const handleGenerate = () => {
    playButtonClick();
    playQuestFanfare();
    // Save any pending edits
    onUpdateInventory(activeMeal, localItems);

    const rec = generateRecommendation(localItems, profile, activeMeal, spentToday);
    setRecommendation(rec);

    // If recommendation is successful, auto-fill actual meal box as a helpful convenience
    if (rec.status === 'SUCCESS' && rec.items.length > 0) {
      const summaryText = rec.items.map(i => `${i.quantity} ${i.food.name}`).join(' + ');
      setActualFoodText(summaryText);
      setActualCost(rec.totalCost);
      const totalQty = rec.items.reduce((acc, curr) => acc + curr.quantity, 0);
      setActualQuantity(totalQty);
    }
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
      expectedMealBudget
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
      ratingBreakdown
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
  };

  const mealTabInfo = {
    morning: { label: '🌅 Morning', subtitle: 'Breakfast Quest', color: 'from-amber-500/20 to-purple-900/40' },
    afternoon: { label: '☀️ Afternoon', subtitle: 'Lunch Quest', color: 'from-indigo-500/20 to-purple-900/40' },
    night: { label: '🌙 Night', subtitle: 'Dinner Quest', color: 'from-purple-900/30 to-slate-900/50' }
  };

  return (
    <div id="meal-quest-view" className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6">
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
                  Unit prices & quantities are <strong className="text-amber-300">editable</strong>. Total cost updates in real time.
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
              <div className="py-8 text-center text-slate-400 text-sm">
                No food items in this meal's inventory. Add dishes using the form on the right.
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
                        <tr key={item.id} className="hover:bg-purple-950/20 transition-colors">
                          {/* Name */}
                          <td className="py-2.5 font-bold text-white">
                            {item.name}
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
                              min="1"
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
                Budget HP: <strong className="text-white">₹{profile.dailyBudget}</strong> | Remaining: <strong className="text-amber-400">₹{Math.max(0, profile.dailyBudget - spentToday)}</strong>
              </div>

              <button
                id="btn-generate-recommendation"
                onClick={handleGenerate}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-rpg text-base font-bold tracking-wider border border-purple-400 shadow-xl glow-purple cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <Swords className="w-5 h-5 text-amber-300" />
                <span>GENERATE RECOMMENDATION</span>
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
                  <option value="MAIN FOOD">MAIN FOOD (Rice, Dosa, Idli, Chapati)</option>
                  <option value="PROTEIN">PROTEIN (Egg, Chicken, Dal, Paneer)</option>
                  <option value="VEGETABLE">VEGETABLE (Poriyal, Salad, Keerai)</option>
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

      {/* Recommendation Results Display */}
      {recommendation && (
        <div id="recommendation-result-container" className="space-y-4 animate-in fade-in slide-in-from-bottom-3">
          {/* Missing main food error state (Test 3) */}
          {recommendation.status === 'NO_MAIN_FOOD' && (
            <div className="p-6 rounded-2xl bg-amber-950/50 border-2 border-amber-500/50 text-amber-200 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-300 font-bold text-lg font-rpg">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <span>⚠️ NO PRACTICAL MEAL FOUND</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-200">
                {recommendation.errorMessage}
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 text-xs text-amber-300/90 font-mono">
                Rule Check: MealQuest will never recommend side dishes (e.g. Curd + Sambar + Egg) as if they are a complete standalone meal without a proper carbohydrate foundation. Please add Rice, Dosa, Idli, or Chapati to your available hotel food inventory!
              </div>
            </div>
          )}

          {/* Other error states */}
          {recommendation.status === 'NO_AVAILABLE_FOOD' && (
            <div className="p-6 rounded-2xl bg-rose-950/50 border-2 border-rose-500/50 text-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-lg font-rpg">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>⚠️ NO SUITABLE COMBINATION FOUND</span>
              </div>
              <p className="text-sm text-slate-200">{recommendation.errorMessage}</p>
            </div>
          )}

          {/* SUCCESSFUL RECOMMENDATION */}
          {(recommendation.status === 'SUCCESS' || recommendation.status === 'OVER_BUDGET') && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900/90 to-indigo-950/60 border-2 border-purple-500/60 shadow-2xl glow-purple space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/30">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>FORGED BY MEALQUEST LOGIC ENGINE</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white font-rpg flex items-center gap-2">
                    <span>🍽️ Recommended {mealTabInfo[activeMeal].subtitle}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/50 text-right">
                    <span className="block text-[10px] uppercase font-mono text-slate-400">Estimated Cost</span>
                    <span className="text-xl font-black font-mono text-amber-300">₹{recommendation.totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {recommendation.items.map((selection, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 uppercase">
                        {selection.role}
                      </span>
                      <div className="text-base font-bold text-white mt-1.5">
                        {selection.quantity} × {selection.food.name}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-purple-500/20 flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">₹{selection.unitPrice} each</span>
                      <span className="text-amber-300 font-bold">₹{selection.subtotal}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION: 💡 WHY THIS COMBINATION? */}
              <div id="why-this-combination-box" className="p-5 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold font-rpg text-lg tracking-wide">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>💡 WHY THIS COMBINATION?</span>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {recommendation.itemReasons.map((ir, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">▸</span>
                      <span>
                        <strong className="text-white">{ir.quantity} × {ir.name}</strong>: {ir.reason} (Cost: ₹{ir.subtotal})
                      </span>
                    </li>
                  ))}

                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">▸</span>
                    <span>
                      <strong className="text-white">Quantity calculation:</strong> {recommendation.whyBreakdown.quantityNote}
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">▸</span>
                    <span>
                      <strong className="text-white">Budget & Coins:</strong> {recommendation.whyBreakdown.budgetReason}
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">▸</span>
                    <span>
                      <strong className="text-white">Dietary Preference:</strong> {recommendation.whyBreakdown.preferenceReason}
                    </span>
                  </li>

                  {recommendation.whyBreakdown.conditionReason && (
                    <li className="flex items-start gap-2 text-amber-200">
                      <span className="text-amber-400 mt-1">▸</span>
                      <span>
                        <strong className="text-amber-300">Current Condition:</strong> {recommendation.whyBreakdown.conditionReason}
                      </span>
                    </li>
                  )}

                  <li className="flex items-start gap-2 text-slate-400">
                    <span className="text-purple-400 mt-1">▸</span>
                    <span>
                      <strong className="text-slate-300">Profile Context:</strong> {recommendation.whyBreakdown.profileContextReason}
                    </span>
                  </li>
                </ul>
              </div>

              {/* SECTION: 🎯 PERSONALIZATION USED */}
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

              {/* Alternatives */}
              {recommendation.alternatives.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold font-rpg text-purple-300 uppercase tracking-wider">
                    🔄 Available Alternatives from Hotel
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendation.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-purple-500/20 text-xs space-y-1.5"
                      >
                        <div className="flex justify-between items-center">
                          <strong className="text-amber-300 text-sm">{alt.title}</strong>
                          <span className="font-mono text-white font-bold">₹{alt.totalCost}</span>
                        </div>
                        <div className="text-slate-200 font-medium">{alt.itemsSummary}</div>
                        <div className="text-slate-400 text-[11px] leading-relaxed">
                          <strong className="text-purple-300">Why primary is preferred:</strong> {alt.whyPrimaryPreferred}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION: 🍽️ WHAT DID YOU ACTUALLY EAT? */}
      <div id="actual-meal-entry-card" className="p-6 rounded-2xl rpg-card border border-purple-500/40 space-y-4">
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
              The recommendation is guidance; record what you actually consumed to earn XP, level up, and generate your transparent rating.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
            Current Quest: {mealTabInfo[activeMeal].subtitle}
          </span>
        </div>

        <form onSubmit={handleLogActualMeal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Dishes Eaten (e.g. "2 Dosa + 1 Egg + Sambar" or "Rice + Sambar + Poriyal")
              </label>
              <input
                id="input-actual-food"
                type="text"
                placeholder="Type the actual items you ate"
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
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-rpg font-bold tracking-wider text-sm border border-emerald-400 shadow-xl glow-green cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>⚔️ LOG ACTUAL MEAL & GET RATING (+50 XP)</span>
            </button>
          </div>
        </form>

        {/* IMMEDIATE RATING FEEDBACK MODAL / CARD */}
        {mealLogSuccess && (
          <div
            id="meal-rating-feedback"
            className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/60 to-slate-900 border-2 border-emerald-500/50 space-y-4 animate-in fade-in"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold font-rpg text-xl">
                  ⭐
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    QUEST COMPLETE // RATING GENERATED
                  </span>
                  <h3 className="text-xl font-bold font-rpg text-white">
                    {mealTabInfo[activeMeal].subtitle} Rating: <span className="text-amber-300">{mealLogSuccess.rating}/10</span>
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                +50 XP Gained!
              </span>
            </div>

            {/* Why Did I Get This Rating? */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold font-rpg text-amber-300 uppercase tracking-wide">
                ⭐ WHY DID I GET THIS RATING?
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/20">
                  <span className="block text-[10px] text-slate-400">🍽️ Main Structure</span>
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
