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
    'Fun / fictional comparison: Fictional strength references are for entertainment and RPG roleplay only. They are not medical, clinical, or scientific measurements.';

  if (!text) {
    return {
      title: 'Novice Adventurer',
      universe: 'Mortal Realm',
      estimatedAura: '100 / 10,000 Energy Units',
      tier: 'Apprentice Tier (F)',
      rpgTitle: 'Wandering Nomad',
      funMealAdvice: 'Every grand saga begins with a wholesome meal. Grab some carbs and protein to begin building your power base!',
      icon: '🛡️',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Sukuna / Jujutsu Kaisen
  if (lower.includes('sukuna') || lower.includes('jujutsu') || lower.includes('cursed')) {
    // Extract fingers if any (e.g., "8 sukuna fingers", "20 fingers")
    const fingerMatch = lower.match(/(\d+)\s*(?:of\s*)?sukuna\s*finger/i) || lower.match(/sukuna.*?(\d+)\s*finger/i);
    const fingerCount = fingerMatch ? parseInt(fingerMatch[1], 10) : 8;
    const percentage = Math.min(100, Math.round((fingerCount / 20) * 100));

    return {
      title: `${fingerCount}-Finger Sukuna Vessel`,
      universe: 'Jujutsu Kaisen',
      estimatedAura: `${(fingerCount * 1250).toLocaleString()} / 25,000 Cursed Energy Units (${percentage}% True Calamity)`,
      tier: fingerCount >= 15 ? 'Special Grade Disaster Tier (SSS)' : fingerCount >= 5 ? 'Special Grade Vessel (S)' : 'Semi-Grade 1 Sorcerer (A)',
      rpgTitle: 'King of Curses Contender',
      funMealAdvice: `Containing the malevolent soul of Ryomen Sukuna across ${fingerCount} fingers burns tremendous caloric stamina! You must secure hearty main course staples (rice or dosa) plus substantial protein to keep your mortal vessel grounded.`,
      icon: '👹',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Gojo Satoru
  if (lower.includes('gojo') || lower.includes('limitless') || lower.includes('six eyes')) {
    return {
      title: 'The Honored One (Limitless Awakened)',
      universe: 'Jujutsu Kaisen',
      estimatedAura: 'Infinity ∞ / 10,000 Cursed Units',
      tier: 'Apex Transcendence (EX)',
      rpgTitle: 'Domain Expansion Master',
      funMealAdvice: 'Operating the Six Eyes consumes rapid glucose and mental focus. While Satoru loves high-sugar sweets, a balanced savory meal with clean protein will keep your limitless barrier effortlessly active!',
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
      estimatedAura: '9,000+ Power Level (Scouter Shattered!)',
      tier: 'Galactic Champion Tier (SS)',
      rpgTitle: 'Saiyan Martial Legend',
      funMealAdvice: 'Saiyans eat colossal portions to sustain planetary-level combat! Since you eat outside at the hotel, make sure to maximize your quantity of wholesome main staples and eggs without blowing your daily coin pouch.',
      icon: '⚡',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Hulk / Bruce Banner
  if (lower.includes('hulk') || lower.includes('smash') || lower.includes('gamma')) {
    return {
      title: 'Gamma-Powered Behemoth',
      universe: 'Marvel Universe',
      estimatedAura: 'Maximum Rage / Planetary Impact Tier',
      tier: 'Titan Class World Breaker (S+)',
      rpgTitle: 'Unstoppable Avenger',
      funMealAdvice: 'Hulk smash, but Hulk also needs nutrients! High-density meals with solid carbs and clean protein prevent irritability and hunger swings so you stay in control.',
      icon: '💥',
      disclaimer: standardDisclaimer
    };
  }

  // Check for Saitama / One Punch Man
  if (lower.includes('saitama') || lower.includes('one punch') || lower.includes('one-punch')) {
    return {
      title: 'Limiter Breaker',
      universe: 'One Punch Man',
      estimatedAura: 'Incalculable Hero Output',
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
      estimatedAura: '9 Tails Chakra Cloak Active',
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
    estimatedAura: `${Math.min(9999, Math.max(1200, text.length * 150)).toLocaleString()} Epic Power Units`,
    tier: 'Heroic Vanguard (Class A)',
    rpgTitle: 'Awakened Challenger',
    funMealAdvice: `Drawing inspiration from "${text}", your warrior soul demands consistent meal balance: a dependable base (rice, dosa, chapati) accompanied by protein to power through your day!`,
    icon: '🔥',
    disclaimer: standardDisclaimer
  };
}
