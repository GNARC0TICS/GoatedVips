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