import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../lib/appwrite';
import { messageService } from './messageService';

// Helper function to send vault system messages with error handling
const sendVaultSystemMessage = async (teamId, hackathonId, messageType, content, systemData) => {
  try {
    await messageService.sendSystemMessage(teamId, hackathonId, content, messageType, systemData);
  } catch (error) {
    console.warn('Failed to send vault system message:', error);
    // Don't fail the parent operation - just log the warning
  }
};

// Simple encryption utilities (in production, use proper encryption libraries)
const encryptValue = (value, key) => {
  // This is a simple XOR encryption for demo purposes
  // In production, use proper encryption like AES
  const keyBytes = new TextEncoder().encode(key);
  const valueBytes = new TextEncoder().encode(value);
  const encrypted = new Uint8Array(valueBytes.length);
  
  for (let i = 0; i < valueBytes.length; i++) {
    encrypted[i] = valueBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return btoa(String.fromCharCode(...encrypted));
};

const decryptValue = (encryptedValue, key) => {
  try {
    const keyBytes = new TextEncoder().encode(key);
    const encryptedBytes = new Uint8Array(atob(encryptedValue).split('').map(c => c.charCodeAt(0)));
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt value');
  }
};

export const vaultService = {
  // Create a new vault secret
  async createSecret(teamId, hackathonId, name, value, description, createdBy, createdByName) {
    try {
      // Generate encryption key based on team and hackathon
      const encryptionKey = `${teamId}-${hackathonId}-vault-key`;
      const encryptedValue = encryptValue(value, encryptionKey);

      const secret = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        ID.unique(),
        {
          teamId,
          hackathonId,
          name: name.trim(),
          description: description?.trim() || '',
          encryptedValue,
          createdBy,
          createdByName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          accessCount: 0,
          lastAccessedAt: null,
          lastAccessedBy: null
        }
      );

      // Send system message for vault secret addition
      const systemMessageContent = `🔐 ${createdByName} added a new secret to the vault: "${name.trim()}"`;
      const systemData = {
        secretId: secret.$id,
        secretName: name.trim(),
        action: 'added',
        modifiedBy: createdByName,
        category: 'vault'
      };

      await sendVaultSystemMessage(teamId, hackathonId, 'vault_secret_added', systemMessageContent, systemData);

      return {
        ...secret,
        encryptedValue: undefined // Don't return the encrypted value
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create secret');
    }
  },

  // Get all secrets for a team (without values)
  async getTeamSecrets(teamId, hackathonId) {
    try {
      const secrets = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        [
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId),
          Query.orderDesc('createdAt')
        ]
      );

      return secrets.documents.map(secret => ({
        id: secret.$id,
        name: secret.name,
        description: secret.description,
        createdBy: secret.createdBy,
        createdByName: secret.createdByName,
        createdAt: secret.createdAt,
        updatedAt: secret.updatedAt,
        accessCount: secret.accessCount,
        lastAccessedAt: secret.lastAccessedAt,
        lastAccessedBy: secret.lastAccessedBy,
        hasValue: !!secret.encryptedValue
      }));
    } catch (error) {
      throw new Error('Failed to load team secrets');
    }
  },

  // Get secret value (available to all team members)
  async getSecretValue(secretId, userId) {
    try {
      // Get the secret
      const secret = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        secretId
      );

      // Decrypt the value
      const encryptionKey = `${secret.teamId}-${secret.hackathonId}-vault-key`;
      const decryptedValue = decryptValue(secret.encryptedValue, encryptionKey);

      // Update access tracking
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        secretId,
        {
          accessCount: (secret.accessCount || 0) + 1,
          lastAccessedAt: new Date().toISOString(),
          lastAccessedBy: userId
        }
      );

      return {
        id: secret.$id,
        name: secret.name,
        value: decryptedValue,
        description: secret.description
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to access secret');
    }
  },

  // Update a secret (available to all team members)
  async updateSecret(secretId, updates, updatedBy, updatedByName) {
    try {
      const allowedUpdates = ['name', 'description', 'value'];
      const filteredUpdates = {};

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      // If updating value, encrypt it
      if (filteredUpdates.value) {
        const secret = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.VAULT_SECRETS,
          secretId
        );
        
        const encryptionKey = `${secret.teamId}-${secret.hackathonId}-vault-key`;
        filteredUpdates.encryptedValue = encryptValue(filteredUpdates.value, encryptionKey);
        delete filteredUpdates.value;
      }

      const updatedSecret = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        secretId,
        {
          ...filteredUpdates,
          updatedAt: new Date().toISOString(),
          updatedBy
        }
      );

      // Send system message for vault secret update
      const systemMessageContent = `🔄 ${updatedByName} updated vault secret: "${updatedSecret.name}"`;
      const systemData = {
        secretId: secretId,
        secretName: updatedSecret.name,
        action: 'updated',
        modifiedBy: updatedByName,
        category: 'vault'
      };

      await sendVaultSystemMessage(updatedSecret.teamId, updatedSecret.hackathonId, 'vault_secret_updated', systemMessageContent, systemData);

      return {
        ...updatedSecret,
        encryptedValue: undefined
      };
    } catch (error) {
      throw new Error('Failed to update secret');
    }
  },

  // Delete a secret (available to all team members)
  async deleteSecret(secretId, deletedBy, deletedByName) {
    try {
      // Get the secret details before deletion for system message
      const secret = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        secretId
      );

      // Delete the secret
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        secretId
      );

      // Send system message for vault secret deletion
      const systemMessageContent = `🗑️ ${deletedByName || deletedBy} deleted vault secret: "${secret.name}"`;
      const systemData = {
        secretId: secretId,
        secretName: secret.name,
        action: 'deleted',
        modifiedBy: deletedByName || deletedBy,
        category: 'vault'
      };

      await sendVaultSystemMessage(secret.teamId, secret.hackathonId, 'vault_secret_deleted', systemMessageContent, systemData);

      return { success: true };
    } catch (error) {
      throw new Error('Failed to delete secret');
    }
  },

  // Check if user is a team member (simplified permission check)
  async isTeamMember(userId, teamId, hackathonId) {
    try {
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', userId),
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId)
        ]
      );

      return memberships.documents.length > 0;
    } catch (error) {
      return false;
    }
  }
};