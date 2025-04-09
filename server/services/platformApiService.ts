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
  
  /* 
   * NOTE: The syncUserProfiles method has been moved to line 543
   * to resolve duplication issues.
   */

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
   * Handles various possible response formats from the API including raw text
   * 
   * @param apiData Raw API response
   * @returns Array of user data
   */
  private extractDataArray(apiData: any): any[] {
    console.log("Extracting data array from API response");
    
    // Special handling for raw text responses
    if (apiData && apiData.rawText && apiData.parseError) {
      // This is a raw text response that couldn't be parsed as JSON
      console.log("Processing raw text response");
      
      try {
        // Try to extract data from HTML or text content
        // Look for JSON-like content in the response
        const rawText = apiData.rawText;
        
        // Look for JSON data between curly braces
        const jsonMatch = rawText.match(/\{.*\}/s);
        if (jsonMatch) {
          try {
            const extractedJson = JSON.parse(jsonMatch[0]);
            console.log("Successfully extracted JSON from raw text");
            // Now process the extracted JSON normally
            return this.processExtractedJson(extractedJson);
          } catch (err) {
            console.error("Failed to parse extracted JSON", err);
          }
        }
        
        // Try to find arrays in square brackets
        const arrayMatch = rawText.match(/\[.*\]/s);
        if (arrayMatch) {
          try {
            const extractedArray = JSON.parse(arrayMatch[0]);
            if (Array.isArray(extractedArray) && extractedArray.length > 0) {
              console.log(`Found array with ${extractedArray.length} items in raw text`);
              return extractedArray;
            }
          } catch (err) {
            console.error("Failed to parse extracted array", err);
          }
        }
        
        // If we couldn't extract proper JSON, log the raw text for inspection
        console.warn("Could not extract proper data from raw text. First 200 chars:", 
          rawText.substring(0, 200));
        return [];
      } catch (error) {
        console.error("Error processing raw text response:", error);
        return [];
      }
    }
    
    // Normal JSON processing for properly formatted responses
    return this.processExtractedJson(apiData);
  }
  
  /**
   * Process extracted JSON data to find arrays of user data
   * 
   * @param apiData JSON data to process
   * @returns Array of user data
   */
  private processExtractedJson(apiData: any): any[] {
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
    
    // 6. If it's an object with properties that look like user data, convert to array
    if (typeof apiData === 'object' && apiData !== null) {
      const possibleUsers = Object.values(apiData).filter(
        (value: any) => typeof value === 'object' && value !== null && 
        (value.uid || value.name || value.wagered)
      );
      
      if (possibleUsers.length > 0) {
        console.log(`Found ${possibleUsers.length} possible user objects`);
        return possibleUsers;
      }
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
  
  /**
   * Synchronize profiles from external API
   * This method is used for compatibility with tasks that expect the syncUserProfiles name
   * 
   * @returns Result object with counts of created and updated profiles
   */
  async syncUserProfiles(): Promise<SyncStats> {
    console.log("PlatformApiService: syncUserProfiles called (enhanced method)");
    
    const startTime = Date.now();
    
    try {
      // Use the GoatedApiService to fetch raw data
      const rawData = await goatedApiService.fetchReferralData();
      
      // Track created and updated counts
      let created = 0;
      let updated = 0;
      
      // If no data is available, return early
      if (!rawData || !rawData.data) {
        await this.logTransformation(
          'profile-sync',
          'warning',
          'No data available from external API',
          Date.now() - startTime
        );
        return { created, updated, existing: 0, totalProcessed: 0, duration: Date.now() - startTime };
      }
      
      // Process and transform the data
      console.log("Processing profile data for sync");
      
      // Transform the data to our format first
      const leaderboardData = this.transformToLeaderboard(rawData);
      
      // Extract the all_time data
      const profiles = leaderboardData.data.all_time.data || [];
      
      // If no profiles found, log and return
      if (!profiles.length) {
        await this.logTransformation(
          'profile-sync',
          'warning',
          'No profiles found in API response',
          Date.now() - startTime
        );
        return { created, updated, existing: 0, totalProcessed: 0, duration: Date.now() - startTime };
      }
      
      console.log(`Found ${profiles.length} profiles to process`);
      
      // Loop through each profile and process it
      for (const profile of profiles) {
        try {
          // Extract required fields
          const { uid, name, wagered } = profile;
          
          // Skip invalid profiles
          if (!uid || !name) continue;
          
          // Check if this user already exists in our database
          const existingUser = await db.query.users.findFirst({
            where: eq(users.goatedId, uid)
          });
          
          if (existingUser) {
            // Update existing user
            await db.update(users)
              .set({
                goatedUsername: name,
                totalWager: String(wagered?.all_time || 0),
                // Update the last active timestamp
                lastActive: new Date()
              })
              .where(eq(users.goatedId, uid));
            
            updated++;
          } else {
            // Create new user profile - note we need to provide required fields
            await db.insert(users).values({
              username: name,
              password: '', // Required field but we'll set it empty for API-created users
              email: `${uid}@goated.placeholder`, // Required field with placeholder
              goatedId: uid,
              goatedUsername: name,
              goatedAccountLinked: true,
              totalWager: String(wagered?.all_time || 0),
              createdAt: new Date(),
              profileColor: '#D7FF00',
              bio: 'Goated.com player'
            });
            
            created++;
          }
        } catch (error) {
          console.error(`Error processing profile ${profile?.name}:`, error);
          // Continue processing other profiles even if one fails
        }
      }
      
      // Log the transformation after successful processing
      const duration = Date.now() - startTime;
      await this.logTransformation(
        'profile-sync',
        'success',
        `Synced ${created + updated} profiles (${created} created, ${updated} updated)`,
        duration
      );
      
      return { 
        created, 
        updated, 
        existing: 0, 
        totalProcessed: profiles.length, 
        duration 
      };
    } catch (error) {
      // Log the error
      const duration = Date.now() - startTime;
      await this.logTransformation(
        'profile-sync',
        'error',
        'Failed to sync profiles',
        duration,
        error instanceof Error ? error.message : String(error)
      );
      
      // Rethrow the error
      throw error;
    }
  }
  
  /**
   * Update wager data for all users
   * Fetches latest wager statistics from the API and updates our database
   */
  async updateWagerData(): Promise<number> {
    console.log("updateAllWagerData method called (placeholder)");
    
    const startTime = Date.now();
    
    try {
      // Fetch the latest data from the API
      const rawData = await goatedApiService.fetchReferralData();
      
      // If no data is available, return early
      if (!rawData || !rawData.data) {
        await this.logTransformation(
          'wager-data-update',
          'warning', 
          'No data available from external API',
          Date.now() - startTime
        );
        return 0;
      }
      
      // Process and transform the data
      const leaderboardData = this.transformToLeaderboard(rawData);
      
      // Extract the all_time data for processing
      const profiles = leaderboardData.data.all_time.data || [];
      
      // If no profiles found, log and return
      if (!profiles.length) {
        await this.logTransformation(
          'wager-data-update',
          'warning',
          'No profiles found in API response',
          Date.now() - startTime
        );
        return 0;
      }
      
      let updatedCount = 0;
      
      // Update each user's wager data
      for (const profile of profiles) {
        try {
          // Extract required fields
          const { uid, wagered } = profile;
          
          // Skip invalid profiles
          if (!uid || !wagered) continue;
          
          // Update the user's wager data in our database
          const result = await db.update(users)
            .set({
              totalWager: String(wagered.all_time || 0),
              // Only set fields that exist in the database schema
              lastActive: new Date() // Using lastActive as the update timestamp
            })
            .where(eq(users.goatedId, uid));
          
          if (result.rowCount > 0) {
            updatedCount++;
          }
        } catch (error) {
          console.error(`Error updating wager data for user ${profile.uid}:`, error);
          // Continue processing other profiles even if one fails
        }
      }
      
      // Log successful update
      await this.logTransformation(
        'wager-data-update',
        'success',
        `Updated wager data for ${updatedCount} users`,
        Date.now() - startTime
      );
      
      console.log(`[Initial wager data update completed for ${updatedCount} users]`, "info");
      return updatedCount;
    } catch (error) {
      // Log the error
      const duration = Date.now() - startTime;
      await this.logTransformation(
        'wager-data-update',
        'error',
        'Failed to update wager data',
        duration,
        error instanceof Error ? error.message : String(error)
      );
      
      // Rethrow the error
      throw error;
    }
  }

  /**
   * The core profile management functionality of the service
   */
}

// Export singleton instance for use in routes
export const platformApiService = new PlatformApiService();

// Default export for consistency with goatedApiService
export default platformApiService;