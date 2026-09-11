export type FoodCategory =
  | 'MAIN FOOD'
  | 'PROTEIN'
  | 'VEGETABLE'
  | 'SIDE / ACCOMPANIMENT'
  | 'DRINK'
  | 'FRIED / HEAVY';

export type MealType = 'morning' | 'afternoon' | 'night';

export type FoodPreference = 'Anything' | 'Vegetarian' | 'Non-Vegetarian';

export type HealthCondition =
  | 'Normal day'
  | 'I have fever'
  | "I'm feeling unwell"
  | 'My stomach feels sensitive';

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: FoodCategory;
}

export interface PlayerProfile {
  name: string;
  dailyBudget: number;
  heightCm: number;
  weightKg: number;
  foodPreference: FoodPreference;
  foodsToAvoid: string;
  condition: HealthCondition;
  conditionNote: string;
  powerDescription: string;
  xp: number;
  level: number;
  unlockedBadges: string[];
}

export interface RecommendedItemSelection {
  food: FoodItem;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  role: FoodCategory;
}

export interface MealRecommendation {
  mealType: MealType;
  items: RecommendedItemSelection[];
  totalCost: number;
  fitsBudget: boolean;
  budgetCap: number;
  remainingDailyBudget: number;
  status: 'SUCCESS' | 'NO_MAIN_FOOD' | 'OVER_BUDGET' | 'NO_AVAILABLE_FOOD';
  errorMessage?: string;
  recommendationScore?: number;
  whyBreakdown: {
    mainFoodReason: string;
    proteinReason?: string;
    vegetableReason?: string;
    sideReason?: string;
    quantityNote: string;
    budgetReason: string;
    preferenceReason: string;
    avoidReason?: string;
    conditionReason?: string;
    profileContextReason: string;
  };
  itemReasons: Array<{
    name: string;
    role: FoodCategory;
    quantity: number;
    subtotal: number;
    reason: string;
  }>;
  alternatives: Array<{
    title: string;
    itemsSummary: string;
    totalCost: number;
    reason: string;
    whyPrimaryPreferred: string;
  }>;
}

export interface ScorePenalty {
  label: string;
  points: number;
  reason: string;
}

export interface ScoreFactor {
  label: string;
  score: number;
  max: number;
  notes: string;
}

export interface MealRatingBreakdown {
  mealStructure: ScoreFactor;
  protein: ScoreFactor;
  variety: ScoreFactor;
  quantityPortion: ScoreFactor;
  budget: ScoreFactor;
  penalties: ScorePenalty[];
  finalScore: number;
  whyExplanation: string;
  positivePoints: string[];
  constructivePoints: string[];
}

export interface ActualMealItem {
  food: string;
  quantity: number;
  price?: number;
}

export interface ActualMealLog {
  id: string;
  timestamp: number;
  dateKey: string; // YYYY-MM-DD
  mealType: MealType;
  recommendedSummary: string;
  recommendedCost: number;
  actualFoodSummary: string;
  actualQuantity: number;
  actualCost: number;
  rating: number;
  ratingBreakdown: MealRatingBreakdown;
  structuredItems?: ActualMealItem[];
}

export interface DailyScoreSummary {
  dateKey: string;
  morning?: ActualMealLog;
  afternoon?: ActualMealLog;
  night?: ActualMealLog;
  mealsLoggedCount: number;
  overallScore: number | null;
  whyOverallScore: string;
  breakfastSpent: number;
  lunchSpent: number;
  dinnerSpent: number;
  totalSpentToday: number;
  dailyBudget: number;
  remainingBudget: number;
}
