import { FoodCategory } from '../types';

// Normalized classification dictionaries
const MAIN_FOOD_KEYWORDS = [
  'rice', 'dosa', 'dosai', 'idli', 'idly', 'chapati', 'chapatti', 'roti',
  'parotta', 'paratha', 'pongal', 'upma', 'poori', 'puri', 'bread',
  'noodles', 'naan', 'biryani', 'biriyani', 'pulao', 'fried rice',
  'appam', 'puttu', 'kulcha', 'oats', 'pasta', 'sandwich', 'khichdi',
  'phulka', 'bhature', 'meals', 'thali', 'maggi', 'sevai', 'idiyappam',
  'paniyaram', 'kuzhi paniyaram', 'uttapam', 'uthappam'
];

const PROTEIN_KEYWORDS = [
  'egg', 'chicken', 'fish', 'mutton', 'paneer', 'tofu', 'chickpeas',
  'chana', 'soya', 'soy', 'prawn', 'prawns', 'beef', 'pork', 'lamb',
  'dal', 'daal', 'lentil', 'lentils', 'rajma', 'sprouts', 'meat',
  'crab', 'seafood', 'keema'
];

const VEGETABLE_KEYWORDS = [
  'vegetable curry', 'veg curry', 'poriyal', 'vegetable', 'vegetables', 'veg', 'salad', 'keerai',
  'spinach', 'kootu', 'gobi', 'cauliflower', 'bhindi', 'okra',
  'cabbage', 'carrot', 'beans', 'palak', 'avial', 'subzi', 'sabzi',
  'beetroot', 'cucumber', 'brinjal', 'baingan', 'capsicum', 'mushroom',
  'aloo gobi', 'mixed veg'
];

const SIDE_KEYWORDS = [
  'sambar', 'sambhar', 'curd', 'yogurt', 'raita', 'chutney', 'rasam',
  'gravy', 'curry', 'salna', 'kurma', 'pickle', 'thuvaiyal', 'dip', 'sauce',
  'soup', 'buttermilk'
];

const DRINK_KEYWORDS = [
  'tea', 'coffee', 'juice', 'water', 'lassi', 'milk', 'badam milk',
  'soda', 'beverage', 'chai'
];

const FRIED_HEAVY_KEYWORDS = [
  'vada', 'vadai', 'fried chicken', 'chicken 65', 'pakoda', 'pakora',
  'bajji', 'bhajji', 'samosa', 'bonda', 'french fries', 'cutlet',
  'deep fried', 'crispy', 'spring roll', 'murukku'
];

const NON_VEG_KEYWORDS = [
  'egg', 'chicken', 'fish', 'mutton', 'meat', 'prawn', 'prawns',
  'beef', 'pork', 'lamb', 'crab', 'seafood', 'bacon', 'ham'
];

const LIGHT_EASY_DIGEST_KEYWORDS = [
  'idli', 'idly', 'pongal', 'khichdi', 'rice', 'rasam', 'curd',
  'poriyal', 'boiled', 'tea', 'soup', 'steamed', 'oats', 'bread',
  'dosa', 'dosai', 'chapati', 'chapatti', 'phulka'
];

export function detectFoodCategory(foodName: string): FoodCategory {
  const lower = foodName.toLowerCase().trim();

  // Check fried/heavy first if specific name mentions fried
  if (lower.includes('fried chicken') || lower.includes('chicken 65')) {
    return 'FRIED / HEAVY';
  }
  for (const keyword of FRIED_HEAVY_KEYWORDS) {
    if (lower.includes(keyword)) return 'FRIED / HEAVY';
  }

  // Check Main foods
  for (const keyword of MAIN_FOOD_KEYWORDS) {
    if (lower.includes(keyword)) return 'MAIN FOOD';
  }

  // Check Protein
  for (const keyword of PROTEIN_KEYWORDS) {
    if (lower.includes(keyword)) return 'PROTEIN';
  }

  // Check Vegetables
  for (const keyword of VEGETABLE_KEYWORDS) {
    if (lower.includes(keyword)) return 'VEGETABLE';
  }

  // Check Sides
  for (const keyword of SIDE_KEYWORDS) {
    if (lower.includes(keyword)) return 'SIDE / ACCOMPANIMENT';
  }

  // Check Drinks
  for (const keyword of DRINK_KEYWORDS) {
    if (lower.includes(keyword)) return 'DRINK';
  }

  // Default fallback if unknown: SIDE / ACCOMPANIMENT
  return 'SIDE / ACCOMPANIMENT';
}

export function isNonVegetarian(foodName: string): boolean {
  const lower = foodName.toLowerCase();
  return NON_VEG_KEYWORDS.some(keyword => {
    // Word boundary or containment check
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lower) || lower.includes(keyword);
  });
}

export function isFriedOrHeavy(foodName: string, category?: FoodCategory): boolean {
  if (category === 'FRIED / HEAVY') return true;
  const lower = foodName.toLowerCase();
  return FRIED_HEAVY_KEYWORDS.some(k => lower.includes(k));
}

export function isLightAndEasyToDigest(foodName: string): boolean {
  const lower = foodName.toLowerCase();
  return LIGHT_EASY_DIGEST_KEYWORDS.some(k => lower.includes(k));
}
