import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
  requestId?: string;
}

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Creates a custom error with additional properties
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

/**
 * Determines if an error should be logged as an error or warning
 */
const shouldLogAsError = (statusCode: number): boolean => {
  return statusCode >= 500;
};

/**
 * Sanitizes error details for production to avoid leaking sensitive information
 */
const sanitizeErrorDetails = (details: any, isProduction: boolean): any => {
  if (!isProduction) {
    return details;
  }
  
  // In production, only return safe error details
  if (details && typeof details === 'object') {
    const safeDetails: any = {};
    const safeKeys = ['field', 'path', 'code', 'expected', 'received', 'minimum', 'maximum'];
    
    for (const key of safeKeys) {
      if (key in details) {
        safeDetails[key] = details[key];
      }
    }
    
    return Object.keys(safeDetails).length > 0 ? safeDetails : undefined;
  }
  
  return undefined;
};

/**
 * Main error handling middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;

  // Log the error with context
  const errorContext = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    params: req.params,
    query: req.query,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    }
  };

  // Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid input data';
    details = error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      received: issue.received
    }));
    
    logger.warn('Validation error', { ...errorContext, validationIssues: details });
  }
  // Custom application errors
  else if (error.statusCode && error.code) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
    
    if (shouldLogAsError(statusCode)) {
      logger.error('Application error', errorContext);
    } else {
      logger.warn('Application error', errorContext);
    }
  }
  // MongoDB errors
  else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    // Duplicate key error
    if (error.code === 11000) {
      statusCode = 409;
      errorCode = 'DUPLICATE_ERROR';
      message = 'Resource already exists';
      details = error.keyValue;
      
      logger.warn('MongoDB duplicate key error', { ...errorContext, keyValue: error.keyValue });
    }
    // Other MongoDB errors
    else {
      statusCode = 500;
      errorCode = 'DATABASE_ERROR';
      message = isProduction ? 'Database operation failed' : error.message;
      
      logger.error('MongoDB error', errorContext);
    }
  }
  // MongoDB cast errors (invalid ObjectId, etc.)
  else if (error.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid resource ID format';
    details = { path: error.path, value: error.value, kind: error.kind };
    
    logger.warn('MongoDB cast error', { ...errorContext, castError: details });
  }
  // Mongoose validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Data validation failed';
    details = Object.values(error.errors).map((err: any) => ({
      path: err.path,
      message: err.message,
      kind: err.kind,
      value: err.value
    }));
    
    logger.warn('Mongoose validation error', { ...errorContext, validationErrors: details });
  }
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
    
    logger.warn('JWT error', errorContext);
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
    
    logger.warn('JWT expired error', errorContext);
  }
  // Multer errors (file upload)
  else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorCode = 'FILE_TOO_LARGE';
    message = 'File size exceeds the allowed limit';
    
    logger.warn('File upload size error', errorContext);
  }
  else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    errorCode = 'UNEXPECTED_FILE';
    message = 'Unexpected file field';
    
    logger.warn('File upload field error', errorContext);
  }
  // Syntax errors (malformed JSON, etc.)
  else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON';
    message = 'Invalid JSON in request body';
    
    logger.warn('JSON syntax error', errorContext);
  }
  // Default server errors
  else {
    statusCode = error.statusCode || 500;
    errorCode = 'INTERNAL_ERROR';
    message = isProduction ? 'Internal server error' : error.message;
    
    logger.error('Unhandled error', errorContext);
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details: sanitizeErrorDetails(details, isProduction)
    },
    timestamp: new Date(),
    requestId
  };

  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  logger.warn('Route not found', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    },
    timestamp: new Date(),
    requestId
  };

  res.status(404).json(errorResponse);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request ID middleware to track requests
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.headers['x-request-id'] = requestId;
  res.set('X-Request-ID', requestId);
  
  next();
};