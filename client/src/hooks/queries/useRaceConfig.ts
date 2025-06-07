import { z } from 'zod';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createQueryFn } from '@/lib/queryClient';

// Schema for Prize Distribution
export const PrizeDistributionSchema = z.record(z.number()); // e.g., { "1": 0.425, "2": 0.2, ... }

// Schema for a single Race Configuration
export const RaceConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  prizePool: z.number(),
  currency: z.string(),
  timeframe: z.string(), // e.g., "monthly", or could be a specific race ID/slug
  startDate: z.string().datetime(), // ISO datetime string
  endDate: z.string().datetime(),   // ISO datetime string
  nextRaceStartDate: z.string().datetime().optional().nullable(), // ISO datetime string
  status: z.enum(["active", "upcoming", "ended", "transition"]), // Added transition
  prizeDistribution: PrizeDistributionSchema,
  totalWinners: z.number().int().positive(),
});

// Schema for the API response (assuming the config is nested under a 'data' property like other APIs)
export const RaceConfigResponseSchema = z.object({
  success: z.boolean(),
  data: RaceConfigSchema,
  timestamp: z.string().datetime(),
});

// TypeScript types derived from the schemas
export type PrizeDistribution = z.infer<typeof PrizeDistributionSchema>;
export type RaceConfig = z.infer<typeof RaceConfigSchema>;
export type RaceConfigResponse = z.infer<typeof RaceConfigResponseSchema>;

/**
 * Custom hook for fetching and validating race configuration data.
 * 
 * @param options - Additional query options to customize the behavior.
 */
export function useRaceConfig(
  options: Omit<UseQueryOptions<RaceConfig, Error, RaceConfig>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery<RaceConfigResponse, Error, RaceConfig>({
    queryKey: ['/api/race-config'],
    queryFn: createQueryFn(), 
    staleTime: 5 * 60 * 1000, // 5 minutes, as race config might not change super frequently
    refetchInterval: 15 * 60 * 1000, // 15 minutes, or based on how often config might update
    select: (response) => {
      try {
        // First, validate the entire envelope of the response.
        console.log("[useRaceConfig] Full API response received in select:", response);
        const validatedFullResponse = RaceConfigResponseSchema.parse(response);
        console.log("[useRaceConfig] Full response Zod parsed successfully. Returning nested data field:", validatedFullResponse.data);
        // The hook is typed to return RaceConfig, so we return the nested data object.
        // RaceConfigSchema.parse(validatedFullResponse.data) is implicitly done if RaceConfigResponseSchema is correct.
        return validatedFullResponse.data; 
      } catch (error) {
        console.error('Race configuration data validation error in useRaceConfig select:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`RaceConfig validation failed: ${error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', ')}`);
        }
        throw error; 
      }
    },
    ...options,
  });
} 