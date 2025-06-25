import { WagerStats, WagerEntry, CreateWagerStatsInput, UpdateWagerStatsInput, WagerPeriod } from '../entities/Wager';

export interface IWagerRepository {
  // Wager Stats CRUD
  createStats(input: CreateWagerStatsInput): Promise<WagerStats>;
  findStatsByUserId(userId: string): Promise<WagerStats | null>;
  findStatsByGoatedId(goatedId: string): Promise<WagerStats | null>;
  updateStats(userId: string, input: UpdateWagerStatsInput): Promise<WagerStats | null>;
  deleteStats(userId: string): Promise<boolean>;
  
  // Wager Entries
  createEntry(entry: Omit<WagerEntry, 'id' | 'createdAt'>): Promise<WagerEntry>;
  findEntriesByUserId(userId: string, limit?: number, offset?: number): Promise<{
    entries: WagerEntry[];
    total: number;
  }>;
  
  // Leaderboards
  getLeaderboard(period: WagerPeriod, limit?: number, offset?: number): Promise<{
    rankings: (WagerStats & { rank: number })[];
    total: number;
  }>;
  
  // Rankings
  getUserRank(userId: string, period: WagerPeriod): Promise<number | null>;
  updateRankings(period: WagerPeriod): Promise<void>;
  
  // Bulk operations
  bulkUpsertStats(stats: CreateWagerStatsInput[]): Promise<number>;
  
  // Analytics
  getTopWagerers(period: WagerPeriod, limit: number): Promise<WagerStats[]>;
  getTotalWagered(period?: WagerPeriod): Promise<number>;
  getWagerDistribution(): Promise<{
    period: WagerPeriod;
    ranges: {
      min: number;
      max: number;
      count: number;
    }[];
  }[]>;
  
  // Sync operations
  getStaleStats(olderThanMinutes: number): Promise<WagerStats[]>;
  markSynced(userIds: string[]): Promise<void>;
}