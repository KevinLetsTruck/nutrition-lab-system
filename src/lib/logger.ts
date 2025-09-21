type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV !== 'production';

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    // In production, only log warnings and errors
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return;
    }

    // Format the log message
    const timestamp = entry.timestamp.toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` Error: ${error.message}` : '';
    
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}${errorStr}`;

    // Use appropriate console method
    switch (level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        if (error?.stack) {
          console.error(error.stack);
        }
        break;
    }

    // In production, you might want to send errors to a logging service
    if (!this.isDevelopment && level === 'error') {
      // TODO: Send to logging service (e.g., Sentry, LogRocket, etc.)
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  // API request logging
  logApiRequest(method: string, path: string, userId?: string, duration?: number): void {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      userId,
      duration: duration ? `${duration.toFixed(2)}ms` : undefined,
    });
  }

  // Database query logging
  logDbQuery(query: string, duration?: number): void {
    if (this.isDevelopment) {
      this.debug(`DB Query: ${query}`, {
        duration: duration ? `${duration.toFixed(2)}ms` : undefined,
      });
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, any>) => logger.error(message, error, context),
  api: (method: string, path: string, userId?: string, duration?: number) => logger.logApiRequest(method, path, userId, duration),
  db: (query: string, duration?: number) => logger.logDbQuery(query, duration),
};
