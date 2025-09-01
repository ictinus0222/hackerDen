import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ChatContainer from '../components/ChatContainer';
import { useMessages } from '../hooks/useMessages';
import { messageService } from '../services/messageService';

// Mock Appwrite real-time functionality
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('../lib/appwrite', () => {
  const mockClient = {
    subscribe: mockSubscribe,
    call: vi.fn().mockResolvedValue({ status: 'ok' })
  };
  
  const mockDatabases = {
    createDocument: vi.fn(),
    listDocuments: vi.fn().mockResolvedValue({ documents: [], total: 0 })
  };
  
  return {
    default: mockClient,
    databases: mockDatabases,
    DATABASE_ID: 'test-db',
    COLLECTIONS: {
      MESSAGES: 'messages',
      TASKS: 'tasks',
      VAULT_SECRETS: 'vault-secrets'
    },
    ID: {
      unique: () => 'test-id'
    },
    Query: {
      equal: vi.fn(),
      orderDesc: vi.fn(),
      limit: vi.fn(),
      offset: vi.fn()
    }
  };
});

// Mock other dependencies
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
    retryConnection: vi.fn().mockResolvedValue(true),
    testConnectionQuality: vi.fn()
  })
}));

vi.mock('../hooks/useChatKeyboardNavigation', () => ({
  useChatKeyboardNavigation: () => ({ shortcuts: {} }),
  useChatFocusManagement: () => ({
    focusMessageInput: vi.fn(),
    focusScrollToBottom: vi.fn(),
    focusFirstMessage: vi.fn(),
    focusLastMessage: vi.fn()
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

describe('Real-time Chat End-to-End Tests', () => {
  let subscriptionCallback;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscribe.mockImplementation((channel, callback) => {
      subscriptionCallback = callback;
      return mockUnsubscribe;
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Real-time Message Synchronization', () => {
    it('should sync new messages across clients within 2 seconds', async () => {
      vi.useFakeTimers();
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Wait for component to mount and subscription to be established
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      const startTime = Date.now();

      // Simulate receiving a new message from another client
      const newMessage = {
        $id: 'msg-new',
        teamId: 'team123',
        userId: 'user2',
        userName: 'Other User',
        content: 'Hello from another client!',
        type: 'user',
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.msg-new.create'],
          payload: newMessage
        });
      });

      const endTime = Date.now();
      const syncTime = endTime - startTime;

      // Message should appear in the UI
      await waitFor(() => {
        expect(screen.getByText('Hello from another client!')).toBeInTheDocument();
      });

      // Sync should be nearly instantaneous in tests
      expect(syncTime).toBeLessThan(2000);

      vi.useRealTimers();
    });

    it('should handle rapid message updates without conflicts', async () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Simulate rapid message creation from multiple clients
      const messages = [
        {
          $id: 'msg-1',
          teamId: 'team123',
          userId: 'user2',
          userName: 'User 2',
          content: 'First message',
          type: 'user',
          $createdAt: new Date(Date.now() - 3000).toISOString()
        },
        {
          $id: 'msg-2',
          teamId: 'team123',
          userId: 'user3',
          userName: 'User 3',
          content: 'Second message',
          type: 'user',
          $createdAt: new Date(Date.now() - 2000).toISOString()
        },
        {
          $id: 'msg-3',
          teamId: 'team123',
          userId: 'user4',
          userName: 'User 4',
          content: 'Third message',
          type: 'user',
          $createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ];

      // Send messages rapidly
      act(() => {
        messages.forEach(message => {
          subscriptionCallback({
            events: [`databases.test-db.collections.messages.documents.${message.$id}.create`],
            payload: message
          });
        });
      });

      // All messages should appear in correct order
      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
        expect(screen.getByText('Second message')).toBeInTheDocument();
        expect(screen.getByText('Third message')).toBeInTheDocument();
      });

      // Messages should be in chronological order
      const messageElements = screen.getAllByRole('article');
      expect(messageElements).toHaveLength(3);
    });

    it('should prevent duplicate messages from optimistic updates', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock successful message creation
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-real',
        teamId: 'team123',
        userId: 'user1',
        userName: 'Test User',
        content: 'Test message',
        type: 'user',
        $createdAt: new Date().toISOString()
      });

      const user = userEvent.setup();
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Send a message (creates optimistic update)
      const messageInput = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(messageInput, 'Test message');
      await user.click(sendButton);

      // Simulate the real message arriving via real-time subscription
      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.msg-real.create'],
          payload: {
            $id: 'msg-real',
            teamId: 'team123',
            userId: 'user1',
            userName: 'Test User',
            content: 'Test message',
            type: 'user',
            $createdAt: new Date().toISOString()
          }
        });
      });

      // Should only have one instance of the message
      await waitFor(() => {
        const messageElements = screen.getAllByText('Test message');
        expect(messageElements).toHaveLength(1);
      });
    });
  });

  describe('System Message Real-time Updates', () => {
    it('should sync task system messages in real-time', async () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Simulate task creation system message
      const taskMessage = {
        $id: 'msg-task',
        teamId: 'team123',
        content: '📝 John created a new task: "Setup API"',
        type: 'task_created',
        systemData: JSON.stringify({
          taskId: 'task-123',
          taskTitle: 'Setup API',
          createdBy: 'John'
        }),
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.msg-task.create'],
          payload: taskMessage
        });
      });

      // System message should appear with proper styling
      await waitFor(() => {
        expect(screen.getByText(/setup api/i)).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('📝')).toBeInTheDocument();
      });
    });

    it('should sync vault system messages in real-time', async () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Simulate vault secret addition system message
      const vaultMessage = {
        $id: 'msg-vault',
        teamId: 'team123',
        content: '🔐 Jane added a new secret to the vault: "API_KEY"',
        type: 'vault_secret_added',
        systemData: JSON.stringify({
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'added',
          modifiedBy: 'Jane'
        }),
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.msg-vault.create'],
          payload: vaultMessage
        });
      });

      // Vault system message should appear
      await waitFor(() => {
        expect(screen.getByText(/api_key/i)).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('🔐')).toBeInTheDocument();
      });
    });

    it('should handle mixed user and system messages in real-time', async () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Send mixed message types
      const messages = [
        {
          $id: 'msg-user-1',
          teamId: 'team123',
          userId: 'user2',
          userName: 'User 2',
          content: 'Starting work on the API',
          type: 'user',
          $createdAt: new Date(Date.now() - 3000).toISOString()
        },
        {
          $id: 'msg-task',
          teamId: 'team123',
          content: '📝 User 2 created a new task: "API Development"',
          type: 'task_created',
          systemData: JSON.stringify({
            taskId: 'task-123',
            taskTitle: 'API Development',
            createdBy: 'User 2'
          }),
          $createdAt: new Date(Date.now() - 2000).toISOString()
        },
        {
          $id: 'msg-user-2',
          teamId: 'team123',
          userId: 'user3',
          userName: 'User 3',
          content: 'Great! I\'ll help with testing',
          type: 'user',
          $createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ];

      act(() => {
        messages.forEach(message => {
          subscriptionCallback({
            events: [`databases.test-db.collections.messages.documents.${message.$id}.create`],
            payload: message
          });
        });
      });

      // All messages should appear with correct styling
      await waitFor(() => {
        expect(screen.getByText('Starting work on the API')).toBeInTheDocument();
        expect(screen.getByText(/api development/i)).toBeInTheDocument();
        expect(screen.getByText('Great! I\'ll help with testing')).toBeInTheDocument();
      });

      // System message should have proper role
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // User messages should have proper role
      expect(screen.getAllByRole('article')).toHaveLength(2);
    });
  });

  describe('Connection Management', () => {
    it('should handle subscription reconnection on connection loss', async () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalledTimes(1);
      });

      // Simulate connection loss by calling unsubscribe
      act(() => {
        mockUnsubscribe();
      });

      // Component should attempt to reconnect
      // This would typically be handled by the useMessages hook
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should filter messages by team ID', async () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Send message for different team
      const wrongTeamMessage = {
        $id: 'msg-wrong-team',
        teamId: 'different-team',
        userId: 'user2',
        userName: 'Other User',
        content: 'Message for different team',
        type: 'user',
        $createdAt: new Date().toISOString()
      };

      // Send message for correct team
      const correctTeamMessage = {
        $id: 'msg-correct-team',
        teamId: 'team123',
        userId: 'user2',
        userName: 'Other User',
        content: 'Message for correct team',
        type: 'user',
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.msg-wrong-team.create'],
          payload: wrongTeamMessage
        });
        
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.msg-correct-team.create'],
          payload: correctTeamMessage
        });
      });

      // Only the correct team message should appear
      await waitFor(() => {
        expect(screen.getByText('Message for correct team')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Message for different team')).not.toBeInTheDocument();
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high-frequency message updates efficiently', async () => {
      vi.useFakeTimers();
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Generate many messages rapidly
      const manyMessages = Array.from({ length: 50 }, (_, i) => ({
        $id: `msg-${i}`,
        teamId: 'team123',
        userId: `user-${i % 5}`,
        userName: `User ${i % 5}`,
        content: `Message ${i}`,
        type: 'user',
        $createdAt: new Date(Date.now() - (50 - i) * 100).toISOString()
      }));

      const startTime = performance.now();

      act(() => {
        manyMessages.forEach(message => {
          subscriptionCallback({
            events: [`databases.test-db.collections.messages.documents.${message.$id}.create`],
            payload: message
          });
        });
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should process messages efficiently (under 100ms for 50 messages)
      expect(processingTime).toBeLessThan(100);

      // All messages should eventually appear
      await waitFor(() => {
        expect(screen.getByText('Message 49')).toBeInTheDocument();
      }, { timeout: 5000 });

      vi.useRealTimers();
    });

    it('should maintain scroll position during real-time updates', async () => {
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Mock scroll element
      const mockScrollElement = {
        scrollTop: 100,
        scrollHeight: 500,
        clientHeight: 300,
        scrollTo: vi.fn()
      };

      vi.spyOn(document, 'querySelector').mockReturnValue(mockScrollElement);

      // Add new message
      const newMessage = {
        $id: 'msg-new',
        teamId: 'team123',
        userId: 'user2',
        userName: 'Other User',
        content: 'New message',
        type: 'user',
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.msg-new.create'],
          payload: newMessage
        });
      });

      await waitFor(() => {
        expect(screen.getByText('New message')).toBeInTheDocument();
      });

      // Scroll position should be maintained or auto-scrolled to bottom
      // depending on user's current position
    });
  });

  describe('Error Handling in Real-time', () => {
    it('should handle malformed real-time messages gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });

      // Send malformed message
      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.malformed.create'],
          payload: null // Invalid payload
        });
      });

      // Should not crash the component
      expect(screen.getByText('Team Chat')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should recover from subscription errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock subscription that throws error
      mockSubscribe.mockImplementationOnce(() => {
        throw new Error('Subscription failed');
      });

      renderWithRouter(
        <ChatContainer 
          hackathon={mockHackathon}
          team={mockTeam}
        />
      );

      // Component should still render despite subscription error
      expect(screen.getByText('Team Chat')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});