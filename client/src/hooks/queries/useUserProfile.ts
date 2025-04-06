import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest, createQueryFn } from '@/lib/queryClient';

// Schema for user profile data validation
export const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatarUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  profileColor: z.string().optional().nullable(),
  goatedId: z.string().optional().nullable(),
  joinedDate: z.string().optional(),
  isVerified: z.boolean().optional().default(false),
  stats: z.object({
    wagered: z.number().optional(),
    won: z.number().optional(),
    profit: z.number().optional(),
    bets: z.number().optional(),
  }).optional(),
});

// TypeScript type derived from the schema
export type UserProfile = z.infer<typeof UserProfileSchema>;

// Interface for profile update data
interface ProfileUpdateData {
  bio?: string;
  profileColor?: string;
}

/**
 * Hook for fetching user profile with optimized caching
 * 
 * @param userId - The ID of the user to fetch (optional, defaults to current user)
 * @param options - Additional query options
 */
export function useUserProfile(
  userId?: string, 
  options: Omit<UseQueryOptions<UserProfile, Error>, 'queryKey' | 'queryFn'> = {}
) {
  const endpoint = userId 
    ? `/api/users/${userId}` 
    : '/api/user';
  
  return useQuery<UserProfile, Error>({
    queryKey: [endpoint],
    queryFn: createQueryFn({
      // If fetching current user and not authenticated, return null
      shouldReturnNullOn401: !userId
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      try {
        // Validate the data with Zod
        return UserProfileSchema.parse(data);
      } catch (error) {
        console.error('User profile validation error:', error);
        return data as UserProfile;
      }
    },
    ...options
  });
}

/**
 * Hook for updating user profile data
 * 
 * @returns Mutation function and state for updating profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updateData: ProfileUpdateData) => {
      return await apiRequest('/api/user', {
        method: 'PATCH',
        body: updateData
      });
    },
    // When successful, update the cached user profile data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    }
  });
}

/**
 * Hook for fetching multiple user profiles by IDs
 * 
 * @param userIds - Array of user IDs to fetch
 */
export function useUserProfiles(
  userIds: string[] = [],
  options: Omit<UseQueryOptions<UserProfile[], Error>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery<UserProfile[], Error>({
    queryKey: ['/api/users/batch', { ids: userIds.join(',') }],
    queryFn: createQueryFn(),
    // Only enable the query if we have user IDs
    enabled: userIds.length > 0,
    // Cache for longer since user profiles don't change often
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => {
      if (!Array.isArray(data)) {
        console.error('Expected array of user profiles, got:', data);
        return [];
      }
      
      // Validate each user profile
      return data.map(profile => {
        try {
          return UserProfileSchema.parse(profile);
        } catch (error) {
          console.error('User profile validation error:', error);
          return profile as UserProfile;
        }
      });
    },
    ...options
  });
}