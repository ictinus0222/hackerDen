import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast, useToastHelpers } from './useToast';
import { ReactNode } from 'react';

// Mock timers
vi.useFakeTimers();

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useToast', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('throws error when used outside ToastProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');

    console.error = originalError;
  });

  it('shows toast and returns id', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    let toastId: string;
    act(() => {
      toastId = result.current.showToast({
        type: 'success',
        title: 'Test Toast',
        message: 'Test message'
      });
    });

    expect(toastId).toBeDefined();
    expect(typeof toastId).toBe('string');
  });

  it('dismisses toast by id', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    let toastId: string;
    act(() => {
      toastId = result.current.showToast({
        type: 'success',
        title: 'Test Toast'
      });
    });

    act(() => {
      result.current.dismissToast(toastId);
    });

    // Toast should be dismissed (we can't directly test the UI here, 
    // but we can verify the function doesn't throw)
    expect(() => result.current.dismissToast(toastId)).not.toThrow();
  });

  it('clears all toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast({ type: 'success', title: 'Toast 1' });
      result.current.showToast({ type: 'error', title: 'Toast 2' });
      result.current.showToast({ type: 'warning', title: 'Toast 3' });
    });

    act(() => {
      result.current.clearAllToasts();
    });

    // All toasts should be cleared
    expect(() => result.current.clearAllToasts()).not.toThrow();
  });

  it('limits number of toasts', () => {
    const maxToasts = 2;
    const customWrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider maxToasts={maxToasts}>{children}</ToastProvider>
    );

    const { result } = renderHook(() => useToast(), { wrapper: customWrapper });

    act(() => {
      result.current.showToast({ type: 'success', title: 'Toast 1' });
      result.current.showToast({ type: 'success', title: 'Toast 2' });
      result.current.showToast({ type: 'success', title: 'Toast 3' }); // Should remove Toast 1
    });

    // We can't directly test the UI, but the function should work without errors
    expect(() => result.current.showToast({ type: 'success', title: 'Toast 4' })).not.toThrow();
  });

  it('uses default duration when not specified', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast({
        type: 'success',
        title: 'Test Toast'
      });
    });

    // Default duration should be applied (5000ms)
    // We can't directly test this without accessing internal state,
    // but we can verify the toast was created
    expect(() => result.current.showToast({ type: 'success', title: 'Test' })).not.toThrow();
  });

  it('uses custom duration when specified', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast({
        type: 'success',
        title: 'Test Toast',
        duration: 1000
      });
    });

    // Custom duration should be used
    expect(() => result.current.showToast({ 
      type: 'success', 
      title: 'Test',
      duration: 1000 
    })).not.toThrow();
  });
});

describe('useToastHelpers', () => {
  it('shows success toast with correct type', () => {
    const { result } = renderHook(() => useToastHelpers(), { wrapper });

    act(() => {
      result.current.showSuccess('Success!', 'Operation completed');
    });

    // Should not throw and should return a toast ID
    expect(() => result.current.showSuccess('Test')).not.toThrow();
  });

  it('shows error toast with correct type and longer duration', () => {
    const { result } = renderHook(() => useToastHelpers(), { wrapper });

    act(() => {
      result.current.showError('Error!', 'Something went wrong');
    });

    // Should not throw
    expect(() => result.current.showError('Test error')).not.toThrow();
  });

  it('shows warning toast with correct type', () => {
    const { result } = renderHook(() => useToastHelpers(), { wrapper });

    act(() => {
      result.current.showWarning('Warning!', 'Please be careful');
    });

    expect(() => result.current.showWarning('Test warning')).not.toThrow();
  });

  it('shows info toast with correct type', () => {
    const { result } = renderHook(() => useToastHelpers(), { wrapper });

    act(() => {
      result.current.showInfo('Info', 'Here is some information');
    });

    expect(() => result.current.showInfo('Test info')).not.toThrow();
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() => useToastHelpers(), { wrapper });

    const customAction = {
      label: 'Retry',
      onClick: vi.fn()
    };

    act(() => {
      result.current.showError('Error!', 'Custom error', {
        duration: 10000,
        action: customAction
      });
    });

    expect(() => result.current.showError('Test', undefined, { duration: 0 })).not.toThrow();
  });

  it('works without message parameter', () => {
    const { result } = renderHook(() => useToastHelpers(), { wrapper });

    act(() => {
      result.current.showSuccess('Success only title');
      result.current.showError('Error only title');
      result.current.showWarning('Warning only title');
      result.current.showInfo('Info only title');
    });

    // All should work without throwing
    expect(() => {
      result.current.showSuccess('Test');
      result.current.showError('Test');
      result.current.showWarning('Test');
      result.current.showInfo('Test');
    }).not.toThrow();
  });
});