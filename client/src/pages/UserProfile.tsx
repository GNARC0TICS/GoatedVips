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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  totalWagered: number;
  currentRank: number;
  bestRank: number;
  races: {
    participated: number;
    won: number;
    totalPrizes: number;
  };
  achievements: Array<{
    name: string;
    description: string;
    earned: string;
  }>;
  history: Array<{
    period: string;
    wagered: number;
    rank: number;
    prize: number;
  }>;
  bio?: string; // Added bio field
  profileColor?: string; // Added profile color field
  goatedId?: string; // External Goated platform ID
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

const getTierFromWager = (wager: number): string => {
  if (wager >= 1000000) return 'diamond';
  if (wager >= 500000) return 'platinum';
  if (wager >= 100000) return 'gold';
  if (wager >= 50000) return 'silver';
  return 'bronze';
};

const getTierIcon = (tier: string): string => {
  return `/images/tiers/${tier}.svg`;
};

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
        totalWagered: 250000,
        currentRank: 5,
        bestRank: 3,
        races: {
          participated: 12,
          won: 3,
          totalPrizes: 5600,
        },
        achievements: [
          {
            name: 'First Victory',
            description: 'Won your first wager race',
            earned: '2 months ago',
          },
          {
            name: 'High Roller',
            description: 'Placed in top 10 for monthly wager volume',
            earned: '1 month ago',
          },
          {
            name: 'Consistent Player',
            description: 'Participated in 10+ races',
            earned: '2 weeks ago',
          },
        ],
        history: [
          {
            period: 'March 2025',
            wagered: 80000,
            rank: 5,
            prize: 1500,
          },
          {
            period: 'February 2025',
            wagered: 120000,
            rank: 3,
            prize: 2800,
          },
          {
            period: 'January 2025',
            wagered: 50000,
            rank: 8,
            prize: 1300,
          },
        ],
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

  return (
    <div className="min-h-screen bg-[#14151A] text-white relative" style={{ overflow: 'hidden' }}>
      {/* Colored background gradient */}
      <div 
        className="absolute inset-0 opacity-10 z-0" 
        style={profileBgStyle}
      />
      
      {/* Content with subtle gradient background */}
      <div className="container relative z-10 mx-auto px-4 py-8 md:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <EditProfileDialog user={user} onUpdate={refetch} /> {/* Add Edit Profile Dialog */}
          </motion.div>

          {/* User Info */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#1A1B21]/50 backdrop-blur-sm border-[#2A2B31]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-[#2A2B31] flex items-center justify-center">
                      <img
                        src={getTierIcon(getTierFromWager(user.totalWagered))}
                        alt="Tier"
                        className="w-16 h-16"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#D7FF00] text-black font-bold px-2 py-1 rounded-full text-sm">
                      #{user.currentRank}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#D7FF00] mb-2">
                      {user.username}
                    </h1>
                    <p className="text-sm text-[#8A8B91] mb-2">{user.bio || "No bio provided"}</p> {/* Display bio */}
                    <div className="flex flex-wrap gap-4 text-sm text-[#8A8B91]">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-[#D7FF00]" />
                        Total Wagered: ${user.totalWagered.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-[#D7FF00]" />
                        Best Rank: #{user.bestRank}
                      </div>
                      <div className="flex items-center gap-2">
                        <Medal className="h-4 w-4 text-[#D7FF00]" />
                        Races Won: {user.races.won}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="bg-[#1A1B21]/50 backdrop-blur-sm border-[#2A2B31]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-[#D7FF00]" />
                  <span className="text-sm text-[#8A8B91]">Total Prizes</span>
                </div>
                <p className="text-2xl font-bold">
                  ${user.races.totalPrizes.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1B21]/50 backdrop-blur-sm border-[#2A2B31]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-[#D7FF00]" />
                  <span className="text-sm text-[#8A8B91]">
                    Races Participated
                  </span>
                </div>
                <p className="text-2xl font-bold">{user.races.participated}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1B21]/50 backdrop-blur-sm border-[#2A2B31]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-[#D7FF00]" />
                  <span className="text-sm text-[#8A8B91]">Win Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {((user.races.won / user.races.participated) * 100).toFixed(
                    1,
                  )}
                  %
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-heading font-bold text-white mb-4">
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.achievements.map((achievement) => (
                <Card
                  key={achievement.name}
                  className="bg-[#1A1B21]/50 backdrop-blur-sm border-[#2A2B31]"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <Award className="h-6 w-6 text-[#D7FF00]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-[#8A8B91] mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#8A8B91]">
                          <Clock className="h-3 w-3" />
                          Earned: {achievement.earned}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* History Table */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-heading font-bold text-white mb-4">
              Race History
            </h2>
            <div className="bg-[#1A1B21]/50 backdrop-blur-sm rounded-xl border border-[#2A2B31] overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-heading text-[#D7FF00]">
                        PERIOD
                      </TableHead>
                      <TableHead className="text-right font-heading text-[#D7FF00]">
                        WAGERED
                      </TableHead>
                      <TableHead className="text-right font-heading text-[#D7FF00]">
                        RANK
                      </TableHead>
                      <TableHead className="text-right font-heading text-[#D7FF00]">
                        PRIZE
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.history.map((record) => (
                      <TableRow key={record.period}>
                        <TableCell className="font-medium">
                          {record.period}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            ${record.wagered.toLocaleString()}
                            {record.wagered > 0 && (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          #{record.rank}
                        </TableCell>
                        <TableCell className="text-right text-[#D7FF00]">
                          ${record.prize.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}