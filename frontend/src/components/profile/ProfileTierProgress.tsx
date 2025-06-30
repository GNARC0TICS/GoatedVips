import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTierFromWager, getTierInfo, getNextTierInfo, getTierProgressPercentage, getTierIcon } from '@/lib/tier-utils';
import { UserProfile } from '@/services/profileService';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { colors } from '@/lib/style-constants';
import { fadeIn, fadeInUp } from '@/lib/animation-presets';

interface ProfileTierProgressProps {
  profile: UserProfile;
  showLabel?: boolean;
  showNextTier?: boolean;
  showMilestones?: boolean;
  className?: string;
}

/**
 * Component to display a user's tier progress with visual improvements
 */
export function ProfileTierProgress({
  profile,
  showLabel = true,
  showNextTier = true,
  showMilestones = true,
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
  
  // Calculate milestone positions
  const milestones = [0, 25, 50, 75, 100];
  const currentMilestone = milestones.find(m => progressPercentage <= m) || 100;
  const prevMilestone = milestones[milestones.indexOf(currentMilestone) - 1] || 0;
  const milestoneProgress = ((progressPercentage - prevMilestone) / (currentMilestone - prevMilestone)) * 100;
  
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
  
  // Set CSS variables for current tier colors
  const tierColorRGB = currentTierInfo.shadowColor?.replace('rgba(', '').replace(')', '').split(',')[0] || '';
  
  return (
    <motion.div 
      className={cn('space-y-3', className)}
      {...fadeIn}
      style={{ 
        '--tier-color-rgb': tierColorRGB 
      } as React.CSSProperties}
    >
      {showLabel && (
        <motion.div 
          className="flex items-center justify-between text-xs"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <img 
              src={getTierIcon(currentTier)} 
              alt={currentTierInfo.name} 
              className="w-5 h-5" 
            />
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
                  <div className="max-w-xs space-y-2">
                    <p className="text-xs">Tiers are based on your all-time wager amount.</p>
                    <div className="text-xs grid grid-cols-2 gap-1">
                      <span>Current Tier:</span>
                      <span className={currentTierInfo.color}>{currentTierInfo.name}</span>
                      <span>Required Wager:</span>
                      <span>${currentTierInfo.minWager.toLocaleString()}</span>
                      <span>Your Wager:</span>
                      <span>${totalWager.toLocaleString()}</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {showNextTier && nextTierInfo && (
            <div className="flex items-center gap-2">
              <span className="text-[#8A8B91] text-xs">Next:</span>
              <span className={cn("text-xs font-medium", nextTierInfo.color)}>
                {nextTierInfo.name}
              </span>
              <img 
                src={getTierIcon(nextTierInfo.name.toLowerCase() as any)} 
                alt={nextTierInfo.name} 
                className="w-4 h-4 opacity-50" 
              />
            </div>
          )}
        </motion.div>
      )}
      
      {/* Enhanced progress bar with milestone markers */}
      <motion.div
        className="relative"
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, delay: 0.2 }}
      >
        <Progress
          value={progressPercentage}
          className="h-2"
          style={{
            backgroundColor: colors.background.card, 
            borderRadius: '9999px',
            overflow: 'hidden'
          }}
        >
          <motion.div 
            className="h-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ 
              background: currentTierInfo.accentGradient || currentTierInfo.hexColor,
              boxShadow: `0 0 10px ${currentTierInfo.shadowColor}`
            }}
          />
        </Progress>
        
        {/* Milestone markers */}
        {showMilestones && milestones.map(milestone => milestone > 0 && milestone < 100 && (
          <div 
            key={milestone}
            className="absolute top-0 w-px h-3 bg-[#9A9BA1]/30"
            style={{ left: `${milestone}%` }}
          />
        ))}
        
        {/* Current position indicator */}
        <motion.div
          className="absolute top-1 w-2 h-2 rounded-full bg-white"
          style={{ 
            left: `${progressPercentage}%`,
            transform: 'translateX(-50%) translateY(-50%)',
            boxShadow: `0 0 8px 2px ${currentTierInfo.shadowColor || currentTierInfo.hexColor}80`
          }}
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2
          }}
        />
      </motion.div>
      
      <motion.div 
        className="flex items-center justify-between text-xs text-[#8A8B91]"
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, delay: 0.3 }}
      >
        <span>{formatWager(totalWager)} Wagered</span>
        {nextTierInfo && (
          <span>Goal: {formatWager(nextTierInfo.minWager)}</span>
        )}
      </motion.div>
    </motion.div>
  );
}
