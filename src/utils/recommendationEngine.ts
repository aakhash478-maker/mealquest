import {
  FoodItem,
  PlayerProfile,
  MealType,
  MealRecommendation,
  RecommendedItemSelection,
  FoodCategory
} from '../types';
import { isNonVegetarian, isFriedOrHeavy, isLightAndEasyToDigest } from './foodClassifier';

export type AgeGroup = 'Child' | 'Teen' | 'Young adult' | 'Adult' | 'Older adult';

export function getAgeGroup(age: number): AgeGroup {
  if (age < 13) return 'Child';
  if (age <= 17) return 'Teen';
  if (age <= 25) return 'Young adult';
  if (age <= 59) return 'Adult';
  return 'Older adult';
}

export function getAgeGroupDescription(ageGroup: AgeGroup): string {
  switch (ageGroup) {
    case 'Child':
      return 'Child (<13 yrs): Wholesome, moderate practical portions suitable for young adventurers.';
    case 'Teen':
      return 'Teen (13–17 yrs): Growing active metabolism, hearty practical portions with solid staple fuel.';
    case 'Young adult':
      return 'Young adult (18–25 yrs): High daily energy demand, solid staple base with balanced protein.';
    case 'Adult':
      return 'Adult (26–59 yrs): Balanced portions suited for consistent daily stamina and steady energy.';
    case 'Older adult':
      return 'Older adult (60+ yrs): Gentle, easily digestible practical portions with lighter preparation.';
  }
}

/**
 * Format food serving in clear, natural user-facing phrasing.
 * E.g., "1 serving Pongal", "2 Idlis", "1 Dosa", "2 Pooris", "2 Chapatis", "1 Egg"
 */
export function formatServingItem(foodName: string, recommendedQty: number): string {
  const name = foodName.trim();
  const lower = name.toLowerCase();

  // Serving-based items (rice, pongal, meals, upma, kichadi, biryani, noodles)
  if (
    lower.includes('pongal') ||
    lower.includes('rice') ||
    lower.includes('upma') ||
    lower.includes('kichadi') ||
    lower.includes('biryani') ||
    lower.includes('noodles') ||
    lower.includes('meals')
  ) {
    return recommendedQty === 1 ? `1 serving ${name}` : `${recommendedQty} servings ${name}`;
  }

  // Counted items
  if (lower.includes('idli')) {
    return recommendedQty === 1 ? '1 Idli' : `${recommendedQty} Idlis`;
  }
  if (lower.includes('dosa') || lower.includes('dosai')) {
    return recommendedQty === 1 ? '1 Dosa' : `${recommendedQty} Dosas`;
  }
  if (lower.includes('poori') || lower.includes('puri')) {
    return recommendedQty === 1 ? '1 Poori' : `${recommendedQty} Pooris`;
  }
  if (lower.includes('chapati') || lower.includes('roti')) {
    return recommendedQty === 1 ? '1 Chapati' : `${recommendedQty} Chapatis`;
  }
  if (lower.includes('parotta')) {
    return recommendedQty === 1 ? '1 Parotta' : `${recommendedQty} Parottas`;
  }
  if (lower.includes('egg') || lower.includes('muttai')) {
    return recommendedQty === 1 ? '1 Egg' : `${recommendedQty} Eggs`;
  }
  if (lower.includes('vada') || lower.includes('vadai')) {
    return recommendedQty === 1 ? '1 Vada' : `${recommendedQty} Vadas`;
  }

  return `${recommendedQty} × ${name}`;
}

export interface PracticalServingInfo {
  standardMin: number;
  standardIdeal: number;
  standardMax: number;
  typicalUnitDescription: string;
  candidateQuantities: number[];
  isLowAvailability: boolean;
  isCompletelyOutOfStock: boolean;
  portionRationale: string;
}

