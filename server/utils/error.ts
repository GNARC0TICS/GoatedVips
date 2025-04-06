/**
 * Application Error class for standardized error handling
 * Extends the built-in Error class with additional properties
 */
export class AppError extends Error {
  /**
   * Create a new application error
   * @param code HTTP status code
   * @param message User-friendly error message
   * @param context Additional context for debugging (not exposed to clients)
   */
  constructor(
    public code: number,
    public message: string,
    public context?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Handles errors in async route handlers
 * @param fn Express route handler function
 * @returns Wrapped function that catches and forwards errors to Express error middleware
 */
export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Creates a properly formatted error response
 * @param error Error object or string
 * @param defaultMessage Fallback message if error is not an AppError
 * @returns Standardized error response object
 */
export const formatErrorResponse = (error: any, defaultMessage = "An unexpected error occurred") => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
  
  return {
    success: false,
    error: {
      code: 500,
      message: error.message || defaultMessage
    }
  };
};