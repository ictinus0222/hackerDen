/**
 * @fileoverview Gamification Service for HackerDen Enhancement Features
 * Handles point tracking, achievement system, and leaderboard functionality
 */

import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '../lib/appwrite';
import client from '../lib/appwrite';

// Point values for different actions
const POINT_VALUES = {
  TASK_COMPLETION: 10,
  MESSAGE_SENT: 1,
  FILE_UPLOAD: 5,
  IDEA_SUBMISSION: 3,
  VOTE_GIVEN: 1
};

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
  FIRST_TASK: {
    type: 'first_task',
    name: 'Getting Started',
    description: 'Complete your first task',
    pointsAwarded: 5,
    condition: (breakdown) => breakdown.tasksCompleted >= 1
  },
  TASK_MASTER: {
    type: 'task_master',
    name: 'Task Master',
    description: 'Complete 10 tasks',
    pointsAwarded: 25,
    condition: (breakdown) => breakdown.tasksCompleted >= 10
  },
  COMMUNICATOR: {
    type: 'communicator',
    name: 'Team Communicator',
    description: 'Send 50 messages',
    pointsAwarded: 15,
    condition: (breakdown) => breakdown.messagesPosted >= 50
  },
  FILE_SHARER: {
    type: 'file_sharer',
    name: 'File Sharer',
    description: 'Upload 5 files',
    pointsAwarded: 20,
    condition: (breakdown) => breakdown.filesUploaded >= 5
  },
  IDEA_GENERATOR: {
    type: 'idea_generator',
    name: 'Idea Generator',
    description: 'Submit 5 ideas',
    pointsAwarded: 15,
    condition: (breakdown) => breakdown.ideasSubmitted >= 5
  },
  TEAM_PLAYER: {
    type: 'team_player',
    name: 'Team Player',
    description: 'Give 20 votes',
    pointsAwarded: 10,
    condition: (breakdown) => breakdown.votesGiven >= 20
  },
  HUNDRED_CLUB: {
    type: 'hundred_club',
    name: '100 Club',
    description: 'Reach 100 total points',
    pointsAwarded: 50,
    condition: (breakdown, totalPoints) => totalPoints >= 100
  },
  FIVE_HUNDRED_CLUB: {
    type: 'five_hundred_club',
    name: '500 Club',
    description: 'Reach 500 total points',
    pointsAwarded: 100,
    condition: (breakdown, totalPoints) => totalPoints >= 500
  }
};

