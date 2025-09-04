import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ideaService } from '../ideaService';

// Mock the Appwrite dependencies
vi.mock('../../lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    listDocuments: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn(),
  },
  DATABASE_ID: 'test-database',
  COLLECTIONS: {
    IDEAS: 'ideas',
    IDEA_VOTES: 'idea_votes',
  },
  Query: {
    equal: vi.fn((field, value) => `${field}=${value}`),
    orderDesc: vi.fn((field) => `orderDesc(${field})`),
  },
  ID: {
    unique: vi.fn(() => 'unique-id'),
  },
  default: {
    subscribe: vi.fn(),
  },
}));

// Mock the messageService
vi.mock('../messageService', () => ({
  messageService: {
    sendSystemMessage: vi.fn(),
  },
}));

// Mock the userNameService
vi.mock('../userNameService', () => ({
  userNameService: {
    setUserName: vi.fn(),
    getUserName: vi.fn(),
  },
}));

// Mock the taskService
vi.mock('../taskService', () => ({
  taskService: {
    createTask: vi.fn(),
  },
}));

describe('ideaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createIdea', () => {
    it('should create a new idea successfully', async () => {
      const mockIdea = {
        $id: 'idea-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        title: 'Test Idea',
        description: 'Test Description',
        tags: ['frontend', 'react'],
        status: 'submitted',
        createdBy: 'user-123',
        voteCount: 0,
      };

      const { databases } = await import('../../lib/appwrite');
      databases.createDocument.mockResolvedValue(mockIdea);

      const ideaData = {
        title: 'Test Idea',
        description: 'Test Description',
        tags: ['frontend', 'react'],
        createdBy: 'user-123',
      };

      const result = await ideaService.createIdea(
        'team-123',
        'hackathon-123',
        ideaData,
        'Test User'
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        'unique-id',
        expect.objectContaining({
          teamId: 'team-123',
          hackathonId: 'hackathon-123',
          title: 'Test Idea',
          description: 'Test Description',
          tags: ['frontend', 'react'],
          status: 'submitted',
          createdBy: 'user-123',
          voteCount: 0,
        })
      );

      expect(result).toEqual(mockIdea);
    });

    it('should handle empty tags array', async () => {
      const mockIdea = {
        $id: 'idea-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        title: 'Test Idea',
        description: 'Test Description',
        tags: [],
        status: 'submitted',
        createdBy: 'user-123',
        voteCount: 0,
      };

      const { databases } = await import('../../lib/appwrite');
      databases.createDocument.mockResolvedValue(mockIdea);

      const ideaData = {
        title: 'Test Idea',
        description: 'Test Description',
        tags: null, // Test null tags
        createdBy: 'user-123',
      };

      await ideaService.createIdea('team-123', 'hackathon-123', ideaData, 'Test User');

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        'unique-id',
        expect.objectContaining({
          tags: [], // Should be converted to empty array
        })
      );
    });

    it('should throw error on database failure', async () => {
      const { databases } = await import('../../lib/appwrite');
      databases.createDocument.mockRejectedValue(new Error('Database error'));

      const ideaData = {
        title: 'Test Idea',
        description: 'Test Description',
        tags: [],
        createdBy: 'user-123',
      };

      await expect(
        ideaService.createIdea('team-123', 'hackathon-123', ideaData, 'Test User')
      ).rejects.toThrow('Failed to create idea: Database error');
    });
  });

  describe('getTeamIdeas', () => {
    it('should fetch team ideas successfully', async () => {
      const mockIdeas = [
        {
          $id: 'idea-1',
          title: 'Idea 1',
          teamId: 'team-123',
          hackathonId: 'hackathon-123',
        },
        {
          $id: 'idea-2',
          title: 'Idea 2',
          teamId: 'team-123',
          hackathonId: 'hackathon-123',
        },
      ];

      const { databases, Query } = await import('../../lib/appwrite');
      databases.listDocuments.mockResolvedValue({ documents: mockIdeas });

      const result = await ideaService.getTeamIdeas('team-123', 'hackathon-123');

      expect(databases.listDocuments).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        [
          'teamId=team-123',
          'hackathonId=hackathon-123',
          'orderDesc($createdAt)',
        ]
      );

      expect(result).toEqual(mockIdeas);
    });

    it('should throw error when teamId is missing', async () => {
      await expect(
        ideaService.getTeamIdeas(null, 'hackathon-123')
      ).rejects.toThrow('Team ID is required to fetch ideas');
    });

    it('should throw error when hackathonId is missing', async () => {
      await expect(
        ideaService.getTeamIdeas('team-123', null)
      ).rejects.toThrow('Hackathon ID is required to fetch ideas');
    });
  });

  describe('voteOnIdea', () => {
    it('should create a vote successfully', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Test Idea',
        voteCount: 5,
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      };

      const mockVote = {
        $id: 'vote-123',
        ideaId: 'idea-123',
        userId: 'user-123',
      };

      const mockUpdatedIdea = {
        ...mockIdea,
        voteCount: 6,
      };

      const { databases } = await import('../../lib/appwrite');
      databases.listDocuments.mockResolvedValue({ documents: [] }); // No existing votes
      databases.createDocument.mockResolvedValue(mockVote);
      databases.getDocument
        .mockResolvedValueOnce(mockIdea) // First call for voting
        .mockResolvedValueOnce(mockUpdatedIdea); // Second call for auto-approval check
      databases.updateDocument.mockResolvedValue(mockUpdatedIdea);

      const result = await ideaService.voteOnIdea('idea-123', 'user-123', 'Test User');

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-database',
        'idea_votes',
        'unique-id',
        expect.objectContaining({
          ideaId: 'idea-123',
          userId: 'user-123',
        })
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        'idea-123',
        expect.objectContaining({
          voteCount: 6,
        })
      );

      expect(result).toEqual({
        vote: mockVote,
        updatedIdea: mockUpdatedIdea,
      });
    });

    it('should throw error if user already voted', async () => {
      const mockExistingVote = {
        $id: 'vote-123',
        ideaId: 'idea-123',
        userId: 'user-123',
      };

      const { databases } = await import('../../lib/appwrite');
      databases.listDocuments.mockResolvedValue({ documents: [mockExistingVote] });

      await expect(
        ideaService.voteOnIdea('idea-123', 'user-123', 'Test User')
      ).rejects.toThrow('You have already voted on this idea');
    });
  });

  describe('updateIdeaStatus', () => {
    it('should update idea status successfully', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Test Idea',
        status: 'submitted',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      };

      const mockUpdatedIdea = {
        ...mockIdea,
        status: 'approved',
      };

      const { databases } = await import('../../lib/appwrite');
      databases.getDocument.mockResolvedValue(mockIdea);
      databases.updateDocument.mockResolvedValue(mockUpdatedIdea);

      const result = await ideaService.updateIdeaStatus('idea-123', 'approved', 'Test User');

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        'idea-123',
        expect.objectContaining({
          status: 'approved',
        })
      );

      expect(result).toEqual(mockUpdatedIdea);
    });

    it('should throw error for invalid status', async () => {
      await expect(
        ideaService.updateIdeaStatus('idea-123', 'invalid_status', 'Test User')
      ).rejects.toThrow('Invalid status. Must be submitted, approved, in_progress, completed, or rejected.');
    });
  });

  describe('getUserVoteStatus', () => {
    it('should return vote status for ideas', async () => {
      const mockVotes = [
        { ideaId: 'idea-1', userId: 'user-123' },
        { ideaId: 'idea-3', userId: 'user-123' },
      ];

      const { databases } = await import('../../lib/appwrite');
      databases.listDocuments.mockResolvedValue({ documents: mockVotes });

      const result = await ideaService.getUserVoteStatus(['idea-1', 'idea-2', 'idea-3'], 'user-123');

      expect(result).toEqual({
        'idea-1': true,
        'idea-3': true,
      });
    });

    it('should return empty object for empty idea list', async () => {
      const result = await ideaService.getUserVoteStatus([], 'user-123');
      expect(result).toEqual({});
    });

    it('should return empty object on error', async () => {
      const { databases } = await import('../../lib/appwrite');
      databases.listDocuments.mockRejectedValue(new Error('Database error'));

      const result = await ideaService.getUserVoteStatus(['idea-1'], 'user-123');
      expect(result).toEqual({});
    });
  });

  describe('convertIdeaToTask', () => {
    it('should convert idea to task successfully', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Test Idea',
        description: 'Test Description',
        tags: ['frontend', 'react'],
        voteCount: 5,
        createdBy: 'user-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        status: 'approved',
      };

      const mockTask = {
        $id: 'task-123',
        title: 'Test Idea',
        description: 'Test Description\n\n_Converted from idea with 5 votes_',
        assignedTo: 'user-123',
        createdBy: 'user-123',
        priority: 'high',
        labels: ['frontend', 'react', 'from-idea'],
      };

      const mockUpdatedIdea = {
        ...mockIdea,
        status: 'in_progress',
      };

      const { databases } = await import('../../lib/appwrite');
      const { taskService } = await import('../taskService');
      const { userNameService } = await import('../userNameService');

      databases.getDocument.mockResolvedValue(mockIdea);
      databases.updateDocument.mockResolvedValue(mockUpdatedIdea);
      taskService.createTask.mockResolvedValue(mockTask);
      userNameService.getUserName.mockResolvedValue('Test User');

      const result = await ideaService.convertIdeaToTask('idea-123', 'Admin User');

      expect(databases.getDocument).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        'idea-123'
      );

      expect(taskService.createTask).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        expect.objectContaining({
          title: 'Test Idea',
          description: 'Test Description\n\n_Converted from idea with 5 votes_',
          assignedTo: 'user-123',
          createdBy: 'user-123',
          priority: 'high', // High priority because voteCount >= 5
          labels: ['frontend', 'react', 'from-idea'],
        }),
        'Test User',
        'Test User'
      );

      expect(result).toEqual({
        task: mockTask,
        updatedIdea: mockUpdatedIdea,
      });
    });

    it('should set medium priority for ideas with fewer votes', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Test Idea',
        description: 'Test Description',
        tags: ['backend'],
        voteCount: 2, // Less than 5 votes
        createdBy: 'user-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        status: 'approved',
      };

      const mockTask = {
        $id: 'task-123',
        title: 'Test Idea',
        priority: 'medium',
      };

      const { databases } = await import('../../lib/appwrite');
      const { taskService } = await import('../taskService');
      const { userNameService } = await import('../userNameService');

      databases.getDocument.mockResolvedValue(mockIdea);
      databases.updateDocument.mockResolvedValue(mockIdea);
      taskService.createTask.mockResolvedValue(mockTask);
      userNameService.getUserName.mockResolvedValue('Test User');

      await ideaService.convertIdeaToTask('idea-123', 'Admin User');

      expect(taskService.createTask).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        expect.objectContaining({
          priority: 'medium', // Medium priority because voteCount < 5
        }),
        'Test User',
        'Test User'
      );
    });

    it('should handle userNameService errors gracefully', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Test Idea',
        description: 'Test Description',
        voteCount: 3,
        createdBy: 'user-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        status: 'approved',
      };

      const mockTask = { $id: 'task-123' };

      const { databases } = await import('../../lib/appwrite');
      const { taskService } = await import('../taskService');
      const { userNameService } = await import('../userNameService');

      databases.getDocument.mockResolvedValue(mockIdea);
      databases.updateDocument.mockResolvedValue(mockIdea);
      taskService.createTask.mockResolvedValue(mockTask);
      userNameService.getUserName.mockRejectedValue(new Error('User not found'));

      await ideaService.convertIdeaToTask('idea-123', 'Admin User');

      // Should still call taskService with fallback name
      expect(taskService.createTask).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        expect.anything(),
        'Admin User', // Fallback to provided userName
        'Admin User'
      );
    });
  });

  describe('checkAutoApproval', () => {
    it('should auto-approve idea when vote threshold is met', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Popular Idea',
        status: 'submitted',
        voteCount: 5,
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      };

      const mockUpdatedIdea = {
        ...mockIdea,
        status: 'approved',
      };

      const { databases } = await import('../../lib/appwrite');
      databases.getDocument.mockResolvedValue(mockIdea);
      databases.updateDocument.mockResolvedValue(mockUpdatedIdea);

      const result = await ideaService.checkAutoApproval('idea-123', 3);

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        'idea-123',
        expect.objectContaining({
          status: 'approved',
        })
      );

      expect(result).toEqual(mockUpdatedIdea);
    });

    it('should not auto-approve if vote count is below threshold', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Unpopular Idea',
        status: 'submitted',
        voteCount: 2, // Below threshold of 3
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      };

      const { databases } = await import('../../lib/appwrite');
      databases.getDocument.mockResolvedValue(mockIdea);

      const result = await ideaService.checkAutoApproval('idea-123', 3);

      expect(databases.updateDocument).not.toHaveBeenCalled();
      expect(result).toEqual(mockIdea);
    });

    it('should not auto-approve if idea is not in submitted status', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Already Approved Idea',
        status: 'approved', // Already approved
        voteCount: 5,
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      };

      const { databases } = await import('../../lib/appwrite');
      databases.getDocument.mockResolvedValue(mockIdea);

      const result = await ideaService.checkAutoApproval('idea-123', 3);

      expect(databases.updateDocument).not.toHaveBeenCalled();
      expect(result).toEqual(mockIdea);
    });
  });

  describe('integration with chat system', () => {
    it('should send system message when idea is created', async () => {
      const mockIdea = {
        $id: 'idea-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        title: 'Test Idea',
      };

      const { databases } = await import('../../lib/appwrite');
      const { messageService } = await import('../messageService');

      databases.createDocument.mockResolvedValue(mockIdea);

      await ideaService.createIdea(
        'team-123',
        'hackathon-123',
        { title: 'Test Idea', createdBy: 'user-123' },
        'Test User'
      );

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        '💡 Test User submitted a new idea: "Test Idea"',
        'idea_created',
        expect.objectContaining({
          ideaId: 'idea-123',
          ideaTitle: 'Test Idea',
          createdBy: 'Test User',
          status: 'submitted',
        })
      );
    });

    it('should send system message when idea is voted on', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Test Idea',
        voteCount: 2,
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      };

      const mockUpdatedIdea = { ...mockIdea, voteCount: 3 };

      const { databases } = await import('../../lib/appwrite');
      const { messageService } = await import('../messageService');

      databases.listDocuments.mockResolvedValue({ documents: [] });
      databases.createDocument.mockResolvedValue({ $id: 'vote-123' });
      databases.getDocument.mockResolvedValue(mockIdea);
      databases.updateDocument.mockResolvedValue(mockUpdatedIdea);

      await ideaService.voteOnIdea('idea-123', 'user-123', 'Voter User');

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        '👍 Voter User voted on idea: "Test Idea" (3 votes)',
        'idea_voted',
        expect.objectContaining({
          ideaId: 'idea-123',
          ideaTitle: 'Test Idea',
          votedBy: 'Voter User',
          newVoteCount: 3,
        })
      );
    });

    it('should send system message when idea is auto-approved', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Popular Idea',
        status: 'submitted',
        voteCount: 5,
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      };

      const { databases } = await import('../../lib/appwrite');
      const { messageService } = await import('../messageService');

      databases.getDocument.mockResolvedValue(mockIdea);
      databases.updateDocument.mockResolvedValue({ ...mockIdea, status: 'approved' });

      await ideaService.checkAutoApproval('idea-123', 3);

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        '🎉 Idea "Popular Idea" was automatically approved with 5 votes!',
        'idea_auto_approved',
        expect.objectContaining({
          ideaId: 'idea-123',
          ideaTitle: 'Popular Idea',
          voteCount: 5,
          threshold: 3,
          autoApproved: true,
        })
      );
    });

    it('should send system message when idea is converted to task', async () => {
      const mockIdea = {
        $id: 'idea-123',
        title: 'Test Idea',
        voteCount: 4,
        createdBy: 'user-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      };

      const mockTask = { $id: 'task-123', title: 'Test Idea' };

      const { databases } = await import('../../lib/appwrite');
      const { taskService } = await import('../taskService');
      const { messageService } = await import('../messageService');
      const { userNameService } = await import('../userNameService');

      databases.getDocument.mockResolvedValue(mockIdea);
      databases.updateDocument.mockResolvedValue(mockIdea);
      taskService.createTask.mockResolvedValue(mockTask);
      userNameService.getUserName.mockResolvedValue('Test User');

      await ideaService.convertIdeaToTask('idea-123', 'Admin User');

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        '🔄 Admin User converted idea "Test Idea" to a task (4 votes)',
        'idea_converted_to_task',
        expect.objectContaining({
          ideaId: 'idea-123',
          taskId: 'task-123',
          ideaTitle: 'Test Idea',
          taskTitle: 'Test Idea',
          voteCount: 4,
          convertedBy: 'Admin User',
        })
      );
    });
  });
});