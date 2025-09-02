import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MessageItem from '../components/MessageItem';
import MessageInput from '../components/MessageInput';
import { messageService } from '../services/messageService';

// Mock dependencies
vi.mock('../lib/appwrite', () => {
  const mockClient = {
    subscribe: vi.fn(),
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
      MESSAGES: 'messages'
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

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Chat Functionality - Comprehensive Summary Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests - ChatContainer Component Logic', () => {
    it('should handle message sending correctly', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-123',
        teamId: 'team-123',
        content: 'Hello team!',
        type: 'user',
        $createdAt: new Date().toISOString()
      });

      const result = await messageService.sendMessage(
        'team-123',
        'user-123',
        'Hello team!',
        'Test User'
      );

      expect(result).toBeDefined();
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'messages',
        expect.any(String), // ID is generated dynamically
        expect.objectContaining({
          teamId: 'team-123',
          content: 'Hello team!',
          type: 'user'
        })
      );
    });

    it('should handle message loading with pagination', async () => {
      const { databases } = await import('../lib/appwrite');
      
      const mockMessages = [
        {
          $id: 'msg-1',
          content: 'First message',
          type: 'user',
          systemData: null,
          $createdAt: new Date().toISOString()
        },
        {
          $id: 'msg-2',
          content: 'Second message',
          type: 'user',
          systemData: null,
          $createdAt: new Date().toISOString()
        }
      ];

      databases.listDocuments.mockResolvedValueOnce({
        documents: mockMessages.reverse(), // Newest first from Appwrite
        total: 2
      });

      const result = await messageService.getMessages('team-123', 50, 0);

      expect(result.messages).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(2);
    });

    it('should handle connection errors gracefully', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockRejectedValueOnce(new Error('Network error'));

      await expect(messageService.sendMessage(
        'team-123',
        'user-123',
        'Hello team!',
        'Test User'
      )).rejects.toThrow('Failed to send message');
    });
  });

  describe('Integration Tests - System Message Generation', () => {
    it('should generate task creation system messages', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-task',
        teamId: 'team-123',
        content: '📝 John created a new task: "Setup API"',
        type: 'task_created',
        systemData: JSON.stringify({
          taskId: 'task-123',
          taskTitle: 'Setup API',
          createdBy: 'John'
        }),
        $createdAt: new Date().toISOString()
      });

      const result = await messageService.sendSystemMessage(
        'team-123',
        '📝 John created a new task: "Setup API"',
        'task_created',
        {
          taskId: 'task-123',
          taskTitle: 'Setup API',
          createdBy: 'John'
        }
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('task_created');
    });

    it('should generate vault system messages', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-vault',
        teamId: 'team-123',
        content: '🔐 Jane added a new secret to the vault: "API_KEY"',
        type: 'vault_secret_added',
        systemData: JSON.stringify({
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'added',
          modifiedBy: 'Jane'
        }),
        $createdAt: new Date().toISOString()
      });

      const result = await messageService.sendSystemMessage(
        'team-123',
        '🔐 Jane added a new secret to the vault: "API_KEY"',
        'vault_secret_added',
        {
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'added',
          modifiedBy: 'Jane'
        }
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('vault_secret_added');
    });

    it('should handle system message failures without breaking operations', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockRejectedValueOnce(new Error('System message failed'));

      await expect(messageService.sendSystemMessage(
        'team-123',
        '📝 Task created',
        'task_created',
        { taskId: 'task-123' }
      )).rejects.toThrow('Failed to send system message');
    });
  });

  describe('End-to-End Tests - Real-time Chat Synchronization', () => {
    it('should validate message types correctly', () => {
      expect(messageService.isValidMessageType('user')).toBe(true);
      expect(messageService.isValidMessageType('task_created')).toBe(true);
      expect(messageService.isValidMessageType('vault_secret_added')).toBe(true);
      expect(messageService.isValidMessageType('invalid_type')).toBe(false);
    });

    it('should handle real-time subscription setup', async () => {
      const { default: client } = await import('../lib/appwrite');
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      client.subscribe.mockReturnValueOnce(mockUnsubscribe);

      const unsubscribe = messageService.subscribeToMessages('team-123', mockCallback);

      expect(client.subscribe).toHaveBeenCalledWith(
        'databases.test-db.collections.messages.documents',
        expect.any(Function)
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should filter messages by team ID in real-time updates', () => {
      const { default: client } = require('../lib/appwrite');
      const mockCallback = vi.fn();
      
      client.subscribe.mockImplementationOnce((channel, callback) => {
        // Simulate real-time message for different team
        callback({
          events: ['databases.test-db.collections.messages.documents.msg-1.create'],
          payload: {
            $id: 'msg-1',
            teamId: 'different-team',
            content: 'Wrong team message',
            type: 'user'
          }
        });
        
        // Simulate real-time message for correct team
        callback({
          events: ['databases.test-db.collections.messages.documents.msg-2.create'],
          payload: {
            $id: 'msg-2',
            teamId: 'team-123',
            content: 'Correct team message',
            type: 'user'
          }
        });
        
        return vi.fn();
      });

      messageService.subscribeToMessages('team-123', mockCallback);

      // Should only call callback for correct team message
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith({
        events: ['databases.test-db.collections.messages.documents.msg-2.create'],
        payload: expect.objectContaining({
          teamId: 'team-123',
          content: 'Correct team message'
        })
      });
    });

    it('should handle rapid message updates without conflicts', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock multiple rapid message creations
      databases.createDocument
        .mockResolvedValueOnce({ $id: 'msg-1', content: 'Message 1' })
        .mockResolvedValueOnce({ $id: 'msg-2', content: 'Message 2' })
        .mockResolvedValueOnce({ $id: 'msg-3', content: 'Message 3' });

      const promises = [
        messageService.sendMessage('team-123', 'user-1', 'Message 1', 'User 1'),
        messageService.sendMessage('team-123', 'user-2', 'Message 2', 'User 2'),
        messageService.sendMessage('team-123', 'user-3', 'Message 3', 'User 3')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(databases.createDocument).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility Features Testing', () => {
    it('should render system messages with proper accessibility attributes', () => {
      const systemMessage = {
        $id: 'msg-1',
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
      expect(messageElement).toHaveAttribute('tabIndex', '0');
    });

    it('should render user messages with proper accessibility attributes', () => {
      const userMessage = {
        $id: 'msg-1',
        type: 'user',
        content: 'Hello team!',
        userName: 'John Doe',
        userId: 'user-123',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={userMessage} isCurrentUser={false} />);

      const messageElement = screen.getByRole('article');
      expect(messageElement).toHaveAttribute('aria-label');
      expect(messageElement.getAttribute('aria-label')).toContain('John Doe');
    });

    it('should support keyboard navigation in message input', async () => {
      const user = userEvent.setup();
      const mockSendMessage = vi.fn();
      
      render(
        <MessageInput
          onSendMessage={mockSendMessage}
          onTyping={vi.fn()}
          onStopTyping={vi.fn()}
        />
      );

      const messageInput = screen.getByLabelText(/message input/i);
      await user.click(messageInput);
      await user.type(messageInput, 'Test message');

      // Ctrl+Enter should send message
      await user.keyboard('{Control>}{Enter}{/Control}');
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should have proper focus management', () => {
      render(
        <MessageInput
          onSendMessage={vi.fn()}
          onTyping={vi.fn()}
          onStopTyping={vi.fn()}
        />
      );

      const messageInput = screen.getByLabelText(/message input/i);
      expect(messageInput).toHaveAttribute('id', 'message-input');
      expect(messageInput).toHaveClass('keyboard-focus');
    });

    it('should provide proper error announcements', () => {
      const failedMessage = {
        $id: 'msg-1',
        content: 'Failed message',
        type: 'user',
        userId: 'user-1',
        userName: 'Test User',
        $createdAt: new Date().toISOString(),
        isFailed: true
      };

      render(<MessageItem message={failedMessage} onRetry={vi.fn()} />);

      const retryButton = screen.getByRole('button', { name: /retry sending message/i });
      expect(retryButton).toHaveAttribute('title', 'Click to retry sending this message');
      expect(retryButton).toHaveClass('touch-target');
    });

    it('should have enhanced contrast for system messages', () => {
      const vaultMessage = {
        $id: 'msg-1',
        type: 'vault_secret_added',
        content: '🔐 Secret added',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={vaultMessage} />);

      const messageElement = screen.getByRole('status');
      expect(messageElement).toHaveClass('system-message-vault-add');
      expect(messageElement).toHaveClass('system-message');
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle large message lists efficiently', async () => {
      const { databases } = await import('../lib/appwrite');
      
      const manyMessages = Array.from({ length: 100 }, (_, i) => ({
        $id: `msg-${i}`,
        content: `Message ${i}`,
        type: 'user',
        systemData: null,
        $createdAt: new Date(Date.now() - i * 1000).toISOString()
      }));

      databases.listDocuments.mockResolvedValueOnce({
        documents: manyMessages.reverse(), // Newest first
        total: 100
      });

      const startTime = performance.now();
      const result = await messageService.getMessages('team-123', 100, 0);
      const endTime = performance.now();

      expect(result.messages).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should process quickly
    });

    it('should handle network timeouts gracefully', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(messageService.sendMessage(
        'team-123',
        'user-123',
        'Test message',
        'Test User'
      )).rejects.toThrow('Failed to send message');
    });

    it('should provide specific error messages for different failure types', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Test authentication error
      const authError = new Error('Unauthorized');
      authError.code = 401;
      databases.listDocuments.mockRejectedValueOnce(authError);

      await expect(messageService.getMessages('team-123')).rejects.toThrow('Authentication required');

      // Test permission error
      const permissionError = new Error('Forbidden');
      permissionError.code = 403;
      databases.listDocuments.mockRejectedValueOnce(permissionError);

      await expect(messageService.getMessages('team-123')).rejects.toThrow('Access denied');

      // Test not found error
      const notFoundError = new Error('Not found');
      notFoundError.code = 404;
      databases.listDocuments.mockRejectedValueOnce(notFoundError);

      await expect(messageService.getMessages('team-123')).rejects.toThrow('Messages not found');
    });

    it('should handle malformed system data gracefully', async () => {
      const { databases } = await import('../lib/appwrite');
      
      const mockMessages = [
        {
          $id: 'msg-1',
          content: 'System message',
          type: 'task_created',
          systemData: 'invalid-json{',
          $createdAt: new Date().toISOString()
        }
      ];

      databases.listDocuments.mockResolvedValueOnce({
        documents: mockMessages,
        total: 1
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await messageService.getMessages('team-123');

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].systemData).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse systemData'),
        'msg-1',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Message Type Validation', () => {
    it('should validate all supported message types', () => {
      const validTypes = [
        'user',
        'system',
        'task_created',
        'task_status_changed',
        'task_completed',
        'vault_secret_added',
        'vault_secret_updated',
        'vault_secret_deleted'
      ];

      validTypes.forEach(type => {
        expect(messageService.isValidMessageType(type)).toBe(true);
      });
    });

    it('should reject invalid message types', () => {
      const invalidTypes = [
        'invalid_type',
        'random_message',
        '',
        null,
        undefined,
        123
      ];

      invalidTypes.forEach(type => {
        expect(messageService.isValidMessageType(type)).toBe(false);
      });
    });
  });
});