/**
 * StatSyncService
 * 
 * Handles all data synchronization, transformation, and statistical operations:
 * - Fetching and transforming leaderboard data from external APIs
 * - Processing raw API data into standardized formats
 * - Sorting and ranking calculations for different time periods
 * - Statistical aggregations and analysis
 * - Data transformation logging and monitoring
 * 
 * This service focuses on pure data processing and transformation,
 * without user management or race-specific logic.
 */

import { db } from "@db";
import { users, transformationLogs, affiliateStats } from "@db/schema"; // Added users
import { eq, inArray, and, sql } from "drizzle-orm"; // Added sql, inArray, and, eq
import goatedApiService from "./goatedApiService";

// TODO: Move to shared types file during future refactor
interface LeaderboardEntry {
  uid: string;
  name: string;
  rank?: number; // Added optional rank
  wagered: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
}

/**
 * LeaderboardData represents the complete structured leaderboard data
 * This is the primary data structure for affiliate statistics
 */
export interface LeaderboardData {
  status: "success" | "error";
  metadata: {
    totalUsers: number;
    lastUpdated: string;
  };
  data: {
    today: { data: LeaderboardEntry[] };
    weekly: { data: LeaderboardEntry[] };
    monthly: { data: LeaderboardEntry[] };
    all_time: { data: LeaderboardEntry[] };
  };
}

/**
 * Statistical aggregations for analytics
 */
export interface StatsAggregation {
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  allTimeTotal: number;
  userCount: number;
  averageWager: number;
  topWager: number;
}

/**
 * Time period types for data sorting
 */
export type TimePeriod = "today" | "this_week" | "this_month" | "all_time";

export class StatSyncService {
  
