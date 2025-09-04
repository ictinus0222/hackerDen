import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '@/lib/appwrite';

/**
 * Gamification Service for managing points, achievements, and celebrations
 * Handles point tracking, badge unlocking, and leaderboard management
 */
class GamificationService {
  // Point values for different actions
  static POINT_VALUES = {
    TASK_COMPLETED: 10,
    MESSAGE_POSTED: 1,
    FILE_UPLOADED: 5,
    IDEA_SUBMITTED: 3,
    VOTE_GIVEN: 1,
    ACHIEVEMENT_UNLOCKED: 5
  };

  // Achievement definitions
  static ACHIEVEMENTS = {
    FIRST_TASK: {
      name: 'Getting Started',
      description: 'Complete your first task',
      type: 'task_milestone',
      condition: { tasksCompleted: 1 },
      points: 5
    },
    TASK_MASTER: {
      name: 'Task Master',
      description: 'Complete 10 tasks',
      type: 'task_milestone',
      condition: { tasksCompleted: 10 },
      points: 25
    },
    COMMUNICATOR: {
      name: 'Team Communicator',
      description: 'Post 50 messages',
      type: 'message_milestone',
      condition: { messagesPosted: 50 },
      points: 15
    },
    FILE_SHARER: {
      name: 'File Sharer',
      description: 'Upload 5 files',
      type: 'file_milestone',
      condition: { filesUploaded: 5 },
      points: 10
    },
    IDEA_GENERATOR: {
      name: 'Idea Generator',
      description: 'Submit 3 ideas',
      type: 'idea_milestone',
      condition: { ideasSubmitted: 3 },
      points: 15
    },
    TEAM_PLAYER: {
      name: 'Team Player',
      description: 'Give 20 votes',
      type: 'vote_milestone',
      condition: { votesGiven: 20 },
      points: 10
    },
    POINT_COLLECTOR: {
      name: 'Point Collector',
      description: 'Earn 100 points',
      type: 'point_milestone',
      condition: { totalPoints: 100 },
      points: 20
    }
  };