export const gamificationService = {
  /**
   * Award points to a user for a specific action
   * @param {string} userId - The user ID
   * @param {string} teamId - The team ID
   * @param {string} action - The action type (task_completion, message_sent, etc.)
   * @param {number} customPoints - Optional custom point value (overrides default)
   * @param {string} hackathonId - Hackathon ID for chat integration
   * @param {string} userName - User name for chat messages
   * @returns {Promise<Object>} Updated user points document
   */
  async awardPoints(userId, teamId, action, customPoints = null, hackathonId = null, userName = 'Team Member') {
    try {
      // Get point value for action
      const points = customPoints || POINT_VALUES[action.toUpperCase()] || 0;
      
      if (points === 0) {
        console.warn(`No points defined for action: ${action}`);
        return null;
      }

      // Get or create user points document
      let userPoints = await this.getUserPoints(userId, teamId);
      
      if (!userPoints) {
        // Create new user points document
        const pointsBreakdown = {
          tasksCompleted: 0,
          messagesPosted: 0,
          filesUploaded: 0,
          ideasSubmitted: 0,
          votesGiven: 0
        };

        userPoints = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USER_POINTS,
          ID.unique(),
          {
            userId,
            teamId,
            totalPoints: 0,
            pointsBreakdown: JSON.stringify(pointsBreakdown),
            updatedAt: new Date().toISOString()
          }
        );
      }

      // Parse current breakdown
      const currentBreakdown = JSON.parse(userPoints.pointsBreakdown);
      
      // Update breakdown based on action
      switch (action.toLowerCase()) {
        case 'task_completion':
          currentBreakdown.tasksCompleted += 1;
          break;
        case 'message_sent':
          currentBreakdown.messagesPosted += 1;
          break;
        case 'file_upload':
          currentBreakdown.filesUploaded += 1;
          break;
        case 'idea_submission':
          currentBreakdown.ideasSubmitted += 1;
          break;
        case 'vote_given':
          currentBreakdown.votesGiven += 1;
          break;
        default:
          console.warn(`Unknown action for breakdown: ${action}`);
      }

      // Update total points
      const newTotalPoints = userPoints.totalPoints + points;

      // Update user points document
      const updatedUserPoints = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_POINTS,
        userPoints.$id,
        {
          totalPoints: newTotalPoints,
          pointsBreakdown: JSON.stringify(currentBreakdown),
          updatedAt: new Date().toISOString()
        }
      );

      // Check for new achievements
      await this.checkAndAwardAchievements(userId, currentBreakdown, newTotalPoints, true, teamId, hackathonId, userName);

      return updatedUserPoints;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw new Error(`Failed to award points: ${error.message}`);
    }
  },

  /**
   * Get user points for a specific user and team
   * @param {string} userId - The user ID
   * @param {string} teamId - The team ID
   * @returns {Promise<Object|null>} User points document or null if not found
   */
  async getUserPoints(userId, teamId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_POINTS,
        [
          Query.equal('userId', userId),
          Query.equal('teamId', teamId),
          Query.limit(1)
        ]
      );

      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
      console.error('Error fetching user points:', error);
      throw new Error(`Failed to fetch user points: ${error.message}`);
    }
  },

  /**
   * Get user progress including points and achievements
   * @param {string} userId - The user ID
   * @param {string} teamId - The team ID (optional, if not provided gets all teams)
   * @returns {Promise<Object>} User progress data
   */
  async getUserProgress(userId, teamId = null) {
    try {
      const queries = [Query.equal('userId', userId)];
      if (teamId) {
        queries.push(Query.equal('teamId', teamId));
      }

      // Get user points
      const pointsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_POINTS,
        queries
      );

      // Get user achievements
      const achievementsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('unlockedAt')
        ]
      );

      // Calculate total points across all teams if no specific team
      let totalPoints = 0;
      let combinedBreakdown = {
        tasksCompleted: 0,
        messagesPosted: 0,
        filesUploaded: 0,
        ideasSubmitted: 0,
        votesGiven: 0
      };

      pointsResponse.documents.forEach(doc => {
        totalPoints += doc.totalPoints;
        const breakdown = JSON.parse(doc.pointsBreakdown);
        Object.keys(combinedBreakdown).forEach(key => {
          combinedBreakdown[key] += breakdown[key] || 0;
        });
      });

      return {
        userId,
        teamId,
        totalPoints,
        pointsBreakdown: combinedBreakdown,
        achievements: achievementsResponse.documents,
        teamPoints: pointsResponse.documents
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw new Error(`Failed to fetch user progress: ${error.message}`);
    }
  },

  /**
   * Get leaderboard for a team
   * @param {string} teamId - The team ID
   * @param {number} limit - Number of users to return (default: 10)
   * @returns {Promise<Array>} Leaderboard data
   */
  async getLeaderboard(teamId, limit = 10) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_POINTS,
        [
          Query.equal('teamId', teamId),
          Query.orderDesc('totalPoints'),
          Query.limit(limit)
        ]
      );

      // Enhance with user names if available
      const leaderboard = response.documents.map((doc, index) => ({
        rank: index + 1,
        userId: doc.userId,
        totalPoints: doc.totalPoints,
        pointsBreakdown: JSON.parse(doc.pointsBreakdown),
        updatedAt: doc.updatedAt
      }));

      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }
  },

  /**
   * Check and award achievements based on user progress
   * @param {string} userId - The user ID
   * @param {Object} pointsBreakdown - Current points breakdown
   * @param {number} totalPoints - Total points
   * @param {boolean} showNotifications - Whether to show achievement notifications (default: true)
   * @param {string} teamId - Team ID for chat integration
   * @param {string} hackathonId - Hackathon ID for chat integration
   * @param {string} userName - User name for chat messages
   * @returns {Promise<Array>} Array of newly awarded achievements
   */
  async checkAndAwardAchievements(userId, pointsBreakdown, totalPoints, showNotifications = true, teamId = null, hackathonId = null, userName = 'Team Member') {
    try {
      // Get existing achievements for user
      const existingAchievements = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        [
          Query.equal('userId', userId)
        ]
      );

      const existingTypes = new Set(existingAchievements.documents.map(a => a.achievementType));
      const newAchievements = [];

      // Check each achievement definition
      for (const [key, achievement] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        if (!existingTypes.has(achievement.type) && 
            achievement.condition(pointsBreakdown, totalPoints)) {
          
          // Award new achievement
          const newAchievement = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ACHIEVEMENTS,
            ID.unique(),
            {
              userId,
              achievementType: achievement.type,
              achievementName: achievement.name,
              description: achievement.description,
              iconUrl: '', // Could be populated with actual icon URLs
              pointsAwarded: achievement.pointsAwarded,
              unlockedAt: new Date().toISOString()
            }
          );

          newAchievements.push(newAchievement);

          // Send achievement notification to chat
          if (teamId && hackathonId) {
            try {
              // Import messageService dynamically to avoid circular dependency
              const messageServiceModule = await import('./messageService.js');
              await messageServiceModule.messageService.sendAchievementMessage(
                teamId,
                hackathonId,
                userName,
                achievement.name,
                achievement.description
              );
            } catch (chatError) {
              console.warn('Failed to send achievement notification to chat:', chatError);
              // Don't fail achievement if chat notification fails
            }
          }
        }
      }

      // Show notifications for new achievements if enabled
      if (showNotifications && newAchievements.length > 0) {
        // Dynamically import to avoid circular dependencies
        try {
          const { showMultipleAchievementsNotification } = await import('../components/AchievementNotification.jsx');
          showMultipleAchievementsNotification(newAchievements);
        } catch (importError) {
          console.warn('Achievement notification component not available:', importError);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw new Error(`Failed to check achievements: ${error.message}`);
    }
  },

  /**
   * Get point history for audit trail
   * @param {string} userId - The user ID
   * @param {string} teamId - The team ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Point history records
   */
  async getPointHistory(userId, teamId, limit = 50) {
    try {
      // For now, we'll return the current state
      // In a full implementation, you might want a separate point_history collection
      const userPoints = await this.getUserPoints(userId, teamId);
      
      if (!userPoints) {
        return [];
      }

      // Return a simplified history based on current breakdown
      const breakdown = JSON.parse(userPoints.pointsBreakdown);
      const history = [];

      // Generate history entries based on breakdown
      Object.entries(breakdown).forEach(([action, count]) => {
        if (count > 0) {
          history.push({
            action,
            count,
            totalPoints: count * (POINT_VALUES[action.toUpperCase().replace('S_', '_')] || 1),
            lastUpdated: userPoints.updatedAt
          });
        }
      });

      return history;
    } catch (error) {
      console.error('Error fetching point history:', error);
      throw new Error(`Failed to fetch point history: ${error.message}`);
    }
  },

  /**
   * Subscribe to real-time user points updates
   * @param {string} userId - The user ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToUserPoints(userId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.USER_POINTS}.documents`,
        (response) => {
          // Only process events for this user
          if (response.payload.userId === userId) {
            callback(response);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to user points:', error);
      throw new Error('Failed to subscribe to user points updates');
    }
  },

  /**
   * Subscribe to real-time achievements updates
   * @param {string} userId - The user ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToAchievements(userId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.ACHIEVEMENTS}.documents`,
        (response) => {
          // Only process events for this user
          if (response.payload.userId === userId) {
            callback(response);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to achievements:', error);
      throw new Error('Failed to subscribe to achievements updates');
    }
  },

  /**
   * Get available achievement definitions
   * @returns {Object} Achievement definitions
   */
  getAchievementDefinitions() {
    return ACHIEVEMENT_DEFINITIONS;
  },

  /**
   * Get point values for different actions
   * @returns {Object} Point values
   */
  getPointValues() {
    return POINT_VALUES;
  },

  /**
   * Trigger celebration effect for achievements or milestones
   * @param {string} type - Type of celebration (achievement, milestone, task_completion)
   * @param {Object} data - Additional data for the celebration
   * @param {string} teamId - Team ID for chat integration
   * @param {string} hackathonId - Hackathon ID for chat integration
   * @returns {Promise<void>}
   */
  async triggerCelebration(type, data = {}, teamId = null, hackathonId = null) {
    try {
      // Emit custom events for celebration system to listen to
      const celebrationEvent = new CustomEvent('gamification-celebration', {
        detail: { type, data }
      });
      window.dispatchEvent(celebrationEvent);

      // Send celebration message to chat
      if (teamId && hackathonId) {
        try {
          // Import messageService dynamically to avoid circular dependency
          const messageServiceModule = await import('./messageService.js');
          await messageServiceModule.messageService.sendCelebrationMessage(teamId, hackathonId, type, data);
        } catch (chatError) {
          console.warn('Failed to send celebration message to chat:', chatError);
          // Don't fail celebration if chat message fails
        }
      }

      // Also try to import celebration components if available
      try {
        const { showCelebrationEffect } = await import('../components/AchievementNotification.jsx');
        
        switch (type) {
          case 'achievement':
            showCelebrationEffect(data);
            break;
          case 'task_completion':
            // Simple confetti for task completion
            showCelebrationEffect({ achievementType: 'task_completion' });
            break;
          case 'milestone':
            // Major celebration for milestones
            showCelebrationEffect({ achievementType: 'milestone' });
            break;
          default:
            console.warn(`Unknown celebration type: ${type}`);
        }
      } catch (importError) {
        console.warn('Celebration components not available:', importError);
      }
    } catch (error) {
      console.error('Error triggering celebration:', error);
      // Don't throw error for celebration failures - they're not critical
    }
  },

  /**
   * Get leaderboard with real-time updates
   * @param {string} teamId - The team ID
   * @param {number} limit - Number of users to return (default: 10)
   * @returns {Promise<Array>} Enhanced leaderboard data with user names
   */
  async getEnhancedLeaderboard(teamId, limit = 10) {
    try {
      const leaderboard = await this.getLeaderboard(teamId, limit);
      
      // Enhance with additional data if needed
      const enhancedLeaderboard = leaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        // Add percentage of top score
        percentageOfTop: leaderboard.length > 0 && leaderboard[0].totalPoints > 0 
          ? Math.round((entry.totalPoints / leaderboard[0].totalPoints) * 100)
          : 100
      }));

      return enhancedLeaderboard;
    } catch (error) {
      console.error('Error fetching enhanced leaderboard:', error);
      throw new Error(`Failed to fetch enhanced leaderboard: ${error.message}`);
    }
  },

  /**
   * Subscribe to real-time leaderboard updates
   * @param {string} teamId - The team ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToLeaderboard(teamId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.USER_POINTS}.documents`,
        async (response) => {
          // Only process events for this team
          if (response.payload.teamId === teamId) {
            // Fetch updated leaderboard
            try {
              const updatedLeaderboard = await this.getEnhancedLeaderboard(teamId);
              callback(updatedLeaderboard);
            } catch (error) {
              console.error('Error fetching updated leaderboard:', error);
            }
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to leaderboard:', error);
      throw new Error('Failed to subscribe to leaderboard updates');
    }
  }
};