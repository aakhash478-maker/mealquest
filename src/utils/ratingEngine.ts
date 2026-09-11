import {
  ActualMealLog,
  DailyScoreSummary,
  MealRatingBreakdown,
  MealType,
  PlayerProfile,
  ScorePenalty,
} from '../types';
import { detectFoodCategory, isFriedOrHeavy, isNonVegetarian } from './foodClassifier';

export function evaluateActualMeal(
  actualFoodText: string,
  actualQuantity: number,
  actualCost: number,
  mealType: MealType,
  profile: PlayerProfile,
  expectedMealBudget: number
): MealRatingBreakdown {
  const lower = actualFoodText.toLowerCase();
  const items = actualFoodText
    .split(/[+,&]/)
    .map(s => s.trim())
    .filter(Boolean);

  let hasMain = false;
  let hasProtein = false;
  let hasVeg = false;
  let hasSide = false;
  let hasFried = false;
  let avoidViolation = false;

  const avoidList = profile.foodsToAvoid
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  for (const item of items) {
    const cat = detectFoodCategory(item);
    if (cat === 'MAIN FOOD') hasMain = true;
    if (cat === 'PROTEIN') hasProtein = true;
    if (cat === 'VEGETABLE') hasVeg = true;
    if (cat === 'SIDE / ACCOMPANIMENT') hasSide = true;
    if (isFriedOrHeavy(item, cat)) hasFried = true;

    if (avoidList.some(av => item.toLowerCase().includes(av))) {
      avoidViolation = true;
    }
  }

  // Base scores (out of 2 each, total 10)
  let mealStructureScore = hasMain ? 2.0 : 0.5;
  let proteinScore = hasProtein ? 2.0 : (profile.foodPreference === 'Vegetarian' && hasSide ? 1.5 : 1.0);
  let varietyScore = (hasSide || hasVeg) ? 2.0 : 1.0;
  let quantityScore = (actualQuantity >= 1 && actualQuantity <= 4) ? 2.0 : 1.2;
  let budgetScore = actualCost <= expectedMealBudget ? 2.0 : (actualCost <= expectedMealBudget * 1.2 ? 1.2 : 0.5);

  const penalties: ScorePenalty[] = [];
  const positivePoints: string[] = [];
  const constructivePoints: string[] = [];

  // Positives
  if (hasMain) positivePoints.push('Contains a solid main meal foundation (carbohydrate base).');
  if (hasProtein) positivePoints.push('Included an effective protein source to aid recovery and fullness.');
  if (hasVeg || hasSide) positivePoints.push('Added variety with vegetable or flavorful side accompaniment.');
  if (actualCost <= expectedMealBudget) positivePoints.push(`Stayed strictly within practical meal coin budget (₹${actualCost} <= ₹${expectedMealBudget}).`);

  // Penalties
  if (!hasMain) {
    penalties.push({
      label: 'Missing Main Staple',
      points: 1.5,
      reason: 'Meal lacked a primary foundation like Rice, Dosa, Idli, or Chapati.'
    });
    constructivePoints.push('⚠️ Missing a proper main food base to anchor the meal.');
  }

  if (hasFried) {
    const isSick = profile.condition !== 'Normal day';
    const penaltyVal = isSick ? 2.0 : 1.0;
    penalties.push({
      label: isSick ? 'Fried food during sensitive health' : 'Fried / Heavy items',
      points: penaltyVal,
      reason: isSick
        ? `Consuming deep-fried foods while reporting ${profile.condition.toLowerCase()} strains digestion.`
        : 'High oil or deep-fried foods reduce nutritional balance.'
    });
    constructivePoints.push(
      isSick
        ? `⚠️ High amount of fried food strained digestion while having ${profile.condition.toLowerCase()}.`
        : '⚠️ High amount of fried food reduced the balance score.'
    );
  }

  if (avoidViolation) {
    penalties.push({
      label: 'Avoided Food Included',
      points: 1.0,
      reason: `Included foods specifically marked on your avoid list (${profile.foodsToAvoid}).`
    });
    constructivePoints.push('⚠️ Included items you had flagged to avoid.');
  }

  if (actualCost > expectedMealBudget * 1.25) {
    penalties.push({
      label: 'Budget Overrun',
      points: 1.0,
      reason: `Actual cost (₹${actualCost}) exceeded the planned meal allowance (₹${expectedMealBudget}).`
    });
    constructivePoints.push('⚠️ The meal exceeded the planned meal budget.');
  }

  if (!hasProtein && profile.foodPreference !== 'Vegetarian') {
    constructivePoints.push('⚠️ Protein source was limited; consider adding egg or dal next time.');
  }

  // Calculate raw score
  let totalScore = mealStructureScore + proteinScore + varietyScore + quantityScore + budgetScore;
  const totalPenalties = penalties.reduce((acc, p) => acc + p.points, 0);
  totalScore = Math.max(1.0, Math.min(10.0, totalScore - totalPenalties));

  // Rounded to 1 decimal place
  const finalScore = Math.round(totalScore * 10) / 10;

  // Build narrative why
  let narrative = `You earned a ${finalScore}/10 for this ${mealType} quest. `;
  if (positivePoints.length > 0) {
    narrative += `Strong points: ${positivePoints[0].toLowerCase()} `;
  }
  if (constructivePoints.length > 0) {
    narrative += constructivePoints[0];
  } else {
    narrative += 'Solid practical meal execution that respected your physical profile and coin pouch!';
  }

  return {
    mealStructure: {
      label: 'Meal Structure',
      score: mealStructureScore,
      max: 2.0,
      notes: hasMain ? 'Proper main food present' : 'Lacks staple base'
    },
    protein: {
      label: 'Protein Source',
      score: proteinScore,
      max: 2.0,
      notes: hasProtein ? 'Quality protein included' : 'Minimal protein'
    },
    variety: {
      label: 'Variety & Accompaniment',
      score: varietyScore,
      max: 2.0,
      notes: (hasVeg || hasSide) ? 'Good accompaniments' : 'Single dish only'
    },
    quantityPortion: {
      label: 'Quantity & Portions',
      score: quantityScore,
      max: 2.0,
      notes: `Entered quantity: ${actualQuantity}`
    },
    budget: {
      label: 'Coin Budget Fit',
      score: budgetScore,
      max: 2.0,
      notes: `₹${actualCost} spent (Target: ₹${expectedMealBudget})`
    },
    penalties,
    finalScore,
    whyExplanation: narrative,
    positivePoints,
    constructivePoints
  };
}

