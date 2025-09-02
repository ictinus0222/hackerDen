import { describe, it, expect, vi, beforeEach } from 'vitest';
import { messageService } from '../services/messageService';

// Mock Appwrite
vi.mock('../lib/appwrite', () => {
  const mockClient = {
    subscribe: vi.fn(),
    call: vi.fn()
  };
  
  const mockDatabases = {
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    getDocument: vi.fn(),
    listDocuments: vi.fn()
  };
  
  return {
    default: mockClient,
    databases: mockDatabases,
    DATABASE_ID: 'test-db',
    COLLECTIONS: {
      TASKS: 'tasks',
      MESSAGES: 'messages',
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

describe('System Message Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task System Message Integration', () => {
    it('should send system message when task is created', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock successful system message creation
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-123',
        teamId: 'team-123',
        content: '📝 Task created',
        type: 'task_created',
        systemData: JSON.stringify({
          taskId: 'task-123',
          taskTitle: 'Setup API'
        }),
        $createdAt: new Date().toISOString()
      });

      // Test system message creation directly
      const result = await messageService.sendSystemMessage(
        'team-123',
        '📝 Task created',
        'task_created',
        {
          taskId: 'task-123',
          taskTitle: 'Setup API'
        }
      );

      expect(result).toBeDefined();
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'messages',
        expect.any(String), // ID is generated dynamically
        expect.objectContaining({
          teamId: 'team-123',
          type: 'task_created',
          content: '📝 Task created'
        })
      );
    });

    it('should handle system message failures gracefully', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock system message failure
      databases.createDocument.mockRejectedValueOnce(new Error('Message service unavailable'));

      // Should throw error for system message failures
      await expect(messageService.sendSystemMessage(
        'team-123',
        '📝 Task created',
        'task_created',
        { taskId: 'task-123' }
      )).rejects.toThrow('Failed to send system message');
    });
  });

  describe('Vault System Message Integration', () => {
    it('should send system message when vault secret is added', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock successful system message creation
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-126',
        teamId: 'team-123',
        content: '🔐 John Doe added a new secret to the vault: "API_KEY"',
        type: 'vault_secret_added',
        systemData: JSON.stringify({
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'added',
          modifiedBy: 'John Doe'
        }),
        $createdAt: new Date().toISOString()
      });

      // Test vault system message creation directly
      const result = await messageService.sendSystemMessage(
        'team-123',
        '🔐 John Doe added a new secret to the vault: "API_KEY"',
        'vault_secret_added',
        {
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'added',
          modifiedBy: 'John Doe'
        }
      );

      expect(result).toBeDefined();
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'messages',
        expect.any(String), // ID is generated dynamically
        expect.objectContaining({
          teamId: 'team-123',
          type: 'vault_secret_added',
          content: expect.stringContaining('API_KEY')
        })
      );
    });

    it('should send system message when vault secret is updated', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock successful system message creation
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-127',
        teamId: 'team-123',
        content: '🔄 Jane Smith updated vault secret: "Updated_API_KEY"',
        type: 'vault_secret_updated',
        systemData: JSON.stringify({
          secretId: 'secret-123',
          secretName: 'Updated_API_KEY',
          action: 'updated',
          modifiedBy: 'Jane Smith'
        }),
        $createdAt: new Date().toISOString()
      });

      // Test vault update system message
      const result = await messageService.sendSystemMessage(
        'team-123',
        '🔄 Jane Smith updated vault secret: "Updated_API_KEY"',
        'vault_secret_updated',
        {
          secretId: 'secret-123',
          secretName: 'Updated_API_KEY',
          action: 'updated',
          modifiedBy: 'Jane Smith'
        }
      );

      expect(result).toBeDefined();
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'messages',
        expect.any(String), // ID is generated dynamically
        expect.objectContaining({
          type: 'vault_secret_updated',
          content: expect.stringContaining('Updated_API_KEY')
        })
      );
    });

    it('should send system message when vault secret is deleted', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock successful system message creation
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-128',
        teamId: 'team-123',
        content: '🗑️ Admin deleted vault secret: "API_KEY"',
        type: 'vault_secret_deleted',
        systemData: JSON.stringify({
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'deleted',
          modifiedBy: 'Admin'
        }),
        $createdAt: new Date().toISOString()
      });

      // Test vault deletion system message
      const result = await messageService.sendSystemMessage(
        'team-123',
        '🗑️ Admin deleted vault secret: "API_KEY"',
        'vault_secret_deleted',
        {
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'deleted',
          modifiedBy: 'Admin'
        }
      );

      expect(result).toBeDefined();
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'messages',
        expect.any(String), // ID is generated dynamically
        expect.objectContaining({
          type: 'vault_secret_deleted',
          content: expect.stringContaining('deleted')
        })
      );
    });
  });

  describe('Message Service Integration', () => {
    it('should validate message types correctly', () => {
      expect(messageService.isValidMessageType('user')).toBe(true);
      expect(messageService.isValidMessageType('task_created')).toBe(true);
      expect(messageService.isValidMessageType('vault_secret_added')).toBe(true);
      expect(messageService.isValidMessageType('invalid_type')).toBe(false);
    });

    it('should handle system message creation with proper data structure', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValueOnce({
        $id: 'msg-129',
        teamId: 'team-123',
        content: '📝 Task created',
        type: 'task_created',
        systemData: JSON.stringify({
          taskId: 'task-123',
          taskTitle: 'Setup API'
        }),
        $createdAt: new Date().toISOString()
      });

      const result = await messageService.sendSystemMessage(
        'team-123',
        '📝 Task created',
        'task_created',
        {
          taskId: 'task-123',
          taskTitle: 'Setup API'
        }
      );

      expect(result).toBeDefined();
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'messages',
        expect.any(String), // ID is generated
        expect.objectContaining({
          teamId: 'team-123',
          type: 'task_created',
          systemData: expect.stringContaining('task-123')
        })
      );
    });

    it('should parse system data correctly when retrieving messages', async () => {
      const { databases } = await import('../lib/appwrite');
      
      const mockMessages = [
        {
          $id: 'msg-2',
          teamId: 'team-123',
          content: 'Hello team!',
          type: 'user',
          userId: 'user-123',
          userName: 'John',
          systemData: null,
          $createdAt: new Date().toISOString()
        },
        {
          $id: 'msg-1',
          teamId: 'team-123',
          content: '📝 Task created',
          type: 'task_created',
          systemData: JSON.stringify({
            taskId: 'task-123',
            taskTitle: 'Setup API'
          }),
          $createdAt: new Date().toISOString()
        }
      ];

      databases.listDocuments.mockResolvedValueOnce({
        documents: mockMessages, // Newest first from Appwrite
        total: 2
      });

      const result = await messageService.getMessages('team-123', 50, 0);

      expect(result.messages).toHaveLength(2);
      // Messages are reversed to show oldest first
      expect(result.messages[0].systemData).toEqual({
        taskId: 'task-123',
        taskTitle: 'Setup API'
      });
      expect(result.messages[1].systemData).toBeNull();
    });

    it('should handle malformed system data gracefully', async () => {
      const { databases } = await import('../lib/appwrite');
      
      const mockMessages = [
        {
          $id: 'msg-1',
          teamId: 'team-123',
          content: '📝 Task created',
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

      const result = await messageService.getMessages('team-123', 50, 0);

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

  describe('Cross-Service Integration', () => {
    it('should handle concurrent system messages from multiple services', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock successful system message creation for both types
      databases.createDocument
        .mockResolvedValueOnce({ $id: 'msg-task', teamId: 'team-123' })
        .mockResolvedValueOnce({ $id: 'msg-vault', teamId: 'team-123' });

      // Simulate concurrent system message operations
      const taskMessagePromise = messageService.sendSystemMessage(
        'team-123',
        '📝 Task created',
        'task_created',
        { taskId: 'task-123' }
      );

      const vaultMessagePromise = messageService.sendSystemMessage(
        'team-123',
        '🔐 Secret added',
        'vault_secret_added',
        { secretId: 'secret-123' }
      );

      const [taskResult, vaultResult] = await Promise.all([taskMessagePromise, vaultMessagePromise]);

      expect(taskResult).toBeDefined();
      expect(vaultResult).toBeDefined();
      
      // Both system messages should have been sent
      expect(databases.createDocument).toHaveBeenCalledTimes(2);
    });

    it('should maintain message ordering with timestamps', async () => {
      const { databases } = await import('../lib/appwrite');
      
      const now = new Date();
      const mockMessages = [
        {
          $id: 'msg-1',
          content: 'First message',
          type: 'user',
          systemData: null,
          $createdAt: new Date(now.getTime() - 3000).toISOString()
        },
        {
          $id: 'msg-2',
          content: '📝 Task created',
          type: 'task_created',
          systemData: JSON.stringify({ taskId: 'task-123' }),
          $createdAt: new Date(now.getTime() - 2000).toISOString()
        },
        {
          $id: 'msg-3',
          content: '🔐 Secret added',
          type: 'vault_secret_added',
          systemData: JSON.stringify({ secretId: 'secret-123' }),
          $createdAt: new Date(now.getTime() - 1000).toISOString()
        }
      ];

      databases.listDocuments.mockResolvedValueOnce({
        documents: mockMessages.reverse(), // Appwrite returns newest first
        total: 3
      });

      const result = await messageService.getMessages('team-123', 50, 0);

      // Messages should be returned in chronological order (oldest first)
      expect(result.messages[0].content).toBe('First message');
      expect(result.messages[1].content).toBe('📝 Task created');
      expect(result.messages[2].content).toBe('🔐 Secret added');
    });
  });
});