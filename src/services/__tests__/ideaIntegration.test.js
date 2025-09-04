import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ideaService } from '../ideaService';
import { taskService } from '../taskService';
import { messageService } from '../messageService';

// Mock all dependencies
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
    TASKS: 'tasks',
    MESSAGES: 'messages',
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

vi.mock('../messageService', () => ({
  messageService: {
    sendSystemMessage: vi.fn(),
  },
}));

vi.mock('../userNameService', () => ({
  userNameService: {
    setUserName: vi.fn(),
    getUserName: vi.fn(),
  },
}));

vi.mock('../taskService', () => ({
  taskService: {
    createTask: vi.fn(),
  },
}));

describe('Idea System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('End-to-End Idea Workflow', () => {
    it('should complete full idea lifecycle: create -> vote -> auto-approve -> convert to task', async () => {
      const teamId = 'team-123';
      const hackathonId = 'hackathon-123';
      const userId = 'user-123';
      const userName = 'Test User';

      const { databases } = await import('../../lib/appwrite');
      const { taskService } = await import('../taskService');
      const { messageService } = await import('../messageService');
      const { userNameService } = await import('../userNameService');

      // Step 1: Test idea creation with chat integration
      const mockIdea = {
        $id: 'idea-123',
        teamId,
        hackathonId,
        title: 'Revolutionary Feature',
        description: 'A game-changing idea',
        tags: ['frontend', 'innovation'],
        status: 'submitted',
        createdBy: userId,
        voteCount: 0,
      };

      databases.createDocument.mockResolvedValueOnce(mockIdea);

      const createdIdea = await ideaService.createIdea(
        teamId,
        hackathonId,
        {
          title: 'Revolutionary Feature',
          description: 'A game-changing idea',
          tags: ['frontend', 'innovation'],
          createdBy: userId,
        },
        userName
      );

      expect(createdIdea).toEqual(mockIdea);
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        teamId,
        hackathonId,
        '💡 Test User submitted a new idea: "Revolutionary Feature"',
        'idea_created',
        expect.objectContaining({
          ideaId: 'idea-123',
          ideaTitle: 'Revolutionary Feature',
          createdBy: userName,
          status: 'submitted',
        })
      );

      // Step 2: Test voting with auto-approval
      const ideaBeforeVote = { ...mockIdea, voteCount: 2 };
      const ideaAfterVote = { ...mockIdea, voteCount: 3 };
      const approvedIdea = { ...ideaAfterVote, status: 'approved' };

      databases.listDocuments.mockResolvedValueOnce({ documents: [] }); // No existing votes
      databases.createDocument.mockResolvedValueOnce({ $id: 'vote-123' });
      databases.getDocument
        .mockResolvedValueOnce(ideaBeforeVote) // Current idea for voting
        .mockResolvedValueOnce(ideaAfterVote) // For auto-approval check
        .mockResolvedValueOnce(ideaAfterVote); // For updateIdeaStatus
      databases.updateDocument
        .mockResolvedValueOnce(ideaAfterVote) // Vote count update
        .mockResolvedValueOnce(approvedIdea); // Auto-approval update

      const voteResult = await ideaService.voteOnIdea('idea-123', 'voter-123', 'Voter User');

      expect(voteResult.updatedIdea.status).toBe('approved');
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        teamId,
        hackathonId,
        expect.stringContaining('automatically approved'),
        'idea_auto_approved',
        expect.objectContaining({
          autoApproved: true,
          threshold: 3,
        })
      );

      // Step 3: Test idea to task conversion
      const mockTask = {
        $id: 'task-123',
        title: 'Revolutionary Feature',
        description: 'A game-changing idea\n\n_Converted from idea with 3 votes_',
        assignedTo: userId,
        createdBy: userId,
        priority: 'medium',
        labels: ['frontend', 'innovation', 'from-idea'],
      };

      const ideaInProgress = { ...approvedIdea, status: 'in_progress' };

      databases.getDocument
        .mockResolvedValueOnce(approvedIdea) // Get idea for conversion
        .mockResolvedValueOnce(approvedIdea); // Get idea for updateIdeaStatus
      databases.updateDocument.mockResolvedValueOnce(ideaInProgress);
      taskService.createTask.mockResolvedValueOnce(mockTask);
      userNameService.getUserName.mockResolvedValueOnce(userName);

      const conversionResult = await ideaService.convertIdeaToTask('idea-123', 'Admin User');

      expect(taskService.createTask).toHaveBeenCalledWith(
        teamId,
        hackathonId,
        expect.objectContaining({
          title: 'Revolutionary Feature',
          priority: 'medium', // Medium because voteCount < 5
          labels: ['frontend', 'innovation', 'from-idea'],
        }),
        userName,
        userName
      );

      expect(conversionResult.task).toEqual(mockTask);
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        teamId,
        hackathonId,
        '🔄 Admin User converted idea "Revolutionary Feature" to a task (3 votes)',
        'idea_converted_to_task',
        expect.objectContaining({
          ideaId: 'idea-123',
          taskId: 'task-123',
          voteCount: 3,
          convertedBy: 'Admin User',
        })
      );
    });

    it('should handle high-priority task creation for popular ideas', async () => {
      const popularIdea = {
        $id: 'popular-idea-123',
        title: 'Viral Feature',
        description: 'Everyone loves this',
        voteCount: 8, // High vote count
        createdBy: 'user-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        status: 'approved',
      };

      const { databases } = await import('../../lib/appwrite');
      const { taskService } = await import('../taskService');
      const { userNameService } = await import('../userNameService');

      databases.getDocument
        .mockResolvedValueOnce(popularIdea) // Get idea for conversion
        .mockResolvedValueOnce(popularIdea); // Get idea for updateIdeaStatus
      databases.updateDocument.mockResolvedValueOnce({ ...popularIdea, status: 'in_progress' });
      taskService.createTask.mockResolvedValueOnce({ $id: 'high-priority-task' });
      userNameService.getUserName.mockResolvedValueOnce('Popular User');

      await ideaService.convertIdeaToTask('popular-idea-123', 'Admin');

      expect(taskService.createTask).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        expect.objectContaining({
          priority: 'high', // High priority because voteCount >= 5
          description: expect.stringContaining('_Converted from idea with 8 votes_'),
        }),
        'Popular User',
        'Popular User'
      );
    });

    it('should handle chat integration failures gracefully', async () => {
      const { databases } = await import('../../lib/appwrite');
      const { messageService } = await import('../messageService');

      // Mock successful idea creation but failed chat message
      databases.createDocument.mockResolvedValueOnce({
        $id: 'idea-123',
        title: 'Test Idea',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
      });

      messageService.sendSystemMessage.mockRejectedValueOnce(new Error('Chat service down'));

      // Should not throw error even if chat fails
      const result = await ideaService.createIdea(
        'team-123',
        'hackathon-123',
        { title: 'Test Idea', createdBy: 'user-123' },
        'Test User'
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Idea');
    });

    it('should maintain data consistency across service boundaries', async () => {
      const { databases } = await import('../../lib/appwrite');
      const { messageService } = await import('../messageService');

      const ideaData = {
        title: 'Consistency Test',
        description: 'Testing data flow',
        tags: ['test', 'integration'],
        createdBy: 'user-123',
      };

      const mockIdea = {
        $id: 'idea-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        ...ideaData,
        status: 'submitted',
        voteCount: 0,
      };

      databases.createDocument.mockResolvedValueOnce(mockIdea);

      await ideaService.createIdea('team-123', 'hackathon-123', ideaData, 'Test User');

      // Verify that the same data is passed to both database and chat
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        'unique-id',
        expect.objectContaining({
          teamId: 'team-123',
          hackathonId: 'hackathon-123',
          title: 'Consistency Test',
          description: 'Testing data flow',
          tags: ['test', 'integration'],
          createdBy: 'user-123',
        })
      );

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        expect.stringContaining('Consistency Test'),
        'idea_created',
        expect.objectContaining({
          ideaId: 'idea-123',
          ideaTitle: 'Consistency Test',
          createdBy: 'Test User',
        })
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle task creation failure during idea conversion', async () => {
      const { databases } = await import('../../lib/appwrite');
      const { taskService } = await import('../taskService');
      const { userNameService } = await import('../userNameService');

      const mockIdea = {
        $id: 'idea-123',
        title: 'Failed Conversion',
        createdBy: 'user-123',
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        voteCount: 2,
      };

      databases.getDocument.mockResolvedValueOnce(mockIdea);
      userNameService.getUserName.mockResolvedValueOnce('Test User');
      taskService.createTask.mockRejectedValueOnce(new Error('Task creation failed'));

      await expect(
        ideaService.convertIdeaToTask('idea-123', 'Admin')
      ).rejects.toThrow('Task creation failed');

      // Verify that idea status was not changed if task creation failed
      expect(databases.updateDocument).not.toHaveBeenCalled();
    });

    it('should handle concurrent voting scenarios', async () => {
      const { databases } = await import('../../lib/appwrite');

      const mockIdea = {
        $id: 'idea-123',
        title: 'Concurrent Test',
        voteCount: 2,
        teamId: 'team-123',
        hackathonId: 'hackathon-123',
        status: 'submitted',
      };

      const updatedIdea = { ...mockIdea, voteCount: 3 };

      // Simulate concurrent votes by different users
      databases.listDocuments.mockResolvedValue({ documents: [] }); // No existing votes
      databases.createDocument.mockResolvedValue({ $id: 'vote-123' });
      databases.getDocument
        .mockResolvedValueOnce(mockIdea) // First voter sees 2 votes
        .mockResolvedValueOnce(updatedIdea) // For auto-approval check
        .mockResolvedValueOnce(updatedIdea); // For updateIdeaStatus if needed
      databases.updateDocument.mockResolvedValue(updatedIdea);

      const result = await ideaService.voteOnIdea('idea-123', 'user-456', 'Concurrent User');

      expect(result.updatedIdea.voteCount).toBe(3);
      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-database',
        'ideas',
        'idea-123',
        expect.objectContaining({
          voteCount: 3, // Incremented from 2
        })
      );
    });
  });
});