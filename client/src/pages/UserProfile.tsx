import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  User,
  LineChart,
  Award,
  Clock,
  ArrowLeft,
  TrendingUp,
  Medal,
  Star,
  Calendar,
  Shield,
  MessageCircle,
  ExternalLink,
  BadgeCheck,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTierFromWager, getTierProgress, getTierIcon, getTierColor } from "../lib/tier-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


interface UserStats {
  id: string; // Added ID for API calls
  username: string;
  totalWagered: string | number;
  weeklyWagered: string | number;
  monthlyWagered: string | number;
  bio?: string;
  profileColor?: string;
  goatedId?: string; // External Goated ID
  telegramUsername?: string;
  createdAt: string;
  goatedAccountLinked?: boolean;
  tier?: string;
}

const PROFILE_COLORS = {
  yellow: '#D7FF00',
  emerald: '#10B981',
  sapphire: '#3B82F6',
  ruby: '#EF4444',
  amethyst: '#8B5CF6',
  gold: '#F59E0B',
  pearl: '#F3F4F6',
  obsidian: '#1F2937',
  diamond: '#60A5FA'
};

// Using imported tier utility functions

export default function UserProfile({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const userId = params.id;

  // Fetch basic user data from our API
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: [`/users/${userId}`],
    queryFn: async () => {
      try {
        // Try primary user profile endpoint
        const response = await fetch(`/users/${userId}`);
        if (response.ok) {
          return response.json();
        }
        
        // If numeric ID failed, try fetching by Goated ID
        if (/^\d+$/.test(userId)) {
          console.log("Trying to fetch by Goated ID:", userId);
          const goatedResponse = await fetch(`/users/by-goated-id/${userId}`);
          if (goatedResponse.ok) {
            return goatedResponse.json();
          }
        }
        
        // If still not found, try to create a user profile
        console.log("User not found, attempting auto-creation");
        const createResponse = await fetch(`/users/ensure-profile-from-id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        if (createResponse.ok) {
          const createdData = await createResponse.json();
          // If profile was successfully created, fetch it
          if (createdData.success) {
            const newProfileResponse = await fetch(`/users/${createdData.id || userId}`);
            if (newProfileResponse.ok) {
              return newProfileResponse.json();
            }
          }
        }
        
        throw new Error('Failed to fetch or create user data');
      } catch (error) {
        console.error("User profile error:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch additional stats from API
  const { data: statsData, isLoading: isStatsLoading, refetch } = useQuery<Omit<UserStats, 'id' | 'username'>>({
    queryKey: [`/users/${userId}/stats`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/${userId}/stats`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
      
      // Fallback data structure if API fails or is not implemented yet
      return {
        totalWagered: "0.00000000",
        weeklyWagered: "0.00000000",
        monthlyWagered: "0.00000000",
        tier: "bronze",
        createdAt: new Date().toISOString(),
        goatedAccountLinked: false
      };
    },
    enabled: !!userData, // Only fetch stats once we have the user data
  });

  // Combine the data
  const user: UserStats | undefined = userData && statsData ? {
    id: userData.id,
    username: userData.username,
    bio: userData.bio || '',
    profileColor: userData.profileColor || '#D7FF00',
    goatedId: userData.goatedId, // Include goatedId if available
    ...statsData
  } : undefined;

  const isLoading = isUserLoading || isStatsLoading;

  if (isLoading) return (
    <div className="min-h-screen bg-[#14151A] flex items-center justify-center">
      <LoadingSpinner />
      <p className="ml-3 text-[#D7FF00]">Loading profile...</p>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen bg-[#14151A] flex flex-col items-center justify-center text-white">
      <div className="text-5xl text-[#D7FF00] mb-4">404</div>
      <p className="text-xl mb-8">User profile not found</p>
      <Button onClick={() => setLocation('/')} className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/80">
        Return to Home
      </Button>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const EditProfileDialog = ({ user, onUpdate }: { user: UserStats; onUpdate: () => void }) => {
    const [bio, setBio] = useState(user.bio || '');
    const [color, setColor] = useState(user.profileColor || '#D7FF00');

    const handleSubmit = async () => {
      await fetch(`/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, profileColor: color })
      });
      onUpdate();
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1A1B21] border-[#2A2B31]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} />
            </div>
            <div>
              <Label>Profile Color</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {Object.entries(PROFILE_COLORS).map(([name, value]) => (
                  <div
                    key={name}
                    className={`w-8 h-8 rounded-full cursor-pointer ${color === value ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: value }}
                    onClick={() => setColor(value)}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Background style for the profile
  const profileBgStyle = {
    backgroundColor: user.profileColor || PROFILE_COLORS.yellow,
  };

  // Get tier information
  const tier = user?.tier || getTierFromWager(user.totalWagered);
  const tierColor = getTierColor(tier);
  
  // Format join date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Format values using formatCurrency
  const formatValue = (value: string | number) => {
    return typeof value === 'string' ? 
      parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) :
      value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  
  return (
    <div className="min-h-screen bg-[#14151A] text-white">
      {/* Hero section with gradient background */}
      <div 
        className="h-64 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(to right, ${user.profileColor || '#D7FF00'}33, ${tierColor}33)`,
          borderBottom: `1px solid ${user.profileColor || '#D7FF00'}33`
        }}
      >
        <div className="absolute inset-0 bg-[#14151A] opacity-80"></div>
        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-16">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-8 left-4 bg-[#1A1B21]/40 hover:bg-[#1A1B21]/70 gap-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 pb-16"
        >
          {/* User card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#1A1B21] border-[#2A2B31] overflow-hidden shadow-xl">
              <CardContent className="p-0">
                {/* User profile header */}
                <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    {/* User avatar */}
                    <div 
                      className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold mb-3 border-4"
                      style={{ 
                        backgroundColor: user.profileColor || '#D7FF00', 
                        color: '#1A1B21',
                        borderColor: tierColor
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Tier badge */}
                    <div className="flex items-center px-3 py-1 bg-[#242530] rounded-full">
                      <img 
                        src={getTierIcon(tier)} 
                        alt={`${tier} tier`}
                        className="w-5 h-5 mr-2" 
                      />
                      <span className="capitalize font-medium text-sm" style={{ color: tierColor }}>
                        {tier} Tier
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {user.username}
                      </h1>
                      {user.goatedAccountLinked && (
                        <span className="bg-[#D7FF00] text-black text-xs font-medium px-2 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    {/* User metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                      {user.goatedId && (
                        <div className="flex items-center text-sm text-[#8A8B91]">
                          <User className="h-4 w-4 mr-2 text-[#D7FF00]" />
                          <span>Goated ID: {user.goatedId}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-[#8A8B91]">
                        <Calendar className="h-4 w-4 mr-2 text-[#D7FF00]" />
                        <span>Joined {formatJoinDate(user.createdAt)}</span>
                      </div>
                      
                      {user.telegramUsername && (
                        <div className="flex items-center text-sm text-[#8A8B91]">
                          <MessageCircle className="h-4 w-4 mr-2 text-[#D7FF00]" />
                          <span>Telegram: @{user.telegramUsername}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* User bio */}
                    {user.bio && (
                      <div className="mt-4 p-3 bg-[#242530] rounded-lg">
                        <p className="text-sm text-[#D0D1D6]">{user.bio}</p>
                      </div>
                    )}
                    
                    {/* Edit profile button */}
                    <div className="mt-4">
                      <EditProfileDialog user={user} onUpdate={refetch} />
                    </div>
                  </div>
                </div>
                
                {/* Wager stats grid */}
                <div className="border-t border-[#2A2B31] bg-[#191A22]">
                  <div className="grid grid-cols-3 divide-x divide-[#2A2B31]">
                    {/* Total wagered */}
                    <div className="p-6 text-center">
                      <p className="text-sm text-[#8A8B91] mb-1">Total Wagered</p>
                      <p className="text-2xl font-bold text-white">
                        ${formatValue(user.totalWagered)}
                      </p>
                    </div>
                    
                    {/* Monthly wagered */}
                    <div className="p-6 text-center">
                      <p className="text-sm text-[#8A8B91] mb-1">Monthly Wagered</p>
                      <p className="text-2xl font-bold text-white">
                        ${formatValue(user.monthlyWagered)}
                      </p>
                    </div>
                    
                    {/* Weekly wagered */}
                    <div className="p-6 text-center">
                      <p className="text-sm text-[#8A8B91] mb-1">Weekly Wagered</p>
                      <p className="text-2xl font-bold text-white">
                        ${formatValue(user.weeklyWagered)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Tier progress */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#1A1B21] border-[#2A2B31]">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Award className="mr-2 h-5 w-5 text-[#D7FF00]" />
                  Tier Progress
                </h2>
                
                <div className="space-y-6">
                  {/* Current tier info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={getTierIcon(tier)} 
                        alt={`${tier} tier`}
                        className="w-10 h-10 mr-3" 
                      />
                      <div>
                        <p className="font-medium capitalize">{tier} Tier</p>
                        <p className="text-sm text-[#8A8B91]">Current Level</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${formatValue(user.totalWagered)}</p>
                      <p className="text-sm text-[#8A8B91]">Total Wagered</p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#8A8B91]">Tier Progress</span>
                      <span className="text-[#D7FF00]">
                        {(() => {
                          const numericWager = typeof user.totalWagered === 'string' ? 
                            parseFloat(user.totalWagered) : user.totalWagered;
                          const progress = getTierProgress(numericWager);
                          return `${Math.round(progress.percentage)}%`;
                        })()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#242530] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: (() => {
                            const numericWager = typeof user.totalWagered === 'string' ? 
                              parseFloat(user.totalWagered) : user.totalWagered;
                            const progress = getTierProgress(numericWager);
                            return `${progress.percentage}%`;
                          })(),
                          backgroundColor: tierColor
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Next tier info */}
                  {(() => {
                    const numericWager = typeof user.totalWagered === 'string' ? 
                      parseFloat(user.totalWagered) : user.totalWagered;
                    const progress = getTierProgress(numericWager);
                    
                    if (progress.nextTier) {
                      return (
                        <div className="flex items-center justify-between bg-[#242530] p-4 rounded-lg">
                          <div className="flex items-center">
                            <img 
                              src={getTierIcon(progress.nextTier.name)} 
                              alt={`${progress.nextTier.name} tier`}
                              className="w-8 h-8 mr-3 opacity-70" 
                            />
                            <div>
                              <p className="font-medium capitalize">{progress.nextTier.name} Tier</p>
                              <p className="text-sm text-[#8A8B91]">Next Level</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${progress.nextTier.minWager.toLocaleString()}</p>
                            <p className="text-sm text-[#8A8B91]">Required Wager</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="bg-[#242530] p-4 rounded-lg text-center">
                        <p className="font-medium text-[#D7FF00]">Maximum Tier Achieved!</p>
                        <p className="text-sm text-[#8A8B91] mt-1">You've reached the highest tier level</p>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Wager statistics */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#1A1B21] border-[#2A2B31]">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <LineChart className="mr-2 h-5 w-5 text-[#D7FF00]" />
                  Wager Statistics
                </h2>
                
                <div className="space-y-5">
                  {/* Total wagered stats with visualization */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#8A8B91]">Total Wagered</span>
                      <span className="font-medium">${formatValue(user.totalWagered)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#242530] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          backgroundColor: tierColor,
                          width: `${Math.min(100, (parseFloat(user.totalWagered?.toString() || '0') / 1000000) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Monthly wagered */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#8A8B91]">Monthly Wagered</span>
                      <span className="font-medium">${formatValue(user.monthlyWagered)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#242530] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-[#D7FF00]" 
                        style={{ 
                          width: `${Math.min(100, (parseFloat(user.monthlyWagered?.toString() || '0') / 100000) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Weekly wagered */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#8A8B91]">Weekly Wagered</span>
                      <span className="font-medium">${formatValue(user.weeklyWagered)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#242530] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-500" 
                        style={{ 
                          width: `${Math.min(100, (parseFloat(user.weeklyWagered?.toString() || '0') / 20000) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Verification status */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#1A1B21] border-[#2A2B31]">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-[#D7FF00]" />
                  Account Verification
                </h2>
                
                {user.goatedAccountLinked ? (
                  <div className="flex flex-col md:flex-row items-center justify-between bg-[#242530] p-4 rounded-lg">
                    <div className="flex items-center mb-3 md:mb-0">
                      <div className="w-10 h-10 rounded-full bg-[#D7FF00]/20 flex items-center justify-center mr-3">
                        <BadgeCheck className="h-5 w-5 text-[#D7FF00]" />
                      </div>
                      <div>
                        <p className="font-medium">Verified Account</p>
                        <p className="text-sm text-[#8A8B91]">Your account is linked to Goated.com</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#3A3B41] hover:bg-[#2A2B31]"
                      onClick={() => window.open('https://goated.com', '_blank')}
                    >
                      Visit Goated.com
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center justify-between bg-[#242530] p-4 rounded-lg">
                    <div className="flex items-center mb-3 md:mb-0">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-3">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">Unverified Account</p>
                        <p className="text-sm text-[#8A8B91]">Link your account to Goated.com for full access</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/80"
                      onClick={() => setLocation('/verification')}
                    >
                      Verify Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}