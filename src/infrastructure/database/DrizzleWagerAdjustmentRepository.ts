import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, asc, and, sql, count, gte, lte, or, inArray } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

import { 
  WagerAdjustment, 
  CreateWagerAdjustmentInput, 
  ComputedWagerStats,
  WagerTimeframe 
} from '../../domain/entities/WagerAdjustment';
import { IWagerAdjustmentRepository } from '../../domain/repositories/IWagerAdjustmentRepository';
import { wagerAdjustments, computedWagerStats, wagerStats } from './schema';

export class DrizzleWagerAdjustmentRepository implements IWagerAdjustmentRepository {
  private db;
  
  constructor(connectionString: string) {
    const sql = neon(connectionString);
    this.db = drizzle(sql);
  }

  // Adjustment CRUD operations
  async create(input: CreateWagerAdjustmentInput): Promise<WagerAdjustment> {
    const id = uuidv4();
    const now = new Date();
    
    const adjustmentData = {
      id,
      ...input,
      createdAt: now,
    };
    
    const [adjustment] = await this.db
      .insert(wagerAdjustments)
      .values(adjustmentData)
      .returning();
      
    return this.mapToEntity(adjustment);
  }

  async findById(id: string): Promise<WagerAdjustment | null> {
    const [adjustment] = await this.db
      .select()
      .from(wagerAdjustments)
      .where(eq(wagerAdjustments.id, id))
      .limit(1);
      
    return adjustment ? this.mapToEntity(adjustment) : null;
  }

  async update(id: string, data: Partial<WagerAdjustment>): Promise<WagerAdjustment | null> {
    const [adjustment] = await this.db
      .update(wagerAdjustments)
      .set(data)
      .where(eq(wagerAdjustments.id, id))
      .returning();
      
    return adjustment ? this.mapToEntity(adjustment) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(wagerAdjustments)
      .where(eq(wagerAdjustments.id, id));
      
    return result.rowCount > 0;
  }

  // Find adjustments
  async findByGoatedId(goatedId: string, limit = 20, offset = 0): Promise<{
    adjustments: WagerAdjustment[];
    total: number;
  }> {
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(wagerAdjustments)
      .where(eq(wagerAdjustments.goatedId, goatedId));
    
    // Get adjustments
    const adjustmentResults = await this.db
      .select()
      .from(wagerAdjustments)
      .where(eq(wagerAdjustments.goatedId, goatedId))
      .orderBy(desc(wagerAdjustments.createdAt))
      .limit(limit)
      .offset(offset);
    
    return {
      adjustments: adjustmentResults.map(adj => this.mapToEntity(adj)),
      total: totalCount
    };
  }

  async findByUserId(userId: string, limit = 20, offset = 0): Promise<WagerAdjustment[]> {
    const adjustments = await this.db
      .select()
      .from(wagerAdjustments)
      .where(eq(wagerAdjustments.userId, userId))
      .orderBy(desc(wagerAdjustments.createdAt))
      .limit(limit)
      .offset(offset);
    
    return adjustments.map(adj => this.mapToEntity(adj));
  }

  async findActiveByUserId(userId: string): Promise<WagerAdjustment[]> {
    const adjustments = await this.db
      .select()
      .from(wagerAdjustments)
      .where(
        and(
          eq(wagerAdjustments.userId, userId),
          eq(wagerAdjustments.isActive, true),
          eq(wagerAdjustments.status, 'active')
        )
      )
      .orderBy(desc(wagerAdjustments.createdAt));
    
    return adjustments.map(adj => this.mapToEntity(adj));
  }

  async findByAdminId(adminId: string, limit = 20, offset = 0): Promise<WagerAdjustment[]> {
    const adjustments = await this.db
      .select()
      .from(wagerAdjustments)
      .where(eq(wagerAdjustments.adminId, adminId))
      .orderBy(desc(wagerAdjustments.createdAt))
      .limit(limit)
      .offset(offset);
    
    return adjustments.map(adj => this.mapToEntity(adj));
  }

