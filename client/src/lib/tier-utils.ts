/**
 * Utility functions for handling user tiers based on wager amounts
 */

export type TierType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface TierDefinition {
  name: TierType;
  minWager: number;
  icon: string;
}

// Define tier thresholds
const TIERS: TierDefinition[] = [
  { name: 'bronze', minWager: 0, icon: '/images/tiers/bronze.svg' },
  { name: 'silver', minWager: 1000, icon: '/images/tiers/silver.svg' },
  { name: 'gold', minWager: 10000, icon: '/images/tiers/gold.svg' },
  { name: 'platinum', minWager: 50000, icon: '/images/tiers/platinum.svg' },
  { name: 'diamond', minWager: 250000, icon: '/images/tiers/diamond.svg' },
];

/**
 * Determine user tier based on total wager amount
 * 
 * @param wagerAmount - Total wager amount in USD
 * @returns Tier name as string
 */
export function getTierFromWager(wagerAmount: number): TierType {
  // Sort tiers in descending order by minWager
  const sortedTiers = [...TIERS].sort((a, b) => b.minWager - a.minWager);
  
  // Find the highest tier the user qualifies for
  const tier = sortedTiers.find(tier => wagerAmount >= tier.minWager);
  
  // Default to bronze if no matching tier (shouldn't happen due to bronze being 0)
  return tier?.name || 'bronze';
}

/**
 * Get the icon URL for a specific tier
 * 
 * @param tierName - Tier name
 * @returns Path to the tier icon
 */
export function getTierIcon(tierName: string): string {
  const tier = TIERS.find(t => t.name === tierName.toLowerCase());
  return tier?.icon || '/images/tiers/bronze.svg';
}

/**
 * Get the minimum wager amount required for a tier
 * 
 * @param tierName - Tier name
 * @returns Minimum wager amount for the tier
 */
export function getTierMinimumWager(tierName: string): number {
  const tier = TIERS.find(t => t.name === tierName.toLowerCase());
  return tier?.minWager || 0;
}

/**
 * Get the next tier for a user
 * 
 * @param currentTier - Current tier name
 * @returns Next tier or null if at highest tier
 */
export function getNextTier(currentTier: string): TierDefinition | null {
  const currentIndex = TIERS.findIndex(t => t.name === currentTier.toLowerCase());
  
  if (currentIndex < 0 || currentIndex >= TIERS.length - 1) {
    return null; // Invalid tier or already at highest tier
  }
  
  return TIERS[currentIndex + 1];
}

/**
 * Calculate progress to next tier
 * 
 * @param wagerAmount - Current total wager amount
 * @returns Object with progress percentage and next tier information
 */
export function getTierProgress(wagerAmount: number): {
  percentage: number;
  currentTier: TierDefinition;
  nextTier: TierDefinition | null;
} {
  const currentTierName = getTierFromWager(wagerAmount);
  const currentTier = TIERS.find(t => t.name === currentTierName) as TierDefinition;
  const nextTier = getNextTier(currentTierName);
  
  if (!nextTier) {
    // User is at highest tier
    return {
      percentage: 100,
      currentTier,
      nextTier: null
    };
  }
  
  // Calculate progress percentage
  const tierRange = nextTier.minWager - currentTier.minWager;
  const userProgress = wagerAmount - currentTier.minWager;
  let percentage = (userProgress / tierRange) * 100;
  
  // Ensure percentage is between 0 and 100
  percentage = Math.max(0, Math.min(percentage, 100));
  
  return {
    percentage,
    currentTier,
    nextTier
  };
}