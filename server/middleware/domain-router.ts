import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

/**
 * Middleware to detect and set the domain type
 * Separates public site (goatedvips.gg) from admin site (goombas.net)
 * In Replit environment, allows access from any domain
 */
export const domainRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const hostname = req.hostname;
  const isReplitEnv = process.env.REPL_ID !== undefined;
  
  // Set domain in request
  req.domain = hostname;
  
  // In Replit environment, allow all domains
  if (isReplitEnv) {
    // For Replit, consider admin vs public based on URL path
    req.isAdminDomain = req.path.startsWith('/admin');
    req.isPublicDomain = !req.isAdminDomain;
    
    if (req.isAdminDomain) {
      log(`Admin path access in Replit: ${req.path}`);
    }
  } else {
    // Production rules
    req.isAdminDomain = hostname === 'goombas.net' || 
                        hostname.includes('goombas.net') || 
                        hostname.includes('goombas.');
    
    req.isPublicDomain = !req.isAdminDomain;
    
    if (req.isAdminDomain) {
      log(`Admin domain access: ${hostname}`);
    }
  }

  next();
};

/**
 * Middleware to restrict routes to admin domain only
 */
export const adminDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  const isReplitEnv = process.env.REPL_ID !== undefined;
  
  // In Replit, bypass domain restrictions
  if (isReplitEnv) {
    return next();
  }
  
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
  const isReplitEnv = process.env.REPL_ID !== undefined;
  
  // In Replit, bypass domain restrictions
  if (isReplitEnv) {
    return next();
  }
  
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