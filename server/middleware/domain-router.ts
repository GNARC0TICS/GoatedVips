import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

/**
 * Simplified middleware that no longer enforces domain restrictions
 * All routes will be available on a single domain
 */
export const domainRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const hostname = req.hostname;

  // Set domain in request (keep for compatibility)
  req.domain = hostname;

  // All domains have access to all routes
  req.isAdminDomain = true;
  req.isPublicDomain = true;

  next();
};

/**
 * Legacy middleware - no longer restricts access
 * Kept for backward compatibility
 */
export const adminDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  next();
};

/**
 * Legacy middleware - no longer restricts access
 * Kept for backward compatibility
 */
export const publicDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  next();
};

// Legacy router function - maintained for backward compatibility
export const domainRouter = domainRedirectMiddleware;

// Add custom properties to Request interface
// Fix for TypeScript error about duplicate modifiers
declare global {
  namespace Express {
    interface Request {
      domain?: string;
      isAdminDomain?: boolean;
      isPublicDomain?: boolean;
    }
  }
}