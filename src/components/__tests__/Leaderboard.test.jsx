/**
 * @fileoverview Tests for Leaderboard Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Leaderboard } from '../Leaderboard';

// Mock the hooks
vi.mock('../../hooks/useGamification', () => ({
  useGamification: () => ({
    leaderboard: [
      { userId: 'user1', totalPoints: 250, rank: 1, pointsBreakdown: { tasksCompleted: 15 } },
      { userId: 'user2', totalPoints: 180, rank: 2, pointsBreakdown: { tasksCompleted: 12 } },
      { userId: 'user3', totalPoints: 150, rank: 3, pointsBreakdown: { tasksCompleted: 8 } }
    ],
    loading: false,
    error: null,
    fetchLeaderboard: vi.fn()
  })
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user2' }
  })
}));

vi.mock('../../services/userNameService', () => ({
  userNameService: {
    getUserName: vi.fn().mockResolvedValue('Test User')
  }
}));

describe('Leaderboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders leaderboard with rankings', () => {
    render(<Leaderboard teamId="test-team" />);
    
    expect(screen.getByText('Team Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
  });

  it('renders compact leaderboard', () => {
    render(<Leaderboard teamId="test-team" compact={true} />);
    
    expect(screen.getByText('Top Performers')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    // Mock loading state
    vi.doMock('../../hooks/useGamification', () => ({
      useGamification: () => ({
        leaderboard: [],
        loading: true,
        error: null,
        fetchLeaderboard: vi.fn()
      })
    }));

    render(<Leaderboard teamId="test-team" />);
    
    // Should show loading animation
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});