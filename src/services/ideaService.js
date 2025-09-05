/**
 * @fileoverview Idea Service for HackerDen Enhancement Features
 * Handles idea submission, voting, status management, and task conversion
 */

import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '../lib/appwrite';
import client from '../lib/appwrite';
import { gamificationService } from './gamificationService';
import { messageService } from './messageService';

// Helper function to award points with error handling
const awardPointsForAction = async (userId, teamId, action, hackathonId = null, userName = 'Team Member') => {
  try {
    await gamificationService.awardPoints(userId, teamId, action, null, hackathonId, userName);
  } catch (error) {
    console.warn('Failed to award points:', error);
    // Don't fail the parent operation - just log the warning
  }
};

// Helper function to send system messages with error handling
const sendIdeaSystemMessage = async (teamId, hackathonId, messageType, content, systemData) => {
  try {
    await messageService.sendSystemMessage(teamId, hackathonId, content, messageType, systemData);
  } catch (error) {
    console.warn('Failed to send idea system message:', error);
    // Don't fail the parent operation - just log the warning
  }
};

export const ideaService = {
  /**
   * Create a new idea
   * @param {string} teamId - The team ID
   * @param {string} hackathonId - The hackathon ID
   * @param {Object} ideaData - Idea data
   * @returns {Promise<Object>} Idea document
   */
  async createIdea(teamId, hackathonId, ideaData) {
    try {
      const idea = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ID.unique(),
        {
          teamId,
          hackathonId,
          createdBy: ideaData.createdBy,
          title: ideaData.title,
          description: ideaData.description,
          tags: ideaData.tags || [],
          status: 'submitted',
          voteCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      // Award points for idea submission
      await awardPointsForAction(ideaData.createdBy, teamId, 'idea_submission', hackathonId, 'Team Member');

      // Send system message
      const systemMessageContent = `💡 New idea submitted: "${ideaData.title}"`;
      const systemData = {
        ideaId: idea.$id,
        ideaTitle: ideaData.title,
        createdBy: ideaData.createdBy,
        tags: ideaData.tags || []
      };

      await sendIdeaSystemMessage(teamId, hackathonId, 'idea_created', systemMessageContent, systemData);

      return idea;
    } catch (error) {
      console.error('Error creating idea:', error);
      throw new Error(`Failed to create idea: ${error.message}`);
    }
  },

  /**
   * Get all ideas for a team
   * @param {string} teamId - The team ID
   * @param {string} hackathonId - The hackathon ID (optional)
   * @returns {Promise<Array>} Array of idea documents
   */
  async getTeamIdeas(teamId, hackathonId = null) {
    try {
      const queries = [Query.equal('teamId', teamId)];
      
      if (hackathonId) {
        queries.push(Query.equal('hackathonId', hackathonId));
      }
      
      queries.push(Query.orderDesc('createdAt'));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        queries
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching team ideas:', error);
      throw new Error(`Failed to fetch team ideas: ${error.message}`);
    }
  },

  /**
   * Vote on an idea
   * @param {string} ideaId - The idea ID
   * @param {string} userId - The user ID
   * @param {string} teamId - The team ID
   * @param {string} hackathonId - The hackathon ID
   * @returns {Promise<Object>} Vote document
   */
  async voteOnIdea(ideaId, userId, teamId, hackathonId) {
    try {
      // Check if user already voted
      const existingVote = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        [
          Query.equal('ideaId', ideaId),
          Query.equal('userId', userId),
          Query.limit(1)
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

      // Update idea vote count
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      const updatedIdea = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          voteCount: idea.voteCount + 1,
          updatedAt: new Date().toISOString()
        }
      );

      // Award points for voting
      await awardPointsForAction(userId, teamId, 'vote_given', hackathonId, 'Team Member');

      // Send system message
      const systemMessageContent = `👍 "${idea.title}" received a vote (${updatedIdea.voteCount} total)`;
      const systemData = {
        ideaId: ideaId,
        ideaTitle: idea.title,
        votedBy: userId,
        newVoteCount: updatedIdea.voteCount
      };

      await sendIdeaSystemMessage(teamId, hackathonId, 'idea_voted', systemMessageContent, systemData);

      // Check for auto-approval (e.g., 5 votes)
      if (updatedIdea.voteCount >= 5 && idea.status === 'submitted') {
        await this.updateIdeaStatus(ideaId, 'approved', teamId, hackathonId, 'system');
      }

      return vote;
    } catch (error) {
      console.error('Error voting on idea:', error);
      throw new Error(`Failed to vote on idea: ${error.message}`);
    }
  },

  /**
   * Update idea status
   * @param {string} ideaId - The idea ID
   * @param {string} status - New status
   * @param {string} teamId - The team ID
   * @param {string} hackathonId - The hackathon ID
   * @param {string} updatedBy - User ID updating status
   * @returns {Promise<Object>} Updated idea document
   */
  async updateIdeaStatus(ideaId, status, teamId, hackathonId, updatedBy = 'system') {
    try {
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      const updatedIdea = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );

      // Send system message for status change
      let systemMessageContent;
      let messageType;

      switch (status) {
        case 'approved':
          systemMessageContent = updatedBy === 'system' 
            ? `🎉 "${idea.title}" was auto-approved with ${idea.voteCount} votes!`
            : `✅ "${idea.title}" was approved`;
          messageType = updatedBy === 'system' ? 'idea_auto_approved' : 'idea_status_changed';
          break;
        case 'in_progress':
          systemMessageContent = `🔄 "${idea.title}" is now in progress`;
          messageType = 'idea_status_changed';
          break;
        case 'completed':
          systemMessageContent = `✅ "${idea.title}" has been completed`;
          messageType = 'idea_status_changed';
          break;
        case 'rejected':
          systemMessageContent = `❌ "${idea.title}" was rejected`;
          messageType = 'idea_status_changed';
          break;
        default:
          systemMessageContent = `📝 "${idea.title}" status changed to ${status}`;
          messageType = 'idea_status_changed';
      }

      const systemData = {
        ideaId: ideaId,
        ideaTitle: idea.title,
        oldStatus: idea.status,
        newStatus: status,
        updatedBy: updatedBy
      };

      await sendIdeaSystemMessage(teamId, hackathonId, messageType, systemMessageContent, systemData);

      return updatedIdea;
    } catch (error) {
      console.error('Error updating idea status:', error);
      throw new Error(`Failed to update idea status: ${error.message}`);
    }
  },

  /**
   * Convert idea to task
   * @param {string} ideaId - The idea ID
   * @param {string} teamId - The team ID
   * @param {string} hackathonId - The hackathon ID
   * @param {string} assignedTo - User ID to assign task to
   * @param {string} createdBy - User ID creating the task
   * @param {string} creatorName - Creator name for display
   * @param {string} assignedToName - Assigned user name for display
   * @returns {Promise<Object>} Created task document
   */
  async convertIdeaToTask(ideaId, teamId, hackathonId, assignedTo, createdBy, creatorName = 'System', assignedToName = 'System') {
    try {
      // Import taskService dynamically to avoid circular dependency
      const { taskService } = await import('./taskService');

      // Use the new integrated method in taskService
      const task = await taskService.createTaskFromIdea(
        ideaId,
        teamId,
        hackathonId,
        assignedTo,
        createdBy,
        creatorName,
        assignedToName
      );

      return task;
    } catch (error) {
      console.error('Error converting idea to task:', error);
      throw new Error(`Failed to convert idea to task: ${error.message}`);
    }
  },

  /**
   * Check if user has voted on an idea
   * @param {string} ideaId - The idea ID
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} Whether user has voted
   */
  async hasUserVoted(ideaId, userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        [
          Query.equal('ideaId', ideaId),
          Query.equal('userId', userId),
          Query.limit(1)
        ]
      );

      return response.documents.length > 0;
    } catch (error) {
      console.error('Error checking user vote:', error);
      return false;
    }
  },

  /**
   * Get ideas with user vote status
   * @param {string} teamId - The team ID
   * @param {string} userId - The user ID
   * @param {string} hackathonId - The hackathon ID (optional)
   * @returns {Promise<Array>} Array of ideas with vote status
   */
  async getIdeasWithVoteStatus(teamId, userId, hackathonId = null) {
    try {
      const ideas = await this.getTeamIdeas(teamId, hackathonId);
      
      // Check vote status for each idea
      const ideasWithVoteStatus = await Promise.all(
        ideas.map(async (idea) => {
          const hasVoted = await this.hasUserVoted(idea.$id, userId);
          return {
            ...idea,
            hasUserVoted: hasVoted
          };
        })
      );

      return ideasWithVoteStatus;
    } catch (error) {
      console.error('Error fetching ideas with vote status:', error);
      throw new Error(`Failed to fetch ideas with vote status: ${error.message}`);
    }
  },

  /**
   * Subscribe to real-time idea updates
   * @param {string} teamId - The team ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToIdeas(teamId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.IDEAS}.documents`,
        (response) => {
          // Only process events for this team
          if (response.payload.teamId === teamId) {
            callback(response);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to ideas:', error);
      throw new Error('Failed to subscribe to idea updates');
    }
  },

  /**
   * Subscribe to real-time vote updates
   * @param {string} ideaId - The idea ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToVotes(ideaId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.IDEA_VOTES}.documents`,
        (response) => {
          // Only process events for this idea
          if (response.payload.ideaId === ideaId) {
            callback(response);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to votes:', error);
      throw new Error('Failed to subscribe to vote updates');
    }
  }
};