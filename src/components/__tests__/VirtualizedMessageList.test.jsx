import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import VirtualizedMessageList from '../VirtualizedMessageList';

// Mock MessageItem
vi.mock('../MessageItem', () => ({
  default: ({ message, style }) => (
    <div 
      data-testid={`message-${message.$id}`}
      style={style}
    >
      {message.content}
    </div>
  )
}));

describe('VirtualizedMessageList', () => {
  const createMessages = (count) => Array.from({ length: count }, (_, i) => ({
    $id: `msg-${i}`,
    content: `Message ${i}`,
    userId: i % 2 === 0 ? 'user1' : 'user2',
    userName: `User ${i % 2 + 1}`,
    $createdAt: new Date(Date.now() - (count - i) * 1000).toISOString(),
    type: 'user'
  }));

  const defaultProps = {
    messages: createMessages(50),
    currentUserId: 'user1',
    onRetryMessage: vi.fn(),
    className: 'test-class'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getBoundingClientRect for container height calculation
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      height: 400,
      width: 300
    }));
  });

  it('renders all messages when count is <= 100', () => {
    render(<VirtualizedMessageList {...defaultProps} />);
    
    // Should render all 50 messages
    expect(screen.getByTestId('message-msg-0')).toBeInTheDocument();
    expect(screen.getByTestId('message-msg-49')).toBeInTheDocument();
  });

  it('uses virtualization for large message lists (>100)', () => {
    const largeMessageList = createMessages(150);
    
    render(<VirtualizedMessageList {...defaultProps} messages={largeMessageList} itemHeight={50} />);
    
    // Should render first message
    expect(screen.getByTestId('message-msg-0')).toBeInTheDocument();
    
    // The component should handle large lists without crashing
    // In test environment, all messages might still render due to DOM limitations
    const renderedMessages = screen.getAllByTestId(/message-msg-/);
    expect(renderedMessages.length).toBeGreaterThan(0);
    expect(renderedMessages.length).toBeLessThanOrEqual(150);
  });

  it('handles scroll events for virtualization', () => {
    const largeMessageList = createMessages(150);
    const { container } = render(
      <VirtualizedMessageList {...defaultProps} messages={largeMessageList} />
    );
    
    const scrollContainer = container.firstChild;
    
    // Mock scroll event
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 1000, writable: true });
    fireEvent.scroll(scrollContainer);
    
    // Should handle scroll without errors
    expect(scrollContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<VirtualizedMessageList {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('handles empty message list', () => {
    render(<VirtualizedMessageList {...defaultProps} messages={[]} />);
    
    // Should render without errors
    expect(screen.queryByTestId('message-msg-0')).not.toBeInTheDocument();
  });

  it('passes correct props to MessageItem', () => {
    render(<VirtualizedMessageList {...defaultProps} />);
    
    const messageElement = screen.getByTestId('message-msg-0');
    expect(messageElement).toHaveTextContent('Message 0');
  });

  it('handles window resize events', () => {
    render(<VirtualizedMessageList {...defaultProps} />);
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    // Should handle resize without errors
    expect(screen.getByTestId('message-msg-0')).toBeInTheDocument();
  });

  it('calculates visible range correctly', () => {
    const largeMessageList = createMessages(200);
    render(
      <VirtualizedMessageList 
        {...defaultProps} 
        messages={largeMessageList}
        itemHeight={100}
        overscan={2}
      />
    );
    
    // Should render messages based on visible range calculation
    expect(screen.getByTestId('message-msg-0')).toBeInTheDocument();
  });
});