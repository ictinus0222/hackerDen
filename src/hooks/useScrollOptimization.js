import { useCallback, useRef } from 'react';

// Custom hook for optimizing scroll performance
export const useScrollOptimization = (callback, delay = 16) => {
  const timeoutRef = useRef(null);
  const lastCallRef = useRef(0);

  const optimizedCallback = useCallback((...args) => {
    const now = Date.now();
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If enough time has passed, call immediately
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      // Otherwise, schedule for later
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);

  return optimizedCallback;
};

// Hook for debouncing rapid function calls
export const useDebounce = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
};

// Hook for throttling function calls
export const useThrottle = (callback, delay = 100) => {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);
  const lastArgsRef = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    lastArgsRef.current = args; // Always store the latest args
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...lastArgsRef.current); // Use the latest args
        timeoutRef.current = null;
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);

  return throttledCallback;
};