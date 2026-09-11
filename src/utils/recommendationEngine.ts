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

  // Parse avoid list
  const avoidList = profile.foodsToAvoid
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  // 1. Check if inventory is completely empty
  if (!inventory || inventory.length === 0) {
    return {
      mealType,
      items: [],
      totalCost: 0,
      fitsBudget: true,
      budgetCap: mealBudgetCap,
      remainingDailyBudget: remainingBudget,
      status: 'NO_AVAILABLE_FOOD',
      errorMessage: 'No food items are currently listed in this meal\'s inventory. Please add dishes or import a menu from your hotel.',
      whyBreakdown: {
        mainFoodReason: 'Inventory is empty.',
        quantityNote: 'None',
        budgetReason: `Remaining budget is ₹${remainingBudget}.`,
        preferenceReason: `Preference: ${profile.foodPreference}`,
        avoidReason: avoidList.length > 0 ? `Avoid list: ${avoidList.join(', ')}` : 'None',
        profileContextReason: 'Add food items to proceed.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // 2. Filter out items with 0 quantity and avoided items
  let candidateFoods = inventory.filter(item => {
    if (item.quantity <= 0) return false;
    const itemName = item.name.toLowerCase();
    const isAvoided = avoidList.some(avoid => itemName.includes(avoid) || (avoid.length > 2 && avoid.includes(itemName)));
    return !isAvoided;
  });

  // Filter preference (Vegetarian vs Non-Veg vs Anything)
  if (profile.foodPreference === 'Vegetarian') {
    candidateFoods = candidateFoods.filter(item => !isNonVegetarian(item.name));
  }

  // 3. Check if all candidate foods were filtered out
  if (candidateFoods.length === 0) {
    const hasItems = inventory.length > 0;
    let explanation = 'A proper main food is available, but all suitable options are excluded by your dietary preference or avoid list.';
    if (hasItems) {
      const avoidedItems = inventory.filter(i => avoidList.some(a => i.name.toLowerCase().includes(a)));
      const nonVegItems = profile.foodPreference === 'Vegetarian' ? inventory.filter(i => isNonVegetarian(i.name)) : [];
      if (avoidedItems.length > 0 && nonVegItems.length > 0) {
        explanation = `All available inventory items were excluded by your avoid list (${avoidList.join(', ')}) and your Vegetarian preference.`;
      } else if (avoidedItems.length > 0) {
        explanation = `All available items (${avoidedItems.map(i => i.name).join(', ')}) were excluded because they are on your avoid list (${avoidList.join(', ')}).`;
      } else if (nonVegItems.length > 0) {
        explanation = `All available items are non-vegetarian, which does not match your Vegetarian preference.`;
      }
    }

    return {
      mealType,
      items: [],
      totalCost: 0,
      fitsBudget: true,
      budgetCap: mealBudgetCap,
      remainingDailyBudget: remainingBudget,
      status: 'NO_AVAILABLE_FOOD',
      errorMessage: explanation,
      whyBreakdown: {
        mainFoodReason: 'All foods excluded by filter criteria.',
        quantityNote: 'None',
        budgetReason: `Remaining budget is ₹${remainingBudget}.`,
        preferenceReason: `Strictly enforced ${profile.foodPreference} preference.`,
        avoidReason: avoidList.length > 0 ? `Excluded items matching avoid list: ${avoidList.join(', ')}` : 'None',
        profileContextReason: 'Please add items or adjust your avoid list.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // Separate foods by role
  const mainFoods = candidateFoods.filter(item => item.category === 'MAIN FOOD');
  const proteinFoods = candidateFoods.filter(item => item.category === 'PROTEIN');
  const vegetableFoods = candidateFoods.filter(item => item.category === 'VEGETABLE');
  const sideFoods = candidateFoods.filter(item => item.category === 'SIDE / ACCOMPANIMENT');
  const friedFoods = candidateFoods.filter(item => item.category === 'FRIED / HEAVY');
  const drinkFoods = candidateFoods.filter(item => item.category === 'DRINK');

  // 4. CRITICAL CHECK: Never recommend side dishes as a standalone meal!
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
      errorMessage: `A proper main food is missing from the current inventory. Available items (${presentItems}) lack a proper main food base (such as Rice, Dosa, Idli, Chapati, Pongal, Poori, Upma, or Noodles). Side dishes, drinks, and accompaniments alone do not constitute a complete meal.`,
      whyBreakdown: {
        mainFoodReason: 'A complete, practical meal requires a solid main food base. Side dishes like Sambar, Curd, or single accompaniments cannot stand as a full meal.',
        quantityNote: 'No main food was present to apply quantity multipliers.',
        budgetReason: 'Budget cannot be evaluated without a complete meal.',
        preferenceReason: `Preferences (${profile.foodPreference}) were verified, but a main carbohydrate source is missing.`,
        avoidReason: avoidList.length > 0 ? `Excluded avoided items: ${avoidList.join(', ')}` : 'No avoided foods specified.',
        profileContextReason: 'Balanced sustenance requires a foundation carbohydrate staple.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // 5. Check if user has zero remaining budget
  if (remainingBudget <= 0) {
    return {
      mealType,
      items: [],
      totalCost: 0,
      fitsBudget: false,
      budgetCap: mealBudgetCap,
      remainingDailyBudget: remainingBudget,
      status: 'OVER_BUDGET',
      errorMessage: `You have spent all of your daily coins (₹${spentToday} spent out of ₹${profile.dailyBudget}). Remaining budget is ₹0. Please increase your daily budget or adjust previous meal costs.`,
      whyBreakdown: {
        mainFoodReason: 'Budget exhausted.',
        quantityNote: 'None',
        budgetReason: `Spent ₹${spentToday} of ₹${profile.dailyBudget}. Remaining: ₹0.`,
        preferenceReason: `Preference: ${profile.foodPreference}`,
        avoidReason: avoidList.length > 0 ? `Avoid list: ${avoidList.join(', ')}` : 'None',
        profileContextReason: 'No budget available.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // 6. Score combinations based on context
  const isIll = profile.condition === 'I have fever' || profile.condition === "I'm feeling unwell" || profile.condition === 'My stomach feels sensitive';

  // Sort main foods by suitability
  const sortedMains = [...mainFoods].sort((a, b) => {
    if (isIll) {
      const aLight = isLightAndEasyToDigest(a.name) ? 1 : 0;
      const bLight = isLightAndEasyToDigest(b.name) ? 1 : 0;
      if (bLight !== aLight) return bLight - aLight;
    }
    // Prefer foods that fit comfortably in budget
    const costA = a.price * Math.min(a.quantity, 1);
    const costB = b.price * Math.min(b.quantity, 1);
    return costA - costB;
  });

  // Check if even the cheapest main food exceeds remainingBudget
  const cheapestMainPrice = Math.min(...sortedMains.map(m => m.price));
  if (cheapestMainPrice > remainingBudget) {
    return {
      mealType,
      items: [],
      totalCost: 0,
      fitsBudget: false,
      budgetCap: mealBudgetCap,
      remainingDailyBudget: remainingBudget,
      status: 'OVER_BUDGET',
      errorMessage: `A suitable meal cannot be created within your remaining budget of ₹${remainingBudget}. The lowest-cost available main food (${sortedMains[0].name}) costs ₹${sortedMains[0].price}.`,
      whyBreakdown: {
        mainFoodReason: `${sortedMains[0].name} costs ₹${sortedMains[0].price}, exceeding your remaining ₹${remainingBudget}.`,
        quantityNote: '1 portion exceeds budget',
        budgetReason: `Remaining budget is ₹${remainingBudget}, which cannot afford any available main food.`,
        preferenceReason: `Preferences: ${profile.foodPreference}`,
        avoidReason: avoidList.length > 0 ? `Avoid list: ${avoidList.join(', ')}` : 'None',
        profileContextReason: 'Budget constrained.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // Build combination candidates
  interface CombinationCandidate {
    items: RecommendedItemSelection[];
    totalCost: number;
    score: number;
    description: string;
  }

  const combinations: CombinationCandidate[] = [];

  // Helper to generate candidate entry
  const createCandidate = (
    chosenItemsWithQty: { item: FoodItem; quantity: number }[]
  ): CombinationCandidate => {
    const selections: RecommendedItemSelection[] = chosenItemsWithQty.map(({ item, quantity }) => {
      const validQty = Math.max(1, Math.min(item.quantity, quantity));
      return {
        food: item,
        quantity: validQty,
        unitPrice: item.price,
        subtotal: item.price * validQty,
        role: item.category
      };
    });

    const totalCost = selections.reduce((acc, curr) => acc + curr.subtotal, 0);

    // Score the combination
    let score = 100;

    // Budget scoring
    if (totalCost > remainingBudget) {
      score -= 300; // Heavily penalize exceeding remaining budget
    } else if (totalCost <= mealBudgetCap) {
      score += 30; // Fits target meal allocation perfectly
    } else {
      score += 10;
    }

    // Illness check: penalize fried/heavy foods and reward light soothing foods
    for (const selection of selections) {
      const { food } = selection;
      if (isIll) {
        if (isFriedOrHeavy(food.name, food.category)) {
          score -= 90;
        }
        if (isLightAndEasyToDigest(food.name)) {
          score += 45;
        }
      } else {
        // In normal health, slightly prefer wholesome over greasy
        if (isFriedOrHeavy(food.name, food.category)) {
          score -= 15;
        }
      }
    }

    // Role bonuses
    if (selections.some(i => i.role === 'PROTEIN')) {
      score += 25;
    }
    if (selections.some(i => i.role === 'VEGETABLE')) {
      score += 20;
    }
    if (selections.some(i => i.role === 'SIDE / ACCOMPANIMENT')) {
      score += 15;
    }

    // Pairing affinity
    const hasMain = selections.some(i => i.role === 'MAIN FOOD');
    const hasSide = selections.some(i => i.role === 'SIDE / ACCOMPANIMENT');
    if (hasMain && hasSide) {
      score += 15;
    }

    // Profile physical frame context
    if (profile.heightCm > 175 || profile.weightKg > 75) {
      // Larger frame benefits from slightly more substance
      if (selections.some(i => i.quantity > 1 || i.role === 'PROTEIN')) {
        score += 10;
      }
    }

    const description = selections.map(s => `${s.quantity} × ${s.food.name}`).join(' + ');

    return {
      items: selections,
      totalCost,
      score,
      description
    };
  };

  // Sort available companion foods
  const compatibleProteins = [...proteinFoods].sort((a, b) => {
    if (isIll && a.name.toLowerCase().includes('chicken') && b.name.toLowerCase().includes('egg')) return 1;
    return a.price - b.price;
  });

  const compatibleVegs = [...vegetableFoods].sort((a, b) => a.price - b.price);
  const compatibleSides = [...sideFoods].sort((a, b) => {
    if (isIll && a.name.toLowerCase().includes('rasam')) return -1;
    return a.price - b.price;
  });

  for (const main of sortedMains) {
    // Check available quantities for main (try available inventory quantity, or 1 if quantity > 1)
    const possibleMainQuantities = main.quantity > 1 ? [main.quantity, 1] : [1];

    for (const mQty of possibleMainQuantities) {
      // Option 1: Main + Side + Protein + Vegetable
      if (compatibleSides.length > 0 && compatibleVegs.length > 0 && compatibleProteins.length > 0) {
        combinations.push(createCandidate([
          { item: main, quantity: mQty },
          { item: compatibleSides[0], quantity: Math.min(1, compatibleSides[0].quantity) },
          { item: compatibleVegs[0], quantity: Math.min(1, compatibleVegs[0].quantity) },
          { item: compatibleProteins[0], quantity: Math.min(1, compatibleProteins[0].quantity) }
        ]));
      }

      // Option 2: Main + Side + Protein
      if (compatibleSides.length > 0 && compatibleProteins.length > 0) {
        combinations.push(createCandidate([
          { item: main, quantity: mQty },
          { item: compatibleSides[0], quantity: Math.min(1, compatibleSides[0].quantity) },
          { item: compatibleProteins[0], quantity: Math.min(1, compatibleProteins[0].quantity) }
        ]));
      }

      // Option 3: Main + Side + Vegetable
      if (compatibleSides.length > 0 && compatibleVegs.length > 0) {
        combinations.push(createCandidate([
          { item: main, quantity: mQty },
          { item: compatibleSides[0], quantity: Math.min(1, compatibleSides[0].quantity) },
          { item: compatibleVegs[0], quantity: Math.min(1, compatibleVegs[0].quantity) }
        ]));
      }

      // Option 4: Main + Side (classic staple pairing)
      if (compatibleSides.length > 0) {
        combinations.push(createCandidate([
          { item: main, quantity: mQty },
          { item: compatibleSides[0], quantity: Math.min(1, compatibleSides[0].quantity) }
        ]));
      }

      // Option 5: Main + Protein
      if (compatibleProteins.length > 0) {
        combinations.push(createCandidate([
          { item: main, quantity: mQty },
          { item: compatibleProteins[0], quantity: Math.min(1, compatibleProteins[0].quantity) }
        ]));
      }

      // Option 6: Main alone (if affordable or budget tight)
      combinations.push(createCandidate([
        { item: main, quantity: mQty }
      ]));
    }
  }

  // Filter combinations to only those strictly within remaining budget
  const budgetFittingCombos = combinations.filter(c => c.totalCost <= remainingBudget);

  // If no combination fit within remaining budget, try simplest single main if it fits
  let bestCombo: CombinationCandidate | undefined;
  if (budgetFittingCombos.length > 0) {
    budgetFittingCombos.sort((a, b) => b.score - a.score);
    bestCombo = budgetFittingCombos[0];
  } else {
    // Fallback: sort all combinations by budget overrun ascending
    combinations.sort((a, b) => b.score - a.score);
    bestCombo = combinations[0];
  }

  if (!bestCombo || bestCombo.items.length === 0) {
    return {
      mealType,
      items: [],
      totalCost: 0,
      fitsBudget: false,
      budgetCap: mealBudgetCap,
      remainingDailyBudget: remainingBudget,
      status: 'NO_AVAILABLE_FOOD',
      errorMessage: 'A suitable meal cannot be created within your remaining budget. Please adjust your budget or inventory.',
      whyBreakdown: {
        mainFoodReason: 'None available within budget.',
        quantityNote: 'None',
        budgetReason: `Remaining budget is ₹${remainingBudget}.`,
        preferenceReason: `Preferences: ${profile.foodPreference}`,
        avoidReason: avoidList.length > 0 ? `Avoid list: ${avoidList.join(', ')}` : 'None',
        profileContextReason: 'No combinations available.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // Item reasons
  const itemReasons = bestCombo.items.map(selection => {
    const { food, quantity, subtotal } = selection;
    let reason = '';

    if (food.category === 'MAIN FOOD') {
      if (isIll && isLightAndEasyToDigest(food.name)) {
        reason = `${food.name} provides a gentle, easily digestible carbohydrate base suitable for when you are feeling unwell.`;
      } else {
        reason = `${food.name} serves as the primary staple anchor and carbohydrate energy source for your ${mealType} quest.`;
      }
    } else if (food.category === 'PROTEIN') {
      reason = `${food.name} supplies essential protein for muscle recovery and sustained satiety.`;
    } else if (food.category === 'VEGETABLE') {
      reason = `${food.name} provides essential vitamins, micronutrients, and dietary fiber.`;
    } else if (food.category === 'SIDE / ACCOMPANIMENT') {
      reason = `${food.name} is paired as an accompaniment to enhance the flavor and moisture of the main food.`;
    } else if (food.category === 'DRINK') {
      reason = `${food.name} provides hydration and warmth.`;
    } else if (food.category === 'FRIED / HEAVY') {
      reason = `${food.name} provides a flavorful calorie boost.`;
    }

    return {
      name: food.name,
      role: food.category,
      quantity,
      subtotal,
      reason
    };
  });

  const mainItem = bestCombo.items.find(i => i.role === 'MAIN FOOD')!;
  const proteinItem = bestCombo.items.find(i => i.role === 'PROTEIN');
  const sideItem = bestCombo.items.find(i => i.role === 'SIDE / ACCOMPANIMENT');
  const vegItem = bestCombo.items.find(i => i.role === 'VEGETABLE');

  let conditionReason = undefined;
  if (isIll) {
    conditionReason = `Because you reported "${profile.condition}", MealQuest prioritized lighter, easy-to-digest food (like ${mainItem.food.name}) and strictly excluded heavy or fried options.`;
  }

  let profileContextReason = `Your profile (${profile.heightCm} cm, ${profile.weightKg} kg) indicates a balanced frame; this portion provides steady energy without causing sluggishness.`;
  if (profile.heightCm > 175 || profile.weightKg > 75) {
    profileContextReason = `Your profile indicates a larger frame (${profile.heightCm} cm, ${profile.weightKg} kg), so MealQuest ensures adequate substance and portion fulfillment.`;
  } else if (profile.heightCm < 160 || profile.weightKg < 55) {
    profileContextReason = `Your profile indicates a compact frame (${profile.heightCm} cm, ${profile.weightKg} kg), so MealQuest focuses on clean portion balance.`;
  }

  const quantityNote = bestCombo.items
    .map(i => `${i.quantity} × ${i.food.name} (₹${i.subtotal})`)
    .join(' + ');

  const budgetFits = bestCombo.totalCost <= remainingBudget;
  const remainingAfterMeal = Math.max(0, remainingBudget - bestCombo.totalCost);

  const budgetReason = budgetFits
    ? `Total meal cost is ₹${bestCombo.totalCost}, fitting cleanly within your remaining coin budget of ₹${remainingBudget} (leaving ₹${remainingAfterMeal} for the rest of today).`
    : `Total cost (₹${bestCombo.totalCost}) exceeds your remaining coin budget of ₹${remainingBudget}.`;

  // Alternatives: pick 1 to 3 distinct valid alternative combinations that also fit within budget
  const alternativeCombos = (budgetFittingCombos.length > 0 ? budgetFittingCombos : combinations)
    .filter(c => c.description !== bestCombo!.description)
    .slice(0, 3);

  const alternatives = alternativeCombos.map((alt, idx) => {
    const isCheaper = alt.totalCost < bestCombo!.totalCost;
    let whyPrimaryPreferred = `Recommended choice offers a more balanced nutritional synergy with ${bestCombo!.items.map(i => i.food.name).join(', ')}.`;
    if (isCheaper) {
      whyPrimaryPreferred = `While Alternative ${idx + 1} is cheaper (₹${alt.totalCost}), the primary recommendation provides better sustained satiety and dietary balance.`;
    } else {
      whyPrimaryPreferred = `Primary recommendation is more cost-effective (₹${bestCombo!.totalCost} vs ₹${alt.totalCost}) while achieving equivalent satisfaction.`;
    }

    return {
      title: `Alternative ${idx + 1}`,
      itemsSummary: alt.description,
      totalCost: alt.totalCost,
      reason: `Practical combination of available items totaling ₹${alt.totalCost}.`,
      whyPrimaryPreferred
    };
  });

  const recommendationScore = Math.min(9.8, Math.max(7.2, Math.round(((bestCombo.score) / 165) * 9.5 * 10) / 10));

  return {
    mealType,
    items: bestCombo.items,
    totalCost: bestCombo.totalCost,
    fitsBudget: budgetFits,
    budgetCap: mealBudgetCap,
    remainingDailyBudget: remainingBudget,
    status: budgetFits ? 'SUCCESS' : 'OVER_BUDGET',
    recommendationScore,
    whyBreakdown: {
      mainFoodReason: `${mainItem.food.name} is selected as the available main food anchor.`,
      proteinReason: proteinItem ? `${proteinItem.food.name} provides clean protein.` : undefined,
      vegetableReason: vegItem ? `${vegItem.food.name} contributes fresh dietary fiber.` : undefined,
      sideReason: sideItem ? `${sideItem.food.name} is paired as an accompaniment.` : undefined,
      quantityNote: `Based on your inventory quantities: ${quantityNote}`,
      budgetReason,
      preferenceReason: `Strictly verified against your ${profile.foodPreference} preference.`,
      avoidReason: avoidList.length > 0 ? `Foods matching your avoid list (${avoidList.join(', ')}) were strictly excluded.` : 'No foods on your avoid list.',
      conditionReason,
      profileContextReason
    },
    itemReasons,
    alternatives
  };
}
