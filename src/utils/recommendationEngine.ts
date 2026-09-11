import {
  FoodItem,
  PlayerProfile,
  MealType,
  MealRecommendation,
  RecommendedItemSelection,
} from '../types';
import { isNonVegetarian, isFriedOrHeavy, isLightAndEasyToDigest } from './foodClassifier';

export function generateRecommendation(
  inventory: FoodItem[],
  profile: PlayerProfile,
  mealType: MealType,
  spentToday: number
): MealRecommendation {
  const remainingBudget = Math.max(0, profile.dailyBudget - spentToday);

  // Target budget suggestion per meal (typically ~35-45% of daily budget or remaining)
  const mealBudgetCap = Math.max(40, Math.min(remainingBudget, Math.round(profile.dailyBudget * 0.45)));

  // 1. Filter out avoided foods
  const avoidList = profile.foodsToAvoid
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  let candidateFoods = inventory.filter(item => {
    const itemName = item.name.toLowerCase();
    const isAvoided = avoidList.some(avoid => itemName.includes(avoid));
    return !isAvoided;
  });

  // 2. Filter preference (Vegetarian vs Non-Veg)
  if (profile.foodPreference === 'Vegetarian') {
    candidateFoods = candidateFoods.filter(item => !isNonVegetarian(item.name));
  }

  // Separate foods by role
  const mainFoods = candidateFoods.filter(item => item.category === 'MAIN FOOD');
  const proteinFoods = candidateFoods.filter(item => item.category === 'PROTEIN');
  const vegetableFoods = candidateFoods.filter(item => item.category === 'VEGETABLE');
  const sideFoods = candidateFoods.filter(item => item.category === 'SIDE / ACCOMPANIMENT');
  const friedFoods = candidateFoods.filter(item => item.category === 'FRIED / HEAVY');
  const drinkFoods = candidateFoods.filter(item => item.category === 'DRINK');

  // CRITICAL CHECK (Test 3): Never recommend side dishes as a standalone meal!
  // If NO main food is available in candidate inventory, return explicit warning
  if (mainFoods.length === 0) {
    const presentItems = candidateFoods.map(f => f.name).join(', ') || 'none';
    return {
      mealType,
      items: [],
      totalCost: 0,
      fitsBudget: true,
      budgetCap: mealBudgetCap,
      remainingDailyBudget: remainingBudget,
      status: 'NO_MAIN_FOOD',
      errorMessage: `No practical meal found. Available items (${presentItems}) lack a proper main food base (such as Rice, Dosa, Idli, or Chapati). Side dishes and accompaniments alone do not constitute a complete meal.`,
      whyBreakdown: {
        mainFoodReason: 'A complete, practical meal requires a solid main food base. Side dishes like Sambar, Curd, or single accompaniments cannot stand as a full meal.',
        quantityNote: 'No main food was present to apply quantity multipliers.',
        budgetReason: 'Budget cannot be evaluated without a complete meal.',
        preferenceReason: `Preferences (${profile.foodPreference}) were verified, but main carbohydrate source is missing.`,
        profileContextReason: 'Balanced sustenance requires a foundation carbohydrate staple.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // 3. Score combinations based on context
  const isIll = profile.condition === 'I have fever' || profile.condition === "I'm feeling unwell" || profile.condition === 'My stomach feels sensitive';

  // Sort main foods by suitability
  const sortedMains = [...mainFoods].sort((a, b) => {
    if (isIll) {
      const aLight = isLightAndEasyToDigest(a.name) ? 1 : 0;
      const bLight = isLightAndEasyToDigest(b.name) ? 1 : 0;
      if (bLight !== aLight) return bLight - aLight;
    }
    // Prefer foods that fit comfortably in budget
    const costA = a.price * Math.max(1, a.quantity);
    const costB = b.price * Math.max(1, b.quantity);
    return costA - costB;
  });

  // Build combination candidates
  interface CombinationCandidate {
    items: RecommendedItemSelection[];
    totalCost: number;
    score: number;
    description: string;
  }

  const combinations: CombinationCandidate[] = [];

  for (const main of sortedMains) {
    const mainQty = Math.max(1, main.quantity);
    const mainCost = main.price * mainQty;

    // Try pairing with Protein, Veg, Side
    // Option A: Main + Protein + Side (classic hearty)
    // Option B: Main + Veg + Side (healthy balanced)
    // Option C: Main + Side (budget light)
    // Option D: Main + Protein + Veg + Side (complete feast)

    // Collect compatible add-ons
    const compatibleProteins = [...proteinFoods].sort((a, b) => {
      if (isIll) {
        // Less heavy protein when sick
        if (a.name.toLowerCase().includes('chicken') && b.name.toLowerCase().includes('egg')) return 1;
      }
      return (a.price * a.quantity) - (b.price * b.quantity);
    });

    const compatibleVegs = [...vegetableFoods].sort((a, b) => (a.price * a.quantity) - (b.price * b.quantity));
    const compatibleSides = [...sideFoods].sort((a, b) => {
      if (isIll && a.name.toLowerCase().includes('rasam')) return -1;
      return (a.price * a.quantity) - (b.price * b.quantity);
    });

    // Helper to generate candidate entry
    const createCandidate = (chosenItems: FoodItem[]): CombinationCandidate => {
      const selections: RecommendedItemSelection[] = chosenItems.map(item => {
        const qty = Math.max(1, item.quantity);
        return {
          food: item,
          quantity: qty,
          unitPrice: item.price,
          subtotal: item.price * qty,
          role: item.category
        };
      });

      const totalCost = selections.reduce((acc, curr) => acc + curr.subtotal, 0);

      // Score the combination
      let score = 100;

      // Budget check
      if (totalCost > remainingBudget) score -= 150;
      else if (totalCost > mealBudgetCap) score -= 25;
      else score += 20;

      // Illness check: penalize fried foods
      if (isIll) {
        for (const item of chosenItems) {
          if (isFriedOrHeavy(item.name, item.category)) {
            score -= 100;
          }
          if (isLightAndEasyToDigest(item.name)) {
            score += 35;
          }
        }
      }

      // Protein bonus (if healthy or reasonable)
      if (chosenItems.some(i => i.category === 'PROTEIN')) {
        score += 25;
      }

      // Vegetable bonus
      if (chosenItems.some(i => i.category === 'VEGETABLE')) {
        score += 20;
      }

      // Accompaniment bonus for proper pairing
      if (chosenItems.some(i => i.category === 'SIDE / ACCOMPANIMENT')) {
        score += 15;
      }

      const description = selections.map(s => `${s.quantity} × ${s.food.name}`).join(' + ');

      return {
        items: selections,
        totalCost,
        score,
        description
      };
    };

    // Candidate 1: Main + Side + (Protein or Veg if affordable)
    if (compatibleSides.length > 0 && compatibleProteins.length > 0) {
      combinations.push(createCandidate([main, compatibleProteins[0], compatibleSides[0]]));
    }

    if (compatibleSides.length > 0 && compatibleVegs.length > 0 && compatibleProteins.length > 0) {
      combinations.push(createCandidate([main, compatibleSides[0], compatibleVegs[0], compatibleProteins[0]]));
    }

    if (compatibleSides.length > 0 && compatibleVegs.length > 0) {
      combinations.push(createCandidate([main, compatibleSides[0], compatibleVegs[0]]));
    }

    if (compatibleProteins.length > 0) {
      combinations.push(createCandidate([main, compatibleProteins[0]]));
    }

    if (compatibleSides.length > 0) {
      combinations.push(createCandidate([main, compatibleSides[0]]));
    }

    // Main alone if nothing else
    combinations.push(createCandidate([main]));
  }

  // Sort combinations by score descending
  combinations.sort((a, b) => b.score - a.score);

  const bestCombo = combinations[0];

  if (!bestCombo || bestCombo.items.length === 0) {
    return {
      mealType,
      items: [],
      totalCost: 0,
      fitsBudget: false,
      budgetCap: mealBudgetCap,
      remainingDailyBudget: remainingBudget,
      status: 'NO_AVAILABLE_FOOD',
      errorMessage: 'No practical combination fits your criteria. Try adjusting budget or adding items to your inventory.',
      whyBreakdown: {
        mainFoodReason: 'None available.',
        quantityNote: 'None',
        budgetReason: 'Exceeded budget.',
        preferenceReason: `Preferences: ${profile.foodPreference}`,
        profileContextReason: 'Standard profile.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // 4. Generate item-by-item specific dynamic explanations
  const itemReasons = bestCombo.items.map(selection => {
    const { food, quantity, subtotal } = selection;
    let reason = '';

    if (food.category === 'MAIN FOOD') {
      reason = `${food.name} provides the vital carbohydrate base and energy foundation for your ${mealType} quest.`;
    } else if (food.category === 'PROTEIN') {
      reason = `${food.name} supplies essential muscle repair amino acids and sustained satiety.`;
    } else if (food.category === 'VEGETABLE') {
      reason = `${food.name} introduces micronutrients and dietary fiber to keep digestion optimal.`;
    } else if (food.category === 'SIDE / ACCOMPANIMENT') {
      reason = `${food.name} acts as a flavorful pairing that enhances the main course rather than being eaten standalone.`;
    } else if (food.category === 'DRINK') {
      reason = `${food.name} provides hydration and warmth to round off the meal.`;
    } else if (food.category === 'FRIED / HEAVY') {
      reason = `${food.name} provides an occasional calorie boost, balanced by your other staple picks.`;
    }

    return {
      name: food.name,
      role: food.category,
      quantity,
      subtotal,
      reason
    };
  });

  // 5. Dynamic overall reasoning
  const mainItem = bestCombo.items.find(i => i.role === 'MAIN FOOD')!;
  const proteinItem = bestCombo.items.find(i => i.role === 'PROTEIN');
  const sideItem = bestCombo.items.find(i => i.role === 'SIDE / ACCOMPANIMENT');
  const vegItem = bestCombo.items.find(i => i.role === 'VEGETABLE');

  let conditionReason = undefined;
  if (isIll) {
    conditionReason = `Because you reported ${profile.condition.toLowerCase()} today, MealQuest prioritized a lighter, easier-to-tolerate combination and avoided heavily fried options where possible.`;
  }

  // Profile context (height & weight)
  const bmiApprox = profile.weightKg / Math.pow(profile.heightCm / 100, 2);
  let profileContextReason = `Your profile (${profile.heightCm} cm, ${profile.weightKg} kg) indicates a balanced body frame; this combination supplies steady fuel without overwhelming sluggishness.`;
  if (profile.heightCm > 175 || profile.weightKg > 75) {
    profileContextReason = `Your profile indicates a larger physical frame (${profile.heightCm} cm, ${profile.weightKg} kg), so MealQuest favors a more substantial balanced meal with solid energy when suitable options exist.`;
  } else if (profile.heightCm < 160 || profile.weightKg < 55) {
    profileContextReason = `Your profile indicates a compact physical frame (${profile.heightCm} cm, ${profile.weightKg} kg), so MealQuest focuses on clean nutrient density and portion control.`;
  }

  const quantityNote = bestCombo.items
    .map(i => `${i.quantity} × ${i.food.name} (₹${i.subtotal})`)
    .join(' + ');

  const budgetFits = bestCombo.totalCost <= remainingBudget;
  const budgetReason = budgetFits
    ? `Estimated meal cost is ₹${bestCombo.totalCost}, which fits within your remaining daily coin allowance of ₹${remainingBudget} (out of ₹${profile.dailyBudget} total).`
    : `Estimated cost (₹${bestCombo.totalCost}) slightly surpasses your remaining coins (₹${remainingBudget}). You can adjust quantities or pick an alternative.`;

  // 6. Alternatives (1 or 2 distinct combinations)
  const alternativeCombos = combinations
    .filter(c => c.description !== bestCombo.description)
    .slice(0, 2);

  const alternatives = alternativeCombos.map((alt, idx) => {
    const isCheaper = alt.totalCost < bestCombo.totalCost;
    let whyPrimaryPreferred = `Recommended choice offers a more complete nutritional synergy with ${bestCombo.items.map(i => i.food.name).join(', ')}.`;
    if (isCheaper) {
      whyPrimaryPreferred = `While Alternative ${idx + 1} is lighter on coins (₹${alt.totalCost}), the primary recommendation provides better sustained satiety for your daily tasks.`;
    } else {
      whyPrimaryPreferred = `Primary recommendation is more cost-effective (₹${bestCombo.totalCost} vs ₹${alt.totalCost}) while achieving equivalent meal satisfaction.`;
    }

    return {
      title: `Alternative ${idx + 1}`,
      itemsSummary: alt.description,
      totalCost: alt.totalCost,
      reason: `Practical combination of available items totaling ₹${alt.totalCost}.`,
      whyPrimaryPreferred
    };
  });

  return {
    mealType,
    items: bestCombo.items,
    totalCost: bestCombo.totalCost,
    fitsBudget: budgetFits,
    budgetCap: mealBudgetCap,
    remainingDailyBudget: remainingBudget,
    status: budgetFits ? 'SUCCESS' : 'OVER_BUDGET',
    whyBreakdown: {
      mainFoodReason: `${mainItem.food.name} serves as the primary staple anchor.`,
      proteinReason: proteinItem ? `${proteinItem.food.name} provides clean protein.` : undefined,
      vegetableReason: vegItem ? `${vegItem.food.name} contributes fresh dietary fiber.` : undefined,
      sideReason: sideItem ? `${sideItem.food.name} adds moisture and flavor without replacing the main food.` : undefined,
      quantityNote: `Your custom quantities are applied: ${quantityNote}`,
      budgetReason,
      preferenceReason: `Strictly verified against your ${profile.foodPreference} preference.`,
      conditionReason,
      profileContextReason
    },
    itemReasons,
    alternatives
  };
}
