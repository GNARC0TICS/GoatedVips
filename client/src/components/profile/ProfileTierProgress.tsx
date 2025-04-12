import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTierFromWager, getTierInfo, getNextTierInfo, getTierProgressPercentage } from '@/lib/tier-utils';
import { UserProfile } from '@/services/profileService';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface ProfileTierProgressProps {
  profile: UserProfile;
  showLabel?: boolean;
  showNextTier?: boolean;
  className?: string;
}

/**
 * Component to display a user's tier progress
 */
export function ProfileTierProgress({
  profile,
  showLabel = true,
  showNextTier = true,
  className,
}: ProfileTierProgressProps) {
  // Determine the current tier based on the total wager
  const totalWager = profile.totalWager ? parseFloat(String(profile.totalWager)) : 0;
  // Need to cast tier to TierLevel since the profile might have it as a string
  const currentTier = (profile.tier as any) || getTierFromWager(totalWager);
  const currentTierInfo = getTierInfo(currentTier);
  const nextTierInfo = getNextTierInfo(currentTier as any);
  
  // Calculate progress percentage
  const progressPercentage = getTierProgressPercentage(totalWager);
  
  // Format wager for display
  const formatWager = (wager: number) => {
    if (wager >= 1000000) {
      return `$${(wager / 1000000).toFixed(1)}M`;
    } else if (wager >= 1000) {
      return `$${(wager / 1000).toFixed(1)}K`;
    } else {
      return `$${wager.toFixed(0)}`;
    }
  };
  
  // Get color for the progress bar - convert from text color to background color
  const getProgressColor = (color: string) => {
    // Map color names from tier information to actual color values
    const colorMap: Record<string, string> = {
      'text-amber-600': '#D97706', // Bronze
      'text-slate-400': '#94A3B8', // Silver
      'text-yellow-500': '#EAB308', // Gold
      'text-blue-400': '#60A5FA', // Platinum
      'text-cyan-400': '#22D3EE', // Diamond (Pearl in Goated Emblems)
      'text-purple-500': '#A855F7', // Master (Sapphire in Goated Emblems)
      'text-rose-500': '#F43F5E'    // Legend (Emerald in Goated Emblems)
    };

    return colorMap[color] || color;
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[#8A8B91]">Tier Status:</span>
            <span className={cn("font-medium", currentTierInfo.color)}>
              {currentTierInfo.name}
            </span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center" aria-label="Tier information">
                    <Info className="h-3 w-3 text-[#8A8B91]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    Tiers are based on your all-time wager amount. Higher tiers unlock exclusive benefits.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {showNextTier && nextTierInfo && (
            <span className="text-[#8A8B91]">
              Next: <span className={cn("font-medium", nextTierInfo.color)}>{nextTierInfo.name}</span>
            </span>
          )}
        </div>
      )}
      
      <div>
        <Progress
          value={progressPercentage}
          className="h-2"
          // Use Progress component as is in your UI library - adapt as needed
          style={{
            backgroundColor: '#1A1B21', // Dark background
            borderRadius: '9999px', // Rounded
            overflow: 'hidden'
          }}
        >
          <div 
            className="h-full transition-all"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: getProgressColor(currentTierInfo.color)
            }}
          />
        </Progress>
      </div>
      
      {nextTierInfo && (
        <div className="flex items-center justify-between text-xs text-[#8A8B91]">
          <span>{formatWager(totalWager)} Wagered</span>
          <span>Goal: {formatWager(nextTierInfo.minWager)}</span>
        </div>
      )}
    </div>
  );
}