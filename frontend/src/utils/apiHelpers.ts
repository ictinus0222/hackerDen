import { ApiError } from '../services/api';

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: Error) => boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: Error) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error instanceof ApiError) {
      return error.code === 'NETWORK_ERROR' || 
             error.code === 'TIMEOUT' ||
             error.message.includes('5') || // 5xx errors
             error.message.includes('Network') ||
             error.message.includes('fetch');
    }
    
    // Retry on generic network errors
    return error instanceof TypeError || 
           error.name === 'AbortError' ||
           error.message.includes('fetch') ||
           error.message.includes('Network');
  }
};

// Exponential backoff with jitter
export function calculateRetryDelay(
  attempt: number, 
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * 0.1 * Math.random();
  
  return cappedDelay + jitter;
}

// Retry wrapper function
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if we've exhausted attempts
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Don't retry if the error doesn't meet retry conditions
      if (config.retryCondition && !config.retryCondition(lastError)) {
        break;
      }
      
      // Wait before retrying
      const delay = calculateRetryDelay(attempt, config);
      console.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${config.maxRetries + 1}):`, lastError);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Circuit breaker pattern for API calls
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private monitoringPeriod: number = 120000 // 2 minutes
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new ApiError('Circuit breaker is OPEN', 'CIRCUIT_BREAKER_OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
  
  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

// Request deduplication
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  
  async deduplicate<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = 5000
  ): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    const promise = operation().finally(() => {
      // Clean up after TTL
      setTimeout(() => {
        this.pendingRequests.delete(key);
      }, ttl);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
  
  clear() {
    this.pendingRequests.clear();
  }
}

// Error classification
export function classifyError(error: Error): {
  type: 'network' | 'validation' | 'authentication' | 'authorization' | 'server' | 'client' | 'unknown';
  isRetryable: boolean;
  userMessage: string;
} {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
      case 'OFFLINE':
        return {
          type: 'network',
          isRetryable: true,
          userMessage: 'Network connection issue. Please check your internet connection and try again.'
        };
      
      case 'VALIDATION_ERROR':
        return {
          type: 'validation',
          isRetryable: false,
          userMessage: error.message
        };
      
      case 'UNAUTHORIZED':
        return {
          type: 'authentication',
          isRetryable: false,
          userMessage: 'Please log in again to continue.'
        };
      
      case 'FORBIDDEN':
        return {
          type: 'authorization',
          isRetryable: false,
          userMessage: 'You do not have permission to perform this action.'
        };
      
      case 'CIRCUIT_BREAKER_OPEN':
        return {
          type: 'server',
          isRetryable: true,
          userMessage: 'Service is temporarily unavailable. Please try again in a few minutes.'
        };
      
      default:
        if (error.message.includes('5')) {
          return {
            type: 'server',
            isRetryable: true,
            userMessage: 'Server error occurred. Please try again.'
          };
        }
        
        if (error.message.includes('4')) {
          return {
            type: 'client',
            isRetryable: false,
            userMessage: 'Invalid request. Please refresh the page and try again.'
          };
        }
    }
  }
  
  // Handle generic errors
  if (error instanceof TypeError || error.name === 'AbortError') {
    return {
      type: 'network',
      isRetryable: true,
      userMessage: 'Network connection issue. Please try again.'
    };
  }
  
  return {
    type: 'unknown',
    isRetryable: false,
    userMessage: 'An unexpected error occurred. Please try again or contact support.'
  };
}

// Connection quality detection
export function getConnectionQuality(): 'slow' | 'medium' | 'fast' {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'slow';
    }
    
    if (connection.effectiveType === '3g') {
      return 'medium';
    }
  }
  
  return 'fast';
}

// Adaptive timeout based on connection quality
export function getAdaptiveTimeout(): number {
  const quality = getConnectionQuality();
  
  switch (quality) {
    case 'slow':
      return 30000; // 30 seconds
    case 'medium':
      return 15000; // 15 seconds
    case 'fast':
    default:
      return 10000; // 10 seconds
  }
}

// Batch request helper
export class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{
      resolve: (value: any) => void;
      reject: (error: any) => void;
      data: any;
    }>;
    timer: NodeJS.Timeout;
  }>();
  
  constructor(private batchDelay: number = 50) {}
  
  async batch<T>(
    key: string,
    data: any,
    batchProcessor: (items: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(key)) {
        this.batches.set(key, {
          requests: [],
          timer: setTimeout(() => this.processBatch(key, batchProcessor), this.batchDelay)
        });
      }
      
      const batch = this.batches.get(key)!;
      batch.requests.push({ resolve, reject, data });
    });
  }
  
  private async processBatch<T>(
    key: string,
    batchProcessor: (items: any[]) => Promise<T[]>
  ) {
    const batch = this.batches.get(key);
    if (!batch) return;
    
    this.batches.delete(key);
    
    try {
      const items = batch.requests.map(req => req.data);
      const results = await batchProcessor(items);
      
      batch.requests.forEach((req, index) => {
        req.resolve(results[index]);
      });
    } catch (error) {
      batch.requests.forEach(req => {
        req.reject(error);
      });
    }
  }
}