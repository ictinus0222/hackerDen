import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MessageList from '../MessageList';

// Mock the scroll optimization hook
vi.mock('../../hooks/useScrollOptimization', () => ({
  useScrollOptimization: (callback) => callback
}));

// Mock the UI components
vi.mock('../ui/scroll-area', () => ({
  ScrollArea: ({ children, onScroll, ...props }) => (
    <div data-testid="scroll-area" onScroll={onScroll} {...props}>
      {children}
    </div>
  )
}));

vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}));

vi.mock('../MessageItem', () => ({
  default: ({ message }) => (
    <div data-testid={`message-${message.$id}`}>
      {message.content}
    </div>
  )
}));

vi.mock('../TypingIndicator', () => ({
  default: () => <div data-testid="typing-indicator">Typing...</div>
}));

describe('MessageList - Scrolling and History', () => {
  const mockMessages = Array.from({ length: 50 }, (_, i) => ({
    $id: `msg-${i}`,
    content: `Message ${i}`,
    userId: i % 2 === 0 ? 'user1' : 'user2',
    userName: `User ${i % 2 + 1}`,
    $createdAt: new Date(Date.now() - (50 - i) * 1000).toISOString(),
    type: 'user'
  }));

  const defaultProps = {
    messages: mockMessages,
    loading: false,
    hasMore: true,
    loadingMore: false,
    onLoadMore: vi.fn(),
    currentUserId: 'user1',
    typingUsers: new Set(),
    onRetryMessage: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders messages correctly', () => {
    render(<MessageList {...defaultProps} />);
    
    expect(screen.getByTestId('message-msg-0')).toBeInTheDocument();
    expect(screen.getByTestId('message-msg-49')).toBeInTheDocument();
  });

  it('shows load more indicator when loading more messages', () => {
    render(<MessageList {...defaultProps} loadingMore={true} />);
    
    expect(screen.getByText('Loading earlier messages...')).toBeInTheDocument();
  });

  it('shows beginning of conversation indicator when no more messages', () => {
    render(<MessageList {...defaultProps} hasMore={false} />);
    
    expect(screen.getByText('This is the beginning of your team conversation')).toBeInTheDocument();
  });

  it('calls onLoadMore when scrolled to top', async () => {
    const onLoadMore = vi.fn().mockResolvedValue();
    render(<MessageList {...defaultProps} onLoadMore={onLoadMore} />);
    
    const scrollArea = screen.getByTestId('scroll-area');
    
    // Mock scroll to top
    Object.defineProperty(scrollArea, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(scrollArea, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(scrollArea, 'clientHeight', { value: 500, writable: true });
    
    fireEvent.scroll(scrollArea);
    
    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalled();
    });
  });

  it('shows scroll to bottom button when not at bottom', () => {
    render(<MessageList {...defaultProps} />);
    
    const scrollArea = screen.getByTestId('scroll-area');
    
    // Mock scroll position not at bottom
    Object.defineProperty(scrollArea, 'scrollTop', { value: 100, writable: true });
    Object.defineProperty(scrollArea, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(scrollArea, 'clientHeight', { value: 500, writable: true });
    
    fireEvent.scroll(scrollArea);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles empty message list correctly', () => {
    render(<MessageList {...defaultProps} messages={[]} hasMore={false} />);
    
    expect(screen.getByText('Start the conversation')).toBeInTheDocument();
    expect(screen.getByText('Send your first message to get the team chat started!')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<MessageList {...defaultProps} loading={true} />);
    
    // Should show loading skeleton instead of messages
    expect(screen.queryByTestId('message-msg-0')).not.toBeInTheDocument();
  });

  it('maintains scroll position during message updates', async () => {
    const { rerender } = render(<MessageList {...defaultProps} />);
    
    const scrollArea = screen.getByTestId('scroll-area');
    
    // Mock scroll position
    Object.defineProperty(scrollArea, 'scrollTop', { value: 200, writable: true });
    Object.defineProperty(scrollArea, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(scrollArea, 'clientHeight', { value: 500, writable: true });
    
    fireEvent.scroll(scrollArea);
    
    // Add new messages (simulating load more)
    const newMessages = [
      ...Array.from({ length: 10 }, (_, i) => ({
        $id: `new-msg-${i}`,
        content: `New Message ${i}`,
        userId: 'user1',
        userName: 'User 1',
        $createdAt: new Date(Date.now() - (60 + i) * 1000).toISOString(),
        type: 'user'
      })),
      ...mockMessages
    ];
    
    rerender(<MessageList {...defaultProps} messages={newMessages} />);
    
    // Should maintain relative scroll position
    expect(screen.getByTestId('message-new-msg-0')).toBeInTheDocument();
    expect(screen.getByTestId('message-msg-0')).toBeInTheDocument();
  });

  it('auto-scrolls to bottom for new messages when user is at bottom', () => {
    const { rerender } = render(<MessageList {...defaultProps} />);
    
    const scrollArea = screen.getByTestId('scroll-area');
    
    // Mock being at bottom
    Object.defineProperty(scrollArea, 'scrollTop', { value: 450, writable: true });
    Object.defineProperty(scrollArea, 'scrollHeight', { value: 500, writable: true });
    Object.defineProperty(scrollArea, 'clientHeight', { value: 500, writable: true });
    
    fireEvent.scroll(scrollArea);
    
    // Add new message
    const newMessages = [...mockMessages, {
      $id: 'new-msg',
      content: 'New message',
      userId: 'user2',
      userName: 'User 2',
      $createdAt: new Date().toISOString(),
      type: 'user'
    }];
    
    rerender(<MessageList {...defaultProps} messages={newMessages} />);
    
    expect(screen.getByTestId('message-new-msg')).toBeInTheDocument();
  });

  it('does not auto-scroll when user is not at bottom', () => {
    const { rerender } = render(<MessageList {...defaultProps} />);
    
    const scrollArea = screen.getByTestId('scroll-area');
    
    // Mock being away from bottom
    Object.defineProperty(scrollArea, 'scrollTop', { value: 100, writable: true });
    Object.defineProperty(scrollArea, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(scrollArea, 'clientHeight', { value: 500, writable: true });
    
    fireEvent.scroll(scrollArea);
    
    // Add new message
    const newMessages = [...mockMessages, {
      $id: 'new-msg',
      content: 'New message',
      userId: 'user2',
      userName: 'User 2',
      $createdAt: new Date().toISOString(),
      type: 'user'
    }];
    
    rerender(<MessageList {...defaultProps} messages={newMessages} />);
    
    // Should show scroll to bottom button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});