  /**
   * Get leaderboard data for all timeframes
   * Used by the /api/affiliate/stats endpoint
   */
  async getLeaderboardData(): Promise<LeaderboardData> {
    const startTime = Date.now();
    console.log("StatSyncService: Fetching and transforming leaderboard data");
    
    try {
      // Fetch raw data from external API
      const rawData = await goatedApiService.fetchReferralData();
      console.log("StatSyncService: Raw data received:", !!rawData);
      
      if (!rawData) {
        throw new Error('No raw data received from external API');
      }
      
      // Transform the data to our standardized format
      const transformedData = this.transformToLeaderboard(rawData);
      console.log("StatSyncService: Data transformed successfully:", !!transformedData);
      
      if (!transformedData) {
        throw new Error('Failed to transform data - transformToLeaderboard returned null/undefined');
      }
      
      if (!transformedData.data || !transformedData.data.all_time) {
        throw new Error('Transformed data is missing required structure');
      }
      
      // Log successful transformation
      await this.logTransformation('leaderboard', 'success', 
        `Transformed leaderboard data with ${transformedData.data.all_time.data.length} users`, 
        Date.now() - startTime);

      // Apply privacy censoring
      const allUserUids = new Set<string>();
      Object.values(transformedData.data).forEach(timeframe => {
        timeframe.data.forEach(user => allUserUids.add(user.uid));
      });

      if (allUserUids.size > 0) {
        const privateUsers = await db.select({ goatedId: users.goatedId, id: users.id })
          .from(users)
          .where(and(
            inArray(users.goatedId, Array.from(allUserUids)),
            eq(users.goatedAccountLinked, true),
            sql`profile_public = false` // Using raw SQL column name as a workaround for TS error
          ));
        
        const privateGoatedIds = new Map(privateUsers.map(u => [u.goatedId, u.id]));

        Object.values(transformedData.data).forEach(timeframe => {
          timeframe.data.forEach(user => {
            if (user.uid && privateGoatedIds.has(user.uid)) {
              const localId = privateGoatedIds.get(user.uid);
              user.name = `User ${String(localId).slice(-4)}`; // Censor name
            }
          });
        });
      }
      
      return transformedData;
    } catch (error) {
      console.error("StatSyncService: Error in getLeaderboardData:", error);
      
      // Log transformation error
      await this.logTransformation('leaderboard', 'error', 
        `Failed to transform leaderboard data: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      throw error;
    }
  }
  
  /**
   * Get aggregated statistics from leaderboard data
   * Used for analytics and admin dashboards
   */
  async getAggregatedStats(): Promise<StatsAggregation> {
    const startTime = Date.now();
    console.log("StatSyncService: Calculating aggregated statistics");
    
    try {
      const leaderboardData = await this.getLeaderboardData();
      
      // Process all entries to get totals
      const allUsers = [
        ...(leaderboardData.data?.today?.data || []),
        ...(leaderboardData.data?.weekly?.data || []),
        ...(leaderboardData.data?.monthly?.data || []),
        ...(leaderboardData.data?.all_time?.data || [])
      ];
      
      // Deduplicate users by UID
      const uniqueUsers = Array.from(new Set(allUsers.map(user => user.uid)))
        .map(uid => allUsers.find(user => user.uid === uid))
        .filter(Boolean) as LeaderboardEntry[];
      
      // Calculate aggregations
      const totals = uniqueUsers.reduce((acc, entry) => {
        acc.dailyTotal += entry.wagered?.today || 0;
        acc.weeklyTotal += entry.wagered?.this_week || 0;
        acc.monthlyTotal += entry.wagered?.this_month || 0;
        acc.allTimeTotal += entry.wagered?.all_time || 0;
        return acc;
      }, {
        dailyTotal: 0,
        weeklyTotal: 0,
        monthlyTotal: 0,
        allTimeTotal: 0
      });
      
      // Calculate additional metrics
      const userCount = uniqueUsers.length;
      const averageWager = userCount > 0 ? totals.allTimeTotal / userCount : 0;
      const topWager = Math.max(...uniqueUsers.map(u => u.wagered.all_time || 0));
      
      const stats: StatsAggregation = {
        ...totals,
        userCount,
        averageWager,
        topWager
      };
      
      await this.logTransformation('stats-aggregation', 'success', 
        `Calculated stats for ${userCount} users`, Date.now() - startTime);
      
      return stats;
    } catch (error) {
      await this.logTransformation('stats-aggregation', 'error', 
        `Failed to calculate aggregated stats: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      throw error;
    }
  }
  
  /**
   * Get top performers for each time period
   * Used for MVP cards and featured player displays
   */
  async getTopPerformers(limit: number = 3): Promise<{
    daily: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
  }> {
    const startTime = Date.now();
    console.log(`StatSyncService: Getting top ${limit} performers for each period`);
    
    try {
      const leaderboardData = await this.getLeaderboardData();
      
      const topPerformers = {
        daily: leaderboardData.data.today.data.slice(0, limit),
        weekly: leaderboardData.data.weekly.data.slice(0, limit),
        monthly: leaderboardData.data.monthly.data.slice(0, limit),
        allTime: leaderboardData.data.all_time.data.slice(0, limit)
      };
      
      await this.logTransformation('top-performers', 'success', 
        `Retrieved top ${limit} performers for all periods`, Date.now() - startTime);
      
      return topPerformers;
    } catch (error) {
      await this.logTransformation('top-performers', 'error', 
        `Failed to get top performers: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      throw error;
    }
  }
  
  /**
   * Get user ranking across all time periods
   * Used for user profile statistics
   */
  async getUserRankings(userId: string): Promise<{
    daily: number | null;
    weekly: number | null;
    monthly: number | null;
    allTime: number | null;
  }> {
    const startTime = Date.now();
    console.log(`StatSyncService: Getting rankings for user ${userId}`);
    
    try {
      const leaderboardData = await this.getLeaderboardData();
      
      const rankings = {
        daily: this.findUserPosition(leaderboardData.data.today.data, userId),
        weekly: this.findUserPosition(leaderboardData.data.weekly.data, userId),
        monthly: this.findUserPosition(leaderboardData.data.monthly.data, userId),
        allTime: this.findUserPosition(leaderboardData.data.all_time.data, userId)
      };
      
      await this.logTransformation('user-rankings', 'success', 
        `Retrieved rankings for user ${userId}`, Date.now() - startTime);
      
      return rankings;
    } catch (error) {
      await this.logTransformation('user-rankings', 'error', 
        `Failed to get user rankings: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      throw error;
    }
  }
  
  /**
   * Store affiliate statistics snapshot
   * Used for historical tracking and analytics
   */
  async storeAffiliateSnapshot(): Promise<void> {
    const startTime = Date.now();
    console.log("StatSyncService: Storing affiliate statistics snapshot");
    
    try {
      const stats = await this.getAggregatedStats();
      
      // Store snapshot in database
      await db.insert(affiliateStats).values({
        totalWager: String(stats.allTimeTotal),
        commission: String(stats.allTimeTotal * 0.02), // 2% commission example
        timestamp: new Date()
      });
      
      await this.logTransformation('affiliate-snapshot', 'success', 
        `Stored affiliate snapshot with ${stats.userCount} users`, Date.now() - startTime);
    } catch (error) {
      await this.logTransformation('affiliate-snapshot', 'error', 
        `Failed to store affiliate snapshot: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      throw error;
    }
  }
  
  // Private helper methods
  
  /**
   * Transforms raw API data into standardized leaderboard format
   * Core transformation function for all external data
   */
  private transformToLeaderboard(rawData: any): LeaderboardData {
    console.log("StatSyncService: Transforming raw API data to leaderboard format");
    
    try {
      // Extract data from the API response
      const dataArray = this.extractDataArray(rawData);
      console.log(`StatSyncService: Extracted ${dataArray.length} users from raw data`);
      
      if (!Array.isArray(dataArray)) {
        throw new Error('extractDataArray did not return an array');
      }
      
      // Transform each entry to standard format
      const transformedData = dataArray
        .filter(entry => entry && typeof entry === 'object') // Filter out invalid entries
        .map((entry) => ({
          uid: entry.uid || "",
          name: entry.name || "",
          wagered: {
            today: entry.wagered?.today || 0,
            this_week: entry.wagered?.this_week || 0,
            this_month: entry.wagered?.this_month || 0,
            all_time: entry.wagered?.all_time || 0,
          },
        }))
        .filter(entry => entry.uid && entry.name); // Only keep entries with valid uid and name
      
      console.log(`StatSyncService: Filtered to ${transformedData.length} valid users`);
      
      // Return data structured by time periods with proper sorting
      const leaderboardData: LeaderboardData = {
        status: "success",
        metadata: {
          totalUsers: transformedData.length,
          lastUpdated: new Date().toISOString(),
        },
        data: {
          today: { data: this.sortByWagered(transformedData, "today") },
          weekly: { data: this.sortByWagered(transformedData, "this_week") },
          monthly: { data: this.sortByWagered(transformedData, "this_month") },
          all_time: { data: this.sortByWagered(transformedData, "all_time") },
        },
      };
      
      console.log("StatSyncService: Leaderboard data structure created successfully");
      return leaderboardData;
    } catch (error) {
      console.error("StatSyncService: Error in transformToLeaderboard:", error);
      
      // Return a safe fallback structure
      return {
        status: "error",
        metadata: {
          totalUsers: 0,
          lastUpdated: new Date().toISOString(),
        },
        data: {
          today: { data: [] },
          weekly: { data: [] },
          monthly: { data: [] },
          all_time: { data: [] },
        },
      };
    }
  }
  
  /**
   * Sorts data by wagered amount for the given period
   * Creates sorted leaderboards for each time period
   * Handles ties: same wager = same position, next position skips accordingly
   */
  private sortByWagered(data: LeaderboardEntry[], period: string): LeaderboardEntry[] {
    // Sort descending by wagered amount
    const sorted = [...data].sort((a, b) => {
      const aValue = a.wagered[period as keyof typeof a.wagered] || 0;
      const bValue = b.wagered[period as keyof typeof b.wagered] || 0;
      return bValue - aValue;
    });
    // Assign positions with tie handling
    let lastWager: number | null = null;
    let lastPosition = 0;
    let skip = 1;
    return sorted.map((entry, idx) => {
      const wager = entry.wagered[period as keyof typeof entry.wagered] || 0;
      if (wager === lastWager) {
        skip++;
        return { ...entry, rank: lastPosition };
      } else {
        lastPosition = idx + 1;
        lastWager = wager;
        skip = 1;
        return { ...entry, rank: lastPosition };
      }
    });
  }
  
  /**
   * Generate a map of userId to position for a given leaderboard (for previous position tracking)
   */
  public getUserPositionMap(leaderboardData: LeaderboardEntry[], period: string): Record<string, number | null> {
    const sorted = this.sortByWagered(leaderboardData, period);
    const map: Record<string, number | null> = {};
    for (const entry of sorted) {
      map[entry.uid] = entry.rank ?? null;
    }
    return map;
  }
  
  /**
   * Extract data array from API response
   * Handles different API response formats
   */
  private extractDataArray(apiData: any): any[] {
    if (!apiData) {
      console.log("StatSyncService: No API data provided");
      return [];
    }
    
    // Check for direct data array
    if (Array.isArray(apiData)) {
      return apiData;
    }
    
    // Check for data.data structure
    if (apiData.data && Array.isArray(apiData.data)) {
      return apiData.data;
    }
    
    // Check for nested structure
    if (apiData.data && apiData.data.data && Array.isArray(apiData.data.data)) {
      return apiData.data.data;
    }
    
    // Try to process extracted JSON format
    return this.processExtractedJson(apiData);
  }
  
  /**
   * Process extracted JSON data with various formats
   * Handles complex nested API responses
   */
  private processExtractedJson(apiData: any): any[] {
    const extractedData: any[] = [];
    
    try {
      // Handle object with timeframe keys
      if (typeof apiData === 'object' && apiData !== null) {
        const timeframes = ['today', 'weekly', 'monthly', 'all_time'];
        
        for (const timeframe of timeframes) {
          if (apiData[timeframe]?.data && Array.isArray(apiData[timeframe].data)) {
            extractedData.push(...apiData[timeframe].data);
          }
        }
      }
      
      // If we found data in timeframe structure, deduplicate by UID
      if (extractedData.length > 0) {
        const uniqueData = Array.from(
          new Map(extractedData.map(item => [item.uid, item])).values()
        );
        console.log(`StatSyncService: Processed ${uniqueData.length} unique users from timeframe data`);
        return uniqueData;
      }
      
      // Fallback: try direct processing
      if (apiData.data) {
        return Array.isArray(apiData.data) ? apiData.data : [apiData.data];
      }
      
    } catch (error) {
      console.error("StatSyncService: Error processing extracted JSON:", error);
    }
    
    console.log("StatSyncService: No valid data found in API response");
    return [];
  }
  
  /**
   * Find user position in leaderboard data
   */
  private findUserPosition(leaderboardData: LeaderboardEntry[], userId: string): number | null {
    const userIndex = leaderboardData.findIndex(user => user.uid === userId);
    return userIndex !== -1 ? userIndex + 1 : null;
  }
  
  /**
   * Log transformation operations
   */
  private async logTransformation(
    type: string, 
    status: 'success' | 'error' | 'warning' | 'info', 
    message: string, 
    durationMs: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await db.insert(transformationLogs).values({
        type: status,
        message: `[stat-${type}] ${message}`,
        duration_ms: String(durationMs),
        created_at: new Date(),
        resolved: status !== 'error',
        error_message: errorMessage
      });
    } catch (error) {
      console.error("StatSyncService: Failed to log transformation:", error);
    }
  }
}

// Export singleton instance
export const statSyncService = new StatSyncService();

// Default export for consistency
export default statSyncService;
