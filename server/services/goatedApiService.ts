/**
 * Goated Data Service
 * 
 * This service handles interactions with our user database for Goated-related operations.
 * All data is stored and retrieved directly from our database.
 */

import { db } from '../../db';
import { users, mockWagerData } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { API_CONFIG } from '../config/api';

// Define the shape of a Goated User
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
  /**
   * Check if a Goated username exists in our database and can be linked
   */
  async checkGoatedUsername(username: string): Promise<{
    exists: boolean;
    goatedId?: string;
    message: string;
  }> {
    try {
      // First check if this username already exists in our database
      const existingUser = await db.query.users.findFirst({
        where: eq(users.goatedUsername, username),
      });
      
      if (existingUser) {
        return {
          exists: true,
          goatedId: existingUser.goatedId || undefined,
          message: 'Username already exists in our system. Admin approval required for linking.'
        };
      }
      
      // If we have real API access, this would involve checking with the API
      if (this.hasApiToken()) {
        // In a production environment, this would make an API call to check
        // Instead, we'll just continue with the admin approval process
        return {
          exists: true,
          message: 'Username will be validated by an admin during approval process'
        };
      }

      return {
        exists: false,
        message: 'Username not found or invalid'
      };
    } catch (error) {
      console.error("Error checking Goated username:", error);
      return {
        exists: false,
        message: 'Error checking username'
      };
    }
  }
  
  /**
   * Get wager data for a user from our database
   */
  async getWagerData(goatedId: string): Promise<GoatedUser['wager'] | null> {
    try {
      // Find the user by goatedId
      const user = await db.query.users.findFirst({
        where: eq(users.goatedId, goatedId),
      });
      
      if (!user) {
        return null;
      }
      
      // See if we have mock wager data for this user
      const wagerData = await db.query.mockWagerData.findFirst({
        where: eq(mockWagerData.userId, user.id),
      });
      
      if (wagerData) {
        return {
          all_time: Number(wagerData.wageredAllTime) || 0,
          monthly: Number(wagerData.wageredThisMonth) || 0,
          weekly: Number(wagerData.wageredThisWeek) || 0,
          daily: Number(wagerData.wageredToday) || 0
        };
      }
      
      // If we have a totalWager value in the user record, use that
      if (user.totalWager) {
        return {
          all_time: Number(user.totalWager) || 0,
          monthly: 0,
          weekly: 0,
          daily: 0
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting wager data:", error);
      return null;
    }
  }
  
  /**
   * Get user info from our database by Goated ID
   */
  async getUserInfo(goatedId: string): Promise<GoatedUser | null> {
    try {
      // Find the user by goatedId
      const user = await db.query.users.findFirst({
        where: eq(users.goatedId, goatedId),
      });
      
      if (!user) {
        return null;
      }
      
      const userData: GoatedUser = {
        id: goatedId,
        name: user.goatedUsername || user.username,
      };
      
      // Get wager data if available
      const wagerData = await this.getWagerData(goatedId);
      if (wagerData) {
        userData.wager = wagerData;
      }
      
      return userData;
    } catch (error) {
      console.error("Error getting user info:", error);
      return null;
    }
  }
  
  /**
   * Check if the API token is configured
   */
  hasApiToken(): boolean {
    return !!process.env.API_TOKEN;
  }
  
  /**
   * Find a user by their Goated ID
   */
  async findUserByGoatedId(goatedId: string): Promise<GoatedUser | null> {
    return this.getUserInfo(goatedId);
  }
  
  /**
   * Get wager data for a user by their Goated ID
   */
  async getUserWagerData(goatedId: string): Promise<GoatedUser['wager'] | null> {
    return this.getWagerData(goatedId);
  }
}

// Export a singleton instance of the service
const goatedApiService = new GoatedApiService();
export default goatedApiService;