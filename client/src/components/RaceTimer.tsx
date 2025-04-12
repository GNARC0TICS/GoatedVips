import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, History, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { SpeedIcon } from './icons/SpeedIcon';

interface RaceParticipant {
  uid: string;
  name: string;
  wagered: number;
  position: number;
}

interface RaceData {
  id: string;
  status: 'live' | 'ended' | 'upcoming';
  startDate: string;
  endDate: string;
  prizePool: number;
  participants: RaceParticipant[];
  totalWagered?: number;
  participantCount?: number;
  metadata?: {
    transitionEnds?: string;
    nextRaceStarts?: string;
    prizeDistribution?: number[];
  };
}

/**
 * RaceTimer Component
 * 
 * A floating widget displaying information about the current or previous wager race
 * with dynamic timeLeft updates and animation effects.
 */
export function RaceTimer() {
  const [isExpanded] = useState(true);
  const [showPrevious, setShowPrevious] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isContentVisible, setIsContentVisible] = useState(false); // Start hidden
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const { toast } = useToast();

  // API request function - memoized to prevent unnecessary recreations
  const fetchRaceData = useCallback(async (endpoint: string): Promise<RaceData> => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch race data: ${response.status}`);
      }
      const json = await response.json();
      return json.data; // Ensure we're extracting the data property from the response
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  }, []);

  // Query for current race data
  const { 
    data: currentRaceData, 
    error: currentError, 
    isLoading: isCurrentLoading 
  } = useQuery({
    queryKey: ["/api/wager-races/current"],
    queryFn: () => fetchRaceData('/api/wager-races/current'),
    refetchInterval: 5 * 60 * 1000, // 5 minutes - aligned with server cache time
    retry: 3,
    enabled: true, // Always keep this query active so animation starts
    staleTime: 4 * 60 * 1000, // 4 minutes
  });

  // Query for previous race data
  const { 
    data: previousRaceData, 
    error: previousError, 
    isLoading: isPreviousLoading 
  } = useQuery({
    queryKey: ["/api/wager-races/previous"],
    queryFn: () => fetchRaceData('/api/wager-races/previous'),
    enabled: showPrevious,
    staleTime: Infinity, // Previous race data doesn't change often
    retry: 3,
  });

  // Handle errors
  useEffect(() => {
    if (currentError) {
      console.error('Race data fetch error:', currentError);
      toast({
        title: "Error loading race data",
        description: currentError.message || "Please try again later",
      });
    }
    if (previousError && showPrevious) {
      console.error('Previous race data fetch error:', previousError);
      toast({
        title: "Error loading previous race data",
        description: previousError.message || "Please try again later",
      });
    }
  }, [currentError, previousError, toast, showPrevious]);

  // Memoized values to prevent unnecessary re-renders
  const raceData = useMemo(() => 
    showPrevious ? previousRaceData : currentRaceData, 
  [showPrevious, previousRaceData, currentRaceData]);
  
  const error = useMemo(() => 
    showPrevious ? previousError : currentError, 
  [showPrevious, previousError, currentError]);
  
  const isLoading = useMemo(() => 
    showPrevious ? isPreviousLoading : isCurrentLoading, 
  [showPrevious, isPreviousLoading, isCurrentLoading]);

  // Update timer effect
  useEffect(() => {
    if (!currentRaceData?.endDate) return;

    const updateTimer = () => {
      const end = new Date(currentRaceData.endDate);
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

    // Update every minute
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [currentRaceData?.endDate]);

  // Toggle handler for showing/hiding the content panel
  const toggleContentVisibility = useCallback(() => {
    setIsContentVisible(prev => !prev);
  }, []);

  // Toggle handler for switching between current and previous race
  const toggleRaceView = useCallback(() => {
    setShowPrevious(prev => !prev);
  }, []);

  const [hasSeenNotification, setHasSeenNotification] = useState(false);

  // Reset notification when new data loads
  useEffect(() => {
    if (currentRaceData && !isLoading) {
      setHasSeenNotification(false);
    }
  }, [currentRaceData, isLoading]);

  const handleNotificationClick = useCallback(() => {
    setIsContentVisible(true);
    setHasSeenNotification(true);
  }, []);

  return (
    <div className="fixed md:top-1/2 top-20 right-0 md:transform md:-translate-y-1/2 z-50">
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
              onClick={handleNotificationClick}
              aria-label={isContentVisible ? "Hide race timer" : "Show race timer"}
              className="bg-[#1A1B21]/90 backdrop-blur-sm border border-[#2A2B31] border-r-0 rounded-l-lg p-3 flex items-center justify-center hover:bg-[#1A1B21] transition-colors group relative"
            >
              {!isLoading && currentRaceData && !hasSeenNotification && !isContentVisible && (
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
          
          <div className="w-80 bg-[#1A1B21]/90 backdrop-blur-sm border border-[#2A2B31] rounded-l-lg shadow-lg overflow-hidden order-last">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#D7FF00]" />
                  <span className="font-heading text-white">
                    {showPrevious ? 'Previous Race' : 'Monthly Race'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!showPrevious && (
                    <>
                      {/* Changed from SpeedIcon to Clock icon */}
                      <Clock className="h-4 w-4 text-[#D7FF00]" />
                      <span className="text-white font-mono">{timeLeft}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-[#8A8B91] text-sm">
                  {raceData && raceData.startDate 
                    ? new Date(raceData.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
                    : isLoading ? 'Loading...' : error ? 'Error loading data' : ''}
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
                  <div className="p-4 border-t border-[#2A2B31]">
                    {/* Race Details Section */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[#8A8B91] text-sm">
                        {raceData && raceData.prizePool 
                          ? `Prize Pool: $${raceData.prizePool.toLocaleString()}` 
                          : isLoading ? 'Loading prize pool...' : ''}
                      </span>
                      {/* Improved status badge styling */}
                      {raceData?.status && (
                        <span className={`
                          text-xs px-2 py-1 rounded-full font-medium flex items-center
                          ${raceData.status === 'live' 
                            ? 'bg-green-500/30 text-green-300 border border-green-500/40' : 
                            raceData.status === 'ended' 
                            ? 'bg-gray-500/30 text-gray-300 border border-gray-500/40' :
                            'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {raceData.status === 'live' && (
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                          )}
                          {raceData.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {/* Participants List */}
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="h-8 w-8 rounded-full border-2 border-[#D7FF00] border-t-transparent animate-spin"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-400 py-4">
                        Error loading race data. Please try again.
                      </div>
                    ) : raceData && raceData.participants && raceData.participants.length > 0 ? (
                      <div className="space-y-1">
                        {raceData.participants.map((participant, index) => (
                          <div 
                            key={participant.uid}
                            className="flex items-center justify-between py-2 px-2 rounded hover:bg-[#2A2B31]/50 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`
                                w-5 h-5 flex items-center justify-center rounded-full text-sm font-medium
                                ${index === 0 ? 'bg-yellow-500 text-black shadow-sm shadow-yellow-500/50' : ''}
                                ${index === 1 ? 'bg-gray-400 text-black shadow-sm shadow-gray-400/50' : ''}
                                ${index === 2 ? 'bg-amber-700 text-white shadow-sm shadow-amber-700/50' : ''}
                                ${index > 2 ? 'bg-[#2A2B31] text-white group-hover:bg-[#3A3B41] transition-colors' : ''}
                              `}>
                                {index + 1}
                              </span>
                              <span className="text-white truncate max-w-[120px] group-hover:text-[#D7FF00] transition-colors">
                                {participant.name}
                              </span>
                            </div>
                            <span className="text-[#D7FF00] font-mono">
                              ${participant.wagered.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-[#8A8B91] py-4">
                        No participants found
                      </div>
                    )}
                    
                    {/* Footer Action */}
                    <Link href="/wager-races">
                      <a className="block text-center text-[#D7FF00] mt-4 py-2 px-4 rounded-md hover:bg-[#D7FF00]/10 transition-colors">
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