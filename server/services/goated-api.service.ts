/**
 * Goated API Service
 * 
 * This service handles all interactions with the external Goated.com API.
 * It provides methods for fetching user data, wager information, and other
 * Goated.com-specific functionality.
 */

import { API_CONFIG } from '../config/api';

// Define the shape of a Goated API User
export interface GoatedApiUser {
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

export class GoatedApiService {
  private apiToken: string;
  private baseUrl: string;
  
  constructor() {
    this.apiToken = process.env.API_TOKEN || API_CONFIG.token;
    this.baseUrl = API_CONFIG.baseUrl;
  }
  
  /**
   * Check if the API token is configured
   */
  hasApiToken(): boolean {
    return !!this.apiToken;
  }
  
  /**
   * Log API token status for debugging
   */
  logApiTokenStatus(): void {
    console.log('[express] API Token status:', {
      Environment: !!process.env.API_TOKEN,
      Config: !!API_CONFIG.token
    });
  }
  
  /**
   * Make an authenticated request to the Goated API
   * 
   * @param endpoint - API endpoint to call
   * @param options - Additional fetch options
   * @returns Response from the API
   */
  async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.hasApiToken()) {
      throw new Error('API token not configured');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[${url}] Fetching from:`)
    
    this.logApiTokenStatus();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.request.timeout || 10000),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  }
  
  /**
   * Find a user by their Goated ID
   * 
   * @param goatedId - Goated user ID to search for
   * @returns User data if found, null otherwise
   */
  async findUserByGoatedId(goatedId: string): Promise<GoatedApiUser | null> {
    try {
      // This would be replaced with actual API endpoint
      const userData = await this.makeApiRequest(`${API_CONFIG.endpoints.users}/${goatedId}`);
      
      if (!userData || !userData.success) {
        return null;
      }
      
      // Transform API response to our interface format
      return {
        id: userData.data.uid || goatedId,
        name: userData.data.name,
        avatar: userData.data.avatar_url,
        // Additional fields would be mapped here
      };
    } catch (error) {
      console.error(`Error finding user by Goated ID ${goatedId}:`, error);
      return null;
    }
  }
  
  /**
   * Get wager data for a Goated user
   * 
   * @param goatedId - Goated user ID
   * @returns Wager data if available, null otherwise
   */
  async getUserWagerData(goatedId: string): Promise<GoatedApiUser['wager'] | null> {
    try {
      // This would call the wager stats endpoint
      const wagerData = await this.makeApiRequest(`${API_CONFIG.endpoints.statistics}/${goatedId}/wager`);
      
      if (!wagerData || !wagerData.success) {
        return null;
      }
      
      // Transform API response to our interface format
      return {
        all_time: parseFloat(wagerData.data.all_time) || 0,
        monthly: parseFloat(wagerData.data.monthly) || 0,
        weekly: parseFloat(wagerData.data.weekly) || 0,
        daily: parseFloat(wagerData.data.daily) || 0
      };
    } catch (error) {
      console.error(`Error getting wager data for user ${goatedId}:`, error);
      return null;
    }
  }
  
  /**
   * Check if a Goated username exists in the API
   * 
   * @param username - Username to check
   * @returns Object indicating if username exists and its ID if found
   */
  async checkGoatedUsername(username: string): Promise<{
    exists: boolean;
    goatedId?: string;
    message: string;
  }> {
    try {
      if (!this.hasApiToken()) {
        return {
          exists: false,
          message: 'API token not configured'
        };
      }
      
      // In a real implementation, this would call the API to check the username
      const userSearch = await this.makeApiRequest(`${API_CONFIG.endpoints.users}/search`, {
        method: 'POST',
        body: JSON.stringify({ username })
      });
      
      if (userSearch?.success && userSearch?.data?.length > 0) {
        const foundUser = userSearch.data.find((user: any) => 
          user.name.toLowerCase() === username.toLowerCase()
        );
        
        if (foundUser) {
          return {
            exists: true,
            goatedId: foundUser.uid,
            message: 'Username found in Goated system'
          };
        }
      }
      
      return {
        exists: false,
        message: 'Username not found in Goated system'
      };
    } catch (error) {
      console.error(`Error checking Goated username ${username}:`, error);
      return {
        exists: false,
        message: 'Error checking username'
      };
    }
  }
  
  /**
   * Get complete user profile from Goated API
   * 
   * @param goatedId - Goated user ID
   * @returns Complete user profile with all available data
   */
  async getUserProfile(goatedId: string): Promise<GoatedApiUser | null> {
    try {
      // Get basic user info
      const userData = await this.findUserByGoatedId(goatedId);
      if (!userData) {
        return null;
      }
      
      // Get wager data
      const wagerData = await this.getUserWagerData(goatedId);
      if (wagerData) {
        userData.wager = wagerData;
      }
      
      return userData;
    } catch (error) {
      console.error(`Error getting user profile for ${goatedId}:`, error);
      return null;
    }
  }
  
  /**
   * Sync user profiles from leaderboard data
   * 
   * @param userService - User service instance for database operations
   * @returns Statistics about the sync operation
   */
  async syncUserProfiles(userService: any): Promise<{ created: number; updated: number; existing: number }> {
    try {
      if (!this.hasApiToken()) {
        return { created: 0, updated: 0, existing: 0 };
      }
      
      // Fetch leaderboard data to get all users
      const leaderboardData = await this.makeApiRequest(API_CONFIG.endpoints.leaderboard);
      
      // Process all_time data to get unique users
      const allTimeData = leaderboardData?.data?.all_time?.data || [];
      let created = 0;
      let existing = 0;
      let updated = 0;
      
      console.log(`Processing ${allTimeData.length} users from leaderboard`);
      
      // This would process each user from the leaderboard
      // For now, just return the counts without actual processing
      
      return { created, updated, existing };
    } catch (error) {
      console.error("Error syncing user profiles:", error);
      return { created: 0, updated: 0, existing: 0 };
    }
  }
}

// Export the class directly for flexibility
export default GoatedApiService;