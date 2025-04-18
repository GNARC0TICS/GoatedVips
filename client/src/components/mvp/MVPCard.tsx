import React, { useState } from 'react';
import { Trophy, TrendingUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProfileTierProgress } from '@/components/profile/ProfileTierProgress';
import { getTierFromWager, getTierInfo, getTierIcon } from "@/lib/tier-utils";
import { useQuery } from "@tanstack/react-query";
import { profileService } from '@/services/profileService';
import { colors, cardStyles, textStyles } from '@/lib/style-constants';
import { ClickableUsername } from '@/components/username';

/**
 * MVP type definition with standardized properties
 */
export interface MVP {
  username: string;
  uid: string;
  wagerAmount: number;
  avatarUrl?: string;
  rank: number;
  lastWagerChange?: number;
  wagered: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
}

/**
 * Time period definition with specific styling
 */
export interface TimePeriod {
  title: string;
  period: "daily" | "weekly" | "monthly";
  wagerKey: "today" | "this_week" | "this_month";
  colors: {
    primary: string;
    accent: string;
    shine: string;
  };
}

export interface MVPCardProps {
  timeframe: TimePeriod;
  mvp: MVP | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leaderboardData: any;
}

/**
 * Individual MVP Card component
 * Displays a single timeframe MVP with their wager information
 */
