import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

/**
 * Middleware to detect and set the domain type
 * Separates public site (goatedvips.gg) from admin site (goombas.net)
 */
export const domainRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const hostname = req.hostname;

  // Set domain type in request object
  req.isAdminDomain = hostname === 'goombas.net' || 
                      hostname.includes('goombas.net') || 
                      hostname.includes('goombas.');

  if (req.isAdminDomain) {
    log(`Admin domain access: ${hostname}`);
  }

  next();
};

/**
 * Middleware to restrict routes to admin domain only
 */
export const adminDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAdminDomain) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'This endpoint can only be accessed from the admin domain' 
    });
  }
  next();
};

/**
 * Middleware to restrict routes to public domain only
 */
export const publicDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAdminDomain) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'This endpoint can only be accessed from the public domain' 
    });
  }
  next();
};

// Legacy router function - maintained for backward compatibility
export const domainRouter = domainRedirectMiddleware;

// Add custom properties to Request interface
declare global {
  namespace Express {
    interface Request {
      domain?: string;
      isAdminDomain?: boolean;
    }
  }
}