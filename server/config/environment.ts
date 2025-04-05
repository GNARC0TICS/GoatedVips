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
// For Replit environments, ensure we use the REPLIT_DOMAINS 
export const PORT = parseInt(process.env.PORT || '5000', 10);
export const BOT_PORT = parseInt(process.env.BOT_PORT || '5001', 10);
export const VITE_PORT = parseInt(process.env.VITE_PORT || '5173', 10);
export const HOST = process.env.HOST || '0.0.0.0';
export const REPLIT_DOMAIN = process.env.REPLIT_DOMAINS || '';

// Security settings
export const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key';
export const COOKIE_SECURE = IS_PRODUCTION;
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// CORS configuration
export const IS_REPLIT = process.env.REPL_ID !== undefined;
export const CORS_ORIGINS = IS_DEVELOPMENT || IS_REPLIT
  ? ['http://localhost:5000', 'http://0.0.0.0:5000', 'https://*.replit.app', 'https://*.repl.co', '*'] 
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
  REPLIT_DOMAIN,
  IS_REPLIT,
  SESSION_SECRET,
  COOKIE_SECURE,
  COOKIE_MAX_AGE,
  CORS_ORIGINS,
  API_TOKEN,
  DATABASE_URL,
};