export function calculateDailyOverallScore(
  morningLog?: ActualMealLog,
  afternoonLog?: ActualMealLog,
  nightLog?: ActualMealLog,
  dailyBudget: number = 300
): DailyScoreSummary {
  const loggedMeals: ActualMealLog[] = [];
  if (morningLog) loggedMeals.push(morningLog);
  if (afternoonLog) loggedMeals.push(afternoonLog);
  if (nightLog) loggedMeals.push(nightLog);

  const totalSpent = loggedMeals.reduce((acc, m) => acc + m.actualCost, 0);
  const remainingBudget = Math.max(0, dailyBudget - totalSpent);

  if (loggedMeals.length === 0) {
    return {
      dateKey: new Date().toISOString().split('T')[0],
      morning: undefined,
      afternoon: undefined,
      night: undefined,
      mealsLoggedCount: 0,
      overallScore: null,
      whyOverallScore: 'No meals have been logged yet today. Complete your morning, afternoon, or night quest to establish your daily score!',
      totalSpentToday: 0,
      dailyBudget,
      remainingBudget: dailyBudget
    };
  }

  const sumScores = loggedMeals.reduce((acc, m) => acc + m.rating, 0);
  const rawAvg = sumScores / loggedMeals.length;
  const overallScore = Math.round(rawAvg * 10) / 10;

  // Build dynamic comprehensive "Why the overall score?" summary
  const mealNames = loggedMeals.map(m => m.mealType).join(', ');
  let why = `Your overall score is ${overallScore}/10 based on ${loggedMeals.length} of 3 quests logged today (${mealNames}). `;

  const highMeals = loggedMeals.filter(m => m.rating >= 8.0);
  const lowMeals = loggedMeals.filter(m => m.rating < 7.5);

  if (highMeals.length > 0) {
    const names = highMeals.map(m => m.mealType).join(' and ');
    why += `Your ${names} meal had well-balanced main and accompaniment combinations. `;
  }

  if (lowMeals.length > 0) {
    const names = lowMeals.map(m => m.mealType).join(' and ');
    why += `Your ${names} meal had deductions due to heavier fried elements, limited protein, or budget variances. `;
  }

  if (totalSpent <= dailyBudget) {
    why += `Overall coin spending remained well controlled (₹${totalSpent} spent of ₹${dailyBudget}).`;
  } else {
    why += `Daily food spending exceeded your planned budget by ₹${totalSpent - dailyBudget}.`;
  }

  return {
    dateKey: new Date().toISOString().split('T')[0],
    morning: morningLog,
    afternoon: afternoonLog,
    night: nightLog,
    mealsLoggedCount: loggedMeals.length,
    overallScore,
    whyOverallScore: why,
    totalSpentToday: totalSpent,
    dailyBudget,
    remainingBudget
  };
}
