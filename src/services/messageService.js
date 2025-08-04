import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '../lib/appwrite';
import client from '../lib/appwrite';

export const messageService = {
  // Send a user message
  async sendMessage(teamId, userId, content) {
    try {
      const messageData = {
        teamId,
        userId,
        content: content.trim(),
        type: 'user'
      };

      const message = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        ID.unique(),
        messageData
      );

      return message;
    } catch (error) {
      throw new Error(error.message || 'Failed to send message');
    }
  },

  // Send a system message (for task updates)
  async sendSystemMessage(teamId, content, type = 'system') {
    try {
      const messageData = {
        teamId,
        userId: null, // System messages don't have a user
        content: content.trim(),
        type
      };

      const message = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        ID.unique(),
        messageData
      );

      return message;
    } catch (error) {
      throw new Error(error.message || 'Failed to send system message');
    }
  },

  // Get all messages for a team
  async getTeamMessages(teamId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('teamId', teamId),
          Query.orderAsc('$createdAt'),
          Query.limit(100) // Limit to last 100 messages for performance
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching team messages:', error);
      
      // Handle specific error cases
      if (error.message.includes('Collection with the requested ID could not be found')) {
        throw new Error('Messages collection not found. Please create the "messages" collection in your Appwrite database.');
      } else if (error.message.includes('Attribute not found in schema')) {
        throw new Error('Messages collection schema is incomplete. Please add the required attributes (teamId, userId, content, type) to the messages collection.');
      } else if (error.code === 401) {
        throw new Error('Unauthorized access to messages. Please check collection permissions.');
      } else {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }
    }
  },

  // Subscribe to real-time message updates
  subscribeToMessages(teamId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`,
        (response) => {
          // Only process messages for this team
          if (response.payload.teamId === teamId) {
            callback(response);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to messages:', error);
      return () => {}; // Return empty function if subscription fails
    }
  }
};