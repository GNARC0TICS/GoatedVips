import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, asc, and, sql, count, gte, lte } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

import { WagerStats, WagerEntry, CreateWagerStatsInput, UpdateWagerStatsInput, WagerPeriod } from '../../domain/entities/Wager';
import { IWagerRepository } from '../../domain/repositories/IWagerRepository';
import { wagerStats, wagerEntries } from './schema';

export class DrizzleWagerRepository implements IWagerRepository {
  private db;
  
  constructor(connectionString: string) {
    const sql = neon(connectionString);
    this.db = drizzle(sql);
  }

  // Wager Stats CRUD
  async createStats(input: CreateWagerStatsInput): Promise<WagerStats> {
    const now = new Date();
    
    const statsData = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    
    const [stats] = await this.db
      .insert(wagerStats)
      .values(statsData)
      .returning();
      
    return this.mapStatsToEntity(stats);
  }

  async findStatsByUserId(userId: string): Promise<WagerStats | null> {
    const [stats] = await this.db
      .select()
      .from(wagerStats)
      .where(eq(wagerStats.userId, userId))
      .limit(1);
      
    return stats ? this.mapStatsToEntity(stats) : null;
  }

  async findStatsByGoatedId(goatedId: string): Promise<WagerStats | null> {
    const [stats] = await this.db
      .select()
      .from(wagerStats)
      .where(eq(wagerStats.goatedId, goatedId))
      .limit(1);
      
    return stats ? this.mapStatsToEntity(stats) : null;
  }

  async updateStats(userId: string, input: UpdateWagerStatsInput): Promise<WagerStats | null> {
    const updateData = {
      ...input,
      updatedAt: new Date(),
    };
    
    const [stats] = await this.db
      .update(wagerStats)
      .set(updateData)
      .where(eq(wagerStats.userId, userId))
      .returning();
      
    return stats ? this.mapStatsToEntity(stats) : null;
  }

  async deleteStats(userId: string): Promise<boolean> {
    const result = await this.db
      .delete(wagerStats)
      .where(eq(wagerStats.userId, userId));
      
    return result.rowCount > 0;
  }

  // Wager Entries
  async createEntry(entry: Omit<WagerEntry, 'id' | 'createdAt'>): Promise<WagerEntry> {
    const id = uuidv4();
    const now = new Date();
    
    const entryData = {
      id,
      ...entry,
      // Map timestamp field name
      wagerTimestamp: entry.timestamp,
      createdAt: now,
    };
    
    // Remove the original timestamp field since we mapped it
    delete (entryData as any).timestamp;
    
    const [newEntry] = await this.db
      .insert(wagerEntries)
      .values(entryData)
      .returning();
      
    return this.mapEntryToEntity(newEntry);
  }

  async findEntriesByUserId(userId: string, limit = 20, offset = 0): Promise<{
    entries: WagerEntry[];
    total: number;
  }> {
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(wagerEntries)
      .where(eq(wagerEntries.userId, userId));
    
    // Get entries
    const entries = await this.db
      .select()
      .from(wagerEntries)
      .where(eq(wagerEntries.userId, userId))
      .orderBy(desc(wagerEntries.wagerTimestamp))
      .limit(limit)
      .offset(offset);
    
    return {
      entries: entries.map(entry => this.mapEntryToEntity(entry)),
      total: totalCount
    };
  }

  // Leaderboards
  async getLeaderboard(period: WagerPeriod, limit = 20, offset = 0): Promise<{
    rankings: (WagerStats & { rank: number })[];
    total: number;
  }> {
    const wagerColumn = this.getWagerColumnForPeriod(period);
    const rankColumn = this.getRankColumnForPeriod(period);
    
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(wagerStats)
      .where(sql`${wagerColumn} > 0`);
    
    // Get rankings
    const rankings = await this.db
      .select()
      .from(wagerStats)
      .where(sql`${wagerColumn} > 0`)
      .orderBy(desc(wagerColumn))
      .limit(limit)
      .offset(offset);
    
    return {
      rankings: rankings.map((stats, index) => ({
        ...this.mapStatsToEntity(stats),
        rank: offset + index + 1
      })),
      total: totalCount
    };
  }

