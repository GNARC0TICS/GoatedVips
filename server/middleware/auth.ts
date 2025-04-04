
import { type Request, type Response, type NextFunction } from "express";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import { verifyToken, getUserById, AUTH_ERRORS } from "../services/authService";

// Type definitions
declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
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
  const sessionToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  return sessionToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);
}
