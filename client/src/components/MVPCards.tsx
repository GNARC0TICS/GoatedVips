import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Trophy, TrendingUp, User } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { QuickProfile } from "./profile/QuickProfile";
import { getTierFromWager, getTierInfo, getTierIcon, getTierIconComponent } from "@/lib/tier-utils";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ProfileTierProgress } from './profile/ProfileTierProgress';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';

/**
 * MVP Sigil Component
 * A reusable badge/icon for MVP status that can be used across the app
 * @param size - 'small', 'medium', or 'large' 
 */
const MVPCoreSigil = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
  let dimensions = "h-16 w-16";
  let innerDimensions = "h-14 w-14";
  let textSize = "text-xl";

  if (size === 'small') {
    dimensions = "h-8 w-8";
    innerDimensions = "h-7 w-7";
    textSize = "text-xs";
  } else if (size === 'large') {
    dimensions = "h-20 w-20";
    innerDimensions = "h-18 w-18";
    textSize = "text-2xl";
  }

  return (
    <div className={`${dimensions} rounded-full border-2 border-[#D7FF00] flex items-center justify-center rotate-45 bg-black/20`}>
      <div className={`${innerDimensions} rounded-full border-2 border-[#D7FF00] flex items-center justify-center backdrop-blur-sm`}>
        <span className={`text-[#D7FF00] font-bold ${textSize} -rotate-45`}>MVP</span>
      </div>
    </div>
  );
};

/**
 * MVP card type definition with all required properties
 */
type MVP = {
  username: string;
  uid: string;
  wagerAmount: number;
  avatarUrl?: string;
  rank: number;
  wageredAllTime?: number;
  lastWagerChange?: number;
  wagered: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
};

// Cache for profile data to prevent multiple API fetches
const profileCache = new Map<string, any>();

/**
 * Time period definitions for different MVP cards
 */
const timeframes = [
  { 
    title: "Daily MVP", 
    period: "daily", 
    wagerKey: "today",
    colors: {
      primary: "#8B5CF6", // violet
      accent: "#7C3AED",
      shine: "#A78BFA"
    }
  },
  { 
    title: "Weekly MVP", 
    period: "weekly", 
    wagerKey: "this_week",
    colors: {
      primary: "#10B981", // emerald
      accent: "#059669",
      shine: "#34D399"
    }
  },
  { 
    title: "Monthly MVP", 
    period: "monthly", 
    wagerKey: "this_month",
    colors: {
      primary: "#F59E0B", // amber
      accent: "#D97706",
      shine: "#FBBF24"
    }
  }
];

/**
 * Individual MVP Card component
 * Displays a single timeframe MVP with their wager information
 */
