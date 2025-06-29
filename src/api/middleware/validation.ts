import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Generic validation middleware for request body
export function validateRequest<T extends z.ZodSchema>(
  schema: T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
      }
      
      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Validation error',
        code: 'VALIDATION_SYSTEM_ERROR',
      });
    }
  };
}

// Validation middleware for query parameters
export function validateQuery<T extends z.ZodSchema>(
  schema: T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          code: 'QUERY_VALIDATION_ERROR',
          details: result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
      }
      
      // Replace req.query with validated data
      req.query = result.data as any;
      next();
    } catch (error) {
      console.error('Query validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Query validation error',
        code: 'QUERY_VALIDATION_SYSTEM_ERROR',
      });
    }
  };
}

// Validation middleware for URL parameters
export function validateParams<T extends z.ZodSchema>(
  schema: T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          code: 'PARAMS_VALIDATION_ERROR',
          details: result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
      }
      
      // Replace req.params with validated data
      req.params = result.data;
      next();
    } catch (error) {
      console.error('Params validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Parameter validation error',
        code: 'PARAMS_VALIDATION_SYSTEM_ERROR',
      });
    }
  };
}

// Common validation schemas
export const CommonSchemas = {
  // UUID parameter
  uuid: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),
  
  // Pagination query
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).optional(),
  }),
  
  // Search query
  search: z.object({
    q: z.string().min(1).max(100).optional(),
    query: z.string().min(1).max(100).optional(),
  }),
  
  // Sorting
  sort: z.object({
    sortBy: z.string().min(1).max(50).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  // Date range
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
};

// Sanitization utilities
export class Sanitizer {
  static sanitizeString(str: string, maxLength = 1000): string {
    return str
      .trim()
      .slice(0, maxLength)
      .replace(/[<>\"'&]/g, ''); // Basic XSS prevention
  }
  
  static sanitizeHtml(html: string): string {
    // In production, use a proper HTML sanitizer like DOMPurify
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
  
  static sanitizeUsername(username: string): string {
    return username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '');
  }
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    next(); // Continue even if sanitization fails
  }
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return Sanitizer.sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}