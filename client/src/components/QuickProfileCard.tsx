import React, { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { isProfileOwner } from "@/services/profileService";
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
  Award,
  BadgeCheck,
  Link as LinkIcon,
  ExternalLink,
  User as UserIcon
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import { getTierFromWager, getTierIcon, getTierColor } from "../lib/tier-utils";
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
  totalWagered: string | number;
  weeklyWagered: string | number;
  monthlyWagered: string | number;
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
  const { user: currentUser } = useAuth();
  
  // Determine if the current user is the profile owner
  const isOwner = isProfileOwner(currentUser?.id, userId);

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
  const tierColor = getTierColor(tier);
  
  // Format join date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const truncateGoatedId = (id?: string) => {
    if (!id) return '';
    if (id.length <= 8) return id;
    return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          <div style={{ cursor: "pointer" }}>
            {children}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-[#1A1B23] border-[#2A2B31] text-white overflow-hidden">
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
              {/* Gradient Background Header */}
              <div 
                className="relative -mt-6 -mx-6 h-24 mb-2 overflow-hidden" 
                style={{ 
                  background: `linear-gradient(to right, ${user.profileColor || '#D7FF00'}, ${tierColor})`,
                  opacity: 0.8
                }}
              >
                <div className="absolute inset-0 bg-[#1A1B23] opacity-75 bg-opacity-80"></div>
              </div>
                
              {/* User Avatar and Info - Overlapping the gradient */}
              <div className="relative -mt-12 px-4 flex items-start mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-[#1A1B23] shadow-lg"
                  style={{ backgroundColor: user.profileColor || '#D7FF00', color: '#1A1B23' }}
                >
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 pt-4">
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold text-white">{username}</h3>
                    {user.goatedAccountLinked && (
                      <BadgeCheck className="ml-1 h-5 w-5 text-[#D7FF00]" />
                    )}
                  </div>
                  <div className="flex items-center text-sm text-[#8A8B91] mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span>Joined {formatJoinDate(user.createdAt)}</span>
                  </div>
                  {user.goatedId && (
                    <div className="flex items-center text-sm text-[#8A8B91] mt-1">
                      <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                      <span>Goated ID: {truncateGoatedId(user.goatedId)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* User Bio - if available */}
              {user.bio && (
                <div className="px-4 mb-4">
                  <p className="text-sm text-[#D0D1D6]">{user.bio}</p>
                </div>
              )}
              
              {/* Tier Badge - Centered */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center px-4 py-2 bg-[#242530] rounded-full">
                  <img 
                    src={getTierIcon(tier)} 
                    alt={`${tier} tier`}
                    className="w-6 h-6 mr-2" 
                  />
                  <span className="capitalize font-semibold" style={{ color: tierColor }}>
                    {tier} Tier
                  </span>
                </div>
              </div>
              
              {/* Stats cards - Compact and Elegant */}
              <CardContent className="p-4 grid gap-3">
                {/* Wager stats with modern gradient cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Total wagers */}
                  <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-[#242530] to-[#1E1F28]">
                    <p className="text-xs text-[#8A8B91] mb-1">Total</p>
                    <p className="font-bold text-sm">{formatCurrency(user.totalWagered || '0', 0)}</p>
                  </div>
                  
                  {/* Monthly wagers */}
                  <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-[#242530] to-[#1E1F28]">
                    <p className="text-xs text-[#8A8B91] mb-1">Monthly</p>
                    <p className="font-bold text-sm">{formatCurrency(user.monthlyWagered || '0', 0)}</p>
                  </div>
                  
                  {/* Weekly wagers */}
                  <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-[#242530] to-[#1E1F28]">
                    <p className="text-xs text-[#8A8B91] mb-1">Weekly</p>
                    <p className="font-bold text-sm">{formatCurrency(user.weeklyWagered || '0', 0)}</p>
                  </div>
                </div>
                
                {/* Detailed Stats */}
                <div className="mt-2 bg-gradient-to-br from-[#242530] to-[#1E1F28] rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-4 h-4 text-[#D7FF00] mr-2" />
                    <h4 className="text-sm font-medium">Wager Stats</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Total wagers with bar indicator */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#8A8B91]">Total Wagered</span>
                        <span className="font-medium">{formatCurrency(user.totalWagered || '0')}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#2A2B31] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            backgroundColor: tierColor,
                            width: `${Math.min(100, (parseFloat(user.totalWagered?.toString() || '0') / 1000000) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Monthly wagers with bar indicator */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#8A8B91]">Monthly Wagered</span>
                        <span className="font-medium">{formatCurrency(user.monthlyWagered || '0')}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#2A2B31] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#D7FF00]" 
                          style={{ 
                            width: `${Math.min(100, (parseFloat(user.monthlyWagered?.toString() || '0') / 100000) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Footer with actions */}
              <CardFooter className="flex justify-between pt-0 pb-3 px-4">
                <DialogClose asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#3A3B41] hover:bg-[#2A2B31] rounded-full"
                  >
                    Close
                  </Button>
                </DialogClose>
                <div className="flex gap-2">
                  {isOwner && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        setLocation(`/profile/edit`);
                      }}
                      className="bg-[#242530] text-white hover:bg-[#2A2B36] rounded-full"
                    >
                      Edit
                    </Button>
                  )}
                  <Button 
                    onClick={handleViewFullProfile}
                    size="sm"
                    className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/80 flex items-center rounded-full"
                  >
                    View Full Profile
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
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
