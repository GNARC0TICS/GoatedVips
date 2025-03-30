import React, { useMemo, useCallback } from 'react';
import { Trophy, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect as ReactuseEffect } from "react";
import { QuickProfile } from "./QuickProfile";
import { getTierFromWager, getTierIcon } from "@/lib/tier-utils"; // Added import
import { Dialog, DialogContent } from "./ui/dialog";

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

const timeframes = [
  { 
    title: "Daily MVP", 
    period: "daily", 
    colors: {
      primary: "#8B5CF6", // violet
      accent: "#7C3AED",
      shine: "#A78BFA"
    }
  },
  { 
    title: "Weekly MVP", 
    period: "weekly", 
    colors: {
      primary: "#10B981", // emerald
      accent: "#059669",
      shine: "#34D399"
    }
  },
  { 
    title: "Monthly MVP", 
    period: "monthly", 
    colors: {
      primary: "#F59E0B", // amber
      accent: "#D97706",
      shine: "#FBBF24"
    }
  }
];

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

  // Show increase indicator for 10 seconds when wager amount changes
  ReactuseEffect(() => {
    if (mvp?.lastWagerChange) {
      setShowIncrease(true);
      const timer = setTimeout(() => setShowIncrease(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [mvp?.lastWagerChange]);

  if (!mvp) {
    return (
      <div className="p-6 bg-[#1A1B21]/50 animate-pulse h-48 rounded-xl">
        <div className="h-full"></div>
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
          <div 
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest('.username-trigger')) {
                onOpenChange(true);
              }
            }}
            className="relative p-4 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover h-full cursor-pointer"
            style={{
              '--hover-border-color': `${timeframe.colors.primary}80`,
              '--hover-shadow-color': `${timeframe.colors.primary}40`
            } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style={{ color: timeframe.colors.primary }} className="h-5 w-5">
                  <path fill="currentColor" d="M8.697 3.25h6.606c.18 0 .335 0 .475.017a2.25 2.25 0 0 1 1.958 1.983h.806c.212-.002.677-.006 1.061.251c.497.331.647.9.647 1.499c0 2.726-1.453 4.546-3.308 5.557c-1.035 1.884-2.947 3.193-4.942 3.193c-1.519 0-2.96-.822-3.997-1.959a7 7 0 0 1-.902-1.23C5.247 11.555 3.75 9.737 3.75 7c0-.6.15-1.168.646-1.499c.385-.257.85-.253 1.062-.251h.806l.003-.028a2.25 2.25 0 0 1 1.955-1.955c.14-.017.295-.017.475-.017M7.75 6v.003L7.74 9.5v.001c0 .721.206 1.458.563 2.133l.014.025c.215.402.484.78.795 1.12c.842.924 1.908 1.471 2.889 1.471c1.422 0 2.921-1.028 3.7-2.544a4.8 4.8 0 0 0 .54-2.206l-.002-.002l.012-3.761v-.001c0-.242-.002-.294-.006-.329a.75.75 0 0 0-.651-.651a4 4 0 0 0-.33-.006H8.737c-.243 0-.295.001-.33.006a.75.75 0 0 0-.651.651a4 4 0 0 0-.006.33zm9.998.75l-.009 2.75v.001m-.023.539c.638-.768 1.035-1.77 1.035-3.04c0-.118-.01-.196-.019-.245a3 3 0 0 0-.231-.005h-.753M6.26 9.982a5 5 0 0 1-.022-.482v-.002l.009-2.748H5.5c-.109 0-.178 0-.231.005A1.3 1.3 0 0 0 5.25 7c0 1.237.388 2.22 1.01 2.982M12 16.25a.75.75 0 0 1 .75.75v2.25H16a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1 0-1.5h3.25V17a.75.75 0 0 1 .75-.75" />
                  <path fill="currentColor" d="M11.77 6.555a.25.25 0 0 1 .46 0l.505 1.212a.25.25 0 0 0 .21.153l1.309.105a.25.25 0 0 1 .143.439l-.997.854a.25.25 0 0 0-.08.248l.304 1.276a.25.25 0 0 1-.374.272l-1.12-.684a.25.25 0 0 0-.26 0l-1.12.684a.25.25 0 0 1-.374-.272l.305-1.276a.25.25 0 0 0-.08-.248l-.998-.854a.25.25 0 0 1 .143-.44l1.308-.104a.25.25 0 0 0 .211-.153z" opacity="0.5" />
                </svg>
                <h3 className="text-lg font-heading text-white">{timeframe.title}</h3>
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
                    <TrendingUp className="h-4 w-4 text-emerald-500 animate-pulse" />
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
                  <img 
                    src={getTierIcon(getTierFromWager(mvp.wagered.all_time))}
                    alt="VIP Tier"
                    className="w-8 h-8"
                  />
                  <h4 className="text-xl md:text-2xl font-heading text-white">{mvp.username}</h4>
                </div>
                <div className="flex items-center gap-2 text-xl font-heading text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="w-5 h-5 text-[#D7FF00]">
                    <path fill="currentColor" d="M8.697 3.25h6.606c.18 0 .335 0 .475.017a2.25 2.25 0 0 1 1.958 1.983h.806c.212-.002.677-.006 1.061.251c.497.331.647.9.647 1.499c0 2.726-1.453 4.546-3.308 5.557c-1.035 1.884-2.947 3.193-4.942 3.193c-1.519 0-2.96-.822-3.997-1.959a7 7 0 0 1-.902-1.23C5.247 11.555 3.75 9.737 3.75 7c0-.6.15-1.168.646-1.499c.385-.257.85-.253 1.062-.251h.806l.003-.028a2.25 2.25 0 0 1 1.955-1.955c.14-.017.295-.017.475-.017M7.75 6v.003L7.74 9.5v.001c0 .721.206 1.458.563 2.133l.014.025c.215.402.484.78.795 1.12c.842.924 1.908 1.471 2.889 1.471c1.422 0 2.921-1.028 3.7-2.544a4.8 4.8 0 0 0 .54-2.206l-.002-.002l.012-3.761v-.001c0-.242-.002-.294-.006-.329a.75.75 0 0 0-.651-.651a4 4 0 0 0-.33-.006H8.737c-.243 0-.295.001-.33.006a.75.75 0 0 0-.651.651a4 4 0 0 0-.006.33zm9.998.75l-.009 2.75v.001m-.023.539c.638-.768 1.035-1.77 1.035-3.04c0-.118-.01-.196-.019-.245a3 3 0 0 0-.231-.005h-.753M6.26 9.982a5 5 0 0 1-.022-.482v-.002l.009-2.748H5.5c-.109 0-.178 0-.231.005A1.3 1.3 0 0 0 5.25 7c0 1.237.388 2.22 1.01 2.982M12 16.25a.75.75 0 0 1 .75.75v2.25H16a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1 0-1.5h3.25V17a.75.75 0 0 1 .75-.75" />
                    <path fill="currentColor" d="M11.77 6.555a.25.25 0 0 1 .46 0l.505 1.212a.25.25 0 0 0 .21.153l1.309.105a.25.25 0 0 1 .143.439l-.997.854a.25.25 0 0 0-.08.248l.304 1.276a.25.25 0 0 1-.374.272l-1.12-.684a.25.25 0 0 0-.26 0l-1.12.684a.25.25 0 0 1-.374-.272l.305-1.276a.25.25 0 0 0-.08-.248l-.998-.854a.25.25 0 0 1 .143-.44l1.308-.104a.25.25 0 0 0 .211-.153z" opacity="0.5" />
                  </svg>
                  Player Statistics
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Daily Rank", value: leaderboardData?.data?.today?.data.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: "#8B5CF6" },
                  { label: "Weekly Rank", value: leaderboardData?.data?.weekly?.data.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: "#10B981" },
                  { label: "Monthly Rank", value: leaderboardData?.data?.monthly?.data.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: "#F59E0B" },
                  { label: "All-Time Rank", value: leaderboardData?.data?.all_time?.data.findIndex((p: any) => p.uid === mvp.uid) + 1 || '-', color: "#EC4899" }
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

export function MVPCards() {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const dialogTimeoutRef = React.useRef<NodeJS.Timeout>();

  const { data: leaderboardData, isLoading } = useQuery<any>({
    queryKey: ["/api/affiliate/stats"],
    staleTime: 30000,
  });

  const mvps = useMemo(() => ({
    daily: leaderboardData?.data?.today?.data?.[0],
    weekly: leaderboardData?.data?.weekly?.data?.[0],
    monthly: leaderboardData?.data?.monthly?.data?.[0]
  }), [leaderboardData]);

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

  ReactuseEffect(() => {
    return () => {
      if (dialogTimeoutRef.current) {
        clearTimeout(dialogTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading || !mvps?.daily) {
    return (
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {timeframes.map((timeframe) => (
          <motion.div
            key={timeframe.period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-[#1A1B21]/50 h-48 rounded-xl relative overflow-hidden"
          >
            <div className="w-full h-full animate-pulse bg-gradient-to-r from-[#1A1B21]/30 to-[#1A1B21]/50" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 max-w-5xl mx-auto perspective-1000 px-0">
      {timeframes.map((timeframe) => (
        <motion.div
          key={timeframe.period}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="group relative transform transition-all duration-300 p-2 md:p-3"
        >
          <MVPCardMemo 
            timeframe={timeframe}
            mvp={mvps[timeframe.period as keyof typeof mvps] ? {
              username: mvps[timeframe.period as keyof typeof mvps]?.name || '',
              uid: mvps[timeframe.period as keyof typeof mvps]?.uid || '',
              wagerAmount: mvps[timeframe.period as keyof typeof mvps]?.wagered?.[timeframe.period === 'daily' ? 'today' : timeframe.period === 'weekly' ? 'this_week' : 'this_month'] || 0,
              wagered: mvps[timeframe.period as keyof typeof mvps]?.wagered || { today: 0, this_week: 0, this_month: 0, all_time: 0 },
              avatarUrl: mvps[timeframe.period as keyof typeof mvps]?.avatarUrl,
              rank: 1 // MVP is always rank 1
            } : undefined}
            isOpen={openCard === timeframe.period}
            onOpenChange={(open) => handleDialogChange(open, timeframe.period)}
            leaderboardData={leaderboardData}
          />
        </motion.div>
      ))}
    </div>
  );
}
