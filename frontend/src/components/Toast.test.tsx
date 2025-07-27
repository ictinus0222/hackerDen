import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastContainer, type Toast } from './Toast';

// Mock timers
vi.useFakeTimers();

describe('ToastContainer', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders no toasts when array is empty', () => {
    render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders success toast correctly', () => {
    const toast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully'
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders error toast correctly', () => {
    const toast: Toast = {
      id: '1',
      type: 'error',
      title: 'Error!',
      message: 'Something went wrong'
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders warning toast correctly', () => {
    const toast: Toast = {
      id: '1',
      type: 'warning',
      title: 'Warning!',
      message: 'Please be careful'
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Please be careful')).toBeInTheDocument();
  });

  it('renders info toast correctly', () => {
    const toast: Toast = {
      id: '1',
      type: 'info',
      title: 'Info',
      message: 'Here is some information'
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Here is some information')).toBeInTheDocument();
  });

  it('renders toast without message', () => {
    const toast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!'
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.queryByText('Operation completed successfully')).not.toBeInTheDocument();
  });

  it('renders toast with action button', () => {
    const mockAction = vi.fn();
    const toast: Toast = {
      id: '1',
      type: 'info',
      title: 'Info',
      message: 'Click to retry',
      action: {
        label: 'Retry',
        onClick: mockAction
      }
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    const actionButton = screen.getByText('Retry');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(mockAction).toHaveBeenCalled();
  });

  it('calls onDismiss when close button is clicked', () => {
    const toast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!'
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnDismiss).toHaveBeenCalledWith('1');
  });

  it('auto-dismisses toast after duration', async () => {
    const toast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!',
      duration: 1000
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith('1');
    });
  });

  it('does not auto-dismiss when duration is 0', async () => {
    const toast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!',
      duration: 0
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    // Fast-forward time
    vi.advanceTimersByTime(10000);
    
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('renders multiple toasts', () => {
    const toasts: Toast[] = [
      { id: '1', type: 'success', title: 'Success 1' },
      { id: '2', type: 'error', title: 'Error 1' },
      { id: '3', type: 'warning', title: 'Warning 1' }
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Success 1')).toBeInTheDocument();
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Warning 1')).toBeInTheDocument();
  });

  it('applies correct position classes', () => {
    const toast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!'
    };

    const { rerender } = render(
      <ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} position="top-right" />
    );
    
    expect(screen.getByText('Success!').closest('.fixed')).toHaveClass('top-0', 'right-0');

    rerender(
      <ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} position="bottom-left" />
    );
    
    expect(screen.getByText('Success!').closest('.fixed')).toHaveClass('bottom-0', 'left-0');
  });

  it('handles toast entrance animation', async () => {
    const toast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!'
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    // Initially should be off-screen
    const toastElement = screen.getByText('Success!').closest('.transform');
    expect(toastElement).toHaveClass('translate-x-full', 'opacity-0');
    
    // After animation delay, should be visible
    vi.advanceTimersByTime(20);
    
    await waitFor(() => {
      expect(toastElement).toHaveClass('translate-x-0', 'opacity-100');
    });
  });

  it('handles toast exit animation', async () => {
    const toast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!'
    };

    render(<ToastContainer toasts={[toast]} onDismiss={mockOnDismiss} />);
    
    // Wait for entrance animation
    vi.advanceTimersByTime(20);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Should start exit animation
    const toastElement = screen.getByText('Success!').closest('.transform');
    expect(toastElement).toHaveClass('translate-x-full', 'opacity-0');
    
    // After exit animation, onDismiss should be called
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith('1');
    });
  });
});