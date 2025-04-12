
import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "../config/auth";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import { extractTokenFromRequest, AUTH_ERROR_MESSAGES } from "../utils/auth-utils";

// Type definitions
declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
    }
  }
}

/**
 * Authentication middleware
 * Verifies user token and attaches user to request
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Use centralized token extraction utility
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ 
        status: "error", 
        message: AUTH_ERROR_MESSAGES.AUTH_REQUIRED 
      });
    }

    const user = await validateAndGetUser(token);
    
    if (!user) {
      return res.status(401).json({ 
        status: "error", 
        message: AUTH_ERROR_MESSAGES.USER_NOT_FOUND 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      status: "error", 
      message: AUTH_ERROR_MESSAGES.INVALID_TOKEN 
    });
  }
};

/**
 * Validate token and fetch associated user
 */
async function validateAndGetUser(token: string) {
  const decoded = verifyToken(token);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);
  
  return user;
}
