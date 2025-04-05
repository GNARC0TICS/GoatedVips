import { Request, Response, NextFunction } from "express";
import { log } from '../utils/logger';

/**
 * Simplified middleware that no longer does domain-based routing
 * All routes will be available on a single domain
 */
export const domainRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const hostname = req.hostname;
  const isReplitEnv = process.env.REPL_ID !== undefined;

  log(`Request hostname: ${hostname}, Replit env: ${isReplitEnv}`, 'domain-handler');

  // Set all requests to have common access
  req.isAdminDomain = false;
  req.isPublicDomain = true;

  next();
};

export function domainHandler(req: Request, res: Response, next: NextFunction) {
  const hostname = req.hostname || req.headers.host || '';
  const isReplitEnv = process.env.REPL_ID !== undefined || 
                      hostname.includes('replit') || 
                      hostname.includes('.repl.co');

  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Only log in development mode to reduce noise
  if (isDevelopment) {
    console.log('[domain-handler] Request hostname:', hostname, 'Replit env:', isReplitEnv);
  }

  // Add domain information to the request for later use
  req.isReplitEnv = isReplitEnv || isDevelopment; // Treat development as Replit env for easier testing
  req.domain = hostname;

  // Disable cookies in development mode by clearing them
  if (isDevelopment && req.cookies && Object.keys(req.cookies).length > 0) {
    // Clear any cookies that might be interfering with development
    for (const cookieName of Object.keys(req.cookies)) {
      res.clearCookie(cookieName);
    }
  }

  next();
}