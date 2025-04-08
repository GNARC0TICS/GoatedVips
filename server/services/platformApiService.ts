/**
 * PlatformApiService
 * 
 * This service is responsible for all internal API operations, including data transformation,
 * database operations, and serving our internal endpoints. It uses GoatedApiService to
 * fetch external data but handles all business logic and data processing.
 * 
 * Key features:
 * - Transforms raw API data into structured formats for different views
 * - Manages database synchronization
 * - Provides methods for all our internal endpoints
 * - Handles business logic for the platform
 * 
 * All platform-specific data handling should go through this service rather than
 * directly accessing the external API or database.
 */

import { db } from "@db";
import goatedApiService from "./goatedApiService";
import { 
  affiliateStats, 
  wagerRaces, 
  wagerRaceParticipants, 
  transformationLogs, 
  users 
} from "@db/schema";
import { eq, sql } from "drizzle-orm";

// Type definitions for our data structures
// These define the standard format for data throughout the platform

/**
 * LeaderboardEntry represents a single user in the leaderboard
 */
export interface LeaderboardEntry {
  uid: string;
  name: string;
  wagered: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
}

/**
 * LeaderboardData represents the complete structured leaderboard data
 * This is the primary data structure returned by our /api/affiliate/stats endpoint
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
 * RaceData represents the wager race information
 * This is the data structure returned by our /api/wager-races/current endpoint
 */
export interface RaceData {
  id: string;
  status: "live" | "ended" | "upcoming";
  startDate: string;
  endDate: string;
  prizePool: number;
  participants: {
    uid: string;
    name: string;
    wagered: number;
    position: number;
  }[];
  totalWagered: number;
  participantCount: number;
  metadata: {
    transitionEnds: string;
    nextRaceStarts: string;
    prizeDistribution: number[];
  };
}

/**
 * RacePositionData represents a user's position in the current race
 * This is the data structure returned by our /api/wager-race/position endpoint
 */
export interface RacePositionData {
  position: number | null;
  totalParticipants: number;
  wagerAmount: number;
  previousPosition: number | null;
  raceType: string;
  raceTitle: string;
  endDate: string;
}

/**
 * SyncStats provides information about synchronization operations
 */
export interface SyncStats {
  created: number;
  updated: number;
  existing: number;
  totalProcessed: number;
  duration: number;
}

/**
 * Internal API Service
 * Handles all data transformation, database operations, and business logic
 */