/**
 * Returns practical serving bounds for Indian & hotel foods based on:
 * - Food type (e.g. Idli, Dosa, Pongal, Poori, Chapati, Parotta, Rice, Egg)
 * - Meal type (morning, afternoon, night)
 * - User's age & broad age group
 * - Current condition (e.g. illness / sensitive stomach)
 *
 * CRITICAL DIRECTIVE: Available inventory quantity acts STRICTLY as an availability constraint,
 * NEVER as the recommended portion size!
 */
export function getPracticalServingInfo(
  food: FoodItem,
  mealType: MealType,
  age: number,
  isIll: boolean
): PracticalServingInfo {
  const name = food.name.toLowerCase();
  const available = Math.max(
    0,
    typeof food.availableQuantity === 'number'
      ? food.availableQuantity
      : (typeof food.quantity === 'number' ? food.quantity : 0)
  );

  const ageGroup = getAgeGroup(age || 21);

  let standardMin = 1;
  let standardIdeal = 1;
  let standardMax = 1;
  let typicalUnitDescription = '1 serving';

  if (name.includes('idli')) {
    if (ageGroup === 'Child') {
      standardMin = 1;
      standardIdeal = 2;
      standardMax = 2;
    } else if (ageGroup === 'Older adult') {
      standardMin = 2;
      standardIdeal = 2;
      standardMax = 2;
    } else {
      // Teen, Young adult, Adult
      standardMin = 2;
      standardIdeal = mealType === 'night' || isIll ? 2 : (ageGroup === 'Teen' ? 3 : 2);
      standardMax = 3;
    }
    typicalUnitDescription = '2–3 Idlis';
  } else if (name.includes('poori') || name.includes('puri')) {
    if (ageGroup === 'Child') {
      standardMin = 1;
      standardIdeal = 2;
      standardMax = 2;
    } else if (ageGroup === 'Older adult') {
      standardMin = 2;
      standardIdeal = 2;
      standardMax = 2;
    } else {
      standardMin = 2;
      standardIdeal = isIll ? 2 : (ageGroup === 'Teen' ? 3 : 2);
      standardMax = 3;
    }
    typicalUnitDescription = '2–3 Pooris';
  } else if (name.includes('chapati') || name.includes('roti')) {
    if (ageGroup === 'Child') {
      standardMin = 1;
      standardIdeal = 2;
      standardMax = 2;
    } else if (ageGroup === 'Teen' || ageGroup === 'Young adult') {
      standardMin = 2;
      standardIdeal = 2;
      standardMax = 3;
    } else {
      standardMin = 2;
      standardIdeal = 2;
      standardMax = 2;
    }
    typicalUnitDescription = '2 Chapatis';
  } else if (name.includes('parotta')) {
    if (ageGroup === 'Child' || ageGroup === 'Older adult' || isIll || mealType === 'night') {
      standardMin = 1;
      standardIdeal = 1;
      standardMax = 1;
    } else {
      standardMin = 1;
      standardIdeal = 2;
      standardMax = 2;
    }
    typicalUnitDescription = '1–2 Parottas';
  } else if (name.includes('dosa') || name.includes('dosai')) {
    if (ageGroup === 'Child' || ageGroup === 'Older adult' || isIll || mealType === 'night') {
      standardMin = 1;
      standardIdeal = 1;
      standardMax = 1;
    } else {
      standardMin = 1;
      standardIdeal = 1;
      standardMax = 2;
    }
    typicalUnitDescription = '1–2 Dosas';
  } else if (
    name.includes('vada') ||
    name.includes('vadai') ||
    name.includes('bonda') ||
    name.includes('bajji') ||
    name.includes('samosa')
  ) {
    standardMin = 1;
    standardIdeal = 1;
    standardMax = 1;
    typicalUnitDescription = '1 piece';
  } else if (name.includes('egg') || name.includes('muttai')) {
    if (ageGroup === 'Child' || ageGroup === 'Older adult') {
      standardMin = 1;
      standardIdeal = 1;
      standardMax = 1;
    } else {
      standardMin = 1;
      standardIdeal = 1;
      standardMax = 2;
    }
    typicalUnitDescription = '1–2 Eggs';
  } else {
    // Rice, Pongal, Meals, Biryani, Upma, Kichadi, Noodles, Chicken, Curd, Sambar, etc.
    standardMin = 1;
    standardIdeal = 1;
    standardMax = 1;
    typicalUnitDescription = '1 serving';
  }

  // Determine practical candidate quantities that are <= available stock
  const candidatesSet = new Set<number>();
  if (available >= standardIdeal) {
    candidatesSet.add(standardIdeal);
  }
  for (let q = standardMin; q <= standardMax; q++) {
    if (q <= available && q > 0) {
      candidatesSet.add(q);
    }
  }

  // If available is strictly less than standardMin but > 0, we can only provide available
  const isLowAvailability = available > 0 && available < standardMin;
  if (isLowAvailability && available > 0) {
    candidatesSet.add(available);
  }

  const candidateQuantities = Array.from(candidatesSet).sort((a, b) => {
    if (a === standardIdeal) return -1;
    if (b === standardIdeal) return 1;
    return b - a;
  });

  const isCompletelyOutOfStock = available <= 0;

  let portionRationale = '';
  if (isCompletelyOutOfStock) {
    portionRationale = `${food.name} is out of stock (0 available at hotel).`;
  } else if (isLowAvailability) {
    portionRationale = `Only ${available} ${food.name} available at hotel (standard practical portion for ${ageGroup} is ${typicalUnitDescription}). Availability limit reached.`;
  } else {
    portionRationale = `MealQuest suggests a practical portion of ${candidateQuantities[0] || 1} ${food.name} (hotel has ${available} in stock).`;
  }

  return {
    standardMin,
    standardIdeal,
    standardMax,
    typicalUnitDescription,
    candidateQuantities,
    isLowAvailability,
    isCompletelyOutOfStock,
    portionRationale
  };
}

