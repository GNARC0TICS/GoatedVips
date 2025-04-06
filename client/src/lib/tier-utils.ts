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
 * Maps tier levels to their respective information
 */
export const TIERS: Record<TierLevel, TierInfo> = {
  bronze: {
    name: "Bronze",
    color: "text-amber-600",
    icon: TrendingUp,
    minWager: 0,
    maxWager: 999,
    benefits: [
      "Access to basic features",
      "Standard support",
      "Weekly bonuses"
    ]
  },
  silver: {
    name: "Silver",
    color: "text-slate-400",
    icon: Star,
    minWager: 1000,
    maxWager: 4999,
    benefits: [
      "All Bronze benefits",
      "Priority support",
      "Enhanced weekly bonuses",
      "Monthly rewards"
    ]
  },
  gold: {
    name: "Gold",
    color: "text-yellow-500",
    icon: Award,
    minWager: 5000,
    maxWager: 14999,
    benefits: [
      "All Silver benefits",
      "Premium support",
      "Daily bonuses",
      "Exclusive promotions",
      "Higher withdrawal limits"
    ]
  },
  platinum: {
    name: "Platinum",
    color: "text-blue-400",
    icon: Trophy,
    minWager: 15000,
    maxWager: 49999,
    benefits: [
      "All Gold benefits",
      "VIP support",
      "Increased daily bonuses",
      "Special events access",
      "Dedicated account manager"
    ]
  },
  diamond: {
    name: "Diamond",
    color: "text-cyan-400",
    icon: Diamond,
    minWager: 50000,
    maxWager: 99999,
    benefits: [
      "All Platinum benefits",
      "24/7 VIP support",
      "Exclusive VIP events",
      "Personalized offers",
      "Premium cashback",
      "Luxury gifts"
    ]
  },
  master: {
    name: "Master",
    color: "text-purple-500",
    icon: Crown,
    minWager: 100000,
    maxWager: 499999,
    benefits: [
      "All Diamond benefits",
      "Elite VIP events",
      "Highest cashback rates",
      "Unlimited withdrawals",
      "Custom bonuses",
      "Exclusive merchandise"
    ]
  },
  legend: {
    name: "Legend",
    color: "text-rose-500",
    icon: Zap,
    minWager: 500000,
    maxWager: null,
    benefits: [
      "All Master benefits",
      "Personal host",
      "Private tournaments",
      "Tailor-made promotions",
      "Exclusive travel packages",
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