export function MVPCard({ 
  timeframe, 
  mvp, 
  isOpen,
  onOpenChange,
  leaderboardData
}: MVPCardProps) {
  const [showIncrease, setShowIncrease] = useState(false);
  
  // Use React Query for profile data fetching
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', mvp?.uid],
    queryFn: () => profileService.getProfile(mvp!.uid),
    enabled: !!mvp?.uid,
    staleTime: 60000, // 1 minute
    gcTime: 300000 // 5 minutes
  });

  // Show increase indicator for 10 seconds when wager amount changes
  React.useEffect(() => {
    if (mvp?.lastWagerChange) {
      setShowIncrease(true);
      const timer = setTimeout(() => setShowIncrease(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [mvp?.lastWagerChange]);

  // Calculate tier information based on all-time wagered amount
  const tierLevel = React.useMemo(() => {
    if (!mvp) return null;
    return getTierFromWager(mvp.wagered.all_time);
  }, [mvp?.wagered?.all_time]);

  const tierInfo = React.useMemo(() => {
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
      <div
        className="relative w-full h-[200px] cursor-pointer select-none"
        onClick={(e) => {
          onOpenChange(true);
        }}
        onTouchStart={(e) => {
          // Add feedback on touch start
          const target = e.currentTarget.querySelector(`.${cardStyles.hover.split(' ')[0]}`);
          if (target) {
            (target as HTMLElement).style.transform = 'scale(0.98)';
            (target as HTMLElement).style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.2)';
          }
        }}
        onTouchEnd={(e) => {
          // Reset on touch end
          const target = e.currentTarget.querySelector(`.${cardStyles.hover.split(' ')[0]}`);
          if (target) {
            (target as HTMLElement).style.transform = 'scale(1)';
            (target as HTMLElement).style.boxShadow = '';
          }
          onOpenChange(true);
        }}
        role="button"
        tabIndex={0}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        <div className="relative h-full">
          {/* Card content with enhanced mobile touch handling */}
          <div 
            className={cardStyles.hover}
            style={{
              '--hover-border-color': `${timeframe.colors.primary}80`,
              '--hover-shadow-color': `${timeframe.colors.primary}40`,
              height: '100%',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out'
            } as React.CSSProperties}
          >
            {/* Tier badge - positioned at the top right corner */}
            {tierLevel && tierInfo && (
              <div 
                className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full text-xs z-10" 
                style={{ color: tierInfo.color }}
              >
                <img 
                  src={getTierIcon(tierLevel)} 
                  alt={tierInfo.name}
                  className="h-3 w-3" 
                />
                <span>{tierInfo.name}</span>
              </div>
            )}
            
            <div className="flex items-center mb-3">
              <div className="flex items-center gap-2">
                <Trophy 
                  className="h-5 w-5" 
                  style={{ color: timeframe.colors.primary }} 
                />
                <h3 className={textStyles.cardTitle}>{timeframe.title}</h3>
              </div>
            </div>

            <div className="space-y-3">
              {/* User info with avatar */}
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
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${timeframe.colors.primary}20` }}
                  >
                    <span 
                      className="text-base font-bold"
                      style={{ color: timeframe.colors.shine }}
                    >
                      {mvp.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Username with ClickableUsername component */}
                <div className="flex-grow min-w-0">
                  <div 
                    onClick={(e) => {
                      // Stop propagation to prevent card click
                      e.stopPropagation();
                      e.preventDefault();
                    }} 
                    onTouchStart={(e) => {
                      // Stop propagation on touch start to prevent card interactions
                      e.stopPropagation();
                    }}
                    onTouchEnd={(e) => {
                      // Stop propagation on touch end
                      e.stopPropagation();
                    }}
                    // Make larger touch area while keeping text same size
                    style={{
                      padding: '5px 0',
                      margin: '-5px 0',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    <ClickableUsername
                      userId={mvp.uid}
                      username={mvp.username}
                      className="text-base font-heading text-white truncate hover:text-[#D7FF00] transition-colors cursor-pointer username-trigger"
                    />
                  </div>
                </div>
              </div>
              
              {/* Wager amount display */}
              <div className="flex items-center justify-between text-sm bg-black/40 p-2 rounded-lg">
                <span className="text-white/70">Period Total:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono font-bold">
                    ${mvp.wagerAmount.toLocaleString()}
                  </span>
                  {showIncrease && (
                    <TrendingUp className="h-4 w-4 text-emerald-500 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed view dialog */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent 
          className={cardStyles.dialog + " animate-in zoom-in-90 duration-200"} 
          style={{
            WebkitOverflowScrolling: 'touch', // Improved scrolling on iOS
            overscrollBehavior: 'contain', // Prevent pull-to-refresh
            touchAction: 'pan-y', // Allow vertical scrolling
            zIndex: 50 // Ensure it's above other elements
          }}
        >
          <div className="relative p-6 rounded-xl bg-gradient-to-b from-[#1A1B21]/80 to-[#1A1B21]/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-[#2A2B31]/20 to-transparent opacity-50 rounded-xl" />
            <div className="relative">
              {/* MVP info header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {tierLevel && tierInfo && (
                    <img 
                      src={getTierIcon(tierLevel)} 
                      alt={tierInfo.name}
                      className="h-6 w-6" 
                    />
                  )}
                  <div 
                    style={{
                      padding: '5px 0',
                      margin: '-5px 0',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    <ClickableUsername
                      userId={mvp.uid}
                      username={mvp.username}
                      className="text-xl md:text-2xl font-heading text-white hover:text-[#D7FF00] transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xl font-heading text-white">
                  <Trophy className="w-5 h-5 text-[#D7FF00]" />
                  <span>Player Statistics</span>
                </div>
              </div>

              {/* Tier progress - Only show if profile is loaded */}
              {profile && (
                <div className="mb-4">
                  <ProfileTierProgress profile={{
                    ...profile, 
                    totalWager: String(mvp.wagered.all_time)
                  }} />
                </div>
              )}

              {/* Statistics section */}
              <div className="space-y-4">
                {[
                  { label: "Daily Rank", value: leaderboardData?.data?.today?.data?.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: colors.mvpPeriod.daily.primary },
                  { label: "Weekly Rank", value: leaderboardData?.data?.weekly?.data?.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: colors.mvpPeriod.weekly.primary },
                  { label: "Monthly Rank", value: leaderboardData?.data?.monthly?.data?.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: colors.mvpPeriod.monthly.primary },
                  { label: "All-Time Rank", value: leaderboardData?.data?.all_time?.data?.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: colors.mvpPeriod.allTime.primary }
                ].map((stat, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                  >
                    <span className="text-white/80 text-sm">{stat.label}:</span>
                    <span className="text-white font-mono font-bold" style={{ color: stat.color }}>
                      #{stat.value}
                    </span>
                  </div>
                ))}
                
                {/* All-time highlight */}
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
