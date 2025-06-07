import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  CircleDot,
  Crown,
  Medal,
  Award,
  Star,
  Timer,
  TrendingUp,
  ArrowRight,
  User,
  Diamond,
  Zap,
} from "lucide-react";
import { CountdownTimer } from "@/components/data";
import { useRaceConfig, RaceConfig } from "@/hooks/queries/useRaceConfig";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QuickProfile } from "@/components/profile/QuickProfile";
import { Link } from "wouter";
import { getTierFromWager, getTierIcon } from "@/lib/tier-utils";

import { PageTransition } from "@/components/effects";

// Simple type for leaderboard entries
interface LeaderboardEntry {
  uid: string;
  userId: string;
  username: string;
  wagered: number;
  rank: number;
  avatarUrl?: string | null;
  won: number;
  profit: number;
}

export default function WagerRaces() {
  const [showCompletedRace, setShowCompletedRace] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  
  // Direct API call for monthly leaderboard data
  const { 
    data: leaderboardApiResponse,
    isLoading: isLoadingLeaderboard,
  } = useQuery({
    queryKey: ['/api/leaderboard', 'monthly'],
    queryFn: () => fetch('/api/leaderboard?timeframe=monthly&limit=10').then(res => res.json()),
  });

  const { 
    data: raceConfig,
    isLoading: isLoadingRaceConfig,
    error: errorRaceConfig 
  } = useRaceConfig();

  const isLoading = isLoadingLeaderboard || isLoadingRaceConfig;

  const leaderboardData = leaderboardApiResponse?.entries;
  const leaderboardMetadata = leaderboardApiResponse
    ? { 
        totalUsers: leaderboardApiResponse.total, 
        lastUpdated: leaderboardApiResponse.timestamp ? new Date(leaderboardApiResponse.timestamp).toISOString() : new Date().toISOString()
      } 
    : undefined;

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    ws.current = new WebSocket(`${protocol}//${window.location.host}/ws/leaderboard`);
    
    ws.current.onopen = () => {
      console.log('WagerRaces WebSocket connection established');
    };
    
    ws.current.onerror = (error) => {
      console.error('WagerRaces WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);
  const { data: previousRace } = useQuery<any>({
    queryKey: ["/api/wager-races/previous"],
    enabled: showCompletedRace,
    staleTime: Infinity,
    select: (data) => {
      if (!data) return null;

      const transitionEnds = new Date(data.metadata?.transitionEnds);
      const now = new Date();

      // Auto-hide completed race view after transition period
      if (transitionEnds < now && showCompletedRace) {
        setTimeout(() => setShowCompletedRace(false), 1000);
      }

      return {
        ...data,
        participants: data.participants?.map((p: any) => ({
          ...p,
          wagered: {
            this_month: p.wagered || 0,
            today: 0,
            this_week: 0,
            all_time: p.allTimeWagered || 0
          }
        })),
        isTransition: now < transitionEnds
      };
    }
  });

  // Auto-show completed race when race ends, driven by raceConfig
  useEffect(() => {
    if (raceConfig) {
      if (raceConfig.status === 'ended' || raceConfig.status === 'transition') {
        setShowCompletedRace(true);
      } else if (raceConfig.status === 'active' && raceConfig.endDate) {
        const now = new Date();
        const end = new Date(raceConfig.endDate);
        if (now > end) {
          setShowCompletedRace(true);
          // If status hasn't updated yet from backend, refetch to get latest status
           queryClient.invalidateQueries({ queryKey: ['/api/race-config'] });
        } else {
          setShowCompletedRace(false);
        }
      } else if (raceConfig.status === 'upcoming') {
          setShowCompletedRace(false);
      }
    }
    // Fallback logic for when raceConfig is not yet loaded is removed
    // The UI will show loading state until raceConfig is available
  }, [raceConfig]);

  useEffect(() => {
    // Listen for race completion events
    const handleRaceComplete = (event: any) => {
      if (event.type === "RACE_COMPLETED") {
        setShowCompletedRace(true);
        // Auto-hide after 1 hour
        setTimeout(() => setShowCompletedRace(false), 3600000);
      }
    };

    // Add WebSocket listener
    if (ws?.current) {
      ws.current.addEventListener("message", handleRaceComplete);
    }

    return () => {
      if (ws?.current) {
        ws.current.removeEventListener("message", handleRaceComplete);
      }
    };
  }, []);

  const prizePool = raceConfig?.prizePool || 0;
  const prizeDistribution = raceConfig?.prizeDistribution || {};

  const getLastUpdateTime = (timestamp?: string | number) => {
    if (!timestamp) return 'recently';
    const timestampDate = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    const diff = Date.now() - timestampDate.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />;
      case 2:
        return <Medal className="h-7 w-7 text-gray-400" />;
      case 3:
        return <Award className="h-7 w-7 text-amber-700" />;
      default:
        return <Star className="h-5 w-5 text-zinc-600" />;
    }
  };

  const getWagerAmount = (player?: LeaderboardEntry) => {
    if (!player || typeof player.wagered !== 'number') {
      return 0;
    }
    return player.wagered;
  };

  const getPrizeAmount = (rank: number) => {
    const rankStr = String(rank);
    if (Object.keys(prizeDistribution).length === 0 || !prizeDistribution[rankStr]) {
        return 0;
    }
    return Math.round(prizePool * (prizeDistribution[rankStr] || 0) * 100) / 100;
  };
  
  // Display full usernames
  const getAnonymizedName = useMemo(() => {
    return (username: string, position?: number) => {
      if (!username) return "Unknown";
      return username;
    };
  }, []);

  if (isLoading || !leaderboardData || !raceConfig) {
    return (
      <div className="min-h-screen bg-[#14151A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Process participants for display with proper wager data
  const currentRaceDisplayStatus = raceConfig?.status || (showCompletedRace ? 'completed' : 'live');
  
  const top10Players: LeaderboardEntry[] = (currentRaceDisplayStatus === 'completed' || currentRaceDisplayStatus === 'ended' || currentRaceDisplayStatus === 'transition') && previousRace?.participants?.length > 0 
    ? (previousRace?.participants || []).map((p: any) => ({
        uid: p.uid || '',
        userId: p.uid || '',
        name: p.name || 'Unknown',
        username: p.name || 'Unknown',
        wagered: p.wagered || 0,
        rank: p.rank || 0,
        avatarUrl: p.avatarUrl || null,
        won: p.won || 0,
        profit: p.profit || 0,
      }))
    : (leaderboardData || []).slice(0, 10).map((p: any, index: number) => ({
        uid: p.userId || '',
        userId: p.userId || '',
        name: p.username || 'Unknown',
        username: p.username || 'Unknown',
        wagered: p.wagered || 0,
        rank: index + 1,
        avatarUrl: p.avatarUrl || null,
        won: p.won || 0,
        profit: p.profit || 0,
      }));
  const currentLeader = top10Players[0];

  return (
    <div className="min-h-screen bg-[#14151A] text-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="relative">
            <div className="absolute inset-0 opacity-50">
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                poster="/images/race.gif"
                ref={(el) => {
                  if (el) {
                    el.playbackRate = 0.5;
                    el.addEventListener('ended', () => {
                      setTimeout(() => {
                        el.play();
                      }, 1000); // 1 second pause before replay
                    });
                  }
                }}
              >
                <source src="/images/RACEFLAG.MP4" type="video/mp4" />
              </video>
            </div>
            <div className="relative z-10 py-12 px-4 text-center">
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  variant="secondary"
                  className="bg-[#1A1B21]/80 hover:bg-[#1A1B21]"
                >
                  This month
                </Button>
                {/* Previous month button will be enabled for next race */}
                {/* <Button
                  variant="ghost"
                  className={`text-[#8A8B91] hover:text-white ${showCompletedRace ? 'text-white' : ''}`}
                  onClick={() => setShowCompletedRace(!showCompletedRace)}
                >
                  {showCompletedRace ? "Current month" : "Previous month"}
                </Button> */}
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="text-6xl font-heading font-extrabold text-white mb-2 uppercase tracking-tighter font-mona-sans-expanded">
                    ${raceConfig?.prizePool ? raceConfig.prizePool.toLocaleString() : '...'}
                  </h1>
                  <h2 className="text-5xl font-heading font-extrabold text-[#D7FF00] leading-tight uppercase tracking-tighter font-mona-sans-expanded">
                    {(raceConfig?.name || "Monthly Race").split(" ").map((word, index, arr) => (
                      <React.Fragment key={index}>
                        {word}
                        {index < arr.length -1 && <br />}
                      </React.Fragment>
                    ))}
                  </h2>
                </motion.div>

                <div className="flex flex-col items-center gap-6 mt-8">
                  {/* Race Status */}
                  {currentRaceDisplayStatus === 'ended' || (currentRaceDisplayStatus === 'completed' && showCompletedRace) ? (
                    <div className="space-y-2">
                      <div className="bg-[#D7FF00]/10 text-[#D7FF00] px-6 py-2 rounded-full border border-[#D7FF00] backdrop-blur-sm">
                        Race Completed
                      </div>
                      <div className="bg-[#1A1B21]/80 text-[#D7FF00]/80 px-6 py-3 rounded-lg text-sm">
                        Winners will receive their prizes directly to their Goated account within 24 hours of race completion.
                        {/* Accessing metadata on raceConfig like this might not be standard, ensure API provides it or remove */}
                        {/* {raceConfig?.metadata?.transitionEnds && new Date(raceConfig.metadata.transitionEnds) > new Date() ? ` Results are provisional until ${new Date(raceConfig.metadata.transitionEnds).toLocaleTimeString()}` : '' } */}
                      </div>
                    </div>
                  ) : currentRaceDisplayStatus === 'transition' ? (
                    <div className="bg-orange-500/10 text-orange-500 px-6 py-2 rounded-full border border-orange-500 backdrop-blur-sm">
                      Race Ended - Results Processing
                    </div>
                  ) : currentRaceDisplayStatus === 'active' && raceConfig?.endDate ? (
                    <div className="bg-[#1A1B21]/80 backdrop-blur-sm px-6 py-4 rounded-lg">
                      <div className="text-4xl font-bold text-[#D7FF00]">
                        <CountdownTimer
                          endDate={raceConfig.endDate}
                          large={true}
                          onComplete={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/race-config'] });
                          }}
                        />
                      </div>
                    </div>
                  ) : currentRaceDisplayStatus === 'upcoming' && raceConfig?.startDate ? (
                     <div className="bg-blue-500/10 text-blue-400 px-6 py-2 rounded-full border border-blue-500 backdrop-blur-sm">
                        Race Starts In <CountdownTimer endDate={raceConfig.startDate} small={true} />
                      </div>
                  ) : (
                    <div className="bg-gray-500/10 text-gray-400 px-6 py-2 rounded-full border border-gray-500 backdrop-blur-sm">
                      Loading Race Status...
                    </div>
                  )}

                  {/* Next Race Countdown */}
                  {(currentRaceDisplayStatus === 'ended' || currentRaceDisplayStatus === 'completed' || currentRaceDisplayStatus === 'transition') && raceConfig?.nextRaceStartDate && (
                    <div className="text-center mt-6">
                      <div className="text-[#8A8B91] mb-2">Next Race Starts In</div>
                      <div className="bg-[#1A1B21]/80 backdrop-blur-sm px-6 py-4 rounded-lg">
                        <CountdownTimer
                          endDate={raceConfig.nextRaceStartDate}
                          large={true}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Boxes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-[#1A1B21]/50 backdrop-blur-sm rounded-lg border border-[#2A2B31] p-4"
            >
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-[#8A8B91] font-heading text-sm mb-2">
                    PRIZE POOL
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-[#D7FF00]" />
                    <p className="text-xl font-bold">
                      ${raceConfig?.prizePool ? raceConfig.prizePool.toLocaleString() : '...'}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-[#8A8B91] font-heading text-sm mb-2">
                    POSITIONS PAID
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <Medal className="h-5 w-5 text-[#D7FF00]" />
                    <p className="text-xl font-bold">{raceConfig?.totalWinners || '...'}</p>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-[#8A8B91] font-heading text-sm mb-2">
                    1ST PLACE
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="h-5 w-5 text-[#D7FF00]" />
                    <p className="text-xl font-bold truncate">
                      {getAnonymizedName(currentLeader?.name || "No Leader", 1)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            </div>

          {/* Podium Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 px-4 mb-12"
          >
            <div className="flex justify-center items-end gap-2 md:gap-8 px-2 md:px-0">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 },
                  boxShadow: "0 0 20px rgba(215, 255, 0, 0.2)"
                }}
                className={`relative bg-gradient-to-b from-[#1A1B21]/90 to-[#1A1B21]/70 backdrop-blur-sm p-3 md:p-6 rounded-2xl border-2 border-[#C0C0C0] w-[120px] md:w-[180px] h-[180px] md:h-[220px] transform -translate-y-4 ${
                  currentRaceDisplayStatus === "completed" ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black font-semibold shadow-lg shadow-yellow-500/30"
                  : "bg-[#1A1B21]/80 border border-[#2A2B31]"
                }`}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <span className="bg-[#C0C0C0] text-black font-heading px-6 py-2 rounded-full text-sm whitespace-nowrap">
                    2ND PLACE
                  </span>
                </div>
                <div className="relative pt-4">
                  <div className="flex justify-center mb-2">
                    {getTrophyIcon(2)}
                  </div>
                  <div className="text-center">
                    <QuickProfile userId={top10Players[1]?.uid} username={top10Players[1]?.name}>
                      <p className="text-base md:text-lg font-bold truncate max-w-[100px] md:max-w-[140px] mx-auto text-white/90 cursor-pointer hover:text-[#D7FF00] transition-colors">
                        {getAnonymizedName(top10Players[1]?.name || "-", 2)}
                      </p>
                    </QuickProfile>
                    <p className="text-sm md:text-base font-heading text-[#D7FF00] mt-2">
                      ${getPrizeAmount(2).toLocaleString()}
                    </p>
                    <p className="text-sm text-white/60 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      ${(top10Players[1] ? getWagerAmount(top10Players[1]) : 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {leaderboardMetadata?.lastUpdated ? `Updated ${getLastUpdateTime(leaderboardMetadata.lastUpdated)}` : ''}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 },
                  boxShadow: "0 0 20px rgba(215, 255, 0, 0.2)"
                }}
                className={`relative bg-gradient-to-b from-[#1A1B21]/90 to-[#1A1B21]/70 backdrop-blur-sm p-3 md:p-6 rounded-2xl border-2 border-[#FFD700] w-[140px] md:w-[220px] h-[200px] md:h-[240px] z-10 glow-gold ${
                  currentRaceDisplayStatus === "completed" ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black font-semibold shadow-lg shadow-yellow-500/30"
                  : "bg-[#1A1B21]/80 border border-[#2A2B31]"
                }`}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FFD700] text-black font-heading px-6 py-2 rounded-full text-sm whitespace-nowrap">
                    1ST PLACE
                  </span>
                </div>
                <div className="relative pt-4">
                  <div className="flex justify-center mb-2">
                    {getTrophyIcon(1)}
                  </div>
                  <div className="text-center">
                  <QuickProfile userId={top10Players[0]?.uid} username={top10Players[0]?.name}>
                    <p className="text-xl font-bold truncate max-w-[120px] md:max-w-[180px] mx-auto text-white cursor-pointer hover:text-[#D7FF00] transition-colors">
                      {getAnonymizedName(top10Players[0]?.name || "-", 1)}
                    </p>
                  </QuickProfile>
                  <p className="text-lg font-heading text-[#D7FF00] mt-2">
                    ${getPrizeAmount(1).toLocaleString()}
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    $
                    {(top10Players[0] ? getWagerAmount(top10Players[0]) : 0).toLocaleString()}{" "}
                    wagered
                  </p>
                  </div>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 },
                  boxShadow: "0 0 20px rgba(215, 255, 0, 0.2)"
                }}
                className={`relative bg-gradient-to-b from-[#1A1B21]/90 to-[#1A1B21]/70 backdrop-blur-sm p-3 md:p-6 rounded-2xl border-2 border-[#CD7F32] w-[120px] md:w-[180px] h-[160px] md:h-[200px] transform -translate-y-8 ${
                  currentRaceDisplayStatus === "completed" ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black font-semibold shadow-lg shadow-yellow-500/30"
                  : "bg-[#1A1B21]/80 border border-[#2A2B31]"
                }`}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <span className="bg-[#CD7F32] text-black font-heading px-6 py-2 rounded-full text-sm whitespace-nowrap">
                    3RD PLACE
                  </span>
                </div>
                <div className="relative pt-4">
                  <div className="flex justify-center mb-2">
                    {getTrophyIcon(3)}
                  </div>
                  <div className="text-center">
                    <QuickProfile userId={top10Players[2]?.uid} username={top10Players[2]?.name}>
                      <p className="text-base md:text-lg font-bold truncate max-w-[100px] md:max-w-[140px] mx-auto text-white/90 cursor-pointer hover:text-[#D7FF00] transition-colors">
                        {getAnonymizedName(top10Players[2]?.name || "-", 3)}
                      </p>
                    </QuickProfile>
                    <p className="text-sm md:text-base font-heading text-[#D7FF00] mt-2">
                      ${getPrizeAmount(3).toLocaleString()}
                    </p>
                    <p className="text-sm text-white/60 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      ${(top10Players[2] ? getWagerAmount(top10Players[2]) : 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {leaderboardMetadata?.lastUpdated ? `Updated ${getLastUpdateTime(leaderboardMetadata.lastUpdated)}` : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Rankings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1B21]/50 backdrop-blur-sm rounded-xl border border-[#2A2B31] overflow-hidden mt-4"
          >
            <div className="bg-[#2A2B31] px-6 py-4">
              <h3 className="text-xl font-heading font-bold text-[#D7FF00] text-center">
                {`${raceConfig?.name || "Monthly Race"} Leaderboard`}
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20 font-heading text-[#D7FF00]">
                    RANK
                  </TableHead>
                  <TableHead className="font-heading text-[#D7FF00]">
                    USERNAME
                  </TableHead>
                  <TableHead className="text-right font-heading text-[#D7FF00]">
                    TOTAL WAGER
                  </TableHead>
                  <TableHead className="text-right font-heading text-[#D7FF00]">
                    PRIZE
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10Players.map((player: LeaderboardEntry, index: number) => (
                  <TableRow
                    key={player.uid}
                    className={`bg-[#1A1B21]/50 backdrop-blur-sm hover:bg-[#1A1B21] ${
                      currentRaceDisplayStatus === "completed" ? (index === 0 ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black font-semibold shadow-lg shadow-yellow-500/30" : "") : ""
                    }`}
                  >
                    <TableCell className="w-16 text-center py-5">
                      <div className="flex items-center justify-center">
                        {getTrophyIcon(index + 1)}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <QuickProfile userId={player.userId} username={player.username}>
                        <span className="font-semibold text-white/90 cursor-pointer hover:text-[#D7FF00] transition-colors">
                          {getAnonymizedName(player.username, index + 1)}
                        </span>
                      </QuickProfile>
                    </TableCell>
                    <TableCell className="text-right py-5 text-lg font-semibold text-[#D7FF00]">
                      ${getWagerAmount(player).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right py-5 text-lg font-bold text-white/90">
                      ${getPrizeAmount(index + 1).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Total Wagered Summary */}
            <div className="p-6 bg-[#1A1B21]/80 border-t border-[#2A2B31]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-[#8A8B91] font-heading text-sm mb-1">TOTAL WAGERED THIS MONTH</h4>
                  <p className="text-2xl font-bold text-[#D7FF00]">
                    ${top10Players.reduce((sum: number, player: LeaderboardEntry) => 
                      sum + getWagerAmount(player), 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <TrendingUp className="h-5 w-5 text-[#D7FF00]" />
                  <span className="text-sm">Last updated {leaderboardMetadata?.lastUpdated ? getLastUpdateTime(leaderboardMetadata.lastUpdated) : 'recently'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}