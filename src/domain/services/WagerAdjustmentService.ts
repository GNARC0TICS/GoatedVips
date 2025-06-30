import { 
  WagerAdjustment, 
  CreateWagerAdjustmentInput, 
  CreateAdjustmentInput,
  BulkAdjustmentInput,
  RevertAdjustmentInput,
  ComputedWagerStats,
  WagerTimeframe,
  AdjustmentType 
} from '../entities/WagerAdjustment';
import { IWagerAdjustmentRepository } from '../repositories/IWagerAdjustmentRepository';
import { ICacheService } from '../../infrastructure/cache/ICacheService';
import { UserService } from './UserService';

export class WagerAdjustmentService {
  constructor(
    private wagerAdjustmentRepository: IWagerAdjustmentRepository,
    private cacheService: ICacheService,
    private userService: UserService
  ) {}

  /**
   * Create a single wager adjustment
   */
  async createAdjustment(
    input: CreateAdjustmentInput,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<WagerAdjustment> {
    // Validate that the user exists and get their current stats
    const user = await this.userService.findByGoatedId(input.goatedId);
    if (!user) {
      throw new Error(`User with Goated ID ${input.goatedId} not found`);
    }

    // Get current wager stats to calculate the adjustment
    const currentStats = await this.getComputedWagerStats(user.id);
    if (!currentStats) {
      throw new Error(`Wager stats not found for user ${input.goatedId}`);
    }

    // Calculate adjustment amounts based on type and timeframe
    const adjustmentData = this.calculateAdjustmentAmounts(
      input,
      currentStats
    );

    // Create the adjustment record
    const adjustmentInput: CreateWagerAdjustmentInput = {
      userId: user.id,
      goatedId: input.goatedId,
      adminId,
      ...adjustmentData,
      reason: input.reason,
      adjustmentType: input.adjustmentType,
      appliedToTimeframe: input.appliedToTimeframe,
      adminNotes: input.adminNotes,
      ipAddress,
      userAgent,
      isActive: true,
    };

    const adjustment = await this.wagerAdjustmentRepository.create(adjustmentInput);

    // Invalidate relevant caches
    await this.invalidateUserCaches(user.id, input.goatedId);

    // Recompute the user's wager stats
    await this.recomputeUserStats(user.id);

    return adjustment;
  }

  /**
   * Create multiple adjustments in a transaction
   */
  async createBulkAdjustments(
    input: BulkAdjustmentInput,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<WagerAdjustment[]> {
    const adjustments: WagerAdjustment[] = [];

    // Validate all users exist first
    for (const adjInput of input.adjustments) {
      const user = await this.userService.findByGoatedId(adjInput.goatedId);
      if (!user) {
        throw new Error(`User with Goated ID ${adjInput.goatedId} not found`);
      }
    }

    // Create all adjustments
    for (const adjInput of input.adjustments) {
      const adjustment = await this.createAdjustment(
        {
          ...adjInput,
          reason: input.reason, // Use bulk reason
          adminNotes: input.adminNotes,
        },
        adminId,
        ipAddress,
        userAgent
      );
      adjustments.push(adjustment);
    }

    return adjustments;
  }

  /**
   * Revert an adjustment
   */
  async revertAdjustment(
    input: RevertAdjustmentInput,
    adminId: string
  ): Promise<WagerAdjustment> {
    const adjustment = await this.wagerAdjustmentRepository.findById(input.adjustmentId);
    if (!adjustment) {
      throw new Error('Adjustment not found');
    }

    if (adjustment.status === 'reverted') {
      throw new Error('Adjustment is already reverted');
    }

    // Update the adjustment to reverted status
    const revertedAdjustment = await this.wagerAdjustmentRepository.update(
      adjustment.id,
      {
        status: 'reverted',
        isActive: false,
        revertedAt: new Date(),
        revertedBy: adminId,
        adminNotes: `${adjustment.adminNotes || ''}\n\nREVERTED: ${input.reason}`,
      }
    );

    if (!revertedAdjustment) {
      throw new Error('Failed to revert adjustment');
    }

    // Invalidate caches and recompute stats
    await this.invalidateUserCaches(adjustment.userId, adjustment.goatedId);
    await this.recomputeUserStats(adjustment.userId);

    return revertedAdjustment;
  }

  /**
   * Get all adjustments for a user
   */
  async getUserAdjustments(
    goatedId: string,
    limit = 50,
    offset = 0
  ): Promise<{ adjustments: WagerAdjustment[]; total: number }> {
    return this.wagerAdjustmentRepository.findByGoatedId(goatedId, limit, offset);
  }

  /**
   * Get computed wager stats for a user (includes adjustments)
   */
  async getComputedWagerStats(userId: string): Promise<ComputedWagerStats | null> {
    const cacheKey = `computed_wager_stats:${userId}`;
    
    // Try cache first
    const cached = await this.cacheService.get<ComputedWagerStats>(cacheKey);
    if (cached) return cached;

    // Get from database
    const stats = await this.wagerAdjustmentRepository.getComputedStats(userId);
    if (stats) {
      await this.cacheService.set(cacheKey, stats, 300); // 5 minutes
    }

    return stats;
  }

  /**
   * Recompute all wager stats for a user
   */
  async recomputeUserStats(userId: string): Promise<ComputedWagerStats> {
    // Get raw wager data from the latest sync
    const rawStats = await this.wagerAdjustmentRepository.getRawWagerStats(userId);
    if (!rawStats) {
      throw new Error('Raw wager stats not found for user');
    }

    // Get all active adjustments for the user
    const adjustments = await this.wagerAdjustmentRepository.findActiveByUserId(userId);

    // Calculate total adjustments for each timeframe
    const totalAdjustments = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      allTime: 0,
    };

    adjustments.forEach(adj => {
      totalAdjustments.daily += adj.dailyAdjustment;
      totalAdjustments.weekly += adj.weeklyAdjustment;
      totalAdjustments.monthly += adj.monthlyAdjustment;
      totalAdjustments.allTime += adj.allTimeAdjustment;
    });

    // Calculate final amounts
    const computedStats: ComputedWagerStats = {
      userId: rawStats.userId,
      goatedId: rawStats.goatedId,
      username: rawStats.username,
      
      rawDailyWager: rawStats.rawDailyWager,
      rawWeeklyWager: rawStats.rawWeeklyWager,
      rawMonthlyWager: rawStats.rawMonthlyWager,
      rawAllTimeWager: rawStats.rawAllTimeWager,
      
      totalDailyAdjustment: totalAdjustments.daily,
      totalWeeklyAdjustment: totalAdjustments.weekly,
      totalMonthlyAdjustment: totalAdjustments.monthly,
      totalAllTimeAdjustment: totalAdjustments.allTime,
      
      finalDailyWager: Math.max(0, rawStats.rawDailyWager + totalAdjustments.daily),
      finalWeeklyWager: Math.max(0, rawStats.rawWeeklyWager + totalAdjustments.weekly),
      finalMonthlyWager: Math.max(0, rawStats.rawMonthlyWager + totalAdjustments.monthly),
      finalAllTimeWager: Math.max(0, rawStats.rawAllTimeWager + totalAdjustments.allTime),
      
      hasAdjustments: adjustments.length > 0,
      adjustmentCount: adjustments.length,
      lastAdjustment: adjustments.length > 0 ? 
        adjustments.reduce((latest, adj) => 
          adj.createdAt > latest ? adj.createdAt : latest, adjustments[0].createdAt
        ) : undefined,
      
      updatedAt: new Date(),
      computedAt: new Date(),
    };

    // Save computed stats
    await this.wagerAdjustmentRepository.upsertComputedStats(computedStats);

    // Update cache
    const cacheKey = `computed_wager_stats:${userId}`;
    await this.cacheService.set(cacheKey, computedStats, 300);

    return computedStats;
  }

  /**
   * Calculate adjustment amounts based on type and timeframe
   */
  private calculateAdjustmentAmounts(
    input: CreateAdjustmentInput,
    currentStats: ComputedWagerStats
  ): {
    dailyAdjustment: number;
    weeklyAdjustment: number;
    monthlyAdjustment: number;
    allTimeAdjustment: number;
    originalValue: number;
    newValue: number;
  } {
    // Initialize all adjustments to 0
    const adjustments = {
      dailyAdjustment: 0,
      weeklyAdjustment: 0,
      monthlyAdjustment: 0,
      allTimeAdjustment: 0,
      originalValue: 0,
      newValue: 0,
    };

    // Get the current value for the target timeframe
    const getCurrentValue = (timeframe: WagerTimeframe): number => {
      switch (timeframe) {
        case 'daily': return currentStats.finalDailyWager;
        case 'weekly': return currentStats.finalWeeklyWager;
        case 'monthly': return currentStats.finalMonthlyWager;
        case 'all_time': return currentStats.finalAllTimeWager;
      }
    };

    const currentValue = getCurrentValue(input.appliedToTimeframe);
    adjustments.originalValue = currentValue;

    // Calculate the adjustment amount based on type
    let adjustmentAmount: number;
    
    switch (input.adjustmentType) {
      case 'add':
        adjustmentAmount = input.adjustmentAmount;
        adjustments.newValue = currentValue + adjustmentAmount;
        break;
      case 'subtract':
        adjustmentAmount = -Math.abs(input.adjustmentAmount);
        adjustments.newValue = Math.max(0, currentValue + adjustmentAmount);
        break;
      case 'set':
        adjustmentAmount = input.adjustmentAmount - currentValue;
        adjustments.newValue = Math.max(0, input.adjustmentAmount);
        break;
    }

    // Apply the adjustment to the target timeframe
    switch (input.appliedToTimeframe) {
      case 'daily':
        adjustments.dailyAdjustment = adjustmentAmount;
        break;
      case 'weekly':
        adjustments.weeklyAdjustment = adjustmentAmount;
        break;
      case 'monthly':
        adjustments.monthlyAdjustment = adjustmentAmount;
        break;
      case 'all_time':
        adjustments.allTimeAdjustment = adjustmentAmount;
        break;
    }

    return adjustments;
  }

  /**
   * Invalidate user-related caches
   */
  private async invalidateUserCaches(userId: string, goatedId: string): Promise<void> {
    const cacheKeys = [
      `computed_wager_stats:${userId}`,
      `user_adjustments:${goatedId}`,
      `leaderboard:*`, // Invalidate all leaderboard caches
    ];

    for (const key of cacheKeys) {
      if (key.includes('*')) {
        await this.cacheService.deletePattern(key);
      } else {
        await this.cacheService.delete(key);
      }
    }
  }

  /**
   * Get adjustment statistics for admin dashboard
   */
  async getAdjustmentStats(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalAdjustments: number;
    activeAdjustments: number;
    revertedAdjustments: number;
    usersAffected: number;
    totalAmountAdjusted: number;
  }> {
    return this.wagerAdjustmentRepository.getAdjustmentStats(timeframe);
  }

  /**
   * Search adjustments with filters
   */
  async searchAdjustments(filters: {
    adminId?: string;
    timeframe?: WagerTimeframe;
    status?: 'active' | 'reverted';
    dateFrom?: Date;
    dateTo?: Date;
    goatedId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ adjustments: WagerAdjustment[]; total: number }> {
    return this.wagerAdjustmentRepository.searchAdjustments(filters);
  }
}