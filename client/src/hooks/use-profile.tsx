/**
 * Profile Hook
 * 
 * A unified hook for handling user profile data fetching, caching, and error handling.
 * Replaces the legacy useEnsureProfile function.
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { profileService, Profile, ProfileError } from '@/services/profileService';

interface UseProfileOptions {
  /** Don't automatically fetch profile on mount if set to true */
  manual?: boolean;
  /** Whether to include extended stats in the profile data */
  includeStats?: boolean;
  /** Whether to show toast notifications on error */
  showToasts?: boolean;
  /** Number of retries before giving up */
  retries?: number;
}

interface UseProfileReturn {
  /** The profile data if available */
  profile: Profile | null;
  /** Whether the profile is currently loading */
  isLoading: boolean;
  /** Any error that occurred during profile fetching */
  error: Error | null;
  /** Function to manually fetch or refresh profile data */
  fetchProfile: () => Promise<void>;
}

/**
 * Hook for fetching and managing profile data
 * 
 * @param userId - The ID of the user to fetch (can be numeric internal ID or string Goated ID)
 * @param options - Configuration options for profile fetching
 * @returns Profile data, loading state, error state, and fetch function
 */
export function useProfile(
  userId: string | number | null | undefined,
  options: UseProfileOptions = {}
): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(!options.manual);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchProfile = async (retryCount = 0) => {
    if (!userId) {
      setError(new Error('No user ID provided'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use the appropriate fetch method based on options
      const profileData = options.includeStats 
        ? await profileService.getProfileWithStats(userId)
        : await profileService.getProfile(userId);
      
      setProfile(profileData);
    } catch (err) {
      const maxRetries = options.retries ?? 2;
      
      if (retryCount < maxRetries) {
        console.log(`Retrying profile fetch (${retryCount + 1}/${maxRetries})...`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return fetchProfile(retryCount + 1);
      }
      console.error('Error fetching profile:', err);
      
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Only show toast on component mount errors, not manual fetches
      if (!options.manual) {
        toast({
          title: 'Error loading profile',
          description: err instanceof ProfileError 
            ? err.message 
            : 'Could not retrieve user profile. Please try again later.',
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch profile on mount unless manual option is set
  useEffect(() => {
    if (!options.manual && userId) {
      fetchProfile();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
  };
}