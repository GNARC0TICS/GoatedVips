import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, History, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
}

const SpeedIcon = (props: React.SVGProps<SVGSVGElement> & { isAnimating?: boolean }) => {
  const maskId = "lineMdSpeedTwotoneLoop" + Math.random().toString(36).substr(2, 5); // Generate unique ID
  const { isAnimating = true, ...svgProps } = props;
  
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

export function RaceTimer() {
  const [isExpanded] = useState(true);
  const [showPrevious, setShowPrevious] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isVisible] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const { toast } = useToast();

  const fetchRaceData = async (endpoint: string): Promise<RaceData> => {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Failed to fetch race data');
    }
    return response.json();
  };

  const { 
    data: currentRaceData, 
    error: currentError, 
    isLoading: isCurrentLoading 
  } = useQuery<RaceData, Error>({
    queryKey: ["/api/wager-races/current"],
    queryFn: () => fetchRaceData('/api/wager-races/current'),
    refetchInterval: 30000,
    retry: 3,
    enabled: isVisible && !showPrevious,
    staleTime: 60000,
    onError: (error: Error) => {
      console.error('Race data fetch error:', error);
      toast({
        title: "Error loading race data",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });

  const { 
    data: previousRaceData, 
    error: previousError, 
    isLoading: isPreviousLoading 
  } = useQuery<RaceData, Error>({
    queryKey: ["/api/wager-races/previous"],
    queryFn: () => fetchRaceData('/api/wager-races/previous'),
    enabled: isVisible && showPrevious
  });

  const raceData = showPrevious ? previousRaceData : currentRaceData;
  const error = showPrevious ? previousError : currentError;
  const isLoading = showPrevious ? isPreviousLoading : isCurrentLoading;

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
    // Set animation ready state once data is loaded
    setIsAnimationReady(true);
    
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [currentRaceData?.endDate]);

  if (error || isLoading || (!raceData && !isVisible)) return null;

  return (
    <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: isContentVisible ? 0 : "calc(100% - 48px)" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-start"
          >
            <button
              onClick={() => {
                setIsContentVisible(!isContentVisible);
                setNotificationDismissed(true);
              }}
              className="bg-[#1A1B21]/90 backdrop-blur-sm border border-[#2A2B31] border-r-0 rounded-l-lg p-3 flex items-center justify-center hover:bg-[#1A1B21] transition-colors group relative"
            >
              {isCurrentLoading ? (
                <div className="h-7 w-7 animate-pulse bg-[#2A2B31]/50 rounded-full"></div>
              ) : (
                <>
                  <SpeedIcon 
                    className={`h-7 w-7 text-[#D7FF00] group-hover:scale-110 transition-all`} 
                    isAnimating={isAnimationReady} 
                  />
                  {isAnimationReady && !isContentVisible && !notificationDismissed && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#D7FF00] rounded-full animate-pulse">
                      <span className="absolute inset-0 h-full w-full bg-[#D7FF00] rounded-full animate-ping opacity-75"></span>
                    </span>
                  )}
                </>
              )}
            </button>
            <div className="w-80 bg-[#1A1B21]/90 backdrop-blur-sm border border-[#2A2B31] rounded-l-lg shadow-lg overflow-hidden">
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
                        <SpeedIcon className="h-4 w-4 text-[#D7FF00]" />
                        <span className="text-white font-mono">{timeLeft}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-[#8A8B91] text-sm">
                    {new Date(raceData.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => setShowPrevious(!showPrevious)}
                    className="p-1 rounded hover:bg-[#2A2B31] transition-colors"
                  >
                    <History className="h-4 w-4 text-[#8A8B91]" />
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
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[#8A8B91] text-sm">
                          Prize Pool: ${raceData.prizePool.toLocaleString()}
                        </span>
                      </div>
                      {raceData.participants.map((participant, index) => (
                        <div 
                          key={participant.uid}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`
                              w-5 h-5 flex items-center justify-center rounded-full text-sm font-medium
                              ${index === 0 ? 'bg-yellow-500 text-black' : ''}
                              ${index === 1 ? 'bg-gray-400 text-black' : ''}
                              ${index === 2 ? 'bg-amber-700 text-white' : ''}
                              ${index > 2 ? 'bg-[#2A2B31] text-white' : ''}
                            `}>
                              {index + 1}
                            </span>
                            <span className="text-white truncate max-w-[120px]">
                              {participant.name}
                            </span>
                          </div>
                          <span className="text-[#D7FF00] font-mono">
                            ${participant.wagered.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <Link href="/wager-races">
                        <a className="block text-center text-[#D7FF00] mt-4 hover:underline">
                          View Full Leaderboard
                        </a>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}