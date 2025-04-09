
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { profileService, UserProfile, ProfileError } from '@/services/profileService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ExternalLink, Check, Clock, Shield, AlertTriangle, MessageCircle, Share2, User, RefreshCw } from 'lucide-react';
import { ProfileEmblem } from './ProfileEmblem';
import { ProfileTierProgress } from './ProfileTierProgress';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { getTierFromWager, getTierInfo, TierLevel } from '@/lib/tier-utils';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/use-profile';

interface QuickProfileCardProps {
  profileId: string | number;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Card component for displaying a quick preview of a user profile
 * Used for user mentions, hover cards, etc.
 */
export function QuickProfileCard({
  profileId,
  onClose,
  size = 'md',
  className,
}: QuickProfileCardProps) {
  const { user } = useAuth();
  
  // Use our consolidated hook for profile fetching
  const { profile, isLoading, error, fetchProfile } = useProfile(profileId);
  
  // Determine if the current user owns this profile
  const isOwner = user ? profileService.isProfileOwner(profileId) : false;
  
  // Calculate tier information based on wagered amount
  const wagerAmount = profile?.totalWager ? parseFloat(String(profile?.totalWager)) : 0;
  const tierLevel = profile?.tier as TierLevel || getTierFromWager(wagerAmount);
  const tierInfo = tierLevel ? getTierInfo(tierLevel) : undefined;
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card className={cn('p-6 overflow-hidden shadow-lg border border-[#2C2D33]', className)}>
        <div className="flex h-36 items-center justify-center">
          <Spinner size="lg" className="text-[#D7FF00]" />
        </div>
      </Card>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <Card className={cn('p-6 overflow-hidden shadow-lg border border-[#2C2D33]', className)}>
        <div className="text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-sm text-red-400 font-medium">
            {error instanceof ProfileError 
              ? error.message 
              : error?.message || 'Unable to load profile'}
          </p>
          <div className="flex flex-col gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => fetchProfile()} // Add retry functionality
              className="bg-[#23242A] hover:bg-[#2C2D33] text-white border-[#3A3B41]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onClose}
              className="bg-[#23242A] hover:bg-[#2C2D33] text-white border-[#3A3B41]"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  // Handle no profile case
  if (!profile) {
    return (
      <Card className={cn('p-6 overflow-hidden shadow-lg border border-[#2C2D33]', className)}>
        <div className="text-center space-y-3">
          <User className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Profile not found</p>
          <div className="flex flex-col gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => fetchProfile()} // Add retry functionality
              className="bg-[#23242A] hover:bg-[#2C2D33] text-white border-[#3A3B41]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onClose}
              className="bg-[#23242A] hover:bg-[#2C2D33] text-white border-[#3A3B41]"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  // Render the profile card
  return (
    <Card className={cn('overflow-hidden shadow-xl border border-[#2C2D33]', 
      size === 'sm' ? 'w-64' : 
      size === 'lg' ? 'w-96' : 
      'w-80', 
      className
    )}>
      {/* Profile Header - Enhanced gradient background */}
      <div 
        className="p-5 relative"
        style={{
          background: 'linear-gradient(140deg, #1A1B21 0%, #14151A 100%)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)'
        }}
      >
        {/* Verification Badge - Animated and improved */}
        {profile.isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 right-3"
          >
            <Badge className="px-2 py-1 flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
              <Check className="h-3 w-3" />
              <span className="text-xs font-medium">Verified</span>
            </Badge>
          </motion.div>
        )}
        
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileEmblem 
              username={profile.username}
              color={profile.profileColor || '#D7FF00'}
              size={size === 'sm' ? 'sm' : 'md'}
              className="shadow-xl ring-2 ring-black/20"
            />
          </motion.div>
          
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-white text-lg truncate">{profile.username}</h3>
            
            {profile.goatedUsername && (
              <p className="text-xs text-[#9A9BA1] truncate flex items-center gap-1 mt-1">
                <ExternalLink className="h-3 w-3" />
                <span className="opacity-80">Goated:</span> <span className="text-[#D7FF00]">{profile.goatedUsername}</span>
              </p>
            )}
            
            {tierInfo && (
              <div className="flex items-center gap-2 mt-2">
                <span 
                  className="text-xs font-semibold px-2 py-1 rounded-md" 
                  style={{ 
                    background: `linear-gradient(90deg, ${tierInfo.color}22, ${tierInfo.color}44)`,
                    color: tierInfo.color,
                    border: `1px solid ${tierInfo.color}66`
                  }}
                >
                  {tierInfo.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Profile Body - Enhanced styling */}
      <div className="p-5 bg-[#14151A]">
        {/* Profile Tier Progress */}
        {profile.totalWager && (
          <motion.div 
            className="mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ProfileTierProgress profile={profile} />
          </motion.div>
        )}
        
        {/* Stats Preview Section */}
        <motion.div
          className="mb-5 grid grid-cols-2 gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* Total Wagered Stat */}
          <div className="p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50">
            <div className="text-xs text-[#9A9BA1] mb-1">Total Wagered</div>
            <div className="font-bold text-white text-lg">
              {profile.totalWager 
                ? `$${parseFloat(profile.totalWager).toLocaleString()}`
                : '$0'}
            </div>
          </div>
          
          {/* Rank Stat */}
          <div className="p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50">
            <div className="text-xs text-[#9A9BA1] mb-1">Rank</div>
            <div className="font-bold text-white text-lg">
              {(profile as any).rank
                ? `#${(profile as any).rank}`
                : 'N/A'}
            </div>
          </div>
          
          {/* Races Joined Stat */}
          <div className="p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50">
            <div className="text-xs text-[#9A9BA1] mb-1">Races Joined</div>
            <div className="font-bold text-white text-lg">
              {(profile as any).stats?.races?.total || '0'}
            </div>
          </div>
          
          {/* Races Won Stat */}
          <div className="p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50">
            <div className="text-xs text-[#9A9BA1] mb-1">Race Wins</div>
            <div className="font-bold text-white text-lg">
              {(profile as any).stats?.races?.won || '0'}
            </div>
          </div>
        </motion.div>
        
        {/* Profile Bio */}
        {profile.bio && (
          <motion.div 
            className="text-sm text-white/85 mb-5 p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="italic">{profile.bio}</p>
          </motion.div>
        )}
        
        {/* Account Status */}
        <motion.div 
          className="space-y-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Only show account link status for the users who registered on our platform */}
          {user ? (
            profile.goatedAccountLinked ? (
              <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-green-900/20">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-white/90 font-medium">Goated Account Linked</span>
              </div>
            ) : profile.goatedLinkRequested ? (
              <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-orange-900/20">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-white/90 font-medium">Link Request Pending</span>
              </div>
            ) : isOwner ? (
              <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-blue-900/20">
                <ExternalLink className="h-4 w-4 text-blue-500" />
                <span className="text-white/90 font-medium">Link Your Goated Account</span>
              </div>
            ) : null
          ) : profile.goatedId ? (
            // For Goated users in leaderboard, show Goated ID if available
            <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-[#2A2B31]/30">
              <ExternalLink className="h-4 w-4 text-[#9A9BA1]" />
              <span className="text-[#9A9BA1] font-medium">
                Goated ID: <span className="font-mono text-xs">{profile.goatedId.substring(0, 10)}...</span>
              </span>
            </div>
          ) : null}
          
          {/* Created Date */}
          {profile.createdAt && (
            <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-[#2A2B31]/30">
              <Clock className="h-4 w-4 text-[#9A9BA1]" />
              <span className="text-[#9A9BA1] font-medium">
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Profile Footer - Enhanced with glowing effect on primary button */}
      <div className="p-4 border-t border-[#2A2B31] flex justify-between items-center" 
        style={{
          background: 'linear-gradient(180deg, #14151A 0%, #1A1B21 100%)'
        }}
      >
        <Button 
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-[#9A9BA1] hover:text-white hover:bg-[#2A2B31]"
        >
          Close
        </Button>
        
        <div className="flex gap-2">
          {!isOwner && (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-[#2A2B31] text-[#9A9BA1] hover:text-white hover:bg-[#2A2B31]"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
          
          <Link href={`/user-profile/${profile.id}`}>
            <Button 
              variant="default"
              size="sm"
              className="bg-[#D7FF00] text-black font-medium hover:bg-[#C0E600] transition-all duration-300"
              style={{
                boxShadow: '0 0 15px rgba(215, 255, 0, 0.3)'
              }}
            >
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
