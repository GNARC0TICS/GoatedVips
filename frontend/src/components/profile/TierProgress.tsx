import React from 'react';
import { ProfileTierProgress } from './ProfileTierProgress';
import { isFeatureEnabled } from '@/config/feature-flags';
import type { UserProfile } from '@/services/profileService';

/**
 * Props for the TierProgress component
 */
export interface TierProgressProps {
  /** User profile data */
  profile: UserProfile;
  /** Optional CSS class name */
  className?: string;
  /** Explicitly enable/disable enhanced version (overrides feature flag) */
  useEnhanced?: boolean;
}

/**
 * TierProgress - A unified component that can render either the original or enhanced
 * tier progress visualization based on a feature flag.
 * 
 * This wrapper provides a unified interface for tier progress components
 * without requiring changes to all component consumers.
 * 
 * @example
 * // Basic usage - will use feature flag to determine which version to render
 * <TierProgress profile={profile} />
 * 
 * @example
 * // With explicit control of which version to render
 * <TierProgress profile={profile} useEnhanced={true} />
 */
export function TierProgress({
  profile,
  className,
  useEnhanced,
}: TierProgressProps) {
  // Determine whether to use enhanced version
  // Priority:
  // 1. Explicit prop (if provided)
  // 2. Feature flag (if not explicitly set)
  const shouldUseEnhanced = useEnhanced !== undefined
    ? useEnhanced
    : isFeatureEnabled('profiles.useEnhancedTierProgress');
  
  // If the enhanced flag is enabled, use the enhanced version
  if (shouldUseEnhanced) {
    return (
      <ProfileTierProgress
        profile={profile}
        className={className}
      />
    );
  }
  
  // Otherwise fall back to the original version
  return (
    <ProfileTierProgress
      profile={profile}
      className={className}
    />
  );
}

export default TierProgress;
