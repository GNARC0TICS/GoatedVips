/**
 * User Service
 * 
 * Centralized service for managing user data and operations.
 * This service encapsulates all database operations related to users.
 */

import { db } from '../../db';
import { users, insertUserSchema } from '../../db/schema';
import { eq, or, and, isNull } from 'drizzle-orm';
import goatedApiService from './goatedApiService';
import bcrypt from 'bcrypt';

class UserService {
  /**
   * Find a user by their ID
   */
  async findUserById(id: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, parseInt(id, 10)),
    });
    
    return result;
  }
  
  /**
   * Find a user by their username
   */
  async findUserByUsername(username: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    
    return result;
  }
  
  /**
   * Find a user by their email
   */
  async findUserByEmail(email: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    return result;
  }
  
  /**
   * Find a user by their Goated ID
   */
  async findUserByGoatedId(goatedId: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.goatedId, goatedId),
    });
    
    return result;
  }
  
  /**
   * Find a user by their email verification token
   */
  async findUserByVerificationToken(token: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.emailVerificationToken, token),
    });
    
    return result;
  }
  
  /**
   * Create a new user
   */
  async createUser(userData: typeof insertUserSchema._type) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  /**
   * Update a user
   */
  async updateUser(id: string, userData: Partial<typeof users.$inferInsert>) {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, lastActive: new Date() })
      .where(eq(users.id, parseInt(id, 10)))
      .returning();
    
    return updatedUser;
  }
  
  /**
   * Delete a user
   */
  async deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, parseInt(id, 10)));
  }
  
  /**
   * Search users by username or email
   */
  async searchUsers(query: string, limit = 10) {
    // Format the query for partial matching
    const formattedQuery = `%${query.toLowerCase()}%`;
    
    const results = await db.query.users.findMany({
      where: or(
        eq(users.username, formattedQuery),
        eq(users.email, formattedQuery),
        eq(users.goatedId, query)
      ),
      limit,
    });
    
    return results;
  }
  
  /**
   * Ensure a user profile exists
   * If it doesn't exist, create a basic placeholder
   */
  async ensureUserProfile(userId: string) {
    const user = await this.findUserById(userId);
    
    if (!user) {
      // Create a basic placeholder user
      return await this.createUser({
        id: parseInt(userId, 10),
        username: `user_${userId.substring(0, 6)}`,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        email: `temp_${userId.substring(0, 6)}@example.com`, // Temporary placeholder email
        createdAt: new Date(),
        lastActive: new Date(),
      });
    }
    
    // If the user exists but has a linked Goated account, refresh the data
    if (user.goatedId && user.goatedAccountLinked) {
      await this.refreshGoatedUserData(String(user.id), user.goatedId);
    }
    
    return user;
  }
  
  /**
   * Request Goated account linking by username
   * This starts the admin approval process
   */
  async requestGoatedAccountLink(userId: string, goatedUsername: string) {
    // First check if the user exists
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if the user already has a pending request
    if (user.goatedLinkRequested) {
      throw new Error('You already have a pending link request');
    }
    
    // Check if the user already has a linked account
    if (user.goatedAccountLinked) {
      throw new Error('Your account is already linked to a Goated account');
    }
    
    // Check if the Goated username exists
    const goatedCheck = await goatedApiService.checkGoatedUsername(goatedUsername);
    if (!goatedCheck.exists) {
      throw new Error('Goated username not found or invalid');
    }
    
    // Store the request for admin approval
    await this.updateUser(userId, {
      goatedLinkRequested: true,
      goatedUsernameRequested: goatedUsername,
      goatedLinkRequestedAt: new Date()
    });
    
    return {
      success: true,
      message: 'Link request submitted. An admin will review your request.',
      username: goatedUsername
    };
  }
  
  /**
   * Admin approval of Goated account linking
   * This is called by admin users to approve a linking request
   */
  async approveGoatedAccountLink(userId: string, goatedId: string, approvedBy: string) {
    // First check if the user exists
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if there is a pending request
    if (!user.goatedLinkRequested) {
      throw new Error('No pending link request for this user');
    }
    
    // Check if this Goated ID is already linked to another account
    const existingLinked = await this.findUserByGoatedId(goatedId);
    const userIdNumber = parseInt(userId, 10);
    if (existingLinked && existingLinked.id !== userIdNumber) {
      throw new Error('This Goated ID is already linked to another account');
    }
    
    // Get goated user info
    const goatedUser = await goatedApiService.getUserInfo(goatedId);
    if (!goatedUser) {
      throw new Error('Goated user information not found');
    }
    
    // Get wager data
    const wagerData = goatedUser.wager;
    
    // Update the user with Goated info
    const updatedUser = await this.updateUser(userId, {
      goatedId,
      goatedUsername: goatedUser.name,
      goatedAccountLinked: true,
      goatedLinkRequested: false,
      goatedUsernameRequested: null,
      // Store All-Time wager amount if available
      totalWager: wagerData?.all_time !== undefined ? String(wagerData.all_time) : user.totalWager,
    });
    
    return updatedUser;
  }
  
  /**
   * Admin rejection of Goated account linking
   * This is called by admin users to reject a linking request
   */
  async rejectGoatedAccountLink(userId: string, reason: string, rejectedBy: string) {
    // First check if the user exists
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if there is a pending request
    if (!user.goatedLinkRequested) {
      throw new Error('No pending link request for this user');
    }
    
    // Update the user to reject the request
    await this.updateUser(userId, {
      goatedLinkRequested: false,
      goatedUsernameRequested: null,
    });
    
    return {
      success: true,
      message: 'Link request rejected',
      reason
    };
  }
  
  /**
   * Refresh a user's Goated data
   */
  async refreshGoatedUserData(userId: string, goatedId: string) {
    try {
      // Get fresh data from Goated API
      const goatedUser = await goatedApiService.findUserByGoatedId(goatedId);
      
      if (!goatedUser) {
        console.warn(`Goated user ${goatedId} no longer exists, but linked to user ${userId}`);
        return;
      }
      
      // Get wager data
      const wagerData = await goatedApiService.getUserWagerData(goatedId);
      
      // Only update the wager data if it's available
      if (wagerData && wagerData.all_time !== undefined) {
        await db
          .update(users)
          .set({
            totalWager: String(wagerData.all_time),
            lastActive: new Date(),
          })
          .where(eq(users.id, parseInt(userId, 10)));
      }
    } catch (error) {
      console.error(`Error refreshing Goated data for user ${userId}:`, error);
    }
  }
  
  /**
   * Generate a verification token
   */
  generateVerificationToken() {
    // Generate a random string for email verification
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Request email verification
   */
  async requestEmailVerification(userId: string) {
    const user = await this.findUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.email) {
      throw new Error('User has no email address');
    }
    
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    // Generate and save verification token
    const token = this.generateVerificationToken();
    await this.updateUser(userId, {
      emailVerificationToken: token,
      emailVerificationSentAt: new Date(),
    });
    
    // Here you would typically send an email with the verification link
    // For this example, we'll just return the token
    return {
      email: user.email,
      token,
    };
  }
  
  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    const user = await this.findUserByVerificationToken(token);
    
    if (!user) {
      throw new Error('Invalid verification token');
    }
    
    // Check if token is expired (24 hours)
    if (user.emailVerificationSentAt) {
      const expiryTime = new Date(user.emailVerificationSentAt);
      expiryTime.setHours(expiryTime.getHours() + 24);
      
      if (new Date() > expiryTime) {
        throw new Error('Verification token has expired');
      }
    }
    
    // Mark email as verified
    await this.updateUser(String(user.id), {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
    });
    
    return user;
  }
}

// Export a singleton instance
const userService = new UserService();
export default userService;