function MVPCard({ 
  timeframe, 
  mvp, 
  isOpen,
  onOpenChange,
  leaderboardData
}: { 
  timeframe: typeof timeframes[0], 
  mvp: MVP | undefined,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  leaderboardData: any
}) {
  const [showIncrease, setShowIncrease] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Pre-fetch profile data for this MVP
  useEffect(() => {
    if (mvp && mvp.uid) {
      // Check if we already have this profile in cache
      if (profileCache.has(mvp.uid)) {
        setProfile(profileCache.get(mvp.uid));
        return;
      }

      // Otherwise fetch it, but don't block rendering
      setLoadingProfile(true);
      profileService.getProfile(mvp.uid)
        .then(data => {
          setProfile(data);
          profileCache.set(mvp.uid, data);
        })
        .catch(err => console.error("Error pre-fetching profile:", err))
        .finally(() => setLoadingProfile(false));
    }
  }, [mvp?.uid]);

  // Show increase indicator for 10 seconds when wager amount changes
  useEffect(() => {
    if (mvp?.lastWagerChange) {
      setShowIncrease(true);
      const timer = setTimeout(() => setShowIncrease(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [mvp?.lastWagerChange]);

  // Calculate tier information based on all-time wagered amount
  const tierLevel = useMemo(() => {
    if (!mvp) return null;
    return getTierFromWager(mvp.wagered.all_time);
  }, [mvp?.wagered?.all_time]);

  const tierInfo = useMemo(() => {
    if (!tierLevel) return null;
    return getTierInfo(tierLevel);
  }, [tierLevel]);

  // Loading state
  if (!mvp) {
    return (
      <div className="p-6 bg-[#1A1B21]/50 animate-pulse h-48 rounded-xl">
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-black/20 animate-pulse"></div>
            <div className="h-4 w-16 rounded bg-black/20 animate-pulse"></div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-black/20 animate-pulse"></div>
            <div className="h-5 w-32 rounded bg-black/20 animate-pulse"></div>
          </div>
          <div className="h-10 w-full rounded bg-black/20 animate-pulse mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="relative w-full h-[200px] cursor-pointer"
        onClick={() => onOpenChange(true)}
      >
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" 
            style={{ 
              background: `linear-gradient(to bottom, ${timeframe.colors.primary}20, transparent)`,
            }}
          />
          {/* Animated shine overlay for collectible card feel */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-xl">
            <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine transform rotate-12 blur-sm" />
          </div>
          <div 
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest('.username-trigger')) {
                onOpenChange(true);
              }
            }}
            className="relative p-4 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover h-full cursor-pointer group"
            style={{
              '--hover-border-color': `${timeframe.colors.primary}80`,
              '--hover-shadow-color': `${timeframe.colors.primary}40`
            } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style={{ color: timeframe.colors.primary }} className="h-5 w-5">
                  <path fill="currentColor" d="m15.2 10.7l1.4 5.3l-4.6-3.8L7.4 16l1.4-5.2l-4.2-3.5L10 7l2-5l2 5l5.4.3zM14 19h-1v-3l-1-1l-1 1v3h-1c-1.1 0-2 .9-2 2v1h8v-1a2 2 0 0 0-2-2" />
                </svg>
                <h3 className="text-lg font-heading text-white">{timeframe.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {mvp.rank === 1 && (
                  <svg 
                    className="h-5 w-5 text-[#FBBF24]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" fill="black" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {tierLevel && (
                  <div 
                    className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full text-xs" 
                    style={{ color: tierInfo?.color }}
                  >
                    <img 
                      src={getTierIcon(tierLevel)} 
                      alt={tierInfo?.name}
                      className="h-3 w-3" 
                    />
                    <span>{tierInfo?.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {mvp.avatarUrl ? (
                  <img 
                    loading="lazy"
                    src={mvp.avatarUrl} 
                    alt={mvp.username}
                    className="w-10 h-10 rounded-full border-2"
                    style={{ borderColor: timeframe.colors.accent }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${timeframe.colors.primary}20` }}>
                    <span className="text-base font-bold"
                          style={{ color: timeframe.colors.shine }}>
                      {mvp.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <div onClick={(e) => e.stopPropagation()}>
                    <QuickProfile userId={mvp.uid} username={mvp.username}>
                      <h4 className="text-base font-heading text-white truncate hover:text-[#D7FF00] transition-colors cursor-pointer username-trigger">
                        {mvp.username}
                      </h4>
                    </QuickProfile>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm bg-black/40 p-2 rounded-lg">
                <span className="text-white/70">Period Total:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono font-bold">
                    ${mvp.wagerAmount.toLocaleString()}
                  </span>
                  {showIncrease && (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1A1B21] border-[#2A2B31] max-w-[95vw] md:max-w-2xl w-full mx-4 md:mx-0 animate-in zoom-in-90 duration-300">
          <div className="relative p-6 rounded-xl bg-gradient-to-b from-[#1A1B21]/80 to-[#1A1B21]/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-[#2A2B31]/20 to-transparent opacity-50 rounded-xl" />
            <div className="relative">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {tierLevel && (
                    <img 
                      src={getTierIcon(tierLevel)} 
                      alt={tierInfo?.name}
                      className="h-6 w-6" 
                    />
                  )}
                  <h4 className="text-xl md:text-2xl font-heading text-white">{mvp.username}</h4>
                </div>
                <div className="flex items-center gap-2 text-xl font-heading text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="w-5 h-5 text-[#D7FF00]">
                    <path fill="currentColor" d="m15.2 10.7l1.4 5.3l-4.6-3.8L7.4 16l1.4-5.2l-4.2-3.5L10 7l2-5l2 5l5.4.3zM14 19h-1v-3l-1-1l-1 1v3h-1c-1.1 0-2 .9-2 2v1h8v-1a2 2 0 0 0-2-2" />
                  </svg>
                  Player Statistics
                </div>
              </div>

              {/* TIER PROGRESS SECTION - Only show if profile is loaded */}
              {profile && (
                <div className="mb-4">
                  <ProfileTierProgress profile={{
                    ...profile, 
                    totalWager: mvp.wagered.all_time
                  }} />
                </div>
              )}

              <div className="space-y-4">
                {[
                  { label: "Daily Rank", value: leaderboardData?.data?.today?.data?.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: "#8B5CF6" },
                  { label: "Weekly Rank", value: leaderboardData?.data?.weekly?.data?.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: "#10B981" },
                  { label: "Monthly Rank", value: leaderboardData?.data?.monthly?.data?.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: "#F59E0B" },
                  { label: "All-Time Rank", value: leaderboardData?.data?.all_time?.data?.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: "#EC4899" }
                ].map((stat, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                    <span className="text-white/80 text-sm">{stat.label}:</span>
                    <span className="text-white font-mono font-bold" style={{ color: stat.color }}>
                      #{stat.value}
                    </span>
                  </div>
                ))}
                <div className="mt-6 p-3 rounded-lg bg-[#D7FF00]/10 border border-[#D7FF00]/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[#D7FF00] text-sm font-semibold">All-Time Wagered:</span>
                    <span className="text-white font-mono font-bold text-lg">
                      ${mvp.wagered.all_time.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const MVPCardMemo = React.memo(MVPCard);

/**
 * User card for MVPCards component
 * Separating this into its own component ensures hook order is preserved
 */
function UserCard({ 
  user, 
  currentUserProfile, 
  userProfile 
}: { 
  user: any | null, 
  currentUserProfile: any | null,
  userProfile: any | null
}) {
  return (
    <div className="relative w-full h-[200px]">
      <div className="relative h-full">
        {/* Animated shine overlay for collectible card feel */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-xl">
          <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine transform rotate-12 blur-sm" />
        </div>
        <div 
          className="relative p-4 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover h-full flex flex-col justify-between group"
          style={{
            '--hover-border-color': `#D7FF0080`,
            '--hover-shadow-color': `#D7FF0040`
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
                  <h3 className="text-lg font-heading text-white">Your Stats</h3>
                </div>
              </div>

              <div className="flex flex-col h-full">
                <div className="flex items-start gap-3 mb-4">
                  {currentUserProfile?.profileColor ? (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0"
                      style={{ backgroundColor: currentUserProfile.profileColor }}
                    >
                      {currentUserProfile.username ? currentUserProfile.username.charAt(0).toUpperCase() : '?'}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#D7FF00]/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-[#D7FF00]" />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <h4 className="text-base font-heading text-white truncate mb-1">
                      {currentUserProfile?.username || user?.username || "You"}
                    </h4>
                    <p className="text-xs text-[#9A9BA1] truncate">
                      {currentUserProfile?.goatedUsername 
                        ? `Linked to ${currentUserProfile.goatedUsername}` 
                        : "Link your Goated account"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  <div className="flex items-center justify-between text-sm bg-black/40 p-3 rounded-lg">
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
            // Not logged in state - Show login prompt with layout matching other cards
            <>
              {/* Pattern overlay in background */}
              <div className="absolute inset-0 opacity-5 -z-10">
                <div className="absolute inset-0 bg-[url('/images/noise.png')] mix-blend-overlay" />
                <div className="grid grid-cols-5 grid-rows-7 h-full w-full">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="border border-[#D7FF00]/5"></div>
                  ))}
                </div>
              </div>

              {/* Header section like other cards */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-[#D7FF00] rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-black" />
                  </div>
                  <h3 className="text-lg font-heading text-white">Your Stats</h3>
                </div>
                <MVPCoreSigil size="small" />
              </div>

              {/* Content */}
              <div className="flex flex-col">
                <p className="text-sm text-[#D7FF00] mb-6">Sign in to track your stats</p>

                {/* Sign in button at bottom */}
                <div className="mt-auto">
                  <Link href="/auth" className="block w-full">
                    <Button 
                      variant="default"
                      className="w-full bg-[#D7FF00] text-black font-medium hover:bg-[#C0E600]"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main MVP Cards component
 * Displays MVP cards for daily, weekly, and monthly periods
 */
export function MVPCards() {
  // *** All hooks must be called unconditionally at the top level ***

  // Card state management
  const [openCard, setOpenCard] = useState<string | null>(null);
  const dialogTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Auth and profile hooks - always call these at the top level
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const { profile: currentUserProfile } = useProfile(user?.id ?? '', { 
    manual: !user?.id,
    includeStats: true 
  });

  // Enhanced data fetching with refresh interval and error handling
  const { data: leaderboardData, isLoading, error, isError } = useQuery<any>({
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
  const mvps = useMemo(() => {
    if (!leaderboardData || typeof leaderboardData !== 'object') {
      console.log("Leaderboard data not available or not an object", leaderboardData);
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
    const dailyMVP = dailyUsers.length > 0 ? dailyUsers[0] : undefined;
    const weeklyMVP = weeklyUsers.length > 0 ? weeklyUsers[0] : undefined;
    const monthlyMVP = monthlyUsers.length > 0 ? monthlyUsers[0] : undefined;

    return {
      daily: dailyMVP,
      weekly: weeklyMVP,
      monthly: monthlyMVP
    };
  }, [leaderboardData]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dialogTimeoutRef.current) {
        clearTimeout(dialogTimeoutRef.current);
      }
    };
  }, []);

  // Fetch profile data when user is available
  useEffect(() => {
    if (user?.id) {
      profileService.getProfile(user.id)
        .then(data => setProfile(data))
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [user?.id]);

  // Display loading state or errors
  if (isLoading || isError) {
    return (
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {isError && (
          <div className="col-span-3 text-center p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
            <p className="text-red-400 mb-2">Error loading MVP data</p>
            <p className="text-sm text-white/60">{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        )}

        {timeframes.map((timeframe, index) => (
          <motion.div
            key={timeframe.period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-[#1A1B21]/50 animate-pulse h-48 rounded-xl"
          >
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 rounded bg-black/20 animate-pulse"></div>
                <div className="h-4 w-16 rounded bg-black/20 animate-pulse"></div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-black/20 animate-pulse"></div>
                <div className="h-5 w-32 rounded bg-black/20 animate-pulse"></div>
              </div>
              <div className="h-10 w-full rounded bg-black/20 animate-pulse mt-4"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 max-w-5xl mx-auto perspective-1000 px-4">
      {timeframes.map((timeframe, index) => (
        <motion.div
          key={timeframe.period}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            delay: index * 0.1  // Staggered animation
          }}
          className="group relative transform transition-all duration-300"
        >
          <MVPCardMemo 
            timeframe={timeframe}
            mvp={mvps[timeframe.period as keyof typeof mvps] ? (() => {
              const mvpData = mvps[timeframe.period as keyof typeof mvps];

              // Try to determine the structure of the data and extract needed fields
              const username = mvpData.name || mvpData.username || '';
              const uid = mvpData.uid || mvpData.id || '';

              // Determine the wager amount for this timeframe
              let wagerAmount = 0;

              // We need to handle different possible API response structures
              if (timeframe.period === 'daily' && typeof mvpData.wagered?.today === 'number') {
                wagerAmount = mvpData.wagered.today;
              } else if (timeframe.period === 'weekly' && typeof mvpData.wagered?.this_week === 'number') {
                wagerAmount = mvpData.wagered.this_week;
              } else if (timeframe.period === 'monthly' && typeof mvpData.wagered?.this_month === 'number') {
                wagerAmount = mvpData.wagered.this_month;
              } else if (typeof mvpData.wager === 'number') {
                wagerAmount = mvpData.wager;
              }

              // Create a standard wagered object or use what we have
              const wagered = mvpData.wagered || {
                today: 0,
                this_week: 0,
                this_month: 0,
                all_time: typeof mvpData.all_time_wager === 'number' ? mvpData.all_time_wager : 0
              };

              return {
                username,
                uid,
                wagerAmount,
                rank: mvpData.rank || 1,
                wageredAllTime: wagered.all_time,
                wagered
              };
            })() : undefined}
            isOpen={openCard === timeframe.period}
            onOpenChange={(open) => handleDialogChange(open, timeframe.period)}
            leaderboardData={leaderboardData}
          />
        </motion.div>
      ))}

      {/* Add a user card slot in the last position */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          delay: timeframes.length * 0.1  // Staggered animation
        }}
        className="group relative transform transition-all duration-300"
      >
        <UserCard 
          user={user} 
          currentUserProfile={currentUserProfile} 
          userProfile={profile} 
        />
      </motion.div>
    </div>
  );
}