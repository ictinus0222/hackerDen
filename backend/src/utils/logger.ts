interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

type LogLevelName = keyof LogLevel;

interface LogEntry {
  timestamp: string;
  level: LogLevelName;
  message: string;
  data?: any;
  requestId?: string;
  userId?: string;
  projectId?: string;
}

class Logger {
  private logLevel: number;
  private isDevelopment: boolean;

  constructor() {
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevelName;
    this.logLevel = LOG_LEVELS[envLogLevel] ?? LOG_LEVELS.INFO;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private shouldLog(level: LogLevelName): boolean {
    return LOG_LEVELS[level] <= this.logLevel;
  }

  private formatMessage(level: LogLevelName, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    
    if (this.isDevelopment) {
      // Pretty format for development
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[90m'  // Gray
      };
      const reset = '\x1b[0m';
      
      let formatted = `${colors[level]}[${timestamp}] ${level}${reset}: ${message}`;
      
      if (data) {
        formatted += `\n${colors[level]}Data:${reset} ${JSON.stringify(data, null, 2)}`;
      }
      
      return formatted;
    } else {
      // JSON format for production
      const logEntry: LogEntry = {
        timestamp,
        level,
        message,
        ...(data && { data })
      };
      
      return JSON.stringify(logEntry);
    }
  }

  private log(level: LogLevelName, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formatted = this.formatMessage(level, message, data);
    
    if (level === 'ERROR') {
      console.error(formatted);
    } else if (level === 'WARN') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  error(message: string, data?: any): void {
    this.log('ERROR', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  /**
   * Logs HTTP requests for monitoring
   */
  logRequest(req: any, res: any, responseTime?: number): void {
    const requestData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      requestId: req.headers['x-request-id'],
      contentLength: res.get('Content-Length')
    };

    if (res.statusCode >= 400) {
      this.warn(`HTTP ${res.statusCode} - ${req.method} ${req.originalUrl}`, requestData);
    } else {
      this.info(`HTTP ${res.statusCode} - ${req.method} ${req.originalUrl}`, requestData);
    }
  }

  /**
   * Logs database operations for monitoring
   */
  logDatabase(operation: string, collection: string, data?: any): void {
    this.debug(`Database ${operation} on ${collection}`, data);
  }

  /**
   * Logs WebSocket events
   */
  logWebSocket(event: string, socketId: string, data?: any): void {
    this.debug(`WebSocket ${event} - Socket: ${socketId}`, data);
  }

  /**
   * Logs authentication events
   */
  logAuth(event: string, data?: any): void {
    this.info(`Auth ${event}`, data);
  }

  /**
   * Logs performance metrics
   */
  logPerformance(operation: string, duration: number, data?: any): void {
    const level = duration > 1000 ? 'WARN' : 'INFO'; // Warn if operation takes more than 1 second
    this.log(level, `Performance: ${operation} took ${duration}ms`, data);
  }
}

// Create singleton logger instance
export const logger = new Logger();

/**
 * Express middleware for request logging
 */
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // Log request start
  logger.debug(`Request started: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id']
  });

  // Override res.end to log when response is sent
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
    originalEnd.call(res, chunk, encoding);
  };

  next();
};

/**
 * Performance monitoring decorator for functions
 */
export const withPerformanceLogging = <T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T => {
  return ((...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then((value) => {
            const duration = Date.now() - startTime;
            logger.logPerformance(operationName, duration);
            return value;
          })
          .catch((error) => {
            const duration = Date.now() - startTime;
            logger.logPerformance(`${operationName} (failed)`, duration, { error: error.message });
            throw error;
          });
      }
      
      // Handle sync functions
      const duration = Date.now() - startTime;
      logger.logPerformance(operationName, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(`${operationName} (failed)`, duration, { error: (error as Error).message });
      throw error;
    }
  }) as T;
};