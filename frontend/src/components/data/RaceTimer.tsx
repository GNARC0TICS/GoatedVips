import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, History, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useRaceConfig, RaceConfig } from "@/hooks/queries/useRaceConfig";
import { useQuery } from "@tanstack/react-query";

import { SpeedIcon } from "../icons/SpeedIcon";

interface WidgetRaceParticipant {
  userId: string;
  username: string;
  wagered: number;
  rank: number;
}

/**
 * RaceTimer Component
 * 
 * A floating widget displaying information about the current or previous wager race
 * with dynamic timeLeft updates and animation effects.
 */
export function RaceTimer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const { toast } = useToast();

  const { 
    data: raceConfig,
    error: raceConfigError,
    isLoading: isLoadingRaceConfig 
  } = useRaceConfig();

  const { 
    data: leaderboardData,
    error: leaderboardError,
    isLoading: isLoadingLeaderboard
  } = useQuery({
    queryKey: ['monthly-leaderboard'],
    queryFn: async () => {
      const response = await fetch('/api/affiliate/stats?timeframe=monthly&limit=10');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      return data.entries || [];
    },
    enabled: !showPrevious,
    staleTime: 60000,
  });

  const currentRaceParticipants = leaderboardData || [];

  const isLoading = isLoadingRaceConfig || (isLoadingLeaderboard && !showPrevious);
  const error = raceConfigError || (leaderboardError && !showPrevious);
  
  const displayRaceData = useMemo(() => {
    if (showPrevious) {
      return {
        name: "Previous Race",
        status: raceConfig?.status === 'ended' || raceConfig?.status === 'transition' ? raceConfig.status : 'ended',
        prizePool: raceConfig?.prizePool,
        participants: [],
        startDate: undefined,
        endDate: undefined,
      };
    }
    return {
      name: raceConfig?.name || "Monthly Race",
      status: raceConfig?.status,
      startDate: raceConfig?.startDate,
      endDate: raceConfig?.endDate,
      prizePool: raceConfig?.prizePool,
      participants: currentRaceParticipants || [],
    };
  }, [
    showPrevious, 
    raceConfig?.name, 
    raceConfig?.status, 
    raceConfig?.startDate, 
    raceConfig?.endDate, 
    raceConfig?.prizePool,
    currentRaceParticipants
  ]);

  const handleSpeedIconClick = useCallback(() => {
    if (!isContentVisible) {
      setIsContentVisible(true);
      setIsExpanded(false);
    } else if (!isExpanded) {
      setIsExpanded(true);
    } else {
      setIsContentVisible(false);
      setIsExpanded(false);
    }
    setHasSeenNotification(true);
  }, [isContentVisible, isExpanded]);

  useEffect(() => {
    if (raceConfigError) {
      toast({
        title: "Error loading race configuration",
        description: raceConfigError.message || "Please try again later",
      });
    }
    if (leaderboardError && !showPrevious) {
      toast({
        title: "Error loading race participants",
        description: leaderboardError.message || "Please try again later",
      });
    }
  }, [raceConfigError, leaderboardError, toast, showPrevious]);

  useEffect(() => {
    if (showPrevious || !raceConfig?.endDate || raceConfig?.status !== 'active') {
      if (raceConfig?.status === 'ended' || raceConfig?.status === 'transition' || (showPrevious && displayRaceData.status === 'ended')) {
          setTimeLeft("Race Ended");
      } else if (raceConfig?.status === 'upcoming' && raceConfig?.startDate) {
          setTimeLeft("Starts Soon");
      } else {
          setTimeLeft("--:--:--");
      }
      return;
    }

    const updateTimer = () => {
      const end = new Date(raceConfig.endDate!);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Race Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimer();
    setIsAnimationReady(true);

    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [raceConfig, showPrevious, displayRaceData.status]);

  const toggleContentVisibility = useCallback(() => {
    setIsContentVisible(prev => !prev);
  }, []);

  const toggleRaceView = useCallback(() => {
    setShowPrevious(prev => !prev);
  }, []);

  const [hasSeenNotification, setHasSeenNotification] = useState(false);

  useEffect(() => {
    if (raceConfig && !isLoadingRaceConfig && raceConfig.id) {
      setHasSeenNotification(false);
    }
  }, [raceConfig?.id, isLoadingRaceConfig]);

  const handleNotificationClick = useCallback(() => {
    setIsContentVisible(true);
    setHasSeenNotification(true);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 
                    sm:top-24 sm:right-6">
      <AnimatePresence>
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isContentVisible ? 0 : "calc(100% - 48px)" }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-start"
        >
          <div 
            className="order-first"
          >
            <button
              onClick={handleSpeedIconClick}
              aria-label={
                !isContentVisible ? "Show race timer" :
                !isExpanded ? "Expand race details" : 
                "Hide race timer"
              }
              className="bg-[#1A1B21]/90 backdrop-blur-sm border border-[#2A2B31] border-r-0 rounded-l-lg p-2.5 flex items-center justify-center hover:bg-[#1A1B21] transition-colors group relative"
            >
              {!isLoading && raceConfig && !hasSeenNotification && !isContentVisible && (
                <span className="absolute -top-0.5 -left-1.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] ring-2 ring-red-400/50" />
              )}
              {isLoading ? (
                <div className="h-7 w-7 animate-pulse bg-[#2A2B31]/50 rounded-full"></div>
              ) : (
                <SpeedIcon 
                  className="h-7 w-7 text-[#D7FF00] group-hover:scale-110 transition-all"
                  isAnimating={isAnimationReady} 
                />
              )}
            </button>
          </div>
          
          <div className="w-72 max-w-[calc(100vw-4rem)] bg-[#1A1B21]/90 backdrop-blur-sm border border-[#2A2B31] rounded-l-lg shadow-lg overflow-hidden order-last">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-[#D7FF00]" />
                  <span className="font-heading text-white text-sm">
                    {displayRaceData.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {!showPrevious && raceConfig?.status === 'active' && (
                    <>
                      <Clock className="h-3.5 w-3.5 text-[#D7FF00]" />
                      <span className="text-white font-mono text-sm">{timeLeft}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[#8A8B91] text-sm">
                  {displayRaceData.startDate 
                    ? new Date(displayRaceData.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
                    : isLoading ? 'Loading...' : error ? 'Error' : ''}
                </span>
                <button 
                  onClick={toggleRaceView}
                  aria-label={showPrevious ? "Show current race" : "Show previous race"}
                  className="p-1 rounded hover:bg-[#2A2B31] transition-colors"
                >
                  <History className="h-4 w-4 text-[#8A8B91] hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 border-t border-[#2A2B31]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[#8A8B91] text-sm">
                        {displayRaceData.prizePool 
                          ? `Prize Pool: $${displayRaceData.prizePool.toLocaleString()}` 
                          : isLoading ? 'Loading prize...' : 'Prize N/A'}
                      </span>
                      {displayRaceData.status && (
                        <span className={`
                          text-xs px-2 py-1 rounded-full font-medium flex items-center
                          ${displayRaceData.status === 'live' || displayRaceData.status === 'active' 
                            ? 'bg-green-500/30 text-green-300 border border-green-500/40' : 
                            displayRaceData.status === 'ended' || displayRaceData.status === 'transition'
                            ? 'bg-gray-500/30 text-gray-300 border border-gray-500/40' :
                            'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {(displayRaceData.status === 'live' || displayRaceData.status === 'active') && (
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                          )}
                          {displayRaceData.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {isLoading && !showPrevious ? (
                      <div className="flex justify-center py-4">
                        <div className="h-8 w-8 rounded-full border-2 border-[#D7FF00] border-t-transparent animate-spin"></div>
                      </div>
                    ) : error && !showPrevious ? (
                      <div className="text-center text-red-400 py-4">
                        Error loading participants.
                      </div>
                    ) : displayRaceData.participants && displayRaceData.participants.length > 0 ? (
                      <div className="space-y-0.5">
                        {displayRaceData.participants.map((participant: WidgetRaceParticipant, index) => (
                          <div 
                            key={participant.userId}
                            className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[#2A2B31]/50 transition-colors group"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`
                                w-4 h-4 flex items-center justify-center rounded-full text-xs font-medium
                                ${index === 0 ? 'bg-yellow-500 text-black shadow-sm shadow-yellow-500/50' : ''}
                                ${index === 1 ? 'bg-gray-400 text-black shadow-sm shadow-gray-400/50' : ''}
                                ${index === 2 ? 'bg-amber-700 text-white shadow-sm shadow-amber-700/50' : ''}
                                ${index > 2 ? 'bg-[#2A2B31] text-white group-hover:bg-[#3A3B41] transition-colors' : ''}
                              `}>
                                {participant.rank}
                              </span>
                              <span className="text-white truncate max-w-[110px] group-hover:text-[#D7FF00] transition-colors text-sm">
                                {participant.username}
                              </span>
                            </div>
                            <span className="text-[#D7FF00] font-mono text-sm">
                              ${(participant.wagered || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : showPrevious ? (
                      <div className="text-center text-[#8A8B91] py-4">
                        Previous race details not available.
                      </div>
                    ) : (
                      <div className="text-center text-[#8A8B91] py-4">
                        No participants yet or data unavailable.
                      </div>
                    )}
                    
                    <Link href="/wager-races">
                      <a className="block text-center text-[#D7FF00] mt-3 py-1.5 px-3 rounded-md hover:bg-[#D7FF00]/10 transition-colors text-sm">
                        View Full Leaderboard →
                      </a>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}