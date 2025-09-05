/**
 * @fileoverview useAchievements Hook
 * Custom hook for managing user achievements and gamification features
 */

import { useState, useEffect, useCallback } from 'react';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing achievements and gamification
 * @param {string} teamId - Optional team ID to filter achievements
 * @returns {Object} Achievement state and methods
 */
export const useAchievements = (teamId = null) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load user achievements and progress
   */
  const loadAchievements = useCallback(async () => {
    if (!user?.$id) return;

    try {
      setLoading(true);
      setError(null);

      // Get user progress
      const progress = await gamificationService.getUserProgress(user.$id, teamId);
      setUserProgress(progress);

      // Get achievement definitions
      const definitions = gamificationService.getAchievementDefinitions();
      
      // Create achievement list with unlock status
      const achievementList = Object.values(definitions).map(definition => {
        const unlockedAchievement = progress.achievements.find(
          a => a.achievementType === definition.type
        );
        
        return {
          ...definition,
          ...unlockedAchievement,
          isUnlocked: !!unlockedAchievement
        };
      });

      setAchievements(achievementList);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.$id, teamId]);

  /**
   * Award points for an action and check for new achievements
   */
  const awardPoints = useCallback(async (action, customPoints = null) => {
    if (!user?.$id || !teamId) return null;

    try {
      const result = await gamificationService.awardPoints(
        user.$id,
        teamId,
        action,
        customPoints
      );

      // Reload achievements to get updated state
      await loadAchievements();

      return result;
    } catch (err) {
      console.error('Error awarding points:', err);
      throw err;
    }
  }, [user?.$id, teamId, loadAchievements]);

  /**
   * Trigger celebration effect
   */
  const triggerCelebration = useCallback(async (type, data = {}) => {
    try {
      await gamificationService.triggerCelebration(type, data);
    } catch (err) {
      console.error('Error triggering celebration:', err);
    }
  }, []);

  /**
   * Get leaderboard for the current team
   */
  const getLeaderboard = useCallback(async (limit = 10) => {
    if (!teamId) return [];

    try {
      return await gamificationService.getLeaderboard(teamId, limit);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      throw err;
    }
  }, [teamId]);

  /**
   * Check if user has a specific achievement
   */
  const hasAchievement = useCallback((achievementType) => {
    return achievements.some(a => a.achievementType === achievementType && a.isUnlocked);
  }, [achievements]);

  /**
   * Get progress towards a specific achievement
   */
  const getAchievementProgress = useCallback((achievementType) => {
    const achievement = achievements.find(a => a.achievementType === achievementType);
    if (!achievement || achievement.isUnlocked) return null;

    const breakdown = userProgress?.pointsBreakdown || {};
    const totalPoints = userProgress?.totalPoints || 0;

    let current = 0;
    let required = 0;

    switch (achievementType) {
      case 'first_task':
        current = breakdown.tasksCompleted || 0;
        required = 1;
        break;
      case 'task_master':
        current = breakdown.tasksCompleted || 0;
        required = 10;
        break;
      case 'communicator':
        current = breakdown.messagesPosted || 0;
        required = 50;
        break;
      case 'file_sharer':
        current = breakdown.filesUploaded || 0;
        required = 5;
        break;
      case 'idea_generator':
        current = breakdown.ideasSubmitted || 0;
        required = 5;
        break;
      case 'team_player':
        current = breakdown.votesGiven || 0;
        required = 20;
        break;
      case 'hundred_club':
        current = totalPoints;
        required = 100;
        break;
      case 'five_hundred_club':
        current = totalPoints;
        required = 500;
        break;
      default:
        return null;
    }

    return {
      current: Math.min(current, required),
      required,
      percentage: (current / required) * 100
    };
  }, [achievements, userProgress]);

  // Load achievements on mount and when dependencies change
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.$id) return;

    const unsubscribeAchievements = gamificationService.subscribeToAchievements(
      user.$id,
      () => {
        loadAchievements();
      }
    );

    const unsubscribePoints = gamificationService.subscribeToUserPoints(
      user.$id,
      () => {
        loadAchievements();
      }
    );

    return () => {
      unsubscribeAchievements();
      unsubscribePoints();
    };
  }, [user?.$id, loadAchievements]);

  return {
    // State
    achievements,
    userProgress,
    loading,
    error,
    
    // Computed values
    unlockedAchievements: achievements.filter(a => a.isUnlocked),
    totalPoints: userProgress?.totalPoints || 0,
    pointsBreakdown: userProgress?.pointsBreakdown || {},
    
    // Methods
    awardPoints,
    triggerCelebration,
    getLeaderboard,
    hasAchievement,
    getAchievementProgress,
    reload: loadAchievements
  };
};

export default useAchievements;