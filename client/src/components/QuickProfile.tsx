/**
 * Legacy Import Support File
 * 
 * This file provides backward compatibility for components that import from the old path.
 * All functionality has been moved to the profile directory for better organization.
 * 
 * @deprecated Import from '@/components/profile/QuickProfile' instead
 */

import { QuickProfile as ProfileComponent } from './profile/QuickProfile';

export const QuickProfile = ProfileComponent;

/**
 * Legacy function to ensure a profile exists
 * @deprecated Use the useProfile hook instead
 */
export function useEnsureProfile(userId: string | number) {
  console.warn(
    'useEnsureProfile is deprecated. Use the useProfile hook from @/hooks/use-profile instead.'
  );
  
  // Import here to avoid circular imports
  const { useProfile } = require('@/hooks/use-profile');
  return useProfile(userId);
}

export default QuickProfile;