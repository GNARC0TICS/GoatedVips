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

import { db } from "@db";
import { 
  users, 
  transformationLogs,
  SelectUser,
  InsertUser
} from "@db/schema";
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
export interface SyncStats {
  created: number;
  updated: number;
  existing: number;
  totalProcessed: number;
  duration: number;
}

/**
 * Account linking request result
 */
export interface LinkingResult {
  success: boolean;
  message: string;
  username?: string;
  reason?: string;
}

/**
 * Profile creation options
 */
export interface ProfileCreateOptions {
  username: string;
  goatedId?: string;
  goatedUsername?: string;
  email?: string;
  bio?: string;
  profileColor?: string;
  isLinked?: boolean;
  wagerData?: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
  rankData?: {
    daily: number | null;
    weekly: number | null;
    monthly: number | null;
    allTime: number | null;
  };
}

export class ProfileService {
  
  /**
   * Ensure a user profile exists
   * Creates profile from Goated API data if available, otherwise creates placeholder
   */
  async ensureUserProfile(userId: string): Promise<any> {
    if (!userId) return null;

    console.log(`ProfileService: Ensuring profile exists for ID: ${userId}`);

    try {
      // First check if user already exists
      const existingUser = await this.findExistingProfile(userId);
      if (existingUser) {
        // Refresh Goated data if linked
        if (existingUser.goatedId && existingUser.goatedAccountLinked) {
          await this.refreshGoatedUserData(String(existingUser.id), existingUser.goatedId);
        }
        
        return {
          ...existingUser,
          isNewlyCreated: false
        };
      }

      // Try to create profile from Goated API data
      const goatedProfile = await this.createFromGoatedData(userId);
      if (goatedProfile) {
        return goatedProfile;
      }

      // Fallback to placeholder profile
      return await this.createPlaceholderProfile(userId);
    } catch (error) {
      console.error(`ProfileService: Error ensuring profile for ID ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Request Goated account linking
   * Initiates the admin approval process for account linking
   */
  async requestGoatedAccountLink(userId: string, goatedUsername: string): Promise<LinkingResult> {
    try {
      // Validate user exists
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check for existing pending request
      if (user.goatedLinkRequested) {
        throw new Error('You already have a pending link request');
      }
      
      // Check if already linked
      if (user.goatedAccountLinked) {
        throw new Error('Your account is already linked to a Goated account');
      }
      
      // Verify Goated username exists
      const goatedCheck = await goatedApiService.checkGoatedUsername(goatedUsername);
      if (!goatedCheck.exists) {
        throw new Error('Goated username not found or invalid');
      }
      
      // Store the request
      await this.updateUser(userId, {
        goatedLinkRequested: true,
        goatedUsernameRequested: goatedUsername,
        goatedLinkRequestedAt: new Date()
      });
      
      await this.logProfileOperation('account-link-request', 'success', 
        `User ${userId} requested linking to ${goatedUsername}`, 0);
      
      return {
        success: true,
        message: 'Link request submitted. An admin will review your request.',
        username: goatedUsername
      };
    } catch (error) {
      await this.logProfileOperation('account-link-request', 'error', 
        `Failed to request linking for user ${userId}: ${error instanceof Error ? error.message : String(error)}`, 0);
      throw error;
    }
  }
  
  /**
   * Admin approval of Goated account linking
   */
  async approveGoatedAccountLink(userId: string, goatedId: string, approvedBy: string): Promise<SelectUser> {
    try {
      // Validate user and pending request
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.goatedLinkRequested) {
        throw new Error('No pending link request for this user');
      }
      
      // Check for conflicts
      const existingLinked = await this.findUserByGoatedId(goatedId);
      const userIdNumber = parseInt(userId, 10);
      if (existingLinked && existingLinked.id !== userIdNumber) {
        throw new Error('This Goated ID is already linked to another account');
      }
      
      // Get Goated user info and wager data
      const goatedUser = await goatedApiService.getUserInfo(goatedId);
      if (!goatedUser) {
        throw new Error('Goated user information not found');
      }
      
      // Update user with approved linking
      const updatedUser = await this.updateUser(userId, {
        goatedId,
        goatedUsername: goatedUser.name,
        goatedAccountLinked: true,
        goatedLinkRequested: false,
        goatedUsernameRequested: null,
        totalWager: goatedUser.wager?.all_time !== undefined ? String(goatedUser.wager.all_time) : user.totalWager,
        verifiedBy: approvedBy,
        verifiedAt: new Date()
      });
      
      await this.logProfileOperation('account-link-approved', 'success', 
        `Admin ${approvedBy} approved linking for user ${userId} to Goated ID ${goatedId}`, 0);
      
      return updatedUser;
    } catch (error) {
      await this.logProfileOperation('account-link-approved', 'error', 
        `Failed to approve linking for user ${userId}: ${error instanceof Error ? error.message : String(error)}`, 0);
      throw error;
    }
  }
  
  /**
   * Admin rejection of Goated account linking
   */
  async rejectGoatedAccountLink(userId: string, reason: string, rejectedBy: string): Promise<LinkingResult> {
    try {
      // Validate user and pending request
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.goatedLinkRequested) {
        throw new Error('No pending link request for this user');
      }
      
      // Clear the request
      await this.updateUser(userId, {
        goatedLinkRequested: false,
        goatedUsernameRequested: null,
      });
      
      await this.logProfileOperation('account-link-rejected', 'success', 
        `Admin ${rejectedBy} rejected linking for user ${userId}. Reason: ${reason}`, 0);
      
      return {
        success: true,
        message: 'Link request rejected',
        reason
      };
    } catch (error) {
      await this.logProfileOperation('account-link-rejected', 'error', 
        `Failed to reject linking for user ${userId}: ${error instanceof Error ? error.message : String(error)}`, 0);
      throw error;
    }
  }
  
  /**
   * Unlink Goated account
   */
  async unlinkGoatedAccount(userId: string): Promise<LinkingResult> {
    try {
      // Validate user has linked account
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.goatedId) {
        throw new Error('No linked account to unlink');
      }
      
      // Unlink the account
      await this.updateUser(userId, {
        goatedId: null,
        goatedUsername: null,
        goatedAccountLinked: false,
        lastActive: new Date()
      });
      
      await this.logProfileOperation('account-unlinked', 'success', 
        `User ${userId} unlinked their Goated account`, 0);
      
      return {
        success: true,
        message: 'Account unlinked successfully'
      };
    } catch (error) {
      await this.logProfileOperation('account-unlinked', 'error', 
        `Failed to unlink account for user ${userId}: ${error instanceof Error ? error.message : String(error)}`, 0);
      throw error;
    }
  }
  
  /**
   * Synchronize all user profiles from Goated API
   * Creates/updates profiles based on current leaderboard data
   */
  async syncUserProfiles(leaderboardData?: LeaderboardData): Promise<SyncStats> {
    const startTime = Date.now();
    console.log("ProfileService: Starting profile synchronization");
    
    try {
      let created = 0;
      let updated = 0;
      let existing = 0;
      
      // Fetch leaderboard data if not provided
      if (!leaderboardData) {
        console.log("ProfileService: Fetching transformed leaderboard data for profile sync");
        leaderboardData = await statSyncService.getLeaderboardData();
        if (!leaderboardData?.data) {
          await this.logProfileOperation('profile-sync', 'error', 
            'Failed to fetch leaderboard data', Date.now() - startTime);
          throw new Error('Failed to fetch leaderboard data');
        }
      }
      
      const profiles = leaderboardData.data.all_time.data || [];
      
      if (!profiles.length) {
        await this.logProfileOperation('profile-sync', 'warning', 
          'No profiles found in API response', Date.now() - startTime);
        return { created, updated, existing, totalProcessed: 0, duration: Date.now() - startTime };
      }
      
      // Build rank maps for all timeframes
      const rankMaps = this.buildRankMaps(leaderboardData);
      
      // Process each profile
      for (const profile of profiles) {
        try {
          const { uid, name, wagered } = profile;
          
          if (!uid || !name) continue;
          
          const existingUser = await db.query.users.findFirst({
            where: eq(users.goatedId, uid)
          });
          
          if (existingUser) {
            // Check if update needed
            const needsUpdate = this.profileNeedsUpdate(existingUser, profile, rankMaps);
            
            if (needsUpdate) {
              await this.updateExistingProfile(existingUser, profile, rankMaps);
              updated++;
            } else {
              existing++;
            }
          } else {
            // Create new profile
            await this.createNewProfile(profile, rankMaps);
            created++;
          }
        } catch (error) {
          console.error(`ProfileService: Error processing profile ${profile?.name}:`, error);
          continue;
        }
      }
      
      const duration = Date.now() - startTime;
      await this.logProfileOperation('profile-sync', 'success', 
        `Synced ${created + updated} profiles (${created} created, ${updated} updated, ${existing} unchanged)`, 
        duration);
      
      return { created, updated, existing, totalProcessed: profiles.length, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logProfileOperation('profile-sync', 'error', 
        'Failed to sync profiles', duration, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  /**
   * Update wager data for existing users
   */
  async updateWagerData(leaderboardData: LeaderboardData): Promise<number> {
    const startTime = Date.now();
    console.log("ProfileService: Starting wager data update");
    
    try {
      const profiles = leaderboardData.data.all_time.data || [];
      
      if (!profiles.length) {
        await this.logProfileOperation('wager-update', 'warning', 
          'No profiles found for wager update', Date.now() - startTime);
        return 0;
      }
      
      let updatedCount = 0;
      
      for (const profile of profiles) {
        try {
          const { uid, wagered } = profile;
          
          if (!uid || !wagered) continue;
          
          const userResult = await db.query.users.findFirst({
            where: eq(users.goatedId, uid)
          });
          
          if (!userResult) continue;
          
          await db.update(users)
            .set({
              totalWager: String(wagered.all_time || 0),
              dailyWager: String(wagered.today || 0),
              weeklyWager: String(wagered.this_week || 0),
              monthlyWager: String(wagered.this_month || 0),
              lastWagerSync: new Date(),
              lastUpdated: new Date()
            })
            .where(eq(users.goatedId, uid));
          
          updatedCount++;
        } catch (error) {
          console.error(`ProfileService: Error updating wager data for ${profile.uid}:`, error);
          continue;
        }
      }
      
      await this.logProfileOperation('wager-update', 'success', 
        `Updated wager data for ${updatedCount} users`, Date.now() - startTime);
      
      return updatedCount;
    } catch (error) {
      await this.logProfileOperation('wager-update', 'error', 
        'Failed to update wager data', Date.now() - startTime, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  /**
   * Refresh Goated data for a specific user
   */
  async refreshGoatedUserData(userId: string, goatedId: string): Promise<void> {
    try {
      const goatedUser = await goatedApiService.findUserByGoatedId(goatedId);
      
      if (!goatedUser) {
        console.warn(`ProfileService: Goated user ${goatedId} no longer exists, but linked to user ${userId}`);
        return;
      }
      
      const wagerData = await goatedApiService.getUserWagerData(goatedId);
      
      if (wagerData && wagerData.all_time !== undefined) {
        await db.update(users)
          .set({
            totalWager: String(wagerData.all_time),
            lastActive: new Date(),
            lastWagerSync: new Date()
          })
          .where(eq(users.id, parseInt(userId, 10)));
      }
    } catch (error) {
      console.error(`ProfileService: Error refreshing Goated data for user ${userId}:`, error);
    }
  }
  
  // Private helper methods
  
  /**
   * Find existing profile by ID or Goated ID
   */
  private async findExistingProfile(userId: string): Promise<any> {
    const isNumericId = /^\d+$/.test(userId);
    
    // Try by internal ID first
    if (isNumericId) {
      const results = await db.execute(sql`
        SELECT 
          id, username, bio, email,
          profile_color as "profileColor",
          created_at as "createdAt",
          goated_id as "goatedId", 
          goated_username as "goatedUsername",
          goated_account_linked as "goatedAccountLinked"
        FROM users WHERE id::text = ${userId} LIMIT 1
      `);
      
      if (results.rows && results.rows.length > 0) {
        return results.rows[0];
      }
    }
    
    // Try by Goated ID
    const results = await db.execute(sql`
      SELECT 
        id, username, bio, email,
        profile_color as "profileColor",
        created_at as "createdAt",
        goated_id as "goatedId", 
        goated_username as "goatedUsername",
        goated_account_linked as "goatedAccountLinked"
      FROM users WHERE goated_id = ${userId} LIMIT 1
    `);
    
    return results.rows && results.rows.length > 0 ? results.rows[0] : null;
  }
  
  /**
   * Create profile from Goated API data
   */
  private async createFromGoatedData(userId: string): Promise<any> {
    try {
      // Get user data from leaderboard
      const rawData = await goatedApiService.fetchReferralData();
      if (!rawData?.data) return null;
      
      const userData = this.findUserInLeaderboard(userId, rawData);
      if (!userData?.name) return null;
      
      // Create permanent profile with Goated data
      const email = `${userData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
      
      const result = await db.execute(sql`
        INSERT INTO users (
          username, email, password, created_at, profile_color, 
          bio, is_admin, goated_id, goated_username, goated_account_linked
        ) VALUES (
          ${userData.name}, ${email}, '', ${new Date()}, '#D7FF00', 
          'Official Goated.com player profile', false, ${userId}, ${userData.name}, true
        ) RETURNING id, username, bio, profile_color as "profileColor", created_at as "createdAt", 
          goated_id as "goatedId", goated_username as "goatedUsername", goated_account_linked as "goatedAccountLinked"
      `);
      
      if (result?.rows && result.rows.length > 0) {
        console.log(`ProfileService: Created permanent profile for Goated player ${userData.name} (${userId})`);
        return {
          ...result.rows[0],
          isNewlyCreated: true,
          isPermanent: true
        };
      }
    } catch (error) {
      console.error(`ProfileService: Failed to create Goated profile for ${userId}:`, error);
    }
    
    return null;
  }
  
  /**
   * Create placeholder profile
   */
  private async createPlaceholderProfile(userId: string): Promise<any> {
    try {
      const isNumericId = /^\d+$/.test(userId);
      const tempUsername = isNumericId ? `User ${userId}` : `User ${userId.substring(0, 8)}`;
      const email = isNumericId ? `user_${userId}@placeholder.com` : `user_${userId.substring(0, 8)}@placeholder.com`;
      
      const result = await db.execute(sql`
        INSERT INTO users (
          username, email, password, created_at, profile_color, 
          bio, is_admin, goated_id, goated_account_linked
        ) VALUES (
          ${tempUsername}, ${email}, '', ${new Date()}, '#D7FF00', 
          'User profile', false, ${userId}, false
        ) RETURNING id, username, bio, profile_color as "profileColor", created_at as "createdAt", 
          goated_id as "goatedId", goated_username as "goatedUsername", goated_account_linked as "goatedAccountLinked"
      `);
      
      if (result?.rows && result.rows.length > 0) {
        console.log(`ProfileService: Created placeholder profile for ID ${userId}`);
        return {
          ...result.rows[0],
          isNewlyCreated: true,
          isTemporary: true
        };
      }
    } catch (error) {
      console.error(`ProfileService: Failed to create placeholder profile for ${userId}:`, error);
    }
    
    return null;
  }
  
  /**
   * Find user in leaderboard data
   */
  private findUserInLeaderboard(userId: string, rawData: any): any {
    const timeframes = ['all_time', 'monthly', 'weekly', 'today'];
    
    for (const timeframe of timeframes) {
      const users = rawData?.data?.[timeframe]?.data || [];
      const foundUser = users.find((u: any) => u.uid === userId);
      if (foundUser) return foundUser;
    }
    
    return null;
  }
  
  /**
   * Build rank maps for all timeframes
   */
  private buildRankMaps(leaderboardData: LeaderboardData) {
    const rankMaps = {
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map(),
      allTime: new Map()
    };
    
    // Build rank maps
    leaderboardData.data.today?.data?.forEach((profile, index) => {
      if (profile.uid) rankMaps.daily.set(profile.uid, index + 1);
    });
    
    leaderboardData.data.weekly?.data?.forEach((profile, index) => {
      if (profile.uid) rankMaps.weekly.set(profile.uid, index + 1);
    });
    
    leaderboardData.data.monthly?.data?.forEach((profile, index) => {
      if (profile.uid) rankMaps.monthly.set(profile.uid, index + 1);
    });
    
    leaderboardData.data.all_time?.data?.forEach((profile, index) => {
      if (profile.uid) rankMaps.allTime.set(profile.uid, index + 1);
    });
    
    return rankMaps;
  }
  
  /**
   * Check if profile needs update
   */
  private profileNeedsUpdate(existingUser: any, profile: LeaderboardEntry, rankMaps: any): boolean {
    return (
      existingUser.goatedUsername !== profile.name ||
      existingUser.totalWager !== String(profile.wagered?.all_time || 0) ||
      existingUser.dailyWager !== String(profile.wagered?.today || 0) ||
      existingUser.weeklyWager !== String(profile.wagered?.this_week || 0) ||
      existingUser.monthlyWager !== String(profile.wagered?.this_month || 0) ||
      existingUser.dailyRank !== rankMaps.daily.get(profile.uid) ||
      existingUser.weeklyRank !== rankMaps.weekly.get(profile.uid) ||
      existingUser.monthlyRank !== rankMaps.monthly.get(profile.uid) ||
      existingUser.allTimeRank !== rankMaps.allTime.get(profile.uid)
    );
  }
  
  /**
   * Update existing profile
   */
  private async updateExistingProfile(existingUser: any, profile: LeaderboardEntry, rankMaps: any): Promise<void> {
    await db.update(users)
      .set({
        goatedUsername: profile.name,
        totalWager: String(profile.wagered?.all_time || 0),
        dailyWager: String(profile.wagered?.today || 0),
        weeklyWager: String(profile.wagered?.this_week || 0),
        monthlyWager: String(profile.wagered?.this_month || 0),
        dailyRank: rankMaps.daily.get(profile.uid) || null,
        weeklyRank: rankMaps.weekly.get(profile.uid) || null,
        monthlyRank: rankMaps.monthly.get(profile.uid) || null,
        allTimeRank: rankMaps.allTime.get(profile.uid) || null,
        lastActive: new Date(),
        lastUpdated: new Date(),
        lastWagerSync: new Date()
      })
      .where(eq(users.goatedId, profile.uid));
  }
  
  /**
   * Create new profile from leaderboard data
   */
  private async createNewProfile(profile: LeaderboardEntry, rankMaps: any): Promise<void> {
    const randomPassword = Math.random().toString(36).substring(2, 10);
    const hashedPassword = await preparePassword(randomPassword);
    
    await db.insert(users).values({
      username: profile.name,
      password: hashedPassword,
      email: `${profile.uid}@goated.placeholder`,
      goatedId: profile.uid,
      goatedUsername: profile.name,
      goatedAccountLinked: true,
      totalWager: String(profile.wagered?.all_time || 0),
      dailyWager: String(profile.wagered?.today || 0),
      weeklyWager: String(profile.wagered?.this_week || 0),
      monthlyWager: String(profile.wagered?.this_month || 0),
      dailyRank: rankMaps.daily.get(profile.uid) || null,
      weeklyRank: rankMaps.weekly.get(profile.uid) || null,
      monthlyRank: rankMaps.monthly.get(profile.uid) || null,
      allTimeRank: rankMaps.allTime.get(profile.uid) || null,
      createdAt: new Date(),
      lastUpdated: new Date(),
      lastWagerSync: new Date(),
      profileColor: '#D7FF00',
      bio: 'Goated.com player'
    });
  }
  
  /**
   * Basic user operations
   */
  private async findUserById(userId: string): Promise<SelectUser | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId, 10))
      });
      return user || null;
    } catch (error) {
      console.error(`ProfileService: Error finding user ${userId}:`, error);
      return null;
    }
  }
  
  private async findUserByGoatedId(goatedId: string): Promise<SelectUser | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.goatedId, goatedId)
      });
      return user || null;
    } catch (error) {
      console.error(`ProfileService: Error finding user by Goated ID ${goatedId}:`, error);
      return null;
    }
  }
  
  private async updateUser(userId: string, updates: Partial<InsertUser>): Promise<SelectUser> {
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
        duration_ms: String(durationMs),
        created_at: new Date(),
        resolved: status !== 'error',
        error_message: errorMessage
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