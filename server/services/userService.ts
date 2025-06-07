/**
 * User Service
 * 
 * Centralized service for core user CRUD operations and email verification.
 * This service handles only basic user database operations.
 * 
 * Account linking and profile management has been moved to profileService.ts
 */

import { db } from '../../db';
import { users, insertUserSchema } from '../../db/schema';
import { eq, or, sql } from 'drizzle-orm';

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
    // Removed cache invalidation for non-existent wager fields on 'users' table.
    // Wager-related cache invalidation should be handled by services that directly manage wager data.
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
   * Find users by a list of IDs (can be mixed internal numeric IDs or Goated IDs)
   */
  async findUsersByIds(ids: string[]) {
    if (!ids || ids.length === 0) {
      return [];
    }
    // Separate numeric IDs from potentially Goated string IDs
    const numericIds: number[] = [];
    const stringIds: string[] = [];
    ids.forEach(id => {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId) && String(parsedId) === id) {
        numericIds.push(parsedId);
      } else {
        stringIds.push(id); // These could be Goated IDs
      }
    });

    const conditions = [];
    if (numericIds.length > 0) {
      conditions.push(sql`${users.id} IN ${numericIds}`);
    }
    if (stringIds.length > 0) {
      conditions.push(sql`${users.goatedId} IN ${stringIds}`);
    }
    
    if (conditions.length === 0) return [];

    const results = await db.query.users.findMany({
      where: or(...conditions),
    });
    return results;
  }

  /**
   * Get all users (primarily for admin purposes)
   * TODO: Add pagination
   */
  async getAllUsers(limit = 50, offset = 0) {
    const results = await db.query.users.findMany({
      limit,
      offset,
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
    // TODO: also return total count for pagination
    return results;
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
