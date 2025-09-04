import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '@/lib/appwrite';

/**
 * Poll Service for managing team polls and voting
 * Handles poll creation, voting, results calculation, and task conversion
 */
class PollService {
  /**
   * Create a new poll
   * @param {string} teamId - Team identifier
   * @param {string} createdBy - User ID of poll creator
   * @param {Object} pollData - Poll content (question, options, settings)
   * @returns {Promise<Object>} Poll document
   */
  async createPoll(teamId, createdBy, pollData) {
    try {
      // Validate required fields
      if (!pollData.question || !pollData.options || pollData.options.length < 2) {
        throw new Error('Question and at least 2 options are required');
      }

      // Set expiration time (default 24 hours)
      const expiresAt = pollData.expiresAt || 
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const poll = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        ID.unique(),
        {
          teamId,
          createdBy,
          question: pollData.question.trim(),
          options: pollData.options.map(opt => opt.trim()).filter(opt => opt.length > 0),
          allowMultiple: pollData.allowMultiple || false,
          expiresAt,
          isActive: true,
          totalVotes: 0,
          createdAt: new Date().toISOString()
        }
      );

      return poll;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Vote on a poll
   * @param {string} pollId - Poll document ID
   * @param {string} userId - User ID voting
   * @param {Array|string} selectedOptions - Selected option(s)
   * @returns {Promise<Object>} Vote document
   */
  async voteOnPoll(pollId, userId, selectedOptions) {
    try {
      // Get poll to check if it's active and get settings
      const poll = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        pollId
      );

      if (!poll.isActive) {
        throw new Error('Poll is not active');
      }

      if (new Date(poll.expiresAt) < new Date()) {
        throw new Error('Poll has expired');
      }

      // Normalize selected options to array
      const options = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions];

      // Validate options
      if (!poll.allowMultiple && options.length > 1) {
        throw new Error('Multiple selections not allowed for this poll');
      }

      const validOptions = options.filter(opt => poll.options.includes(opt));
      if (validOptions.length === 0) {
        throw new Error('No valid options selected');
      }

      // Check if user already voted
      const existingVote = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POLL_VOTES,
        [
          Query.equal('pollId', pollId),
          Query.equal('userId', userId)
        ]
      );

