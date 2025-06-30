import { drizzle } from 'drizzle-orm/neon-http';
import { eq, like, or, desc, asc, and, sql, count } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

import { User, CreateUserInput, UpdateUserInput } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { users, userSessions, wagerStats } from './schema';

export class DrizzleUserRepository implements IUserRepository {
  private db;
  
  constructor(connectionString: string) {
    const sql = neon(connectionString);
    this.db = drizzle(sql);
  }

  async create(input: CreateUserInput): Promise<User> {
    const id = uuidv4();
    const now = new Date();
    
    const userData = {
      id,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    
    const [user] = await this.db
      .insert(users)
      .values(userData)
      .returning();
      
    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
      
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
      
    return user ? this.mapToEntity(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
      
    return user ? this.mapToEntity(user) : null;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const updateData = {
      ...input,
      updatedAt: new Date(),
    };
    
    const [user] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
      
    return user ? this.mapToEntity(user) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .update(users)
      .set({ 
        status: 'deleted',
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
      
    return result.rowCount > 0;
  }

  async findByGoatedId(goatedId: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.goatedId, goatedId))
      .limit(1);
      
    return user ? this.mapToEntity(user) : null;
  }

  async linkGoatedAccount(userId: string, goatedId: string, goatedUsername: string): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({
        goatedId,
        goatedUsername,
        goatedLinked: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return user ? this.mapToEntity(user) : null;
  }

  async unlinkGoatedAccount(userId: string): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({
        goatedId: null,
        goatedUsername: null,
        goatedLinked: false,
        goatedVerified: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return user ? this.mapToEntity(user) : null;
  }

  async search(query: string, limit = 20, offset = 0): Promise<{ users: User[]; total: number }> {
    const searchPattern = `%${query.toLowerCase()}%`;
    
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.status, 'active'),
          or(
            like(sql`LOWER(${users.username})`, searchPattern),
            like(sql`LOWER(${users.displayName})`, searchPattern),
            like(sql`LOWER(${users.goatedUsername})`, searchPattern),
            eq(users.goatedId, query)
          )
        )
      );
    
    // Get users
    const userResults = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.status, 'active'),
          or(
            like(sql`LOWER(${users.username})`, searchPattern),
            like(sql`LOWER(${users.displayName})`, searchPattern),
            like(sql`LOWER(${users.goatedUsername})`, searchPattern),
            eq(users.goatedId, query)
          )
        )
      )
      .orderBy(desc(users.lastActiveAt))
      .limit(limit)
      .offset(offset);
    
    return {
      users: userResults.map(user => this.mapToEntity(user)),
      total: totalCount
    };
  }

  async list(filters = {}, pagination = { limit: 20, offset: 0 }): Promise<{ users: User[]; total: number }> {
    const conditions = [];
    
    if (filters.role) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters.status) {
      conditions.push(eq(users.status, filters.status));
    }
    if (filters.verified !== undefined) {
      conditions.push(eq(users.emailVerified, filters.verified));
    }
    if (filters.goatedLinked !== undefined) {
      conditions.push(eq(users.goatedLinked, filters.goatedLinked));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(users)
      .where(whereClause);
    
    // Get users
    const userResults = await this.db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
    
    return {
      users: userResults.map(user => this.mapToEntity(user)),
      total: totalCount
    };
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);
      
    return user ? this.mapToEntity(user) : null;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);
      
    return user ? this.mapToEntity(user) : null;
  }

  async updateLastActivity(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ 
        lastActiveAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async incrementLoginCount(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ 
        loginCount: sql`${users.loginCount} + 1`,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getStats(): Promise<{
    total: number;
    verified: number;
    goatedLinked: number;
    activeToday: number;
    activeThisWeek: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const [stats] = await this.db
      .select({
        total: count(),
        verified: count(sql`CASE WHEN ${users.emailVerified} = true THEN 1 END`),
        goatedLinked: count(sql`CASE WHEN ${users.goatedLinked} = true THEN 1 END`),
        activeToday: count(sql`CASE WHEN ${users.lastActiveAt} >= ${today} THEN 1 END`),
        activeThisWeek: count(sql`CASE WHEN ${users.lastActiveAt} >= ${thisWeek} THEN 1 END`),
      })
      .from(users)
      .where(eq(users.status, 'active'));
      
    return stats;
  }

  private mapToEntity(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      role: dbUser.role,
      status: dbUser.status,
      displayName: dbUser.displayName,
      bio: dbUser.bio,
      avatar: dbUser.avatar,
      profileColor: dbUser.profileColor,
      goatedId: dbUser.goatedId,
      goatedUsername: dbUser.goatedUsername,
      goatedLinked: dbUser.goatedLinked,
      goatedVerified: dbUser.goatedVerified,
      privacy: dbUser.privacySettings || {},
      preferences: dbUser.preferences || {},
      emailVerified: dbUser.emailVerified,
      emailVerificationToken: dbUser.emailVerificationToken,
      twoFactorEnabled: dbUser.twoFactorEnabled,
      twoFactorSecret: dbUser.twoFactorSecret,
      passwordResetToken: dbUser.passwordResetToken,
      passwordResetExpires: dbUser.passwordResetExpires,
      lastPasswordChange: dbUser.lastPasswordChange,
      lastLoginAt: dbUser.lastLoginAt,
      lastActiveAt: dbUser.lastActiveAt,
      loginCount: dbUser.loginCount,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }
}