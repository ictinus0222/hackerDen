import type { Request, Response, NextFunction } from 'express';
import type { ErrorResponse } from './errorHandler.js';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

const store: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60000); // Clean up every minute

/**
 * Creates a rate limiting middleware with configurable options
 */
export const createRateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later',
    standardHeaders = true,
    legacyHeaders = true,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skip = () => false,
    onLimitReached
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting if skip function returns true
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    
    // Clean up expired entry for this key
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
    
    // Initialize or increment counter
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      };
    } else {
      store[key].count++;
    }
    
    const current = store[key];
    const remaining = Math.max(0, max - current.count);
    const resetTime = new Date(current.resetTime);
    
    // Add rate limit headers
    if (standardHeaders) {
      res.set({
        'RateLimit-Limit': max.toString(),
        'RateLimit-Remaining': remaining.toString(),
        'RateLimit-Reset': Math.ceil(current.resetTime / 1000).toString(),
        'RateLimit-Policy': `${max};w=${Math.ceil(windowMs / 1000)}`
      });
    }
    
    if (legacyHeaders) {
      res.set({
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toISOString()
      });
    }
    
    // Check if limit exceeded
    if (current.count > max) {
      if (onLimitReached) {
        onLimitReached(req, res);
      }
      
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          details: {
            limit: max,
            windowMs,
            retryAfter: Math.ceil((current.resetTime - now) / 1000)
          }
        },
        timestamp: new Date()
      };
      
      res.set('Retry-After', Math.ceil((current.resetTime - now) / 1000).toString());
      return res.status(429).json(errorResponse);
    }
    
    // Handle response tracking for skip options
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalSend = res.send;
      res.send = function(body) {
        const shouldSkip = (
          (skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400)
        );
        
        if (shouldSkip && store[key]) {
          store[key].count--;
        }
        
        return originalSend.call(this, body);
      };
    }
    
    next();
  };
};

/**
 * Predefined rate limiters for different use cases
 */
export const rateLimiters = {
  // General API rate limiting
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later'
  }),
  
  // Strict rate limiting for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true
  }),
  
  // Rate limiting for resource creation
  creation: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 creations per minute
    message: 'Too many creation requests, please slow down'
  }),
  
  // Rate limiting for file uploads or heavy operations
  heavy: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 heavy operations per minute
    message: 'Too many heavy operations, please wait before trying again'
  }),
  
  // Rate limiting per project (for project-specific operations)
  perProject: (projectId: string) => createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 requests per project per minute
    keyGenerator: (req: Request) => `${req.ip}:${projectId}`,
    message: 'Too many requests for this project, please slow down'
  })
};

/**
 * Rate limiter specifically for WebSocket connections
 */
export const createWebSocketRateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 60, // 60 events per minute
    keyGenerator = (req: any) => req.handshake?.address || 'unknown'
  } = options;

  return (socket: any, next: (err?: Error) => void) => {
    const key = keyGenerator(socket);
    const now = Date.now();
    
    // Clean up expired entry
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
    
    // Initialize or increment counter
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      };
    } else {
      store[key].count++;
    }
    
    // Check if limit exceeded
    if (store[key].count > max) {
      const error = new Error('Rate limit exceeded for WebSocket connection');
      (error as any).code = 'RATE_LIMIT_EXCEEDED';
      return next(error);
    }
    
    next();
  };
};