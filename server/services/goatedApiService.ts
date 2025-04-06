
/**
 * GoatedApiService
 * 
 * This service is responsible for interacting with the external Goated API
 * to fetch data and populate our database. It does NOT handle user searches
 * or other operations that should use our local database.
 */

import { db } from '../../db';
import { users, mockWagerData } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { API_CONFIG } from '../config/api';

// Define the shape of data from the external API
export interface GoatedUser {
  id: string;
  name: string;
  avatar?: string;
  wager?: {
    all_time: number;
    monthly: number;
    weekly: number;
    daily: number;
  };
  [key: string]: any;
}

class GoatedApiService {
  private apiToken: string;
  private baseUrl: string;
  
  constructor() {
    // Use the newer token that appears to be working
    this.apiToken = process.env.API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJUWlNlWlJVWkFZbzEiLCJpYXQiOjE3NDM5MTM3NzYsImV4cCI6MTc0NDAwMDE3Nn0.8JHA2VNfP1FyS4HXIONlKBuDNjS98o8Waxnl6WOXCus";
    this.baseUrl = API_CONFIG.baseUrl;
  }
  
  /**
   * Check if the API token is configured
   */
  hasApiToken(): boolean {
    return !!this.apiToken;
  }
  
  /**
   * Fetch data from the external API
   * 
   * @param endpoint - API endpoint to call
   * @param options - Additional fetch options
   * @returns Response from the API
   */
  async fetchFromExternalApi(endpoint: string, options: RequestInit = {}, retries = 3): Promise<any> {
    if (!this.hasApiToken()) {
      throw new Error('API token not configured');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Fetching data from external API: ${url}`);
    
    try {
      const controller = new AbortController();
      // Increase the timeout to 30 seconds (30000ms) to prevent AbortErrors
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from external API (${endpoint}):`, error);
      
      // Implement retry logic for network errors or timeouts
      const err = error as any; // Type assertion to handle unknown error type
      if (retries > 0 && (error instanceof TypeError || (err && err.name === 'AbortError'))) {
        console.log(`Retrying API call to ${endpoint}, ${retries} attempts remaining...`);
        // Exponential backoff: wait longer between retries
        await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
        return this.fetchFromExternalApi(endpoint, options, retries - 1);
      }
      
      throw error;
    }
  }
  
  /**
   * Sync user profiles from the leaderboard data
   * Fetches data from external API and stores in our database
   */
  async syncUserProfiles(): Promise<{ created: number; updated: number; existing: number }> {
    try {
      if (!this.hasApiToken()) {
        console.warn("API token not configured, skipping profile sync");
        return { created: 0, updated: 0, existing: 0 };
      }
      
      console.log("Syncing user profiles from external leaderboard API...");
      
      // Declare variables at the function level for proper scope
      let allTimeData: any[] = [];
      let created = 0;
      let existing = 0;
      let updated = 0;
      
      try {
        // Fetch leaderboard data directly from the base URL (no endpoint needed)
        const leaderboardData = await this.fetchFromExternalApi("");
        
        // Process all_time data to get unique users
        allTimeData = leaderboardData?.data?.all_time?.data || [];
        
        console.log(`Processing ${allTimeData.length} users from leaderboard`);
      } catch (apiError) {
        console.error("Error fetching leaderboard data:", apiError);
        console.log("Using fallback empty data structure to prevent application crash");
        // Return zeros but don't crash the application
        return { created: 0, updated: 0, existing: 0 };
      }
      
      // Process each user from the leaderboard
      for (const player of allTimeData) {
        try {
          // Skip entries without uid or name
          if (!player.uid || !player.name) continue;
          
          // Check if user already exists by goatedId
          const existingUser = await db.select().from(users)
            .where(eq(users.goatedId, player.uid))
            .limit(1);
          
          if (existingUser && existingUser.length > 0) {
            // Update existing user with latest data
            await db.execute(sql`
              UPDATE users 
              SET goated_username = ${player.name},
                  goated_account_linked = true,
                  last_active = ${new Date()}
              WHERE goated_id = ${player.uid}
            `);
            
            // Store wager data if available
            if (player.wager_amount) {
              // Check if we have existing wager data
              const existingWagerData = await db.query.mockWagerData.findFirst({
                where: eq(mockWagerData.userId, existingUser[0].id),
              });
              
              if (existingWagerData) {
                await db.execute(sql`
                  UPDATE mock_wager_data
                  SET wagered_all_time = ${player.wager_amount},
                      last_updated = ${new Date()}
                  WHERE user_id = ${existingUser[0].id}
                `);
              } else {
                // Create new wager data entry
                await db.execute(sql`
                  INSERT INTO mock_wager_data (
                    user_id, wagered_all_time, wagered_this_month, 
                    wagered_this_week, wagered_today, last_updated
                  ) VALUES (
                    ${existingUser[0].id}, ${player.wager_amount}, 
                    ${player.wager_amount_monthly || 0}, 
                    ${player.wager_amount_weekly || 0}, 
                    ${player.wager_amount_daily || 0},
                    ${new Date()}
                  )
                `);
              }
            }
            
            updated++;
            continue;
          }
          
          // Create a new permanent profile for this Goated user
          const newUserId = Math.floor(1000 + Math.random() * 9000);
          const email = `${player.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
          
          await db.execute(sql`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, goated_id, goated_username, goated_account_linked
            ) VALUES (
              ${newUserId}, ${player.name}, ${email}, '', ${new Date()}, '#D7FF00', 
              'Official Goated.com player profile', false, ${player.uid}, ${player.name}, true
            )
          `);
          
          // If wager data is available, store it
          if (player.wager_amount) {
            await db.execute(sql`
              INSERT INTO mock_wager_data (
                user_id, wagered_all_time, wagered_this_month, 
                wagered_this_week, wagered_today, last_updated
              ) VALUES (
                ${newUserId}, ${player.wager_amount}, 
                ${player.wager_amount_monthly || 0}, 
                ${player.wager_amount_weekly || 0}, 
                ${player.wager_amount_daily || 0},
                ${new Date()}
              )
            `);
          }
          
          created++;
        } catch (error) {
          console.error(`Error creating/updating profile for ${player?.name}:`, error);
        }
      }
      
      console.log(`Profile sync completed. Created ${created} new profiles, updated ${updated}, ${existing} already existed.`);
      return { created, updated, existing };
    } catch (error) {
      console.error("Error syncing profiles from leaderboard:", error);
      return { created: 0, updated: 0, existing: 0 };
    }
  }
  
  /**
   * Update wager data for all users from the external API
   */
  async updateAllWagerData(): Promise<number> {
    try {
      if (!this.hasApiToken()) {
        console.warn("API token not configured, skipping wager data update");
        return 0;
      }
      
      console.log("Updating wager data from external API...");
      
      // Fetch leaderboard data directly from the base URL (no endpoint needed)
      const leaderboardData = await this.fetchFromExternalApi("");
      
      const userData = [
        ...(leaderboardData?.data?.all_time?.data || []),
        ...(leaderboardData?.data?.monthly?.data || []),
        ...(leaderboardData?.data?.weekly?.data || []),
        ...(leaderboardData?.data?.today?.data || [])
      ];
      
      // Create a map to deduplicate users
      const userMap = new Map();
      userData.forEach(user => {
        if (user.uid && user.name) {
          userMap.set(user.uid, user);
        }
      });
      
      let updatedCount = 0;
      
      // Update each user's wager data
      for (const [goatedId, player] of userMap.entries()) {
        try {
          // Find the user in our database
          const existingUser = await db.select().from(users)
            .where(eq(users.goatedId, goatedId))
            .limit(1);
          
          if (existingUser && existingUser.length > 0) {
            // Update wager data
            if (player.wager_amount !== undefined) {
              await db.execute(sql`
                UPDATE users
                SET total_wager = ${player.wager_amount}
                WHERE goated_id = ${goatedId}
              `);
              
              updatedCount++;
            }
          }
        } catch (error) {
          console.error(`Error updating wager data for ${goatedId}:`, error);
        }
      }
      
      console.log(`Updated wager data for ${updatedCount} users`);
      return updatedCount;
    } catch (error) {
      console.error("Error updating all wager data:", error);
      return 0;
    }
  }
}

// Export a singleton instance
const goatedApiService = new GoatedApiService();
export default goatedApiService;
