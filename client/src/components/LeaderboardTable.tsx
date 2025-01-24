import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Calendar,
  CalendarDays,
  Search,
  Crown,
  Medal,
  Award,
  TrendingUp,
  Star,
  Trophy,
  CircleDot,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLeaderboard, type TimePeriod } from "@/hooks/use-leaderboard";
import { getTierFromWager, getTierIcon } from "@/lib/tier-utils";
import { QuickProfile } from "@/components/QuickProfile";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 10;

export function LeaderboardTable() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("today");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error, metadata, refetch } = useLeaderboard(timePeriod);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((entry) =>
      entry.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-400" />;
      case 2:
        return <Medal className="h-7 w-7 text-gray-400" />;
      case 3:
        return <Award className="h-7 w-7 text-amber-700" />;
      default:
        return <Star className="h-5 w-5 text-zinc-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#2A2B31] bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 font-heading text-[#D7FF00]">RANK</TableHead>
              <TableHead className="font-heading text-[#D7FF00]">USERNAME</TableHead>
              <TableHead className="text-right font-heading text-[#D7FF00]">WAGER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i} className="bg-card/50">
                <TableCell>
                  <div className="animate-pulse h-6 w-16 bg-muted rounded" />
                </TableCell>
                <TableCell>
                  <div className="animate-pulse h-6 w-32 bg-muted rounded" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="animate-pulse h-6 w-24 bg-muted rounded ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const getWagerAmount = (entry: any) => {
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
    }
  };

  const renderTimePeriodIcon = (period: TimePeriod) => {
    switch (period) {
      case "today":
        return <Clock className="h-4 w-4" />;
      case "weekly":
        return <Calendar className="h-4 w-4" />;
      case "monthly":
        return <CalendarDays className="h-4 w-4" />;
      case "all_time":
        return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center mb-4 text-center">
        <div>
          <motion.h2
            key={timePeriod}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold text-[#D7FF00] mb-2"
          >
            {timePeriod.toUpperCase()} LEADERBOARD
          </motion.h2>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="text-[#D7FF00] font-heading">LIVE UPDATES</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 justify-center flex-wrap">
          {[
            { id: "today", label: "TODAY" },
            { id: "weekly", label: "WEEKLY" },
            { id: "monthly", label: "MONTHLY" },
            { id: "all_time", label: "ALL TIME" },
          ].map(({ id, label }) => (
            <Button
              key={id}
              variant={timePeriod === id ? "default" : "outline"}
              onClick={() => {
                setTimePeriod(id as TimePeriod);
                refetch();
              }}
              className={`font-heading flex items-center gap-2 ${
                timePeriod === id
                  ? "bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90"
                  : "border-[#2A2B31] hover:border-[#D7FF00]/50"
              }`}
            >
              {renderTimePeriodIcon(id as TimePeriod)}
              {label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-md mx-auto w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#2A2B31] bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 font-heading text-[#D7FF00]">RANK</TableHead>
              <TableHead className="font-heading text-[#D7FF00]">USERNAME</TableHead>
              <TableHead className="text-right font-heading text-[#D7FF00]">WAGER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData
              .slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
              .map((entry, index) => (
                <motion.tr
                  key={entry.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-card/50 hover:bg-card"
                >
                  <TableCell className="font-heading">
                    <div className="flex items-center gap-2">
                      {getTrophyIcon(index + 1 + currentPage * ITEMS_PER_PAGE)}
                      {index + 1 + currentPage * ITEMS_PER_PAGE}
                    </div>
                  </TableCell>
                  <TableCell>
                    <QuickProfile userId={entry.uid} username={entry.name}>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <img
                          src={getTierIcon(getTierFromWager(entry.wagered.all_time))}
                          alt="Tier"
                          className="w-5 h-5"
                        />
                        <span className="truncate">{entry.name}</span>
                      </div>
                    </QuickProfile>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      ${getWagerAmount(entry).toLocaleString()}
                      {entry.isWagering && entry.wagerChange > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-green-500 flex items-center gap-1"
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs font-bold">
                            +${entry.wagerChange.toLocaleString()}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
