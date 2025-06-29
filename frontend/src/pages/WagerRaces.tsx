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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  prizeWon?: number;
}

// Type for the summary of available snapshots (for the dropdown)
interface SnapshotSummary {
  id: number;
  raceName: string;
  originalRaceEndDate: string; // Dates from API are typically strings
}

// Type for the detailed data of a selected snapshot
interface SnapshotData {
  raceConfigData: RaceConfig;
  leaderboardEntriesData: LeaderboardEntry[];
}

export default function WagerRaces() {
  const [showCompletedRace, setShowCompletedRace] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  
  const [viewMode, setViewMode] = useState<'live' | 'historical'>('live');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);

  const { 
    data: leaderboardApiResponse, 
    isLoading: isLoadingLeaderboard, 
  } = useQuery({
    queryKey: ['/api/leaderboard', 'monthly'],
    queryFn: () => fetch('/api/leaderboard?timeframe=monthly&limit=10').then(res => res.json()),
    enabled: viewMode === 'live',
  });

  const { 
    data: raceConfig,
    isLoading: isLoadingRaceConfig,
    error: errorRaceConfig 
  } = useRaceConfig();

  const { 
    data: availableSnapshots, 
    isLoading: isLoadingSnapshots 
  } = useQuery<SnapshotSummary[]>({
    queryKey: ['raceSnapshotsList', 'monthly'],
    queryFn: () => fetch('/api/race-snapshots/list?type=monthly').then(res => res.json()),
    staleTime: 5 * 60 * 1000, 
  });

  const {
    data: selectedSnapshotData,
    isLoading: isLoadingSelectedSnapshot,
    error: errorSelectedSnapshot,
  } = useQuery<SnapshotData>({
    queryKey: ['raceSnapshot', selectedSnapshotId],
    queryFn: () => fetch(`/api/race-snapshots/${selectedSnapshotId}`).then(res => res.json()),
    enabled: !!selectedSnapshotId && viewMode === 'historical', 
    staleTime: Infinity, 
  });

  const isLoadingPage =
    (viewMode === 'live' && (isLoadingLeaderboard || isLoadingRaceConfig)) ||
    (viewMode === 'historical' && isLoadingSelectedSnapshot) ||
    (viewMode === 'live' && isLoadingSnapshots);

  const raceConfigToDisplay: RaceConfig | undefined | null =
    viewMode === 'live' ? raceConfig : selectedSnapshotData?.raceConfigData;

  const liveLeaderboardEntries = leaderboardApiResponse?.entries;
  const historicalLeaderboardEntries = selectedSnapshotData?.leaderboardEntriesData;

  const leaderboardEntriesToDisplay: LeaderboardEntry[] | undefined | null =
    viewMode === 'live' ? liveLeaderboardEntries : historicalLeaderboardEntries;

  let currentRaceDisplayStatus;
  if (viewMode === 'historical') {
    currentRaceDisplayStatus = 'completed'; 
  } else if (raceConfig?.status === 'ended' || raceConfig?.status === 'transition') {
    currentRaceDisplayStatus = raceConfig.status;
  } else if (raceConfig?.status === 'active' && raceConfig?.endDate) {
    currentRaceDisplayStatus = 'active';
  } else if (raceConfig?.status === 'upcoming' && raceConfig?.startDate) {
    currentRaceDisplayStatus = 'upcoming';
  } else {
    currentRaceDisplayStatus = 'loading';
  }
  
  const top10Players: LeaderboardEntry[] = (leaderboardEntriesToDisplay || []).slice(0, 10).map((p: any, index: number) => {
    if (viewMode === 'live') {
      return {
        uid: p.userId || '',
        userId: p.userId || '',
        username: p.username || 'Unknown',
        wagered: p.wagered || 0,
        rank: p.rank || (index + 1),
        avatarUrl: p.avatarUrl || null,
        won: p.won || 0,
        profit: p.profit || 0,
      };
    }
    return {
        uid: p.uid || p.userId || '',
        userId: p.userId || p.uid || '',
        username: p.username || 'Unknown',
        wagered: p.wagered || 0,
        rank: p.rank || (index + 1),
        avatarUrl: p.avatarUrl || null,
        won: p.won || 0, 
        profit: p.profit || 0,
        prizeWon: p.prizeWon || 0,
    };
  });

  const currentLeader = top10Players[0];
  
  const leaderboardMetadata = leaderboardApiResponse
    ? { 
        totalUsers: leaderboardApiResponse.total, 
        lastUpdated: leaderboardApiResponse.timestamp ? new Date(leaderboardApiResponse.timestamp).toISOString() : new Date().toISOString()
      } 
    : undefined;

  useEffect(() => {
    const protocol = window.location.protocol === "https";
    ws.current = new WebSocket(`${protocol}//${window.location.host}/ws/leaderboard`);
    
    ws.current.onopen = () => console.log('WagerRaces WebSocket connection established');
    ws.current.onerror = (error) => console.error('WagerRaces WebSocket error:', error);

    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    const handleRaceComplete = (event: MessageEvent) => {
      try {
        const messageData = JSON.parse(event.data as string);
        if (messageData.type === "RACE_COMPLETED" && viewMode === 'live') {
          console.log("Live race completed event received via WebSocket");
          queryClient.invalidateQueries({ queryKey: ['/api/race-config'] });
          queryClient.invalidateQueries({ queryKey: ['raceSnapshotsList'] });
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };
    if (ws?.current) ws.current.addEventListener("message", handleRaceComplete);
    return () => ws?.current?.removeEventListener("message", handleRaceComplete);
  }, [viewMode]);

  const prizePool = raceConfigToDisplay?.prizePool || 0;
  const prizeDistribution = raceConfigToDisplay?.prizeDistribution || {};

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
      case 1: return <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />;
      case 2: return <Medal className="h-7 w-7 text-gray-400" />;
      case 3: return <Award className="h-7 w-7 text-amber-700" />;
      default: return <Star className="h-5 w-5 text-zinc-600" />;
    }
  };

  const getWagerAmount = (player?: LeaderboardEntry) => {
    if (!player || typeof player.wagered !== 'number') return 0;
    return player.wagered;
  };

  const getPrizeAmount = (rank: number) => {
    const rankStr = String(rank);
    if (viewMode === 'historical') {
      const player = top10Players.find(p => p.rank === rank);
      if (player && typeof player.prizeWon === 'number') {
        return player.prizeWon;
      }
    }
    if (Object.keys(prizeDistribution).length === 0 || !prizeDistribution[rankStr]) return 0;
    return Math.round(prizePool * (prizeDistribution[rankStr] || 0) * 100) / 100;
  };
  
  const getAnonymizedName = useMemo(() => {
    return (username: string, position?: number) => {
      if (!username) return "Unknown";
      return username;
    };
  }, []);

  if (isLoadingPage) {
    return (
      <div className="min-h-screen bg-[#14151A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14151A] text-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col gap-8">
          <div className="relative">
            <div className="absolute inset-0 opacity-50">
              <video
                className="w-full h-full object-cover"
                autoPlay loop muted playsInline preload="none"
                poster="/images/race.gif"
                ref={(el) => { if (el) { el.playbackRate = 0.5; el.addEventListener('ended', () => setTimeout(() => el.play(), 1000)); }}}
              >
                <source src="/images/RACEFLAG.MP4" type="video/mp4" />
              </video>
            </div>
            <div className="relative z-10 py-12 px-4 text-center">
              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-8">
                <Button
                  variant={viewMode === 'live' ? 'secondary' : 'ghost'}
                  className={`font-semibold ${viewMode === 'live' ? 'bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90' : 'bg-[#1A1B21]/80 text-[#8A8B91] hover:text-white hover:bg-[#2A2B31]'}`}
                  onClick={() => {
                    setViewMode('live');
                    setSelectedSnapshotId(null);
                  }}
                >
                  Live Race
                </Button>

                {availableSnapshots && availableSnapshots.length > 0 && (
                  <Select
                    value={selectedSnapshotId?.toString() ?? ''}
                    onValueChange={(value) => {
                      if (value) {
                        setSelectedSnapshotId(parseInt(value, 10));
                        setViewMode('historical');
                      } else {
                        setViewMode('live');
                        setSelectedSnapshotId(null);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[280px] bg-[#1A1B21]/80 border-[#2A2B31] text-white hover:border-[#D7FF00]/50 focus:ring-[#D7FF00]/50">
                      <SelectValue placeholder="View Historical Race..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1B21] border-[#2A2B31] text-white">
                      {availableSnapshots.map((snapshot) => (
                        <SelectItem key={snapshot.id} value={snapshot.id.toString()} className="hover:bg-[#2A2B31]">
                          {snapshot.raceName} ({new Date(snapshot.originalRaceEndDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="text-6xl font-heading font-extrabold text-white mb-2 uppercase tracking-tighter font-mona-sans-expanded">
                    ${raceConfigToDisplay?.prizePool ? raceConfigToDisplay.prizePool.toLocaleString() : '...'}
                  </h1>
                  <h2 className="text-5xl font-heading font-extrabold text-[#D7FF00] leading-tight uppercase tracking-tighter font-mona-sans-expanded">
                    {(raceConfigToDisplay?.name || (viewMode === 'live' ? "Monthly Race" : "Historical Race")).split(" ").map((word, index, arr) => (
                      <React.Fragment key={index}>{word}{index < arr.length -1 && <br />}</React.Fragment>
                    ))}
                  </h2>
                </motion.div>

                <div className="flex flex-col items-center gap-6 mt-8">
                  {currentRaceDisplayStatus === 'completed' ? (
                    <div className="space-y-2">
                      <div className="bg-[#D7FF00]/10 text-[#D7FF00] px-6 py-2 rounded-full border border-[#D7FF00] backdrop-blur-sm">
                        Race Completed 
                        {viewMode === 'historical' && raceConfigToDisplay?.originalRaceEndDate && 
                          ` on ${new Date(raceConfigToDisplay.originalRaceEndDate).toLocaleDateString()}`
                        }
                      </div>
                      {(viewMode === 'historical' || (viewMode === 'live' && raceConfig?.status === 'ended')) && (
                        <div className="bg-[#1A1B21]/80 text-[#D7FF00]/80 px-6 py-3 rounded-lg text-sm">
                          Winners received their prizes directly to their Goated account.
                        </div>
                      )}
                    </div>
                  ) : currentRaceDisplayStatus === 'transition' ? (
                    <div className="bg-orange-500/10 text-orange-500 px-6 py-2 rounded-full border border-orange-500 backdrop-blur-sm">
                      Race Ended - Results Processing
                    </div>
                  ) : currentRaceDisplayStatus === 'active' && raceConfigToDisplay?.endDate ? (
                    <div className="bg-[#1A1B21]/80 backdrop-blur-sm px-6 py-4 rounded-lg">
                      <div className="text-4xl font-bold text-[#D7FF00]">
                        <CountdownTimer
                          endDate={raceConfigToDisplay.endDate} 
                          large={true}
                          onComplete={() => {
                            if (viewMode === 'live') { 
                              queryClient.invalidateQueries({ queryKey: ['/api/race-config'] });
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : currentRaceDisplayStatus === 'upcoming' && raceConfigToDisplay?.startDate ? (
                     <div className="bg-blue-500/10 text-blue-400 px-6 py-2 rounded-full border border-blue-500 backdrop-blur-sm">
                        Race Starts In <CountdownTimer endDate={raceConfigToDisplay.startDate} small={true} />
                      </div>
                  ) : (
                    <div className="bg-gray-500/10 text-gray-400 px-6 py-2 rounded-full border border-gray-500 backdrop-blur-sm">
                      Loading Race Status...
                    </div>
                  )}

                  {viewMode === 'live' && (raceConfig?.status === 'ended' || raceConfig?.status === 'transition') && raceConfig?.nextRaceStartDate && (
                    <div className="text-center mt-6">
                      <div className="text-[#8A8B91] mb-2">Next Race Starts In</div>
                      <div className="bg-[#1A1B21]/80 backdrop-blur-sm px-6 py-4 rounded-lg">
                        <CountdownTimer endDate={raceConfig.nextRaceStartDate} large={true} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-[#1A1B21]/50 backdrop-blur-sm rounded-lg border border-[#2A2B31] p-4"
            >
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-[#8A8B91] font-heading text-sm mb-2">PRIZE POOL</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-[#D7FF00]" />
                    <p className="text-xl font-bold">${raceConfigToDisplay?.prizePool ? raceConfigToDisplay.prizePool.toLocaleString() : '...'}</p>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-[#8A8B91] font-heading text-sm mb-2">POSITIONS PAID</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Medal className="h-5 w-5 text-[#D7FF00]" />
                    <p className="text-xl font-bold">{raceConfigToDisplay?.totalWinners || '...'}</p>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-[#8A8B91] font-heading text-sm mb-2">1ST PLACE</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="h-5 w-5 text-[#D7FF00]" />
                    <p className="text-xl font-bold truncate">
                      {getAnonymizedName(currentLeader?.username || (viewMode === 'historical' && !currentLeader ? "N/A" : "No Leader"), 1)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 px-4 mb-12"
          >
            <div className="flex justify-center items-end gap-2 md:gap-8 px-2 md:px-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 }, boxShadow: "0 0 20px rgba(215, 255, 0, 0.2)"}}
                className={`relative bg-gradient-to-b from-[#1A1B21]/90 to-[#1A1B21]/70 backdrop-blur-sm p-3 md:p-6 rounded-2xl border-2 border-[#C0C0C0] w-[120px] md:w-[180px] h-[180px] md:h-[220px] transform -translate-y-4 ${
                  currentRaceDisplayStatus === "completed" ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black font-semibold shadow-lg shadow-yellow-500/30" : "bg-[#1A1B21]/80 border border-[#2A2B31]"}`}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <span className="bg-[#C0C0C0] text-black font-heading px-6 py-2 rounded-full text-sm whitespace-nowrap">2ND PLACE</span>
                </div>
                <div className="relative pt-4">
                  <div className="flex justify-center mb-2">{getTrophyIcon(2)}</div>
                  <div className="text-center">
                    <QuickProfile userId={top10Players[1]?.uid} username={top10Players[1]?.username}>
                      <p className="text-base md:text-lg font-bold truncate max-w-[100px] md:max-w-[140px] mx-auto text-white/90 cursor-pointer hover:text-[#D7FF00] transition-colors">
                        {getAnonymizedName(top10Players[1]?.username || "-", 2)}
                      </p>
                    </QuickProfile>
                    <p className="text-sm md:text-base font-heading text-[#D7FF00] mt-2">${getPrizeAmount(2).toLocaleString()}</p>
                    <p className="text-sm text-white/60 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" /> ${(top10Players[1] ? getWagerAmount(top10Players[1]) : 0).toLocaleString()}
                    </p>
                    {viewMode === 'live' && (
                      <p className="text-[10px] text-white/40 mt-1">
                        {leaderboardMetadata?.lastUpdated ? `Updated ${getLastUpdateTime(leaderboardMetadata.lastUpdated)}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 }, boxShadow: "0 0 20px rgba(215, 255, 0, 0.2)"}}
                className={`relative bg-gradient-to-b from-[#1A1B21]/90 to-[#1A1B21]/70 backdrop-blur-sm p-3 md:p-6 rounded-2xl border-2 border-[#FFD700] w-[140px] md:w-[220px] h-[200px] md:h-[240px] z-10 glow-gold ${
                  currentRaceDisplayStatus === "completed" ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black font-semibold shadow-lg shadow-yellow-500/30" : "bg-[#1A1B21]/80 border border-[#2A2B31]"}`}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FFD700] text-black font-heading px-6 py-2 rounded-full text-sm whitespace-nowrap">1ST PLACE</span>
                </div>
                <div className="relative pt-4">
                  <div className="flex justify-center mb-2">{getTrophyIcon(1)}</div>
                  <div className="text-center">
                  <QuickProfile userId={top10Players[0]?.uid} username={top10Players[0]?.username}>
                    <p className="text-xl font-bold truncate max-w-[120px] md:max-w-[180px] mx-auto text-white cursor-pointer hover:text-[#D7FF00] transition-colors">
                      {getAnonymizedName(top10Players[0]?.username || "-", 1)}
                    </p>
                  </QuickProfile>
                  <p className="text-lg font-heading text-[#D7FF00] mt-2">${getPrizeAmount(1).toLocaleString()}</p>
                  <p className="text-sm text-white/60 mt-1">
                    ${(top10Players[0] ? getWagerAmount(top10Players[0]) : 0).toLocaleString()} wagered
                  </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 }, boxShadow: "0 0 20px rgba(215, 255, 0, 0.2)"}}
                className={`relative bg-gradient-to-b from-[#1A1B21]/90 to-[#1A1B21]/70 backdrop-blur-sm p-3 md:p-6 rounded-2xl border-2 border-[#CD7F32] w-[120px] md:w-[180px] h-[160px] md:h-[200px] transform -translate-y-8 ${
                  currentRaceDisplayStatus === "completed" ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black font-semibold shadow-lg shadow-yellow-500/30" : "bg-[#1A1B21]/80 border border-[#2A2B31]"}`}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <span className="bg-[#CD7F32] text-black font-heading px-6 py-2 rounded-full text-sm whitespace-nowrap">3RD PLACE</span>
                </div>
                <div className="relative pt-4">
                  <div className="flex justify-center mb-2">{getTrophyIcon(3)}</div>
                  <div className="text-center">
                    <QuickProfile userId={top10Players[2]?.uid} username={top10Players[2]?.username}>
                      <p className="text-base md:text-lg font-bold truncate max-w-[100px] md:max-w-[140px] mx-auto text-white/90 cursor-pointer hover:text-[#D7FF00] transition-colors">
                        {getAnonymizedName(top10Players[2]?.username || "-", 3)}
                      </p>
                    </QuickProfile>
                    <p className="text-sm md:text-base font-heading text-[#D7FF00] mt-2">${getPrizeAmount(3).toLocaleString()}</p>
                    <p className="text-sm text-white/60 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" /> ${(top10Players[2] ? getWagerAmount(top10Players[2]) : 0).toLocaleString()}
                    </p>
                     {viewMode === 'live' && (
                      <p className="text-[10px] text-white/40 mt-1">
                        {leaderboardMetadata?.lastUpdated ? `Updated ${getLastUpdateTime(leaderboardMetadata.lastUpdated)}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1B21]/50 backdrop-blur-sm rounded-xl border border-[#2A2B31] overflow-hidden mt-4"
          >
            <div className="bg-[#2A2B31] px-6 py-4">
              <h3 className="text-xl font-heading font-bold text-[#D7FF00] text-center">
                {`${raceConfigToDisplay?.name || (viewMode === 'live' ? "Monthly Race" : "Historical Race")} Leaderboard`}
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20 font-heading text-[#D7FF00]">RANK</TableHead>
                  <TableHead className="font-heading text-[#D7FF00]">USERNAME</TableHead>
                  <TableHead className="text-right font-heading text-[#D7FF00]">TOTAL WAGER</TableHead>
                  <TableHead className="text-right font-heading text-[#D7FF00]">PRIZE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10Players.map((player: LeaderboardEntry, index: number) => (
                  <TableRow
                    key={player.uid || player.userId}
                    className={`bg-[#1A1B21]/50 backdrop-blur-sm hover:bg-[#1A1B21] ${
                      currentRaceDisplayStatus === "completed" && player.rank === 1 ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black font-semibold shadow-lg shadow-yellow-500/30" : ""}`}
                  >
                    <TableCell className="w-16 text-center py-5">
                      <div className="flex items-center justify-center">{getTrophyIcon(player.rank)}</div>
                    </TableCell>
                    <TableCell className="py-5">
                      <QuickProfile userId={player.userId} username={player.username}>
                        <span className="font-semibold text-white/90 cursor-pointer hover:text-[#D7FF00] transition-colors">
                          {getAnonymizedName(player.username, player.rank)}
                        </span>
                      </QuickProfile>
                    </TableCell>
                    <TableCell className="text-right py-5 text-lg font-semibold text-[#D7FF00]">
                      ${getWagerAmount(player).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right py-5 text-lg font-bold text-white/90">
                      ${getPrizeAmount(player.rank).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="p-6 bg-[#1A1B21]/80 border-t border-[#2A2B31]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-[#8A8B91] font-heading text-sm mb-1">TOTAL WAGERED THIS {viewMode === 'live' ? 'MONTH' : 'RACE'}</h4>
                  <p className="text-2xl font-bold text-[#D7FF00]">
                    ${top10Players.reduce((sum: number, player: LeaderboardEntry) => sum + getWagerAmount(player), 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <TrendingUp className="h-5 w-5 text-[#D7FF00]" />
                  <span className="text-sm">
                    {viewMode === 'historical' && raceConfigToDisplay?.originalRaceEndDate 
                      ? `Snapshot from ${new Date(raceConfigToDisplay.originalRaceEndDate).toLocaleDateString()}`
                      : `Last updated ${leaderboardMetadata?.lastUpdated ? getLastUpdateTime(leaderboardMetadata.lastUpdated) : 'recently'}`
                    }
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}