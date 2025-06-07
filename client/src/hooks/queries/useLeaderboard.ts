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

// Schema for the actual leaderboard data structure (what the hook should return)
export const LeaderboardResponseSchema = z.object({
  entries: z.array(LeaderboardEntrySchema),
  timeframe: z.enum(['today', 'weekly', 'monthly', 'all_time']),
  total: z.number(),
  timestamp: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
});

// Schema for the API envelope that includes the 'status' field
const ApiLeaderboardEnvelopeSchema = LeaderboardResponseSchema.extend({
  status: z.literal("success"), // Or z.string() if status can vary
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
  options: Omit<UseQueryOptions<LeaderboardResponse, Error>, 'queryKey' | 'queryFn'> & 
           { limit?: number; page?: number } = {}
) {
  const { limit, page, ...queryOptions } = options;
  // The queryFn returns the full API response (including the envelope)
  return useQuery<z.infer<typeof ApiLeaderboardEnvelopeSchema>, Error, LeaderboardResponse>({
    queryKey: ['/api/leaderboard', { timeframe, limit, page }],
    queryFn: createQueryFn(),
    staleTime: 2 * 60 * 1000, 
    refetchInterval: 2 * 60 * 1000, 
    select: (data) => { // data is the full API response e.g. { status: "success", entries: [], ... }
      try {
        console.log("[useLeaderboard] Full API response received in select:", data);
        const parsedEnvelope = ApiLeaderboardEnvelopeSchema.parse(data);
        console.log("[useLeaderboard] Envelope parsed successfully. Extracting data for LeaderboardResponseSchema.");
        
        // Construct the object that LeaderboardResponseSchema expects
        const leaderboardData: LeaderboardResponse = {
          entries: parsedEnvelope.entries,
          timeframe: parsedEnvelope.timeframe,
          total: parsedEnvelope.total,
          timestamp: parsedEnvelope.timestamp,
          page: parsedEnvelope.page,
          limit: parsedEnvelope.limit,
          totalPages: parsedEnvelope.totalPages,
        };
        // Optionally, re-validate with LeaderboardResponseSchema if needed, but fields are already covered by ApiLeaderboardEnvelopeSchema
        // LeaderboardResponseSchema.parse(leaderboardData); 
        console.log("[useLeaderboard] Returning data matching LeaderboardResponseSchema:", leaderboardData);
        return leaderboardData;
      } catch (error) {
        console.error('Leaderboard data validation error in useLeaderboard select:', error);
        if (error instanceof z.ZodError) {
          throw new Error(`Leaderboard data validation failed: ${error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', ')}`);
        }
        throw error; 
      }
    },
    ...queryOptions,
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