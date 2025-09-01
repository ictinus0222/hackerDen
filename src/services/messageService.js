import client, { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const MESSAGES_COLLECTION_ID = COLLECTIONS.MESSAGES;

export const messageService = {
  // Send a user message
  async sendMessage(teamId, hackathonId, userId, content) {
    try {
      const messageData = {
        teamId,
        hackathonId,
        userId,
        content: content.trim(),
        type: 'user',
        $createdAt: new Date().toISOString()
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        messageData
      );

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  },

  // Send a system message (for task/vault updates)
  async sendSystemMessage(teamId, hackathonId, content, type = 'system', systemData = null) {
    try {
      const messageData = {
        teamId,
        hackathonId,
        content: content.trim(),
        type,
        systemData: systemData ? JSON.stringify(systemData) : null,
        $createdAt: new Date().toISOString()
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        messageData
      );

      return response;
    } catch (error) {
      console.error('Error sending system message:', error);
      throw new Error('Failed to send system message.');
    }
  },

  // Enhanced message loading with better pagination and caching
  async getMessages(teamId, hackathonId, limit = 50, offset = 0) {
    try {
      // Optimize limit for better performance - don't load too many at once
      const optimizedLimit = Math.min(limit, 100);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId),
          Query.orderDesc('$createdAt'),
          Query.limit(optimizedLimit),
          Query.offset(offset)
        ]
      );

      // Parse systemData for system messages with error handling
      const messages = response.documents.map(message => {
        try {
          return {
            ...message,
            systemData: message.systemData ? JSON.parse(message.systemData) : null
          };
        } catch (parseError) {
          console.warn('Failed to parse systemData for message:', message.$id, parseError);
          return {
            ...message,
            systemData: null
          };
        }
      });

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        total: response.total,
        hasMore: offset + messages.length < response.total
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Provide more specific error messages
      if (error.code === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.code === 403) {
        throw new Error('Access denied. You may not have permission to view these messages.');
      } else if (error.code === 404) {
        throw new Error('Messages not found. The team may no longer exist.');
      } else {
        throw new Error('Failed to load messages. Please check your connection and try again.');
      }
    }
  },

  // Subscribe to real-time message updates with enhanced filtering
  subscribeToMessages(teamId, hackathonId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
        (response) => {
          const { events, payload } = response;
          
          // Only process messages for this team and hackathon
          if (payload.teamId === teamId && payload.hackathonId === hackathonId) {
            // Parse systemData if it exists
            const message = {
              ...payload,
              systemData: payload.systemData ? JSON.parse(payload.systemData) : null
            };

            callback({
              events,
              payload: message
            });
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      throw new Error('Failed to connect to real-time messages.');
    }
  },

  // Typing indicator functionality (placeholder for future implementation)
  sendTypingIndicator(teamId, userId, userName) {
    // This would typically send a real-time event or use a separate collection
    // For now, we'll use a simple in-memory approach or WebSocket events
    try {
      // In a real implementation, this might use Appwrite's real-time channels
      // or a separate typing indicators collection with TTL
      console.log(`${userName} is typing in team ${teamId}`);
      
      // Could implement using Appwrite's real-time channels:
      // client.subscribe(`team.${teamId}.typing`, callback);
    } catch (error) {
      console.warn('Failed to send typing indicator:', error);
    }
  },

  stopTypingIndicator(teamId, userId) {
    try {
      console.log(`User ${userId} stopped typing in team ${teamId}`);
      // Implementation would stop the typing indicator
    } catch (error) {
      console.warn('Failed to stop typing indicator:', error);
    }
  },

  // Message type filtering helper
  isValidMessageType(type) {
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
    return validTypes.includes(type);
  }
};