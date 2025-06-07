import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Trophy, User, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { colors, cardStyles, textStyles, buttonStyles } from '@/lib/style-constants';
import { MVPCard, MVP, TimePeriod } from './MVPCard';
import { useLeaderboard, LeaderboardEntry, LeaderboardResponse } from "@/hooks/queries/useLeaderboard";

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

  const { 
    data: dailyLeaderboardResponse, 
    isLoading: isLoadingDaily, 
    error: errorDaily, 
    isError: isErrorDaily,
    refetch: refetchDaily
  } = useLeaderboard("today", { limit: 1, page: 1 });

  const { 
    data: weeklyLeaderboardResponse, 
    isLoading: isLoadingWeekly, 
    error: errorWeekly, 
    isError: isErrorWeekly,
    refetch: refetchWeekly
  } = useLeaderboard("weekly", { limit: 1, page: 1 });

  const { 
    data: monthlyLeaderboardResponse, 
    isLoading: isLoadingMonthly, 
    error: errorMonthly, 
    isError: isErrorMonthly,
    refetch: refetchMonthly
  } = useLeaderboard("monthly", { limit: 1, page: 1 });

  const { 
    data: allTimeLeaderboardResponse, 
    isLoading: isLoadingAllTime, 
    error: errorAllTime, 
    isError: isErrorAllTime,
    refetch: refetchAllTime
  } = useLeaderboard("all_time", { limit: 10, page: 1 });
  
  const isLoading = isLoadingDaily || isLoadingWeekly || isLoadingMonthly || isLoadingAllTime;
  const isError = isErrorDaily || isErrorWeekly || isErrorMonthly || isErrorAllTime;
  const error = errorDaily || errorWeekly || errorMonthly || errorAllTime;
  
  const refetchAll = () => {
    refetchDaily();
    refetchWeekly();
    refetchMonthly();
    refetchAllTime();
  };

  const combinedLeaderboardDataForDialog = useMemo(() => {
    return {
      daily: dailyLeaderboardResponse,
      weekly: weeklyLeaderboardResponse,
      monthly: monthlyLeaderboardResponse,
      allTime: allTimeLeaderboardResponse,
    };
  }, [dailyLeaderboardResponse, weeklyLeaderboardResponse, monthlyLeaderboardResponse, allTimeLeaderboardResponse]);

  const mvps = React.useMemo(() => {
    const dailyMVPData = dailyLeaderboardResponse?.entries?.[0];
    const weeklyMVPData = weeklyLeaderboardResponse?.entries?.[0];
    const monthlyMVPData = monthlyLeaderboardResponse?.entries?.[0];

    return {
      daily: dailyMVPData ? formatMVPData(dailyMVPData, 'daily') : undefined,
      weekly: weeklyMVPData ? formatMVPData(weeklyMVPData, 'weekly') : undefined,
      monthly: monthlyMVPData ? formatMVPData(monthlyMVPData, 'monthly') : undefined,
    };
  }, [dailyLeaderboardResponse, weeklyLeaderboardResponse, monthlyLeaderboardResponse, allTimeLeaderboardResponse]);

  // Helper function to format MVP data with complete wagering information
  function formatMVPData(entry: LeaderboardEntry, period: 'daily' | 'weekly' | 'monthly'): MVP {
    // Find the user's all-time data to get complete wagering information
    const allTimeEntry = allTimeLeaderboardResponse?.entries?.find(user => user.userId === entry.userId);
    
    return {
      username: entry.username,
      uid: entry.userId,
      wagerAmount: entry.wagered, // This is the period-specific wager
      avatarUrl: entry.avatarUrl || '',
      rank: entry.rank,
      wagered: {
        today: period === 'daily' ? entry.wagered : 0,
        this_week: period === 'weekly' ? entry.wagered : 0,
        this_month: period === 'monthly' ? entry.wagered : 0,
        all_time: allTimeEntry?.wagered || 0, // Use actual all-time data for tier calculations
      },
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
              onClick={refetchAll}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                minHeight: '44px'
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {timeframes.map((timeframe, index) => (
          <div
            key={timeframe.period}
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
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto px-4"
      style={{ isolation: 'isolate' }}
    >
      {/* MVP Cards for each time period */}
      {timeframes.map((timeframe) => (
        <div
          key={timeframe.period}
          className="relative"
          style={{ zIndex: openCard === timeframe.period ? 50 : 1 }}
        >
          <MVPCard 
            timeframe={timeframe}
            mvp={mvps[timeframe.period as keyof typeof mvps]}
            isOpen={openCard === timeframe.period}
            onOpenChange={(open) => handleDialogChange(open, timeframe.period)}
            leaderboardData={combinedLeaderboardDataForDialog}
          />
        </div>
      ))}

      {/* Backside Card - shows user stats or prompts login */}
      <div
        className="relative"
        style={{ zIndex: 1 }}
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
                          style={{
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation',
                            minHeight: '44px'
                          }}
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
                        style={{
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation',
                          minHeight: '44px'
                        }}
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
      </div>
    </div>
  );
}

// Re-export individual card component for direct usage
export { MVPCard };
