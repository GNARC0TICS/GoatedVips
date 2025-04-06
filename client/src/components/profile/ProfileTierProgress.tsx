import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTierFromWager, getTierInfo, getNextTierInfo, getTierProgressPercentage } from '@/lib/tier-utils';
import { UserProfile } from '@/services/profileService.new';
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
  const currentTier = profile.tier || getTierFromWager(totalWager);
  const currentTierInfo = getTierInfo(currentTier);
  const nextTierInfo = getNextTierInfo(currentTier);
  
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
  
  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[#8A8B91]">Tier Status:</span>
            <span className="font-medium" style={{ color: currentTierInfo.color }}>
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
              Next: <span className="font-medium" style={{ color: nextTierInfo.color }}>{nextTierInfo.name}</span>
            </span>
          )}
        </div>
      )}
      
      <div>
        <Progress
          value={progressPercentage}
          className="h-2"
          indicatorClassName={cn(
            "transition-all",
            currentTierInfo.color === "#D7FF00" ? "bg-[#D7FF00]" : 
            currentTierInfo.color === "#FF9500" ? "bg-[#FF9500]" :
            currentTierInfo.color === "#FF00DD" ? "bg-[#FF00DD]" :
            currentTierInfo.color === "#00A3FF" ? "bg-[#00A3FF]" :
            "bg-gradient-to-r from-[#FF00DD] to-[#00A3FF]"
          )}
        />
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