  // Rankings
  async getUserRank(userId: string, period: WagerPeriod): Promise<number | null> {
    const stats = await this.findStatsByUserId(userId);
    if (!stats) return null;
    
    const rankColumn = this.getRankColumnForPeriod(period);
    return stats[this.getRankFieldForPeriod(period)] || null;
  }

  async updateRankings(period: WagerPeriod): Promise<void> {
    const wagerColumn = this.getWagerColumnForPeriod(period);
    const rankColumn = this.getRankColumnForPeriod(period);
    
    // Update rankings using window function
    await this.db.execute(sql`
      UPDATE ${wagerStats}
      SET ${rankColumn} = ranked.rank,
          updated_at = NOW()
      FROM (
        SELECT user_id,
               ROW_NUMBER() OVER (ORDER BY ${wagerColumn} DESC) as rank
        FROM ${wagerStats}
        WHERE ${wagerColumn} > 0
      ) ranked
      WHERE ${wagerStats.userId} = ranked.user_id
    `);
  }

  // Bulk operations
  async bulkUpsertStats(stats: CreateWagerStatsInput[]): Promise<number> {
    if (stats.length === 0) return 0;
    
    const now = new Date();
    const statsWithTimestamps = stats.map(stat => ({
      ...stat,
      createdAt: now,
      updatedAt: now,
    }));
    
    const result = await this.db
      .insert(wagerStats)
      .values(statsWithTimestamps)
      .onConflictDoUpdate({
        target: wagerStats.userId,
        set: {
          dailyWager: sql`EXCLUDED.daily_wager`,
          weeklyWager: sql`EXCLUDED.weekly_wager`,
          monthlyWager: sql`EXCLUDED.monthly_wager`,
          allTimeWager: sql`EXCLUDED.all_time_wager`,
          username: sql`EXCLUDED.username`,
          lastSyncAt: sql`EXCLUDED.last_sync_at`,
          syncSource: sql`EXCLUDED.sync_source`,
          updatedAt: sql`NOW()`,
        }
      });
    
    return result.rowCount || 0;
  }

  // Analytics
  async getTopWagerers(period: WagerPeriod, limit: number): Promise<WagerStats[]> {
    const wagerColumn = this.getWagerColumnForPeriod(period);
    
    const topWagerers = await this.db
      .select()
      .from(wagerStats)
      .where(sql`${wagerColumn} > 0`)
      .orderBy(desc(wagerColumn))
      .limit(limit);
    
    return topWagerers.map(stats => this.mapStatsToEntity(stats));
  }

  async getTotalWagered(period?: WagerPeriod): Promise<number> {
    if (!period) {
      // Sum all-time wagered across all users
      const [result] = await this.db
        .select({
          total: sql<number>`COALESCE(SUM(${wagerStats.allTimeWager}), 0)`
        })
        .from(wagerStats);
      
      return Number(result.total) || 0;
    }
    
    const wagerColumn = this.getWagerColumnForPeriod(period);
    const [result] = await this.db
      .select({
        total: sql<number>`COALESCE(SUM(${wagerColumn}), 0)`
      })
      .from(wagerStats);
    
    return Number(result.total) || 0;
  }

