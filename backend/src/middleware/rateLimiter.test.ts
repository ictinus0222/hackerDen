import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { createRateLimiter, rateLimiters, createWebSocketRateLimiter } from './rateLimiter.js';

describe('Rate Limiter Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      method: 'GET',
      originalUrl: '/api/test'
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      statusCode: 200,
      send: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createRateLimiter', () => {
    it('should allow requests within limit', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, max: 5 });

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      }

      expect(mockNext).toHaveBeenCalledTimes(3);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should block requests exceeding limit', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, max: 2 });

      // Make 3 requests (should block the 3rd)
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
            details: expect.objectContaining({
              limit: 2,
              windowMs: 60000,
              retryAfter: expect.any(Number)
            })
          })
        })
      );
    });

    it('should set rate limit headers', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, max: 5 });

      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'RateLimit-Limit': '5',
          'RateLimit-Remaining': '4',
          'RateLimit-Reset': expect.any(String),
          'RateLimit-Policy': '5;w=60',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '4',
          'X-RateLimit-Reset': expect.any(String)
        })
      );
    });

    it('should use custom key generator', () => {
      const keyGenerator = vi.fn().mockReturnValue('custom-key');
      const rateLimiter = createRateLimiter({ 
        windowMs: 60000, 
        max: 2,
        keyGenerator 
      });

      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(keyGenerator).toHaveBeenCalledWith(mockReq);
    });

    it('should skip rate limiting when skip function returns true', () => {
      const skip = vi.fn().mockReturnValue(true);
      const rateLimiter = createRateLimiter({ 
        windowMs: 60000, 
        max: 1,
        skip 
      });

      // Make multiple requests that would normally be blocked
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(skip).toHaveBeenCalledTimes(2);
      expect(mockNext).toHaveBeenCalledTimes(2);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should call onLimitReached callback when limit is exceeded', () => {
      const onLimitReached = vi.fn();
      const rateLimiter = createRateLimiter({ 
        windowMs: 60000, 
        max: 1,
        onLimitReached 
      });

      // Make 2 requests (should trigger callback on 2nd)
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(onLimitReached).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('should handle skipSuccessfulRequests option', () => {
      const rateLimiter = createRateLimiter({ 
        windowMs: 60000, 
        max: 2,
        skipSuccessfulRequests: true 
      });

      // Mock successful response
      mockRes.statusCode = 200;
      const originalSend = mockRes.send;
      
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate successful response
      if (mockRes.send !== originalSend) {
        (mockRes.send as any)('success');
      }

      // Make another request - should not be counted due to skipSuccessfulRequests
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(3);
    });

    it('should handle skipFailedRequests option', () => {
      const rateLimiter = createRateLimiter({ 
        windowMs: 60000, 
        max: 2,
        skipFailedRequests: true 
      });

      // Mock failed response
      mockRes.statusCode = 400;
      const originalSend = mockRes.send;
      
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate failed response
      if (mockRes.send !== originalSend) {
        (mockRes.send as any)('error');
      }

      // Make more requests - failed request should not be counted
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(3);
    });

    it('should reset counter after window expires', async () => {
      const rateLimiter = createRateLimiter({ windowMs: 10, max: 1 }); // 10ms window

      // Make request that reaches limit
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(429);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 15));

      // Reset mocks
      vi.clearAllMocks();

      // Should allow request again
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle different IPs separately', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, max: 1 });

      // First IP
      mockReq.ip = '127.0.0.1';
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(429);

      // Reset mocks
      vi.clearAllMocks();

      // Different IP should not be affected
      mockReq.ip = '192.168.1.1';
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should set Retry-After header when limit exceeded', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, max: 1 });

      rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
    });

    it('should disable standard headers when option is false', () => {
      const rateLimiter = createRateLimiter({ 
        windowMs: 60000, 
        max: 5,
        standardHeaders: false 
      });

      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.not.objectContaining({
          'RateLimit-Limit': expect.any(String)
        })
      );
    });

    it('should disable legacy headers when option is false', () => {
      const rateLimiter = createRateLimiter({ 
        windowMs: 60000, 
        max: 5,
        legacyHeaders: false 
      });

      rateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.not.objectContaining({
          'X-RateLimit-Limit': expect.any(String)
        })
      );
    });
  });

  describe('predefined rateLimiters', () => {
    it('should have general rate limiter', () => {
      expect(rateLimiters.general).toBeDefined();
      expect(typeof rateLimiters.general).toBe('function');
    });

    it('should have auth rate limiter', () => {
      expect(rateLimiters.auth).toBeDefined();
      expect(typeof rateLimiters.auth).toBe('function');
    });

    it('should have creation rate limiter', () => {
      expect(rateLimiters.creation).toBeDefined();
      expect(typeof rateLimiters.creation).toBe('function');
    });

    it('should have heavy operations rate limiter', () => {
      expect(rateLimiters.heavy).toBeDefined();
      expect(typeof rateLimiters.heavy).toBe('function');
    });

    it('should create per-project rate limiter', () => {
      const projectLimiter = rateLimiters.perProject('test-project-id');
      expect(typeof projectLimiter).toBe('function');
    });
  });

  describe('createWebSocketRateLimiter', () => {
    let mockSocket: any;
    let mockNext: (err?: Error) => void;

    beforeEach(() => {
      mockSocket = {
        handshake: {
          address: '127.0.0.1'
        }
      };
      mockNext = vi.fn();
    });

    it('should allow WebSocket connections within limit', () => {
      const wsRateLimiter = createWebSocketRateLimiter({ windowMs: 60000, max: 5 });

      // Make 3 connections
      for (let i = 0; i < 3; i++) {
        wsRateLimiter(mockSocket, mockNext);
      }

      expect(mockNext).toHaveBeenCalledTimes(3);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block WebSocket connections exceeding limit', () => {
      const wsRateLimiter = createWebSocketRateLimiter({ windowMs: 60000, max: 2 });

      // Make 3 connections (should block the 3rd)
      wsRateLimiter(mockSocket, mockNext);
      wsRateLimiter(mockSocket, mockNext);
      wsRateLimiter(mockSocket, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(3);
      expect(mockNext).toHaveBeenNthCalledWith(1);
      expect(mockNext).toHaveBeenNthCalledWith(2);
      expect(mockNext).toHaveBeenNthCalledWith(3, expect.any(Error));

      const error = (mockNext as any).mock.calls[2][0];
      expect(error.message).toBe('Rate limit exceeded for WebSocket connection');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should use custom key generator for WebSocket', () => {
      const keyGenerator = vi.fn().mockReturnValue('custom-ws-key');
      const wsRateLimiter = createWebSocketRateLimiter({ 
        windowMs: 60000, 
        max: 2,
        keyGenerator 
      });

      wsRateLimiter(mockSocket, mockNext);

      expect(keyGenerator).toHaveBeenCalledWith(mockSocket);
    });

    it('should handle missing handshake address', () => {
      mockSocket.handshake = {};
      const wsRateLimiter = createWebSocketRateLimiter({ windowMs: 60000, max: 1 });

      wsRateLimiter(mockSocket, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});