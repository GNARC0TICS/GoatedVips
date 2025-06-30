import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/services/profileService';
import { Button } from '@/components/ui/button';
import { Pencil, MessageCircle, UserPlus, Share2, Flag } from 'lucide-react';
import { ProfileEmblem } from './ProfileEmblem';
import { cn } from '@/lib/utils';
import { ProfileTierProgress } from './ProfileTierProgress';
import { ProfileAchievements } from './ProfileAchievements';
import { getTierFromWager, getTierInfo, TierLevel } from '@/lib/tier-utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { fadeIn, fadeInUp } from '@/lib/animation-presets';
import { Badge } from '@/components/ui/badge';

interface ProfileLayoutProps {
  profile: UserProfile;
  isOwner: boolean;
  children: React.ReactNode;
  onEdit?: () => void;
  onMessage?: () => void;
  onFollow?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  className?: string;
}

/**
 * Enhanced layout component for the full user profile page
 * Provides a responsive layout with improved visual design
 */
export function ProfileLayout({
  profile,
  isOwner,
  children,
  onEdit,
  onMessage,
  onFollow,
  onShare,
  onReport,
  className,
}: ProfileLayoutProps) {
  // Use a media query hook to determine if the viewport is mobile
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  // Get tier information
  const totalWager = profile.totalWager ? parseFloat(String(profile.totalWager)) : 0;
  const currentTier = (profile.tier as TierLevel) || getTierFromWager(totalWager);
  const tierInfo = getTierInfo(currentTier);
  
  // Set CSS variables for the tier-based styles
  const tierColorRGB = tierInfo.shadowColor?.replace('rgba(', '').replace(')', '').split(',')[0] || '';
  
  return (
    <div 
      className={cn("space-y-6", className)}
      style={{ 
        '--tier-color-rgb': tierColorRGB 
      } as React.CSSProperties}
    >
      {/* Header Section - Responsive adaptation */}
      <motion.div 
        className={cn(
          "rounded-xl overflow-hidden border border-[#2A2B31] bg-[#1A1B21]/50",
          "flex flex-col sm:flex-row"
        )}
        {...fadeIn}
        style={{
          backgroundImage: tierInfo?.backgroundPattern ? `url(${tierInfo.backgroundPattern}), linear-gradient(to bottom, rgba(26, 27, 33, 0.9), rgba(20, 21, 26, 0.95))` : undefined,
          backgroundSize: tierInfo?.backgroundPattern ? 'cover, cover' : undefined,
          backgroundBlendMode: tierInfo?.backgroundPattern ? 'overlay' : undefined,
          boxShadow: `0 0 20px rgba(${tierColorRGB}, 0.1)`
        }}
      >
        {/* Left Side - Profile Info */}
        <div className="p-6 flex-1">
          <div className={cn(
            "flex items-start",
            isMobile ? "flex-col text-center" : "flex-row"
          )}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                isMobile ? "mx-auto mb-4" : "mr-6",
                "relative"
              )}
            >
              <ProfileEmblem
                username={profile.username}
                color={profile.profileColor || '#D7FF00'}
                size={isMobile ? "lg" : "xl"}
                className="shadow-xl ring-2 ring-black/20"
              />
              
              {/* Tier badge positioned over emblem */}
              <div 
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-bold"
                style={{ 
                  background: tierInfo.accentGradient || `linear-gradient(90deg, ${tierInfo.hexColor}90, ${tierInfo.hexColor})`,
                  color: 'white',
                  boxShadow: `0 3px 10px ${tierInfo.shadowColor || tierInfo.hexColor}50`
                }}
              >
                {tierInfo.name}
              </div>
            </motion.div>
            
            <div className={cn(
              "min-w-0",
              isMobile ? "text-center w-full" : "flex-1"
            )}>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile.username}</h1>
              
              {/* User info and verifications */}
              <div className={cn(
                "flex flex-wrap gap-2 mt-2",
                isMobile ? "justify-center" : "justify-start"
              )}>
                {profile.isVerified && (
                  <Badge className="bg-green-600 text-white">Verified</Badge>
                )}
                
                {profile.goatedUsername && (
                  <Badge className="bg-[#D7FF00] text-black">
                    Goated: {profile.goatedUsername}
                  </Badge>
                )}
                
                {(profile.stats?.races?.won || 0) > 0 && (
                  <Badge className="bg-blue-600 text-white">
                    {profile.stats?.races?.won} Race Wins
                  </Badge>
                )}
              </div>
              
              {/* Profile bio if present */}
              {profile.bio && (
                <p className="mt-4 text-gray-300 italic">{profile.bio}</p>
              )}
              
              {/* Edit profile button */}
              {isOwner && (
                <div className={cn(
                  "mt-4",
                  isMobile ? "flex justify-center" : ""
                )}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={onEdit}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Side - Stats Summary */}
        <div className={cn(
          "border-t sm:border-l sm:border-t-0 border-[#2A2B31] p-6",
          "flex flex-col justify-center bg-[#14151A]/50",
          isMobile ? "w-full" : "w-80"
        )}>
          {/* Stats summary with responsive layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Wagered */}
            <div className="text-center p-3 bg-[#1A1B21]/40 rounded-lg border border-[#2A2B31]/40">
              <div className="text-[#9A9BA1] text-xs mb-1">Total Wagered</div>
              <div className="text-white font-bold text-lg">
                ${totalWager.toLocaleString()}
              </div>
            </div>
            
            {/* Rank */}
            <div className="text-center p-3 bg-[#1A1B21]/40 rounded-lg border border-[#2A2B31]/40">
              <div className="text-[#9A9BA1] text-xs mb-1">Rank</div>
              <div className="text-white font-bold text-lg">
                {(profile as any).rank ? `#${(profile as any).rank}` : 'N/A'}
              </div>
            </div>
            
            {/* Joined */}
            <div className="text-center p-3 bg-[#1A1B21]/40 rounded-lg border border-[#2A2B31]/40">
              <div className="text-[#9A9BA1] text-xs mb-1">Joined</div>
              <div className="text-white font-bold text-sm">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            
            {/* Races Won */}
            <div className="text-center p-3 bg-[#1A1B21]/40 rounded-lg border border-[#2A2B31]/40">
              <div className="text-[#9A9BA1] text-xs mb-1">Races Won</div>
              <div className="text-white font-bold text-lg">
                {profile.stats?.races?.won || 0}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          {!isOwner && (
            <div className="mt-4 flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onMessage}
                className="flex items-center gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onFollow}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Follow
              </Button>
            </div>
          )}
          
          {/* Share and report buttons */}
          <div className="mt-2 flex gap-2 justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShare}
              className="text-[#9A9BA1]"
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReport}
              className="text-[#9A9BA1]"
            >
              <Flag className="h-4 w-4" />
              <span className="sr-only">Report</span>
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content Area - Responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User info & achievements */}
        <div className="space-y-6">
          {/* Tier status card with enhanced tier visualization */}
          <motion.div 
            className="rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 p-6 overflow-hidden"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
            style={{
              boxShadow: `0 10px 30px rgba(${tierColorRGB}, 0.05)`
            }}
          >
            <h2 className="text-lg font-semibold mb-4">VIP Status</h2>
            <ProfileTierProgress profile={profile} showMilestones={true} />
          </motion.div>
          
          {/* Achievements section */}
          <motion.div 
            className="rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 p-6"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-4">Achievements</h2>
            <ProfileAchievements profile={profile} limit={5} showCategory={true} />
          </motion.div>
        </div>
        
        {/* Main column - Content */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.3 }}
        >
          {/* Main content */}
          <div className="rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
