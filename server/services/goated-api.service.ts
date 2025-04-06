import fetch from 'node-fetch';
import { UserService } from './user.service';

/**
 * GoatedApiService
 * Handles all interactions with the Goated.com external API
 */
export class GoatedApiService {
  private apiBaseUrl: string;
  private apiToken: string;
  
  constructor() {
    this.apiBaseUrl = 'https://api.goated.com';
    this.apiToken = process.env.API_TOKEN || '';
  }
  
  /**
   * Find a user in the Goated API by their Goated ID
   * @param goatedId - Goated ID to search for
   * @returns User data if found, null otherwise
   */
  async findUserByGoatedId(goatedId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/${goatedId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // User not found is a valid case
          return null;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error finding user in Goated API:", error);
      return null;
    }
  }
  
  /**
   * Get the leaderboard data from the Goated API
   * @returns Leaderboard data if successful, empty array otherwise
   */
  async getLeaderboard(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching leaderboard from Goated API:", error);
      return [];
    }
  }
  
  /**
   * Sync user profiles from the Goated API leaderboard
   * @param userService - UserService instance for interacting with local database
   * @returns Statistics about the sync operation
   */
  async syncUserProfiles(userService: UserService): Promise<{ created: number, updated: number, existing: number }> {
    try {
      const leaderboardData = await this.getLeaderboard();
      console.log(`Processing ${leaderboardData.length} users from leaderboard`);
      
      let created = 0, updated = 0, existing = 0;
      
      // This is a placeholder implementation
      // In a real implementation, you would:
      // 1. Loop through leaderboard data
      // 2. Check if each user exists in the database
      // 3. Create or update users as needed
      
      return { created, updated, existing };
    } catch (error) {
      console.error("Error syncing user profiles:", error);
      throw error;
    }
  }
}