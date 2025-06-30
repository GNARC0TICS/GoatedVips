import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/queries/useLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, Trophy, Crown } from "lucide-react";

export function AffiliateStats() {
  const { data: allTimeData, isLoading: isLoadingAllTime } = useLeaderboard('all_time', { limit: 100 });
  const { data: monthlyData, isLoading: isLoadingMonthly } = useLeaderboard('monthly', { limit: 100 });
  const { data: weeklyData, isLoading: isLoadingWeekly } = useLeaderboard('weekly', { limit: 100 });

  const isLoading = isLoadingAllTime || isLoadingMonthly || isLoadingWeekly;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[150px]" />
        ))}
      </div>
    );
  }

  const totalUsers = allTimeData?.total || 0;
  const totalAllTimeWagers = allTimeData?.entries?.reduce((sum, entry) => sum + (entry.wagered || 0), 0) || 0;
  const totalMonthlyWagers = monthlyData?.entries?.reduce((sum, entry) => sum + (entry.wagered || 0), 0) || 0;
  const totalWeeklyWagers = weeklyData?.entries?.reduce((sum, entry) => sum + (entry.wagered || 0), 0) || 0;

  const topUser = allTimeData?.entries?.[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-[#1A1B21]/50 border-[#2A2B31]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#D7FF00] flex items-center gap-2">
            <Users className="h-5 w-5" />
            Total Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{totalUsers.toLocaleString()}</div>
          <p className="text-sm text-[#8A8B91] mt-1">Active users</p>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1B21]/50 border-[#2A2B31]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#D7FF00] flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            All-Time Wagers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">${totalAllTimeWagers.toLocaleString()}</div>
          <p className="text-sm text-[#8A8B91] mt-1">Total volume</p>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1B21]/50 border-[#2A2B31]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#D7FF00] flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Monthly Wagers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">${totalMonthlyWagers.toLocaleString()}</div>
          <p className="text-sm text-[#8A8B91] mt-1">This month</p>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1B21]/50 border-[#2A2B31]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#D7FF00] flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Top Referral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-white">{topUser?.username || 'No data'}</div>
          <p className="text-sm text-[#8A8B91] mt-1">
            {topUser ? `$${topUser.wagered.toLocaleString()} wagered` : 'Loading...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
