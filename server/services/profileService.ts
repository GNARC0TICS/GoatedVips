/**
 * ProfileService
 * 
 * Handles all user profile operations and Goated account integration:
 * - Profile creation and management
 * - Goated account linking workflow (request, approve, reject)
 * - Profile synchronization from Goated API
 * - Wager data updates and rank tracking
 * - Profile verification and discovery
 * 
 * This service consolidates profile logic from platformApiService, userService,
 * and various utility functions into a single, focused service.
 */

import { db } from "../../db";
import { users, SelectUser, InsertUser } from '../../db/schema';
import { transformationLogs } from '../../db/schema';
import { eq, sql } from "drizzle-orm";
import { preparePassword } from "../utils/auth-utils";
import goatedApiService from "./goatedApiService";
import statSyncService from "./statSyncService";

// TODO: Move to shared types file during future refactor
interface LeaderboardEntry {
  uid: string;
  name: string;
  wagered: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
}

interface LeaderboardData {
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
 * Profile synchronization statistics
 */
interface SyncStats {
  totalUsers: number;
  processedUsers: number;
  newUsers: number;
  updatedUsers: number;
  errors: number;
  duration: number;
}

/**
 * Goated account linking request
 */
interface GoatedLinkRequest {
  userId: string;
  goatedUsername: string;
  goatedId?: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Comprehensive ProfileService class
 * 
 * This service provides a complete solution for user profile management,
 * including Goated account integration, profile synchronization, and 
 * profile discovery features.
 */
class ProfileService {
  
