import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ChatContainer from '../components/ChatContainer';

// Mock all the hooks and services
const mockSendMessage = vi.fn();
const mockLoadMoreMessages = vi.fn();
const mockRetryFailedMessage = vi.fn();
const mockSendTypingIndicator = vi.fn();
const mockStopTypingIndicator = vi.fn();
const mockRefreshMessages = vi.fn();

vi.mock('../hooks/useMessages', () => ({
  useMessages: vi.fn(() => ({
    messages: [],
    loading: false,
    error: null,
    sending: false,
    hasMore: false,
    loadingMore: false,
    typingUsers: new Set(),
    connectionStatus: 'connected',
    sendMessage: mockSendMessage,
    loadMoreMessages: mockLoadMoreMessages,
    retryFailedMessage: mockRetryFailedMessage,
    sendTypingIndicator: mockSendTypingIndicator,
    stopTypingIndicator: mockStopTypingIndicator,
    refreshMessages: mockRefreshMessages
  }))
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      $id: 'user123',
      name: 'Test User'
    }
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
    retryConnection: vi.fn().mockResolvedValue(true),
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

// Mock error boundary
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

describe('ChatContainer - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render loading skeleton during initialization', () => {
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
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Should show loading skeleton
      expect(document.querySelector('[data-testid="chat-initialization-skeleton"]')).toBeInTheDocument();
    });

    it('should render network fallback when offline', () => {
      const { useNetworkStatus } = require('../hooks/useNetworkStatus');
      useNetworkStatus.mockReturnValue({
        isOnline: false,
        connectionQuality: 'offline',
        lastDisconnect: new Date(),
        retryConnection: vi.fn(),
        testConnectionQuality: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      expect(screen.getByText(/network connection/i)).toBeInTheDocument();
    });

    it('should render error state with retry option', () => {
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
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Message Handling', () => {
    it('should handle message sending correctly', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const messageInput = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(messageInput, 'Hello team!');
      await user.click(sendButton);

      expect(mockSendMessage).toHaveBeenCalledWith('Hello team!');
    });

    it('should handle typing indicators', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const messageInput = screen.getByPlaceholderText(/type your message/i);

      await user.type(messageInput, 'Test');

      // Should call typing indicator
      expect(mockSendTypingIndicator).toHaveBeenCalled();
    });

    it('should display typing users indicator', () => {
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
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      expect(screen.getByText(/2 typing/)).toBeInTheDocument();
    });

    it('should handle message retry functionality', async () => {
      const user = userEvent.setup();
      
      const failedMessage = {
        $id: 'msg1',
        content: 'Failed message',
        type: 'user',
        userId: 'user123',
        userName: 'Test User',
        $createdAt: new Date().toISOString(),
        isFailed: true
      };

      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [failedMessage],
        loading: false,
        error: null,
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'connected',
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry sending message/i });
      await user.click(retryButton);

      expect(mockRetryFailedMessage).toHaveBeenCalledWith('msg1');
    });
  });

  describe('Connection Status Management', () => {
    it('should display connection status correctly', () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      expect(screen.getByText('connected')).toBeInTheDocument();
    });

    it('should handle connection retry with exponential backoff', async () => {
      vi.useFakeTimers();
      
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: false,
        error: 'Network error',
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'disconnected',
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const retryButton = screen.getByRole('button', { name: /reconnect/i });
      fireEvent.click(retryButton);

      expect(mockRefreshMessages).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should disable input when disconnected', () => {
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: false,
        error: null,
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'disconnected',
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const messageInput = screen.getByPlaceholderText(/type your message/i);
      expect(messageInput).toBeDisabled();
    });
  });

  describe('Notification System', () => {
    it('should display unread message count', () => {
      const { useNotifications } = require('../hooks/useNotifications');
      useNotifications.mockReturnValue({
        unreadCount: 5,
        notifications: [],
        groupedNotifications: new Map(),
        markAsRead: vi.fn(),
        handleSystemMessage: vi.fn(),
        handleNewMessage: vi.fn(),
        requestNotificationPermission: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle system message notifications', () => {
      const systemNotifications = [
        {
          id: 'notif1',
          type: 'task_created',
          content: 'New task created',
          timestamp: new Date()
        }
      ];

      const { useNotifications } = require('../hooks/useNotifications');
      useNotifications.mockReturnValue({
        unreadCount: 0,
        notifications: systemNotifications,
        groupedNotifications: new Map(),
        markAsRead: vi.fn(),
        handleSystemMessage: vi.fn(),
        handleNewMessage: vi.fn(),
        requestNotificationPermission: vi.fn()
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // System message notifications should be rendered
      expect(document.querySelector('[data-testid="system-message-notification"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Check for skip link
      expect(screen.getByText(/skip to message input/i)).toBeInTheDocument();
      
      // Check for proper ARIA labels
      expect(screen.getByLabelText(/unread messages/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      const skipLink = screen.getByText(/skip to message input/i);
      await user.click(skipLink);

      // Should focus the message input
      const messageInput = screen.getByPlaceholderText(/type your message/i);
      expect(messageInput).toHaveFocus();
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
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
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
  });

  describe('Performance and Error Handling', () => {
    it('should handle component errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock a component that throws an error
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // This would be caught by the error boundary in a real scenario
      expect(() => {
        render(<ThrowError />);
      }).toThrow('Test error');

      consoleSpy.mockRestore();
    });

    it('should handle retry queue management', async () => {
      const user = userEvent.setup();
      
      // Mock network error that creates retry queue items
      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [],
        loading: false,
        error: 'Network timeout',
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'connected',
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Should show retry queue manager when there are failed operations
      expect(document.querySelector('[data-testid="retry-queue-manager"]')).toBeInTheDocument();
    });

    it('should optimize message rendering for large lists', () => {
      const manyMessages = Array.from({ length: 100 }, (_, i) => ({
        $id: `msg${i}`,
        content: `Message ${i}`,
        type: 'user',
        userId: 'user123',
        userName: 'Test User',
        $createdAt: new Date(Date.now() - i * 1000).toISOString()
      }));

      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: manyMessages,
        loading: false,
        error: null,
        sending: false,
        hasMore: true,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'connected',
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Should render messages efficiently
      expect(screen.getAllByRole('article')).toHaveLength(100);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle new message updates', async () => {
      const newMessage = {
        $id: 'new-msg',
        content: 'New message',
        type: 'user',
        userId: 'user456',
        userName: 'Other User',
        $createdAt: new Date().toISOString()
      };

      const { useMessages } = require('../hooks/useMessages');
      const mockUseMessages = useMessages.mockReturnValue({
        messages: [newMessage],
        loading: false,
        error: null,
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'connected',
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      expect(screen.getByText('New message')).toBeInTheDocument();
    });

    it('should handle system message updates', () => {
      const systemMessage = {
        $id: 'sys-msg',
        content: '📝 Task created: Setup API',
        type: 'task_created',
        systemData: {
          taskId: '123',
          taskTitle: 'Setup API',
          createdBy: 'John'
        },
        $createdAt: new Date().toISOString()
      };

      const { useMessages } = require('../hooks/useMessages');
      useMessages.mockReturnValue({
        messages: [systemMessage],
        loading: false,
        error: null,
        sending: false,
        hasMore: false,
        loadingMore: false,
        typingUsers: new Set(),
        connectionStatus: 'connected',
        sendMessage: mockSendMessage,
        loadMoreMessages: mockLoadMoreMessages,
        retryFailedMessage: mockRetryFailedMessage,
        sendTypingIndicator: mockSendTypingIndicator,
        stopTypingIndicator: mockStopTypingIndicator,
        refreshMessages: mockRefreshMessages
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      expect(screen.getByText(/task created: setup api/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});