import React, { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Loader2, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Award 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import { getTierFromWager, getTierIcon } from "../lib/tier-utils";
import { formatCurrency } from "../lib/format-utils";

interface QuickProfileCardProps {
  userId: string;
  username: string;
  children: React.ReactNode;
}

interface UserStatsResponse {
  id: number;
  username: string;
  goatedId?: string;
  bio?: string;
  profileColor?: string;
  totalWagered: number;
  weeklyWagered: number;
  monthlyWagered: number;
  tier?: string;
  createdAt: string;
  // Verification fields
  goatedAccountLinked?: boolean;
  telegramUsername?: string;
}

export function QuickProfileCard({ userId, username, children }: QuickProfileCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Fetch user data and stats when the dialog is opened
  const { data: user, isLoading, error } = useQuery<UserStatsResponse>({
    queryKey: ['/api/user/stats', userId],
    enabled: open,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1,
    queryFn: async () => {
      const response = await fetch(`/api/user/stats/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      return response.json();
    }
  });

  const handleViewFullProfile = () => {
    setOpen(false);
    setLocation(`/user/${userId}`);
  };

  // Calculate tier from wager data
  const tier = user?.tier || (user?.totalWagered ? getTierFromWager(user.totalWagered) : 'bronze');
  
  // Format join date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        <div style={{ cursor: "pointer" }}>
          {children}
        </div>
      </DialogTrigger>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-[#1A1B23] border-[#2A2B31] text-white">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#D7FF00] animate-spin mb-2" />
              <p>Loading profile...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-400 mb-4">Error loading profile</p>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-[#3A3B41] hover:bg-[#2A2B31]"
              >
                Close
              </Button>
            </div>
          ) : user ? (
            <>
              {/* Header with user info */}
              <div className="border-b border-[#2A2B31] pb-4">
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-3"
                    style={{ backgroundColor: user.profileColor || '#D7FF00', color: '#1A1B23' }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold flex items-center">
                      {username}
                      {user.goatedAccountLinked && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#D7FF00] text-black rounded-sm">
                          Verified
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-[#8A8B91]">
                      {user.telegramUsername ? `@${user.telegramUsername}` : 'No Telegram linked'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Stats cards */}
              <CardContent className="p-4 grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Tier card */}
                  <div className="flex items-center bg-[#242530] rounded-lg p-3">
                    <div className="mr-3">
                      <img 
                        src={getTierIcon(tier)} 
                        alt={`${tier} tier`}
                        className="w-10 h-10" 
                      />
                    </div>
                    <div>
                      <p className="text-xs text-[#8A8B91]">Tier</p>
                      <p className="font-bold capitalize">{tier}</p>
                    </div>
                  </div>
                  
                  {/* Join date card */}
                  <div className="flex items-center bg-[#242530] rounded-lg p-3">
                    <Calendar className="w-8 h-8 mr-3 text-[#D7FF00]" />
                    <div>
                      <p className="text-xs text-[#8A8B91]">Joined</p>
                      <p className="font-bold">{formatJoinDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Wager stats */}
                <div className="space-y-3">
                  {/* Monthly wagers */}
                  <div className="flex items-center justify-between bg-[#242530] rounded-lg p-3">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-3 text-[#D7FF00]" />
                      <span>Monthly Wagered</span>
                    </div>
                    <span className="font-bold">{formatCurrency(user.monthlyWagered || 0)}</span>
                  </div>
                  
                  {/* Weekly wagers */}
                  <div className="flex items-center justify-between bg-[#242530] rounded-lg p-3">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-3 text-[#D7FF00]" />
                      <span>Weekly Wagered</span>
                    </div>
                    <span className="font-bold">{formatCurrency(user.weeklyWagered || 0)}</span>
                  </div>
                  
                  {/* Total wagers */}
                  <div className="flex items-center justify-between bg-[#242530] rounded-lg p-3">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 mr-3 text-[#D7FF00]" />
                      <span>Total Wagered</span>
                    </div>
                    <span className="font-bold">{formatCurrency(user.totalWagered || 0)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2 pb-4 px-4">
                <DialogClose asChild>
                  <Button variant="outline" className="border-[#3A3B41] hover:bg-[#2A2B31]">
                    Close
                  </Button>
                </DialogClose>
                <Button 
                  onClick={handleViewFullProfile}
                  className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/80 flex items-center"
                >
                  View Full Profile
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-red-400 mb-4">User not found</p>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-[#3A3B41] hover:bg-[#2A2B31]"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}