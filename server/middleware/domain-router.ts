
import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

/**
 * Middleware to route requests based on hostname
 * Separates public site (goatedvips.gg) from admin site (goombas.net)
 */
export const domainRouter = (req: Request, res: Response, next: NextFunction) => {
  const hostname = req.hostname;
  
  // Store the domain in request for later use
  req.domain = hostname;

  // Add domain info to request object for use in routes
  if (hostname === 'goombas.net' || hostname.includes('goombas.net')) {
    req.isAdminDomain = true;
    log(`Admin domain access: ${hostname}`);
  } else {
    req.isAdminDomain = false;
  }

  next();
};

/**
 * Middleware to restrict routes to admin domain only
 */
export const adminDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAdminDomain) {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }
  next();
};

/**
 * Middleware to restrict routes to public domain only
 */
export const publicDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAdminDomain) {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }
  next();
};

// Add custom properties to Request interface
declare global {
  namespace Express {
    interface Request {
      domain?: string;
      isAdminDomain?: boolean;
    }
  }
}
import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

// Middleware to detect and set the domain type
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

// Middleware to restrict routes to admin domain only
export const adminDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAdminDomain) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'This endpoint can only be accessed from the admin domain' 
    });
  }
  next();
};

// Middleware to restrict routes to public domain only
export const publicDomainOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAdminDomain) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'This endpoint can only be accessed from the public domain' 
    });
  }
  next();
};
