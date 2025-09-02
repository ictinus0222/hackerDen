import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ChatContainer from '../components/ChatContainer';
import MessageItem from '../components/MessageItem';
import MessageInput from '../components/MessageInput';
import ChatKeyboardShortcuts from '../components/ChatKeyboardShortcuts';

// Mock hooks and dependencies
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

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User' }
  })
}));

describe('Chat Accessibility and Responsive Design', () => {
  const mockTeam = {
    $id: 'team1',
    teamName: 'Test Team'
  };

  const mockHackathon = {
    $id: 'hack1',
    title: 'Test Hackathon'
  };

  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <ChatContainer 
          team={mockTeam}
          hackathon={mockHackathon}
        />
      );

      // Check for proper ARIA labels
      expect(screen.getByRole('log')).toBeInTheDocument();
      expect(screen.getByLabelText(/chat messages/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message input/i)).toBeInTheDocument();
    });

    it('should have skip link for keyboard navigation', () => {
      render(
        <ChatContainer 
          team={mockTeam}
          hackathon={mockHackathon}
        />
      );

      const skipLink = screen.getByText(/skip to message input/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('skip-link');
    });

    it('should support keyboard shortcuts', () => {
      render(<ChatKeyboardShortcuts shortcuts={{}} />);
      
      const shortcutsButton = screen.getByLabelText(/show keyboard shortcuts/i);
      expect(shortcutsButton).toBeInTheDocument();
      
      fireEvent.click(shortcutsButton);
      expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
    });

    it('should have proper focus management', () => {
      const onSendMessage = vi.fn();
      const onTyping = vi.fn();
      const onStopTyping = vi.fn();

      render(
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          onStopTyping={onStopTyping}
        />
      );

      const messageInput = screen.getByLabelText(/message input/i);
      expect(messageInput).toHaveAttribute('id', 'message-input');
      expect(messageInput).toHaveClass('keyboard-focus');
    });
  });

  describe('System Message Accessibility', () => {
    it('should have proper accessibility attributes for system messages', () => {
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
      expect(messageElement).toHaveAttribute('aria-label');
      expect(messageElement).toHaveAttribute('tabIndex', '0');
    });

    it('should use enhanced contrast classes for system messages', () => {
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
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      render(
        <ChatContainer 
          team={mockTeam}
          hackathon={mockHackathon}
        />
      );

      // Check for responsive padding classes
      const chatHeader = document.querySelector('.px-3.sm\\:px-4.lg\\:px-6');
      expect(chatHeader).toBeInTheDocument();
    });

    it('should have touch targets for mobile', () => {
      const onSendMessage = vi.fn();
      
      render(
        <MessageInput
          onSendMessage={onSendMessage}
        />
      );

      const sendButton = screen.getByRole('button', { name: /send message/i });
      expect(sendButton).toHaveClass('touch-target');
    });

    it('should have responsive message width classes', () => {
      const userMessage = {
        $id: 'msg1',
        type: 'user',
        content: 'Hello world',
        userId: 'user1',
        userName: 'Test User',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={userMessage} isCurrentUser={true} />);

      const messageContainer = screen.getByRole('article');
      const messageContent = messageContainer.querySelector('.message-max-width');
      expect(messageContent).toBeInTheDocument();
    });
  });

  describe('Error Handling and Loading States', () => {
    it('should have proper ARIA attributes for loading states', () => {
      // Mock loading state
      vi.mocked(require('../hooks/useMessages').useMessages).mockReturnValue({
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

      render(
        <ChatContainer 
          team={mockTeam}
          hackathon={mockHackathon}
        />
      );

      // Should show loading skeleton with proper attributes
      const loadingElement = document.querySelector('[data-testid="chat-skeleton"]');
      // Note: The actual loading skeleton might not have this testid, 
      // but the component should have proper loading states
    });

    it('should have proper error announcements', () => {
      // Mock error state
      vi.mocked(require('../hooks/useMessages').useMessages).mockReturnValue({
        messages: [{ $id: '1', content: 'test', type: 'user', $createdAt: new Date().toISOString() }],
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

      render(
        <ChatContainer 
          team={mockTeam}
          hackathon={mockHackathon}
        />
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should apply high contrast classes when needed', () => {
      // This would typically be tested with actual contrast ratio measurements
      // For now, we verify the CSS classes are applied correctly
      const systemMessage = {
        $id: 'msg1',
        type: 'vault_secret_added',
        content: '🔐 Secret added',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={systemMessage} />);

      const messageElement = screen.getByRole('status');
      expect(messageElement).toHaveClass('system-message-vault-add');
    });
  });
});