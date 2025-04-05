import { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle domain-based routing
 * Routes requests to appropriate handlers based on hostname
 */
export const domainRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const hostname = req.hostname;

  // Add domain information to the request object for use in routes
  req.isAdminDomain = hostname === 'goombas.net' || hostname.includes('goombas.net');
  req.isPublicDomain = hostname === 'goatedvips.gg' || hostname.includes('goatedvips.gg') || 
                      hostname.includes('goatedvips.replit.app');

  // Set content security policy headers based on domain
  if (req.isAdminDomain) {
    // Stricter CSP for admin domain
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; frame-ancestors 'none';");
  }

  next();
};