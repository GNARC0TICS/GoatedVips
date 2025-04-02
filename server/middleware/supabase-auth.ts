import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../db/supabase';
import { User } from '@supabase/supabase-js';

/**
 * Extended user type with admin status
 */
type AuthenticatedUser = User & { isAdmin: boolean };

/**
 * Middleware to verify Supabase JWT token
 * Attaches user to request object if authenticated
 */
export const supabaseAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Initialize user as null
    (req as any).user = null;
    
    // Get auth header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return next();
    }
    
    // Check if user has admin role
    const isAdmin = data.user.app_metadata?.role === 'admin';
    
    // Attach user and admin status to request
    (req as any).user = {
      ...data.user,
      isAdmin,
    } as AuthenticatedUser;
    
    return next();
  } catch (error) {
    console.error('Supabase auth error:', error);
    (req as any).user = null;
    return next();
  }
};

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next();
};

/**
 * Middleware to require admin role
 * Returns 403 if user is not an admin
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user || !(req as any).user.isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this resource',
    });
  }
  
  return next();
};