import { 
  TrendingUp, 
  Award, 
  Crown, 
  Diamond, 
  Star, 
  Zap, 
  Trophy 
} from "lucide-react";

export type TierLevel = 
  | "bronze" 
  | "silver" 
  | "gold" 
  | "platinum" 
  | "diamond" 
  | "master" 
  | "legend";

export interface TierInfo {
  name: string;
  color: string;
  icon: typeof TrendingUp;
  minWager: number;
  maxWager: number | null;
  benefits: string[];
}

/**
 * Tier system configuration
 * Maps tier levels to their respective information based on the VIP Program
 */
export const TIERS: Record<TierLevel, TierInfo> = {
  bronze: {
    name: "Bronze",
    color: "text-amber-600",
    icon: TrendingUp,
    minWager: 1000,
    maxWager: 9999,
    benefits: [
      "Instant Rakeback",
      "Level Up Bonus",
      "Weekly Bonus"
    ]
  },
  silver: {
    name: "Silver",
    color: "text-slate-400",
    icon: Star,
    minWager: 10000,
    maxWager: 99999,
    benefits: [
      "All Bronze benefits",
      "Monthly Bonus",
      "Bonus Increase"
    ]
  },
  gold: {
    name: "Gold",
    color: "text-yellow-500",
    icon: Award,
    minWager: 100000,
    maxWager: 449999,
    benefits: [
      "All Silver benefits",
      "Referral Increase",
      "Loss Back Bonus"
    ]
  },
  platinum: {
    name: "Platinum",
    color: "text-blue-400",
    icon: Trophy,
    minWager: 450000,
    maxWager: 1499999,
    benefits: [
      "All Gold benefits",
      "Higher bonuses",
      "Premium rewards"
    ]
  },
  diamond: {
    name: "Diamond",
    color: "text-cyan-400",
    icon: Diamond,
    minWager: 1500000,
    maxWager: 2999999,
    benefits: [
      "All Platinum benefits",
      "VIP Host",
      "Exclusive perks"
    ]
  },
  master: {
    name: "Master",
    color: "text-purple-500",
    icon: Crown,
    minWager: 3000000,
    maxWager: 6999999,
    benefits: [
      "All Diamond benefits",
      "Elite VIP events",
      "Highest cashback rates"
    ]
  },
  legend: {
    name: "Legend",
    color: "text-rose-500",
    icon: Zap,
    minWager: 7000000,
    maxWager: null,
    benefits: [
      "All Master benefits",
      "Goated Event Invitations",
      "Tailor-made promotions",
      "Unlimited privileges"
    ]
  }
};

/**
 * Get the tier level based on the user's total wager amount
 * 
 * @param totalWager - User's total wager amount
 * @returns Tier level
 */
export function getTierFromWager(totalWager: number): TierLevel {
  if (totalWager >= TIERS.legend.minWager) return "legend";
  if (totalWager >= TIERS.master.minWager) return "master";
  if (totalWager >= TIERS.diamond.minWager) return "diamond";
  if (totalWager >= TIERS.platinum.minWager) return "platinum";
  if (totalWager >= TIERS.gold.minWager) return "gold";
  if (totalWager >= TIERS.silver.minWager) return "silver";
  return "bronze";
}

/**
 * Get the tier information based on a tier level
 * 
 * @param tier - Tier level
 * @returns Tier information
 */
export function getTierInfo(tier: TierLevel): TierInfo {
  return TIERS[tier];
}

/**
 * Get the tier icon component for a specific tier
 * 
 * @param tier - Tier level
 * @returns Icon component
 */
export function getTierIconComponent(tier: TierLevel) {
  return TIERS[tier].icon;
}

/**
 * Get the tier icon image path for a specific tier
 * This matches the original implementation expected in MVPCards
 * 
 * @param tier - Tier level
 * @returns Image path
 */
export function getTierIcon(tier: TierLevel): string {
  // Map tier levels to image paths
  const tierIcons: Record<TierLevel, string> = {
    bronze: "/images/Goated Emblems/bronze.e6ea941b.svg",
    silver: "/images/Goated Emblems/silver.8e3ec67f.svg",
    gold: "/images/Goated Emblems/gold.1c810178.svg",
    platinum: "/images/Goated Emblems/platinum.d258f583.svg",
    diamond: "/images/Goated Emblems/diamond.svg",
    master: "/images/Goated Emblems/pearl.1815809f.svg", // Using pearl as master
    legend: "/images/Goated Emblems/legend.svg"
  };
  
  return tierIcons[tier];
}

/**
 * Calculate the progress to the next tier
 * 
 * @param totalWager - User's total wager amount
 * @returns Progress percentage (0-1)
 */
export function getNextTierProgress(totalWager: number): number {
  const currentTier = getTierFromWager(totalWager);
  
  // If already at legend tier, return 1 (100%)
  if (currentTier === "legend") {
    return 1;
  }
  
  const tiers = Object.keys(TIERS) as TierLevel[];
  const currentTierIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentTierIndex + 1];
  
  const currentTierMin = TIERS[currentTier].minWager;
  const nextTierMin = TIERS[nextTier].minWager;
  
  // Calculate progress within the current tier
  const progressInTier = totalWager - currentTierMin;
  const tierRange = nextTierMin - currentTierMin;
  
  return Math.min(progressInTier / tierRange, 1);
}

/**
 * Get information about the next tier
 * 
 * @param currentTier - Current tier level or totalWager amount 
 * @returns Next tier information or null if at highest tier
 */
export function getNextTierInfo(currentTier: TierLevel | number): TierInfo | null {
  // If passed a number (totalWager), convert to tier level
  const tierLevel = typeof currentTier === 'number' ? getTierFromWager(currentTier) : currentTier;
  
  // If already at legend tier, return null
  if (tierLevel === "legend") {
    return null;
  }
  
  const tiers = Object.keys(TIERS) as TierLevel[];
  const currentTierIndex = tiers.indexOf(tierLevel);
  const nextTier = tiers[currentTierIndex + 1];
  
  return TIERS[nextTier];
}

/**
 * Calculate the progress percentage to the next tier
 * 
 * @param totalWager - User's total wager amount
 * @returns Progress percentage (0-100)
 */
export function getTierProgressPercentage(totalWager: number): number {
  const currentTier = getTierFromWager(totalWager);
  
  // If already at legend tier, return 100%
  if (currentTier === "legend") {
    return 100;
  }
  
  const tiers = Object.keys(TIERS) as TierLevel[];
  const currentTierIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentTierIndex + 1];
  
  const currentTierMin = TIERS[currentTier].minWager;
  const nextTierMin = TIERS[nextTier].minWager;
  
  // Calculate progress within the current tier
  const progressInTier = totalWager - currentTierMin;
  const tierRange = nextTierMin - currentTierMin;
  
  return Math.min(Math.floor((progressInTier / tierRange) * 100), 100);
}