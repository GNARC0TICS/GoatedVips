import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { createQueryFn } from '@/lib/queryClient';

// Schema for a single leaderboard entry
export const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  username: z.string(),
  avatarUrl: z.string().optional().nullable(),
  rank: z.number(),
  wagered: z.number(),
  won: z.number(),
  profit: z.number(),
  profitPercentage: z.number().optional(),
  isCurrentUser: z.boolean().optional().default(false),
});

// Schema for the overall leaderboard response
export const LeaderboardResponseSchema = z.object({
  entries: z.array(LeaderboardEntrySchema),
  timeframe: z.enum(['today', 'weekly', 'monthly', 'all_time']),
  total: z.number(),
  timestamp: z.number().optional(),
});

// TypeScript types derived from the schemas
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;

// Available leaderboard timeframes
export type LeaderboardTimeframe = 'today' | 'weekly' | 'monthly' | 'all_time';

/**
 * Custom hook for fetching and validating leaderboard data
 * Uses optimized caching and stale-time settings
 * 
 * @param timeframe - The timeframe to fetch (today, weekly, monthly, all_time)
 * @param options - Additional query options to customize the behavior
 */
export function useLeaderboard(
  timeframe: LeaderboardTimeframe = 'today',
  options: Omit<UseQueryOptions<LeaderboardResponse, Error>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery<LeaderboardResponse, Error>({
    queryKey: ['/api/leaderboard', { timeframe }],
    queryFn: createQueryFn(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      try {
        // Validate and transform the data using Zod
        return LeaderboardResponseSchema.parse(data);
      } catch (error) {
        console.error('Leaderboard data validation error:', error);
        // Return the raw data if validation fails but log the error
        return data as LeaderboardResponse;
      }
    },
    ...options,
  });
}

/**
 * Hook for fetching a specific user's leaderboard position
 * 
 * @param userId - The user ID to fetch position for
 * @param timeframe - The timeframe to check
 */
export function useUserLeaderboardPosition(
  userId: string | undefined,
  timeframe: LeaderboardTimeframe = 'today',
  options: Omit<UseQueryOptions<LeaderboardEntry | null, Error>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery<LeaderboardEntry | null, Error>({
    queryKey: ['/api/leaderboard/user', { userId, timeframe }],
    queryFn: createQueryFn(),
    // Don't fetch if no userId is provided
    enabled: !!userId,
    // Use longer stale time for user positions
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}