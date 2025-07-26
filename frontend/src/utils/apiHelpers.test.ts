import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateRetryDelay,
  withRetry,
  CircuitBreaker,
  RequestDeduplicator,
  classifyError,
  getConnectionQuality,
  getAdaptiveTimeout,
  RequestBatcher,
  DEFAULT_RETRY_CONFIG
} from './apiHelpers';
import { ApiError } from '../services/api';

// Mock timers
vi.useFakeTimers();

describe('calculateRetryDelay', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('calculates exponential backoff delay', () => {
    const delay1 = calculateRetryDelay(0);
    const delay2 = calculateRetryDelay(1);
    const delay3 = calculateRetryDelay(2);

    expect(delay2).toBeGreaterThan(delay1);
    expect(delay3).toBeGreaterThan(delay2);
  });

  it('respects maximum delay', () => {
    const config = { ...DEFAULT_RETRY_CONFIG, maxDelay: 5000 };
    const delay = calculateRetryDelay(10, config);

    expect(delay).toBeLessThanOrEqual(5000 * 1.1); // Account for jitter
  });

  it('adds jitter to prevent thundering herd', () => {
    const delay1 = calculateRetryDelay(1);
    const delay2 = calculateRetryDelay(1);

    // Due to jitter, delays should be slightly different
    // (though this test might occasionally fail due to randomness)
    expect(Math.abs(delay1 - delay2)).toBeGreaterThan(0);
  });

  it('uses custom config values', () => {
    const config = {
      maxRetries: 5,
      baseDelay: 500,
      maxDelay: 8000,
      backoffFactor: 3
    };

    const delay = calculateRetryDelay(1, config);
    expect(delay).toBeGreaterThan(500 * 3 * 0.9); // Account for jitter
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('succeeds on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValue('success');

    const promise = withRetry(operation);
    
    // Fast-forward through retry delay
    vi.advanceTimersByTime(2000);
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('fails after max retries', async () => {
    const error = new TypeError('Persistent network error');
    const operation = vi.fn().mockRejectedValue(error);

    const promise = withRetry(operation, { ...DEFAULT_RETRY_CONFIG, maxRetries: 2 });
    
    // Fast-forward through all retry delays
    vi.advanceTimersByTime(10000);
    
    await expect(promise).rejects.toThrow('Persistent network error');
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('does not retry non-retryable errors', async () => {
    const error = new ApiError('Validation error', 'VALIDATION_ERROR');
    const operation = vi.fn().mockRejectedValue(error);

    await expect(withRetry(operation)).rejects.toThrow('Validation error');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('uses custom retry condition', async () => {
    const error = new Error('Custom error');
    const operation = vi.fn().mockRejectedValue(error);
    const retryCondition = vi.fn().mockReturnValue(false);

    await expect(withRetry(operation, { 
      ...DEFAULT_RETRY_CONFIG, 
      retryCondition 
    })).rejects.toThrow('Custom error');
    
    expect(retryCondition).toHaveBeenCalledWith(error);
    expect(operation).toHaveBeenCalledTimes(1);
  });
});

describe('CircuitBreaker', () => {
  it('starts in CLOSED state', () => {
    const breaker = new CircuitBreaker();
    expect(breaker.getState().state).toBe('CLOSED');
  });

  it('executes operation successfully in CLOSED state', async () => {
    const breaker = new CircuitBreaker();
    const operation = vi.fn().mockResolvedValue('success');

    const result = await breaker.execute(operation);

    expect(result).toBe('success');
    expect(breaker.getState().state).toBe('CLOSED');
    expect(breaker.getState().failures).toBe(0);
  });

  it('opens circuit after failure threshold', async () => {
    const breaker = new CircuitBreaker(2); // Threshold of 2
    const operation = vi.fn().mockRejectedValue(new Error('Failure'));

    // First failure
    await expect(breaker.execute(operation)).rejects.toThrow('Failure');
    expect(breaker.getState().state).toBe('CLOSED');

    // Second failure - should open circuit
    await expect(breaker.execute(operation)).rejects.toThrow('Failure');
    expect(breaker.getState().state).toBe('OPEN');
  });

  it('rejects immediately when circuit is OPEN', async () => {
    const breaker = new CircuitBreaker(1);
    const operation = vi.fn().mockRejectedValue(new Error('Failure'));

    // Trigger circuit opening
    await expect(breaker.execute(operation)).rejects.toThrow('Failure');
    expect(breaker.getState().state).toBe('OPEN');

    // Should reject immediately without calling operation
    operation.mockClear();
    await expect(breaker.execute(operation)).rejects.toThrow('Circuit breaker is OPEN');
    expect(operation).not.toHaveBeenCalled();
  });

  it('transitions to HALF_OPEN after recovery timeout', async () => {
    const breaker = new CircuitBreaker(1, 1000); // 1 second recovery
    const operation = vi.fn().mockRejectedValue(new Error('Failure'));

    // Open circuit
    await expect(breaker.execute(operation)).rejects.toThrow('Failure');
    expect(breaker.getState().state).toBe('OPEN');

    // Fast-forward past recovery timeout
    vi.advanceTimersByTime(1100);

    // Next operation should transition to HALF_OPEN
    operation.mockResolvedValue('success');
    const result = await breaker.execute(operation);

    expect(result).toBe('success');
    expect(breaker.getState().state).toBe('CLOSED');
  });

  it('can be reset manually', () => {
    const breaker = new CircuitBreaker(1);
    
    // Simulate failure state
    breaker.getState().failures = 5;
    
    breaker.reset();
    
    expect(breaker.getState().state).toBe('CLOSED');
    expect(breaker.getState().failures).toBe(0);
  });
});

describe('RequestDeduplicator', () => {
  it('deduplicates identical requests', async () => {
    const deduplicator = new RequestDeduplicator();
    const operation = vi.fn().mockResolvedValue('result');

    const promise1 = deduplicator.deduplicate('key1', operation);
    const promise2 = deduplicator.deduplicate('key1', operation);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('allows different keys to execute separately', async () => {
    const deduplicator = new RequestDeduplicator();
    const operation1 = vi.fn().mockResolvedValue('result1');
    const operation2 = vi.fn().mockResolvedValue('result2');

    const [result1, result2] = await Promise.all([
      deduplicator.deduplicate('key1', operation1),
      deduplicator.deduplicate('key2', operation2)
    ]);

    expect(result1).toBe('result1');
    expect(result2).toBe('result2');
    expect(operation1).toHaveBeenCalledTimes(1);
    expect(operation2).toHaveBeenCalledTimes(1);
  });

  it('cleans up after TTL', async () => {
    const deduplicator = new RequestDeduplicator();
    const operation = vi.fn().mockResolvedValue('result');

    await deduplicator.deduplicate('key1', operation, 1000);

    // Fast-forward past TTL
    vi.advanceTimersByTime(1100);

    // Should execute operation again
    await deduplicator.deduplicate('key1', operation);

    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('can be cleared manually', async () => {
    const deduplicator = new RequestDeduplicator();
    const operation = vi.fn().mockResolvedValue('result');

    const promise1 = deduplicator.deduplicate('key1', operation);
    deduplicator.clear();
    const promise2 = deduplicator.deduplicate('key1', operation);

    await Promise.all([promise1, promise2]);

    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe('classifyError', () => {
  it('classifies network errors', () => {
    const error = new ApiError('Network error', 'NETWORK_ERROR');
    const classification = classifyError(error);

    expect(classification.type).toBe('network');
    expect(classification.isRetryable).toBe(true);
    expect(classification.userMessage).toContain('Network connection');
  });

  it('classifies validation errors', () => {
    const error = new ApiError('Invalid input', 'VALIDATION_ERROR');
    const classification = classifyError(error);

    expect(classification.type).toBe('validation');
    expect(classification.isRetryable).toBe(false);
    expect(classification.userMessage).toBe('Invalid input');
  });

  it('classifies authentication errors', () => {
    const error = new ApiError('Unauthorized', 'UNAUTHORIZED');
    const classification = classifyError(error);

    expect(classification.type).toBe('authentication');
    expect(classification.isRetryable).toBe(false);
    expect(classification.userMessage).toContain('log in again');
  });

  it('classifies server errors by status code', () => {
    const error = new ApiError('HTTP 500: Internal Server Error');
    const classification = classifyError(error);

    expect(classification.type).toBe('server');
    expect(classification.isRetryable).toBe(true);
    expect(classification.userMessage).toContain('Server error');
  });

  it('classifies client errors by status code', () => {
    const error = new ApiError('HTTP 400: Bad Request');
    const classification = classifyError(error);

    expect(classification.type).toBe('client');
    expect(classification.isRetryable).toBe(false);
    expect(classification.userMessage).toContain('Invalid request');
  });

  it('classifies generic TypeError as network error', () => {
    const error = new TypeError('Failed to fetch');
    const classification = classifyError(error);

    expect(classification.type).toBe('network');
    expect(classification.isRetryable).toBe(true);
  });

  it('classifies unknown errors', () => {
    const error = new Error('Unknown error');
    const classification = classifyError(error);

    expect(classification.type).toBe('unknown');
    expect(classification.isRetryable).toBe(false);
    expect(classification.userMessage).toContain('unexpected error');
  });
});

describe('getConnectionQuality', () => {
  it('returns fast for unknown connection', () => {
    // Mock navigator without connection
    Object.defineProperty(navigator, 'connection', { value: undefined });
    
    expect(getConnectionQuality()).toBe('fast');
  });

  it('detects slow connection', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: 'slow-2g' },
      configurable: true
    });
    
    expect(getConnectionQuality()).toBe('slow');
  });

  it('detects medium connection', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true
    });
    
    expect(getConnectionQuality()).toBe('medium');
  });

  it('detects fast connection', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '4g' },
      configurable: true
    });
    
    expect(getConnectionQuality()).toBe('fast');
  });
});

describe('getAdaptiveTimeout', () => {
  it('returns longer timeout for slow connections', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: 'slow-2g' },
      configurable: true
    });
    
    expect(getAdaptiveTimeout()).toBe(30000);
  });

  it('returns medium timeout for 3g connections', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true
    });
    
    expect(getAdaptiveTimeout()).toBe(15000);
  });

  it('returns default timeout for fast connections', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '4g' },
      configurable: true
    });
    
    expect(getAdaptiveTimeout()).toBe(10000);
  });
});

