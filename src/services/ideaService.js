import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '@/lib/appwrite';

/**
 * Idea Service for managing team ideas, voting, and status tracking
 * Supports idea submission, democratic voting, and task conversion
 */
class IdeaService {
  /**
   * Create a new idea
   * @param {string} teamId - Team identifier
   * @param {string} createdBy - User ID of idea creator
   * @param {Object} ideaData - Idea content (title, description, tags)
   * @returns {Promise<Object>} Idea document
   */
  async createIdea(teamId, createdBy, ideaData) {
    try {
      // Validate required fields
      if (!ideaData.title || !ideaData.description) {
        throw new Error('Title and description are required');
      }

      const idea = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ID.unique(),
        {
          teamId,
          createdBy,
          title: ideaData.title.trim(),
          description: ideaData.description.trim(),
          tags: ideaData.tags || [],
          status: 'submitted',
          voteCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return idea;
    } catch (error) {
      console.error('Error creating idea:', error);
      throw error;
    }
  }

  /**
   * Get all ideas for a team
   * @param {string} teamId - Team identifier
   * @param {Object} options - Query options (sortBy, filterBy, limit)
   * @returns {Promise<Array>} Array of idea documents
   */
  async getTeamIdeas(teamId, options = {}) {
    try {
      const queries = [Query.equal('teamId', teamId)];

      // Add sorting
      if (options.sortBy === 'votes') {
        queries.push(Query.orderDesc('voteCount'));
      } else if (options.sortBy === 'status') {
        queries.push(Query.orderAsc('status'));
      } else {
        queries.push(Query.orderDesc('createdAt'));
      }

      // Add filtering
      if (options.status) {
        queries.push(Query.equal('status', options.status));
      }

      if (options.tags && options.tags.length > 0) {
        queries.push(Query.contains('tags', options.tags));
      }

      // Add limit
      queries.push(Query.limit(options.limit || 50));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        queries
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching team ideas:', error);
      throw error;
    }
  }

  /**
   * Vote on an idea
   * @param {string} ideaId - Idea document ID
   * @param {string} userId - User ID voting
   * @returns {Promise<Object>} Vote document
   */
  async voteOnIdea(ideaId, userId) {
    try {
      // Check if user already voted
      const existingVote = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        [
          Query.equal('ideaId', ideaId),
          Query.equal('userId', userId)
        ]
      );

      if (existingVote.documents.length > 0) {
        throw new Error('User has already voted on this idea');
      }

      // Create vote
      const vote = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        ID.unique(),
        {
          ideaId,
          userId,
          createdAt: new Date().toISOString()
        }
      );

      // Update vote count on idea
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          voteCount: idea.voteCount + 1,
          updatedAt: new Date().toISOString()
        }
      );

      return vote;
    } catch (error) {
      console.error('Error voting on idea:', error);
      throw error;
    }
  }

  /**
   * Remove vote from an idea
   * @param {string} ideaId - Idea document ID
   * @param {string} userId - User ID removing vote
   * @returns {Promise<void>}
   */
  async removeVote(ideaId, userId) {
    try {
      // Find existing vote
      const existingVote = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        [
          Query.equal('ideaId', ideaId),
          Query.equal('userId', userId)
        ]
      );

      if (existingVote.documents.length === 0) {
        throw new Error('No vote found to remove');
      }

      // Delete vote
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        existingVote.documents[0].$id
      );

      // Update vote count on idea
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          voteCount: Math.max(0, idea.voteCount - 1),
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error removing vote:', error);
      throw error;
    }
  }

  /**
   * Update idea status
   * @param {string} ideaId - Idea document ID
   * @param {string} status - New status (submitted, approved, in_progress, completed, rejected)
   * @returns {Promise<Object>} Updated idea document
   */
  async updateIdeaStatus(ideaId, status) {
    try {
      const validStatuses = ['submitted', 'approved', 'in_progress', 'completed', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const updatedIdea = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );

      return updatedIdea;
    } catch (error) {
      console.error('Error updating idea status:', error);
      throw error;
    }
  }

  /**
   * Check if user has voted on an idea
   * @param {string} ideaId - Idea document ID
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>} Whether user has voted
   */
  async hasUserVoted(ideaId, userId) {
    try {
      const vote = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        [
          Query.equal('ideaId', ideaId),
          Query.equal('userId', userId)
        ]
      );

      return vote.documents.length > 0;
    } catch (error) {
      console.error('Error checking user vote:', error);
      return false;
    }
  }

  /**
   * Get vote details for ideas
   * @param {Array} ideaIds - Array of idea IDs
   * @param {string} userId - User ID to check votes for
   * @returns {Promise<Object>} Map of ideaId to vote status
   */
  async getVoteDetails(ideaIds, userId) {
    try {
      const votes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        [
          Query.equal('userId', userId),
          Query.contains('ideaId', ideaIds)
        ]
      );

      const voteMap = {};
      votes.documents.forEach(vote => {
        voteMap[vote.ideaId] = true;
      });

      return voteMap;
    } catch (error) {
      console.error('Error getting vote details:', error);
      return {};
    }
  }

  /**
   * Subscribe to idea changes for a team
   * @param {string} teamId - Team identifier
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToIdeas(teamId, callback) {
    // This will be implemented with Appwrite realtime subscriptions
    // For now, return a no-op unsubscribe function
    return () => {};
  }

  /**
   * Convert approved idea to task (integration point)
   * @param {string} ideaId - Idea document ID
   * @returns {Promise<Object>} Task creation result
   */
  async convertIdeaToTask(ideaId) {
    try {
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      if (idea.status !== 'approved') {
        throw new Error('Only approved ideas can be converted to tasks');
      }

      // This will integrate with existing taskService
      // For now, return the idea data that would be used for task creation
      return {
        title: idea.title,
        description: idea.description,
        teamId: idea.teamId,
        createdBy: idea.createdBy,
        tags: idea.tags,
        sourceType: 'idea',
        sourceId: ideaId
      };
    } catch (error) {
      console.error('Error converting idea to task:', error);
      throw error;
    }
  }
}

export default new IdeaService();