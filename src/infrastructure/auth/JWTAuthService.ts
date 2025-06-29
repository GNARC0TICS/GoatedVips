import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../../domain/entities/User';
import { ICacheService } from '../cache/ICacheService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastAccessedAt: Date;
}

export class JWTAuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
  private readonly SESSION_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    private cacheService: ICacheService,
    private userRepository: IUserRepository,
    jwtSecret?: string,
    jwtRefreshSecret?: string
  ) {
    this.JWT_SECRET = jwtSecret || process.env.JWT_SECRET || this.generateSecureSecret();
    this.JWT_REFRESH_SECRET = jwtRefreshSecret || process.env.JWT_REFRESH_SECRET || this.generateSecureSecret();
    
    if (!jwtSecret || !jwtRefreshSecret) {
      console.warn('JWT secrets not provided, using generated secrets (not recommended for production)');
    }
  }

  async generateTokens(user: User, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    const sessionId = this.generateSessionId();
    
    // Create session data
    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };
    
    // Store session in cache
    await this.cacheService.set(
      `session:${sessionId}`,
      sessionData,
      this.SESSION_EXPIRY
    );
    
    // Create token payload
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    };
    
    // Generate tokens
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'goated-vips',
      audience: 'goated-vips-app',
    });
    
    const refreshToken = jwt.sign(
      { userId: user.id, sessionId },
      this.JWT_REFRESH_SECRET,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        issuer: 'goated-vips',
        audience: 'goated-vips-app',
      }
    );
    
    // Store refresh token
    await this.cacheService.set(
      `refresh:${sessionId}`,
      refreshToken,
      this.SESSION_EXPIRY
    );
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'goated-vips',
        audience: 'goated-vips-app',
      }) as TokenPayload;
      
      // Verify session exists
      const sessionExists = await this.cacheService.exists(`session:${payload.sessionId}`);
      if (!sessionExists) {
        return null;
      }
      
      // Update last accessed time
      await this.updateSessionAccess(payload.sessionId);
      
      return payload;
    } catch (error) {
      return null;
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET, {
        issuer: 'goated-vips',
        audience: 'goated-vips-app',
      }) as any;
      
      // Verify refresh token exists in cache
      const storedToken = await this.cacheService.get(`refresh:${payload.sessionId}`);
      if (storedToken !== refreshToken) {
        return null;
      }
      
      // Get session data
      const sessionData = await this.cacheService.get<SessionData>(`session:${payload.sessionId}`);
      if (!sessionData) {
        return null;
      }
      
      // Get user data
      const user = await this.userRepository.findById(payload.userId);
      if (!user || user.status !== 'active') {
        return null;
      }
      
      // Generate new tokens
      return this.generateTokens(user, sessionData.ipAddress, sessionData.userAgent);
    } catch (error) {
      return null;
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    await Promise.all([
      this.cacheService.delete(`session:${sessionId}`),
      this.cacheService.delete(`refresh:${sessionId}`),
    ]);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    // In a real Redis implementation, you'd use SCAN to find all sessions for a user
    // For now, we'll mark the user as requiring re-authentication
    await this.cacheService.set(`user:${userId}:revoked`, true, this.SESSION_EXPIRY);
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    // Check if user sessions are revoked
    const sessionData = await this.cacheService.get<SessionData>(`session:${sessionId}`);
    if (!sessionData) {
      return null;
    }
    
    const isRevoked = await this.cacheService.get(`user:${sessionData.userId}:revoked`);
    if (isRevoked) {
      await this.revokeSession(sessionId);
      return null;
    }
    
    return sessionData;
  }

  async getUserSessions(userId: string): Promise<SessionData[]> {
    // In a production Redis setup, you'd implement a proper session store
    // This is a simplified version
    const sessionData = await this.cacheService.get<SessionData>(`session:${userId}`);
    return sessionData ? [sessionData] : [];
  }

  private async updateSessionAccess(sessionId: string): Promise<void> {
    const sessionData = await this.cacheService.get<SessionData>(`session:${sessionId}`);
    if (sessionData) {
      sessionData.lastAccessedAt = new Date();
      await this.cacheService.set(`session:${sessionId}`, sessionData, this.SESSION_EXPIRY);
    }
  }

  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSecureSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // Security utilities
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return await this.cacheService.exists(`blacklist:${this.hashToken(token)}`);
  }

  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const hashedToken = this.hashToken(token);
    await this.cacheService.set(`blacklist:${hashedToken}`, true, expiresIn);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Admin functions
  async getActiveSessionsCount(): Promise<number> {
    // This would need to be implemented with proper Redis SCAN in production
    return 0;
  }

  async cleanupExpiredSessions(): Promise<number> {
    // Redis TTL handles this automatically, but this could be used for cleanup
    return 0;
  }
}