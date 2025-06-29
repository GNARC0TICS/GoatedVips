import { 
  TrendingUp 
} from "lucide-react";

import {
  TIERS_BY_KEY,
  TierDefinition,
  getTierFromWager as getOriginalTierFromWager,
  getNextTierInfo as getOriginalNextTierInfo,
  getTierKeyFromWager,
  getNextTierProgress as getOriginalNextTierProgress,
  getTierProgressPercentage as getOriginalTierProgressPercentage
} from '@/data/tier-definitions';

// Legacy type definitions for backwards compatibility
export type TierLevel = 
  | "bronze" 
  | "silver" 
  | "gold" 
  | "platinum" 
  | "diamond" 
  | "master" 
  | "legend";

// Map legacy TierInfo interface to new TierDefinition type for backwards compatibility
export interface TierInfo {
  name: string;
  color: string;
  colorClass: string;
  hexColor: string;
  icon: typeof TrendingUp;
  iconPath: string; // Add iconPath to match TierDefinition
  minWager: number;
  maxWager: number | null;
  benefits: string[];
  glassGradient?: string;
  backgroundPattern?: string;
  accentGradient?: string;
  animationPreset?: string;
  nextMilestone?: number;
  shadowColor?: string;
}

/**
 * Tier system configuration
 * Now uses centralized definitions from tier-definitions.ts
 */
export const TIERS: Record<TierLevel, TierInfo> = {
  bronze: TIERS_BY_KEY.bronze as TierInfo,
  silver: TIERS_BY_KEY.silver as TierInfo,
  gold: TIERS_BY_KEY.gold as TierInfo,
  platinum: TIERS_BY_KEY.platinum as TierInfo,
  diamond: TIERS_BY_KEY.pearl as TierInfo, // Pearl is mapped to Diamond in our legacy system
  master: TIERS_BY_KEY.sapphire as TierInfo, // Sapphire is mapped to Master in our legacy system
  legend: TIERS_BY_KEY.emerald as TierInfo  // Emerald is mapped to Legend in our legacy system
};

// Re-export functions from centralized definitions but maintain legacy naming/interfaces for backwards compatibility

/**
 * Get the tier level based on the user's total wager amount
 * 
 * @param totalWager - User's total wager amount
 * @returns Tier level
 */
export function getTierFromWager(totalWager: number): TierLevel {
  const tier = getOriginalTierFromWager(totalWager);
  
  // Map new tier key to legacy tier level
  switch (tier.key) {
    case "bronze": return "bronze";
    case "silver": return "silver";
    case "gold": return "gold";
    case "platinum": return "platinum";
    case "pearl": return "diamond";
    case "sapphire": return "master";
    case "emerald": 
    case "diamond": return "legend";
    default: return "bronze";
  }
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
  return TIERS[tier].iconPath;
}

/**
 * Calculate the progress to the next tier
 * 
 * @param totalWager - User's total wager amount
 * @returns Progress percentage (0-1)
 */
export function getNextTierProgress(totalWager: number): number {
  return getOriginalNextTierProgress(totalWager);
}

/**
 * Get information about the next tier
 * 
 * @param currentTier - Current tier level or totalWager amount 
 * @returns Next tier information or null if at highest tier
 */
export function getNextTierInfo(currentTier: TierLevel | number): TierInfo | null {
  // If it's a tier level, map it to the new system
  if (typeof currentTier === 'string') {
    const mapping: Record<TierLevel, string> = {
      bronze: "bronze",
      silver: "silver",
      gold: "gold",
      platinum: "platinum",
      diamond: "pearl",
      master: "sapphire",
      legend: "emerald"
    };
    
    const nextTier = getOriginalNextTierInfo(mapping[currentTier]);
    if (!nextTier) return null;
    
    // Convert back to legacy format
    return nextTier as unknown as TierInfo;
  }
  
  // If it's a number (totalWager), just pass it through
  const nextTier = getOriginalNextTierInfo(currentTier);
  if (!nextTier) return null;
  
  // Convert to legacy format
  return nextTier as unknown as TierInfo;
}

/**
 * Calculate the progress percentage to the next tier
 * 
 * @param totalWager - User's total wager amount
 * @returns Progress percentage (0-100)
 */
export function getTierProgressPercentage(totalWager: number): number {
  return getOriginalTierProgressPercentage(totalWager);
}
