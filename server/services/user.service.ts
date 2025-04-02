/**
 * UserService
 * 
 * Provides a centralized service for all user-related operations.
 * This includes:
 * - User creation and retrieval
 * - Goated account linking and verification
 * - Profile management
 * - Account synchronization with Goated API
 */

import { v4 as uuidv4 } from 'uuid';
import { eq, or, and, isNull } from 'drizzle-orm'; 
import { users, UserSourceType, UserLinkStatus } from '../../db/schema/supabase-users';
import { db, supabase, supabaseAdmin } from '../../db/supabase';
import { API_CONFIG } from '../config/api';
import { getApiToken, getApiHeaders } from '../utils/api-token';

// User type for TypeScript
export interface UserData {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profileColor?: string;
  profileImage?: string;
  goatedId?: string;
  goatedUsername?: string;
  goatedAccountLinked: boolean;
  sourceType: string;
  linkStatus: string;
  isAdmin: boolean;
  createdAt: Date;
  // Other user fields as needed
}

export class UserService {
  /**
   * Find a user by different identifiers
   * @param params Object containing search parameters
   * @returns User object or null if not found
   */
  async findUser(params: { 
    id?: string;
    goatedId?: string;
    username?: string;
    email?: string;
  }): Promise<UserData | null> {
    try {
      // Validate we have at least one search parameter
      if (!params.id && !params.goatedId && !params.username && !params.email) {
        return null;
      }
      
      // Build search conditions
      const conditions = [];
      if (params.id) conditions.push(eq(users.id, params.id));
      if (params.goatedId) conditions.push(eq(users.goatedId, params.goatedId));
      if (params.username) conditions.push(eq(users.username, params.username));
      if (params.email) conditions.push(eq(users.email, params.email));
      
      // If no db connection, return null
      if (!db) {
        console.error('No database connection available');
        return null;
      }
      
      // Query database
      const result = await db.select().from(users).where(or(...conditions)).limit(1);
      
      // Return user if found
      return result.length > 0 ? result[0] as UserData : null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }
  
  /**
   * Create a new user
   * @param userData User data to create
   * @returns Created user or null if creation failed
   */
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    sourceType?: string;
    isAdmin?: boolean;
    goatedId?: string;
    goatedUsername?: string;
    goatedAccountLinked?: boolean;
  }): Promise<UserData | null> {
    try {
      // If no db connection, return null
      if (!db) {
        console.error('No database connection available');
        return null;
      }
      
      // Generate UUID for new user
      const userId = uuidv4();
      
      // Set default values
      const userToCreate = {
        id: userId,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        sourceType: userData.sourceType || UserSourceType.DIRECT_REGISTRATION,
        linkStatus: userData.goatedId ? UserLinkStatus.VERIFIED : UserLinkStatus.NOT_LINKED,
        isAdmin: userData.isAdmin || false,
        goatedId: userData.goatedId,
        goatedUsername: userData.goatedUsername,
        goatedAccountLinked: userData.goatedAccountLinked || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Insert user into database
      const result = await db.insert(users).values(userToCreate).returning();
      
      // Return created user
      return result.length > 0 ? result[0] as UserData : null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }
  
  /**
   * Ensure a user profile exists for a Goated ID
   * This function will:
   * 1. Check if user already exists with the given Goated ID
   * 2. If not, check if user exists in Goated API
   * 3. Create a user profile based on the API data if available
   * 4. Create a temporary profile if no API data is available
   * 
   * @param goatedId The Goated ID to ensure a profile for
   * @returns User profile or null if unable to create
   */
  async ensureUserProfile(goatedId: string): Promise<(UserData & { isNewlyCreated?: boolean }) | null> {
    try {
      if (!goatedId) return null;
      
      console.log(`Ensuring profile exists for ID: ${goatedId}`);
      
      // Check if user already exists
      const existingUser = await this.findUser({ goatedId });
      
      if (existingUser) {
        return {
          ...existingUser,
          isNewlyCreated: false
        };
      }
      
      // No existing user, try to fetch user data from the API
      const apiUserData = await this.fetchUserFromGoatedApi(goatedId);
      
      if (apiUserData) {
        // User found in API, create permanent profile
        return this.createApiSourcedUser(goatedId, apiUserData.name);
      } else {
        // No user data found in API, create temporary profile
        return this.createTemporaryUser(goatedId);
      }
    } catch (error) {
      console.error(`Error ensuring profile for Goated ID ${goatedId}:`, error);
      return null;
    }
  }
  
  /**
   * Create a user profile from Goated API data
   * @param goatedId The Goated ID
   * @param username The username from API
   * @returns Created user or null if creation failed
   */
  private async createApiSourcedUser(goatedId: string, username: string): Promise<(UserData & { isNewlyCreated: boolean }) | null> {
    try {
      // Create email from username (placeholder)
      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
      
      // Create user
      const user = await this.createUser({
        username,
        email,
        password: 'GOATED_API_USER', // Placeholder password
        sourceType: UserSourceType.GOATED_API,
        goatedId,
        goatedUsername: username,
        goatedAccountLinked: true,
      });
      
      if (user) {
        return {
          ...user,
          isNewlyCreated: true
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to create API-sourced user for Goated ID ${goatedId}:`, error);
      return null;
    }
  }
  
  /**
   * Create a temporary user profile
   * @param goatedId The Goated ID
   * @returns Created user or null if creation failed
   */
  private async createTemporaryUser(goatedId: string): Promise<(UserData & { isNewlyCreated: boolean }) | null> {
    try {
      // Create a temporary username and email
      const tempUsername = `Goated User ${goatedId.substring(0, 5)}`;
      const email = `user_${goatedId}@goated.placeholder.com`;
      
      // Create user
      const user = await this.createUser({
        username: tempUsername,
        email,
        password: 'TEMPORARY_USER', // Placeholder password
        sourceType: UserSourceType.TEMPORARY,
        goatedId,
        goatedAccountLinked: false,
      });
      
      if (user) {
        return {
          ...user,
          isNewlyCreated: true
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to create temporary user for Goated ID ${goatedId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch user data from Goated API
   * @param goatedId The Goated ID to fetch
   * @returns User data from API or null if not found
   */
  async fetchUserFromGoatedApi(goatedId: string): Promise<{ uid: string; name: string } | null> {
    try {
      // Get API token using the utility function
      const apiHeaders = getApiHeaders();
      
      // Fetch leaderboard data from API
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
        { headers: apiHeaders }
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch leaderboard data: ${response.status}`);
        return null;
      }
      
      const leaderboardData = await response.json();
      
      // Search for user in different timeframes
      const timeframes = ['today', 'weekly', 'monthly', 'all_time'];
      
      for (const timeframe of timeframes) {
        const users = leaderboardData?.data?.[timeframe]?.data || [];
        
        // Find user with matching UID
        const foundUser = users.find((user: any) => user.uid === goatedId);
        
        if (foundUser) {
          return foundUser;
        }
      }
      
      return null; // User not found in any timeframe
    } catch (error) {
      console.error("Error fetching from leaderboard API:", error);
      return null;
    }
  }
  
  /**
   * Link a local user account with a Goated.com account
   * @param userId User ID to link
   * @param goatedId Goated ID to link to
   * @param verificationMethod Method used for verification
   * @returns Result of linking operation
   */
  async linkGoatedAccount(
    userId: string, 
    goatedId: string, 
    verificationMethod: 'id_verification' | 'admin'
  ): Promise<{ success: boolean; message: string }> {
    try {
      // If no db connection, return error
      if (!db) {
        console.error('No database connection available');
        return { success: false, message: 'Database connection error' };
      }
      
      // Find the existing user
      const user = await this.findUser({ id: userId });
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Check if this Goated ID is already linked to another account
      const existingLinked = await this.findUser({ goatedId });
      if (existingLinked && existingLinked.id !== userId) {
        // If it's a temporary account, we can transfer ownership
        if (existingLinked.sourceType === UserSourceType.TEMPORARY) {
          // Mark temporary account as merged
          await db.update(users)
            .set({
              isDeleted: true,
              mergedTo: userId,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingLinked.id));
        } else {
          return { 
            success: false, 
            message: 'This Goated ID is already linked to another account' 
          };
        }
      }
      
      // Get Goated API data to verify and get username
      const apiUser = await this.fetchUserFromGoatedApi(goatedId);
      
      if (!apiUser && verificationMethod === 'id_verification') {
        return { 
          success: false, 
          message: 'Could not verify this Goated ID in the API' 
        };
      }
      
      // Update the user record
      await db.update(users)
        .set({
          goatedId,
          goatedUsername: apiUser?.name || null,
          goatedAccountLinked: true,
          linkStatus: UserLinkStatus.VERIFIED,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      return {
        success: true,
        message: 'Account linked successfully'
      };
    } catch (error) {
      console.error('Error linking account:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error linking account' 
      };
    }
  }
  
  /**
   * Unlink a Goated.com account from a user
   * @param userId User ID to unlink
   * @returns Result of unlinking operation
   */
  async unlinkGoatedAccount(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // If no db connection, return error
      if (!db) {
        console.error('No database connection available');
        return { success: false, message: 'Database connection error' };
      }
      
      // Find the user
      const user = await this.findUser({ id: userId });
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Check if user has a linked account
      if (!user.goatedId) {
        return { success: false, message: 'No linked account to unlink' };
      }
      
      // Unlink the account
      await db.update(users)
        .set({
          goatedId: null,
          goatedUsername: null,
          goatedAccountLinked: false,
          linkStatus: UserLinkStatus.NOT_LINKED,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      return {
        success: true,
        message: 'Account unlinked successfully'
      };
    } catch (error) {
      console.error('Error unlinking account:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error unlinking account' 
      };
    }
  }
  
  /**
   * Synchronize user profiles from the Goated API
   * This will:
   * 1. Fetch all users from the leaderboard API
   * 2. Create profiles for users that don't exist
   * 3. Update existing profiles with current data
   * 
   * @returns Statistics of the sync operation
   */
  async syncUserProfilesFromApi(): Promise<{ created: number; existing: number; updated: number }> {
    try {
      console.log("Syncing user profiles from leaderboard...");
      
      // Get API token using the utility function
      const apiHeaders = getApiHeaders();
      
      // Fetch leaderboard data
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
        { headers: apiHeaders }
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch leaderboard data: ${response.status}`);
        return { created: 0, existing: 0, updated: 0 };
      }
      
      const leaderboardData = await response.json();
      
      // Process all_time data to get unique users
      const allTimeData = leaderboardData?.data?.all_time?.data || [];
      let createdCount = 0;
      let existingCount = 0;
      let updatedCount = 0;
      
      console.log(`Processing ${allTimeData.length} users from leaderboard`);
      
      // Process each user
      for (const player of allTimeData) {
        try {
          // Skip entries without uid or name
          if (!player.uid || !player.name) continue;
          
          // Check if user already exists
          const existingUser = await this.findUser({ goatedId: player.uid });
          
          if (existingUser) {
            existingCount++;
            
            // Update if username doesn't match
            if (!existingUser.goatedUsername && player.name) {
              await db?.update(users)
                .set({
                  goatedUsername: player.name,
                  goatedAccountLinked: true,
                  updatedAt: new Date(),
                })
                .where(eq(users.goatedId, player.uid));
                
              updatedCount++;
            }
          } else {
            // Create new profile
            const result = await this.createApiSourcedUser(player.uid, player.name);
            if (result) {
              createdCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing user ${player?.name}:`, error);
        }
      }
      
      console.log(`Profile sync completed. Created ${createdCount} new profiles, updated ${updatedCount}, ${existingCount} already existed.`);
      
      return {
        created: createdCount,
        existing: existingCount,
        updated: updatedCount
      };
    } catch (error) {
      console.error("Error syncing profiles from leaderboard:", error);
      return { created: 0, existing: 0, updated: 0 };
    }
  }
  
  // Add additional user management methods as needed
}

// Export a singleton instance
export const userService = new UserService();
