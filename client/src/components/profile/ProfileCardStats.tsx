import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/services/profileService';
import { cn } from '@/lib/utils';
import { cardStyles } from '@/lib/style-constants';
import { fadeInUp } from '@/lib/animation-presets';

interface ProfileCardStatsProps {
  profile: UserProfile;
  compact?: boolean;
  className?: string;
}

/**
 * Component for displaying user stats in profile cards
 */
export function ProfileCardStats({
  profile,
  compact = false,
  className,
}: ProfileCardStatsProps) {
  return (
    <motion.div
      className={cn(
        cardStyles.profileStatsGrid.base, 
        compact ? cardStyles.profileStatsGrid.twoCol : cardStyles.profileStatsGrid.adaptive,
        "mb-5",
        className
      )}
      {...fadeInUp}
      transition={{ ...fadeInUp.transition, delay: 0.15 }}
    >
      {/* Total Wagered Stat */}
      <div className="p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50 hover:border-[#2A2B31]/80 transition-colors">
        <div className="text-xs text-[#9A9BA1] mb-1">Total Wagered</div>
        <div className="font-bold text-white text-lg">
          {profile.totalWager 
            ? `$${parseFloat(String(profile.totalWager)).toLocaleString()}`
            : '$0'}
        </div>
      </div>
      
      {/* Rank Stat */}
      <div className="p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50 hover:border-[#2A2B31]/80 transition-colors">
        <div className="text-xs text-[#9A9BA1] mb-1">Rank</div>
        <div className="font-bold text-white text-lg">
          {(profile as any).rank
            ? `#${(profile as any).rank}`
            : 'N/A'}
        </div>
      </div>
      
      {/* Races Joined Stat */}
      <div className="p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50 hover:border-[#2A2B31]/80 transition-colors">
        <div className="text-xs text-[#9A9BA1] mb-1">Races Joined</div>
        <div className="font-bold text-white text-lg">
          {(profile.stats?.races?.total || 0).toLocaleString()}
        </div>
      </div>
      
      {/* Races Won Stat */}
      <div className="p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50 hover:border-[#2A2B31]/80 transition-colors">
        <div className="text-xs text-[#9A9BA1] mb-1">Race Wins</div>
        <div className="font-bold text-white text-lg">
          {(profile.stats?.races?.won || 0).toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}
