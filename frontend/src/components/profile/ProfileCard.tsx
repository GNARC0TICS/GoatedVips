import React from 'react';
import { QuickProfileCard } from './QuickProfileCard';
import { EnhancedQuickProfileCard } from './EnhancedQuickProfileCard';
import { isFeatureEnabled } from '@/config/feature-flags';

// Base interface for profile card props
export interface ProfileCardBaseProps {
  profileId: string | number;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Extended interface with enhanced features
export interface ProfileCardProps extends ProfileCardBaseProps {
  useEnhanced?: boolean;
  showAchievements?: boolean;
}

/**
 * ProfileCard - A unified component that can render either the original or enhanced version
 * based on a feature flag.
 * 
 * This wrapper allows for gradual migration from QuickProfileCard to EnhancedQuickProfileCard
 * without requiring changes to all component consumers.
 * 
 * @example
 * // Basic usage - will use feature flag to determine which version to render
 * <ProfileCard profileId={user.id} />
 * 
 * @example
 * // With explicit control of which version to render
 * <ProfileCard profileId={user.id} useEnhanced={true} />
 */
export function ProfileCard({
  profileId,
  onClose,
  size = 'md',
  className,
  useEnhanced,
  showAchievements = false,
  ...props
}: ProfileCardProps) {
  // Determine whether to use enhanced version
  // Priority:
  // 1. Explicit prop (if provided)
  // 2. Feature flag (if not explicitly set)
  const shouldUseEnhanced = useEnhanced !== undefined
    ? useEnhanced
    : isFeatureEnabled('profiles.useEnhancedProfileCard');
  
  // If the enhanced flag is enabled, use the enhanced version
  if (shouldUseEnhanced) {
    return (
      <EnhancedQuickProfileCard
        profileId={profileId}
        onClose={onClose}
        size={size}
        className={className}
        showAchievements={showAchievements}
        {...props}
      />
    );
  }
  
  // Otherwise fall back to the original version
  return (
    <QuickProfileCard
      profileId={profileId}
      onClose={onClose}
      size={size}
      className={className}
      {...props}
    />
  );
}

export default ProfileCard;
