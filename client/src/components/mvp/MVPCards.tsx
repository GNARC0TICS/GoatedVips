import React, { useState, useCallback, useEffect } from 'react';
import { motion } from "framer-motion";
import { Trophy, User, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { colors, cardStyles, textStyles, buttonStyles } from '@/lib/style-constants';
import { fadeInUp, cardHover, createStaggered } from '@/lib/animation-presets';
import { MVPCard, MVP, TimePeriod } from './MVPCard';

/**
 * Time period definitions for different MVP cards
 */
const timeframes: TimePeriod[] = [
  { 
    title: "Daily MVP", 
    period: "daily", 
    wagerKey: "today",
    colors: colors.mvpPeriod.daily
  },
  { 
    title: "Weekly MVP", 
    period: "weekly", 
    wagerKey: "this_week",
    colors: colors.mvpPeriod.weekly
  },
  { 
    title: "Monthly MVP", 
    period: "monthly", 
    wagerKey: "this_month",
    colors: colors.mvpPeriod.monthly
  }
];

/**
 * Main MVP Cards component
 * Displays MVP cards for daily, weekly, and monthly periods
 */
export function MVPCards() {
  // Track which MVP card is currently open in a dialog
  const [openCard, setOpenCard] = useState<string | null>(null);
  const dialogTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Enhanced data fetching with refresh interval and error handling
  const { 
    data: leaderboardData, 
    isLoading, 
    error, 
    isError,
    refetch
  } = useQuery<any>({
    queryKey: ["/api/affiliate/stats"],
    queryFn: async () => {
      const response = await fetch('/api/affiliate/stats', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds cache
    refetchInterval: 60000, // 1 minute refresh interval
    retry: 3
  });

  // Extract and normalize MVP data with robust error handling
  const mvps = React.useMemo(() => {
    if (!leaderboardData || typeof leaderboardData !== 'object') {
      return { daily: undefined, weekly: undefined, monthly: undefined };
    }

    const data = leaderboardData as any;

    // Extract users from appropriate data paths
    let dailyUsers = data?.data?.today?.data || [];
    let weeklyUsers = data?.data?.weekly?.data || [];
    let monthlyUsers = data?.data?.monthly?.data || [];

    // Fallback logic for different API response formats
    if (dailyUsers.length === 0 && data?.data?.today) {
      if (Array.isArray(data.data.today)) {
        dailyUsers = data.data.today;
      }
    }

    if (weeklyUsers.length === 0 && data?.data?.weekly) {
      if (Array.isArray(data.data.weekly)) {
        weeklyUsers = data.data.weekly;
      } else if (data.data.weekly?.this_week && Array.isArray(data.data.weekly.this_week)) {
        weeklyUsers = data.data.weekly.this_week;
      }
    }

    if (monthlyUsers.length === 0 && data?.data?.monthly) {
      if (Array.isArray(data.data.monthly)) {
        monthlyUsers = data.data.monthly;
      }
    }

    // Extract first user from each group if available
    const dailyMVP = dailyUsers.length > 0 ? formatMVPData(dailyUsers[0], 'daily') : undefined;
    const weeklyMVP = weeklyUsers.length > 0 ? formatMVPData(weeklyUsers[0], 'weekly') : undefined;
    const monthlyMVP = monthlyUsers.length > 0 ? formatMVPData(monthlyUsers[0], 'monthly') : undefined;

    return {
      daily: dailyMVP,
      weekly: weeklyMVP,
      monthly: monthlyMVP
    };
  }, [leaderboardData]);

  // Helper function to format MVP data in a consistent structure
  function formatMVPData(mvpData: any, period: 'daily' | 'weekly' | 'monthly'): MVP {
    // Try to determine the structure of the data and extract needed fields
    const username = mvpData.name || mvpData.username || '';
    const uid = mvpData.uid || mvpData.id || '';

    // Figure out the wager amount based on what's available and the period
    let wagerAmount = 0;
    if (period === 'daily' && typeof mvpData.wagered?.today === 'number') {
      wagerAmount = mvpData.wagered.today;
    } else if (period === 'weekly' && typeof mvpData.wagered?.this_week === 'number') {
      wagerAmount = mvpData.wagered.this_week;
    } else if (period === 'monthly' && typeof mvpData.wagered?.this_month === 'number') {
      wagerAmount = mvpData.wagered.this_month;
    } else if (typeof mvpData.wagerAmount === 'number') {
      wagerAmount = mvpData.wagerAmount;
    } else if (typeof mvpData.amount === 'number') {
      wagerAmount = mvpData.amount;
    }

    // Create a standard wagered object or use what we have
    const wagered = mvpData.wagered || {
      today: typeof mvpData.today === 'number' ? mvpData.today : 0,
      this_week: typeof mvpData.this_week === 'number' ? mvpData.this_week : 0,
      this_month: typeof mvpData.this_month === 'number' ? mvpData.this_month : 0,
      all_time: typeof mvpData.all_time === 'number' ? mvpData.all_time : 
                (typeof mvpData.wagered?.all_time === 'number' ? mvpData.wagered.all_time : wagerAmount)
    };

    return {
      username,
      uid,
      wagerAmount,
      wagered,
      avatarUrl: mvpData.avatarUrl || mvpData.avatar || '',
      rank: 1, // MVP is always rank 1
      lastWagerChange: mvpData.lastWagerChange
    };
  }

  // Dialog management
  const handleDialogChange = useCallback((open: boolean, period: string) => {
    if (dialogTimeoutRef.current) {
      clearTimeout(dialogTimeoutRef.current);
    }
    if (open) {
      setOpenCard(period);
    } else {
      dialogTimeoutRef.current = setTimeout(() => {
        setOpenCard(null);
      }, 100);
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dialogTimeoutRef.current) {
        clearTimeout(dialogTimeoutRef.current);
      }
    };
  }, []);

  // Get the current user info for the backside card
  const { user } = useAuth();
  const { profile: currentUserProfile } = useProfile(user?.id ?? '', { 
    manual: !user?.id,
    includeStats: true 
  });

  // Create staggered animation for cards
  const staggeredAnimation = createStaggered(cardHover, 0.1);

  // Display loading state or errors
  if (isLoading || isError) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto px-4">
        {isError && (
          <div className="col-span-full text-center p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
            <p className="text-red-400 mb-2">Error loading MVP data</p>
            <p className="text-sm text-white/60">{error instanceof Error ? error.message : "Unknown error"}</p>
            <Button 
              className="mt-3 bg-red-900/30 hover:bg-red-900/50 text-red-200"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {timeframes.map((timeframe, index) => (
          <motion.div
            key={timeframe.period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-[#1A1B21]/50 h-48 rounded-xl relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: timeframe.colors.primary }} />
              <div className="h-4 w-24 animate-pulse bg-gradient-to-r from-[#1A1B21]/30 to-[#1A1B21]/50 rounded" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-10 h-10 rounded-full animate-pulse" 
                style={{ backgroundColor: `${timeframe.colors.primary}20` }} 
              />
              <div className="h-5 w-32 animate-pulse bg-gradient-to-r from-[#1A1B21]/30 to-[#1A1B21]/50 rounded" />
            </div>
            <div className="h-8 w-full animate-pulse bg-gradient-to-r from-[#1A1B21]/30 to-[#1A1B21]/50 rounded" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 max-w-5xl mx-auto perspective-1000 px-0"
      {...staggeredAnimation.container}
    >
      {/* MVP Cards for each time period */}
      {timeframes.map((timeframe) => (
        <motion.div
          key={timeframe.period}
          {...staggeredAnimation.item}
          className="p-2 md:p-3"
        >
          <MVPCard 
            timeframe={timeframe}
            mvp={mvps[timeframe.period as keyof typeof mvps]}
            isOpen={openCard === timeframe.period}
            onOpenChange={(open) => handleDialogChange(open, timeframe.period)}
            leaderboardData={leaderboardData}
          />
        </motion.div>
      ))}

      {/* Backside Card - shows user stats or prompts login */}
      <motion.div
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, delay: 0.3 }}
        className="p-2 md:p-3"
      >
        <div className="relative w-full h-[200px]">
          <div className="relative h-full">
            <div 
              className={cardStyles.hover}
              style={{
                '--hover-border-color': `${colors.brand.primary}80`,
                '--hover-shadow-color': `${colors.brand.primary}40`,
                height: '100%'
              } as React.CSSProperties}
            >
              {user ? (
                // Logged in state - Show user stats
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 bg-[#D7FF00] rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-black" />
                      </div>
                      <h3 className={textStyles.cardTitle}>Your Stats</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {currentUserProfile?.profileColor ? (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold"
                          style={{ backgroundColor: currentUserProfile.profileColor }}
                        >
                          {currentUserProfile.username ? currentUserProfile.username.charAt(0).toUpperCase() : '?'}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#D7FF00]/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-[#D7FF00]" />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <h4 className="text-base font-heading text-white truncate">
                          {currentUserProfile?.username || user.username || "You"}
                        </h4>
                        <p className="text-xs text-[#9A9BA1] truncate">
                          {currentUserProfile?.goatedUsername 
                            ? `Linked to ${currentUserProfile.goatedUsername}` 
                            : "Link your Goated account"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm bg-black/40 p-2 rounded-lg">
                        <span className="text-white/70">All-Time Wagered:</span>
                        <span className="text-white font-mono font-bold">
                          ${currentUserProfile?.totalWager 
                              ? parseFloat(currentUserProfile.totalWager).toLocaleString()
                              : '0'}
                        </span>
                      </div>

                      <Link href="/profile" className="block w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full bg-[#D7FF00]/10 border-[#D7FF00]/20 text-[#D7FF00] hover:bg-[#D7FF00]/20"
                        >
                          View Full Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                // Not logged in state - Show login prompt
                <>
                  {/* Playing card backside design */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A1B21] to-[#14151A] overflow-hidden">
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-[url('/images/noise.png')] mix-blend-overlay" />
                      <div className="grid grid-cols-5 grid-rows-7 h-full w-full">
                        {Array.from({ length: 35 }).map((_, i) => (
                          <div key={i} className="border border-[#D7FF00]/5"></div>
                        ))}
                      </div>
                    </div>

                    {/* Center logo - repositioned higher up */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ top: '-15%' }}>
                      <div className="h-16 w-16 rounded-full border-2 border-[#D7FF00] flex items-center justify-center transform rotate-45 bg-[#14151A]/80">
                        <div className="h-14 w-14 rounded-full border-2 border-[#D7FF00] flex items-center justify-center backdrop-blur-sm bg-[#14151A]/50">
                          <span className="text-[#D7FF00] font-bold text-xl transform -rotate-45">MVP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/80 to-transparent text-center">
                    <p className="text-sm text-[#D7FF00] mb-3">Sign in to track your stats</p>
                    <Link href="/auth">
                      <Button 
                        variant="default" 
                        size="sm"
                        className={buttonStyles.primary + " w-full"}
                      >
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Re-export individual card component for direct usage
export { MVPCard };
