import { z } from 'zod';

export const RaceStatus = z.enum(['upcoming', 'active', 'completed', 'cancelled']);
export type RaceStatus = z.infer<typeof RaceStatus>;

export const RaceType = z.enum(['daily', 'weekly', 'monthly', 'special']);
export type RaceType = z.infer<typeof RaceType>;

export const PrizeDistribution = z.object({
  position: z.number().min(1),
  amount: z.number().min(0),
  currency: z.string().default('USD'),
  description: z.string().optional(),
});

export type PrizeDistribution = z.infer<typeof PrizeDistribution>;

export const Race = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  type: RaceType,
  status: RaceStatus.default('upcoming'),
  
  // Timing
  startTime: z.date(),
  endTime: z.date(),
  
  // Configuration
  minWagerAmount: z.number().min(0).default(0),
  maxParticipants: z.number().optional(),
  
  // Prizes
  totalPrizePool: z.number().min(0),
  prizeDistribution: z.array(PrizeDistribution),
  
  // Metadata
  participantCount: z.number().default(0),
  totalWagered: z.number().default(0),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Race = z.infer<typeof Race>;

export const RaceParticipant = z.object({
  id: z.string().uuid(),
  raceId: z.string().uuid(),
  userId: z.string().uuid(),
  goatedId: z.string(),
  username: z.string(),
  
  // Performance
  totalWager: z.number().min(0).default(0),
  position: z.number().optional(),
  prizeWon: z.number().min(0).default(0),
  
  // Status
  joined: z.boolean().default(true),
  qualified: z.boolean().default(false),
  disqualified: z.boolean().default(false),
  disqualificationReason: z.string().optional(),
  
  // Timestamps
  joinedAt: z.date(),
  lastWagerAt: z.date().optional(),
});

export type RaceParticipant = z.infer<typeof RaceParticipant>;

export const CreateRaceInput = Race.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  participantCount: true,
  totalWagered: true,
});

export type CreateRaceInput = z.infer<typeof CreateRaceInput>;

export const UpdateRaceInput = Race.partial().omit({
  id: true,
  createdAt: true,
});

export type UpdateRaceInput = z.infer<typeof UpdateRaceInput>;