import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/services/profileService';
import { cn } from '@/lib/utils';
import { TrendingUp, Trophy, Star, Award, Calendar, Users, Medal } from 'lucide-react';
import { getTierFromWager, TierLevel } from '@/lib/tier-utils';
import { fadeIn, fadeInUp } from '@/lib/animation-presets';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number; // 0-100
  tier?: TierLevel;
  category: 'wager' | 'races' | 'social' | 'loyalty';
  date?: string;
}

interface ProfileAchievementsProps {
  profile: UserProfile;
  limit?: number;
  showCategory?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Component to display a user's achievements
 */
export function ProfileAchievements({
  profile,
  limit = 3,
  showCategory = false,
  className,
  compact = false,
}: ProfileAchievementsProps) {
  // Generate achievements based on user profile data
  const achievements = useMemo(() => {
    const results: Achievement[] = [];
    const wager = profile.totalWager ? parseFloat(String(profile.totalWager)) : 0;
    
    // Wager milestones
    const wagerMilestones = [1000, 10000, 100000, 1000000];
    wagerMilestones.forEach(milestone => {
      results.push({
        id: `wager-${milestone}`,
        name: `$${milestone.toLocaleString()} Wagered`,
        description: `Reached $${milestone.toLocaleString()} in total wagers`,
        icon: <TrendingUp className="h-4 w-4" />,
        unlocked: wager >= milestone,
        progress: Math.min(Math.floor((wager / milestone) * 100), 100),
        category: 'wager'
      });
    });
    
    // Races achievements
    const racesWon = (profile.stats?.races?.won || 0);
    const racesJoined = (profile.stats?.races?.total || 0);
    const racesMilestones = [1, 5, 10, 25, 50];
    
    racesMilestones.forEach(milestone => {
      // Races won
      results.push({
        id: `races-won-${milestone}`,
        name: `${milestone} Race${milestone > 1 ? 's' : ''} Won`,
        description: `Won ${milestone} wager race${milestone > 1 ? 's' : ''}`,
        icon: <Trophy className="h-4 w-4" />,
        unlocked: racesWon >= milestone,
        progress: Math.min(Math.floor((racesWon / milestone) * 100), 100),
        category: 'races'
      });
      
      // Races joined
      results.push({
        id: `races-joined-${milestone}`,
        name: `${milestone} Race${milestone > 1 ? 's' : ''} Joined`,
        description: `Participated in ${milestone} wager race${milestone > 1 ? 's' : ''}`,
        icon: <Medal className="h-4 w-4" />,
        unlocked: racesJoined >= milestone,
        progress: Math.min(Math.floor((racesJoined / milestone) * 100), 100),
        category: 'races'
      });
    });
    
    // Tier achievements
    const userTier = getTierFromWager(wager);
    const tierAchievements: Record<TierLevel, {name: string, icon: React.ReactNode}> = {
      bronze: { name: "Bronze Tier", icon: <Star className="h-4 w-4" /> },
      silver: { name: "Silver Tier", icon: <Star className="h-4 w-4" /> },
      gold: { name: "Gold Tier", icon: <Award className="h-4 w-4" /> },
      platinum: { name: "Platinum Tier", icon: <Award className="h-4 w-4" /> },
      diamond: { name: "Diamond Tier", icon: <Award className="h-4 w-4" /> },
      master: { name: "Master Tier", icon: <Trophy className="h-4 w-4" /> },
      legend: { name: "Legend Tier", icon: <Trophy className="h-4 w-4" /> }
    };
    
    // Add tier achievements
    Object.entries(tierAchievements).forEach(([tier, data]) => {
      const tierLevel = tier as TierLevel;
      const unlockedTiers = {
        bronze: wager >= 1000,
        silver: wager >= 10000,
        gold: wager >= 100000,
        platinum: wager >= 450000,
        diamond: wager >= 1500000,
        master: wager >= 3000000,
        legend: wager >= 7000000
      };
      
      results.push({
        id: `tier-${tier}`,
        name: data.name,
        description: `Reached ${data.name}`,
        icon: data.icon,
        unlocked: unlockedTiers[tierLevel],
        tier: tierLevel,
        category: 'loyalty'
      });
    });
    
    // Add loyalty achievements based on join date
    if (profile.createdAt) {
      const joinDate = new Date(profile.createdAt);
      const now = new Date();
      const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const loyaltyMilestones = [1, 7, 30, 90, 180, 365];
      loyaltyMilestones.forEach(days => {
        if (days <= daysSinceJoin) {
          results.push({
            id: `loyalty-${days}`,
            name: days === 1 ? "First Day" : 
                  days === 7 ? "First Week" :
                  days === 30 ? "First Month" :
                  days === 90 ? "Three Months" :
                  days === 180 ? "Six Months" : "One Year",
            description: `Member for ${days === 1 ? 'a day' : days === 7 ? 'a week' : days === 30 ? 'a month' : days === 365 ? 'a year' : days + ' days'}`,
            icon: <Calendar className="h-4 w-4" />,
            unlocked: true,
            date: new Date(joinDate.getTime() + (days * 24 * 60 * 60 * 1000)).toISOString(),
            category: 'loyalty'
          });
        }
      });
    }
    
    // Filter and sort achievements
    const unlocked = results.filter(a => a.unlocked).sort((a, b) => {
      if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });
    
    const locked = results.filter(a => !a.unlocked)
      .sort((a, b) => (b.progress || 0) - (a.progress || 0));
    
    return [...unlocked.slice(0, Math.ceil(limit/2)), ...locked.slice(0, Math.floor(limit/2))];
  }, [profile, limit]);

  if (!achievements.length) return null;
  
  return (
    <motion.div 
      className={cn("space-y-2", className)}
      {...fadeIn}
    >
      {!compact && <h3 className="text-sm font-medium text-[#8A8B91]">Achievements</h3>}
      <motion.div 
        className="space-y-2"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {achievements.map((achievement, index) => (
          <motion.div 
            key={achievement.id}
            className={cn(
              "p-2 rounded-md border flex items-center gap-3",
              achievement.unlocked 
                ? "border-[#2A2B31]/80 bg-[#1A1B21]/60" 
                : "border-[#2A2B31]/20 bg-[#1A1B21]/30"
            )}
            variants={staggerItem}
            custom={index}
          >
            <div 
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center",
                achievement.unlocked 
                  ? "bg-[#D7FF00]/20 text-[#D7FF00]" 
                  : "bg-[#2A2B31]/20 text-[#9A9BA1]"
              )}
            >
              {typeof achievement.icon === 'string' 
                ? <img src={achievement.icon} alt="" className="w-5 h-5" /> 
                : achievement.icon
              }
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p 
                  className={cn(
                    "text-xs font-medium truncate",
                    achievement.unlocked ? "text-white" : "text-[#9A9BA1]"
                  )}
                >
                  {achievement.name}
                </p>
                
                {showCategory && (
                  <Badge 
                    variant="outline" 
                    className="text-[9px] px-1 py-0 h-4 border-[#2A2B31]/50 text-[#9A9BA1]"
                  >
                    {achievement.category}
                  </Badge>
                )}
                
                {achievement.unlocked && (
                  <Badge 
                    variant="secondary" 
                    className="text-[9px] px-1 py-0 h-4 bg-[#D7FF00]/20 text-[#D7FF00]"
                  >
                    Unlocked
                  </Badge>
                )}
              </div>
              
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="w-full h-1 bg-[#2A2B31]/30 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#9A9BA1]/50 rounded-full" 
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// Animation variants for staggered entrance
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};