  async getWagerDistribution(): Promise<{
    period: WagerPeriod;
    ranges: {
      min: number;
      max: number;
      count: number;
    }[];
  }[]> {
    const periods: WagerPeriod[] = ['daily', 'weekly', 'monthly', 'all_time'];
    const ranges = [
      { min: 0, max: 100 },
      { min: 100, max: 1000 },
      { min: 1000, max: 10000 },
      { min: 10000, max: 100000 },
      { min: 100000, max: Infinity }
    ];
    
    const distributions = [];
    
    for (const period of periods) {
      const wagerColumn = this.getWagerColumnForPeriod(period);
      const rangeResults = [];
      
      for (const range of ranges) {
        const whereClause = range.max === Infinity
          ? sql`${wagerColumn} >= ${range.min}`
          : sql`${wagerColumn} >= ${range.min} AND ${wagerColumn} < ${range.max}`;
        
        const [result] = await this.db
          .select({ count: count() })
          .from(wagerStats)
          .where(whereClause);
        
        rangeResults.push({
          min: range.min,
          max: range.max,
          count: result.count
        });
      }
      
      distributions.push({
        period,
        ranges: rangeResults
      });
    }
    
    return distributions;
  }

  // Sync operations
  async getStaleStats(olderThanMinutes: number): Promise<WagerStats[]> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);
    
    const staleStats = await this.db
      .select()
      .from(wagerStats)
      .where(lte(wagerStats.lastSyncAt, cutoffTime))
      .orderBy(asc(wagerStats.lastSyncAt));
    
    return staleStats.map(stats => this.mapStatsToEntity(stats));
  }

  async markSynced(userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;
    
    await this.db
      .update(wagerStats)
      .set({ 
        lastSyncAt: new Date(),
        updatedAt: new Date()
      })
      .where(sql`${wagerStats.userId} = ANY(${userIds})`);
  }

  // Helper methods
  private getWagerColumnForPeriod(period: WagerPeriod) {
    switch (period) {
      case 'daily': return wagerStats.dailyWager;
      case 'weekly': return wagerStats.weeklyWager;
      case 'monthly': return wagerStats.monthlyWager;
      case 'all_time': return wagerStats.allTimeWager;
      default: throw new Error(`Unknown period: ${period}`);
    }
  }

  private getRankColumnForPeriod(period: WagerPeriod) {
    switch (period) {
      case 'daily': return wagerStats.dailyRank;
      case 'weekly': return wagerStats.weeklyRank;
      case 'monthly': return wagerStats.monthlyRank;
      case 'all_time': return wagerStats.allTimeRank;
      default: throw new Error(`Unknown period: ${period}`);
    }
  }

  private getRankFieldForPeriod(period: WagerPeriod): keyof WagerStats {
    switch (period) {
      case 'daily': return 'dailyRank';
      case 'weekly': return 'weeklyRank';
      case 'monthly': return 'monthlyRank';
      case 'all_time': return 'allTimeRank';
      default: throw new Error(`Unknown period: ${period}`);
    }
  }

  private mapStatsToEntity(dbStats: any): WagerStats {
    return {
      userId: dbStats.userId,
      goatedId: dbStats.goatedId,
      username: dbStats.username,
      daily: Number(dbStats.dailyWager) || 0,
      weekly: Number(dbStats.weeklyWager) || 0,
      monthly: Number(dbStats.monthlyWager) || 0,
      allTime: Number(dbStats.allTimeWager) || 0,
      dailyRank: dbStats.dailyRank,
      weeklyRank: dbStats.weeklyRank,
      monthlyRank: dbStats.monthlyRank,
      allTimeRank: dbStats.allTimeRank,
      lastSyncAt: dbStats.lastSyncAt,
      syncSource: dbStats.syncSource,
      createdAt: dbStats.createdAt,
      updatedAt: dbStats.updatedAt,
    };
  }

  private mapEntryToEntity(dbEntry: any): WagerEntry {
    return {
      id: dbEntry.id,
      userId: dbEntry.userId,
      goatedId: dbEntry.goatedId,
      amount: Number(dbEntry.amount) || 0,
      currency: dbEntry.currency,
      game: dbEntry.game,
      timestamp: dbEntry.wagerTimestamp,
      syncedAt: dbEntry.syncedAt,
      source: dbEntry.source,
      verified: dbEntry.verified,
      createdAt: dbEntry.createdAt,
    };
  }
}