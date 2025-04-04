import { Request, Response, NextFunction } from "express";
import { log } from '../utils/logger';

/**
 * Middleware to handle domain-based routing
 * Routes requests to appropriate handlers based on hostname
 */
export const domainRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const hostname = req.hostname;
  const isReplitEnv = process.env.REPL_ID !== undefined;
  
  log(`Request hostname: ${hostname}, Replit env: ${isReplitEnv}`, 'domain-handler');

  // Allow any domain in Replit environment
  if (isReplitEnv) {
    // Default to regular user access on any domain in Replit environment
    req.isAdminDomain = false;
    req.isPublicDomain = true;
    
    // Only set admin access for specific admin indicators
    if (hostname.includes('goombas') || hostname.includes('admin')) {
      req.isAdminDomain = true;
    }
  } else {
    // Production environment - specific domain rules
    req.isAdminDomain = hostname === 'goombas.net' || hostname.includes('goombas.net');
    req.isPublicDomain = hostname === 'goatedvips.gg' || hostname.includes('goatedvips.gg') || 
                         hostname.includes('goatedvips.replit.app');
  }

  // Skip security headers in Replit environment to avoid issues
  if (!isReplitEnv) {
    // Set content security policy headers based on domain
    if (req.isAdminDomain) {
      // Stricter CSP for admin domain
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; frame-ancestors 'none';");
    }
  }

  next();
};