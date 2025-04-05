/**
 * Environment configuration module
 * Centralizes all environment-related settings and detection
 * 
 * This module provides a consistent way to access environment variables
 * and derive environment-specific settings throughout the application.
 */

// Environment detection
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = !IS_PRODUCTION;

// Port configuration with fallbacks
export const PORT = parseInt(process.env.PORT || '5000', 10);
export const BOT_PORT = parseInt(process.env.BOT_PORT || '5001', 10);
export const VITE_PORT = parseInt(process.env.VITE_PORT || '5173', 10);
export const HOST = process.env.HOST || '0.0.0.0';

// Application URLs (now uses environment variables instead of hardcoded values)
export const APP_URL = process.env.APP_URL || (IS_DEVELOPMENT ? 'http://localhost:5000' : 'https://goatedvips.replit.app');
export const ADMIN_URL_PREFIX = '/admin'; // Admin routes now use a path prefix instead of separate domain

// Security settings
export const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key';
export const COOKIE_SECURE = IS_PRODUCTION;
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// CORS configuration
export const CORS_ORIGINS = IS_DEVELOPMENT 
  ? ['http://localhost:5000', 'http://0.0.0.0:5000'] 
  : (process.env.ALLOWED_ORIGINS?.split(',') || []);

// API configuration
export const API_TOKEN = process.env.API_TOKEN;

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL;

// Export environment object for convenience
export const ENV = {
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  PORT,
  BOT_PORT,
  VITE_PORT,
  HOST,
  APP_URL,
  ADMIN_URL_PREFIX,
  SESSION_SECRET,
  COOKIE_SECURE,
  COOKIE_MAX_AGE,
  CORS_ORIGINS,
  API_TOKEN,
  DATABASE_URL,
};