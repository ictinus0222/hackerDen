import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ErrorResponse } from './errorHandler.js';

/**
 * Middleware factory for validating request data using Zod schemas
 */
export const validateRequest = (schema: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate request parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues.map(issue => ({
              path: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
              received: (issue as any).received
            }))
          },
          timestamp: new Date()
        };
        
        return res.status(400).json(errorResponse);
      }
      
      next(error);
    }
  };
};

/**
 * Common validation schemas for request parameters
 */
export const commonSchemas = {
  // MongoDB ObjectId validation
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
  
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Pagination parameters
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional()
  }),
  
  // Common string validations
  nonEmptyString: z.string().min(1, 'Field cannot be empty'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  
  // Date validation
  isoDate: z.string().datetime('Invalid ISO date format').transform(str => new Date(str))
};

/**
 * Sanitizes input data by trimming strings and removing potentially harmful content
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Trim whitespace and remove null bytes
      return obj.trim().replace(/\0/g, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip potentially dangerous keys
        if (!key.startsWith('__') && !key.startsWith('$')) {
          sanitized[key] = sanitizeObject(value);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Only sanitize body for POST/PUT/PATCH requests
  if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.body = sanitizeObject(req.body);
  }
  
  // For query parameters, we need to be more careful as they might be read-only
  if (req.query && Object.keys(req.query).length > 0) {
    try {
      const sanitizedQuery = sanitizeObject(req.query);
      // Only assign if we can modify the query object
      Object.assign(req.query, sanitizedQuery);
    } catch (error) {
      // If we can't modify query, skip sanitization for query params
      // The validation middleware will catch any issues
    }
  }
  
  next();
};

/**
 * Validates content-type for POST/PUT requests
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json'
        },
        timestamp: new Date()
      };
      
      return res.status(415).json(errorResponse);
    }
  }
  
  next();
};

/**
 * Validates request size to prevent large payloads
 */
export const validateRequestSize = (maxSize: number = 1024 * 1024) => { // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request payload too large. Maximum size is ${maxSize} bytes`
        },
        timestamp: new Date()
      };
      
      return res.status(413).json(errorResponse);
    }
    
    next();
  };
};