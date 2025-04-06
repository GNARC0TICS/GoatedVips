
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { profileService, UserProfile, ProfileError } from '@/services/profileService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ExternalLink, Check, Clock, Shield, AlertTriangle, MessageCircle, Share2, User } from 'lucide-react';
import { ProfileEmblem } from './ProfileEmblem';
import { ProfileTierProgress } from './ProfileTierProgress';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { getTierFromWager, getTierInfo, TierLevel } from '@/lib/tier-utils';
import { motion } from 'framer-motion';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch profile data on mount
  useEffect(() => {
    let isMounted = true;
    
    async function fetchProfile() {
      if (!profileId) return;
      
      try {
        setIsLoading(true);
        // Convert string IDs to numbers to fix the "Expected number, received string" error
        const id = typeof profileId === 'string' ? parseInt(profileId, 10) : profileId;
        const profileData = await profileService.getProfile(id);
        
        if (isMounted) {
          setProfile(profileData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, [profileId]);
  
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
  if (error || !profile) {
    return (
      <Card className={cn('p-6 overflow-hidden shadow-lg border border-[#2C2D33]', className)}>
        <div className="text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-sm text-red-400 font-medium">
            {error instanceof ProfileError 
              ? error.message 
              : error?.message || 'Unable to load profile'}
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onClose}
            className="mt-3 bg-[#23242A] hover:bg-[#2C2D33] text-white border-[#3A3B41]"
          >
            Close
          </Button>
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
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onClose}
            className="mt-3 bg-[#23242A] hover:bg-[#2C2D33] text-white border-[#3A3B41]"
          >
            Close
          </Button>
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
          {profile.goatedAccountLinked ? (
            <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-green-900/20">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-white/90 font-medium">Goated Account Linked</span>
            </div>
          ) : (
            <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-white/90 font-medium">Goated Account Not Linked</span>
            </div>
          )}
          
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
          
          <Link href={`/profile/${profile.id}`}>
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
