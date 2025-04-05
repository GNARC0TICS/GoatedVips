import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

/**
 * Middleware for path-based admin detection
 * Instead of using domains, detects admin routes by URL path
 */
export const adminPathMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Admin routes are now identified by path prefix
  const isAdminPath = req.path.startsWith('/admin');
  
  // This property is kept for backward compatibility but 
  // now reflects path-based routing instead of domain-based routing
  req.isAdminDomain = isAdminPath;

  if (isAdminPath) {
    log(`Admin path access: ${req.path}`);
  }

  next();
};

/**
 * Legacy middleware functions that are now effectively no-ops
 * Maintained for backward compatibility only
 */
export const adminDomainOnly = (_req: Request, _res: Response, next: NextFunction) => {
  // No longer restricts by domain - all routes are now available
  next();
};

export const publicDomainOnly = (_req: Request, _res: Response, next: NextFunction) => {
  // No longer restricts by domain - all routes are now available
  next();
};

// Updated router function for path-based routing
export const domainRouter = adminPathMiddleware;

// Keep the interface for backward compatibility
declare global {
  namespace Express {
    interface Request {
      domain?: string;
      isAdminDomain?: boolean;
    }
  }
}