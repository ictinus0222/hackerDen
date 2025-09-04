import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '../lib/appwrite';
import client from '../lib/appwrite';
import { messageService } from './messageService';

// Helper function to send idea system messages with error handling
const sendIdeaSystemMessage = async (teamId, hackathonId, messageType, content, systemData) => {
  try {
    await messageService.sendSystemMessage(teamId, hackathonId, content, messageType, systemData);
  } catch (error) {
    console.warn('Failed to send idea system message:', error);
    // Don't fail the parent operation - just log the warning
  }
};

export const ideaService = {
  // Create a new idea
  async createIdea(teamId, hackathonId, ideaData, creatorName) {
    try {
      // Store user name in the userNameService cache when creating ideas
      if (ideaData.createdBy && creatorName) {
        const { userNameService } = await import('./userNameService');
        userNameService.setUserName(ideaData.createdBy, creatorName);
      }

      const idea = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ID.unique(),
        {
          teamId,
          hackathonId,
          title: ideaData.title,
          description: ideaData.description || '',
          tags: ideaData.tags && Array.isArray(ideaData.tags) ? ideaData.tags : [],
          status: 'submitted',
          createdBy: ideaData.createdBy,
          voteCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      // Send system message for idea creation
      const systemMessageContent = `💡 ${creatorName} submitted a new idea: "${ideaData.title}"`;
      
      const systemData = {
        ideaId: idea.$id,
        ideaTitle: ideaData.title,
        createdBy: creatorName,
        status: 'submitted'
      };

      await sendIdeaSystemMessage(teamId, hackathonId, 'idea_created', systemMessageContent, systemData);

      return idea;
    } catch (error) {
      console.error('Error creating idea:', error);
      console.error('Idea data being sent:', {
        teamId,
        hackathonId,
        title: ideaData.title,
        description: ideaData.description || '',
        tags: ideaData.tags || [],
        status: 'submitted',
        createdBy: ideaData.createdBy,
        voteCount: 0
      });
      
      // Provide more specific error messages
      if (error.code === 400) {
        throw new Error(`Database validation error: ${error.message}`);
      } else if (error.code === 401) {
        throw new Error('Permission denied. Check your Appwrite permissions.');
      } else if (error.code === 404) {
        throw new Error('Ideas collection not found. Please check your database setup.');
      } else if (error.message.includes('Attribute not found')) {
        throw new Error(`Missing database attribute: ${error.message}`);
      } else {
        throw new Error(`Failed to create idea: ${error.message || 'Unknown error'}`);
      }
    }
  },

  // Get all ideas for a team in a specific hackathon
  async getTeamIdeas(teamId, hackathonId) {
    // Validate parameters
    if (!teamId) {
      throw new Error('Team ID is required to fetch ideas');
    }
    if (!hackathonId) {
      throw new Error('Hackathon ID is required to fetch ideas');
    }

    try {
      console.log('Fetching ideas for team:', teamId, 'in hackathon:', hackathonId);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        [
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId),
          Query.orderDesc('$createdAt')
        ]
      );
      
      console.log('Ideas response:', response);
      return response.documents;
    } catch (error) {
      console.error('Error fetching team ideas:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      // Handle specific error cases
      if (error.message.includes('Collection with the requested ID could not be found')) {
        throw new Error('Ideas collection not found. Please create the "ideas" collection in your Appwrite database.');
      } else if (error.message.includes('Attribute not found in schema')) {
        throw new Error('Ideas collection schema is incomplete. Please add the required attributes to the ideas collection.');
      } else if (error.code === 401) {
        throw new Error('Unauthorized access to ideas. Please check collection permissions.');
      } else {
        throw new Error(`Failed to fetch ideas: ${error.message}`);
      }
    }
  },

  // Vote on an idea
  async voteOnIdea(ideaId, userId, userName = 'User') {
    try {
      // Check if user has already voted on this idea
      const existingVotes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        [
          Query.equal('ideaId', ideaId),
          Query.equal('userId', userId)
        ]
      );

      if (existingVotes.documents.length > 0) {
        throw new Error('You have already voted on this idea');
      }

      // Create the vote
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

      // Get current idea to update vote count
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      // Update idea vote count
      const updatedIdea = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          voteCount: (idea.voteCount || 0) + 1,
          updatedAt: new Date().toISOString()
        }
      );

      // Send system message for vote
      const systemMessageContent = `👍 ${userName} voted on idea: "${idea.title}" (${updatedIdea.voteCount} votes)`;
      
      const systemData = {
        ideaId: ideaId,
        ideaTitle: idea.title,
        votedBy: userName,
        newVoteCount: updatedIdea.voteCount
      };

      await sendIdeaSystemMessage(idea.teamId, idea.hackathonId, 'idea_voted', systemMessageContent, systemData);

      // Check for auto-approval after voting
      const finalIdea = await this.checkAutoApproval(ideaId);

      return { vote, updatedIdea: finalIdea };
    } catch (error) {
      console.error('Error voting on idea:', error);
      throw new Error(error.message || 'Failed to vote on idea');
    }
  },

  // Update idea status
  async updateIdeaStatus(ideaId, status, userName = 'System') {
    try {
      // Validate status
      const validStatuses = ['submitted', 'approved', 'in_progress', 'completed', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be submitted, approved, in_progress, completed, or rejected.');
      }

      // Get the current idea to check the old status
      const currentIdea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      const oldStatus = currentIdea.status;

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
      if (oldStatus !== status) {
        let systemMessageContent;
        let messageType;

        const statusEmoji = {
          'submitted': '💡',
          'approved': '✅',
          'in_progress': '🔄',
          'completed': '🎉',
          'rejected': '❌'
        };
        
        systemMessageContent = `${statusEmoji[status] || '🔄'} ${userName} changed idea "${currentIdea.title}" from ${oldStatus} to ${status}`;
        messageType = 'idea_status_changed';

        const systemData = {
          ideaId: ideaId,
          ideaTitle: currentIdea.title,
          oldStatus: oldStatus,
          newStatus: status,
          changedBy: userName
        };

        await sendIdeaSystemMessage(currentIdea.teamId, currentIdea.hackathonId, messageType, systemMessageContent, systemData);
      }

      return updatedIdea;
    } catch (error) {
      console.error('Error updating idea status:', error);
      throw new Error(error.message || 'Failed to update idea status');
    }
  },

  // Convert idea to task with enhanced integration
  async convertIdeaToTask(ideaId, userName = 'System') {
    try {
      // Get the idea details
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      // Get creator name from userNameService
      let creatorName = userName;
      let assignedToName = userName;
      
      try {
        const { userNameService } = await import('./userNameService');
        creatorName = await userNameService.getUserName(idea.createdBy) || userName;
        assignedToName = creatorName;
      } catch (error) {
        console.warn('Could not get creator name from userNameService:', error);
      }

      // Import task service
      const { taskService } = await import('./taskService');
      
      const taskData = {
        title: idea.title,
        description: `${idea.description}\n\n_Converted from idea with ${idea.voteCount} votes_`,
        assignedTo: idea.createdBy,
        createdBy: idea.createdBy,
        priority: idea.voteCount >= 5 ? 'high' : 'medium', // Higher priority for popular ideas
        labels: [...(idea.tags || []), 'from-idea']
      };

      // Create the task using proper creator and assignee names
      const task = await taskService.createTask(
        idea.teamId, 
        idea.hackathonId, 
        taskData, 
        creatorName,
        assignedToName
      );

      // Update idea status to in_progress
      const updatedIdea = await this.updateIdeaStatus(ideaId, 'in_progress', userName);

      // Send enhanced system message
      const systemMessageContent = `🔄 ${userName} converted idea "${idea.title}" to a task (${idea.voteCount} votes)`;
      
      const systemData = {
        ideaId: ideaId,
        taskId: task.$id,
        ideaTitle: idea.title,
        taskTitle: task.title,
        voteCount: idea.voteCount,
        convertedBy: userName
      };

      await sendIdeaSystemMessage(idea.teamId, idea.hackathonId, 'idea_converted_to_task', systemMessageContent, systemData);

      return { task, updatedIdea };
    } catch (error) {
      console.error('Error converting idea to task:', error);
      throw new Error(error.message || 'Failed to convert idea to task');
    }
  },

  // Check and auto-approve ideas based on vote threshold
  async checkAutoApproval(ideaId, voteThreshold = 3) {
    try {
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      // Only auto-approve if idea is still in submitted status and meets threshold
      if (idea.status === 'submitted' && idea.voteCount >= voteThreshold) {
        const updatedIdea = await this.updateIdeaStatus(ideaId, 'approved', 'System');
        
        // Send special system message for auto-approval
        const systemMessageContent = `🎉 Idea "${idea.title}" was automatically approved with ${idea.voteCount} votes!`;
        
        const systemData = {
          ideaId: ideaId,
          ideaTitle: idea.title,
          voteCount: idea.voteCount,
          threshold: voteThreshold,
          autoApproved: true
        };

        await sendIdeaSystemMessage(idea.teamId, idea.hackathonId, 'idea_auto_approved', systemMessageContent, systemData);
        
        return updatedIdea;
      }

      return idea;
    } catch (error) {
      console.error('Error checking auto-approval:', error);
      throw new Error(error.message || 'Failed to check auto-approval');
    }
  },

  // Get user's vote status for ideas
  async getUserVoteStatus(ideaIds, userId) {
    try {
      if (!ideaIds || ideaIds.length === 0) {
        return {};
      }

      const votes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEA_VOTES,
        [
          Query.equal('userId', userId),
          Query.equal('ideaId', ideaIds)
        ]
      );

      // Create a map of ideaId -> hasVoted
      const voteStatus = {};
      votes.documents.forEach(vote => {
        voteStatus[vote.ideaId] = true;
      });

      return voteStatus;
    } catch (error) {
      console.error('Error getting user vote status:', error);
      return {};
    }
  },

  // Subscribe to real-time idea updates
  subscribeToIdeas(teamId, hackathonId, callback) {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.IDEAS}.documents`,
      (response) => {
        // Only process events for ideas belonging to this team and hackathon
        if (response.payload.teamId === teamId && response.payload.hackathonId === hackathonId) {
          callback(response);
        }
      }
    );

    return unsubscribe;
  },

  // Subscribe to real-time vote updates
  subscribeToVotes(callback) {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.IDEA_VOTES}.documents`,
      callback
    );

    return unsubscribe;
  }
};