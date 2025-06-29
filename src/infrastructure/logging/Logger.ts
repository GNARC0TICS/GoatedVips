import winston from 'winston';
import { format } from 'winston';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
}

// Log context interface
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

// Custom format for structured logging
const structuredFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  format.errors({ stack: true }),
  format.json(),
  format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    const logEntry = {
      timestamp,
      level,
      message,
      service: 'goated-vips-api',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      ...meta,
    };
    
    return JSON.stringify(logEntry);
  })
);

// Development format for console
const developmentFormat = format.combine(
  format.colorize(),
  format.timestamp({
    format: 'HH:mm:ss',
  }),
  format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

export class Logger {
  private winston: winston.Logger;
  private isDevelopment: boolean;

  constructor(options: {
    level?: string;
    service?: string;
    enableFile?: boolean;
    enableConsole?: boolean;
  } = {}) {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    const transports: winston.transport[] = [];
    
    // Console transport
    if (options.enableConsole !== false) {
      transports.push(
        new winston.transports.Console({
          format: this.isDevelopment ? developmentFormat : structuredFormat,
        })
      );
    }
    
    // File transports (for production)
    if (options.enableFile && !this.isDevelopment) {
      // Combined log
      transports.push(
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: structuredFormat,
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        })
      );
      
      // Error log
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: structuredFormat,
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        })
      );
    }
    
    this.winston = winston.createLogger({
      level: options.level || (this.isDevelopment ? 'debug' : 'info'),
      transports,
      // Don't exit on handled exceptions
      exitOnError: false,
    });
  }

  private formatMessage(message: string, context?: LogContext): any {
    return {
      message,
      ...context,
    };
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    const logData = this.formatMessage(message, context);
    
    if (error) {
      if (error instanceof Error) {
        logData.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else {
        logData.error = error;
      }
    }
    
    this.winston.error(logData);
  }

  warn(message: string, context?: LogContext): void {
    this.winston.warn(this.formatMessage(message, context));
  }

  info(message: string, context?: LogContext): void {
    this.winston.info(this.formatMessage(message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.winston.debug(this.formatMessage(message, context));
  }

  // Security event logging
  security(event: string, context: LogContext & {
    severity: 'low' | 'medium' | 'high' | 'critical';
    threat?: string;
    action?: string;
  }): void {
    this.winston.warn(this.formatMessage(`SECURITY: ${event}`, {
      ...context,
      category: 'security',
    }));
  }

  // Business event logging
  business(event: string, context?: LogContext): void {
    this.winston.info(this.formatMessage(`BUSINESS: ${event}`, {
      ...context,
      category: 'business',
    }));
  }
}

// Singleton logger instance
let logger: Logger;

export function getLogger(options?: any): Logger {
  if (!logger) {
    logger = new Logger(options);
  }
  return logger;
}