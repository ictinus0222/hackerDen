import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useScrollOptimization, useDebounce, useThrottle } from '../useScrollOptimization';

describe('useScrollOptimization', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback immediately when enough time has passed', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useScrollOptimization(callback, 16));

    act(() => {
      result.current('test');
    });

    expect(callback).toHaveBeenCalledWith('test');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('throttles rapid calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useScrollOptimization(callback, 100));

    // First call should execute immediately
    act(() => {
      result.current('call1');
    });
    expect(callback).toHaveBeenCalledWith('call1');

    // Rapid subsequent calls should be throttled
    act(() => {
      result.current('call2');
      result.current('call3');
    });

    // Only first call should have executed
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time and check if throttled call executes
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledWith('call3');
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces function calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, 300));

    // Make multiple rapid calls
    act(() => {
      result.current('call1');
      result.current('call2');
      result.current('call3');
    });

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance time by less than delay
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(callback).not.toHaveBeenCalled();

    // Advance time to complete delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should call with last value
    expect(callback).toHaveBeenCalledWith('call3');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('resets timer on new calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, 300));

    act(() => {
      result.current('call1');
    });

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Make another call - should reset timer
    act(() => {
      result.current('call2');
    });

    // Advance time by original remaining time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance by full delay from second call
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledWith('call2');
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throttles function calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, 100));

    // First call should execute immediately
    act(() => {
      result.current('call1');
    });
    expect(callback).toHaveBeenCalledWith('call1');

    // Rapid subsequent calls should be throttled
    act(() => {
      result.current('call2');
      result.current('call3');
    });

    // Only first call should have executed
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time to trigger throttled call
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Throttle should call with the last value during the throttle period
    expect(callback).toHaveBeenCalledWith('call3');
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('allows calls after throttle period', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, 100));

    // First call
    act(() => {
      result.current('call1');
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time past throttle period
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Next call should execute immediately
    act(() => {
      result.current('call2');
    });
    expect(callback).toHaveBeenCalledWith('call2');
    expect(callback).toHaveBeenCalledTimes(2);
  });
});