  // Computed stats operations
  async getComputedStats(userId: string): Promise<ComputedWagerStats | null> {
    const [stats] = await this.db
      .select()
      .from(computedWagerStats)
      .where(eq(computedWagerStats.userId, userId))
      .limit(1);
      
    return stats ? this.mapComputedStatsToEntity(stats) : null;
  }

  async upsertComputedStats(stats: ComputedWagerStats): Promise<ComputedWagerStats> {
    const now = new Date();
    const statsData = {
      ...stats,
      updatedAt: now,
      computedAt: now,
    };
    
    const [result] = await this.db
      .insert(computedWagerStats)
      .values(statsData)
      .onConflictDoUpdate({
        target: computedWagerStats.userId,
        set: {
          goatedId: sql`EXCLUDED.goated_id`,
          username: sql`EXCLUDED.username`,
          rawDailyWager: sql`EXCLUDED.raw_daily_wager`,
          rawWeeklyWager: sql`EXCLUDED.raw_weekly_wager`,
          rawMonthlyWager: sql`EXCLUDED.raw_monthly_wager`,
          rawAllTimeWager: sql`EXCLUDED.raw_all_time_wager`,
          totalDailyAdjustment: sql`EXCLUDED.total_daily_adjustment`,
          totalWeeklyAdjustment: sql`EXCLUDED.total_weekly_adjustment`,
          totalMonthlyAdjustment: sql`EXCLUDED.total_monthly_adjustment`,
          totalAllTimeAdjustment: sql`EXCLUDED.total_all_time_adjustment`,
          finalDailyWager: sql`EXCLUDED.final_daily_wager`,
          finalWeeklyWager: sql`EXCLUDED.final_weekly_wager`,
          finalMonthlyWager: sql`EXCLUDED.final_monthly_wager`,
          finalAllTimeWager: sql`EXCLUDED.final_all_time_wager`,
          dailyRank: sql`EXCLUDED.daily_rank`,
          weeklyRank: sql`EXCLUDED.weekly_rank`,
          monthlyRank: sql`EXCLUDED.monthly_rank`,
          allTimeRank: sql`EXCLUDED.all_time_rank`,
          hasAdjustments: sql`EXCLUDED.has_adjustments`,
          adjustmentCount: sql`EXCLUDED.adjustment_count`,
          lastApiSync: sql`EXCLUDED.last_api_sync`,
          lastAdjustment: sql`EXCLUDED.last_adjustment`,
          updatedAt: sql`NOW()`,
          computedAt: sql`NOW()`,
        }
      })
      .returning();
      
    return this.mapComputedStatsToEntity(result);
  }

  async getRawWagerStats(userId: string): Promise<{
    userId: string;
    goatedId: string;
    username: string;
    rawDailyWager: number;
    rawWeeklyWager: number;
    rawMonthlyWager: number;
    rawAllTimeWager: number;
  } | null> {
    const [stats] = await this.db
      .select({
        userId: wagerStats.userId,
        goatedId: wagerStats.goatedId,
        username: wagerStats.username,
        rawDailyWager: wagerStats.dailyWager,
        rawWeeklyWager: wagerStats.weeklyWager,
        rawMonthlyWager: wagerStats.monthlyWager,
        rawAllTimeWager: wagerStats.allTimeWager,
      })
      .from(wagerStats)
      .where(eq(wagerStats.userId, userId))
      .limit(1);
      
    if (!stats) return null;
    
    return {
      userId: stats.userId,
      goatedId: stats.goatedId,
      username: stats.username,
      rawDailyWager: Number(stats.rawDailyWager) || 0,
      rawWeeklyWager: Number(stats.rawWeeklyWager) || 0,
      rawMonthlyWager: Number(stats.rawMonthlyWager) || 0,
      rawAllTimeWager: Number(stats.rawAllTimeWager) || 0,
    };
  }

