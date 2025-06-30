import { 
  WagerAdjustment, 
  CreateWagerAdjustmentInput, 
  ComputedWagerStats,
  WagerTimeframe 
} from '../entities/WagerAdjustment';

export interface IWagerAdjustmentRepository {
  // Adjustment CRUD operations
  create(input: CreateWagerAdjustmentInput): Promise<WagerAdjustment>;
  findById(id: string): Promise<WagerAdjustment | null>;
  update(id: string, data: Partial<WagerAdjustment>): Promise<WagerAdjustment | null>;
  delete(id: string): Promise<boolean>;

  // Find adjustments
  findByGoatedId(goatedId: string, limit?: number, offset?: number): Promise<{
    adjustments: WagerAdjustment[];
    total: number;
  }>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<WagerAdjustment[]>;
  findActiveByUserId(userId: string): Promise<WagerAdjustment[]>;
  findByAdminId(adminId: string, limit?: number, offset?: number): Promise<WagerAdjustment[]>;

  // Computed stats operations
  getComputedStats(userId: string): Promise<ComputedWagerStats | null>;
  upsertComputedStats(stats: ComputedWagerStats): Promise<ComputedWagerStats>;
  getRawWagerStats(userId: string): Promise<{
    userId: string;
    goatedId: string;
    username: string;
    rawDailyWager: number;
    rawWeeklyWager: number;
    rawMonthlyWager: number;
    rawAllTimeWager: number;
  } | null>;

  // Search and filtering
  searchAdjustments(filters: {
    adminId?: string;
    timeframe?: WagerTimeframe;
    status?: 'active' | 'reverted';
    dateFrom?: Date;
    dateTo?: Date;
    goatedId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ adjustments: WagerAdjustment[]; total: number }>;

  // Statistics
  getAdjustmentStats(timeframe: 'day' | 'week' | 'month'): Promise<{
    totalAdjustments: number;
    activeAdjustments: number;
    revertedAdjustments: number;
    usersAffected: number;
    totalAmountAdjusted: number;
  }>;

  // Bulk operations
  createBulk(inputs: CreateWagerAdjustmentInput[]): Promise<WagerAdjustment[]>;
  revertMultiple(adjustmentIds: string[], revertedBy: string, reason: string): Promise<WagerAdjustment[]>;

  // Rankings and leaderboards
  getLeaderboardWithAdjustments(
    timeframe: WagerTimeframe,
    limit?: number,
    offset?: number
  ): Promise<{
    entries: Array<{
      userId: string;
      goatedId: string;
      username: string;
      rawWager: number;
      totalAdjustment: number;
      finalWager: number;
      rank: number;
      hasAdjustments: boolean;
    }>;
    total: number;
  }>;

  // Maintenance operations
  recalculateAllRankings(timeframe?: WagerTimeframe): Promise<void>;
  cleanupOldSyncLogs(olderThanDays: number): Promise<number>;
}