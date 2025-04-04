
import { type Request, type Response, type NextFunction } from "express";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import { verifyToken, getUserById, AUTH_ERRORS } from "../services/authService";
import { verifyJwtToken } from "../auth";
import jwt from "jsonwebtoken";

// JWT configuration from env
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';

// Type definitions
declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
      jwtUser?: {
        id: number;
        username: string;
        isAdmin: boolean;
        email: string;
        tokenVersion?: number;
      };
    }
  }
}

/**
 * Authentication Middleware
 * 
 * Verifies the JWT token from either:
 * 1. Cookie: 'token' cookie for browser clients
 * 2. Authorization header: 'Bearer {token}' for API clients
 * 
 * If valid, attaches user to the request object.
 * If invalid, returns 401 Unauthorized.
 * 
 * @param req Express request object
 * @param res Express response object
 * @param next Express next middleware function
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(AUTH_ERRORS.UNAUTHORIZED.status)
        .json({ message: AUTH_ERRORS.UNAUTHORIZED.message });
    }

    // Verify the token and get the user ID
    const decoded = verifyToken(token);
    
    // Get the user from the database
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(AUTH_ERRORS.USER_NOT_FOUND.status)
        .json({ message: AUTH_ERRORS.USER_NOT_FOUND.message });
    }

    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    return res.status(AUTH_ERRORS.INVALID_TOKEN.status)
      .json({ message: AUTH_ERRORS.INVALID_TOKEN.message });
  }
};

/**
 * Extract JWT token from request
 * 
 * Checks both cookie and Authorization header for token
 * Cookie takes precedence over Authorization header
 * 
 * @param req Express request object
 * @returns The token string or null if not found
 */
function extractToken(req: Request): string | null {
  const sessionToken = req.cookies?.token || req.cookies?.accessToken;
  const authHeader = req.headers.authorization;
  return sessionToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);
}

/**
 * Enhanced JWT authentication middleware
 * 
 * This middleware verifies the JWT token and attaches the decoded user
 * information to the request. Uses the enhanced JWT implementation.
 * 
 * @param req Express request object
 * @param res Express response object
 * @param next Express next middleware function
 */
export const requireJwtAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip auth check for public endpoints
    const publicPaths = [
      '/api/login', 
      '/api/register', 
      '/api/auth/refresh',
      '/api/verify-email',
      '/api/password-reset/request',
      '/api/password-reset/reset',
      '/api/health'
    ];
    
    if (publicPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Get token from the request
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        username: string;
        isAdmin: boolean;
        email: string;
        tokenVersion?: number;
      };
      
      // Check if the user exists in the database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id))
        .limit(1);
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Attach user to request
      req.jwtUser = decoded;
      req.user = user;
      next();
    } catch (error) {
      if ((error as Error).name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};
