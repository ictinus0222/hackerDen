import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vaultService } from '../services/vaultService';
import { messageService } from '../services/messageService';

// Mock the messageService
vi.mock('../services/messageService', () => ({
  messageService: {
    sendSystemMessage: vi.fn()
  }
}));

// Mock the appwrite database
vi.mock('../lib/appwrite', () => ({
  default: {},
  databases: {
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    getDocument: vi.fn(),
    listDocuments: vi.fn()
  },
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    VAULT_SECRETS: 'vault-secrets',
    VAULT_ACCESS_REQUESTS: 'vault-access-requests'
  },
  ID: {
    unique: () => 'test-id'
  },
  Query: {
    equal: vi.fn()
  }
}));

describe('VaultService System Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSecret', () => {
    it('should send system message when vault secret is added', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock successful secret creation
      databases.createDocument.mockResolvedValue({
        $id: 'secret-123',
        name: 'API_KEY',
        teamId: 'team-123'
      });

      await vaultService.createSecret(
        'team-123',
        'hackathon-456',
        'API_KEY',
        'secret-value',
        'API key for external service',
        'user-123',
        'John Doe'
      );

      // Verify system message was sent
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        '🔐 John Doe added a new secret to the vault: "API_KEY"',
        'vault_secret_added',
        {
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'added',
          modifiedBy: 'John Doe',
          category: 'vault'
        }
      );
    });

    it('should not fail if system message fails to send', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock successful secret creation
      databases.createDocument.mockResolvedValue({
        $id: 'secret-123',
        name: 'API_KEY',
        teamId: 'team-123'
      });

      // Mock system message failure
      messageService.sendSystemMessage.mockRejectedValue(new Error('Message failed'));

      // Should not throw error
      const result = await vaultService.createSecret(
        'team-123',
        'hackathon-456',
        'API_KEY',
        'secret-value',
        'API key for external service',
        'user-123',
        'John Doe'
      );

      expect(result).toBeDefined();
      expect(result.encryptedValue).toBeUndefined();
    });
  });

  describe('updateSecret', () => {
    it('should send system message when vault secret is updated', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock getting original secret for team ID
      databases.getDocument.mockResolvedValueOnce({
        $id: 'secret-123',
        name: 'API_KEY',
        teamId: 'team-123'
      });

      // Mock successful secret update
      databases.updateDocument.mockResolvedValue({
        $id: 'secret-123',
        name: 'Updated API_KEY',
        teamId: 'team-123'
      });

      await vaultService.updateSecret(
        'secret-123',
        { name: 'Updated API_KEY' },
        'Jane Smith'
      );

      // Verify system message was sent
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        '🔄 Jane Smith updated vault secret: "Updated API_KEY"',
        'vault_secret_updated',
        {
          secretId: 'secret-123',
          secretName: 'Updated API_KEY',
          action: 'updated',
          modifiedBy: 'Jane Smith',
          category: 'vault'
        }
      );
    });
  });

  describe('deleteSecret', () => {
    it('should send system message when vault secret is deleted', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock getting secret details before deletion
      databases.getDocument.mockResolvedValue({
        $id: 'secret-123',
        name: 'API_KEY',
        teamId: 'team-123'
      });

      // Mock listing access requests (empty)
      databases.listDocuments.mockResolvedValue({
        documents: []
      });

      // Mock successful deletion
      databases.deleteDocument.mockResolvedValue({});

      await vaultService.deleteSecret('secret-123', 'user-123', 'John Doe');

      // Verify system message was sent
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        '🗑️ John Doe deleted vault secret: "API_KEY"',
        'vault_secret_deleted',
        {
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'deleted',
          modifiedBy: 'John Doe',
          category: 'vault'
        }
      );
    });

    it('should handle missing deletedByName parameter', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock getting secret details before deletion
      databases.getDocument.mockResolvedValue({
        $id: 'secret-123',
        name: 'API_KEY',
        teamId: 'team-123'
      });

      // Mock listing access requests (empty)
      databases.listDocuments.mockResolvedValue({
        documents: []
      });

      // Mock successful deletion
      databases.deleteDocument.mockResolvedValue({});

      await vaultService.deleteSecret('secret-123', 'user-123');

      // Verify system message was sent with fallback to deletedBy
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        '🗑️ user-123 deleted vault secret: "API_KEY"',
        'vault_secret_deleted',
        {
          secretId: 'secret-123',
          secretName: 'API_KEY',
          action: 'deleted',
          modifiedBy: 'user-123',
          category: 'vault'
        }
      );
    });
  });
});