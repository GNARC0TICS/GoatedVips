import { Request, Response, NextFunction } from "express";

// Extend Express Request to include custom property
declare global {
    namespace Express {
        interface Request {
            isGoombasDomain?: boolean;
        }
    }
}

/**
 * Middleware to handle custom domain requests
 * Identifies and marks requests from goombas.net domain
 */
export function domainRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
    // Check if the request URL starts with /goombas.net
    // This is a simplified way to handle domain-specific routing in a single-server setup
    if (req.path.startsWith('/goombas.net')) {
        req.isGoombasDomain = true;
        
        // Remove the /goombas.net prefix for internal routing
        // We'll keep the original URL, but mark the request as coming from the goombas domain
        // This allows us to use the same routes internally, but handle them differently
    }
    
    next();
}