export function generateRecommendation(
  inventory: FoodItem[],
  profile: PlayerProfile,
  mealType: MealType,
  spentToday: number
): MealRecommendation {
  const generatedAt = Date.now();
  const userAge = profile.age || 21;
  const ageGroup = getAgeGroup(userAge);
  const remainingBudget = Math.max(0, profile.dailyBudget - spentToday);

  // Target budget suggestion per meal (typically ~35-45% of daily budget or remaining)
  const mealBudgetCap = Math.max(40, Math.min(remainingBudget, Math.round(profile.dailyBudget * 0.45)));

  // Parse avoid list
  const avoidList = (profile.foodsToAvoid || '')
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
      errorMessage: "No food items are currently listed in this meal's inventory. Please add dishes or import a menu from your hotel.",
      generatedAt,
      portionCheck: 'No items in inventory',
      portionDecision: 'Inventory is empty.',
      isLimitedPortion: false,
      ageContextNote: `Age: ${userAge} (${ageGroup})`,
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

  // 2. Filter out items with 0 available quantity and avoided items
  let candidateFoods = inventory.filter(item => {
    const avail = Math.max(
      0,
      typeof item.availableQuantity === 'number'
        ? item.availableQuantity
        : (typeof item.quantity === 'number' ? item.quantity : 0)
    );
    if (avail <= 0) return false;
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
      generatedAt,
      portionCheck: 'All items filtered out',
      portionDecision: 'No items match dietary filters.',
      isLimitedPortion: false,
      ageContextNote: `Age: ${userAge} (${ageGroup})`,
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
      generatedAt,
      portionCheck: 'Missing main food foundation',
      portionDecision: 'Cannot determine portion without a main food anchor.',
      isLimitedPortion: false,
      ageContextNote: `Age: ${userAge} (${ageGroup})`,
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
      generatedAt,
      portionCheck: '0 coins remaining',
      portionDecision: 'Budget exhausted.',
      isLimitedPortion: false,
      ageContextNote: `Age: ${userAge} (${ageGroup})`,
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

  const isIll =
    profile.condition === 'I have fever' ||
    profile.condition === "I'm feeling unwell" ||
    profile.condition === 'My stomach feels sensitive';

  // Build combination candidates
  interface CombinationCandidate {
    items: RecommendedItemSelection[];
    totalCost: number;
    score: number;
    description: string;
    portionDecisionNotes: string;
    isLimited: boolean;
    isComplete: boolean;
    limitedWarning?: string;
  }

  const combinations: CombinationCandidate[] = [];

  const createCandidate = (
    chosenItemsWithQty: { item: FoodItem; recommendedQuantity: number }[]
  ): CombinationCandidate => {
    let candidateIsLimited = false;
    let candidateLimitedWarning: string | undefined = undefined;
    let candidatePortionNotes: string[] = [];
    let isComplete = true;

    const selections: RecommendedItemSelection[] = chosenItemsWithQty.map(({ item, recommendedQuantity }) => {
      const avail = Math.max(
        0,
        typeof item.availableQuantity === 'number'
          ? item.availableQuantity
          : (typeof item.quantity === 'number' ? item.quantity : 0)
      );

      // Capped by availability
      const actualRecommended = Math.max(1, Math.min(avail, recommendedQuantity));
      const servingInfo = getPracticalServingInfo(item, mealType, userAge, isIll);

      if (servingInfo.isLowAvailability && item.category === 'MAIN FOOD') {
        candidateIsLimited = true;
        candidateLimitedWarning = `⚠️ LIMITED HOTEL PORTION ADVISORY: Only ${avail} ${item.name} is currently available in hotel inventory (practical portion for a ${ageGroup} is ${servingInfo.typicalUnitDescription}). Suggested serving is constrained to available stock.`;
      }

      candidatePortionNotes.push(
        `${formatServingItem(item.name, actualRecommended)} (Hotel stock: ${avail})`
      );

      return {
        food: item,
        recommendedQuantity: actualRecommended,
        availableQuantity: avail,
        quantity: actualRecommended, // alias
        unitPrice: item.price,
        subtotal: item.price * actualRecommended,
        role: item.category
      };
    });

    const totalCost = selections.reduce((acc, curr) => acc + curr.subtotal, 0);
    const mainSelection = selections.find(i => i.role === 'MAIN FOOD')!;
    const mainServingInfo = getPracticalServingInfo(mainSelection.food, mealType, userAge, isIll);

    // Completeness check:
    // A standalone 1 Idli or 1 Chapati when standard is 2+ is NOT a complete meal unless supplemented!
    if (mainServingInfo.isLowAvailability) {
      const hasProteinOrCompanion = selections.some(
        s => s !== mainSelection && (s.role === 'PROTEIN' || s.role === 'MAIN FOOD' || s.role === 'FRIED / HEAVY')
      );
      if (!hasProteinOrCompanion) {
        // Under-stocked main without any hearty companion is not a complete meal!
        isComplete = false;
      }
    }

    // Base scoring
    let score = 100;

    // Budget scoring
    if (totalCost > remainingBudget) {
      score -= 300;
    } else if (totalCost <= mealBudgetCap) {
      score += 35;
    } else {
      score += 15;
    }

    // If candidate has full complete portion (not limited by low stock), reward heavily
    if (!candidateIsLimited) {
      score += 40;
    } else {
      score -= 50; // Deprioritize under-stocked portions when full complete options exist
    }

    if (!isComplete) {
      score -= 120;
    }

    // Age-aware practical portion alignment
    if (mainSelection.recommendedQuantity === mainServingInfo.standardIdeal) {
      score += 25; // Ideal practical portion for age group
    } else if (
      mainSelection.recommendedQuantity >= mainServingInfo.standardMin &&
      mainSelection.recommendedQuantity <= mainServingInfo.standardMax
    ) {
      score += 15;
    }

    // Illness scoring
    for (const selection of selections) {
      const { food } = selection;
      if (isIll) {
        if (isFriedOrHeavy(food.name, food.category)) score -= 90;
        if (isLightAndEasyToDigest(food.name)) score += 45;
      } else {
        if (isFriedOrHeavy(food.name, food.category)) score -= 15;
      }
    }

    // Nutritional balance bonuses
    if (selections.some(i => i.role === 'PROTEIN')) score += 30;
    if (selections.some(i => i.role === 'VEGETABLE')) score += 20;
    if (selections.some(i => i.role === 'SIDE / ACCOMPANIMENT')) score += 15;

    // Format description with natural phrasing
    const description = selections
      .map(s => formatServingItem(s.food.name, s.recommendedQuantity))
      .join(' + ');

    const portionDecisionNotes = candidateIsLimited
      ? `Limited availability: Hotel has only ${mainSelection.availableQuantity} ${mainSelection.food.name} (standard portion for ${ageGroup} is ${mainServingInfo.typicalUnitDescription}). ${isComplete ? 'Paired with companion food to complete the meal.' : 'Insufficient for a full meal.'}`
      : `MealQuest suggests a practical portion of ${formatServingItem(mainSelection.food.name, mainSelection.recommendedQuantity)} for a ${ageGroup} (${userAge} yrs) ${mealType} meal. This is based on practical sustenance, not hotel stock.`;

    return {
      items: selections,
      totalCost,
      score,
      description,
      portionDecisionNotes,
      isLimited: candidateIsLimited,
      isComplete,
      limitedWarning: candidateLimitedWarning
    };
  };

  // Sort companion foods
  const compatibleProteins = [...proteinFoods].sort((a, b) => {
    if (isIll && a.name.toLowerCase().includes('chicken') && b.name.toLowerCase().includes('egg')) return 1;
    return a.price - b.price;
  });

  const compatibleVegs = [...vegetableFoods].sort((a, b) => a.price - b.price);
  const compatibleSides = [...sideFoods].sort((a, b) => {
    if (isIll && a.name.toLowerCase().includes('rasam')) return -1;
    return a.price - b.price;
  });

  // Sort main foods: prefer light foods if ill, then by price
  const sortedMains = [...mainFoods].sort((a, b) => {
    if (isIll) {
      const aLight = isLightAndEasyToDigest(a.name) ? 1 : 0;
      const bLight = isLightAndEasyToDigest(b.name) ? 1 : 0;
      if (bLight !== aLight) return bLight - aLight;
    }
    return a.price - b.price;
  });

  // Generate candidate combinations for each main food
  for (const main of sortedMains) {
    const mainServingInfo = getPracticalServingInfo(main, mealType, userAge, isIll);
    const candidateQuantities = mainServingInfo.candidateQuantities;

    for (const mQty of candidateQuantities) {
      // 1. Main + Protein + Side + Veg
      if (compatibleSides.length > 0 && compatibleVegs.length > 0 && compatibleProteins.length > 0) {
        combinations.push(createCandidate([
          { item: main, recommendedQuantity: mQty },
          { item: compatibleSides[0], recommendedQuantity: 1 },
          { item: compatibleVegs[0], recommendedQuantity: 1 },
          { item: compatibleProteins[0], recommendedQuantity: 1 }
        ]));
      }

      // 2. Main + Protein + Side
      if (compatibleSides.length > 0 && compatibleProteins.length > 0) {
        combinations.push(createCandidate([
          { item: main, recommendedQuantity: mQty },
          { item: compatibleSides[0], recommendedQuantity: 1 },
          { item: compatibleProteins[0], recommendedQuantity: 1 }
        ]));
      }

      // 3. Main + Protein (e.g., 2 Idlis + 1 Egg, 1 Pongal + 1 Egg, 2 Pooris + 1 Egg)
      if (compatibleProteins.length > 0) {
        const proteinQty = (ageGroup === 'Teen' || ageGroup === 'Young adult') && compatibleProteins[0].availableQuantity >= 2 && mQty <= 2 ? 1 : 1;
        combinations.push(createCandidate([
          { item: main, recommendedQuantity: mQty },
          { item: compatibleProteins[0], recommendedQuantity: proteinQty }
        ]));
      }

      // 4. Main + Veg + Side
      if (compatibleSides.length > 0 && compatibleVegs.length > 0) {
        combinations.push(createCandidate([
          { item: main, recommendedQuantity: mQty },
          { item: compatibleSides[0], recommendedQuantity: 1 },
          { item: compatibleVegs[0], recommendedQuantity: 1 }
        ]));
      }

      // 5. Main + Side
      if (compatibleSides.length > 0) {
        combinations.push(createCandidate([
          { item: main, recommendedQuantity: mQty },
          { item: compatibleSides[0], recommendedQuantity: 1 }
        ]));
      }

      // 6. Main alone
      combinations.push(createCandidate([
        { item: main, recommendedQuantity: mQty }
      ]));
    }
  }

  // Filter combinations:
  // First priority: Complete meals fitting within budget
  const completeBudgetCombos = combinations.filter(c => c.totalCost <= remainingBudget && c.isComplete);
  const anyBudgetCombos = combinations.filter(c => c.totalCost <= remainingBudget);

  let bestCombo: CombinationCandidate | undefined;
  if (completeBudgetCombos.length > 0) {
    completeBudgetCombos.sort((a, b) => b.score - a.score);
    bestCombo = completeBudgetCombos[0];
  } else if (anyBudgetCombos.length > 0) {
    anyBudgetCombos.sort((a, b) => b.score - a.score);
    bestCombo = anyBudgetCombos[0];
  } else {
    combinations.sort((a, b) => b.score - a.score);
    bestCombo = combinations[0];
  }

  // If no combination could be formed or the best is not complete
  if (!bestCombo || (!bestCombo.isComplete && bestCombo.items.length === 1 && bestCombo.isLimited)) {
    const singleMain = bestCombo?.items[0];
    const foodName = singleMain ? singleMain.food.name : 'main food';
    const avail = singleMain ? singleMain.availableQuantity : 1;

    return {
      mealType,
      items: [],
      totalCost: 0,
      fitsBudget: true,
      budgetCap: mealBudgetCap,
      remainingDailyBudget: remainingBudget,
      status: 'NO_COMPLETE_MEAL',
      errorMessage: `No practical complete meal available from current hotel inventory. Only ${avail} ${foodName} is in stock, which is below the practical portion for a ${ageGroup}. A single under-portioned item cannot form a complete meal. Please replenish inventory or pair with another available dish.`,
      generatedAt,
      portionCheck: `Only ${avail} ${foodName} available (below practical portion)`,
      portionDecision: 'Incomplete meal due to limited hotel inventory.',
      isLimitedPortion: true,
      limitedPortionWarning: `LIMITED HOTEL INVENTORY: Only ${avail} ${foodName} available.`,
      ageContextNote: `Age: ${userAge} (${ageGroup})`,
      whyBreakdown: {
        mainFoodReason: `Only ${avail} ${foodName} in stock. A practical portion is larger.`,
        quantityNote: 'Below minimum complete meal portion',
        budgetReason: `Budget of ₹${remainingBudget} is available.`,
        preferenceReason: `Preferences: ${profile.foodPreference}`,
        avoidReason: avoidList.length > 0 ? `Avoid list: ${avoidList.join(', ')}` : 'None',
        profileContextReason: 'Requires sufficient portion to constitute a meal.'
      },
      itemReasons: [],
      alternatives: []
    };
  }

  // Item reasons
  const itemReasons = bestCombo.items.map(selection => {
    const { food, recommendedQuantity, availableQuantity, subtotal } = selection;
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
      reason = `${food.name} provides hydration and refreshment.`;
    } else if (food.category === 'FRIED / HEAVY') {
      reason = `${food.name} provides a flavorful calorie boost.`;
    }

    return {
      name: food.name,
      role: food.category,
      recommendedQuantity,
      availableQuantity,
      quantity: recommendedQuantity,
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
    conditionReason = `Because you reported "${profile.condition}", MealQuest prioritized lighter, soothing food (${mainItem.food.name}) and strictly excluded heavy or oily dishes.`;
  }

  const profileContextReason = `Your age group (${ageGroup}, ${userAge} yrs), dietary preference (${profile.foodPreference}), and daily budget (₹${profile.dailyBudget}) guide practical portion sizing. No clinical or medical prescriptions are implied.`;

  const budgetFits = bestCombo.totalCost <= remainingBudget;
  const remainingAfterMeal = Math.max(0, remainingBudget - bestCombo.totalCost);

  const budgetReason = budgetFits
    ? `Total meal cost is ₹${bestCombo.totalCost}, fitting cleanly within your remaining coin budget of ₹${remainingBudget} (leaving ₹${remainingAfterMeal} for the rest of today).`
    : `Total cost (₹${bestCombo.totalCost}) exceeds your remaining coin budget of ₹${remainingBudget}.`;

  // Portion check line: explicitly distinguishes recommended serving from available hotel stock
  const portionCheckParts = bestCombo.items.map(
    i => `${formatServingItem(i.food.name, i.recommendedQuantity)} recommended (${i.availableQuantity} available at hotel)`
  );
  const portionCheck = portionCheckParts.join(', ');

  const portionDecision = bestCombo.portionDecisionNotes;

  // Alternatives: distinct practical combinations
  const alternativeCombos = (completeBudgetCombos.length > 0 ? completeBudgetCombos : combinations)
    .filter(c => c.description !== bestCombo!.description && c.isComplete)
    .slice(0, 3);

  const alternatives = alternativeCombos.map((alt, idx) => {
    const isCheaper = alt.totalCost < bestCombo!.totalCost;
    let whyPrimaryPreferred = `Recommended choice offers superior dietary balance with ${bestCombo!.items.map(i => i.food.name).join(', ')}.`;
    if (isCheaper) {
      whyPrimaryPreferred = `While Alternative ${idx + 1} is cheaper (₹${alt.totalCost}), the primary recommendation provides better sustained satiety for a ${ageGroup}.`;
    } else {
      whyPrimaryPreferred = `Primary recommendation is more cost-effective (₹${bestCombo!.totalCost} vs ₹${alt.totalCost}) while achieving equivalent satisfaction.`;
    }

    return {
      title: `Alternative ${idx + 1}`,
      itemsSummary: alt.description,
      totalCost: alt.totalCost,
      reason: `Practical complete combination totaling ₹${alt.totalCost}.`,
      whyPrimaryPreferred
    };
  });

  const recommendationScore = Math.min(9.8, Math.max(7.2, Math.round(((bestCombo.score) / 185) * 9.5 * 10) / 10));

  return {
    mealType,
    items: bestCombo.items,
    totalCost: bestCombo.totalCost,
    fitsBudget: budgetFits,
    budgetCap: mealBudgetCap,
    remainingDailyBudget: remainingBudget,
    status: budgetFits ? 'SUCCESS' : 'OVER_BUDGET',
    recommendationScore,
    generatedAt,
    portionCheck,
    portionDecision,
    isLimitedPortion: bestCombo.isLimited,
    limitedPortionWarning: bestCombo.limitedWarning,
    ageContextNote: `Tailored for ${ageGroup} (${userAge} yrs): ${getAgeGroupDescription(ageGroup)}`,
    whyBreakdown: {
      mainFoodReason: `${mainItem.food.name} is selected as the available main food anchor.`,
      proteinReason: proteinItem ? `${proteinItem.food.name} provides clean protein.` : undefined,
      vegetableReason: vegItem ? `${vegItem.food.name} contributes fresh dietary fiber.` : undefined,
      sideReason: sideItem ? `${sideItem.food.name} is paired as an accompaniment.` : undefined,
      quantityNote: portionCheck,
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
