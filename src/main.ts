#!/usr/bin/env node
/**
 * Main entry point for Goombas x Goated VIPs v2.0
 * 
 * This is a complete rewrite with:
 * - Domain-driven design architecture
 * - Secure authentication with JWT
 * - Redis caching and session management
 * - Comprehensive logging and monitoring
 * - Type-safe API with Zod validation
 * - Optimized database schema
 */

import 'dotenv/config';
import { APIServer } from './api/server';
import { getLogger } from './infrastructure/logging/Logger';
import { getMetricsCollector } from './infrastructure/monitoring/MetricsCollector';
import { MockEmailService } from './infrastructure/email/MockEmailService';

// Initialize logger
const logger = getLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  enableFile: process.env.NODE_ENV === 'production',
});

// Configuration from environment
const config = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/goombas_vips_v2',
  
  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379'),
  redisPassword: process.env.REDIS_PASSWORD,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  
  // Email service (mock for now)
  emailService: new MockEmailService(),
};

// Validate critical configuration
function validateConfig() {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    logger.error('Missing required environment variables', undefined, {
      missing,
      environment: process.env.NODE_ENV,
    });
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('Running in development mode with default values');
    }
  }
  
  // Warn about insecure defaults in production
  if (process.env.NODE_ENV === 'production') {
    const insecureDefaults = [];
    
    if (config.jwtSecret === 'dev-secret-change-in-production') {
      insecureDefaults.push('JWT_SECRET');
    }
    
    if (config.jwtRefreshSecret === 'dev-refresh-secret-change-in-production') {
      insecureDefaults.push('JWT_REFRESH_SECRET');
    }
    
    if (insecureDefaults.length > 0) {
      logger.security('Insecure configuration detected in production', {
        severity: 'critical',
        variables: insecureDefaults,
        threat: 'Authentication bypass possible',
        action: 'Set secure values for production',
      });
    }
  }
}

// Main startup function
async function main() {
  try {
    logger.info('Starting Goombas x Goated VIPs v2.0', {
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      pid: process.pid,
    });
    
    // Validate configuration
    validateConfig();
    
    // Initialize metrics collector
    const metricsCollector = getMetricsCollector();
    logger.info('Metrics collector initialized');
    
    // Create and start server
    const server = new APIServer(config);
    await server.start();
    
    // Log successful startup
    logger.info('Server started successfully', {
      port: config.port,
      host: config.host,
      environment: process.env.NODE_ENV,
    });
    
    // Business event
    logger.business('Application started', {
      version: '2.0.0',
      port: config.port,
    });
    
  } catch (error: any) {
    logger.error('Failed to start server', error, {
      stack: error.stack,
      config: {
        port: config.port,
        host: config.host,
        environment: process.env.NODE_ENV,
      },
    });
    
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, starting graceful shutdown');
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, starting graceful shutdown');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', reason as Error, {
    promise: promise.toString(),
  });
  process.exit(1);
});

// Start the application
main().catch((error) => {
  logger.error('Application startup failed', error);
  process.exit(1);
});