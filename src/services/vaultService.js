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
      if (error.code === 404) {
        // Collections don't exist yet - return empty array
        console.warn('Vault collections not found. Please run the setup script or create collections manually.');
        return [];
      }
      if (error.code === 401) {
        // Collections exist but permissions are not set correctly
        console.warn('Vault collections found but access denied. Please check collection permissions in Appwrite console.');
        return [];
      }
      throw new Error('Failed to load team secrets');
    }
  },

  // Request access to a secret
  async requestSecretAccess(secretId, requestedBy, requestedByName, justification) {
    try {
      const request = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_ACCESS_REQUESTS,
        ID.unique(),
        {
          secretId,
          requestedBy,
          requestedByName,
          justification: justification.trim(),
          status: 'pending',
          requestedAt: new Date().toISOString()
          // Note: accessExpiresAt is set when request is approved, not when created
        }
      );

      return request;
    } catch (error) {
      console.error('Access request error:', error);
      throw new Error('Failed to request secret access');
    }
  },

  // Get pending access requests for team leaders
  async getPendingAccessRequests(teamId, hackathonId) {
    try {
      // First get all secrets for the team
      const secrets = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        [
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId)
        ]
      );

      if (secrets.documents.length === 0) {
        return [];
      }

      const secretIds = secrets.documents.map(s => s.$id);
      
      // Get pending requests for these secrets
      const requests = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VAULT_ACCESS_REQUESTS,
        [
          Query.equal('status', 'pending'),
          Query.orderDesc('requestedAt')
        ]
      );

      // Filter requests for team's secrets and add secret info
      const teamRequests = requests.documents
        .filter(request => secretIds.includes(request.secretId))
        .map(request => {
          const secret = secrets.documents.find(s => s.$id === request.secretId);
          return {
            ...request,
            secretName: secret?.name || 'Unknown Secret'
          };
        });

      return teamRequests;
    } catch (error) {
      if (error.code === 404) {
        // Collections don't exist yet - return empty array
        console.warn('Vault collections not found. Please run the setup script or create collections manually.');
        return [];
      }
      if (error.code === 401) {
        // Collections exist but permissions are not set correctly
        console.warn('Vault collections found but access denied. Please check collection permissions in Appwrite console.');
        return [];
      }
      throw new Error('Failed to load access requests');
    }
  },

  // Approve or deny access request
  async handleAccessRequest(requestId, action, handledBy, handledByName, temporaryAccess = true) {
    try {
      const validActions = ['approved', 'denied'];
      if (!validActions.includes(action)) {
        throw new Error('Invalid action. Must be approved or denied.');
      }

      const expiresAt = temporaryAccess && action === 'approved' 
        ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        : null;

      const updatedRequest = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_ACCESS_REQUESTS,
        requestId,
        {
          status: action,
          handledBy,
          handledByName,
          handledAt: new Date().toISOString(),
          accessExpiresAt: expiresAt
        }
      );

      return updatedRequest;
    } catch (error) {
      throw new Error('Failed to handle access request');
    }
  },

  // Get secret value (only if user has access)
  async getSecretValue(secretId, userId) {
    try {
      // Check if user has approved access
      const accessRequests = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VAULT_ACCESS_REQUESTS,
        [
          Query.equal('secretId', secretId),
          Query.equal('requestedBy', userId),
          Query.equal('status', 'approved')
        ]
      );

      const validAccess = accessRequests.documents.find(request => {
        if (!request.accessExpiresAt) return true; // Permanent access
        return new Date(request.accessExpiresAt) > new Date(); // Not expired
      });

      if (!validAccess) {
        throw new Error('Access denied. Please request access to this secret.');
      }

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

  // Update a secret (only by team leaders)
  async updateSecret(secretId, updates, updatedBy) {
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
      // Get the original secret to get the team ID and user name
      const originalSecret = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        secretId
      );

      // Get user name from the updatedBy parameter (assuming it's passed as user name)
      const updatedByName = updatedBy; // This should be the user name, not ID
      const systemMessageContent = `🔄 ${updatedByName} updated vault secret: "${updatedSecret.name}"`;
      const systemData = {
        secretId: secretId,
        secretName: updatedSecret.name,
        action: 'updated',
        modifiedBy: updatedByName,
        category: 'vault'
      };

      await sendVaultSystemMessage(originalSecret.teamId, originalSecret.hackathonId, 'vault_secret_updated', systemMessageContent, systemData);

      return {
        ...updatedSecret,
        encryptedValue: undefined
      };
    } catch (error) {
      throw new Error('Failed to update secret');
    }
  },

  // Delete a secret (only by team leaders)
  async deleteSecret(secretId, deletedBy, deletedByName) {
    try {
      // Get the secret details before deletion for system message
      const secret = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.VAULT_SECRETS,
        secretId
      );

      // Delete associated access requests first
      const accessRequests = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VAULT_ACCESS_REQUESTS,
        [
          Query.equal('secretId', secretId)
        ]
      );

      // Delete all access requests
      await Promise.all(
        accessRequests.documents.map(request =>
          databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.VAULT_ACCESS_REQUESTS,
            request.$id
          )
        )
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

  // Get user's access requests
  async getUserAccessRequests(userId) {
    try {
      const requests = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VAULT_ACCESS_REQUESTS,
        [
          Query.equal('requestedBy', userId),
          Query.orderDesc('requestedAt')
        ]
      );

      return requests.documents;
    } catch (error) {
      if (error.code === 404) {
        // Collections don't exist yet - return empty array
        console.warn('Vault collections not found. Please run the setup script or create collections manually.');
        return [];
      }
      if (error.code === 401) {
        // Collections exist but permissions are not set correctly
        console.warn('Vault collections found but access denied. Please check collection permissions in Appwrite console.');
        return [];
      }
      throw new Error('Failed to load your access requests');
    }
  },

  // Check if user can manage vault (team leader or owner)
  async canManageVault(userId, teamId, hackathonId) {
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

      const membership = memberships.documents[0];
      return membership && ['owner', 'leader'].includes(membership.role);
    } catch (error) {
      return false;
    }
  }
};