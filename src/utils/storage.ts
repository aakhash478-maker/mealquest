import { ActualMealLog, FoodItem, MealType, PlayerProfile } from '../types';
import { getLocalDateKey, getYesterdayLocalDateKey } from './dateUtils';

export const DEFAULT_INVENTORIES: Record<MealType, FoodItem[]> = {
  morning: [
    { id: 'm-1', name: 'Idli', price: 10, category: 'MAIN FOOD' },
    { id: 'm-2', name: 'Dosa', price: 30, category: 'MAIN FOOD' },
    { id: 'm-3', name: 'Vada', price: 15, category: 'FRIED / HEAVY' },
    { id: 'm-4', name: 'Pongal', price: 35, category: 'MAIN FOOD' },
    { id: 'm-5', name: 'Egg', price: 10, category: 'PROTEIN' },
    { id: 'm-6', name: 'Tea', price: 12, category: 'DRINK' }
  ],
  afternoon: [
    { id: 'a-1', name: 'Rice', price: 30, category: 'MAIN FOOD' },
    { id: 'a-2', name: 'Sambar', price: 20, category: 'SIDE / ACCOMPANIMENT' },
    { id: 'a-3', name: 'Poriyal', price: 20, category: 'VEGETABLE' },
    { id: 'a-4', name: 'Egg', price: 10, category: 'PROTEIN' },
    { id: 'a-5', name: 'Chicken', price: 70, category: 'PROTEIN' },
    { id: 'a-6', name: 'Curd', price: 15, category: 'SIDE / ACCOMPANIMENT' },
    { id: 'a-7', name: 'Fried Chicken', price: 80, category: 'FRIED / HEAVY' }
  ],
  night: [
    { id: 'n-1', name: 'Idli', price: 10, category: 'MAIN FOOD' },
    { id: 'n-2', name: 'Dosa', price: 30, category: 'MAIN FOOD' },
    { id: 'n-3', name: 'Chapati', price: 15, category: 'MAIN FOOD' },
    { id: 'n-4', name: 'Egg', price: 10, category: 'PROTEIN' },
    { id: 'n-5', name: 'Parotta', price: 20, category: 'MAIN FOOD' },
    { id: 'n-6', name: 'Curd', price: 15, category: 'SIDE / ACCOMPANIMENT' }
  ]
};

export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Adventurer',
  age: 21,
  dailyBudget: 300,
  heightCm: 170,
  weightKg: 65,
  foodPreference: 'Non-Vegetarian',
  foodsToAvoid: '',
  condition: 'Normal day',
  conditionNote: '',
  powerDescription: 'I am as strong as the power of 8 Sukuna fingers.',
  xp: 150,
  level: 1,
  unlockedBadges: ['⚔️ Quest Starter']
};

const STORAGE_KEYS = {
  PROFILE: 'mealquest_profile_v1',
  INVENTORY: 'mealquest_inventory_v1',
  HISTORY: 'mealquest_history_v1',
  SPLASH_SEEN: 'mealquest_splash_seen_v1'
};

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      age: typeof parsed.age === 'number' && parsed.age > 0 ? parsed.age : 21
    };
  } catch (err) {
    console.error('Failed to load profile:', err);
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

function normalizeInventoryItems(items: any[]): FoodItem[] {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    id: item.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: item.name || 'Food Item',
    price: typeof item.price === 'number' && item.price >= 0 ? item.price : 20,
    category: item.category || 'MAIN FOOD'
  }));
}

export function loadInventories(): Record<MealType, FoodItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!raw) return DEFAULT_INVENTORIES;
    const parsed = JSON.parse(raw);
    return {
      morning: normalizeInventoryItems(parsed.morning || DEFAULT_INVENTORIES.morning),
      afternoon: normalizeInventoryItems(parsed.afternoon || DEFAULT_INVENTORIES.afternoon),
      night: normalizeInventoryItems(parsed.night || DEFAULT_INVENTORIES.night)
    };
  } catch (err) {
    console.error('Failed to load inventories:', err);
    return DEFAULT_INVENTORIES;
  }
}

export function saveInventories(inventories: Record<MealType, FoodItem[]>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventories));
  } catch (err) {
    console.error('Failed to save inventories:', err);
  }
}

export function loadMealHistory(): ActualMealLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load history:', err);
    return [];
  }
}

export function saveMealHistory(history: ActualMealLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

export function calculateRealStreak(history: ActualMealLog[]): number {
  if (!history || history.length === 0) return 0;

  // Get unique dateKeys sorted ascending
  const uniqueDates = Array.from(new Set(history.map(h => h.dateKey))).sort();
  if (uniqueDates.length === 0) return 0;

  const todayStr = getLocalDateKey();
  const yesterdayStr = getYesterdayLocalDateKey();

  const lastLoggedDate = uniqueDates[uniqueDates.length - 1];

  // If last meal wasn't today or yesterday, streak is broken
  if (lastLoggedDate !== todayStr && lastLoggedDate !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(lastLoggedDate);

  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    const prevDate = new Date(uniqueDates[i]);
    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}
