import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trophy, CircleDot, Crown, Medal, Award, Star, Timer, TrendingUp, User } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type WageredData = {
  today: number;
  this_week: number;
  this_month: number;
  all_time: number;
};

type LeaderboardEntry = {
  uid: string;
  name: string;
  wagered: WageredData;
};

export default function WagerRaces() {
  const [raceType] = useState<'weekly' | 'monthly' | 'weekend'>('monthly');
  const { data: leaderboardData, isLoading } = useLeaderboard('monthly');

  const prizePool = 200;
  const prizeDistribution: Record<number, number> = {
    1: 0.50,
    2: 0.15,
    3: 0.10,
    4: 0.0357,
    5: 0.0357,
    6: 0.0357,
    7: 0.0357,
    8: 0.0357,
    9: 0.0357,
    10: 0.0358
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

  const getWagerAmount = (player: LeaderboardEntry) => {
    switch (raceType) {
      case 'weekly':
        return player.wagered.this_week;
      case 'monthly':
        return player.wagered.this_month;
      default:
        return player.wagered.this_week;
    }
  };

  const getPrizeAmount = (rank: number) => {
    return Math.round(prizePool * (prizeDistribution[rank] || 0) * 100) / 100;
  };

  const calculatePoolPercentage = (player: LeaderboardEntry) => {
    const totalWagered = leaderboardData?.reduce((sum, p) => sum + (getWagerAmount(p) || 0), 0) || 1;
    const percentage = ((getWagerAmount(player) || 0) / totalWagered) * 100;
    return percentage.toFixed(2);
  };

  const isActivelyWagering = (player: LeaderboardEntry) => {
    // Mock implementation - in real app, this would compare with previous values
    return player.wagered.today > 0;
  };

  if (isLoading || !leaderboardData) {
    return (
      <div className="min-h-screen bg-[#14151A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const top10Players = (leaderboardData || []).slice(0, 10);
  const currentLeader = top10Players[0];

  return (
    <div className="min-h-screen bg-[#14151A] text-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#D7FF00] mb-2">
                MONTHLY WAGER RACE
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CircleDot className="h-4 w-4 text-red-500 animate-pulse" />
                  <span className="text-[#8A8B91]">Live Competition</span>
                </div>
                <div className="flex items-center gap-2 text-[#8A8B91]">
                  <Timer className="h-4 w-4 text-[#D7FF00]" />
                  <span>Ends in: </span>
                  <CountdownTimer endDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1B21]/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-[#2A2B31] hover:border-[#D7FF00]/50 transition-colors"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <h3 className="text-[#8A8B91] font-heading text-sm mb-2">PRIZE POOL</h3>
                <div className="flex items-baseline gap-2">
                  <Trophy className="h-5 w-5 text-[#D7FF00]" />
                  <p className="text-xl md:text-2xl font-bold">${prizePool.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h3 className="text-[#8A8B91] font-heading text-sm mb-2">TIME REMAINING</h3>
                <div className="flex items-baseline gap-2">
                  <Timer className="h-5 w-5 text-[#D7FF00]" />
                  <CountdownTimer endDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()} />
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-[#8A8B91] font-heading text-sm mb-2">TOP PARTICIPANTS</h3>
                <div className="flex items-baseline gap-2">
                  <Medal className="h-5 w-5 text-[#D7FF00]" />
                  <p className="text-xl md:text-2xl font-bold">{top10Players.length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Podium Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-end h-[400px] gap-4 mb-12"
          >
            {top10Players.slice(0, 3).map((player, index) => {
              const heights = ['h-[300px]', 'h-[250px]', 'h-[200px]'];
              const order = [1, 0, 2]; // Reorder to put 1st place in middle
              const displayIndex = order[index];
              return (
              <motion.div
                key={player.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                style={{ order: displayIndex }}
                className={`relative ${heights[index]} w-full max-w-[280px] bg-[#1A1B21]/50 backdrop-blur-sm p-6 rounded-xl border-2 flex flex-col justify-end ${
                  index === 0
                    ? 'border-[#FFD700] glow-gold'
                    : index === 1
                    ? 'border-[#C0C0C0]'
                    : 'border-[#CD7F32]'
                }`}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-4xl">
                  {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="flex justify-between items-start mb-4">
                  {getTrophyIcon(index + 1)}
                  <span className="text-sm font-heading text-[#8A8B91]">#{index + 1}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[#8A8B91] mb-1">Total Wager</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl">${getWagerAmount(player)?.toLocaleString()}</p>
                      {isActivelyWagering(player) && (
                        <TrendingUp className="h-4 w-4 text-green-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-[#8A8B91] mt-1">
                      {calculatePoolPercentage(player)}% of pool
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8A8B91] mb-1">Prize</p>
                    <p className="text-xl font-heading text-[#D7FF00]">
                      ${getPrizeAmount(index + 1).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Rankings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1B21]/50 backdrop-blur-sm rounded-xl border border-[#2A2B31] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-20 font-heading text-[#D7FF00]">RANK</TableHead>
                    <TableHead className="font-heading text-[#D7FF00]">USERNAME</TableHead>
                    <TableHead className="text-right font-heading text-[#D7FF00]">TOTAL WAGER</TableHead>
                    <TableHead className="text-right font-heading text-[#D7FF00]">POOL %</TableHead>
                    <TableHead className="text-right font-heading text-[#D7FF00]">PRIZE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {top10Players.map((player, index) => (
                      <motion.tr
                        key={player.uid}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-[#1A1B21]/50 backdrop-blur-sm hover:bg-[#1A1B21] ${
                          index < 3 ? 'bg-[#1A1B21]/70' : ''
                        }`}
                      >
                        <TableCell className="font-heading text-white">
                          <div className="flex items-center gap-2">
                            {getTrophyIcon(index + 1)}
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-sans text-white">
                          {player.name}
                        </TableCell>
                        <TableCell className="text-right font-sans text-white">
                          <div className="flex items-center justify-end gap-2">
                            ${getWagerAmount(player)?.toLocaleString()}
                            {isActivelyWagering(player) && (
                              <TrendingUp className="h-4 w-4 text-green-400 animate-pulse" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-sans text-white">
                          {calculatePoolPercentage(player)}%
                        </TableCell>
                        <TableCell className="text-right font-sans text-[#D7FF00]">
                          ${getPrizeAmount(index + 1).toLocaleString()}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </motion.div>

          {/* Disclaimer Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 bg-[#1A1B21]/50 backdrop-blur-sm rounded-xl border border-[#2A2B31]"
          >
            <h3 className="text-xl font-heading font-bold text-[#D7FF00] mb-4">How It Works</h3>
            <div className="space-y-4 text-[#8A8B91]">
              <p>
                The Wager Race is a monthly competition where affiliates compete for a share of the ${prizePool} prize pool.
                Rankings are determined by the total amount wagered through your affiliate links during the competition period.
              </p>
              <p>
                The top 10 affiliates will receive prizes according to their final ranking, with the following distribution:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>1st Place: 50% (${getPrizeAmount(1)})</li>
                <li>2nd Place: 15% (${getPrizeAmount(2)})</li>
                <li>3rd Place: 10% (${getPrizeAmount(3)})</li>
                <li>4th-10th Place: Split remaining 25%</li>
              </ul>
              <p className="font-semibold text-white">
                Prize payments will be processed and distributed within 24 hours of the competition's end.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}