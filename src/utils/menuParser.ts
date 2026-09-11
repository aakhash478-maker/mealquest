import { FoodCategory, FoodItem } from '../types';
import { detectFoodCategory } from './foodClassifier';

export interface ParsedMenuItem {
  id: string;
  name: string;
  price: number;
  category: FoodCategory;
  selected: boolean;
}

/**
 * Parse plain text, pasted lines, or transcriptions into structured menu items
 */
export function parseMenuText(rawText: string): ParsedMenuItem[] {
  if (!rawText || !rawText.trim()) return [];

  // Split lines by newline, semicolon, or bullet points
  const rawLines = rawText
    .split(/[\n;\r•|]+/)
    .map(line => line.trim())
    .filter(line => line.length > 1);

  const results: ParsedMenuItem[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // If line contains multiple comma-separated items like "Dosa 30 rupees, idli 10 rupees"
    const subSegments = line.split(/,\s*(?=[a-zA-Z])/);

    for (const segment of subSegments) {
      const parsed = parseSingleLine(segment, `item-${Date.now()}-${results.length}`);
      if (parsed) {
        results.push(parsed);
      }
    }
  }

  return results;
}

function parseSingleLine(line: string, id: string): ParsedMenuItem | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Patterns to extract price:
  // e.g. "Dosa - ₹30", "Dosa 30", "Idli: Rs 10", "Dosa 35 rupees", "₹40 Biryani"
  // Look for currency symbol or numbers
  const priceRegex = /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|inr|rupees|bucks)?/i;

  let price = 20; // default reasonable fallback
  let cleanName = trimmed;

  // Strip quantity prefix like "2 x Dosa" or "2 Dosa" to get clean dish name
  const qtyPrefixRegex = /^(\d+)\s*(?:x|\*|-)?\s+([a-zA-Z\s]+)/i;
  const qtyMatch = cleanName.match(qtyPrefixRegex);
  if (qtyMatch) {
    cleanName = cleanName.replace(qtyPrefixRegex, '$2');
  }

  // Find price occurrences
  // Match things like "- ₹30", ": 30", "Rs 35", "30 rupees", or trailing number
  const trailingPriceMatch = cleanName.match(/(?:[-:=]\s*)?(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|inr|rupees)?\s*$/i);
  const leadingPriceMatch = cleanName.match(/^(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:[-:=]\s*)?/i);

  if (trailingPriceMatch && trailingPriceMatch[1]) {
    price = parseFloat(trailingPriceMatch[1]);
    cleanName = cleanName.slice(0, trailingPriceMatch.index).trim();
  } else if (leadingPriceMatch && leadingPriceMatch[1]) {
    price = parseFloat(leadingPriceMatch[1]);
    cleanName = cleanName.slice(leadingPriceMatch[0].length).trim();
  } else {
    // Search any number in the string
    const anyNumberMatch = cleanName.match(/(\d+)/);
    if (anyNumberMatch) {
      price = parseFloat(anyNumberMatch[1]);
      cleanName = cleanName.replace(anyNumberMatch[0], '').trim();
    }
  }

  // Clean name of leftover punctuation and labels
  cleanName = cleanName
    .replace(/^[-•*–—:,\s]+|[-•*–—:,\s]+$/g, '')
    .replace(/^(item|dish|food|plate)\s+/i, '')
    .replace(/\s+(rupees|rs\.?|inr|only)$/i, '')
    .trim();

  // If cleanName is too short or empty, skip
  if (!cleanName || cleanName.length < 2) return null;

  // Capitalize properly
  const formattedName = cleanName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const category = detectFoodCategory(formattedName);

  return {
    id,
    name: formattedName,
    price: Math.max(0, price),
    category,
    selected: true
  };
}
