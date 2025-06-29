import { z } from 'zod';

export const WagerPeriod = z.enum(['daily', 'weekly', 'monthly', 'all_time']);
export type WagerPeriod = z.infer<typeof WagerPeriod>;

export const WagerStats = z.object({
  userId: z.string().uuid(),
  goatedId: z.string(),
  username: z.string(),
  
  // Wager amounts
  daily: z.number().min(0).default(0),
  weekly: z.number().min(0).default(0),
  monthly: z.number().min(0).default(0),
  allTime: z.number().min(0).default(0),
  
  // Rankings
  dailyRank: z.number().optional(),
  weeklyRank: z.number().optional(),
  monthlyRank: z.number().optional(),
  allTimeRank: z.number().optional(),
  
  // Metadata
  lastSyncAt: z.date(),
  syncSource: z.enum(['api', 'manual', 'webhook']).default('api'),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WagerStats = z.infer<typeof WagerStats>;

export const WagerEntry = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  goatedId: z.string(),
  
  amount: z.number().min(0),
  currency: z.string().default('USD'),
  game: z.string().optional(),
  
  timestamp: z.date(),
  syncedAt: z.date(),
  
  // Metadata
  source: z.enum(['api', 'webhook', 'manual']).default('api'),
  verified: z.boolean().default(false),
  
  createdAt: z.date(),
});

export type WagerEntry = z.infer<typeof WagerEntry>;

export const CreateWagerStatsInput = WagerStats.omit({
  createdAt: true,
  updatedAt: true,
});

export type CreateWagerStatsInput = z.infer<typeof CreateWagerStatsInput>;

export const UpdateWagerStatsInput = WagerStats.partial().omit({
  userId: true,
  createdAt: true,
});

export type UpdateWagerStatsInput = z.infer<typeof UpdateWagerStatsInput>;