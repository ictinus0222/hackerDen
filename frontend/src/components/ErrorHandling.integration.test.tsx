import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { ToastProvider, useToast } from '../hooks/useToast';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { ApiError } from '../services/api';
import { ReactNode } from 'react';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Test component that uses error handling
const TestComponent = ({ shouldThrow = false, errorType = 'generic' }: { 
  shouldThrow?: boolean; 
  errorType?: 'generic' | 'api' | 'network' | 'validation';
}) => {
  const { handleError, handleApiError, handleNetworkError, handleValidationError } = useErrorHandler();
  const { showToast } = useToast();

  const triggerError = () => {
    let error: Error;
    
    switch (errorType) {
      case 'api':
        error = new ApiError('API operation failed', 'API_ERROR');
        handleApiError(error, 'test operation');
        break;
      case 'network':
        error = new TypeError('Network request failed');
        handleNetworkError(error);
        break;
      case 'validation':
        error = new ApiError('Invalid input', 'VALIDATION_ERROR');
        handleValidationError(error, 'email');
        break;
      default:
        error = new Error('Generic error');
        handleError(error);
    }
  };

  const showSuccessToast = () => {
    showToast({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully'
    });
  };

  if (shouldThrow) {
    throw new Error('Component error');
  }

  return (
    <div>
      <h1>Test Component</h1>
      <button onClick={triggerError}>Trigger Error</button>
      <button onClick={showSuccessToast}>Show Success</button>
    </div>
  );
};

// Wrapper component with all providers
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <ErrorBoundary>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

describe('Error Handling Integration', () => {
  it('handles component errors with error boundary', () => {
    render(
      <TestWrapper>
        <TestComponent shouldThrow={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
  });

  it('allows recovery from error boundary', () => {
    const { rerender } = render(
      <TestWrapper>
        <TestComponent shouldThrow={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click retry button
    fireEvent.click(screen.getByText('Try Again'));

    // Re-render without error
    rerender(
      <TestWrapper>
        <TestComponent shouldThrow={false} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('shows toast notifications for handled errors', async () => {
    render(
      <TestWrapper>
        <TestComponent errorType="api" />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Trigger Error'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to test operation/)).toBeInTheDocument();
    });
  });

  it('shows different toast types for different error types', async () => {
    const { rerender } = render(
      <TestWrapper>
        <TestComponent errorType="network" />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Trigger Error'));

    await waitFor(() => {
      expect(screen.getByText(/Network connection/)).toBeInTheDocument();
    });

    // Test validation error
    rerender(
      <TestWrapper>
        <TestComponent errorType="validation" />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Trigger Error'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email/)).toBeInTheDocument();
    });
  });

  it('shows success toasts', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });
  });

  it('allows dismissing toast notifications', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });
  });

  it('handles multiple errors gracefully', async () => {
    render(
      <TestWrapper>
        <TestComponent errorType="api" />
      </TestWrapper>
    );

    // Trigger multiple errors quickly
    fireEvent.click(screen.getByText('Trigger Error'));
    fireEvent.click(screen.getByText('Trigger Error'));
    fireEvent.click(screen.getByText('Trigger Error'));

    await waitFor(() => {
      // Should show error toasts (may be limited by maxToasts)
      const errorToasts = screen.getAllByText('Error');
      expect(errorToasts.length).toBeGreaterThan(0);
    });
  });

  it('maintains app functionality after error handling', async () => {
    render(
      <TestWrapper>
        <TestComponent errorType="api" />
      </TestWrapper>
    );

    // Trigger an error
    fireEvent.click(screen.getByText('Trigger Error'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    // App should still be functional
    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  it('provides error context in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV;
    Object.defineProperty(import.meta.env, 'DEV', { value: true, writable: true });

    render(
      <TestWrapper>
        <TestComponent shouldThrow={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();

    // Restore original environment
    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, writable: true });
  });

  it('handles page refresh from error boundary', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <TestWrapper>
        <TestComponent shouldThrow={true} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Refresh Page'));
    expect(mockReload).toHaveBeenCalled();
  });
});

// Test component that simulates async operations
const AsyncTestComponent = () => {
  const { handleError } = useErrorHandler();

  const simulateAsyncError = async () => {
    try {
      // Simulate async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new ApiError('Async operation failed', 'ASYNC_ERROR')), 100);
      });
    } catch (error) {
      handleError(error as Error, { operation: 'async test' });
    }
  };

  return (
    <div>
      <h1>Async Test Component</h1>
      <button onClick={simulateAsyncError}>Trigger Async Error</button>
    </div>
  );
};

describe('Async Error Handling', () => {
  it('handles async operation errors', async () => {
    render(
      <TestWrapper>
        <AsyncTestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Trigger Async Error'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(/unexpected error/)).toBeInTheDocument();
    });
  });
});