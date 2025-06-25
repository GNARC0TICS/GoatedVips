/**
 * Centralized tier data definitions for the GoatedVIPs platform
 * 
 * This file serves as the single source of truth for all tier-related data
 * including thresholds, benefits, visual attributes, and level definitions.
 */

import { 
  TrendingUp, 
  Award, 
  Crown, 
  Diamond, 
  Star, 
  Zap, 
  Trophy 
} from "lucide-react";

// Types for level structure
export interface TierLevel {
  level: string;
  xpRequired: string;
  numericXpRequired: number; // Added for calculations
}

// Full tier definition structure
export interface TierDefinition {
  key: string;           // Lowercase key for object mapping (e.g., "bronze")
  name: string;          // Display name (e.g., "BRONZE" or "Bronze")
  color: string;         // Text color class
  colorClass: string;    // Base color name for Tailwind
  hexColor: string;      // Hex color code
  icon: typeof TrendingUp | string; // Either component or image path
  iconPath: string;      // Path to the tier emblem image
  minWager: number;      // Minimum wager for this tier
  maxWager: number | null; // Maximum wager for this tier (or null for highest tier)
  benefits: string[];    // List of benefits this tier provides
  levels: TierLevel[];   // Array of levels within this tier
  
  // Optional visual enhancement properties
  glassGradient?: string;
  backgroundPattern?: string;
  accentGradient?: string;
  animationPreset?: string;
  shadowColor?: string;
}

/**
 * The master tier definitions array containing all tier data
 */