  // Search and filtering
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
    const conditions = [];
    
    if (filters.adminId) {
      conditions.push(eq(wagerAdjustments.adminId, filters.adminId));
    }
    if (filters.timeframe) {
      conditions.push(eq(wagerAdjustments.appliedToTimeframe, filters.timeframe));
    }
    if (filters.status) {
      conditions.push(eq(wagerAdjustments.status, filters.status));
    }
    if (filters.dateFrom) {
      conditions.push(gte(wagerAdjustments.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(wagerAdjustments.createdAt, filters.dateTo));
    }
    if (filters.goatedId) {
      conditions.push(eq(wagerAdjustments.goatedId, filters.goatedId));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(wagerAdjustments)
      .where(whereClause);
    
    // Get adjustments
    const adjustmentResults = await this.db
      .select()
      .from(wagerAdjustments)
      .where(whereClause)
      .orderBy(desc(wagerAdjustments.createdAt))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);
    
    return {
      adjustments: adjustmentResults.map(adj => this.mapToEntity(adj)),
      total: totalCount
    };
  }

  // Statistics
  async getAdjustmentStats(timeframe: 'day' | 'week' | 'month'): Promise<{
    totalAdjustments: number;
    activeAdjustments: number;
    revertedAdjustments: number;
    usersAffected: number;
    totalAmountAdjusted: number;
  }> {
    const cutoffDate = new Date();
    switch (timeframe) {
      case 'day':
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
    }
    
    const [stats] = await this.db
      .select({
        totalAdjustments: count(),
        activeAdjustments: count(sql`CASE WHEN ${wagerAdjustments.status} = 'active' THEN 1 END`),
        revertedAdjustments: count(sql`CASE WHEN ${wagerAdjustments.status} = 'reverted' THEN 1 END`),
        usersAffected: sql<number>`COUNT(DISTINCT ${wagerAdjustments.userId})`,
        totalAmountAdjusted: sql<number>`COALESCE(SUM(ABS(${wagerAdjustments.dailyAdjustment}) + ABS(${wagerAdjustments.weeklyAdjustment}) + ABS(${wagerAdjustments.monthlyAdjustment}) + ABS(${wagerAdjustments.allTimeAdjustment})), 0)`,
      })
      .from(wagerAdjustments)
      .where(gte(wagerAdjustments.createdAt, cutoffDate));
      
    return {
      totalAdjustments: stats.totalAdjustments,
      activeAdjustments: stats.activeAdjustments,
      revertedAdjustments: stats.revertedAdjustments,
      usersAffected: Number(stats.usersAffected),
      totalAmountAdjusted: Number(stats.totalAmountAdjusted),
    };
  }

  // Bulk operations
  async createBulk(inputs: CreateWagerAdjustmentInput[]): Promise<WagerAdjustment[]> {
    if (inputs.length === 0) return [];
    
    const now = new Date();
    const adjustmentsWithIds = inputs.map(input => ({
      id: uuidv4(),
      ...input,
      createdAt: now,
    }));
    
    const results = await this.db
      .insert(wagerAdjustments)
      .values(adjustmentsWithIds)
      .returning();
    
    return results.map(adj => this.mapToEntity(adj));
  }

  async revertMultiple(adjustmentIds: string[], revertedBy: string, reason: string): Promise<WagerAdjustment[]> {
    if (adjustmentIds.length === 0) return [];
    
    const now = new Date();
    const results = await this.db
      .update(wagerAdjustments)
      .set({
        status: 'reverted',
        isActive: false,
        revertedAt: now,
        revertedBy: revertedBy,
        adminNotes: reason,
      })
      .where(inArray(wagerAdjustments.id, adjustmentIds))
      .returning();
    
    return results.map(adj => this.mapToEntity(adj));
  }

