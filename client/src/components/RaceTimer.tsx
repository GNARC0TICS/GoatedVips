import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, History, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Inline SpeedIcon component
const SpeedIcon = ({ isAnimating = true, ...svgProps }: any) => {
  const maskId = "lineMdSpeedTwotoneLoop" + Math.random().toString(36).substr(2, 5);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...svgProps}>
      <mask id={maskId}>
        <path fill="#fff" fillOpacity="0" stroke="#fff" strokeDasharray="56" strokeDashoffset="56" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19v0c-0.3 0 -0.59 -0.15 -0.74 -0.41c-0.8 -1.34 -1.26 -2.91 -1.26 -4.59c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 1.68 -0.46 3.25 -1.26 4.59c-0.15 0.26 -0.44 0.41 -0.74 0.41Z">
          {isAnimating && (
            <>
              <animate fill="freeze" attributeName="fill-opacity" begin="0.3s" dur="0.15s" values="0;0.3"/>
              <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="56;0"/>
            </>
          )}
        </path>
        <g transform="rotate(-100 12 14)">
          <path d="M12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14Z">
            {isAnimating && (
              <animate fill="freeze" attributeName="d" begin="0.4s" dur="0.2s" values="M12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14Z;M16 14C16 16.21 14.21 18 12 18C9.79 18 8 16.21 8 14C8 11.79 12 0 12 0C12 0 16 11.79 16 14Z"/>
            )}
          </path>
          <path fill="#fff" d="M12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14Z">
            {isAnimating && (
              <animate fill="freeze" attributeName="d" begin="0.4s" dur="0.2s" values="M12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14Z;M14 14C14 15.1 13.1 16 12 16C10.9 16 10 15.1 10 14C10 12.9 12 4 12 4C12 4 14 12.9 14 14Z"/>
            )}
          </path>
          {isAnimating && (
            <animateTransform attributeName="transform" begin="0.4s" dur="6s" repeatCount="indefinite" type="rotate" values="-100 12 14;45 12 14;45 12 14;45 12 14;20 12 14;10 12 14;0 12 14;35 12 14;45 12 14;55 12 14;50 12 14;15 12 14;-20 12 14;-100 12 14"/>
          )}
        </g>
      </mask>
      <rect width="24" height="24" fill="currentColor" mask={`url(#${maskId})`}/>
    </svg>
  );
};

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

  return (
    <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50">
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
              onClick={toggleContentVisibility}
              aria-label={isContentVisible ? "Hide race timer" : "Show race timer"}
              className="bg-[#1A1B21]/90 backdrop-blur-sm border border-[#2A2B31] border-r-0 rounded-l-lg p-3 flex items-center justify-center hover:bg-[#1A1B21] transition-colors group"
            >
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