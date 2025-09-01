import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ChatErrorBoundary, { NetworkFallback } from '../ChatErrorBoundary';
import { ChatLoadingSkeleton, ChatInitializationSkeleton } from '../ChatLoadingStates';
import { RetryButton, FailedOperationAlert } from '../ChatRetryMechanisms';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

// Mock hooks
vi.mock('../../hooks/useNetworkStatus');

// Mock child component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ChatErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Suppress error logs in tests
  });

  it('renders children when no error occurs', () => {
    render(
      <ChatErrorBoundary>
        <div>Test content</div>
      </ChatErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('displays error UI when child component throws', () => {
    render(
      <ChatErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ChatErrorBoundary>
    );

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred with the chat functionality.')).toBeInTheDocument();
  });

  it('shows retry button for recoverable errors', () => {
    render(
      <ChatErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ChatErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('handles network errors specifically', () => {
    const NetworkError = () => {
      throw new Error('Network connection failed');
    };

    render(
      <ChatErrorBoundary>
        <NetworkError />
      </ChatErrorBoundary>
    );

    expect(screen.getByText('Connection Problem')).toBeInTheDocument();
    expect(screen.getByText(/unable to connect to the chat service/i)).toBeInTheDocument();
  });

  it('calls onReset when retry is clicked', async () => {
    const onReset = vi.fn();

    render(
      <ChatErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ChatErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(onReset).toHaveBeenCalled();
    });
  });

  it('limits retry attempts', () => {
    const { rerender } = render(
      <ChatErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ChatErrorBoundary>
    );

    // Simulate multiple retry attempts
    for (let i = 0; i < 4; i++) {
      const retryButton = screen.queryByRole('button', { name: /try again/i });
      if (retryButton && !retryButton.disabled) {
        fireEvent.click(retryButton);
        rerender(
          <ChatErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ChatErrorBoundary>
        );
      }
    }

    expect(screen.getByText(/maximum retry attempts reached/i)).toBeInTheDocument();
  });
});

describe('NetworkFallback', () => {
  it('renders children when online with good connection', () => {
    render(
      <NetworkFallback 
        isOnline={true} 
        connectionQuality="good"
        onRetry={vi.fn()}
      >
        <div>Chat content</div>
      </NetworkFallback>
    );

    expect(screen.getByText('Chat content')).toBeInTheDocument();
  });

  it('shows offline message when not online', () => {
    render(
      <NetworkFallback 
        isOnline={false} 
        connectionQuality="offline"
        onRetry={vi.fn()}
      >
        <div>Chat content</div>
      </NetworkFallback>
    );

    expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
    expect(screen.getByText(/you're currently offline/i)).toBeInTheDocument();
  });

  it('shows poor connection message when connection quality is offline', () => {
    render(
      <NetworkFallback 
        isOnline={true} 
        connectionQuality="offline"
        onRetry={vi.fn()}
      >
        <div>Chat content</div>
      </NetworkFallback>
    );

    expect(screen.getByText(/connection quality is too poor/i)).toBeInTheDocument();
  });

  it('calls onRetry when check connection button is clicked', () => {
    const onRetry = vi.fn();

    render(
      <NetworkFallback 
        isOnline={false} 
        connectionQuality="offline"
        onRetry={onRetry}
      >
        <div>Chat content</div>
      </NetworkFallback>
    );

    const checkButton = screen.getByRole('button', { name: /check connection/i });
    fireEvent.click(checkButton);

    expect(onRetry).toHaveBeenCalled();
  });
});

describe('ChatLoadingSkeleton', () => {
  it('renders loading skeleton with proper test id', () => {
    render(<ChatLoadingSkeleton />);
    
    expect(screen.getByTestId('chat-skeleton')).toBeInTheDocument();
  });

  it('displays header, messages, and input skeletons', () => {
    const { container } = render(<ChatLoadingSkeleton />);
    
    // Check for skeleton elements
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('ChatInitializationSkeleton', () => {
  it('renders comprehensive loading state', () => {
    const { container } = render(<ChatInitializationSkeleton />);
    
    // Should include navigation, chat, and status bar skeletons
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(5);
  });
});

describe('RetryButton', () => {
  it('renders retry button with correct text', () => {
    render(<RetryButton onRetry={vi.fn()} />);
    
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows retry count when provided', () => {
    render(<RetryButton onRetry={vi.fn()} retryCount={2} maxRetries={3} />);
    
    expect(screen.getByText(/retry \(2\/3\)/i)).toBeInTheDocument();
  });

  it('disables button when max retries reached', () => {
    render(<RetryButton onRetry={vi.fn()} retryCount={3} maxRetries={3} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows retrying state', () => {
    render(<RetryButton onRetry={vi.fn()} isRetrying={true} />);
    
    expect(screen.getByText(/retrying/i)).toBeInTheDocument();
  });

  it('calls onRetry when clicked', () => {
    const onRetry = vi.fn();
    render(<RetryButton onRetry={onRetry} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('FailedOperationAlert', () => {
  it('displays error message and operation name', () => {
    render(
      <FailedOperationAlert 
        error="Connection failed"
        operation="send message"
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Failed to send message')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('shows retry button when retries available', () => {
    render(
      <FailedOperationAlert 
        error="Connection failed"
        operation="send message"
        onRetry={vi.fn()}
        retryCount={1}
        maxRetries={3}
      />
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('hides retry button when max retries reached', () => {
    render(
      <FailedOperationAlert 
        error="Connection failed"
        operation="send message"
        onRetry={vi.fn()}
        retryCount={3}
        maxRetries={3}
      />
    );

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    expect(screen.getByText(/maximum retry attempts reached/i)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    
    render(
      <FailedOperationAlert 
        error="Connection failed"
        operation="send message"
        onRetry={vi.fn()}
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('Integration Tests', () => {
  it('handles complete error recovery flow', async () => {
    let shouldThrow = true;
    const onReset = vi.fn(() => {
      shouldThrow = false;
    });

    const { rerender } = render(
      <ChatErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={shouldThrow} />
      </ChatErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();

    // Click retry
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    // Wait for retry
    await waitFor(() => {
      expect(onReset).toHaveBeenCalled();
    });

    // Rerender with fixed component
    rerender(
      <ChatErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={false} />
      </ChatErrorBoundary>
    );

    // Should show normal content
    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});