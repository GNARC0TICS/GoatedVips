import { db } from "@db";
import { users, type SelectUser } from "@db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * User Service
 * Centralizes all user-related operations and logic
 */
export class UserService {
  /**
   * Find a user by specific criteria
   * @param criteria - Object with search criteria
   * @returns User object if found, null otherwise
   */
  async findUser(criteria: Partial<Record<string, any>>): Promise<SelectUser | null> {
    try {
      let query = db.select().from(users);
      
      // Add where clauses based on criteria
      if (criteria.id) {
        query = query.where(eq(users.id, criteria.id));
      }
      
      if (criteria.username) {
        query = query.where(eq(users.username, criteria.username));
      }
      
      if (criteria.email) {
        query = query.where(eq(users.email, criteria.email));
      }
      
      if (criteria.goatedId) {
        query = query.where(eq(users.goatedId, criteria.goatedId));
      }
      
      const result = await query.limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  }
  
  /**
   * Find a user by ID
   * @param id - User ID
   * @returns User object if found, null otherwise
   */
  async findUserById(id: number): Promise<SelectUser | null> {
    return this.findUser({ id });
  }
  
  /**
   * Find a user by Goated ID
   * @param goatedId - Goated ID
   * @returns User object if found, null otherwise
   */
  async findUserByGoatedId(goatedId: string): Promise<SelectUser | null> {
    return this.findUser({ goatedId });
  }
  
  /**
   * Link a Goated account to a user
   * @param userId - User ID
   * @param goatedId - Goated ID
   * @param linkMethod - Method used for linking ('id_verification', 'api_sync', etc.)
   * @returns Updated user object
   */
  async linkGoatedAccount(userId: number, goatedId: string, linkMethod: string): Promise<SelectUser | null> {
    try {
      // Check if this Goated ID is already linked to another account
      const existingLinked = await this.findUserByGoatedId(goatedId);
      
      if (existingLinked && existingLinked.id !== userId) {
        // It's already linked to another account
        // In this simplified implementation, we don't support claiming or merging accounts
        // All accounts are considered permanent
        throw new Error("This Goated ID is already linked to another account");
      }
      
      // Link the account
      await db.update(users)
        .set({
          goatedId,
          goatedAccountLinked: true,
          goatedUsername: await this.fetchGoatedUsername(goatedId),
          lastActive: new Date(),
        })
        .where(eq(users.id, userId));
      
      return this.findUserById(userId);
    } catch (error) {
      console.error("Error linking Goated account:", error);
      throw error;
    }
  }
  
  /**
   * Transfer data from a temporary account to a permanent one
   * @param fromUserId - Source user ID (temporary account)
   * @param toUserId - Destination user ID (permanent account)
   */
  private async transferTemporaryAccountData(fromUserId: number, toUserId: number): Promise<void> {
    // Implement data transfer logic here
    // This could involve transferring activity history, preferences, etc.
    console.log(`Transferring data from temporary user ${fromUserId} to permanent user ${toUserId}`);
    
    // For now, this is a placeholder
    // In a real implementation, you would copy/merge relevant data
  }
  
  /**
   * Creates or retrieves a profile for a specific user ID
   * Used by endpoints to ensure a user profile exists before showing data
   * 
   * This function handles the following scenarios:
   * 1. Finding existing users by their internal database ID
   * 2. Finding existing users by their Goated ID
   * 3. Creating new permanent profiles for users found in the Goated.com leaderboard API
   * 4. Creating temporary placeholder profiles for users not found in the API
   * 
   * @param userId - The user ID (numeric internal ID or external Goated ID)
   * @returns User object with isNewlyCreated flag if found/created, null otherwise 
   */
  async ensureUserProfile(userId: string): Promise<any> {
    try {
      // Case 1: Try to find the user by internal ID if the userId is numeric
      const numericId = Number(userId);
      if (!isNaN(numericId)) {
        const existingUserById = await this.findUserById(numericId);
        if (existingUserById) {
          return { ...existingUserById, isNewlyCreated: false };
        }
      }
      
      // Case 2: Try to find the user by Goated ID
      const existingUserByGoatedId = await this.findUserByGoatedId(userId);
      if (existingUserByGoatedId) {
        return { ...existingUserByGoatedId, isNewlyCreated: false };
      }
      
      // If we get here, the user doesn't exist in our database yet
      // We'll need to handle API lookup and profile creation
      // This would call the GoatedApiService in a real implementation
      
      return null;
    } catch (error) {
      console.error("Error ensuring user profile:", error);
      return null;
    }
  }
  
  /**
   * Fetch the username for a Goated ID from the API
   * @param goatedId - The Goated ID to look up
   * @returns The username if found, null otherwise
   */
  private async fetchGoatedUsername(goatedId: string): Promise<string | null> {
    try {
      // This would use GoatedApiService in a real implementation
      // For now, we'll just return null; in practice, this would make an API call
      
      // Stub implementation
      const { GoatedApiService } = require('../services/goated-api.service');
      const apiService = new GoatedApiService();
      const userData = await apiService.findUserByGoatedId(goatedId);
      
      return userData?.name || null;
    } catch (error) {
      console.error(`Error fetching Goated username for ID ${goatedId}:`, error);
      return null;
    }
  }
}