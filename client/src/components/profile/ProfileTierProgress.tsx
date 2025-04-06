import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/services/profileService";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import { ChevronRight, Zap } from "lucide-react";
import { 
  getTierFromWager, 
  getNextTierInfo,
  getTierInfo,
  getNextTierProgress
} from "@/lib/tier-utils";

interface ProfileTierProgressProps {
  profile: Profile;
  className?: string;
}

/**
 * Component for displaying user tier progress information
 * Shows current tier and progress to next tier
 */
export function ProfileTierProgress({ profile, className }: ProfileTierProgressProps) {
  const totalWager = profile.totalWager || 0;
  const currentTier = getTierFromWager(totalWager);
  const currentTierInfo = getTierInfo(currentTier);
  const nextTierData = getNextTierInfo(totalWager);
  
  // If at highest tier, show special message
  if (!nextTierData) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">VIP Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={cn("rounded-full bg-rose-100 p-1", currentTierInfo.color)}>
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Legendary Status</p>
              <p className="text-xs text-muted-foreground">
                You've reached the highest VIP tier! Enjoy your exclusive benefits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate percentage for progress bar
  const progressPercent = nextTierData.progress * 100;
  const CurrentTierIcon = currentTierInfo.icon;
  const NextTierIcon = nextTierData.info.icon;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">VIP Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("rounded-full bg-gray-100 p-1", currentTierInfo.color)}>
                <CurrentTierIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{currentTierInfo.name}</p>
                <p className="text-xs text-muted-foreground">Current tier</p>
              </div>
            </div>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className={cn("rounded-full bg-gray-100 p-1", nextTierData.info.color)}>
                <NextTierIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{nextTierData.info.name}</p>
                <p className="text-xs text-muted-foreground">Next tier</p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div 
              className={cn("h-full bg-primary")} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            Wager {formatCurrency(nextTierData.remaining)} more to reach {nextTierData.info.name} tier
          </p>
        </div>
      </CardContent>
    </Card>
  );
}