  /**
   * Award points to a user for an action
   * @param {string} userId - User ID
   * @param {string} teamId - Team ID
   * @param {string} action - Action type (TASK_COMPLETED, MESSAGE_POSTED, etc.)
   * @param {number} customPoints - Custom point value (optional)
   * @returns {Promise<Object>} Updated user points
   */
  async awardPoints(userId, teamId, action, customPoints = null) {
    try {
      const points = customPoints || this.constructor.POINT_VALUES[action] || 0;
      
      if (points === 0) {
        console.warn(`No points defined for action: ${action}`);
        return null;
      }

      // Get or create user points record
      let userPoints = await this.getUserPoints(userId, teamId);
      
      if (!userPoints) {
        userPoints = await this.createUserPoints(userId, teamId);
      }

      // Update points breakdown
      const breakdown = userPoints.pointsBreakdown;
      switch (action) {
        case 'TASK_COMPLETED':
          breakdown.tasksCompleted += points;
          break;
        case 'MESSAGE_POSTED':
          breakdown.messagesPosted += points;
          break;
        case 'FILE_UPLOADED':
          breakdown.filesUploaded += points;
          break;
        case 'IDEA_SUBMITTED':
          breakdown.ideasSubmitted += points;
          break;
        case 'VOTE_GIVEN':
          breakdown.votesGiven += points;
          break;
        default:
          // For custom actions, add to a general category
          breakdown.other = (breakdown.other || 0) + points;
      }

      // Update total points and breakdown
      const updatedPoints = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_POINTS,
        userPoints.$id,
        {
          totalPoints: userPoints.totalPoints + points,
          pointsBreakdown: breakdown,
          updatedAt: new Date().toISOString()
        }
      );

      // Check for new achievements
      await this.checkAchievements(userId, teamId, updatedPoints);

      return updatedPoints;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  /**
   * Get user points record
   * @param {string} userId - User ID
   * @param {string} teamId - Team ID
   * @returns {Promise<Object|null>} User points document
   */
  async getUserPoints(userId, teamId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_POINTS,
        [
          Query.equal('userId', userId),
          Query.equal('teamId', teamId)
        ]
      );

      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
      console.error('Error getting user points:', error);
      return null;
    }
  }

  /**
   * Create initial user points record
   * @param {string} userId - User ID
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Created user points document
   */
  async createUserPoints(userId, teamId) {
    try {
      const userPoints = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USER_POINTS,
        ID.unique(),
        {
          userId,
          teamId,
          totalPoints: 0,
          pointsBreakdown: {
            tasksCompleted: 0,
            messagesPosted: 0,
            filesUploaded: 0,
            ideasSubmitted: 0,
            votesGiven: 0,
            other: 0
          },
          updatedAt: new Date().toISOString()
        }
      );

      return userPoints;
    } catch (error) {
      console.error('Error creating user points:', error);
      throw error;
    }
  }

  /**
   * Check and unlock achievements for a user
   * @param {string} userId - User ID
   * @param {string} teamId - Team ID
   * @param {Object} userPoints - Current user points data
   * @returns {Promise<Array>} Array of newly unlocked achievements
   */
  async checkAchievements(userId, teamId, userPoints) {
    try {
      const newAchievements = [];
      
      // Get existing achievements
      const existingAchievements = await this.getUserAchievements(userId);
      const existingTypes = existingAchievements.map(a => a.achievementType);

      // Check each achievement type
      for (const [type, achievement] of Object.entries(this.constructor.ACHIEVEMENTS)) {
        if (existingTypes.includes(type)) {
          continue; // Already unlocked
        }

        let unlocked = false;

        // Check conditions based on achievement type
        switch (achievement.type) {
          case 'task_milestone':
            unlocked = this.getActionCount(userPoints, 'tasksCompleted') >= achievement.condition.tasksCompleted;
            break;
          case 'message_milestone':
            unlocked = this.getActionCount(userPoints, 'messagesPosted') >= achievement.condition.messagesPosted;
            break;
          case 'file_milestone':
            unlocked = this.getActionCount(userPoints, 'filesUploaded') >= achievement.condition.filesUploaded;
            break;
          case 'idea_milestone':
            unlocked = this.getActionCount(userPoints, 'ideasSubmitted') >= achievement.condition.ideasSubmitted;
            break;
          case 'vote_milestone':
            unlocked = this.getActionCount(userPoints, 'votesGiven') >= achievement.condition.votesGiven;
            break;
          case 'point_milestone':
            unlocked = userPoints.totalPoints >= achievement.condition.totalPoints;
            break;
        }

        if (unlocked) {
          const newAchievement = await this.unlockAchievement(userId, type, achievement);
          newAchievements.push(newAchievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Get action count from points breakdown
   * @param {Object} userPoints - User points data
   * @param {string} action - Action type
   * @returns {number} Count of actions
   */
  getActionCount(userPoints, action) {
    const pointValue = this.constructor.POINT_VALUES[action.toUpperCase()] || 1;
    return Math.floor((userPoints.pointsBreakdown[action] || 0) / pointValue);
  }

  /**
   * Unlock an achievement for a user
   * @param {string} userId - User ID
   * @param {string} achievementType - Achievement type
   * @param {Object} achievementData - Achievement definition
   * @returns {Promise<Object>} Created achievement document
   */
  async unlockAchievement(userId, achievementType, achievementData) {
    try {
      const achievement = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        ID.unique(),
        {
          userId,
          achievementType,
          achievementName: achievementData.name,
          description: achievementData.description,
          iconUrl: '', // Will be populated with actual icons later
          pointsAwarded: achievementData.points,
          unlockedAt: new Date().toISOString()
        }
      );

      return achievement;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Get user achievements
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of achievement documents
   */
  async getUserAchievements(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('unlockedAt')
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get team leaderboard
   * @param {string} teamId - Team ID
   * @param {number} limit - Number of top users to return
   * @returns {Promise<Array>} Array of user points with rankings
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

      return response.documents.map((userPoints, index) => ({
        ...userPoints,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Get user progress summary
   * @param {string} userId - User ID
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} User progress data
   */
  async getUserProgress(userId, teamId) {
    try {
      const [userPoints, achievements, leaderboard] = await Promise.all([
        this.getUserPoints(userId, teamId),
        this.getUserAchievements(userId),
        this.getLeaderboard(teamId, 100)
      ]);

      const userRank = leaderboard.findIndex(entry => entry.userId === userId) + 1;

      return {
        points: userPoints || { totalPoints: 0, pointsBreakdown: {} },
        achievements,
        rank: userRank || null,
        totalUsers: leaderboard.length
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  /**
   * Trigger celebration effect (to be implemented in UI)
   * @param {string} type - Celebration type (achievement, task_complete, etc.)
   * @param {Object} data - Celebration data
   * @returns {Promise<void>}
   */
  async triggerCelebration(type, data) {
    // This will be implemented in the UI layer
    // For now, just log the celebration
    console.log(`🎉 Celebration triggered: ${type}`, data);
  }
}

export default new GamificationService();