
/**
 * Utility functions for handling user tiers based on wager amounts
 */

export type TierType = 'copper' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'pearl' | 'diamond';

interface TierDefinition {
  name: TierType;
  minWager: number;
  icon: string;
  color: string;
}

// Define tier thresholds with colors - aligned with VipProgram.tsx
const TIERS: TierDefinition[] = [
  { name: 'copper', minWager: 0, icon: '/images/Goated Emblems/copper.548d79cf.svg', color: '#B87333' },
  { name: 'bronze', minWager: 1000, icon: '/images/Goated Emblems/bronze.e6ea941b.svg', color: '#CD7F32' },
  { name: 'silver', minWager: 10000, icon: '/images/Goated Emblems/silver.8e3ec67f.svg', color: '#C0C0C0' },
  { name: 'gold', minWager: 100000, icon: '/images/Goated Emblems/gold.1c810178.svg', color: '#FFD700' },
  { name: 'platinum', minWager: 450000, icon: '/images/Goated Emblems/platinum.d258f583.svg', color: '#E5E4E2' },
  { name: 'pearl', minWager: 1500000, icon: '/images/Goated Emblems/pearl.1815809f.svg', color: '#FAEBD7' },
  { name: 'diamond', minWager: 250000, icon: '/images/Goated Emblems/diamond.ddf47a1e.svg', color: '#B9F2FF' },
];

/**
 * Determine user tier based on total wager amount
 * 
 * @param wagerAmount - Total wager amount in USD (can be number or string)
 * @returns Tier name as string
 */
export function getTierFromWager(wagerAmount: number | string): TierType {
  // Convert string to number if necessary
  const numericAmount = typeof wagerAmount === 'string' ? 
    parseFloat(wagerAmount.replace(/,/g, '')) : wagerAmount;
  
  // Handle NaN or invalid values
  if (isNaN(numericAmount)) {
    return 'copper';
  }
  
  // Sort tiers in descending order by minWager
  const sortedTiers = [...TIERS].sort((a, b) => b.minWager - a.minWager);
  
  // Find the highest tier the user qualifies for
  const tier = sortedTiers.find(tier => numericAmount >= tier.minWager);
  
  // Default to copper if no matching tier (shouldn't happen due to copper being 0)
  return tier?.name || 'copper';
}

/**
 * Get the icon URL for a specific tier
 * 
 * @param tierName - Tier name
 * @returns Path to the tier icon
 */
export function getTierIcon(tierName: string): string {
  const tier = TIERS.find(t => t.name === tierName.toLowerCase());
  return tier?.icon || '/images/Goated Emblems/copper.548d79cf.svg';
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
 * Get the color associated with a tier
 * 
 * @param tierName - Tier name
 * @returns Color hex value
 */
export function getTierColor(tierName: string): string {
  const tier = TIERS.find(t => t.name === tierName.toLowerCase());
  return tier?.color || '#B87333'; // Default to copper color
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
 * @param wagerAmount - Current total wager amount (can be number or string)
 * @returns Object with progress percentage and next tier information
 */
export function getTierProgress(wagerAmount: number | string): {
  percentage: number;
  currentTier: TierDefinition;
  nextTier: TierDefinition | null;
} {
  // Convert string to number if necessary, removing commas if present
  const numericAmount = typeof wagerAmount === 'string' ? 
    parseFloat(wagerAmount.replace(/,/g, '')) : wagerAmount;
  
  // Handle NaN or invalid values
  if (isNaN(numericAmount)) {
    const copperTier = TIERS.find(t => t.name === 'copper') as TierDefinition;
    return {
      percentage: 0,
      currentTier: copperTier,
      nextTier: TIERS[1] // Bronze tier
    };
  }
  
  const currentTierName = getTierFromWager(numericAmount);
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
  const userProgress = numericAmount - currentTier.minWager;
  let percentage = (userProgress / tierRange) * 100;
  
  // Ensure percentage is between 0 and 100
  percentage = Math.max(0, Math.min(percentage, 100));
  
  return {
    percentage,
    currentTier,
    nextTier
  };
}