export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    key: "copper",
    name: "COPPER",
    color: "text-amber-900",
    colorClass: "amber",
    hexColor: "#78350F",
    icon: TrendingUp,
    iconPath: "/images/Goated Emblems/copper.548d79cf.svg",
    minWager: 0,
    maxWager: 999,
    benefits: [],
    levels: [
      { level: "Copper 1", xpRequired: "0", numericXpRequired: 0 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(120, 53, 15, 0.15), rgba(120, 53, 15, 0.1))",
    backgroundPattern: "/images/patterns/copper-pattern.svg",
    accentGradient: "linear-gradient(135deg, #78350F, #92400E)",
    animationPreset: "copper",
    shadowColor: "rgba(120, 53, 15, 0.5)"
  },
  {
    key: "bronze",
    name: "BRONZE",
    color: "text-amber-600",
    colorClass: "amber",
    hexColor: "#D97706",
    icon: TrendingUp,
    iconPath: "/images/Goated Emblems/bronze.e6ea941b.svg",
    minWager: 1000,
    maxWager: 9999,
    benefits: [
      "Instant Rakeback",
      "Level Up Bonus",
      "Weekly Bonus"
    ],
    levels: [
      { level: "Bronze 1", xpRequired: "1,000", numericXpRequired: 1000 },
      { level: "Bronze 2", xpRequired: "2,000", numericXpRequired: 2000 },
      { level: "Bronze 3", xpRequired: "3,000", numericXpRequired: 3000 },
      { level: "Bronze 4", xpRequired: "4,000", numericXpRequired: 4000 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(180, 83, 9, 0.1))",
    backgroundPattern: "/images/patterns/bronze-pattern.svg",
    accentGradient: "linear-gradient(135deg, #D97706, #92400E)",
    animationPreset: "bronze",
    shadowColor: "rgba(217, 119, 6, 0.5)"
  },
  {
    key: "silver",
    name: "SILVER",
    color: "text-slate-400",
    colorClass: "slate",
    hexColor: "#94A3B8",
    icon: Star,
    iconPath: "/images/Goated Emblems/silver.8e3ec67f.svg",
    minWager: 10000,
    maxWager: 99999,
    benefits: [
      "All Bronze benefits",
      "Monthly Bonus",
      "Bonus Increase"
    ],
    levels: [
      { level: "Silver 1", xpRequired: "10,000", numericXpRequired: 10000 },
      { level: "Silver 2", xpRequired: "20,000", numericXpRequired: 20000 },
      { level: "Silver 3", xpRequired: "30,000", numericXpRequired: 30000 },
      { level: "Silver 4", xpRequired: "40,000", numericXpRequired: 40000 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(148, 163, 184, 0.15), rgba(100, 116, 139, 0.1))",
    backgroundPattern: "/images/patterns/silver-pattern.svg",
    accentGradient: "linear-gradient(135deg, #94A3B8, #64748B)",
    animationPreset: "silver",
    shadowColor: "rgba(148, 163, 184, 0.5)"
  },
  {
    key: "gold",
    name: "GOLD",
    color: "text-yellow-500",
    colorClass: "yellow",
    hexColor: "#EAB308",
    icon: Award,
    iconPath: "/images/Goated Emblems/gold.1c810178.svg",
    minWager: 100000,
    maxWager: 449999,
    benefits: [
      "All Silver benefits",
      "Referral Increase",
      "Loss Back Bonus"
    ],
    levels: [
      { level: "Gold 1", xpRequired: "100,000", numericXpRequired: 100000 },
      { level: "Gold 2", xpRequired: "150,000", numericXpRequired: 150000 },
      { level: "Gold 3", xpRequired: "200,000", numericXpRequired: 200000 },
      { level: "Gold 4", xpRequired: "250,000", numericXpRequired: 250000 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.1))",
    backgroundPattern: "/images/patterns/gold-pattern.svg",
    accentGradient: "linear-gradient(135deg, #EAB308, #CA8A04)",
    animationPreset: "gold",
    shadowColor: "rgba(234, 179, 8, 0.5)"
  },
  {
    key: "platinum",
    name: "PLATINUM",
    color: "text-blue-400",
    colorClass: "blue",
    hexColor: "#60A5FA",
    icon: Trophy,
    iconPath: "/images/Goated Emblems/platinum.d258f583.svg",
    minWager: 450000,
    maxWager: 1499999,
    benefits: [
      "All Gold benefits",
      "Higher bonuses",
      "Premium rewards"
    ],
    levels: [
      { level: "Platinum 1", xpRequired: "450,000", numericXpRequired: 450000 },
      { level: "Platinum 2", xpRequired: "600,000", numericXpRequired: 600000 },
      { level: "Platinum 3", xpRequired: "750,000", numericXpRequired: 750000 },
      { level: "Platinum 4", xpRequired: "900,000", numericXpRequired: 900000 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(59, 130, 246, 0.1))",
    backgroundPattern: "/images/patterns/platinum-pattern.svg",
    accentGradient: "linear-gradient(135deg, #60A5FA, #3B82F6)",
    animationPreset: "platinum",
    shadowColor: "rgba(96, 165, 250, 0.5)"
  },
  {
    key: "pearl",
    name: "PEARL",
    color: "text-cyan-400",
    colorClass: "cyan",
    hexColor: "#22D3EE",
    icon: Diamond,
    iconPath: "/images/Goated Emblems/pearl.1815809f.svg",
    minWager: 1500000,
    maxWager: 2999999,
    benefits: [
      "All Platinum benefits",
      "VIP Host"
    ],
    levels: [
      { level: "Pearl 1", xpRequired: "1,500,000", numericXpRequired: 1500000 },
      { level: "Pearl 2", xpRequired: "1,650,000", numericXpRequired: 1650000 },
      { level: "Pearl 3", xpRequired: "1,800,000", numericXpRequired: 1800000 },
      { level: "Pearl 4", xpRequired: "2,000,000", numericXpRequired: 2000000 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(6, 182, 212, 0.1))",
    backgroundPattern: "/images/patterns/pearl-pattern.svg",
    accentGradient: "linear-gradient(135deg, #22D3EE, #06B6D4)",
    animationPreset: "pearl",
    shadowColor: "rgba(34, 211, 238, 0.5)"
  },
  {
    key: "sapphire",
    name: "SAPPHIRE",
    color: "text-purple-500",
    colorClass: "purple",
    hexColor: "#A855F7",
    icon: Crown,
    iconPath: "/images/Goated Emblems/sapphire.91e6756b.svg",
    minWager: 3000000,
    maxWager: 6999999,
    benefits: [
      "All Pearl benefits",
      "Elite VIP events",
      "Highest cashback rates"
    ],
    levels: [
      { level: "Sapphire 1", xpRequired: "3,000,000", numericXpRequired: 3000000 },
      { level: "Sapphire 2", xpRequired: "3,750,000", numericXpRequired: 3750000 },
      { level: "Sapphire 3", xpRequired: "4,500,000", numericXpRequired: 4500000 },
      { level: "Sapphire 4", xpRequired: "5,250,000", numericXpRequired: 5250000 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(126, 34, 206, 0.1))",
    backgroundPattern: "/images/patterns/sapphire-pattern.svg",
    accentGradient: "linear-gradient(135deg, #A855F7, #7E22CE)",
    animationPreset: "sapphire",
    shadowColor: "rgba(168, 85, 247, 0.5)"
  },
  {
    key: "emerald",
    name: "EMERALD",
    color: "text-green-500",
    colorClass: "green",
    hexColor: "#22C55E",
    icon: Crown,
    iconPath: "/images/Goated Emblems/emerald.46bd38eb.svg",
    minWager: 7000000,
    maxWager: 19999999,
    benefits: [
      "All Sapphire benefits",
      "Goated Event Invitations",
      "Tailor-made promotions"
    ],
    levels: [
      { level: "Emerald 1", xpRequired: "7,000,000", numericXpRequired: 7000000 },
      { level: "Emerald 2", xpRequired: "9,000,000", numericXpRequired: 9000000 },
      { level: "Emerald 3", xpRequired: "11,000,000", numericXpRequired: 11000000 },
      { level: "Emerald 4", xpRequired: "13,000,000", numericXpRequired: 13000000 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))",
    backgroundPattern: "/images/patterns/emerald-pattern.svg",
    accentGradient: "linear-gradient(135deg, #22C55E, #16A34A)",
    animationPreset: "emerald",
    shadowColor: "rgba(34, 197, 94, 0.5)"
  },
  {
    key: "diamond",
    name: "DIAMOND",
    color: "text-rose-500",
    colorClass: "rose",
    hexColor: "#F43F5E",
    icon: Zap,
    iconPath: "/images/Goated Emblems/diamond.ddf47a1e.svg",
    minWager: 20000000,
    maxWager: null,
    benefits: [
      "All Emerald benefits",
      "Unlimited privileges"
    ],
    levels: [
      { level: "Diamond 1", xpRequired: "20,000,000", numericXpRequired: 20000000 },
      { level: "Diamond 2", xpRequired: "25,000,000", numericXpRequired: 25000000 },
      { level: "Diamond 3", xpRequired: "30,000,000", numericXpRequired: 30000000 },
      { level: "Diamond 4", xpRequired: "35,000,000", numericXpRequired: 35000000 }
    ],
    glassGradient: "linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(225, 29, 72, 0.1))",
    backgroundPattern: "/images/patterns/diamond-pattern.svg",
    accentGradient: "linear-gradient(135deg, #F43F5E, #E11D48)",
    animationPreset: "diamond",
    shadowColor: "rgba(244, 63, 94, 0.5)"
  }
];

/**
 * Creates an object-based tier mapping for tier-utils.ts compatibility
 * Maps tier keys to their definitions for quick lookup
 */
export const TIERS_BY_KEY: Record<string, TierDefinition> = TIER_DEFINITIONS.reduce((acc, tier) => {
  acc[tier.key] = tier;
  return acc;
}, {} as Record<string, TierDefinition>);

/**
 * Returns the array format needed for VipProgram.tsx
 * This maintains compatibility with the existing component
 */
export const TIERS_ARRAY = TIER_DEFINITIONS.map(tier => ({
  name: tier.name,
  icon: tier.iconPath,
  levels: tier.levels.map(level => ({
    level: level.level,
    xpRequired: level.xpRequired
  }))
}));

/**
 * Helper functions
 */

/**
 * Get tier info by tier key
 */
export function getTierByKey(key: string): TierDefinition | undefined {
  return TIERS_BY_KEY[key];
}

/**
 * Get tier based on wager amount
 */
export function getTierFromWager(totalWager: number): TierDefinition {
  for (let i = TIER_DEFINITIONS.length - 1; i >= 0; i--) {
    if (totalWager >= TIER_DEFINITIONS[i].minWager) {
      return TIER_DEFINITIONS[i];
    }
  }
  // Default to lowest tier
  return TIER_DEFINITIONS[0];
}

/**
 * Get tier key based on wager amount
 */
export function getTierKeyFromWager(totalWager: number): string {
  return getTierFromWager(totalWager).key;
}

/**
 * Function to get next tier info
 */
export function getNextTierInfo(currentTier: string | number): TierDefinition | null {
  // If passed a number (totalWager), convert to tier
  const tier = typeof currentTier === 'number' 
    ? getTierFromWager(currentTier) 
    : TIERS_BY_KEY[currentTier];
    
  if (!tier) return null;
  
  // Find current tier index
  const currentIndex = TIER_DEFINITIONS.findIndex(t => t.key === tier.key);
  
  // If highest tier or not found, return null
  if (currentIndex === -1 || currentIndex === TIER_DEFINITIONS.length - 1) {
    return null;
  }
  
  // Return next tier
  return TIER_DEFINITIONS[currentIndex + 1];
}

/**
 * Calculate the progress to the next tier
 */
export function getNextTierProgress(totalWager: number): number {
  const currentTierKey = getTierKeyFromWager(totalWager);
  const currentTier = TIERS_BY_KEY[currentTierKey];
  
  // If already at highest tier, return 1 (100%)
  const nextTier = getNextTierInfo(currentTierKey);
  if (!nextTier) {
    return 1;
  }
  
  // Calculate progress within the current tier
  const progressInTier = totalWager - currentTier.minWager;
  const tierRange = nextTier.minWager - currentTier.minWager;
  
  return Math.min(progressInTier / tierRange, 1);
}

/**
 * Calculate the progress percentage to the next tier
 */
export function getTierProgressPercentage(totalWager: number): number {
  return Math.floor(getNextTierProgress(totalWager) * 100);
}
