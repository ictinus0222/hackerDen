/**
 * @fileoverview Custom hook for gamification features
 * Provides access to user points, achievements, and leaderboard data
 */

import { useState, useEffect, useCallback } from 'react';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from './useAuth';
import { useTeam } from './useTeam';

export const useGamification = () => {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  
  const [userProgress, setUserProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user progress
  const fetchUserProgress = useCallback(async () => {
    if (!user?.$id || !currentTeam?.$id) return;

    try {
      setLoading(true);
      setError(null);
      
      const progress = await gamificationService.getUserProgress(user.$id, currentTeam.$id);
      setUserProgress(progress);
      setAchievements(progress.achievements || []);
    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.$id, currentTeam?.$id]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    if (!currentTeam?.$id) return;

    try {
      const leaderboardData = await gamificationService.getEnhancedLeaderboard(currentTeam.$id);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    }
  }, [currentTeam?.$id]);

  // Award points manually (for testing or special cases)
  const awardPoints = useCallback(async (action, customPoints = null) => {
    if (!user?.$id || !currentTeam?.$id) return;

    try {
      await gamificationService.awardPoints(user.$id, currentTeam.$id, action, customPoints);
      // Refresh user progress after awarding points
      await fetchUserProgress();
      await fetchLeaderboard();
    } catch (err) {
      console.error('Error awarding points:', err);
      setError(err.message);
    }
  }, [user?.$id, currentTeam?.$id, fetchUserProgress, fetchLeaderboard]);

  // Get point values for reference
  const getPointValues = useCallback(() => {
    return gamificationService.getPointValues();
  }, []);

  // Get achievement definitions
  const getAchievementDefinitions = useCallback(() => {
    return gamificationService.getAchievementDefinitions();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.$id || !currentTeam?.$id) return;

    let unsubscribePoints;
    let unsubscribeAchievements;
    let unsubscribeLeaderboard;

    try {
      // Subscribe to user points updates
      unsubscribePoints = gamificationService.subscribeToUserPoints(user.$id, (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          fetchUserProgress();
        }
      });

      // Subscribe to achievements updates
      unsubscribeAchievements = gamificationService.subscribeToAchievements(user.$id, (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          fetchUserProgress();
          // Show achievement notification
          if (response.payload) {
            console.log('New achievement unlocked:', response.payload.achievementName);
          }
        }
      });

      // Subscribe to leaderboard updates
      unsubscribeLeaderboard = gamificationService.subscribeToLeaderboard(currentTeam.$id, (updatedLeaderboard) => {
        setLeaderboard(updatedLeaderboard);
      });
    } catch (err) {
      console.warn('Failed to subscribe to gamification updates:', err);
    }

    return () => {
      if (unsubscribePoints) unsubscribePoints();
      if (unsubscribeAchievements) unsubscribeAchievements();
      if (unsubscribeLeaderboard) unsubscribeLeaderboard();
    };
  }, [user?.$id, currentTeam?.$id, fetchUserProgress]);

  // Initial data fetch
  useEffect(() => {
    fetchUserProgress();
    fetchLeaderboard();
  }, [fetchUserProgress, fetchLeaderboard]);

  return {
    // Data
    userProgress,
    leaderboard,
    achievements,
    
    // State
    loading,
    error,
    
    // Actions
    awardPoints,
    fetchUserProgress,
    fetchLeaderboard,
    
    // Utilities
    getPointValues,
    getAchievementDefinitions,
    
    // Computed values
    totalPoints: userProgress?.totalPoints || 0,
    pointsBreakdown: userProgress?.pointsBreakdown || {
      tasksCompleted: 0,
      messagesPosted: 0,
      filesUploaded: 0,
      ideasSubmitted: 0,
      votesGiven: 0
    },
    userRank: leaderboard.findIndex(entry => entry.userId === user?.$id) + 1 || null
  };
};