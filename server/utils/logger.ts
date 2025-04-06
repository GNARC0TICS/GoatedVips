/**
 * Enhanced logging utility for the application
 * Provides standardized logging with level-based filtering and formatting
 */

// For simplicity, we're using console.log/error as the base logging mechanism
// In a production environment, this would be replaced with a more robust solution

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Log a message with an optional level and source
 * 
 * @param message - The message or object to log
 * @param levelOrSource - Either a log level or source identifier
 * @param source - The source of the log (component, module, etc)
 */
export function log(message: string | object, levelOrSource: LogLevel | string = 'info', source?: string): void {
  // Determine the level and source
  let level: LogLevel = 'info';
  
  if (levelOrSource === 'info' || levelOrSource === 'warn' || levelOrSource === 'error' || levelOrSource === 'debug') {
    level = levelOrSource;
  } else if (typeof levelOrSource === 'string') {
    source = levelOrSource;
  }
  
  // Format the log message
  const timestamp = new Date().toISOString();
  const sourceStr = source ? `[${source}]` : '';
  const levelStr = `[${level.toUpperCase()}]`;
  const prefix = `${timestamp} ${levelStr} ${sourceStr}`;
  
  // Determine the output method based on level
  let outputFn = console.log;
  if (level === 'warn') {
    outputFn = console.warn;
  } else if (level === 'error') {
    outputFn = console.error;
  }
  
  // Log the message
  if (typeof message === 'string') {
    outputFn(`${prefix} ${message}`);
  } else {
    outputFn(`${prefix} Object:`, message);
  }
}

// Export convenience methods
export const logInfo = (message: string | object, source?: string) => log(message, 'info', source);
export const logWarn = (message: string | object, source?: string) => log(message, 'warn', source);
export const logError = (message: string | object, source?: string) => log(message, 'error', source);
export const logDebug = (message: string | object, source?: string) => log(message, 'debug', source);

export default log;