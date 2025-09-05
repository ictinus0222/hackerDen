/**
 * @fileoverview Tests for useAchievements Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAchievements } from '../useAchievements';
import { gamificationService } from '../../services/gamificationService';
import { useAuth } from '../useAuth';

// Mock dependencies
vi.mock('../../services/gamificationService');
vi.mock('../useAuth');

describe('useAchievements', () => {
  const mockUser = {
    $id: 'user123'
  };

  const mockUserProgress = {
    userId: 'user123',
    totalPoints: 150,
    pointsBreakdown: {
      tasksCompleted: 5,
      messagesPosted: 25,
      filesUploaded: 3,
      ideasSubmitted: 2,
      votesGiven: 10
    },
    achievements: [
      {
        $id: 'ach1',
        userId: 'user123',
        achievementType: 'first_task',
        achievementName: 'Getting Started',
        description: 'Complete your first task',
        pointsAwarded: 5,
        unlockedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
  };

  const mockAchievementDefinitions = {
    FIRST_TASK: {
      type: 'first_task',
      name: 'Getting Started',
      description: 'Complete your first task',
      pointsAwarded: 5
    },
    TASK_MASTER: {
      type: 'task_master',
      name: 'Task Master',
      description: 'Complete 10 tasks',
      pointsAwarded: 25
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth.mockReturnValue({
      user: mockUser
    });

    gamificationService.getUserProgress.mockResolvedValue(mockUserProgress);
    gamificationService.getAchievementDefinitions.mockReturnValue(mockAchievementDefinitions);
    gamificationService.subscribeToAchievements.mockReturnValue(() => {});
    gamificationService.subscribeToUserPoints.mockReturnValue(() => {});
    gamificationService.awardPoints.mockResolvedValue({ totalPoints: 160 });
    gamificationService.triggerCelebration.mockResolvedValue();
    gamificationService.getLeaderboard.mockResolvedValue([]);
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAchievements());

    expect(result.current.loading).toBe(true);
    expect(result.current.achievements).toEqual([]);
    expect(result.current.userProgress).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should load achievements and user progress', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.achievements).toHaveLength(2);
    expect(result.current.userProgress).toEqual(mockUserProgress);
    expect(result.current.totalPoints).toBe(150);
    expect(result.current.unlockedAchievements).toHaveLength(1);
  });

  it('should handle loading error', async () => {
    const errorMessage = 'Failed to load';
    gamificationService.getUserProgress.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should award points and reload achievements', async () => {
    const { result } = renderHook(() => useAchievements('team123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.awardPoints('task_completion');
    });

    expect(gamificationService.awardPoints).toHaveBeenCalledWith(
      mockUser.$id,
      'team123',
      'task_completion',
      null
    );
  });

  it('should trigger celebration', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.triggerCelebration('achievement', { type: 'test' });
    });

    expect(gamificationService.triggerCelebration).toHaveBeenCalledWith(
      'achievement',
      { type: 'test' }
    );
  });

  it('should get leaderboard', async () => {
    const { result } = renderHook(() => useAchievements('team123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.getLeaderboard(5);
    });

    expect(gamificationService.getLeaderboard).toHaveBeenCalledWith('team123', 5);
  });

  it('should check if user has achievement', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAchievement('first_task')).toBe(true);
    expect(result.current.hasAchievement('task_master')).toBe(false);
  });

  it('should calculate achievement progress', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.achievements.length).toBeGreaterThan(0);
    });

    const progress = result.current.getAchievementProgress('task_master');
    expect(progress).toEqual({
      current: 5,
      required: 10,
      percentage: 50
    });
  });

  it('should return null progress for unlocked achievements', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const progress = result.current.getAchievementProgress('first_task');
    expect(progress).toBe(null);
  });

  it('should subscribe to real-time updates', async () => {
    renderHook(() => useAchievements());

    await waitFor(() => {
      expect(gamificationService.subscribeToAchievements).toHaveBeenCalledWith(
        mockUser.$id,
        expect.any(Function)
      );
      expect(gamificationService.subscribeToUserPoints).toHaveBeenCalledWith(
        mockUser.$id,
        expect.any(Function)
      );
    });
  });

  it('should not load achievements without user', () => {
    useAuth.mockReturnValue({
      user: null
    });

    renderHook(() => useAchievements());

    expect(gamificationService.getUserProgress).not.toHaveBeenCalled();
  });

  it('should reload achievements when called', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the mock to verify it's called again
    gamificationService.getUserProgress.mockClear();

    await act(async () => {
      await result.current.reload();
    });

    expect(gamificationService.getUserProgress).toHaveBeenCalled();
  });

  it('should handle award points without team ID', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const resultValue = await act(async () => {
      return await result.current.awardPoints('task_completion');
    });

    expect(resultValue).toBe(null);
    expect(gamificationService.awardPoints).not.toHaveBeenCalled();
  });

  it('should handle leaderboard without team ID', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const leaderboard = await act(async () => {
      return await result.current.getLeaderboard();
    });

    expect(leaderboard).toEqual([]);
    expect(gamificationService.getLeaderboard).not.toHaveBeenCalled();
  });
});