import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { profileService, UserProfile, ProfileError } from '@/services/profileService';
import { Card } from '@/components/ui/card';
import { useProfile } from '@/hooks/use-profile';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardStyles, textStyles, buttonStyles } from '@/lib/style-constants';
import { fadeIn, scaleIn } from '@/lib/animation-presets';

// Import our new components
import { ProfileCardHeader } from './ProfileCardHeader';
import { ProfileCardStats } from './ProfileCardStats';
import { ProfileCardBio } from './ProfileCardBio';
import { ProfileCardStatus } from './ProfileCardStatus';
import { ProfileCardFooter } from './ProfileCardFooter';
import { EnhancedProfileTierProgress } from './EnhancedProfileTierProgress';
import { ProfileAchievements } from './ProfileAchievements';

interface EnhancedQuickProfileCardProps {
  profileId: string | number;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showAchievements?: boolean;
}

/**
 * Enhanced card component for displaying a quick preview of a user profile
 * Uses modular components for better code organization and easier maintenance
 */
export function EnhancedQuickProfileCard({
  profileId,
  onClose,
  size = 'md',
  className,
  showAchievements = false,
}: EnhancedQuickProfileCardProps) {
  const { user } = useAuth();
  
  // Use our consolidated hook for profile fetching
  const { profile, isLoading, error, fetchProfile } = useProfile(profileId);
  
  // Determine if the current user owns this profile
  const isOwner = user ? profileService.isProfileOwner(profileId) : false;
  
  // Handle loading state
  if (isLoading) {
    return (
      <motion.div {...fadeIn}>
        <Card className={cn(cardStyles.base, 'p-6 overflow-hidden', className)}>
          <div className="flex h-36 items-center justify-center">
            <Spinner size="lg" className="text-[#D7FF00]" />
          </div>
        </Card>
      </motion.div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <motion.div {...scaleIn}>
        <Card className={cn(cardStyles.base, 'p-6 overflow-hidden', className)}>
          <div className="text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
            <p className={cn(textStyles.error, "text-sm font-medium")}>
              {error instanceof ProfileError 
                ? error.message 
                : error?.message || 'Unable to load profile'}
            </p>
            <div className="flex flex-col gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => fetchProfile()}
                className={buttonStyles.secondary}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onClose}
                className={buttonStyles.secondary}
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
  
  // Handle no profile case
  if (!profile) {
    return (
      <motion.div {...scaleIn}>
        <Card className={cn(cardStyles.base, 'p-6 overflow-hidden', className)}>
          <div className="text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
            <p className={cn(textStyles.subtle, "font-medium")}>Profile not found</p>
            <div className="flex flex-col gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => fetchProfile()}
                className={buttonStyles.secondary}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onClose}
                className={buttonStyles.secondary}
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
  
  // Render the profile card with our new components
  return (
    <motion.div {...fadeIn}>
      <Card className={cn(
        cardStyles.profileCard.base, 
        cardStyles.profileCard[size] || cardStyles.profileCard.md,
        'shadow-xl border',
        className
      )}>
        {/* Profile Header */}
        <ProfileCardHeader 
          profile={profile} 
          size={size} 
        />
        
        {/* Profile Body */}
        <div className="p-5 bg-[#14151A]">
          {/* Profile Tier Progress */}
          <EnhancedProfileTierProgress 
            profile={profile} 
            className="mb-5"
          />
          
          {/* Stats Preview Section */}
          <ProfileCardStats 
            profile={profile} 
            compact={size === 'sm'}
          />
          
          {/* Profile Bio */}
          {profile.bio && (
            <ProfileCardBio bio={profile.bio} />
          )}
          
          {/* Achievements (optional) */}
          {showAchievements && (
            <ProfileAchievements 
              profile={profile} 
              limit={3} 
              compact={true}
              className="mb-5"
            />
          )}
          
          {/* Account Status */}
          <ProfileCardStatus 
            profile={profile} 
            isOwner={isOwner}
            user={user}
          />
        </div>
        
        {/* Profile Footer */}
        <ProfileCardFooter 
          profile={profile} 
          isOwner={isOwner}
          onClose={onClose}
        />
      </Card>
    </motion.div>
  );
}