  // Rankings and leaderboards
  async getLeaderboardWithAdjustments(
    timeframe: WagerTimeframe,
    limit = 20,
    offset = 0
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
  }> {
    const finalWagerColumn = this.getFinalWagerColumnForTimeframe(timeframe);
    const rawWagerColumn = this.getRawWagerColumnForTimeframe(timeframe);
    const adjustmentColumn = this.getAdjustmentColumnForTimeframe(timeframe);
    
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(computedWagerStats)
      .where(sql`${finalWagerColumn} > 0`);
    
    // Get leaderboard entries
    const entries = await this.db
      .select({
        userId: computedWagerStats.userId,
        goatedId: computedWagerStats.goatedId,
        username: computedWagerStats.username,
        rawWager: rawWagerColumn,
        totalAdjustment: adjustmentColumn,
        finalWager: finalWagerColumn,
        hasAdjustments: computedWagerStats.hasAdjustments,
      })
      .from(computedWagerStats)
      .where(sql`${finalWagerColumn} > 0`)
      .orderBy(desc(finalWagerColumn))
      .limit(limit)
      .offset(offset);
    
    return {
      entries: entries.map((entry, index) => ({
        userId: entry.userId,
        goatedId: entry.goatedId,
        username: entry.username,
        rawWager: Number(entry.rawWager) || 0,
        totalAdjustment: Number(entry.totalAdjustment) || 0,
        finalWager: Number(entry.finalWager) || 0,
        rank: offset + index + 1,
        hasAdjustments: entry.hasAdjustments,
      })),
      total: totalCount
    };
  }

  // Maintenance operations
  async recalculateAllRankings(timeframe?: WagerTimeframe): Promise<void> {
    if (timeframe) {
      const rankColumn = this.getRankColumnForTimeframe(timeframe);
      const finalWagerColumn = this.getFinalWagerColumnForTimeframe(timeframe);
      
      // Update rankings for specific timeframe
      await this.db.execute(sql`
        UPDATE ${computedWagerStats}
        SET ${rankColumn} = ranked.rank,
            updated_at = NOW()
        FROM (
          SELECT user_id,
                 ROW_NUMBER() OVER (ORDER BY ${finalWagerColumn} DESC) as rank
          FROM ${computedWagerStats}
          WHERE ${finalWagerColumn} > 0
        ) ranked
        WHERE ${computedWagerStats.userId} = ranked.user_id
      `);
    } else {
      // Update all timeframe rankings
      const timeframes: WagerTimeframe[] = ['daily', 'weekly', 'monthly', 'all_time'];
      
      for (const tf of timeframes) {
        await this.recalculateAllRankings(tf);
      }
    }
  }

