import { Request, Response, NextFunction } from 'express';
import { JWTAuthService, TokenPayload } from '../../infrastructure/auth/JWTAuthService';
import { UserService } from '../../domain/services/UserService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        sessionId: string;
      };
      sessionId?: string;
    }
  }
}

export class AuthMiddleware {
  constructor(
    private authService: JWTAuthService,
    private userService: UserService
  ) {}

  // Extract token from request headers
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Also check cookies for SPA support
    if (req.cookies?.accessToken) {
      return req.cookies.accessToken;
    }
    
    return null;
  }

  // Optional authentication - adds user to request if token is valid
  optional = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);
      if (!token) {
        return next();
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.authService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return next();
      }

      const payload = await this.authService.verifyAccessToken(token);
      if (payload) {
        req.user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          sessionId: payload.sessionId,
        };
        req.sessionId = payload.sessionId;
      }
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      next();
    }
  };

  // Required authentication - returns 401 if no valid token
  required = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_TOKEN'
        });
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.authService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({
          error: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }

      const payload = await this.authService.verifyAccessToken(token);
      if (!payload) {
        return res.status(401).json({
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }

      // Validate session
      const sessionData = await this.authService.validateSession(payload.sessionId);
      if (!sessionData) {
        return res.status(401).json({
          error: 'Session expired',
          code: 'SESSION_EXPIRED'
        });
      }

      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
      };
      req.sessionId = payload.sessionId;
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Authentication service error',
        code: 'AUTH_ERROR'
      });
    }
  };

  // Role-based authorization
  requireRole = (allowedRoles: string | string[]) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_AUTH'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: roles,
          current: req.user.role
        });
      }

      next();
    };
  };

  // Admin only
  requireAdmin = this.requireRole('admin');

  // Moderator or Admin
  requireModerator = this.requireRole(['admin', 'moderator']);

  // Verify user owns resource
  requireResourceOwnership = (getUserIdFromParams: (req: Request) => string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_AUTH'
        });
      }

      const resourceUserId = getUserIdFromParams(req);
      const isOwner = req.user.id === resourceUserId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Access denied - you can only access your own resources',
          code: 'ACCESS_DENIED'
        });
      }

      next();
    };
  };

  // Rate limiting per user
  userRateLimit = (requestsPerMinute: number) => {
    const attempts = new Map<string, { count: number; resetTime: number }>();
    
    return async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id || req.ip;
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minute
      
      let userAttempts = attempts.get(userId);
      
      if (!userAttempts || now > userAttempts.resetTime) {
        userAttempts = { count: 1, resetTime: now + windowMs };
        attempts.set(userId, userAttempts);
      } else {
        userAttempts.count++;
      }
      
      if (userAttempts.count > requestsPerMinute) {
        return res.status(429).json({
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
        });
      }
      
      // Clean up old entries periodically
      if (Math.random() < 0.01) { // 1% chance
        for (const [key, value] of attempts.entries()) {
          if (now > value.resetTime) {
            attempts.delete(key);
          }
        }
      }
      
      next();
    };
  };

  // Logout middleware - blacklists current token
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);
      if (token && req.sessionId) {
        // Blacklist the token
        await this.authService.blacklistToken(token, 15 * 60); // 15 minutes (token expiry)
        
        // Revoke the session
        await this.authService.revokeSession(req.sessionId);
      }
      
      next();
    } catch (error) {
      console.error('Logout middleware error:', error);
      next(); // Continue anyway
    }
  };

  // Security headers middleware
  securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Prevent XSS
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // CSRF protection hint
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent caching of sensitive data
    if (req.path.includes('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  };
}