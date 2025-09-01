import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import ChatContainer from '../components/ChatContainer';
import MessageItem from '../components/MessageItem';
import MessageInput from '../components/MessageInput';
import ChatHeader from '../components/ChatHeader';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock('../hooks/useMessages', () => ({
  useMessages: () => ({
    messages: [],
    loading: false,
    error: null,
    sending: false,
    hasMore: false,
    loadingMore: false,
    typingUsers: new Set(),
    connectionStatus: 'connected',
    sendMessage: vi.fn(),
    loadMoreMessages: vi.fn(),
    retryFailedMessage: vi.fn(),
    sendTypingIndicator: vi.fn(),
    stopTypingIndicator: vi.fn(),
    refreshMessages: vi.fn()
  })
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User' }
  })
}));

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: () => ({
    unreadCount: 0,
    notifications: [],
    groupedNotifications: new Map(),
    markAsRead: vi.fn(),
    handleSystemMessage: vi.fn(),
    handleNewMessage: vi.fn(),
    requestNotificationPermission: vi.fn()
  })
}));

vi.mock('../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    connectionQuality: 'good',
    lastDisconnect: null,
    retryConnection: vi.fn(),
    testConnectionQuality: vi.fn()
  })
}));

vi.mock('../hooks/useChatKeyboardNavigation', () => ({
  useChatKeyboardNavigation: () => ({
    shortcuts: {
      'Ctrl+Enter': 'Send message',
      'Ctrl+K': 'Focus input',
      'Ctrl+Shift+M': 'Mark as read'
    }
  }),
  useChatFocusManagement: () => ({
    focusMessageInput: vi.fn(),
    focusScrollToBottom: vi.fn(),
    focusFirstMessage: vi.fn(),
    focusLastMessage: vi.fn()
  })
}));

vi.mock('../hooks/useHackathonTeamMembers', () => ({
  useHackathonTeamMembers: () => ({
    members: [
      { id: '1', name: 'John Doe', online: true },
      { id: '2', name: 'Jane Smith', online: true }
    ]
  })
}));

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }) => children
}));

const mockTeam = {
  $id: 'team123',
  teamName: 'Test Team'
};

