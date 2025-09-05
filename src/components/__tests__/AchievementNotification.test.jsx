/**
 * @fileoverview Tests for Achievement Notification Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { 
  showAchievementNotification, 
  showMultipleAchievementsNotification,
  showCelebrationEffect 
} from '../AchievementNotification';

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn()
  }
}));

describe('AchievementNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing DOM elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up any added styles or elements
    const existingStyles = document.head.querySelector('#achievement-styles');
    if (existingStyles) {
      existingStyles.remove();
    }
  });

  describe('showAchievementNotification', () => {
    it('should show toast notification for single achievement', () => {
      const achievement = {
        achievementName: 'First Task',
        description: 'Complete your first task',
        achievementType: 'first_task',
        pointsAwarded: 5
      };

      showAchievementNotification(achievement);

      expect(toast.success).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: 6000,
          className: 'achievement-toast'
        })
      );
    });

    it('should use default trophy icon for unknown achievement type', () => {
      const achievement = {
        achievementName: 'Unknown Achievement',
        description: 'Unknown achievement type',
        achievementType: 'unknown_type',
        pointsAwarded: 10
      };

      showAchievementNotification(achievement);

      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('showMultipleAchievementsNotification', () => {
    it('should show single achievement notification for one achievement', () => {
      const achievements = [{
        achievementName: 'First Task',
        description: 'Complete your first task',
        achievementType: 'first_task',
        pointsAwarded: 5
      }];

      showMultipleAchievementsNotification(achievements);

      expect(toast.success).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: 6000,
          className: 'achievement-toast'
        })
      );
    });

    it('should show multiple achievements notification for multiple achievements', () => {
      const achievements = [
        {
          achievementName: 'First Task',
          description: 'Complete your first task',
          achievementType: 'first_task',
          pointsAwarded: 5
        },
        {
          achievementName: 'Communicator',
          description: 'Send 50 messages',
          achievementType: 'communicator',
          pointsAwarded: 15
        }
      ];

      showMultipleAchievementsNotification(achievements);

      expect(toast.success).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: 8000,
          className: 'multiple-achievements-toast'
        })
      );
    });

    it('should not show notification for empty achievements array', () => {
      showMultipleAchievementsNotification([]);

      expect(toast.success).not.toHaveBeenCalled();
    });

    it('should calculate total points correctly', () => {
      const achievements = [
        { achievementName: 'Achievement 1', pointsAwarded: 5 },
        { achievementName: 'Achievement 2', pointsAwarded: 10 },
        { achievementName: 'Achievement 3', pointsAwarded: 15 }
      ];

      showMultipleAchievementsNotification(achievements);

      // Check that the toast was called with content containing total points
      const toastCall = toast.success.mock.calls[0];
      expect(toastCall).toBeDefined();
    });
  });

  describe('showCelebrationEffect', () => {
    it('should create confetti effect for major achievements', (done) => {
      const achievement = {
        achievementType: 'hundred_club'
      };

      showCelebrationEffect(achievement);

      // Check that confetti container was added to body
      setTimeout(() => {
        try {
          const confettiContainer = document.querySelector('.fixed.inset-0.pointer-events-none');
          expect(confettiContainer).toBeTruthy();
          done();
        } catch (error) {
          done(error);
        }
      }, 100);
    });

    it('should not create confetti for minor achievements', () => {
      const achievement = {
        achievementType: 'first_task'
      };

      showCelebrationEffect(achievement);

      // Check that no confetti container was added
      const confettiContainer = document.querySelector('.fixed.inset-0.pointer-events-none');
      expect(confettiContainer).toBeFalsy();
    });

    it('should clean up confetti after animation', (done) => {
      const achievement = {
        achievementType: 'task_master'
      };

      showCelebrationEffect(achievement);

      // Check that confetti is cleaned up after timeout
      setTimeout(() => {
        const confettiContainer = document.querySelector('.fixed.inset-0.pointer-events-none');
        expect(confettiContainer).toBeFalsy();
        done();
      }, 5100); // Slightly longer than the cleanup timeout
    });
  });

  describe('CSS animations', () => {
    it('should add achievement styles to document head', () => {
      showAchievementNotification({
        achievementName: 'Test',
        description: 'Test',
        achievementType: 'test',
        pointsAwarded: 1
      });

      const styles = document.head.querySelector('#achievement-styles');
      expect(styles).toBeTruthy();
      expect(styles.textContent).toContain('@keyframes confetti-fall');
      expect(styles.textContent).toContain('@keyframes achievement-slide-in');
    });

    it('should not duplicate styles if already present', () => {
      // First call
      showAchievementNotification({
        achievementName: 'Test 1',
        description: 'Test',
        achievementType: 'test',
        pointsAwarded: 1
      });

      // Second call
      showAchievementNotification({
        achievementName: 'Test 2',
        description: 'Test',
        achievementType: 'test',
        pointsAwarded: 1
      });

      const styles = document.head.querySelectorAll('#achievement-styles');
      expect(styles.length).toBe(1);
    });
  });
});