  /**
   * Create a new user profile
   */
  public async createUser(userData: InsertUser): Promise<SelectUser> {
    const startTime = Date.now();
    
    try {
      // Hash password if provided
      if (userData.password) {
        userData.password = await preparePassword(userData.password);
      }

      const result = await db.insert(users).values({
        ...userData,
        createdAt: new Date(),
        lastUpdated: new Date()
      }).returning();

      if (!result || result.length === 0) {
        throw new Error('Failed to create user');
      }

      const user = result[0];
      const duration = Date.now() - startTime;
      
      await this.logProfileOperation(
        'create',
        'success',
        `Created user profile for ${user.username || user.email}`,
        duration
      );

      return user;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'create',
        'error',
        `Failed to create user profile`,
        duration,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Find user by email
   */
  public async findUserByEmail(email: string): Promise<SelectUser | null> {
    try {
      const result = await db.query.users.findFirst({
        where: eq(users.email, email)
      });
      
      return result || null;
    } catch (error) {
      console.error("ProfileService: Error finding user by email:", error);
      return null;
    }
  }

  /**
   * Find user by username
   */
  public async findUserByUsername(username: string): Promise<SelectUser | null> {
    try {
      const result = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      
      return result || null;
    } catch (error) {
      console.error("ProfileService: Error finding user by username:", error);
      return null;
    }
  }

  /**
   * Find user by ID
   */
  public async findUserById(id: string | number): Promise<SelectUser | null> {
    try {
      const userId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const result = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      return result || null;
    } catch (error) {
      console.error("ProfileService: Error finding user by ID:", error);
      return null;
    }
  }

  /**
   * Find user by Goated ID
   */
  public async findUserByGoatedId(goatedId: string): Promise<SelectUser | null> {
    try {
      const result = await db.query.users.findFirst({
        where: eq(users.goatedId, goatedId)
      });
      
      return result || null;
    } catch (error) {
      console.error("ProfileService: Error finding user by Goated ID:", error);
      return null;
    }
  }

  /**
   * Sync user profiles from Goated leaderboard
   * 
   * This method fetches the latest leaderboard data and synchronizes
   * user profiles, creating new ones for users not in our database
   * and updating existing ones with fresh data.
   */
  public async syncUserProfiles(): Promise<SyncStats> {
    const startTime = Date.now();
    
    const stats: SyncStats = {
      totalUsers: 0,
      processedUsers: 0,
      newUsers: 0,
      updatedUsers: 0,
      errors: 0,
      duration: 0
    };

    try {
      await this.logProfileOperation(
        'sync',
        'info',
        'Starting user profile synchronization',
        0
      );

      // TODO: Implement Goated API integration
      // For now, return empty stats to prevent errors
      stats.duration = Date.now() - startTime;
      
      await this.logProfileOperation(
        'sync',
        'warning',
        'Profile sync skipped - Goated API integration not yet implemented',
        stats.duration
      );

      return stats;
    } catch (error) {
      stats.duration = Date.now() - startTime;
      
      await this.logProfileOperation(
        'sync',
        'error',
        'Profile synchronization failed',
        stats.duration,
        error instanceof Error ? error.message : String(error)
      );

      throw error;
    }
  }

  /**
   * Process a single user entry from leaderboard data
   */
  private async processUserEntry(entry: LeaderboardEntry): Promise<void> {
    // Check if user already exists
    const existingUser = await this.findUserByGoatedId(entry.uid);
    
    if (existingUser) {
      // Update existing user
      await this.updateUser(existingUser.id.toString(), {
        username: entry.name,
        goatedId: entry.uid,
        lastUpdated: new Date()
      });
    } else {
      // Create new user
      await this.createUser({
        username: entry.name,
        password: 'temp-password', // Required field
        goatedId: entry.uid,
        email: `${entry.uid}@goated.temp`, // Temporary email
        goatedAccountLinked: true,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Create or update user profile ensuring it exists
   * 
   * This method is used by API endpoints to ensure a user profile
   * exists before displaying data. It handles various scenarios:
   * - Finding by internal ID
   * - Finding by Goated ID
   * - Creating from Goated API data
   * - Creating placeholder profiles
   */
  public async ensureUserProfile(userId: string): Promise<{
    user: SelectUser;
    isNewlyCreated: boolean;
  } | null> {
    const startTime = Date.now();
    
    try {
      // Try to find existing user by internal ID first
      let user = await this.findUserById(userId);
      
      if (user) {
        return { user, isNewlyCreated: false };
      }

      // Try to find by Goated ID
      user = await this.findUserByGoatedId(userId);
      
      if (user) {
        return { user, isNewlyCreated: false };
      }

      // TODO: Implement Goated API integration for user profile creation
      // For now, create placeholder profile

      // Create placeholder profile for users not found in API
      user = await this.createUser({
        username: `User${userId}`,
        password: 'temp-password', // Required field
        goatedId: userId,
        email: `${userId}@placeholder.temp`,
        goatedAccountLinked: false,
        createdAt: new Date(),
        lastUpdated: new Date()
      });

      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'ensure',
        'warning',
        `Created placeholder profile for user ${userId} (not found in Goated API)`,
        duration
      );

      return { user, isNewlyCreated: true };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'ensure',
        'error',
        `Failed to ensure profile for user ${userId}`,
        duration,
        error instanceof Error ? error.message : String(error)
      );

      console.error("ProfileService: Error ensuring user profile:", error);
      return null;
    }
  }

  /**
   * Request Goated account linking
   * 
   * Initiates the process of linking a user's account with their Goated profile.
   * This creates a pending request that needs to be approved.
   */
  public async requestGoatedLinking(
    userId: string,
    goatedUsername: string,
    goatedId?: string
  ): Promise<GoatedLinkRequest> {
    const startTime = Date.now();
    
    try {
      // Verify user exists
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is already linked
      if (user.goatedAccountLinked && user.goatedId) {
        throw new Error('User is already linked to a Goated account');
      }

      // Verify Goated username exists (optional verification)
      if (goatedId) {
        const goatedProfile = await goatedApiService.getUserProfile(goatedId);
        if (!goatedProfile || goatedProfile.name !== goatedUsername) {
          throw new Error('Goated profile verification failed');
        }
      }

      // Create linking request (this could be stored in a separate table in the future)
      const linkRequest: GoatedLinkRequest = {
        userId,
        goatedUsername,
        goatedId,
        requestedAt: new Date(),
        status: 'pending'
      };

      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'link-request',
        'success',
        `Goated linking requested for user ${userId} to ${goatedUsername}`,
        duration
      );

      return linkRequest;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'link-request',
        'error',
        `Failed to request Goated linking for user ${userId}`,
        duration,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Approve Goated account linking
   */
  public async approveGoatedLinking(
    userId: string,
    goatedId: string,
    goatedUsername: string
  ): Promise<SelectUser> {
    const startTime = Date.now();
    
    try {
      // Update user with Goated linking
      const user = await this.updateUser(userId, {
        goatedId,
        username: goatedUsername,
        goatedAccountLinked: true,
        lastUpdated: new Date()
      });

      // Sync user stats
      await statSyncService.syncUserStats(parseInt(userId, 10));

      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'link-approve',
        'success',
        `Approved Goated linking for user ${userId} to ${goatedUsername} (${goatedId})`,
        duration
      );

      return user;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'link-approve',
        'error',
        `Failed to approve Goated linking for user ${userId}`,
        duration,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Reject Goated account linking
   */
  public async rejectGoatedLinking(
    userId: string,
    reason?: string
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'link-reject',
        'info',
        `Rejected Goated linking for user ${userId}${reason ? `: ${reason}` : ''}`,
        duration
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        'link-reject',
        'error',
        `Failed to process Goated linking rejection for user ${userId}`,
        duration,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Search users by username (for profile discovery)
   */
  public async searchUsersByUsername(query: string, limit = 10): Promise<SelectUser[]> {
    try {
      const result = await db.query.users.findMany({
        where: sql`${users.username} ILIKE ${`%${query}%`}`,
        limit
      });
      
      return result || [];
    } catch (error) {
      console.error("ProfileService: Error searching users:", error);
      return [];
    }
  }

  /**
   * Get user profile with additional metadata
   */
  public async getUserProfile(userId: string): Promise<SelectUser | null> {
    try {
      const user = await this.findUserById(userId);
      
      if (!user) {
        return null;
      }

      // Additional profile enrichment could go here
      return user;
    } catch (error) {
      console.error("ProfileService: Error getting user profile:", error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  public async updateUser(userId: string, updates: Partial<InsertUser>): Promise<SelectUser> {
    const result = await db.update(users)
      .set({
        ...updates,
        lastUpdated: new Date()
      })
      .where(eq(users.id, parseInt(userId, 10)))
      .returning();
    
    if (!result || result.length === 0) {
      throw new Error('Failed to update user');
    }
    
    return result[0];
  }
  
  /**
   * Log profile-related operations
   */
  private async logProfileOperation(
    type: string, 
    status: 'success' | 'error' | 'warning' | 'info', 
    message: string, 
    durationMs: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await db.insert(transformationLogs).values({
        type: status,
        message: `[profile-${type}] ${message}`,
        durationMs: String(durationMs),
        createdAt: new Date(),
        resolved: status !== 'error',
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("ProfileService: Failed to log operation:", error);
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();

// Default export for consistency
export default profileService;