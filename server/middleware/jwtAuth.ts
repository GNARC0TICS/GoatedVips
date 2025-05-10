import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // Assuming jsonwebtoken is installed
import { users, SelectUser } from '@db/schema'; // Assuming SelectUser is exported or define a similar type

const JWT_SECRET = process.env.JWT_SECRET_KEY;

declare global {
  namespace Express {
    interface Request {
      user?: SelectUser; // Or a more specific UserJwtPayload type
    }
  }
}

export const requirePlatformAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  if (!JWT_SECRET) {
    console.error('JWT_SECRET_KEY is not configured on the server.');
    return res.status(500).json({ message: 'Authentication configuration error' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & SelectUser;
    // Optionally, you could re-fetch the user from DB here to ensure they haven't been disabled/deleted
    // For now, trust the JWT payload if it's valid and not expired.
    req.user = { id: decoded.id, username: decoded.username, email: decoded.email, isAdmin: decoded.isAdmin } as SelectUser; 
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('JWT verification error:', error);
    return res.status(500).json({ message: 'Failed to authenticate token' });
  }
};

// Middleware to require admin role based on the platform JWT
export const requirePlatformAdmin = (req: Request, res: Response, next: NextFunction) => {
  requirePlatformAuth(req, res, () => { // First, ensure user is authenticated
    if (res.headersSent) return; // If requirePlatformAuth already sent a response

    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Admin privileges required' });
    }
  });
}; 