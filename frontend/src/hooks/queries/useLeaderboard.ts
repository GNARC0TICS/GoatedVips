import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { createQueryFn } from '@/lib/queryClient';

// Schema for a single leaderboard entry (matching our API response)
export const LeaderboardEntrySchema = z.object({
  uid: z.string(),
  name: z.string(),
  wagered: z.object({
    today: z.number(),
    this_week: z.number(), 
    this_month: z.number(),
    all_time: z.number(),
  }),
  rank: z.number().optional(),
}).transform((data) => ({
  userId: data.uid,
  username: data.name,
  avatarUrl: null,
  rank: data.rank || 0,
  wagered: data.wagered.all_time, // Default to all_time for compatibility
  won: 0, // Not available in current API
  profit: 0, // Not available in current API
  profitPercentage: 0,
  isCurrentUser: false,
  wagerData: data.wagered, // Keep original structure for timeframe-specific access
}));

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

// Schema for the actual API response structure from /api/affiliate/stats
const ApiLeaderboardEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.array(LeaderboardEntrySchema),
  metadata: z.object({
    totalUsers: z.number(),
    lastUpdated: z.string(),
    source: z.string(),
    timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']),
    page: z.number(),
    limit: z.number(), 
    totalPages: z.number(),
  }),
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
  
  // Map frontend timeframes to backend expected timeframes
  const backendTimeframe = timeframe === 'today' ? 'daily' : timeframe;
  
  // The queryFn returns the full API response (including the envelope)
  return useQuery<z.infer<typeof ApiLeaderboardEnvelopeSchema>, Error, LeaderboardResponse>({
    queryKey: ['/api/affiliate/stats', { timeframe: backendTimeframe, limit, page }],
    queryFn: createQueryFn(),
    staleTime: 2 * 60 * 1000, 
    refetchInterval: 2 * 60 * 1000, 
    select: (data) => { // data is the full API response e.g. { success: true, data: [], metadata: {...} }
      try {
        const parsedEnvelope = ApiLeaderboardEnvelopeSchema.parse(data);
        
        // Map backend timeframe back to frontend timeframe
        const frontendTimeframe = parsedEnvelope.metadata.timeframe === 'daily' ? 'today' : parsedEnvelope.metadata.timeframe;
        
        // Transform entries to use correct wagered amount based on timeframe
        const transformedEntries = parsedEnvelope.data.map(entry => {
          let wagerAmount = entry.wagered;
          
          // If entry has wagerData, use timeframe-specific amount
          if (entry.wagerData) {
            switch (frontendTimeframe) {
              case 'today':
                wagerAmount = entry.wagerData.today;
                break;
              case 'weekly':
                wagerAmount = entry.wagerData.this_week;
                break;
              case 'monthly':
                wagerAmount = entry.wagerData.this_month;
                break;
              case 'all_time':
              default:
                wagerAmount = entry.wagerData.all_time;
                break;
            }
          }
          
          return {
            ...entry,
            wagered: wagerAmount,
          };
        });

        const leaderboardData: LeaderboardResponse = {
          entries: transformedEntries,
          timeframe: frontendTimeframe as LeaderboardTimeframe,
          total: parsedEnvelope.metadata.totalUsers,
          timestamp: new Date(parsedEnvelope.metadata.lastUpdated).getTime(),
          page: parsedEnvelope.metadata.page,
          limit: parsedEnvelope.metadata.limit,
          totalPages: parsedEnvelope.metadata.totalPages,
        };
        
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
  // Map frontend timeframes to backend expected timeframes
  const backendTimeframe = timeframe === 'today' ? 'daily' : timeframe;
  
  return useQuery<LeaderboardEntry | null, Error>({
    queryKey: ['/api/leaderboard/user', { userId, timeframe: backendTimeframe }],
    queryFn: createQueryFn(),
    // Don't fetch if no userId is provided
    enabled: !!userId,
    // Use longer stale time for user positions
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}