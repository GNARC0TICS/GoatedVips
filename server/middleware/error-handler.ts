/**
 * Global error handling middleware
 * Provides consistent error responses across the application
 */
import { Request, Response, NextFunction } from "express";
import { AppError, formatErrorResponse } from "../utils/error";
import { log } from "../utils/logger";

/**
 * Error handling middleware
 * Catches errors from routes and sends standardized error responses
 * 
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error with contextual information
  log(`Error: ${err.message} - ${req.method} ${req.path}`, "error-handler");
  
  // Additional detailed logging for debugging
  console.error("Error details:", {
    path: req.path,
    method: req.method,
    error: err instanceof AppError ? { 
      code: err.code,
      context: err.context 
    } : err
  });

  // If headers already sent, delegate to Express's default error handler
  if (res.headersSent) {
    return next(err);
  }

  // For AppError instances, use the provided code and message
  if (err instanceof AppError) {
    return res.status(err.code).json(formatErrorResponse(err));
  }

  // Default 500 error response for unexpected errors
  return res.status(500).json(formatErrorResponse(err, "An unexpected server error occurred"));
}

/**
 * 404 Not Found middleware
 * Handles requests to non-existent routes with a consistent response
 * 
 * @param req - Express request
 * @param res - Express response
 */
export function notFoundHandler(req: Request, res: Response) {
  log(`404 Not Found: ${req.method} ${req.path}`, "not-found-handler");
  
  return res.status(404).json({
    success: false,
    error: {
      code: 404,
      message: "The requested resource was not found"
    }
  });
}