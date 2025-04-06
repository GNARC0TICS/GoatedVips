import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { profileService, UserProfile, ProfileError } from '@/services/profileService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ExternalLink, Check, Clock, Shield, AlertTriangle } from 'lucide-react';
import { ProfileEmblem } from './ProfileEmblem';
import { ProfileTierProgress } from './ProfileTierProgress';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { getTierFromWager, getTierInfo, TierLevel } from '@/lib/tier-utils';

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
        const profileData = await profileService.getProfile(profileId);
        
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
      <Card className={cn('p-4', className)}>
        <div className="flex h-24 items-center justify-center">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }
  
  // Handle error state
  if (error || !profile) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-red-500">
            {error instanceof ProfileError 
              ? error.message 
              : error?.message || 'Unable to load profile'}
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onClose}
            className="mt-2"
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
      <Card className={cn('p-4', className)}>
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Profile not found</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onClose}
            className="mt-2"
          >
            Close
          </Button>
        </div>
      </Card>
    );
  }
  
  // Render the profile card
  return (
    <Card className={cn('overflow-hidden', 
      size === 'sm' ? 'w-64' : 
      size === 'lg' ? 'w-96' : 
      'w-80', 
      className
    )}>
      {/* Profile Header */}
      <div className="bg-[#1A1B21] p-4 relative">
        {/* Verification Badge */}
        {profile.isVerified && (
          <Badge className="absolute top-2 right-2 px-2 py-1 flex items-center gap-1 bg-green-500 text-white">
            <Check className="h-3 w-3" />
            <span className="text-xs">Verified</span>
          </Badge>
        )}
        
        <div className="flex items-center gap-3">
          <ProfileEmblem 
            username={profile.username}
            color={profile.profileColor || '#D7FF00'}
            size={size === 'sm' ? 'sm' : 'md'}
          />
          
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-white truncate">{profile.username}</h3>
            
            {profile.goatedUsername && (
              <p className="text-xs text-[#8A8B91] truncate flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Goated: {profile.goatedUsername}
              </p>
            )}
            
            {tierInfo && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-medium" style={{ color: tierInfo.color }}>
                  {tierInfo.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Profile Body */}
      <div className="p-4 bg-[#14151A]">
        {/* Profile Tier Progress */}
        {profile.totalWager && (
          <div className="mb-4">
            <ProfileTierProgress profile={profile} />
          </div>
        )}
        
        {/* Profile Bio */}
        {profile.bio && (
          <div className="text-sm text-white/80 mb-4">
            <p>{profile.bio}</p>
          </div>
        )}
        
        {/* Account Status */}
        <div className="space-y-2 text-sm">
          {profile.goatedAccountLinked ? (
            <div className="bg-[#1A1B21]/50 p-2 rounded-md flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-white/80">Goated Account Linked</span>
            </div>
          ) : (
            <div className="bg-[#1A1B21]/50 p-2 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-white/80">Goated Account Not Linked</span>
            </div>
          )}
          
          {/* Created Date */}
          {profile.createdAt && (
            <div className="bg-[#1A1B21]/50 p-2 rounded-md flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8A8B91]" />
              <span className="text-[#8A8B91]">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Profile Footer */}
      <div className="p-3 bg-[#1A1B21] border-t border-[#2A2B31] flex justify-between">
        <Button 
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>
        
        <Link href={`/profile/${profile.id}`}>
          <Button 
            variant="default"
            size="sm"
            className="bg-[#D7FF00] text-black hover:bg-[#C0E600]"
          >
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
}