describe('RequestBatcher', () => {
  it('batches requests with same key', async () => {
    const batcher = new RequestBatcher(50);
    const processor = vi.fn().mockResolvedValue(['result1', 'result2']);

    const promise1 = batcher.batch('key1', 'data1', processor);
    const promise2 = batcher.batch('key1', 'data2', processor);

    // Fast-forward past batch delay
    vi.advanceTimersByTime(60);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('result1');
    expect(result2).toBe('result2');
    expect(processor).toHaveBeenCalledTimes(1);
    expect(processor).toHaveBeenCalledWith(['data1', 'data2']);
  });

  it('processes different keys separately', async () => {
    const batcher = new RequestBatcher(50);
    const processor1 = vi.fn().mockResolvedValue(['result1']);
    const processor2 = vi.fn().mockResolvedValue(['result2']);

    const promise1 = batcher.batch('key1', 'data1', processor1);
    const promise2 = batcher.batch('key2', 'data2', processor2);

    vi.advanceTimersByTime(60);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('result1');
    expect(result2).toBe('result2');
    expect(processor1).toHaveBeenCalledWith(['data1']);
    expect(processor2).toHaveBeenCalledWith(['data2']);
  });

  it('handles batch processing errors', async () => {
    const batcher = new RequestBatcher(50);
    const error = new Error('Batch processing failed');
    const processor = vi.fn().mockRejectedValue(error);

    const promise1 = batcher.batch('key1', 'data1', processor);
    const promise2 = batcher.batch('key1', 'data2', processor);

    vi.advanceTimersByTime(60);

    await expect(promise1).rejects.toThrow('Batch processing failed');
    await expect(promise2).rejects.toThrow('Batch processing failed');
  });
});