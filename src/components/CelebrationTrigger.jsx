/**
 * @fileoverview Celebration Trigger System
 * Manages celebration effects for task completion, achievements, and milestones
 */

import React, { useEffect, useState } from 'react';
import { ConfettiEffect, TaskCompletionCelebration, AchievementCelebration, MilestoneCelebration } from './CelebrationEffects';
import { showAchievementNotification, showMultipleAchievementsNotification } from './AchievementNotification';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';

export const CelebrationTrigger = () => {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { userProgress, achievements } = useGamification();
  
  const [celebrationState, setCelebrationState] = useState({
    taskCompletion: false,
    achievement: false,
    milestone: false,
    newAchievements: []
  });

  const [previousState, setPreviousState] = useState({
    totalPoints: 0,
    achievementCount: 0,
    tasksCompleted: 0
  });

  // Monitor for changes that should trigger celebrations
  useEffect(() => {
    if (!userProgress || !user?.$id) return;

    const currentPoints = userProgress.totalPoints || 0;
    const currentAchievements = achievements.length;
    const currentTasks = userProgress.pointsBreakdown?.tasksCompleted || 0;

    // Only trigger celebrations if we have previous state to compare against
    if (previousState.totalPoints > 0 || previousState.achievementCount > 0 || previousState.tasksCompleted > 0) {
      // Check for task completion celebration
      if (currentTasks > previousState.tasksCompleted) {
        triggerTaskCompletion();
      }

      // Check for new achievements
      if (currentAchievements > previousState.achievementCount) {
        const newAchievements = achievements.slice(0, currentAchievements - previousState.achievementCount);
        triggerAchievement(newAchievements);
      }

      // Check for milestone celebrations (every 100 points)
      const previousMilestone = Math.floor(previousState.totalPoints / 100);
      const currentMilestone = Math.floor(currentPoints / 100);
      
      if (currentMilestone > previousMilestone) {
        triggerMilestone(currentMilestone * 100);
      }
    }

    // Update previous state
    setPreviousState({
      totalPoints: currentPoints,
      achievementCount: currentAchievements,
      tasksCompleted: currentTasks
    });
  }, [userProgress, achievements]); // Removed previousState from dependencies

  const triggerTaskCompletion = React.useCallback(() => {
    setCelebrationState(prev => ({
      ...prev,
      taskCompletion: true
    }));

    // Auto-clear after animation
    setTimeout(() => {
      setCelebrationState(prev => ({
        ...prev,
        taskCompletion: false
      }));
    }, 2000);
  }, []);

  const triggerAchievement = React.useCallback((newAchievements = []) => {
    setCelebrationState(prev => ({
      ...prev,
      achievement: true,
      newAchievements
    }));

    // Show achievement notifications
    if (newAchievements.length > 0) {
      if (newAchievements.length === 1) {
        showAchievementNotification(newAchievements[0]);
      } else {
        showMultipleAchievementsNotification(newAchievements);
      }
    }

    // Auto-clear after animation
    setTimeout(() => {
      setCelebrationState(prev => ({
        ...prev,
        achievement: false,
        newAchievements: []
      }));
    }, 4000);
  }, []);

  const triggerMilestone = React.useCallback((milestonePoints) => {
    setCelebrationState(prev => ({
      ...prev,
      milestone: true
    }));

    // Show milestone notification
    console.log(`🎉 Milestone reached: ${milestonePoints} points!`);

    // Auto-clear after animation
    setTimeout(() => {
      setCelebrationState(prev => ({
        ...prev,
        milestone: false
      }));
    }, 5000);
  }, []);

  return (
    <>
      {/* Task Completion Celebration */}
      <TaskCompletionCelebration 
        isTriggered={celebrationState.taskCompletion}
        onComplete={() => setCelebrationState(prev => ({ ...prev, taskCompletion: false }))}
      />

      {/* Achievement Celebration */}
      <AchievementCelebration 
        isTriggered={celebrationState.achievement}
        onComplete={() => setCelebrationState(prev => ({ ...prev, achievement: false }))}
      />

      {/* Milestone Celebration */}
      <MilestoneCelebration 
        isTriggered={celebrationState.milestone}
        onComplete={() => setCelebrationState(prev => ({ ...prev, milestone: false }))}
      />

      {/* Achievement Notifications - handled by the notification functions */}
    </>
  );
};

// Hook for manual celebration triggers
export const useCelebrationTriggers = () => {
  const [celebrationState, setCelebrationState] = useState({
    taskCompletion: false,
    achievement: false,
    milestone: false
  });

  const triggerTaskCompletion = () => {
    setCelebrationState(prev => ({ ...prev, taskCompletion: true }));
    setTimeout(() => {
      setCelebrationState(prev => ({ ...prev, taskCompletion: false }));
    }, 2000);
  };

  const triggerAchievement = () => {
    setCelebrationState(prev => ({ ...prev, achievement: true }));
    setTimeout(() => {
      setCelebrationState(prev => ({ ...prev, achievement: false }));
    }, 4000);
  };

  const triggerMilestone = () => {
    setCelebrationState(prev => ({ ...prev, milestone: true }));
    setTimeout(() => {
      setCelebrationState(prev => ({ ...prev, milestone: false }));
    }, 5000);
  };

  const clearAllCelebrations = () => {
    setCelebrationState({
      taskCompletion: false,
      achievement: false,
      milestone: false
    });
  };

  return {
    celebrationState,
    triggerTaskCompletion,
    triggerAchievement,
    triggerMilestone,
    clearAllCelebrations
  };
};

export default CelebrationTrigger;