
// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Basic logging function
export function log(message: string, source = "express", level: LogLevel = 'info'): void {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  switch (level) {
    case 'debug':
      console.debug(`${formattedTime} [${source}] ${message}`);
      break;
    case 'info':
      console.log(`${formattedTime} [${source}] ${message}`);
      break;
    case 'warn':
      console.warn(`${formattedTime} [${source}] ${message}`);
      break;
    case 'error':
      console.error(`${formattedTime} [${source}] ${message}`);
      break;
    default:
      console.log(`${formattedTime} [${source}] ${message}`);
  }
}

// Logger interface for structured use
export const logger = {
  debug: (message: string, source = "express") => log(message, source, 'debug'),
  info: (message: string, source = "express") => log(message, source, 'info'),
  warn: (message: string, source = "express") => log(message, source, 'warn'),
  error: (message: any, errorObj?: any) => {
    const source = "express";
    const errorMessage = errorObj ? `${message}: ${errorObj.message || JSON.stringify(errorObj)}` : message;
    log(errorMessage, source, 'error');
    
    // If we have a stack trace, log it at debug level
    if (errorObj && errorObj.stack) {
      log(`Stack: ${errorObj.stack}`, source, 'debug');
    }
  }
};