export class PlatformApiService {
  /**
   * Get leaderboard data for all timeframes
   * Used by the /api/affiliate/stats endpoint
   * 
   * @returns Formatted leaderboard data
   */
  async getLeaderboardData(): Promise<LeaderboardData> {
    const startTime = Date.now();
    console.log("Fetching and transforming leaderboard data");
    
    try {
      // Fetch raw data from external API
      const rawData = await goatedApiService.fetchReferralData();
      
      // Transform the data
      const transformedData = this.transformToLeaderboard(rawData);
      
      // Track successful transformation
      await this.logTransformation('leaderboard', 'success', 
        `Transformed leaderboard data with ${transformedData.data.all_time.data.length} users`, 
        Date.now() - startTime);
      
      return transformedData;
    } catch (error) {
      // Log transformation error
      await this.logTransformation('leaderboard', 'error', 
        `Failed to transform leaderboard data: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      // Rethrow for proper error handling in routes
      throw error;
    }
  }
  
  /**
   * Get current wager race data
   * Used by the /api/wager-races/current endpoint
   * 
   * @returns Current wager race data
   */
  async getCurrentWagerRace(): Promise<RaceData> {
    const startTime = Date.now();
    console.log("Fetching and transforming wager race data");
    
    try {
      // Get leaderboard data
      const leaderboardData = await this.getLeaderboardData();
      
      // Transform to wager race format
      const raceData = this.transformToWagerRace(leaderboardData);
      
      // Log the transformation
      await this.logTransformation('wager-race', 'success', 
        `Transformed wager race data with ${raceData.participants.length} participants`, 
        Date.now() - startTime);
      
      return raceData;
    } catch (error) {
      // Log transformation error
      await this.logTransformation('wager-race', 'error', 
        `Failed to transform wager race data: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      // Rethrow for proper error handling in routes
      throw error;
    }
  }
  
  /**
   * Get user's position in the current race
   * Used by the /api/wager-race/position endpoint
   * 
   * @param uid User ID to check position for
   * @returns User's position data
   */
  async getUserRacePosition(uid: string): Promise<RacePositionData> {
    console.log(`Getting race position for user ${uid}`);
    
    try {
      // Get the leaderboard data 
      const data = await this.getLeaderboardData();
      
      // Find user in monthly data
      const monthlyData = data.data.monthly.data;
      const userIndex = monthlyData.findIndex(user => user.uid === uid);
      
      if (userIndex === -1) {
        console.log(`User ${uid} not found in monthly data`);
        return {
          position: null,
          totalParticipants: monthlyData.length,
          wagerAmount: 0,
          previousPosition: null,
          raceType: 'monthly',
          raceTitle: `${new Date().toLocaleString('default', { month: 'long' })} Wager Race`,
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
        };
      }
      
      // Get user data
      const userData = monthlyData[userIndex];
      
      // We don't need to fetch previous position from database as it's not required
      
      return {
        position: userIndex + 1,
        totalParticipants: monthlyData.length,
        wagerAmount: userData.wagered.this_month,
        previousPosition: null, // Not tracking previous positions for now
        raceType: 'monthly',
        raceTitle: `${new Date().toLocaleString('default', { month: 'long' })} Wager Race`,
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
      };
    } catch (error) {
      console.error(`Error getting race position for user ${uid}:`, error);
      throw error;
    }
  }
  
  /**
   * Sync user profiles from external API to our database
   * Used by scheduled job and manual sync endpoint
   * 
   * @returns Statistics about the sync operation
   */
  async syncUserProfiles(): Promise<SyncStats> {
    const startTime = Date.now();
    console.log("Starting user profile synchronization");
    
    try {
      // Fetch raw data from external API
      const rawData = await goatedApiService.fetchReferralData();
      
      // Transform to our format
      const leaderboardData = this.transformToLeaderboard(rawData);
      
      // Extract all-time data for users
      const allTimeData = leaderboardData.data.all_time.data || [];
      console.log(`Processing ${allTimeData.length} users from leaderboard`);
      
      // Stats tracking
      let created = 0;
      let updated = 0;
      let existing = 0;
      
      // Process each user 
      for (const user of allTimeData) {
        try {
          if (!user.uid || !user.name) continue;
          
          // Update affiliate stats
          try {
            await db.insert(affiliateStats).values({
              totalWager: String(user.wagered.all_time),
              commission: String(user.wagered.all_time / 100), // 1% commission as an example
              timestamp: new Date()
            });
            created++;
          } catch (err) {
            // Likely already exists, just log and continue
            console.log(`Could not create affiliate stats for ${user.name}: ${err}`);
          }
          
          // Update user if they exist in our system
          const existingUser = await db.query.users.findFirst({
            where: eq(users.goatedId, user.uid)
          });
          
          if (existingUser) {
            await db.update(users)
              .set({
                goatedUsername: user.name,
                totalWager: String(user.wagered.all_time),
                lastActive: new Date()
              })
              .where(eq(users.id, existingUser.id));
            existing++;
          }
        } catch (error) {
          console.error(`Error processing user ${user.name}:`, error);
        }
      }
      
      // Record sync statistics
      const duration = Date.now() - startTime;
      
      // Log the successful synchronization
      await this.logTransformation('user-sync', 'success', 
        `Synchronized ${allTimeData.length} users. Created: ${created}, Updated: ${updated}, Existing: ${existing}`, 
        duration);
      
      console.log(`Sync completed in ${duration}ms. Created: ${created}, Updated: ${updated}, Existing: ${existing}`);
      
      return { 
        created, 
        updated, 
        existing, 
        totalProcessed: allTimeData.length, 
        duration 
      };
    } catch (error) {
      // Log the failed synchronization
      await this.logTransformation('user-sync', 'error', 
        `Failed to synchronize users: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      console.error("Error in syncUserProfiles:", error);
      throw error;
    }
  }

  /**
   * Transforms raw API data into our standardized leaderboard format
   * This is the core transformation function that converts external data
   * to our internal format
   * 
   * @param rawData Raw data from the external API
   * @returns Formatted leaderboard data
   */
  private transformToLeaderboard(rawData: any): LeaderboardData {
    console.log("Transforming raw API data to leaderboard format");
    
    // Extract data from the API response
    const dataArray = this.extractDataArray(rawData);
    console.log(`Extracted ${dataArray.length} users from raw data`);
    
    // Transform each entry to standard format
    const transformedData = dataArray.map((entry) => ({
      uid: entry.uid || "",
      name: entry.name || "",
      wagered: {
        today: entry.wagered?.today || 0,
        this_week: entry.wagered?.this_week || 0,
        this_month: entry.wagered?.this_month || 0,
        all_time: entry.wagered?.all_time || 0,
      },
    }));
    
    // Return the data structured by time periods with proper sorting
    return {
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
  }

  /**
   * Transforms leaderboard data into wager race format
   * Creates a structured representation of the current month's wager race
   * 
   * @param leaderboardData Formatted leaderboard data
   * @returns Wager race data
   */
  private transformToWagerRace(leaderboardData: LeaderboardData): RaceData {
    console.log("Transforming leaderboard data to wager race format");
    
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const raceId = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Get monthly data and calculate total wagered
    const monthlyData = leaderboardData.data.monthly.data;
    const totalWagered = monthlyData.reduce((sum, p) => sum + p.wagered.this_month, 0);
    
    // Create race data structure
    return {
      id: raceId,
      status: 'live',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      endDate: endOfMonth.toISOString(),
      prizePool: 500, // Standard prize pool
      participants: monthlyData
        // Map each participant to the race format
        .map((participant, index) => ({
          uid: participant.uid,
          name: participant.name,
          wagered: participant.wagered.this_month,
          position: index + 1
        }))
        // Take only top 10 for participants list
        .slice(0, 10),
      totalWagered,
      participantCount: monthlyData.length,
      metadata: {
        transitionEnds: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        nextRaceStarts: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        prizeDistribution: [0.5, 0.3, 0.1, 0.05, 0.05]
      }
    };
  }

  /**
   * Sorts data by wagered amount for the given period
   * Creates sorted leaderboards for each time period
   * 
   * @param data Array of leaderboard entries
   * @param period Period to sort by (today, this_week, etc)
   * @returns Sorted array of leaderboard entries
   */
  private sortByWagered(data: LeaderboardEntry[], period: string): LeaderboardEntry[] {
    return [...data].sort((a, b) => {
      const aValue = a.wagered[period as keyof typeof a.wagered] || 0;
      const bValue = b.wagered[period as keyof typeof b.wagered] || 0;
      return bValue - aValue;
    });
  }

  /**
   * Extracts data array from API response
   * Handles various possible response formats from the API
   * 
   * @param apiData Raw API response
   * @returns Array of user data
   */
  private extractDataArray(apiData: any): any[] {
    // Handle various response formats
    
    // 1. If the response is directly an array
    if (Array.isArray(apiData)) {
      console.log("API response is a direct array");
      return apiData;
    }
    
    // 2. If the response has a data array
    if (apiData.data && Array.isArray(apiData.data)) {
      console.log("API response has a data array");
      return apiData.data;
    }
    
    // 3. If the response has a results array
    if (apiData.results && Array.isArray(apiData.results)) {
      console.log("API response has a results array");
      return apiData.results;
    }
    
    // 4. If the response has structured time period data
    if (apiData.data?.today?.data && Array.isArray(apiData.data.today.data)) {
      console.log("API response has structured time period data");
      
      // Combine data from all periods, prioritizing all_time
      const combinedData = new Map();
      
      // Process data from different time periods
      for (const period of ['all_time', 'monthly', 'weekly', 'today']) {
        const periodData = apiData.data[period]?.data || [];
        
        for (const user of periodData) {
          if (user.uid && !combinedData.has(user.uid)) {
            combinedData.set(user.uid, user);
          }
        }
      }
      
      return Array.from(combinedData.values());
    }
    
    // 5. Try to extract any array we can find as a last resort
    console.log("Attempting to find any array in the API response");
    const possibleArrays = Object.values(apiData || {})
      .filter((value: any) => Array.isArray(value));
      
    if (possibleArrays.length > 0) {
      // Use the largest array found
      const largestArray = possibleArrays.reduce((a: any, b: any) => 
        a.length > b.length ? a : b, []);
      console.log(`Found array with ${largestArray.length} elements`);
      return largestArray;
    }
    
    // If nothing works, log the error and return empty array
    console.error("Could not extract data array from API response", 
      typeof apiData === 'object' ? Object.keys(apiData || {}) : typeof apiData);
    return [];
  }

  /**
   * Logs a transformation operation
   * Records information about data transformations for monitoring and debugging
   * 
   * @param type Type of transformation
   * @param status Success or error
   * @param message Description of the transformation
   * @param durationMs Duration in milliseconds
   * @param errorMessage Optional error message
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
        message: `[${type}] ${message}`,
        duration_ms: String(durationMs),
        created_at: new Date(),
        resolved: status !== 'error',
        error_message: errorMessage
      });
    } catch (error) {
      // Just log the error but don't throw - this is a non-critical operation
      console.error("Failed to log transformation:", error);
    }
  }
}

// Export singleton instance for use in routes
export const platformApiService = new PlatformApiService();

// Default export for consistency with goatedApiService
export default platformApiService;