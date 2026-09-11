export interface PowerAnalysisResult {
  title: string;
  universe: string;
  estimatedAura: string;
  tier: string;
  rpgTitle: string;
  funMealAdvice: string;
  icon: string;
  disclaimer: string;
}

export function analyzeFunPower(powerText: string): PowerAnalysisResult {
  const text = (powerText || '').trim();
  const lower = text.toLowerCase();

  const standardDisclaimer =
    '🔥 FUN POWER REFERENCE — Recognized as: Fictional / Anime / Pop Culture reference. This is entertainment only and is not a scientific or medical measurement.';

  if (!text) {
    return {
      title: 'Novice Adventurer',
      universe: 'Mortal Realm',
      estimatedAura: 'Apprentice Adventurer Archetype (Fictional Lore)',
      tier: 'Apprentice Tier (F)',
      rpgTitle: 'Wandering Nomad',
      funMealAdvice: 'Every grand saga begins with a wholesome meal. Grab some carbs and protein to begin building your power base!',
      icon: '🛡️',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Sukuna / Jujutsu Kaisen
  if (lower.includes('sukuna') || lower.includes('jujutsu') || lower.includes('cursed')) {
    const fingerMatch = lower.match(/(\d+)\s*(?:of\s*)?sukuna\s*finger/i) || lower.match(/sukuna.*?(\d+)\s*finger/i);
    const fingerCount = fingerMatch ? parseInt(fingerMatch[1], 10) : 8;

    return {
      title: `${fingerCount}-Finger Sukuna Vessel`,
      universe: 'Jujutsu Kaisen',
      estimatedAura: `Special Grade Cursed Spirit Resonance (${fingerCount} of 20 Fingers Lore)`,
      tier: fingerCount >= 15 ? 'Special Grade Disaster Tier (SSS)' : fingerCount >= 5 ? 'Special Grade Vessel (S)' : 'Semi-Grade 1 Sorcerer (A)',
      rpgTitle: 'King of Curses Contender',
      funMealAdvice: `Containing the malevolent soul of Ryomen Sukuna across ${fingerCount} fingers burns tremendous stamina! Secure hearty main course staples (rice or dosa) plus substantial protein to keep your mortal vessel grounded.`,
      icon: '👹',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Gojo Satoru
  if (lower.includes('gojo') || lower.includes('limitless') || lower.includes('six eyes')) {
    return {
      title: 'The Honored One (Limitless Awakened)',
      universe: 'Jujutsu Kaisen',
      estimatedAura: 'Limitless Infinity Concept (Special Grade Sorcerer Lore)',
      tier: 'Apex Transcendence (EX)',
      rpgTitle: 'Domain Expansion Master',
      funMealAdvice: 'Operating the Six Eyes consumes rapid glucose and mental focus. A balanced savory meal with clean protein will keep your limitless barrier effortlessly active!',
      icon: '👁️',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Goku / Saiyan / Dragon Ball
  if (lower.includes('goku') || lower.includes('saiyan') || lower.includes('kakarot') || lower.includes('kamehameha')) {
    const isUltra = lower.includes('ultra') || lower.includes('instinct') || lower.includes('god');
    return {
      title: isUltra ? 'Ultra Instinct Saiyan Warrior' : 'Super Saiyan Destroyer',
      universe: 'Dragon Ball Z / Super',
      estimatedAura: 'Planetary Combat Legend (Saiyan Ki Lore)',
      tier: 'Galactic Champion Tier (SS)',
      rpgTitle: 'Saiyan Martial Legend',
      funMealAdvice: 'Saiyans eat colossal portions to sustain legendary combat! Since you eat outside at the hotel, make sure to maximize your quantity of wholesome main staples and eggs without blowing your daily coin pouch.',
      icon: '⚡',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Hulk / Bruce Banner
  if (lower.includes('hulk') || lower.includes('smash') || lower.includes('gamma')) {
    return {
      title: 'Gamma-Powered Behemoth',
      universe: 'Marvel Universe',
      estimatedAura: 'Unstoppable World Breaker Archetype (Comics Lore)',
      tier: 'Titan Class World Breaker (S+)',
      rpgTitle: 'Unstoppable Avenger',
      funMealAdvice: 'High-density meals with solid carbs and clean protein prevent irritability and hunger swings so you stay in calm control.',
      icon: '💥',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Saitama / One Punch Man
  if (lower.includes('saitama') || lower.includes('one punch') || lower.includes('one-punch')) {
    return {
      title: 'Limiter Breaker',
      universe: 'One Punch Man',
      estimatedAura: 'Shattered Limiter Archetype (Hero for Fun Lore)',
      tier: 'God Level Calamity Buster (EX)',
      rpgTitle: 'Bargain-Hunting Hero for Fun',
      funMealAdvice: 'Saitama strictly respects supermarket discount days and eats bananas/cabbage! Keeping meals affordable within your daily ₹ budget while staying fit is the ultimate path of true strength.',
      icon: '🥊',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Naruto
  if (lower.includes('naruto') || lower.includes('nine tails') || lower.includes('kurama') || lower.includes('hokage')) {
    return {
      title: 'Nine-Tails Jinchuriki',
      universe: 'Naruto Shippuden',
      estimatedAura: 'Kurama Chakra Resonance (Tailed Beast Lore)',
      tier: 'Sage of Six Paths Tier (S)',
      rpgTitle: 'Hidden Leaf Hokage',
      funMealAdvice: 'Even though Naruto dreams of Ichiraku ramen all day, a true shinobi balances their missions with real vegetable sides and egg/chicken protein.',
      icon: '🍥',
      disclaimer: standardDisclaimer
    };
  }

  // Generic pop culture / custom strength fallback
  return {
    title: `Champion of ${text.length > 25 ? text.slice(0, 25) + '...' : text}`,
    universe: 'Mythic Multiverse',
    estimatedAura: 'Heroic Pop Culture Inspiration (Fictional Lore)',
    tier: 'Heroic Vanguard (Class A)',
    rpgTitle: 'Awakened Challenger',
    funMealAdvice: `Drawing inspiration from "${text}", your warrior soul demands consistent meal balance: a dependable base (rice, dosa, chapati) accompanied by protein to power through your day!`,
    icon: '🔥',
    disclaimer: standardDisclaimer
  };
}