const mockHackathon = {
  $id: 'hack123',
  title: 'Test Hackathon'
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Chat Accessibility - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should have no accessibility violations in ChatContainer', async () => {
      const { container } = renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in ChatHeader', async () => {
      const { container } = renderWithRouter(
        <ChatHeader 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in MessageInput', async () => {
      const { container } = render(
        <MessageInput
          onSendMessage={vi.fn()}
          onTyping={vi.fn()}
          onStopTyping={vi.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in system messages', async () => {
      const systemMessage = {
        $id: 'msg1',
        type: 'task_created',
        content: '📝 John created a new task: "Setup API"',
        $createdAt: new Date().toISOString(),
        systemData: {
          taskId: '123',
          taskTitle: 'Setup API',
          createdBy: 'John'
        }
      };

      const { container } = render(
        <MessageItem message={systemMessage} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through all interactive elements', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByText(/skip to message input/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/unread messages/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText(/type your message/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /send/i })).toHaveFocus();
    });

    it('should support keyboard shortcuts', async () => {
      const user = userEvent.setup();
      const mockSendMessage = vi.fn();
      
      render(
        <MessageInput
          onSendMessage={mockSendMessage}
          onTyping={vi.fn()}
          onStopTyping={vi.fn()}
        />
      );

      const messageInput = screen.getByPlaceholderText(/type your message/i);
      await user.click(messageInput);
      await user.type(messageInput, 'Test message');

      // Ctrl+Enter should send message
      await user.keyboard('{Control>}{Enter}{/Control}');
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should handle escape key to clear input', async () => {
      const user = userEvent.setup();
      
      render(
        <MessageInput
          onSendMessage={vi.fn()}
          onTyping={vi.fn()}
          onStopTyping={vi.fn()}
        />
      );

      const messageInput = screen.getByPlaceholderText(/type your message/i);
      await user.click(messageInput);
      await user.type(messageInput, 'Test message');

      expect(messageInput).toHaveValue('Test message');

      // Escape should clear input
      await user.keyboard('{Escape}');
      expect(messageInput).toHaveValue('');
    });

    it('should support arrow key navigation in message history', async () => {
      const user = userEvent.setup();
      
      const messages = [
        {
          $id: 'msg1',
          content: 'First message',
          type: 'user',
          userId: 'user1',
          userName: 'User 1',
          $createdAt: new Date().toISOString()
        },
        {
          $id: 'msg2',
          content: 'Second message',
          type: 'user',
          userId: 'user2',
          userName: 'User 2',
          $createdAt: new Date().toISOString()
        }
      ];

      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages,
        loading: false,
        error: null,
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'connected',
        sendMessage: vi.fn(),
        loadMoreMessages: vi.fn(),
        retryFailedMessage: vi.fn(),
        sendTypingIndicator: vi.fn(),
        stopTypingIndicator: vi.fn(),
        refreshMessages: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Focus first message
      const firstMessage = screen.getAllByRole('article')[0];
      firstMessage.focus();
      expect(firstMessage).toHaveFocus();

      // Arrow down should move to next message
      await user.keyboard('{ArrowDown}');
      const secondMessage = screen.getAllByRole('article')[1];
      expect(secondMessage).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels for all interactive elements', () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Chat container should have proper role
      expect(screen.getByRole('log')).toBeInTheDocument();

      // Message input should have proper label
      expect(screen.getByLabelText(/message input/i)).toBeInTheDocument();

      // Send button should have proper label
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();

      // Notification indicator should have proper label
      expect(screen.getByLabelText(/unread messages/i)).toBeInTheDocument();
    });

    it('should announce new messages to screen readers', () => {
      const newMessage = {
        $id: 'msg1',
        content: 'New message arrived',
        type: 'user',
        userId: 'user2',
        userName: 'Other User',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={newMessage} />);

      const messageElement = screen.getByRole('article');
      expect(messageElement).toHaveAttribute('aria-label');
      expect(messageElement.getAttribute('aria-label')).toContain('Other User');
    });

    it('should announce system messages with proper context', () => {
      const systemMessage = {
        $id: 'msg1',
        type: 'task_created',
        content: '📝 John created a new task: "Setup API"',
        $createdAt: new Date().toISOString(),
        systemData: {
          taskId: '123',
          taskTitle: 'Setup API',
          createdBy: 'John'
        }
      };

      render(<MessageItem message={systemMessage} />);

      const messageElement = screen.getByRole('status');
      expect(messageElement).toHaveAttribute('aria-live', 'polite');
      expect(messageElement).toHaveAttribute('aria-label', 'Task creation notification');
    });

    it('should announce connection status changes', () => {
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: false,
        error: 'Connection lost',
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'disconnected',
        sendMessage: vi.fn(),
        loadMoreMessages: vi.fn(),
        retryFailedMessage: vi.fn(),
        sendTypingIndicator: vi.fn(),
        stopTypingIndicator: vi.fn(),
        refreshMessages: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should provide proper context for typing indicators', () => {
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: false,
        error: null,
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(['user1', 'user2']),
        connectionStatus: 'connected',
        sendMessage: vi.fn(),
        loadMoreMessages: vi.fn(),
        retryFailedMessage: vi.fn(),
        sendTypingIndicator: vi.fn(),
        stopTypingIndicator: vi.fn(),
        refreshMessages: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const typingIndicator = screen.getByText(/2 typing/);
      expect(typingIndicator).toHaveAttribute('aria-live', 'polite');
      expect(typingIndicator).toHaveAttribute('aria-label', '2 people are typing');
    });
  });

  describe('Visual Accessibility', () => {
    it('should have sufficient color contrast for all text elements', () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Check that text elements have proper contrast classes
      const headerText = screen.getByText('Team Chat');
      expect(headerText).toHaveClass('text-foreground');

      const subtitleText = screen.getByText(/test team • test hackathon/i);
      expect(subtitleText).toHaveClass('text-muted-foreground');
    });

    it('should have enhanced contrast for system messages', () => {
      const taskMessage = {
        $id: 'msg1',
        type: 'task_created',
        content: '📝 Task created',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={taskMessage} />);

      const messageElement = screen.getByRole('status');
      expect(messageElement).toHaveClass('system-message-task');
      expect(messageElement).toHaveClass('system-message');
    });

    it('should support high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Component should render without issues in high contrast mode
      expect(screen.getByText('Team Chat')).toBeInTheDocument();
    });

    it('should have proper focus indicators', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const messageInput = screen.getByPlaceholderText(/type your message/i);
      await user.click(messageInput);

      expect(messageInput).toHaveClass('keyboard-focus');
      expect(messageInput).toHaveFocus();
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Touch targets should be properly sized
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toHaveClass('touch-target');

      // Text should remain readable
      expect(screen.getByText('Team Chat')).toBeInTheDocument();
    });

    it('should have proper touch targets for mobile', () => {
      render(
        <MessageInput
          onSendMessage={vi.fn()}
          onTyping={vi.fn()}
          onStopTyping={vi.fn()}
        />
      );

      const sendButton = screen.getByRole('button', { name: /send message/i });
      expect(sendButton).toHaveClass('touch-target');
      
      // Touch target should be at least 44px (will be verified by CSS)
      const computedStyle = window.getComputedStyle(sendButton);
      expect(computedStyle.minHeight).toBe('44px');
    });

    it('should support zoom up to 200% without horizontal scrolling', () => {
      // Mock zoom level
      Object.defineProperty(document.documentElement, 'style', {
        value: { zoom: '200%' },
        writable: true
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Content should remain accessible at 200% zoom
      expect(screen.getByText('Team Chat')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    });
  });

  describe('Error State Accessibility', () => {
    it('should announce errors with proper urgency', () => {
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: false,
        error: 'Critical connection error',
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'disconnected',
        sendMessage: vi.fn(),
        loadMoreMessages: vi.fn(),
        retryFailedMessage: vi.fn(),
        sendTypingIndicator: vi.fn(),
        stopTypingIndicator: vi.fn(),
        refreshMessages: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
      expect(errorAlert).toHaveTextContent('Critical connection error');
    });

    it('should provide accessible retry mechanisms', () => {
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: false,
        error: 'Connection failed',
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'disconnected',
        sendMessage: vi.fn(),
        loadMoreMessages: vi.fn(),
        retryFailedMessage: vi.fn(),
        sendTypingIndicator: vi.fn(),
        stopTypingIndicator: vi.fn(),
        refreshMessages: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const retryButton = screen.getByRole('button', { name: /reconnect/i });
      expect(retryButton).toHaveAttribute('aria-label', 'Reconnect to chat');
      expect(retryButton).toHaveClass('touch-target');
    });

    it('should handle failed message retry accessibility', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();
      
      const failedMessage = {
        $id: 'msg1',
        content: 'Failed message',
        type: 'user',
        userId: 'user1',
        userName: 'Test User',
        $createdAt: new Date().toISOString(),
        isFailed: true
      };

      render(<MessageItem message={failedMessage} onRetry={mockRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry sending message/i });
      expect(retryButton).toHaveAttribute('title', 'Click to retry sending this message');
      
      await user.click(retryButton);
      expect(mockRetry).toHaveBeenCalledWith('msg1');
    });
  });

  describe('Loading State Accessibility', () => {
    it('should announce loading states to screen readers', () => {
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: true,
        error: null,
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'connecting',
        sendMessage: vi.fn(),
        loadMoreMessages: vi.fn(),
        retryFailedMessage: vi.fn(),
        sendTypingIndicator: vi.fn(),
        stopTypingIndicator: vi.fn(),
        refreshMessages: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const loadingElement = document.querySelector('[data-testid="chat-initialization-skeleton"]');
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading chat messages');
      expect(loadingElement).toHaveAttribute('role', 'status');
    });

    it('should provide context for sending states', () => {
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: false,
        error: null,
        sending: true,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'connected',
        sendMessage: vi.fn(),
        loadMoreMessages: vi.fn(),
        retryFailedMessage: vi.fn(),
        sendTypingIndicator: vi.fn(),
        stopTypingIndicator: vi.fn(),
        refreshMessages: vi.fn()
      });

      render(
        <MessageInput
          onSendMessage={vi.fn()}
          onTyping={vi.fn()}
          onStopTyping={vi.fn()}
          sending={true}
        />
      );

      const sendButton = screen.getByRole('button', { name: /sending/i });
      expect(sendButton).toBeDisabled();
      expect(sendButton).toHaveAttribute('aria-label', 'Sending message, please wait');
    });
  });
});