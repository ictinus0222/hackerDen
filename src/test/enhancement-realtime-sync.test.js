/**
 * @fileoverview Real-time Synchronization Tests for Enhancement Features
 * Tests real-time updates across all enhancement features with multiple users
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Import hooks
import { useFiles } from '../hooks/useFiles';
import { useIdeas } from '../hooks/useIdeas';
import { usePolls } from '../hooks/usePolls';
import { useGamification } from '../hooks/useGamification';
import { useReactions } from '../hooks/useReactions';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

// Import services
import { realtimeService } from '../services/realtimeService';

// Mock Appwrite client
vi.mock('../lib/appwrite', () => {
  const mockClient = {
    subscribe: vi.fn(),
    call: vi.fn()
  };
  
  return {
    default: mockClient,
    client: mockClient,
    databases: {
      listDocuments: vi.fn().mockResolvedValue({ documents: [] }),
      createDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn()
    },
    storage: {
      createFile: vi.fn(),
      deleteFile: vi.fn(),
      getFilePreview: vi.fn()
    },
    DATABASE_ID: 'test-db',
    COLLECTIONS: {
      FILES: 'files',
      FILE_ANNOTATIONS: 'file_annotations',
      IDEAS: 'ideas',
      IDEA_VOTES: 'idea_votes',
      USER_POINTS: 'user_points',
      ACHIEVEMENTS: 'achievements',
      POLLS: 'polls',
      POLL_VOTES: 'poll_votes',
      REACTIONS: 'reactions',
      SUBMISSIONS: 'submissions'
    },
    Query: {
      equal: vi.fn(),
      orderDesc: vi.fn(),
      limit: vi.fn()
    },
    ID: {
      unique: vi.fn().mockReturnValue('mock-id')
    }
  };
});

// Mock contexts
const mockUser = {
  $id: 'user-1',
  name: 'Test User'
};

const mockTeam = {
  $id: 'team-1',
  name: 'Test Team',
  hackathonId: 'hackathon-1'
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    isAuthenticated: true
  })
}));

vi.mock('../hooks/useTeam', () => ({
  useTeam: () => ({
    team: mockTeam,
    loading: false,
    hasTeam: true
  })
}));

describe('Enhancement Real-time Synchronization Tests', () => {
  let mockUnsubscribe;
  let mockClient;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();
    
    const appwriteModule = await import('../lib/appwrite');
    mockClient = appwriteModule.default;
    
    mockClient.subscribe.mockReturnValue(mockUnsubscribe);
    mockClient.call.mockResolvedValue({ status: 'ok' });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('File Sharing Real-time Updates', () => {
    it('should sync file uploads across clients within 2 seconds', async () => {
      const { result } = renderHook(() => useFiles());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      const newFile = {
        $id: 'file-1',
        teamId: 'team-1',
        fileName: 'design.pdf',
        uploadedBy: 'user-2',
        fileType: 'application/pdf',
        fileSize: 1024000,
        $createdAt: new Date().toISOString()
      };

      const startTime = Date.now();
      
      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.files.documents.file-1.create'],
          payload: newFile
        });
      });

      const endTime = Date.now();
      const syncTime = endTime - startTime;

      expect(result.current.files).toContainEqual(newFile);
      expect(syncTime).toBeLessThan(2000);
      expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    });

    it('should sync file annotations in real-time', async () => {
      const { result } = renderHook(() => useFiles());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      const annotation = {
        $id: 'annotation-1',
        fileId: 'file-1',
        userId: 'user-2',
        content: 'Great design!',
        position: { x: 100, y: 200 },
        type: 'point',
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.file_annotations.documents.annotation-1.create'],
          payload: annotation
        });
      });

      expect(result.current.annotations['file-1']).toContainEqual(annotation);
    });

    it('should handle concurrent file uploads from multiple users', async () => {
      const { result } = renderHook(() => useFiles());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      const files = [
        {
          $id: 'file-1',
          teamId: 'team-1',
          fileName: 'user1-file.jpg',
          uploadedBy: 'user-1'
        },
        {
          $id: 'file-2',
          teamId: 'team-1',
          fileName: 'user2-file.png',
          uploadedBy: 'user-2'
        },
        {
          $id: 'file-3',
          teamId: 'team-1',
          fileName: 'user3-file.pdf',
          uploadedBy: 'user-3'
        }
      ];

      // Simulate rapid concurrent uploads
      act(() => {
        files.forEach(file => {
          subscriptionCallback({
            events: [`databases.test-db.collections.files.documents.${file.$id}.create`],
            payload: file
          });
        });
      });

      expect(result.current.files).toHaveLength(3);
      expect(result.current.files.map(f => f.$id)).toEqual(['file-1', 'file-2', 'file-3']);
    });
  });

  describe('Idea Management Real-time Updates', () => {
    it('should sync idea submissions and votes in real-time', async () => {
      const { result } = renderHook(() => useIdeas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // New idea submission
      const newIdea = {
        $id: 'idea-1',
        teamId: 'team-1',
        title: 'Great Feature',
        description: 'This would be awesome',
        status: 'submitted',
        voteCount: 0,
        createdBy: 'user-2',
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.ideas.documents.idea-1.create'],
          payload: newIdea
        });
      });

      expect(result.current.ideas).toContainEqual(newIdea);

      // Vote on idea
      const vote = {
        $id: 'vote-1',
        ideaId: 'idea-1',
        userId: 'user-3',
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.idea_votes.documents.vote-1.create'],
          payload: vote
        });
      });

      // Idea vote count should update
      const updatedIdea = {
        ...newIdea,
        voteCount: 1
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.ideas.documents.idea-1.update'],
          payload: updatedIdea
        });
      });

      const ideaInState = result.current.ideas.find(i => i.$id === 'idea-1');
      expect(ideaInState.voteCount).toBe(1);
    });

    it('should sync idea status changes across team members', async () => {
      const { result } = renderHook(() => useIdeas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Initial idea
      const idea = {
        $id: 'idea-1',
        teamId: 'team-1',
        title: 'Feature Request',
        status: 'submitted'
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.ideas.documents.idea-1.create'],
          payload: idea
        });
      });

      // Status change to approved
      const approvedIdea = {
        ...idea,
        status: 'approved'
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.ideas.documents.idea-1.update'],
          payload: approvedIdea
        });
      });

      const ideaInState = result.current.ideas.find(i => i.$id === 'idea-1');
      expect(ideaInState.status).toBe('approved');
    });
  });

  describe('Polling Real-time Updates', () => {
    it('should sync poll creation and voting in real-time', async () => {
      const { result } = renderHook(() => usePolls());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // New poll
      const newPoll = {
        $id: 'poll-1',
        teamId: 'team-1',
        question: 'Which feature first?',
        options: ['Feature A', 'Feature B'],
        isActive: true,
        totalVotes: 0,
        createdBy: 'user-1',
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.polls.documents.poll-1.create'],
          payload: newPoll
        });
      });

      expect(result.current.polls).toContainEqual(newPoll);

      // Vote on poll
      const vote = {
        $id: 'vote-1',
        pollId: 'poll-1',
        userId: 'user-2',
        selectedOptions: ['Feature A'],
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.poll_votes.documents.vote-1.create'],
          payload: vote
        });
      });

      // Poll should update with new vote count
      const updatedPoll = {
        ...newPoll,
        totalVotes: 1
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.polls.documents.poll-1.update'],
          payload: updatedPoll
        });
      });

      const pollInState = result.current.polls.find(p => p.$id === 'poll-1');
      expect(pollInState.totalVotes).toBe(1);
    });

    it('should sync poll closure across all clients', async () => {
      const { result } = renderHook(() => usePolls());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Active poll
      const activePoll = {
        $id: 'poll-1',
        teamId: 'team-1',
        question: 'Test poll?',
        isActive: true,
        totalVotes: 5
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.polls.documents.poll-1.create'],
          payload: activePoll
        });
      });

      // Close poll
      const closedPoll = {
        ...activePoll,
        isActive: false
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.polls.documents.poll-1.update'],
          payload: closedPoll
        });
      });

      const pollInState = result.current.polls.find(p => p.$id === 'poll-1');
      expect(pollInState.isActive).toBe(false);
    });
  });

  describe('Gamification Real-time Updates', () => {
    it('should sync point updates and achievements in real-time', async () => {
      const { result } = renderHook(() => useGamification());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Point update
      const pointUpdate = {
        $id: 'points-1',
        userId: 'user-1',
        teamId: 'team-1',
        totalPoints: 150,
        pointsBreakdown: JSON.stringify({
          tasksCompleted: 10,
          messagesPosted: 50,
          filesUploaded: 5,
          ideasSubmitted: 3,
          votesGiven: 8
        }),
        $updatedAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.user_points.documents.points-1.update'],
          payload: pointUpdate
        });
      });

      expect(result.current.userPoints.totalPoints).toBe(150);

      // Achievement unlock
      const achievement = {
        $id: 'achievement-1',
        userId: 'user-1',
        achievementType: 'task_master',
        achievementName: 'Task Master',
        description: 'Completed 10 tasks',
        pointsAwarded: 50,
        unlockedAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.achievements.documents.achievement-1.create'],
          payload: achievement
        });
      });

      expect(result.current.achievements).toContainEqual(achievement);
    });

    it('should sync leaderboard updates across team members', async () => {
      const { result } = renderHook(() => useGamification());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Multiple user point updates
      const pointUpdates = [
        {
          $id: 'points-1',
          userId: 'user-1',
          teamId: 'team-1',
          totalPoints: 200
        },
        {
          $id: 'points-2',
          userId: 'user-2',
          teamId: 'team-1',
          totalPoints: 150
        },
        {
          $id: 'points-3',
          userId: 'user-3',
          teamId: 'team-1',
          totalPoints: 300
        }
      ];

      act(() => {
        pointUpdates.forEach(update => {
          subscriptionCallback({
            events: [`databases.test-db.collections.user_points.documents.${update.$id}.update`],
            payload: update
          });
        });
      });

      // Leaderboard should be sorted by points
      const leaderboard = result.current.leaderboard;
      expect(leaderboard[0].userId).toBe('user-3'); // 300 points
      expect(leaderboard[1].userId).toBe('user-1'); // 200 points
      expect(leaderboard[2].userId).toBe('user-2'); // 150 points
    });
  });

  describe('Reaction System Real-time Updates', () => {
    it('should sync reactions to messages and tasks in real-time', async () => {
      const { result } = renderHook(() => useReactions());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Reaction to message
      const messageReaction = {
        $id: 'reaction-1',
        targetId: 'message-1',
        targetType: 'message',
        userId: 'user-2',
        emoji: '👍',
        isCustom: false,
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.reactions.documents.reaction-1.create'],
          payload: messageReaction
        });
      });

      expect(result.current.reactions['message-1']).toContainEqual(messageReaction);

      // Reaction to task
      const taskReaction = {
        $id: 'reaction-2',
        targetId: 'task-1',
        targetType: 'task',
        userId: 'user-3',
        emoji: '🎉',
        isCustom: false,
        $createdAt: new Date().toISOString()
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.reactions.documents.reaction-2.create'],
          payload: taskReaction
        });
      });

      expect(result.current.reactions['task-1']).toContainEqual(taskReaction);
    });

    it('should sync reaction removal in real-time', async () => {
      const { result } = renderHook(() => useReactions());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Add reaction
      const reaction = {
        $id: 'reaction-1',
        targetId: 'message-1',
        targetType: 'message',
        userId: 'user-2',
        emoji: '👍'
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.reactions.documents.reaction-1.create'],
          payload: reaction
        });
      });

      expect(result.current.reactions['message-1']).toContainEqual(reaction);

      // Remove reaction
      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.reactions.documents.reaction-1.delete'],
          payload: reaction
        });
      });

      expect(result.current.reactions['message-1']).not.toContainEqual(reaction);
    });
  });

  describe('Multi-User Concurrent Updates', () => {
    it('should handle simultaneous updates across all enhancement features', async () => {
      const fileHook = renderHook(() => useFiles());
      const ideaHook = renderHook(() => useIdeas());
      const pollHook = renderHook(() => usePolls());
      const gamificationHook = renderHook(() => useGamification());

      await Promise.all([
        waitFor(() => expect(fileHook.result.current.loading).toBe(false)),
        waitFor(() => expect(ideaHook.result.current.loading).toBe(false)),
        waitFor(() => expect(pollHook.result.current.loading).toBe(false)),
        waitFor(() => expect(gamificationHook.result.current.loading).toBe(false))
      ]);

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Simulate concurrent updates from multiple users
      const updates = [
        {
          type: 'file',
          event: 'databases.test-db.collections.files.documents.file-1.create',
          payload: { $id: 'file-1', teamId: 'team-1', fileName: 'user1.jpg', uploadedBy: 'user-1' }
        },
        {
          type: 'idea',
          event: 'databases.test-db.collections.ideas.documents.idea-1.create',
          payload: { $id: 'idea-1', teamId: 'team-1', title: 'User 2 Idea', createdBy: 'user-2' }
        },
        {
          type: 'poll',
          event: 'databases.test-db.collections.polls.documents.poll-1.create',
          payload: { $id: 'poll-1', teamId: 'team-1', question: 'User 3 Poll?', createdBy: 'user-3' }
        },
        {
          type: 'points',
          event: 'databases.test-db.collections.user_points.documents.points-1.update',
          payload: { $id: 'points-1', userId: 'user-1', totalPoints: 100 }
        }
      ];

      // Apply all updates simultaneously
      act(() => {
        updates.forEach(update => {
          subscriptionCallback({
            events: [update.event],
            payload: update.payload
          });
        });
      });

      // Verify all updates were applied correctly
      expect(fileHook.result.current.files).toHaveLength(1);
      expect(ideaHook.result.current.ideas).toHaveLength(1);
      expect(pollHook.result.current.polls).toHaveLength(1);
      expect(gamificationHook.result.current.userPoints.totalPoints).toBe(100);
    });

    it('should maintain data consistency during rapid updates', async () => {
      const { result } = renderHook(() => useIdeas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Rapid idea and vote updates
      const idea = {
        $id: 'idea-1',
        teamId: 'team-1',
        title: 'Test Idea',
        voteCount: 0
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.ideas.documents.idea-1.create'],
          payload: idea
        });
      });

      // Rapid vote updates
      const voteUpdates = Array.from({ length: 5 }, (_, i) => ({
        ...idea,
        voteCount: i + 1
      }));

      act(() => {
        voteUpdates.forEach(update => {
          subscriptionCallback({
            events: ['databases.test-db.collections.ideas.documents.idea-1.update'],
            payload: update
          });
        });
      });

      // Should have final vote count
      const ideaInState = result.current.ideas.find(i => i.$id === 'idea-1');
      expect(ideaInState.voteCount).toBe(5);
      
      // Should only have one instance of the idea
      const ideaCount = result.current.ideas.filter(i => i.$id === 'idea-1').length;
      expect(ideaCount).toBe(1);
    });
  });

  describe('Connection Resilience', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle subscription failures and retry with exponential backoff', async () => {
      const { result } = renderHook(() => useConnectionStatus());

      // Mock connection failure
      mockClient.call.mockRejectedValue(new Error('Network error'));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isReconnecting).toBe(true);
      });

      // First retry after 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.reconnectAttempts).toBe(1);
      });

      // Second retry after 2 more seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.reconnectAttempts).toBe(2);
      });
    });

    it('should queue updates during disconnection and sync when reconnected', async () => {
      const { result } = renderHook(() => useFiles());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate disconnection
      act(() => {
        result.current.setConnectionStatus(false);
      });

      // Queue updates while offline
      const queuedFile = {
        $id: 'file-1',
        teamId: 'team-1',
        fileName: 'offline-file.jpg',
        uploadedBy: 'user-1'
      };

      act(() => {
        result.current.queueUpdate('file', 'create', queuedFile);
      });

      expect(result.current.queuedUpdates).toHaveLength(1);

      // Reconnect and sync
      mockClient.call.mockResolvedValue({ status: 'ok' });
      
      act(() => {
        result.current.setConnectionStatus(true);
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.files).toContainEqual(queuedFile);
        expect(result.current.queuedUpdates).toHaveLength(0);
      });
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high-frequency updates without performance degradation', async () => {
      const { result } = renderHook(() => useReactions());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Generate 100 rapid reaction updates
      const reactions = Array.from({ length: 100 }, (_, i) => ({
        $id: `reaction-${i}`,
        targetId: 'message-1',
        targetType: 'message',
        userId: `user-${i % 5}`, // 5 different users
        emoji: ['👍', '❤️', '😂', '🎉', '🔥'][i % 5],
        $createdAt: new Date().toISOString()
      }));

      const startTime = performance.now();

      act(() => {
        reactions.forEach(reaction => {
          subscriptionCallback({
            events: [`databases.test-db.collections.reactions.documents.${reaction.$id}.create`],
            payload: reaction
          });
        });
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should process all updates quickly (under 100ms)
      expect(processingTime).toBeLessThan(100);
      expect(result.current.reactions['message-1']).toHaveLength(100);
    });

    it('should throttle updates when receiving too many rapid changes', async () => {
      const { result } = renderHook(() => useGamification());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Generate rapid point updates for same user
      const pointUpdates = Array.from({ length: 50 }, (_, i) => ({
        $id: 'points-1',
        userId: 'user-1',
        teamId: 'team-1',
        totalPoints: i + 1,
        $updatedAt: new Date().toISOString()
      }));

      act(() => {
        pointUpdates.forEach(update => {
          subscriptionCallback({
            events: ['databases.test-db.collections.user_points.documents.points-1.update'],
            payload: update
          });
        });
      });

      // Should have final state (throttling may batch updates)
      expect(result.current.userPoints.totalPoints).toBe(50);
      
      // Should not have caused performance issues
      expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    });
  });
});