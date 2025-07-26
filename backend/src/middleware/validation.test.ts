import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  validateRequest, 
  commonSchemas, 
  sanitizeInput, 
  validateContentType, 
  validateRequestSize 
} from './validation.js';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      method: 'POST',
      get: vi.fn()
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe('validateRequest', () => {
    it('should validate request body successfully', () => {
      const schema = {
        body: z.object({
          name: z.string().min(1),
          age: z.number().min(0)
        })
      };

      mockReq.body = { name: 'John', age: 25 };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.body).toEqual({ name: 'John', age: 25 });
    });

    it('should validate request params successfully', () => {
      const schema = {
        params: z.object({
          id: z.string().uuid()
        })
      };

      mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate request query successfully', () => {
      const schema = {
        query: z.object({
          page: z.string().regex(/^\d+$/).transform(Number),
          limit: z.string().regex(/^\d+$/).transform(Number).optional()
        })
      };

      mockReq.query = { page: '1', limit: '10' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.query).toEqual({ page: 1, limit: 10 });
    });

    it('should return 400 for invalid body data', () => {
      const schema = {
        body: z.object({
          name: z.string().min(1),
          age: z.number().min(0)
        })
      };

      mockReq.body = { name: '', age: -1 };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: expect.arrayContaining([
              expect.objectContaining({
                path: 'name',
                message: expect.any(String)
              }),
              expect.objectContaining({
                path: 'age',
                message: expect.any(String)
              })
            ])
          })
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid params', () => {
      const schema = {
        params: z.object({
          id: z.string().uuid()
        })
      };

      mockReq.params = { id: 'invalid-uuid' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle non-Zod errors', () => {
      const schema = {
        body: {
          parse: vi.fn().mockImplementation(() => {
            throw new Error('Non-Zod error');
          })
        } as any
      };

      mockReq.body = { test: 'data' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('commonSchemas', () => {
    it('should validate MongoDB ObjectId', () => {
      const validId = '507f1f77bcf86cd799439011';
      const invalidId = 'invalid-id';

      expect(() => commonSchemas.mongoId.parse(validId)).not.toThrow();
      expect(() => commonSchemas.mongoId.parse(invalidId)).toThrow();
    });

    it('should validate UUID', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const invalidUuid = 'invalid-uuid';

      expect(() => commonSchemas.uuid.parse(validUuid)).not.toThrow();
      expect(() => commonSchemas.uuid.parse(invalidUuid)).toThrow();
    });

    it('should validate pagination parameters', () => {
      const validPagination = { page: '1', limit: '10' };
      const invalidPagination = { page: '0', limit: '101' };

      expect(() => commonSchemas.pagination.parse(validPagination)).not.toThrow();
      expect(() => commonSchemas.pagination.parse(invalidPagination)).toThrow();
    });

    it('should validate email format', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';

      expect(() => commonSchemas.email.parse(validEmail)).not.toThrow();
      expect(() => commonSchemas.email.parse(invalidEmail)).toThrow();
    });

    it('should validate URL format', () => {
      const validUrl = 'https://example.com';
      const invalidUrl = 'not-a-url';

      expect(() => commonSchemas.url.parse(validUrl)).not.toThrow();
      expect(() => commonSchemas.url.parse(invalidUrl)).toThrow();
    });

    it('should validate and transform ISO date', () => {
      const validDate = '2023-01-01T00:00:00.000Z';
      const invalidDate = 'invalid-date';

      const result = commonSchemas.isoDate.parse(validDate);
      expect(result).toBeInstanceOf(Date);
      expect(() => commonSchemas.isoDate.parse(invalidDate)).toThrow();
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace from strings', () => {
      mockReq.body = { name: '  John Doe  ', description: '\tTest\n' };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.name).toBe('John Doe');
      expect(mockReq.body.description).toBe('Test');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should remove null bytes from strings', () => {
      mockReq.body = { name: 'John\0Doe', description: 'Test\0\0Data' };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.name).toBe('JohnDoe');
      expect(mockReq.body.description).toBe('TestData');
    });

    it('should sanitize nested objects', () => {
      mockReq.body = {
        user: {
          name: '  John  ',
          profile: {
            bio: '\0Dangerous\0'
          }
        }
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.user.name).toBe('John');
      expect(mockReq.body.user.profile.bio).toBe('Dangerous');
    });

    it('should sanitize arrays', () => {
      mockReq.body = {
        tags: ['  tag1  ', 'tag2\0', '  tag3\0  ']
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should filter out dangerous keys', () => {
      mockReq.body = {
        name: 'John',
        __proto__: 'dangerous',
        $dangerous: 'field',
        __dangerous: 'field',
        normalField: 'safe'
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body).toEqual({
        name: 'John',
        normalField: 'safe'
      });
    });

    it('should sanitize query parameters', () => {
      mockReq.query = { search: '  test query  ', filter: 'value\0' };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query.search).toBe('test query');
      expect(mockReq.query.filter).toBe('value');
    });
  });

  describe('validateContentType', () => {
    it('should pass for GET requests', () => {
      mockReq.method = 'GET';

      validateContentType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should pass for POST requests with correct content type', () => {
      mockReq.method = 'POST';
      (mockReq.get as any).mockReturnValue('application/json');

      validateContentType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 415 for POST requests with incorrect content type', () => {
      mockReq.method = 'POST';
      (mockReq.get as any).mockReturnValue('text/plain');

      validateContentType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(415);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_CONTENT_TYPE',
            message: 'Content-Type must be application/json'
          })
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 415 for POST requests with no content type', () => {
      mockReq.method = 'POST';
      (mockReq.get as any).mockReturnValue(undefined);

      validateContentType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(415);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateRequestSize', () => {
    it('should pass for requests within size limit', () => {
      (mockReq.get as any).mockReturnValue('1000'); // 1KB

      const middleware = validateRequestSize(2048); // 2KB limit
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 413 for requests exceeding size limit', () => {
      (mockReq.get as any).mockReturnValue('2048'); // 2KB

      const middleware = validateRequestSize(1024); // 1KB limit
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request payload too large. Maximum size is 1024 bytes'
          })
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass for requests without content-length header', () => {
      (mockReq.get as any).mockReturnValue(undefined);

      const middleware = validateRequestSize(1024);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});