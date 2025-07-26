import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useErrorHandler, useAsyncOperation, useFormErrorHandler } from './useErrorHandler';
import { ApiError } from '../services/api';
import { ToastProvider } from './useToast';
import { ReactNode } from 'react';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useErrorHandler', () => {
  it('handles generic errors', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new Error('Generic error');
    const classification = result.current.handleError(error);
    
    expect(classification.type).toBe('unknown');
    expect(classification.isRetryable).toBe(false);
    expect(classification.userMessage).toContain('unexpected error');
  });

  it('handles network errors', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new ApiError('Network error', 'NETWORK_ERROR');
    const classification = result.current.handleError(error);
    
    expect(classification.type).toBe('network');
    expect(classification.isRetryable).toBe(true);
    expect(classification.userMessage).toContain('Network connection');
  });

  it('handles validation errors', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new ApiError('Invalid input', 'VALIDATION_ERROR');
    const classification = result.current.handleError(error);
    
    expect(classification.type).toBe('validation');
    expect(classification.isRetryable).toBe(false);
    expect(classification.userMessage).toBe('Invalid input');
  });

  it('handles authentication errors', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new ApiError('Unauthorized', 'UNAUTHORIZED');
    const classification = result.current.handleError(error);
    
    expect(classification.type).toBe('authentication');
    expect(classification.isRetryable).toBe(false);
    expect(classification.userMessage).toContain('log in again');
  });

  it('handles authorization errors', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new ApiError('Forbidden', 'FORBIDDEN');
    const classification = result.current.handleError(error);
    
    expect(classification.type).toBe('authorization');
    expect(classification.isRetryable).toBe(false);
    expect(classification.userMessage).toContain('permission');
  });

  it('handles server errors', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new ApiError('Internal server error', 'INTERNAL_SERVER_ERROR');
    const classification = result.current.handleError(error);
    
    expect(classification.type).toBe('server');
    expect(classification.isRetryable).toBe(true);
    expect(classification.userMessage).toContain('Server error');
  });

  it('calls custom error handler', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const onError = vi.fn();
    const error = new Error('Test error');
    const context = { test: 'context' };
    
    result.current.handleError(error, context, { onError });
    
    expect(onError).toHaveBeenCalledWith(error, context);
  });

  it('uses custom message when provided', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new Error('Original message');
    const customMessage = 'Custom error message';
    
    const classification = result.current.handleError(error, undefined, { 
      customMessage 
    });
    
    expect(classification.userMessage).toBe(customMessage);
  });

  it('can disable toast notifications', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new Error('Test error');
    
    // Should not throw when showToast is false
    expect(() => {
      result.current.handleError(error, undefined, { showToast: false });
    }).not.toThrow();
  });

  it('can disable error logging', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new Error('Test error');
    
    result.current.handleError(error, undefined, { logError: false });
    
    // console.error should not have been called
    expect(console.error).not.toHaveBeenCalled();
  });

  it('handles API errors with operation context', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new ApiError('Failed to save', 'SAVE_ERROR');
    const retryAction = vi.fn();
    
    const classification = result.current.handleApiError(error, 'save data', retryAction);
    
    expect(classification.userMessage).toContain('Failed to save data');
  });

  it('handles network errors with retry action', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new TypeError('Network error');
    const retryAction = vi.fn();
    
    const classification = result.current.handleNetworkError(error, retryAction);
    
    expect(classification.type).toBe('network');
    expect(classification.isRetryable).toBe(true);
  });

  it('handles validation errors with field context', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    const error = new ApiError('Invalid email format', 'VALIDATION_ERROR');
    
    const classification = result.current.handleValidationError(error, 'email');
    
    expect(classification.userMessage).toContain('Invalid email');
  });

  it('handles auth errors and clears token', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    // Set up localStorage mock
    const mockRemoveItem = vi.fn();
    Object.defineProperty(window, 'localStorage', {
      value: { removeItem: mockRemoveItem },
      writable: true
    });
    
    const error = new ApiError('Unauthorized', 'UNAUTHORIZED');
    
    result.current.handleAuthError(error);
    
    expect(mockRemoveItem).toHaveBeenCalledWith('hackerden_token');
  });
});

describe('useAsyncOperation', () => {
  it('executes operation successfully', async () => {
    const { result } = renderHook(() => useAsyncOperation(), { wrapper });
    
    const operation = vi.fn().mockResolvedValue('success');
    
    const response = await result.current.executeAsync(operation);
    
    expect(operation).toHaveBeenCalled();
    expect(response).toBe('success');
  });

  it('handles operation errors', async () => {
    const { result } = renderHook(() => useAsyncOperation(), { wrapper });
    
    const error = new Error('Operation failed');
    const operation = vi.fn().mockRejectedValue(error);
    
    const response = await result.current.executeAsync(operation);
    
    expect(operation).toHaveBeenCalled();
    expect(response).toBeNull();
  });

  it('passes options to error handler', async () => {
    const { result } = renderHook(() => useAsyncOperation(), { wrapper });
    
    const error = new Error('Operation failed');
    const operation = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    
    await result.current.executeAsync(operation, { onError });
    
    expect(onError).toHaveBeenCalledWith(error, { operation: operation.name });
  });
});

describe('useFormErrorHandler', () => {
  it('handles validation errors specifically', () => {
    const { result } = renderHook(() => useFormErrorHandler(), { wrapper });
    
    const error = new ApiError('Invalid input', 'VALIDATION_ERROR');
    
    const classification = result.current.handleFormError(error);
    
    expect(classification.type).toBe('validation');
  });

  it('handles non-validation errors as API errors', () => {
    const { result } = renderHook(() => useFormErrorHandler(), { wrapper });
    
    const error = new ApiError('Server error', 'SERVER_ERROR');
    
    const classification = result.current.handleFormError(error);
    
    expect(classification.userMessage).toContain('submit form');
  });

  it('passes form data as context', () => {
    const { result } = renderHook(() => useFormErrorHandler(), { wrapper });
    
    const error = new Error('Form error');
    const formData = { field1: 'value1' };
    
    // Should not throw
    expect(() => {
      result.current.handleFormError(error, formData);
    }).not.toThrow();
  });
});