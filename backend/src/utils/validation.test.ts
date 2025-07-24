import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validateData,
  validateDataOrThrow,
  createApiResponse,
  createSuccessResponse,
  createErrorResponse
} from './validation.js';

// Test schema for validation tests
const TestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0, 'Age must be non-negative'),
  email: z.string().email('Invalid email format').optional()
});

describe('validateData', () => {
  it('should return success for valid data', () => {
    const validData = {
      name: 'John Doe',
      age: 25,
      email: 'john@example.com'
    };
    
    const result = validateData(TestSchema, validData);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should return success for valid data without optional fields', () => {
    const validData = {
      name: 'John Doe',
      age: 25
    };
    
    const result = validateData(TestSchema, validData);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.age).toBe(25);
    }
  });

  it('should return error for invalid data', () => {
    const invalidData = {
      name: '',
      age: -5,
      email: 'invalid-email'
    };
    
    const result = validateData(TestSchema, invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Invalid input data');
      expect(result.error.details).toHaveLength(3);
      expect(result.error.details[0].path).toBe('name');
      expect(result.error.details[1].path).toBe('age');
      expect(result.error.details[2].path).toBe('email');
    }
  });

  it('should return error for missing required fields', () => {
    const invalidData = {
      age: 25
    };
    
    const result = validateData(TestSchema, invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.details).toHaveLength(1);
      expect(result.error.details[0].path).toBe('name');
    }
  });

  it('should handle unexpected validation errors', () => {
    // Create a schema that throws a non-ZodError
    const problematicSchema = {
      parse: () => {
        throw new Error('Unexpected error');
      }
    } as any;
    
    const result = validateData(problematicSchema, {});
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNKNOWN_VALIDATION_ERROR');
      expect(result.error.message).toBe('An unexpected validation error occurred');
    }
  });
});

describe('validateDataOrThrow', () => {
  it('should return validated data for valid input', () => {
    const validData = {
      name: 'John Doe',
      age: 25
    };
    
    const result = validateDataOrThrow(TestSchema, validData);
    
    expect(result).toEqual(validData);
  });

  it('should throw error for invalid data', () => {
    const invalidData = {
      name: '',
      age: -5
    };
    
    expect(() => validateDataOrThrow(TestSchema, invalidData)).toThrow();
  });

  it('should throw error with proper error properties', () => {
    const invalidData = {
      name: '',
      age: 25
    };
    
    try {
      validateDataOrThrow(TestSchema, invalidData);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('Invalid input data');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toBeDefined();
    }
  });
});

describe('createApiResponse', () => {
  it('should create a success response with data', () => {
    const data = { id: 1, name: 'Test' };
    const response = createApiResponse(true, data);
    
    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.error).toBeUndefined();
    expect(response.timestamp).toBeInstanceOf(Date);
  });

  it('should create an error response', () => {
    const error = {
      code: 'TEST_ERROR',
      message: 'Test error message'
    };
    const response = createApiResponse(false, undefined, error);
    
    expect(response.success).toBe(false);
    expect(response.data).toBeUndefined();
    expect(response.error).toEqual(error);
    expect(response.timestamp).toBeInstanceOf(Date);
  });
});

describe('createSuccessResponse', () => {
  it('should create a success response', () => {
    const data = { id: 1, name: 'Test' };
    const response = createSuccessResponse(data);
    
    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.error).toBeUndefined();
    expect(response.timestamp).toBeInstanceOf(Date);
  });
});

describe('createErrorResponse', () => {
  it('should create an error response', () => {
    const response = createErrorResponse('TEST_ERROR', 'Test message');
    
    expect(response.success).toBe(false);
    expect(response.data).toBeUndefined();
    expect(response.error?.code).toBe('TEST_ERROR');
    expect(response.error?.message).toBe('Test message');
    expect(response.timestamp).toBeInstanceOf(Date);
  });

  it('should create an error response with details', () => {
    const details = { field: 'value' };
    const response = createErrorResponse('TEST_ERROR', 'Test message', details);
    
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('TEST_ERROR');
    expect(response.error?.message).toBe('Test message');
    expect(response.error?.details).toEqual(details);
  });
});