import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Test utilities for edge cases and utility functions
describe('Test Utilities and Edge Cases', () => {
  describe('Environment Detection', () => {
    it('detects mobile environment', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      expect(isMobile).toBe(true);
    });

    it('detects desktop environment', () => {
      // Mock desktop user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      expect(isMobile).toBe(false);
    });

    it('detects touch capability', () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        writable: true,
      });

      const hasTouch = 'ontouchstart' in window;
      expect(hasTouch).toBe(true);
    });

    it('detects WebSocket support', () => {
      const hasWebSocket = typeof WebSocket !== 'undefined';
      expect(hasWebSocket).toBe(true);
    });
  });

  describe('Local Storage Utilities', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });

    it('handles localStorage unavailable', () => {
      // Mock localStorage as undefined
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const safeSetItem = (key: string, value: string) => {
        try {
          if (typeof Storage !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
            return true;
          }
        } catch (error) {
          console.warn('localStorage not available:', error);
        }
        return false;
      };

      const result = safeSetItem('test', 'value');
      expect(result).toBe(false);
    });

    it('handles localStorage quota exceeded', () => {
      const mockSetItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      Object.defineProperty(window, 'localStorage', {
        value: { setItem: mockSetItem },
        writable: true,
      });

      const safeSetItem = (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value);
          return true;
        } catch (error) {
          if (error instanceof Error && error.message.includes('Quota')) {
            console.warn('localStorage quota exceeded');
          }
          return false;
        }
      };

      const result = safeSetItem('test', 'value');
      expect(result).toBe(false);
    });

    it('handles JSON parsing errors', () => {
      const mockGetItem = vi.fn(() => 'invalid-json{');

      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true,
      });

      const safeGetItem = (key: string) => {
        try {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (error) {
          console.warn('Failed to parse localStorage item:', error);
          return null;
        }
      };

      const result = safeGetItem('test');
      expect(result).toBe(null);
    });
  });

  describe('URL Validation', () => {
    const isValidUrl = (string: string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    it('validates correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://github.com/user/repo')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true); // FTP is valid URL
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(true); // Valid URL but dangerous
    });

    it('validates GitHub URLs specifically', () => {
      const isGitHubUrl = (url: string) => {
        try {
          const parsed = new URL(url);
          return parsed.hostname === 'github.com';
        } catch (_) {
          return false;
        }
      };

      expect(isGitHubUrl('https://github.com/user/repo')).toBe(true);
      expect(isGitHubUrl('https://gitlab.com/user/repo')).toBe(false);
      expect(isGitHubUrl('not-a-url')).toBe(false);
    });
  });

  describe('Date Utilities', () => {
    it('formats dates consistently', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2024-01-15');
    });

    it('handles invalid dates', () => {
      const invalidDate = new Date('invalid');
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });

    it('calculates time differences', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 60000); // 1 minute later
      const diff = future.getTime() - now.getTime();
      expect(diff).toBe(60000);
    });

    it('handles timezone differences', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const utcTime = date.getTime();
      const localTime = new Date(date.toLocaleString()).getTime();
      
      // Times might differ due to timezone
      expect(typeof utcTime).toBe('number');
      expect(typeof localTime).toBe('number');
    });
  });

  describe('Error Handling Utilities', () => {
    it('categorizes different error types', () => {
      const categorizeError = (error: Error) => {
        if (error.message.includes('Network')) return 'network';
        if (error.message.includes('Validation')) return 'validation';
        if (error.message.includes('Auth')) return 'auth';
        return 'unknown';
      };

      expect(categorizeError(new Error('Network timeout'))).toBe('network');
      expect(categorizeError(new Error('Validation failed'))).toBe('validation');
      expect(categorizeError(new Error('Auth required'))).toBe('auth');
      expect(categorizeError(new Error('Something else'))).toBe('unknown');
    });

    it('handles error serialization', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test';

      const serialized = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };

      expect(serialized.message).toBe('Test error');
      expect(serialized.name).toBe('Error');
      expect(serialized.stack).toContain('Test error');
    });

    it('handles circular reference errors', () => {
      const obj: any = { name: 'test' };
      obj.self = obj; // Circular reference

      const safeStringify = (obj: any) => {
        try {
          return JSON.stringify(obj);
        } catch (error) {
          if (error instanceof Error && error.message.includes('circular')) {
            return JSON.stringify({ error: 'Circular reference detected' });
          }
          return JSON.stringify({ error: 'Serialization failed' });
        }
      };

      const result = safeStringify(obj);
      expect(result).toContain('Circular reference detected');
    });
  });

  describe('Performance Utilities', () => {
    it('measures execution time', () => {
      const measureTime = (fn: () => void) => {
        const start = performance.now();
        fn();
        const end = performance.now();
        return end - start;
      };

      const time = measureTime(() => {
        // Simulate some work
        for (let i = 0; i < 1000; i++) {
          Math.random();
        }
      });

      expect(time).toBeGreaterThan(0);
    });

    it('debounces function calls', async () => {
      vi.useFakeTimers();
      
      const debounce = (fn: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
        };
      };

      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(100);

      // Should be called once
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('throttles function calls', () => {
      vi.useFakeTimers();
      
      const throttle = (fn: Function, delay: number) => {
        let lastCall = 0;
        return (...args: any[]) => {
          const now = Date.now();
          if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
          }
        };
      };

      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      // Call multiple times
      throttledFn();
      throttledFn();
      throttledFn();

      // Should be called once immediately
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Fast-forward time
      vi.advanceTimersByTime(100);

      // Call again
      throttledFn();

      // Should be called again
      expect(mockFn).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe('Array Utilities', () => {
    it('handles empty arrays safely', () => {
      const safeFirst = (arr: any[]) => arr.length > 0 ? arr[0] : null;
      const safeLast = (arr: any[]) => arr.length > 0 ? arr[arr.length - 1] : null;

      expect(safeFirst([])).toBe(null);
      expect(safeLast([])).toBe(null);
      expect(safeFirst([1, 2, 3])).toBe(1);
      expect(safeLast([1, 2, 3])).toBe(3);
    });

    it('removes duplicates from arrays', () => {
      const removeDuplicates = (arr: any[]) => [...new Set(arr)];

      expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(removeDuplicates([])).toEqual([]);
    });

    it('chunks arrays into smaller arrays', () => {
      const chunk = (arr: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      };

      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([], 2)).toEqual([]);
      expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
    });
  });

  describe('Object Utilities', () => {
    it('deep clones objects', () => {
      const deepClone = (obj: any) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        
        const cloned: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
          }
        }
        return cloned;
      };

      const original = { a: 1, b: { c: 2 }, d: [3, 4] };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.d).not.toBe(original.d);
    });

    it('merges objects deeply', () => {
      const deepMerge = (target: any, source: any) => {
        const result = { ...target };
        
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
              result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
              result[key] = source[key];
            }
          }
        }
        
        return result;
      };

      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const merged = deepMerge(obj1, obj2);

      expect(merged).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it('gets nested object values safely', () => {
      const safeGet = (obj: any, path: string, defaultValue: any = undefined) => {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
          if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
          }
          current = current[key];
        }
        
        return current;
      };

      const obj = { a: { b: { c: 'value' } } };
      
      expect(safeGet(obj, 'a.b.c')).toBe('value');
      expect(safeGet(obj, 'a.b.d', 'default')).toBe('default');
      expect(safeGet(null, 'a.b.c', 'default')).toBe('default');
    });
  });
});