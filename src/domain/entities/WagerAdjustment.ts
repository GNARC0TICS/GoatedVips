import { z } from 'zod';

export const AdjustmentType = z.enum(['add', 'subtract', 'set']);
export type AdjustmentType = z.infer<typeof AdjustmentType>;

export const WagerTimeframe = z.enum(['daily', 'weekly', 'monthly', 'all_time']);
export type WagerTimeframe = z.infer<typeof WagerTimeframe>;

export const AdjustmentStatus = z.enum(['active', 'reverted']);
export type AdjustmentStatus = z.infer<typeof AdjustmentStatus>;

export const WagerAdjustment = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  goatedId: z.string(),
  adminId: z.string().uuid(),
  
  // Adjustment amounts for each timeframe
  dailyAdjustment: z.number().default(0),
  weeklyAdjustment: z.number().default(0),
  monthlyAdjustment: z.number().default(0),
  allTimeAdjustment: z.number().default(0),
  
  // Adjustment metadata
  reason: z.string().min(1).max(500),
  adjustmentType: AdjustmentType,
  originalValue: z.number().optional(),
  newValue: z.number().optional(),
  
  // Applied scope
  appliedToTimeframe: WagerTimeframe,
  
  // Status tracking
  status: AdjustmentStatus.default('active'),
  isActive: z.boolean().default(true),
  
  // Audit trail
  adminNotes: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  
  createdAt: z.date(),
  revertedAt: z.date().optional(),
  revertedBy: z.string().uuid().optional(),
});

export type WagerAdjustment = z.infer<typeof WagerAdjustment>;

export const CreateWagerAdjustmentInput = WagerAdjustment.omit({
  id: true,
  createdAt: true,
  revertedAt: true,
  revertedBy: true,
  status: true,
});

export type CreateWagerAdjustmentInput = z.infer<typeof CreateWagerAdjustmentInput>;

export const WagerSyncLog = z.object({
  id: z.string().uuid(),
  
  // Sync metadata
  syncType: z.enum(['full', 'incremental', 'user_specific']),
  timeframe: WagerTimeframe,
  
  // Results
  usersProcessed: z.number().default(0),
  usersUpdated: z.number().default(0),
  usersAdded: z.number().default(0),
  errors: z.number().default(0),
  
  // External API info
  apiResponseTime: z.number().optional(), // in milliseconds
  apiStatus: z.enum(['success', 'failure', 'partial']).optional(),
  
  // Sync timing
  startedAt: z.date(),
  completedAt: z.date().optional(),
  duration: z.number().optional(), // in seconds
  
  // Error tracking
  errorDetails: z.record(z.any()).optional(),
  
  createdAt: z.date(),
});

export type WagerSyncLog = z.infer<typeof WagerSyncLog>;

export const ComputedWagerStats = z.object({
  userId: z.string().uuid(),
  goatedId: z.string(),
  username: z.string(),
  
  // Raw amounts from API
  rawDailyWager: z.number().default(0),
  rawWeeklyWager: z.number().default(0),
  rawMonthlyWager: z.number().default(0),
  rawAllTimeWager: z.number().default(0),
  
  // Total adjustments applied
  totalDailyAdjustment: z.number().default(0),
  totalWeeklyAdjustment: z.number().default(0),
  totalMonthlyAdjustment: z.number().default(0),
  totalAllTimeAdjustment: z.number().default(0),
  
  // Final computed amounts (raw + adjustments)
  finalDailyWager: z.number().default(0),
  finalWeeklyWager: z.number().default(0),
  finalMonthlyWager: z.number().default(0),
  finalAllTimeWager: z.number().default(0),
  
  // Rankings based on final amounts
  dailyRank: z.number().optional(),
  weeklyRank: z.number().optional(),
  monthlyRank: z.number().optional(),
  allTimeRank: z.number().optional(),
  
  // Tracking
  hasAdjustments: z.boolean().default(false),
  adjustmentCount: z.number().default(0),
  lastApiSync: z.date().optional(),
  lastAdjustment: z.date().optional(),
  
  updatedAt: z.date(),
  computedAt: z.date(),
});

export type ComputedWagerStats = z.infer<typeof ComputedWagerStats>;

// Input schemas for operations
export const CreateAdjustmentInput = z.object({
  goatedId: z.string(),
  adjustmentType: AdjustmentType,
  appliedToTimeframe: WagerTimeframe,
  adjustmentAmount: z.number(), // The amount to add/subtract or the new value to set
  reason: z.string().min(1).max(500),
  adminNotes: z.string().optional(),
});

export type CreateAdjustmentInput = z.infer<typeof CreateAdjustmentInput>;

export const BulkAdjustmentInput = z.object({
  adjustments: z.array(CreateAdjustmentInput).min(1),
  reason: z.string().min(1).max(500),
  adminNotes: z.string().optional(),
});

export type BulkAdjustmentInput = z.infer<typeof BulkAdjustmentInput>;

export const RevertAdjustmentInput = z.object({
  adjustmentId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export type RevertAdjustmentInput = z.infer<typeof RevertAdjustmentInput>;