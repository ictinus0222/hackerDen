import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '@/lib/appwrite';
import { messageService } from './messageService';

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
   * @param {string} hackathonId - Hackathon identifier for chat integration
   * @param {string} creatorName - Creator name for chat messages
   * @returns {Promise<Object>} Poll document
   */
  async createPoll(teamId, createdBy, pollData, hackathonId = null, creatorName = 'Team Member') {
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

      // Send poll creation message to chat
      if (hackathonId) {
        try {
          await messageService.sendPollMessage(
            teamId, 
            hackathonId, 
            poll.$id, 
            poll.question, 
            creatorName
          );
        } catch (chatError) {
          console.warn('Failed to send poll creation message to chat:', chatError);
          // Don't fail poll creation if chat message fails
        }
      }

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
   * @param {string} hackathonId - Hackathon identifier for chat integration
   * @param {string} voterName - Voter name for chat messages
   * @returns {Promise<Object>} Vote document
   */
  async voteOnPoll(pollId, userId, selectedOptions, hackathonId = null, voterName = 'Team Member') {
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
      let isNewVote = false;
      
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

        isNewVote = true;

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

      // Send vote notification to chat (only for new votes, not updates)
      if (hackathonId && isNewVote) {
        try {
          await messageService.sendPollVoteMessage(
            poll.teamId, 
            hackathonId, 
            pollId, 
            poll.question, 
            voterName, 
            validOptions
          );
        } catch (chatError) {
          console.warn('Failed to send poll vote message to chat:', chatError);
          // Don't fail vote if chat message fails
        }
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
   * @param {string} hackathonId - Hackathon identifier for chat integration
   * @returns {Promise<Object>} Updated poll document
   */
  async closePoll(pollId, hackathonId = null) {
    try {
      // Get poll data before closing
      const poll = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        pollId
      );

      const updatedPoll = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        pollId,
        {
          isActive: false,
          closedAt: new Date().toISOString()
        }
      );

      // Send poll result notification to chat
      if (hackathonId) {
        try {
          const results = await this.getPollResults(pollId);
          await messageService.sendPollResultMessage(
            poll.teamId,
            hackathonId,
            pollId,
            poll.question,
            results.winners,
            results.totalVotes
          );
        } catch (chatError) {
          console.warn('Failed to send poll result message to chat:', chatError);
          // Don't fail poll closure if chat message fails
        }
      }

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
   * @param {string} hackathonId - Hackathon identifier for task creation
   * @param {string} creatorId - User ID creating the task
   * @param {string} creatorName - Creator name for chat messages
   * @returns {Promise<Object>} Created task document
   */
  async convertPollToTask(pollId, winningOption, hackathonId, creatorId, creatorName = 'Team Member') {
    try {
      const poll = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        pollId
      );

      if (!poll.options.includes(winningOption)) {
        throw new Error('Invalid winning option');
      }

      // Get poll results to include in task description
      const results = await this.getPollResults(pollId);
      const winningResult = results.results.find(r => r.option === winningOption);
      
      // Create detailed task description
      const description = [
        `Task created from team poll decision.`,
        ``,
        `**Poll Question:** ${poll.question}`,
        `**Winning Option:** ${winningOption} (${winningResult?.votes || 0} votes, ${winningResult?.percentage || 0}%)`,
        `**Total Votes:** ${results.totalVotes} from ${results.uniqueVoters} team members`,
        ``,
        `**Implementation Notes:**`,
        `- This task represents the team's collective decision`,
        `- Consider the poll discussion context when implementing`,
        `- Update task status to keep the team informed of progress`
      ].join('\n');

      const taskTitle = `Implement: ${winningOption}`;

      // Import taskService dynamically to avoid circular dependencies
      const { taskService } = await import('./taskService');
      
      // Use the new integrated method in taskService
      const task = await taskService.createTaskFromPoll(
        pollId,
        winningOption,
        poll.teamId,
        hackathonId,
        creatorId,
        creatorName
      );

      return task;
    } catch (error) {
      console.error('Error converting poll to task:', error);
      throw error;
    }
  }

  /**
   * Export poll results in various formats
   * @param {string} pollId - Poll document ID
   * @param {string} format - Export format ('csv', 'json', 'markdown')
   * @returns {Promise<Object>} Export data with content and filename
   */
  async exportPollResults(pollId, format = 'csv') {
    try {
      const results = await this.getPollResults(pollId);
      const poll = results.poll;
      const timestamp = new Date().toISOString().split('T')[0];
      
      let content, filename, mimeType;

      switch (format.toLowerCase()) {
        case 'json':
          content = JSON.stringify({
            poll: {
              id: poll.$id,
              question: poll.question,
              createdAt: poll.createdAt,
              expiresAt: poll.expiresAt,
              isActive: poll.isActive,
              allowMultiple: poll.allowMultiple
            },
            results: results.results,
            summary: {
              totalVotes: results.totalVotes,
              uniqueVoters: results.uniqueVoters,
              winners: results.winners,
              isExpired: results.isExpired
            },
            exportedAt: new Date().toISOString()
          }, null, 2);
          filename = `poll-results-${poll.$id}-${timestamp}.json`;
          mimeType = 'application/json';
          break;

        case 'markdown':
          content = [
            `# Poll Results: ${poll.question}`,
            ``,
            `**Poll ID:** ${poll.$id}`,
            `**Created:** ${new Date(poll.createdAt).toLocaleString()}`,
            `**Expires:** ${new Date(poll.expiresAt).toLocaleString()}`,
            `**Status:** ${results.isExpired ? 'Expired' : 'Active'}`,
            `**Type:** ${poll.allowMultiple ? 'Multiple Choice' : 'Single Choice'}`,
            ``,
            `## Results`,
            ``,
            `**Total Votes:** ${results.totalVotes}`,
            `**Unique Voters:** ${results.uniqueVoters}`,
            ``,
            `| Option | Votes | Percentage | Winner |`,
            `|--------|-------|------------|---------|`,
            ...results.results.map(result => 
              `| ${result.option} | ${result.votes} | ${result.percentage}% | ${results.winners.includes(result.option) ? '🏆' : ''} |`
            ),
            ``,
            `**Winners:** ${results.winners.join(', ')}`,
            ``,
            `---`,
            `*Exported on ${new Date().toLocaleString()}*`
          ].join('\n');
          filename = `poll-results-${poll.$id}-${timestamp}.md`;
          mimeType = 'text/markdown';
          break;

        default: // CSV
          content = [
            ['Option', 'Votes', 'Percentage', 'Winner'],
            ...results.results.map(result => [
              result.option,
              result.votes,
              `${result.percentage}%`,
              results.winners.includes(result.option) ? 'Yes' : 'No'
            ]),
            [],
            ['Poll Question', poll.question],
            ['Total Votes', results.totalVotes],
            ['Unique Voters', results.uniqueVoters],
            ['Created At', new Date(poll.createdAt).toLocaleString()],
            ['Expires At', new Date(poll.expiresAt).toLocaleString()],
            ['Status', results.isExpired ? 'Expired' : 'Active'],
            ['Exported At', new Date().toLocaleString()]
          ].map(row => row.join(',')).join('\n');
          filename = `poll-results-${poll.$id}-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
      }

      return {
        content,
        filename,
        mimeType
      };
    } catch (error) {
      console.error('Error exporting poll results:', error);
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
    try {
      // Import client dynamically to avoid circular dependencies
      const client = require('@/lib/appwrite').default;
      
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.POLLS}.documents`,
        (response) => {
          // Only process events for polls belonging to this team
          if (response.payload.teamId === teamId) {
            callback(response);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to polls:', error);
      return () => {};
    }
  }

  /**
   * Subscribe to poll vote changes for a specific poll
   * @param {string} pollId - Poll identifier
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToPollVotes(pollId, callback) {
    try {
      // Import client dynamically to avoid circular dependencies
      const client = require('@/lib/appwrite').default;
      
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.POLL_VOTES}.documents`,
        (response) => {
          // Only process events for votes belonging to this poll
          if (response.payload.pollId === pollId) {
            callback(response);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to poll votes:', error);
      return () => {};
    }
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