  async cleanupOldSyncLogs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    // This would be implemented if we had sync logs table
    // For now, return 0 as no cleanup is needed
    return 0;
  }

  // Helper methods
  private getFinalWagerColumnForTimeframe(timeframe: WagerTimeframe) {
    switch (timeframe) {
      case 'daily': return computedWagerStats.finalDailyWager;
      case 'weekly': return computedWagerStats.finalWeeklyWager;
      case 'monthly': return computedWagerStats.finalMonthlyWager;
      case 'all_time': return computedWagerStats.finalAllTimeWager;
      default: throw new Error(`Unknown timeframe: ${timeframe}`);
    }
  }

  private getRawWagerColumnForTimeframe(timeframe: WagerTimeframe) {
    switch (timeframe) {
      case 'daily': return computedWagerStats.rawDailyWager;
      case 'weekly': return computedWagerStats.rawWeeklyWager;
      case 'monthly': return computedWagerStats.rawMonthlyWager;
      case 'all_time': return computedWagerStats.rawAllTimeWager;
      default: throw new Error(`Unknown timeframe: ${timeframe}`);
    }
  }

  private getAdjustmentColumnForTimeframe(timeframe: WagerTimeframe) {
    switch (timeframe) {
      case 'daily': return computedWagerStats.totalDailyAdjustment;
      case 'weekly': return computedWagerStats.totalWeeklyAdjustment;
      case 'monthly': return computedWagerStats.totalMonthlyAdjustment;
      case 'all_time': return computedWagerStats.totalAllTimeAdjustment;
      default: throw new Error(`Unknown timeframe: ${timeframe}`);
    }
  }

  private getRankColumnForTimeframe(timeframe: WagerTimeframe) {
    switch (timeframe) {
      case 'daily': return computedWagerStats.dailyRank;
      case 'weekly': return computedWagerStats.weeklyRank;
      case 'monthly': return computedWagerStats.monthlyRank;
      case 'all_time': return computedWagerStats.allTimeRank;
      default: throw new Error(`Unknown timeframe: ${timeframe}`);
    }
  }

  private mapToEntity(dbAdjustment: any): WagerAdjustment {
    return {
      id: dbAdjustment.id,
      userId: dbAdjustment.userId,
      goatedId: dbAdjustment.goatedId,
      adminId: dbAdjustment.adminId,
      dailyAdjustment: Number(dbAdjustment.dailyAdjustment) || 0,
      weeklyAdjustment: Number(dbAdjustment.weeklyAdjustment) || 0,
      monthlyAdjustment: Number(dbAdjustment.monthlyAdjustment) || 0,
      allTimeAdjustment: Number(dbAdjustment.allTimeAdjustment) || 0,
      reason: dbAdjustment.reason,
      adjustmentType: dbAdjustment.adjustmentType,
      originalValue: dbAdjustment.originalValue ? Number(dbAdjustment.originalValue) : undefined,
      newValue: dbAdjustment.newValue ? Number(dbAdjustment.newValue) : undefined,
      appliedToTimeframe: dbAdjustment.appliedToTimeframe,
      status: dbAdjustment.status,
      isActive: dbAdjustment.isActive,
      adminNotes: dbAdjustment.adminNotes,
      ipAddress: dbAdjustment.ipAddress,
      userAgent: dbAdjustment.userAgent,
      createdAt: dbAdjustment.createdAt,
      revertedAt: dbAdjustment.revertedAt,
      revertedBy: dbAdjustment.revertedBy,
    };
  }

  private mapComputedStatsToEntity(dbStats: any): ComputedWagerStats {
    return {
      userId: dbStats.userId,
      goatedId: dbStats.goatedId,
      username: dbStats.username,
      rawDailyWager: Number(dbStats.rawDailyWager) || 0,
      rawWeeklyWager: Number(dbStats.rawWeeklyWager) || 0,
      rawMonthlyWager: Number(dbStats.rawMonthlyWager) || 0,
      rawAllTimeWager: Number(dbStats.rawAllTimeWager) || 0,
      totalDailyAdjustment: Number(dbStats.totalDailyAdjustment) || 0,
      totalWeeklyAdjustment: Number(dbStats.totalWeeklyAdjustment) || 0,
      totalMonthlyAdjustment: Number(dbStats.totalMonthlyAdjustment) || 0,
      totalAllTimeAdjustment: Number(dbStats.totalAllTimeAdjustment) || 0,
      finalDailyWager: Number(dbStats.finalDailyWager) || 0,
      finalWeeklyWager: Number(dbStats.finalWeeklyWager) || 0,
      finalMonthlyWager: Number(dbStats.finalMonthlyWager) || 0,
      finalAllTimeWager: Number(dbStats.finalAllTimeWager) || 0,
      dailyRank: dbStats.dailyRank,
      weeklyRank: dbStats.weeklyRank,
      monthlyRank: dbStats.monthlyRank,
      allTimeRank: dbStats.allTimeRank,
      hasAdjustments: dbStats.hasAdjustments,
      adjustmentCount: dbStats.adjustmentCount,
      lastApiSync: dbStats.lastApiSync,
      lastAdjustment: dbStats.lastAdjustment,
      updatedAt: dbStats.updatedAt,
      computedAt: dbStats.computedAt,
    };
  }
}