      let vote;
      if (existingVote.documents.length > 0) {
        // Update existing vote
        vote = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.POLL_VOTES,
          existingVote.documents[0].$id,
          {
            selectedOptions: validOptions,
            createdAt: new Date().toISOString() // Update timestamp for vote changes
          }
        );
      } else {
        // Create new vote
        vote = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.POLL_VOTES,
          ID.unique(),
          {
            pollId,
            userId,
            selectedOptions: validOptions,
            createdAt: new Date().toISOString()
          }
        );

        // Update total vote count
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.POLLS,
          pollId,
          {
            totalVotes: poll.totalVotes + 1
          }
        );
      }

      return vote;
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  }

  /**
   * Get all polls for a team
   * @param {string} teamId - Team identifier
   * @param {Object} options - Query options (includeExpired, limit)
   * @returns {Promise<Array>} Array of poll documents
   */
  async getTeamPolls(teamId, options = {}) {
    try {
      const queries = [Query.equal('teamId', teamId)];

      // Filter out expired polls unless requested
      if (!options.includeExpired) {
        queries.push(Query.greaterThan('expiresAt', new Date().toISOString()));
      }

      queries.push(Query.orderDesc('createdAt'));
      queries.push(Query.limit(options.limit || 20));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        queries
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching team polls:', error);
      throw error;
    }
  }

  /**
   * Get poll results with vote counts and percentages
   * @param {string} pollId - Poll document ID
   * @returns {Promise<Object>} Poll results with statistics
   */
  async getPollResults(pollId) {
    try {
      const [poll, votes] = await Promise.all([
        databases.getDocument(DATABASE_ID, COLLECTIONS.POLLS, pollId),
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.POLL_VOTES,
          [Query.equal('pollId', pollId)]
        )
      ]);

      // Count votes for each option
      const optionCounts = {};
      poll.options.forEach(option => {
        optionCounts[option] = 0;
      });

      votes.documents.forEach(vote => {
        vote.selectedOptions.forEach(option => {
          if (optionCounts.hasOwnProperty(option)) {
            optionCounts[option]++;
          }
        });
      });

      // Calculate percentages
      const totalVotesCast = Object.values(optionCounts).reduce((sum, count) => sum + count, 0);
      const results = poll.options.map(option => ({
        option,
        votes: optionCounts[option],
        percentage: totalVotesCast > 0 ? Math.round((optionCounts[option] / totalVotesCast) * 100) : 0
      }));

      // Find winning option(s)
      const maxVotes = Math.max(...results.map(r => r.votes));
      const winners = results.filter(r => r.votes === maxVotes && maxVotes > 0);

      return {
        poll,
        results,
        totalVotes: totalVotesCast,
        uniqueVoters: votes.documents.length,
        winners: winners.map(w => w.option),
        isExpired: new Date(poll.expiresAt) < new Date()
      };
    } catch (error) {
      console.error('Error getting poll results:', error);
      throw error;
    }
  }

  /**
   * Close a poll manually
   * @param {string} pollId - Poll document ID
   * @returns {Promise<Object>} Updated poll document
   */
  async closePoll(pollId) {
    try {
      const updatedPoll = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        pollId,
        {
          isActive: false,
          closedAt: new Date().toISOString()
        }
      );

      return updatedPoll;
    } catch (error) {
      console.error('Error closing poll:', error);
      throw error;
    }
  }

  /**
   * Get user's vote for a poll
   * @param {string} pollId - Poll document ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User's vote document
   */
  async getUserVote(pollId, userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POLL_VOTES,
        [
          Query.equal('pollId', pollId),
          Query.equal('userId', userId)
        ]
      );

      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  }

  /**
   * Get vote details for multiple polls
   * @param {Array} pollIds - Array of poll IDs
   * @param {string} userId - User ID to check votes for
   * @returns {Promise<Object>} Map of pollId to user vote
   */
  async getVoteDetails(pollIds, userId) {
    try {
      const votes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POLL_VOTES,
        [
          Query.equal('userId', userId),
          Query.contains('pollId', pollIds)
        ]
      );

      const voteMap = {};
      votes.documents.forEach(vote => {
        voteMap[vote.pollId] = vote.selectedOptions;
      });

      return voteMap;
    } catch (error) {
      console.error('Error getting vote details:', error);
      return {};
    }
  }

  /**
   * Create a quick yes/no poll
   * @param {string} teamId - Team identifier
   * @param {string} createdBy - User ID of poll creator
   * @param {string} question - Poll question
   * @param {number} expirationHours - Hours until expiration (default 1)
   * @returns {Promise<Object>} Poll document
   */
  async createQuickPoll(teamId, createdBy, question, expirationHours = 1) {
    try {
      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();

      return await this.createPoll(teamId, createdBy, {
        question,
        options: ['Yes', 'No'],
        allowMultiple: false,
        expiresAt
      });
    } catch (error) {
      console.error('Error creating quick poll:', error);
      throw error;
    }
  }

  /**
   * Convert poll winning option to task (integration point)
   * @param {string} pollId - Poll document ID
   * @param {string} winningOption - Winning poll option
   * @returns {Promise<Object>} Task creation data
   */
  async convertPollToTask(pollId, winningOption) {
    try {
      const poll = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        pollId
      );

      if (!poll.options.includes(winningOption)) {
        throw new Error('Invalid winning option');
      }

      // This will integrate with existing taskService
      // For now, return the data that would be used for task creation
      return {
        title: `Poll Decision: ${winningOption}`,
        description: `Task created from poll: "${poll.question}"\nWinning option: ${winningOption}`,
        teamId: poll.teamId,
        createdBy: poll.createdBy,
        sourceType: 'poll',
        sourceId: pollId,
        priority: 'medium'
      };
    } catch (error) {
      console.error('Error converting poll to task:', error);
      throw error;
    }
  }

  /**
   * Subscribe to poll changes for a team
   * @param {string} teamId - Team identifier
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToPolls(teamId, callback) {
    // This will be implemented with Appwrite realtime subscriptions
    // For now, return a no-op unsubscribe function
    return () => {};
  }

  /**
   * Auto-expire polls that have passed their expiration time
   * @param {string} teamId - Team identifier (optional, for team-specific cleanup)
   * @returns {Promise<Array>} Array of expired poll IDs
   */
  async expirePolls(teamId = null) {
    try {
      const queries = [
        Query.equal('isActive', true),
        Query.lessThan('expiresAt', new Date().toISOString())
      ];

      if (teamId) {
        queries.push(Query.equal('teamId', teamId));
      }

      const expiredPolls = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        queries
      );

      const expiredIds = [];
      for (const poll of expiredPolls.documents) {
        await this.closePoll(poll.$id);
        expiredIds.push(poll.$id);
      }

      return expiredIds;
    } catch (error) {
      console.error('Error expiring polls:', error);
      return [];
    }
  }
}

export default new PollService();