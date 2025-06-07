import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Crown,
  Medal,
  Award,
  Star,
  TrendingUp,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";
import { useLeaderboard, type TimePeriod } from "@/hooks/use-leaderboard";
import { getTierFromWager, getTierIcon } from "@/lib/tier-utils";
import { QuickProfile } from "@/components/QuickProfile";
import { motion, AnimatePresence } from "framer-motion";

// Constants
const ITEMS_PER_PAGE = 10;

// Types
interface WagerData {
  today: number;
  this_week: number;
  this_month: number;
  all_time: number;
}

interface LeaderboardEntry {
  uid: string;
  name: string;
  wagered: WagerData;
  isWagering?: boolean;
  wagerChange?: number;
}

interface LeaderboardTableProps {
  timePeriod: TimePeriod;
}

const getTableRowVariants = (index: number) => ({
  initial: { 
    opacity: 0,
    y: 20,
    scale: 0.95,
    filter: "blur(4px)"
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      delay: index * 0.05,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    filter: "blur(4px)",
    transition: { duration: 0.2 }
  }
});

const getHighlightVariants = (rank: number) => ({
  initial: { scale: 1 },
  animate: {
    scale: rank <= 3 ? [1, 1.02, 1] : 1,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
});

/**
 * LeaderboardTable Component
 * Displays a paginated table of users ranked by their wager amounts.
 * Includes search functionality and real-time updates.
 */
export const LeaderboardTable = React.memo(function LeaderboardTable({ timePeriod }: LeaderboardTableProps) {
  // State management
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch leaderboard data
  const { data, isLoading, error, metadata } = useLeaderboard(timePeriod);

  // Filter data based on search query (memoized)
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((entry: LeaderboardEntry) =>
      entry.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil((filteredData.length || 0) / ITEMS_PER_PAGE);

  /**
   * Returns the appropriate trophy icon based on rank
   */
  const getTrophyIcon = useCallback((rank: number) => {
    switch (rank) {
      case 1:
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="h-8 w-8 text-yellow-400" />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Medal className="h-7 w-7 text-gray-400" />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Award className="h-7 w-7 text-amber-700" />
          </motion.div>
        );
      default:
        return <Star className="h-5 w-5 text-zinc-600" />;
    }
  }, []);

  // Pagination handlers
  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  /**
   * Gets the wager amount based on the selected time period
   */
  const getWagerAmount = useCallback((entry: LeaderboardEntry) => {
    if (!entry?.wagered) return 0;
    switch (timePeriod) {
      case "weekly":
        return entry.wagered.this_week;
      case "monthly":
        return entry.wagered.this_month;
      case "today":
        return entry.wagered.today;
      case "all_time":
        return entry.wagered.all_time;
      default:
        return 0;
    }
  }, [timePeriod]);

  const getLastUpdateTime = (timestamp?: string) => {
    if (!timestamp) return 'recently';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 font-heading text-[#D7FF00]">RANK</TableHead>
              <TableHead className="font-heading text-[#D7FF00]">USERNAME</TableHead>
              <TableHead className="text-right font-heading text-[#D7FF00]">WAGER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-[#1A1B21]/50 backdrop-blur-sm"
              >
                <TableCell>
                  <div className="animate-pulse h-6 w-16 bg-muted rounded" />
                </TableCell>
                <TableCell>
                  <div className="animate-pulse h-6 w-32 bg-muted rounded" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="animate-pulse h-6 w-24 bg-muted rounded ml-auto" />
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-4">
      {/* Search and Live Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 max-w-md mx-auto w-full mb-4"
      >
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-[#D7FF00]" />
          <Input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1A1B21]/50 backdrop-blur-sm border-[#2A2B31] text-white transition-all 
                     focus:ring-2 focus:ring-[#D7FF00]/50 hover:border-[#D7FF00]/50"
          />
        </div>
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1 px-3 py-1 bg-[#1A1B21]/50 border border-[#2A2B31] rounded-lg"
        >
          <CircleDot className="h-3 w-3 text-red-500" />
          <span className="text-xs text-red-500 font-heading">LIVE</span>
        </motion.div>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-lg border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm overflow-hidden"
      >
        <div
          className="overflow-x-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#2A2B31 #14151A" }}
        >
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] md:w-20 font-heading text-[#D7FF00] px-1 md:px-4 text-xs md:text-base whitespace-nowrap font-black">
                  RANK
                </TableHead>
                <TableHead className="font-heading text-[#D7FF00] px-1 md:px-4 text-xs md:text-base font-black">
                  USERNAME
                </TableHead>
                <TableHead className="text-right font-heading text-[#D7FF00] px-1 md:px-4 text-xs md:text-base whitespace-nowrap font-black">
                  WAGER
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredData
                  .slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
                  .map((entry: LeaderboardEntry, index: number) => {
                    const rank = index + 1 + currentPage * ITEMS_PER_PAGE;
                    return (
                      <motion.tr
                        key={entry.uid}
                        variants={getTableRowVariants(index)}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                        className={`bg-[#1A1B21]/50 backdrop-blur-sm hover:bg-[#1A1B21] transition-colors
                                  ${rank <= 3 ? 'relative overflow-visible z-10' : ''}`}
                      >
                        <TableCell className="font-heading px-1 md:px-4">
                          <motion.div 
                            variants={getHighlightVariants(rank)}
                            className="flex items-center gap-1 md:gap-2"
                          >
                            <div className="hidden md:block">
                              {getTrophyIcon(rank)}
                            </div>
                            <span className={`text-xs md:text-base
                              ${rank === 1 ? 'text-yellow-400' : 
                                rank === 2 ? 'text-gray-400' : 
                                rank === 3 ? 'text-amber-700' : 
                                'text-[#D7FF00]'}`}
                            >
                              {rank}
                            </span>
                          </motion.div>
                        </TableCell>
                        <TableCell>
                          <QuickProfile userId={entry.uid} username={entry.name}>
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <img
                                src={getTierIcon(getTierFromWager(entry.wagered.all_time))}
                                alt="Tier"
                                className="w-5 h-5"
                              />
                              <span className="truncate text-white hover:text-[#D7FF00] transition-colors">
                                {entry.name}
                              </span>
                            </motion.div>
                          </QuickProfile>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <motion.div 
                              className="relative"
                              initial={false}
                            >
                              <motion.span 
                                key={getWagerAmount(entry)}
                                className="text-white font-semibold inline-block"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ 
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                  mass: 1
                                }}
                              >
                                ${(getWagerAmount(entry) || 0).toLocaleString()}
                              </motion.span>
                              {entry.isWagering && (
                                <motion.div
                                  className="absolute inset-0"
                                  animate={{
                                    boxShadow: ["0 0 0px rgba(215, 255, 0, 0)", "0 0 8px rgba(215, 255, 0, 0.5)", "0 0 0px rgba(215, 255, 0, 0)"]
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                              )}
                            </motion.div>
                            <AnimatePresence>
                              {entry.isWagering && entry.wagerChange && entry.wagerChange > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                  className="text-green-500 flex items-center gap-1"
                                >
                                  <TrendingUp className="h-4 w-4" />
                                  <span className="text-xs font-bold">
                                    +${entry.wagerChange.toLocaleString()}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Total Wagered Summary */}
          <div className="p-6 bg-[#1A1B21]/80 border-t border-[#2A2B31]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-[#8A8B91] font-heading text-sm mb-1">TOTAL WAGERED THIS PERIOD</h4>
                <p className="text-2xl font-bold text-[#D7FF00]">
                  ${filteredData.reduce((sum: number, entry: LeaderboardEntry) => 
                    sum + getWagerAmount(entry), 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <TrendingUp className="h-5 w-5 text-[#D7FF00]" />
                <span className="text-sm">Last updated {metadata?.lastUpdated ? getLastUpdateTime(metadata.lastUpdated) : 'recently'}</span>
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 border-t border-[#2A2B31] flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 text-[#8A8B91]">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {metadata?.totalUsers || filteredData.length} Players
              </span>
            </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="h-9 w-9 bg-[#D7FF00] border-[#D7FF00] text-black hover:bg-[#D7FF00]/90 hover:border-[#D7FF00]/90 hover:text-black transition-all duration-200 transform active:scale-95 shadow-lg disabled:opacity-50 disabled:shadow-none disabled:transform-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-[#8A8B91] text-sm font-medium px-2 min-w-[100px] text-center">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="h-9 w-9 bg-[#D7FF00] border-[#D7FF00] text-black hover:bg-[#D7FF00]/90 hover:border-[#D7FF00]/90 hover:text-black transition-all duration-200 transform active:scale-95 shadow-lg disabled:opacity-50 disabled:shadow-none disabled:transform-none"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});