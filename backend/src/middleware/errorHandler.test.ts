import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { 
  errorHandler, 
  notFoundHandler, 
  createError, 
  requestIdMiddleware, 
  asyncHandler 
} from './errorHandler.js';

// Mock the logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      headers: { 'x-request-id': 'test-request-123' },
      body: { test: 'data' },
      params: {},
      query: {},
      get: vi.fn().mockReturnValue('test-user-agent')
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
    
    // Reset environment
    process.env.NODE_ENV = 'test';
  });

  describe('createError', () => {
    it('should create error with default values', () => {
      const error = createError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with custom values', () => {
      const error = createError('Test error', 400, 'TEST_ERROR', { field: 'value' });
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'value' });
    });
  });

  describe('errorHandler', () => {
    it('should handle Zod validation errors', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number'
        }
      ]);

      errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: expect.arrayContaining([
              expect.objectContaining({
                path: 'name',
                message: 'Expected string, received number',
                code: 'invalid_type',
                received: 'number'
              })
            ])
          }),
          timestamp: expect.any(Date),
          requestId: 'test-request-123'
        })
      );
    });

    it('should handle custom application errors', () => {
      const customError = createError('Custom error', 404, 'RESOURCE_NOT_FOUND', { id: '123' });

      errorHandler(customError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'RESOURCE_NOT_FOUND',
            message: 'Custom error',
            details: { id: '123' }
          })
        })
      );
    });

    it('should handle MongoDB duplicate key errors', () => {
      const mongoError = {
        name: 'MongoError',
        code: 11000,
        keyValue: { email: 'test@example.com' }
      };

      errorHandler(mongoError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'DUPLICATE_ERROR',
            message: 'Resource already exists',
            details: { email: 'test@example.com' }
          })
        })
      );
    });

    it('should handle MongoDB cast errors', () => {
      const castError = {
        name: 'CastError',
        path: '_id',
        value: 'invalid-id',
        kind: 'ObjectId'
      };

      errorHandler(castError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_ID',
            message: 'Invalid resource ID format'
          })
        })
      );
    });

    it('should handle Mongoose validation errors', () => {
      const validationError = {
        name: 'ValidationError',
        errors: {
          name: {
            path: 'name',
            message: 'Name is required',
            kind: 'required',
            value: undefined
          },
          email: {
            path: 'email',
            message: 'Invalid email format',
            kind: 'format',
            value: 'invalid-email'
          }
        }
      };

      errorHandler(validationError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Data validation failed',
            details: expect.arrayContaining([
              expect.objectContaining({
                path: 'name',
                message: 'Name is required',
                kind: 'required'
              }),
              expect.objectContaining({
                path: 'email',
                message: 'Invalid email format',
                kind: 'format'
              })
            ])
          })
        })
      );
    });

    it('should handle JWT errors', () => {
      const jwtError = {
        name: 'JsonWebTokenError',
        message: 'invalid token'
      };

      errorHandler(jwtError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_TOKEN',
            message: 'Invalid authentication token'
          })
        })
      );
    });

    it('should handle JWT expired errors', () => {
      const expiredError = {
        name: 'TokenExpiredError',
        message: 'jwt expired'
      };

      errorHandler(expiredError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired'
          })
        })
      );
    });

    it('should handle file upload errors', () => {
      const fileSizeError = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large'
      };

      errorHandler(fileSizeError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds the allowed limit'
          })
        })
      );
    });

    it('should handle JSON syntax errors', () => {
      const syntaxError = new SyntaxError('Unexpected token in JSON');
      (syntaxError as any).body = true;

      errorHandler(syntaxError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'MALFORMED_JSON',
            message: 'Invalid JSON in request body'
          })
        })
      );
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Unknown error');

      errorHandler(unknownError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
            message: 'Unknown error' // In test environment, shows actual message
          })
        })
      );
    });

    it('should sanitize error details in production', () => {
      process.env.NODE_ENV = 'production';
      
      const customError = createError('Test error', 400, 'TEST_ERROR', {
        sensitiveData: 'secret',
        field: 'safe',
        password: 'hidden'
      });

      errorHandler(customError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: { field: 'safe' } // Only safe fields should remain
          })
        })
      );
    });

    it('should set security headers', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      });
    });

    it('should generate request ID if not present', () => {
      mockReq.headers = {};

      const error = new Error('Test error');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'unknown'
        })
      );
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with proper error format', () => {
      mockReq.method = 'GET';
      mockReq.originalUrl = '/api/non-existent';

      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: 'Route GET /api/non-existent not found'
          }),
          timestamp: expect.any(Date),
          requestId: 'test-request-123'
        })
      );
    });
  });

  describe('requestIdMiddleware', () => {
    it('should use existing request ID', () => {
      mockReq.headers = { 'x-request-id': 'existing-id' };

      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.headers['x-request-id']).toBe('existing-id');
      expect(mockRes.set).toHaveBeenCalledWith('X-Request-ID', 'existing-id');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate new request ID if not present', () => {
      mockReq.headers = {};

      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(mockRes.set).toHaveBeenCalledWith('X-Request-ID', mockReq.headers['x-request-id']);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async functions', async () => {
      const asyncFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch and forward async errors', async () => {
      const error = new Error('Async error');
      const asyncFn = vi.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle sync functions that return promises', async () => {
      const syncFn = vi.fn().mockReturnValue(Promise.resolve('success'));
      const wrappedFn = asyncHandler(syncFn);

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(syncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});