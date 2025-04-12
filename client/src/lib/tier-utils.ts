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
  colorClass: string; // Base color name for Tailwind classes (amber, slate, yellow, etc.)
  hexColor: string;   // Hex color code for custom styling
  icon: typeof TrendingUp;
  minWager: number;
  maxWager: number | null;
  benefits: string[];
  // Glass morphism properties
  glassGradient?: string;
}

/**
 * Tier system configuration
 * Maps tier levels to their respective information based on the VIP Program
 * Updated to match actual tier thresholds from the VipProgram page
 */
export const TIERS: Record<TierLevel, TierInfo> = {
  bronze: {
    name: "Bronze",
    color: "text-amber-600",
    colorClass: "amber",
    hexColor: "#D97706",
    icon: TrendingUp,
    minWager: 1000, // Bronze 1
    maxWager: 9999,
    benefits: [
      "Instant Rakeback",
      "Level Up Bonus",
      "Weekly Bonus"
    ],
    glassGradient: "linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(180, 83, 9, 0.1))"
  },
  silver: {
    name: "Silver",
    color: "text-slate-400",
    colorClass: "slate",
    hexColor: "#94A3B8",
    icon: Star,
    minWager: 10000, // Silver 1
    maxWager: 99999,
    benefits: [
      "All Bronze benefits",
      "Monthly Bonus",
      "Bonus Increase"
    ],
    glassGradient: "linear-gradient(135deg, rgba(148, 163, 184, 0.15), rgba(100, 116, 139, 0.1))"
  },
  gold: {
    name: "Gold",
    color: "text-yellow-500",
    colorClass: "yellow",
    hexColor: "#EAB308",
    icon: Award,
    minWager: 100000, // Gold 1
    maxWager: 449999,
    benefits: [
      "All Silver benefits",
      "Referral Increase",
      "Loss Back Bonus"
    ],
    glassGradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.1))"
  },
  platinum: {
    name: "Platinum",
    color: "text-blue-400",
    colorClass: "blue",
    hexColor: "#60A5FA",
    icon: Trophy,
    minWager: 450000, // Platinum 1
    maxWager: 1499999,
    benefits: [
      "All Gold benefits",
      "Higher bonuses",
      "Premium rewards"
    ],
    glassGradient: "linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(59, 130, 246, 0.1))"
  },
  diamond: {
    name: "Diamond",
    color: "text-cyan-400",
    colorClass: "cyan",
    hexColor: "#22D3EE",
    icon: Diamond,
    minWager: 1500000, // Pearl 1 (mapped to Diamond in our tier system)
    maxWager: 2999999,
    benefits: [
      "All Platinum benefits",
      "VIP Host",
      "Exclusive perks"
    ],
    glassGradient: "linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(6, 182, 212, 0.1))"
  },
  master: {
    name: "Master",
    color: "text-purple-500",
    colorClass: "purple",
    hexColor: "#A855F7",
    icon: Crown,
    minWager: 3000000, // Sapphire 1
    maxWager: 6999999,
    benefits: [
      "All Diamond benefits",
      "Elite VIP events",
      "Highest cashback rates"
    ],
    glassGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(126, 34, 206, 0.1))"
  },
  legend: {
    name: "Legend",
    color: "text-rose-500",
    colorClass: "rose",
    hexColor: "#F43F5E",
    icon: Zap,
    minWager: 7000000, // Emerald 1
    maxWager: null,
    benefits: [
      "All Master benefits",
      "Goated Event Invitations",
      "Tailor-made promotions",
      "Unlimited privileges"
    ],
    glassGradient: "linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(225, 29, 72, 0.1))"
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
 * This matches the official Goated Emblems as shown in the VIP program page
 * 
 * @param tier - Tier level
 * @returns Image path
 */
export function getTierIcon(tier: TierLevel): string {
  // Using proper mapping to Goated Emblems directory
  // We have emblems: copper, bronze, silver, gold, platinum, pearl, sapphire, emerald, diamond
  const tierIcons: Record<TierLevel, string> = {
    bronze: "/images/Goated Emblems/bronze.e6ea941b.svg",
    silver: "/images/Goated Emblems/silver.8e3ec67f.svg",
    gold: "/images/Goated Emblems/gold.1c810178.svg",
    platinum: "/images/Goated Emblems/platinum.d258f583.svg",
    diamond: "/images/Goated Emblems/diamond.ddf47a1e.svg",
    master: "/images/Goated Emblems/sapphire.91e6756b.svg", // Master = Sapphire tier
    legend: "/images/Goated Emblems/emerald.46bd38eb.svg"    // Legend = Emerald tier
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