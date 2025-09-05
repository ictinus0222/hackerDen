/**
 * @fileoverview Tests for Badge Collection Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BadgeCollection } from '../BadgeCollection';
import { gamificationService } from '../../services/gamificationService';
import { useAuth } from '../../hooks/useAuth';

// Mock dependencies
vi.mock('../../services/gamificationService');
vi.mock('../../hooks/useAuth');

// Mock UI components
vi.mock('../ui/card', () => ({
  Card: ({ children, className }) => <div className={className}>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <div>{children}</div>
}));

vi.mock('../ui/badge', () => ({
  Badge: ({ children, variant, className }) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  )
}));

vi.mock('../ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div>{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }) => <div>{children}</div>
}));

vi.mock('../ui/scroll-area', () => ({
  ScrollArea: ({ children }) => <div>{children}</div>
}));

describe('BadgeCollection', () => {
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
    },
    COMMUNICATOR: {
      type: 'communicator',
      name: 'Team Communicator',
      description: 'Send 50 messages',
      pointsAwarded: 15
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
  });

  it('should render loading state initially', () => {
    render(<BadgeCollection />);
    
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    // Should show loading skeletons
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should render achievements after loading', async () => {
    render(<BadgeCollection />);

    await waitFor(() => {
      expect(screen.getAllByText('Getting Started').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Task Master').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Team Communicator').length).toBeGreaterThan(0);
    });
  });

  it('should show unlocked and locked achievements correctly', async () => {
    render(<BadgeCollection />);

    await waitFor(() => {
      // First task should be unlocked (in mock data)
      expect(screen.getAllByText('Getting Started')).toHaveLength(2); // One in card, one in tooltip
      
      // Other achievements should be locked
      expect(screen.getAllByText('Task Master')).toHaveLength(2);
      expect(screen.getAllByText('Team Communicator')).toHaveLength(2);
    });
  });

  it('should display total points and unlocked count', async () => {
    render(<BadgeCollection />);

    await waitFor(() => {
      expect(screen.getByText('150 points')).toBeInTheDocument();
      expect(screen.getByText('1/3 unlocked')).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    const errorMessage = 'Failed to load achievements';
    gamificationService.getUserProgress.mockRejectedValue(new Error(errorMessage));

    render(<BadgeCollection />);

    await waitFor(() => {
      expect(screen.getAllByText('Failed to load achievements')).toHaveLength(2);
    });
  });

  it('should use provided userId instead of current user', async () => {
    const customUserId = 'custom123';
    render(<BadgeCollection userId={customUserId} />);

    await waitFor(() => {
      expect(gamificationService.getUserProgress).toHaveBeenCalledWith(customUserId, undefined);
    });
  });

  it('should filter by teamId when provided', async () => {
    const teamId = 'team123';
    render(<BadgeCollection teamId={teamId} />);

    await waitFor(() => {
      expect(gamificationService.getUserProgress).toHaveBeenCalledWith(mockUser.$id, teamId);
    });
  });

  it('should subscribe to real-time updates', async () => {
    render(<BadgeCollection />);

    await waitFor(() => {
      expect(gamificationService.subscribeToAchievements).toHaveBeenCalledWith(
        mockUser.$id,
        expect.any(Function)
      );
    });
  });

  it('should show progress for locked achievements', async () => {
    render(<BadgeCollection />);

    await waitFor(() => {
      // Task Master requires 10 tasks, user has 5, so should show 5/10 progress
      const progressElements = document.querySelectorAll('.h-1\\.5');
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });

  it('should show unlock date for unlocked achievements', async () => {
    render(<BadgeCollection />);

    await waitFor(() => {
      expect(screen.getByText(/Unlocked/)).toBeInTheDocument();
    });
  });

  it('should handle missing user gracefully', () => {
    useAuth.mockReturnValue({
      user: null
    });

    render(<BadgeCollection />);

    // Should not crash and should not call service methods
    expect(gamificationService.getUserProgress).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-badge-collection';
    const { container } = render(<BadgeCollection className={customClass} />);
    
    expect(container.firstChild).toHaveClass(customClass);
  });
});