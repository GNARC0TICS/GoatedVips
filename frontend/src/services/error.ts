/**
 * Standard error response format from API
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
  };
}

/**
 * Client-side error class for standardized error handling
 */
export class AppError extends Error {
  /**
   * Create a new application error
   * @param code Error code
   * @param message User-friendly error message
   * @param context Additional context for debugging
   */
  constructor(
    public code: number = 500,
    message: string = "An unexpected error occurred",
    public context?: any
  ) {
    super(message);
    this.name = "AppError";
  }

  /**
   * Create an AppError from an API error response
   * @param response API error response
   * @returns AppError instance
   */
  static fromApiResponse(response: ApiErrorResponse): AppError {
    return new AppError(
      response.error.code,
      response.error.message
    );
  }
}

/**
 * Helper to determine if a response is an error
 * @param response Any API response
 * @returns True if the response is an error
 */
export function isApiErrorResponse(response: any): response is ApiErrorResponse {
  return (
    response &&
    response.success === false &&
    response.error &&
    typeof response.error.code === 'number' &&
    typeof response.error.message === 'string'
  );
}

/**
 * Formats an error for display to the user
 * @param error Error object or message
 * @returns User-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}