import client, { databases, storage, DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const REACTIONS_COLLECTION_ID = COLLECTIONS.REACTIONS;
const CUSTOM_EMOJI_BUCKET_ID = STORAGE_BUCKETS.CUSTOM_EMOJI;

export const reactionService = {
  // Add a reaction to a message or task
  async addReaction(targetId, targetType, userId, emoji, isCustom = false) {
    try {
      // Check if user already reacted with this emoji
      const existingReaction = await this.getUserReaction(targetId, targetType, userId, emoji);
      
      if (existingReaction) {
        // Remove existing reaction if it's the same emoji
        await this.removeReaction(existingReaction.$id);
        return null;
      }

      const reactionData = {
        targetId,
        targetType, // 'message' or 'task'
        userId,
        emoji,
        isCustom,
        createdAt: new Date().toISOString()
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        REACTIONS_COLLECTION_ID,
        ID.unique(),
        reactionData
      );

      return response;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error('Failed to add reaction. Please try again.');
    }
  },

  // Remove a reaction
  async removeReaction(reactionId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        REACTIONS_COLLECTION_ID,
        reactionId
      );
      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw new Error('Failed to remove reaction. Please try again.');
    }
  },

  // Get all reactions for a target (message or task)
  async getReactions(targetId, targetType) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REACTIONS_COLLECTION_ID,
        [
          Query.equal('targetId', targetId),
          Query.equal('targetType', targetType),
          Query.orderAsc('createdAt')
        ]
      );

      // Group reactions by emoji and count them
      const reactionGroups = {};
      response.documents.forEach(reaction => {
        const key = reaction.emoji;
        if (!reactionGroups[key]) {
          reactionGroups[key] = {
            emoji: reaction.emoji,
            isCustom: reaction.isCustom,
            count: 0,
            users: [],
            reactions: []
          };
        }
        reactionGroups[key].count++;
        reactionGroups[key].users.push(reaction.userId);
        reactionGroups[key].reactions.push(reaction);
      });

      return Object.values(reactionGroups);
    } catch (error) {
      console.error('Error fetching reactions:', error);
      throw new Error('Failed to load reactions.');
    }
  },

  // Get user's specific reaction for a target
  async getUserReaction(targetId, targetType, userId, emoji) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REACTIONS_COLLECTION_ID,
        [
          Query.equal('targetId', targetId),
          Query.equal('targetType', targetType),
          Query.equal('userId', userId),
          Query.equal('emoji', emoji),
          Query.limit(1)
        ]
      );

      return response.documents[0] || null;
    } catch (error) {
      console.error('Error fetching user reaction:', error);
      return null;
    }
  },

  // Get all reactions by a user
  async getUserReactions(userId, limit = 50) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REACTIONS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching user reactions:', error);
      throw new Error('Failed to load user reactions.');
    }
  },

  // Upload custom emoji
  async uploadCustomEmoji(teamId, file, name) {
    try {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PNG, JPEG, GIF, and WebP images are allowed for custom emoji.');
      }

      // Validate file size (max 1MB for emoji)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        throw new Error('Custom emoji file size must be less than 1MB.');
      }

      // Create unique filename
      const fileName = `${teamId}_${name}_${Date.now()}.${file.name.split('.').pop()}`;

      const response = await storage.createFile(
        CUSTOM_EMOJI_BUCKET_ID,
        ID.unique(),
        file,
        [
          `read("team:${teamId}")`, // Only team members can read
          `write("team:${teamId}")` // Only team members can write
        ]
      );

      // Get the file URL
      const fileUrl = storage.getFileView(CUSTOM_EMOJI_BUCKET_ID, response.$id);

      return {
        id: response.$id,
        name,
        url: fileUrl.href,
        teamId,
        fileName
      };
    } catch (error) {
      console.error('Error uploading custom emoji:', error);
      throw new Error(error.message || 'Failed to upload custom emoji.');
    }
  },

  // Get team's custom emoji
  async getTeamCustomEmoji(teamId) {
    try {
      const response = await storage.listFiles(
        CUSTOM_EMOJI_BUCKET_ID,
        [
          Query.search('name', teamId), // Search for files with team ID in name
          Query.limit(100)
        ]
      );

      return response.files.map(file => ({
        id: file.$id,
        name: file.name.split('_')[1] || file.name, // Extract emoji name
        url: storage.getFileView(CUSTOM_EMOJI_BUCKET_ID, file.$id).href,
        teamId,
        fileName: file.name
      }));
    } catch (error) {
      console.error('Error fetching team custom emoji:', error);
      return []; // Return empty array on error
    }
  },

  // Delete custom emoji
  async deleteCustomEmoji(emojiId) {
    try {
      await storage.deleteFile(CUSTOM_EMOJI_BUCKET_ID, emojiId);
      return true;
    } catch (error) {
      console.error('Error deleting custom emoji:', error);
      throw new Error('Failed to delete custom emoji.');
    }
  },

  // Subscribe to reactions for a target
  subscribeToReactions(targetId, targetType, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${REACTIONS_COLLECTION_ID}.documents`,
        (response) => {
          const { events, payload } = response;
          
          // Only process reactions for this target
          if (payload.targetId === targetId && payload.targetType === targetType) {
            callback({
              events,
              payload
            });
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to reactions:', error);
      throw new Error('Failed to connect to real-time reactions.');
    }
  },

  // Get popular emoji for quick access
  getPopularEmoji() {
    return [
      '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', 
      '🚀', '💡', '🔥', '✅', '❌', '⭐', '👏', '🙌'
    ];
  },

  // Get reaction summary for display
  getReactionSummary(reactions) {
    if (!reactions || reactions.length === 0) {
      return null;
    }

    const totalCount = reactions.reduce((sum, group) => sum + group.count, 0);
    const topReactions = reactions
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      totalCount,
      topReactions,
      hasMore: reactions.length > 3
    };
  }
};