import { Response } from 'express';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
  meta?: {
    timestamp?: string;
    path?: string;
    code?: string;
    [key: string]: any;
  };
}

/**
 * Send a success response with standardized format
 * 
 * @param res Express response object
 * @param data Optional data to include in the response
 * @param message Optional message to include in the response
 * @param statusCode HTTP status code (defaults to 200)
 * @param meta Optional metadata to include in the response
 * @returns Express response object
 */
export function sendSuccess<T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  meta?: Record<string, any>
): Response {
  const response: ApiResponse<T> = {
    status: 'success',
    meta: {
      timestamp: new Date().toISOString(),
      path: res.req?.originalUrl || '',
      ...meta
    }
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Send an error response with standardized format
 * 
 * @param res Express response object
 * @param message Error message
 * @param statusCode HTTP status code (defaults to 400)
 * @param errors Optional array of detailed errors
 * @param meta Optional metadata to include in the response
 * @returns Express response object
 */
export function sendError(
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 400,
  errors?: any[],
  meta?: Record<string, any>
): Response {
  const response: ApiResponse = {
    status: 'error',
    message,
    meta: {
      timestamp: new Date().toISOString(),
      path: res.req?.originalUrl || '',
      code: `ERR_${statusCode}`,
      ...meta
    }
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Send an authentication error response
 * 
 * @param res Express response object
 * @param message Error message
 * @param statusCode HTTP status code (defaults to 401)
 * @param meta Optional metadata to include in the response
 * @returns Express response object
 */
export function sendAuthError(
  res: Response,
  message: string = 'Authentication error',
  statusCode: number = 401,
  meta?: Record<string, any>
): Response {
  return sendError(res, message, statusCode, undefined, {
    code: 'AUTH_ERROR',
    ...meta
  });
}

/**
 * Send a validation error response
 * 
 * @param res Express response object
 * @param message Error message
 * @param validationErrors Array of validation errors
 * @param meta Optional metadata to include in the response
 * @returns Express response object
 */
export function sendValidationError(
  res: Response,
  message: string = 'Validation error',
  validationErrors: any[] = [],
  meta?: Record<string, any>
): Response {
  return sendError(res, message, 422, validationErrors, {
    code: 'VALIDATION_ERROR',
    ...meta
  });
}

/**
 * Send a not found error response
 * 
 * @param res Express response object
 * @param message Error message
 * @param resourceType Type of resource that was not found
 * @param resourceId ID of resource that was not found
 * @returns Express response object
 */
export function sendNotFoundError(
  res: Response,
  message: string = 'Resource not found',
  resourceType?: string,
  resourceId?: string | number
): Response {
  const meta: Record<string, any> = {
    code: 'NOT_FOUND'
  };
  
  if (resourceType) {
    meta.resourceType = resourceType;
  }
  
  if (resourceId !== undefined) {
    meta.resourceId = resourceId;
  }
  
  return sendError(res, message, 404, undefined, meta);
}

/**
 * Send a forbidden error response
 * 
 * @param res Express response object
 * @param message Error message
 * @param meta Optional metadata to include in the response
 * @returns Express response object
 */
export function sendForbiddenError(
  res: Response,
  message: string = 'Access forbidden',
  meta?: Record<string, any>
): Response {
  return sendError(res, message, 403, undefined, {
    code: 'FORBIDDEN',
    ...meta
  });
}
