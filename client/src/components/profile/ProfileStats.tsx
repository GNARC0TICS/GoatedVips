import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/services/profileService";
import { formatCurrency, formatNumber, formatPercentage } from "@/utils/format";
import { cn } from "@/utils/cn";
import { AreaChart, Award, Percent, TrendingUp } from "lucide-react";

interface ProfileStatsProps {
  profile: Profile;
  className?: string;
}

/**
 * Component for displaying user profile statistics
 * Shows total wager, win rate, and other key metrics
 */
export function ProfileStats({ profile, className }: ProfileStatsProps) {
  const stats = profile.stats || {};
  const totalWager = profile.totalWager || 0;
  const winRate = stats.winRate || 0;
  const biggestWin = stats.biggestWin || 0;
  const totalWins = stats.totalWins || 0;
  
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 md:grid-cols-4", className)}>
      <StatCard 
        title="Total Wager"
        value={formatCurrency(totalWager)}
        icon={TrendingUp}
        description="Lifetime wagered amount"
        className="bg-blue-50 dark:bg-blue-950"
      />
      
      <StatCard 
        title="Win Rate"
        value={formatPercentage(winRate)}
        icon={Percent}
        description="Success percentage"
        className="bg-green-50 dark:bg-green-950"
      />
      
      <StatCard 
        title="Biggest Win"
        value={formatCurrency(biggestWin)}
        icon={Award}
        description="All-time highest win"
        className="bg-amber-50 dark:bg-amber-950"
      />
      
      <StatCard 
        title="Total Wins"
        value={formatNumber(totalWins)}
        icon={AreaChart}
        description="Number of winning bets"
        className="bg-indigo-50 dark:bg-indigo-950"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  description?: string;
  className?: string;
}

function StatCard({ title, value, icon: Icon, description, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}