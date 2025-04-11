import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/services/profileService";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import { 
  TrendingUp, CalendarDays, Clock, CalendarRange
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileStatsProps {
  profile: Profile;
  className?: string;
}

/**
 * Component for displaying user profile statistics
 * Focuses on wager data for different time periods
 * Enhanced with glass morphism styling and animations
 */
export function ProfileStats({ profile, className }: ProfileStatsProps) {
  // Get actual wager data from profile
  const allTimeWager = profile.totalWager ? parseFloat(String(profile.totalWager)) : 0;
  
  // Get wager data from stats object or use defaults
  const stats = profile.stats || {};
  const wageredStats = (stats as any)?.wagered || {};
  
  const monthlyWager = wageredStats.monthly || 0;
  const weeklyWager = wageredStats.weekly || 0;
  const dailyWager = wageredStats.daily || 0;
  
  // Animation variants for staggered card entries
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className={cn("grid gap-4 sm:grid-cols-2 md:grid-cols-4", className)}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <StatCard 
        title="All-Time Wager"
        value={formatCurrency(allTimeWager)}
        icon={TrendingUp}
        description="Lifetime wagered amount"
        className="from-blue-900/20 to-blue-800/10 border-blue-700/20 text-blue-400"
        variants={item}
      />
      
      <StatCard 
        title="Monthly Wager"
        value={formatCurrency(monthlyWager)}
        icon={CalendarRange}
        description="This month's total"
        className="from-green-900/20 to-green-800/10 border-green-700/20 text-green-400"
        variants={item}
      />
      
      <StatCard 
        title="Weekly Wager"
        value={formatCurrency(weeklyWager)}
        icon={CalendarDays}
        description="This week's total"
        className="from-amber-900/20 to-amber-800/10 border-amber-700/20 text-amber-400"
        variants={item}
      />
      
      <StatCard 
        title="Daily Wager"
        value={formatCurrency(dailyWager)}
        icon={Clock}
        description="Today's total"
        className="from-indigo-900/20 to-indigo-800/10 border-indigo-700/20 text-indigo-400"
        variants={item}
      />
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  description?: string;
  className?: string;
  variants?: any; // For framer-motion
}

/**
 * Enhanced StatCard component with glass morphism styling
 */
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  className,
  variants 
}: StatCardProps) {
  return (
    <motion.div
      variants={variants}
      className="h-full"
    >
      <Card 
        className={cn(
          "overflow-hidden h-full backdrop-blur-md",
          "bg-gradient-to-br border transition-all",
          "hover:shadow-lg hover:translate-y-[-2px]",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs opacity-70">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}