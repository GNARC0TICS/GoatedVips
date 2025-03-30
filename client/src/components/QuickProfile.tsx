
import React, { useState } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { getTierFromWager, getTierIcon } from "@/lib/tier-utils";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "./LoadingSpinner";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QuickProfileProps {
  userId: string;
  username: string;
  children: React.ReactNode;
}

export function QuickProfile({ userId, username, children }: QuickProfileProps) {
  const [open, setOpen] = useState(false);
  
  const { data: leaderboardData, isLoading } = useQuery<any>({
    queryKey: ["/api/affiliate/stats"],
    staleTime: 30000,
  });

  const stats = React.useMemo(() => {
    if (!leaderboardData?.data) return null;

    const userStats = {
      today: leaderboardData?.data?.today?.data?.find((p: any) => p.uid === userId)?.wagered?.today || 0,
      this_week: leaderboardData?.data?.weekly?.data?.find((p: any) => p.uid === userId)?.wagered?.this_week || 0,
      this_month: leaderboardData?.data?.monthly?.data?.find((p: any) => p.uid === userId)?.wagered?.this_month || 0,
      all_time: leaderboardData?.data?.all_time?.data?.find((p: any) => p.uid === userId)?.wagered?.all_time || 0,
    };

    const rankings = {
      weekly: (leaderboardData?.data?.weekly?.data?.findIndex((p: any) => p.uid === userId) + 1) || undefined,
      monthly: (leaderboardData?.data?.monthly?.data?.findIndex((p: any) => p.uid === userId) + 1) || undefined,
      all_time: (leaderboardData?.data?.all_time?.data?.findIndex((p: any) => p.uid === userId) + 1) || undefined,
    };

    return { wagered: userStats, rankings };
  }, [leaderboardData, userId]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <span className="cursor-pointer">{children}</span>
      </SheetTrigger>
      <SheetContent className="bg-[#1A1B21] border-l border-[#2A2B31] p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-center text-white text-xl">
            Player Profile
          </SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 justify-center mb-2">
              <img
                src={getTierIcon(getTierFromWager(stats?.wagered.all_time || 0))}
                alt="VIP Tier"
                className="w-12 h-12"
              />
              <span className="text-2xl font-heading text-white">{username}</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/30">
                <span className="text-white/80 text-sm">Weekly Rank:</span>
                <span className="text-[#10B981] font-mono text-lg font-bold">#{stats?.rankings.weekly || '-'}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/30">
                <span className="text-white/80 text-sm">Monthly Rank:</span>
                <span className="text-[#F59E0B] font-mono text-lg font-bold">#{stats?.rankings.monthly || '-'}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/30">
                <span className="text-white/80 text-sm">All-Time Rank:</span>
                <span className="text-[#EC4899] font-mono text-lg font-bold">#{stats?.rankings.all_time || '-'}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#D7FF00]/10 border border-[#D7FF00]/20">
              <div className="flex justify-between items-center">
                <span className="text-[#D7FF00] text-sm font-semibold">All-Time Wagered:</span>
                <span className="text-white font-mono font-bold text-lg">
                  ${stats?.wagered.all_time.toLocaleString() || '0'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center mt-4 space-x-3">
              <SheetClose asChild>
                <Button className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/80">
                  Close
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button 
                  className="bg-[#2A2B31] text-white hover:bg-[#3A3B41]"
                  onClick={() => window.location.href = `/user/${userId}`}
                >
                  View Full Profile
                </Button>
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
