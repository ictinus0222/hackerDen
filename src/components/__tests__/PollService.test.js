import { describe, it, expect, vi, beforeEach } from 'vitest';
import pollService from '../../services/pollService';

// Mock Appwrite
vi.mock('@/lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    getDocument: vi.fn(),
    listDocuments: vi.fn(),
    updateDocument: vi.fn(),
  },
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    POLLS: 'polls',
    POLL_VOTES: 'poll_votes',
  },
  Query: {
    equal: vi.fn((field, value) => `equal(${field}, ${value})`),
    greaterThan: vi.fn((field, value) => `greaterThan(${field}, ${value})`),
    lessThan: vi.fn((field, value) => `lessThan(${field}, ${value})`),
    orderDesc: vi.fn((field) => `orderDesc(${field})`),
    limit: vi.fn((value) => `limit(${value})`),
    contains: vi.fn((field, values) => `contains(${field}, ${values})`),
  },
  ID: {
    unique: vi.fn(() => 'unique-id'),
  },
}));

describe('PollService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPoll', () => {
    it('should create a poll with valid data', async () => {
      const { databases } = await import('@/lib/appwrite');
      
      const mockPoll = {
        $id: 'poll-1',
        teamId: 'team-1',
        createdBy: 'user-1',
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        allowMultiple: false,
        isActive: true,
        totalVotes: 0,
      };

      databases.createDocument.mockResolvedValue(mockPoll);

      const pollData = {
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        allowMultiple: false,
      };

      const result = await pollService.createPoll('team-1', 'user-1', pollData);

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'polls',
        'unique-id',
        expect.objectContaining({
          teamId: 'team-1',
          createdBy: 'user-1',
          question: 'Test question?',
          options: ['Option 1', 'Option 2'],
          allowMultiple: false,
          isActive: true,
          totalVotes: 0,
        })
      );

      expect(result).toEqual(mockPoll);
    });

    it('should throw error for invalid poll data', async () => {
      const pollData = {
        question: '',
        options: ['Option 1'], // Only one option
      };

      await expect(
        pollService.createPoll('team-1', 'user-1', pollData)
      ).rejects.toThrow('Question and at least 2 options are required');
    });
  });

  describe('voteOnPoll', () => {
    it('should create a new vote', async () => {
      const { databases } = await import('@/lib/appwrite');
      
      const mockPoll = {
        $id: 'poll-1',
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        options: ['Option 1', 'Option 2'],
        allowMultiple: false,
        totalVotes: 0,
      };

      const mockVote = {
        $id: 'vote-1',
        pollId: 'poll-1',
        userId: 'user-1',
        selectedOptions: ['Option 1'],
      };

      databases.getDocument.mockResolvedValue(mockPoll);
      databases.listDocuments.mockResolvedValue({ documents: [] }); // No existing vote
      databases.createDocument.mockResolvedValue(mockVote);
      databases.updateDocument.mockResolvedValue({ ...mockPoll, totalVotes: 1 });

      const result = await pollService.voteOnPoll('poll-1', 'user-1', 'Option 1');

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'poll_votes',
        'unique-id',
        expect.objectContaining({
          pollId: 'poll-1',
          userId: 'user-1',
          selectedOptions: ['Option 1'],
        })
      );

      expect(result).toEqual(mockVote);
    });

    it('should throw error for inactive poll', async () => {
      const { databases } = await import('@/lib/appwrite');
      
      const mockPoll = {
        $id: 'poll-1',
        isActive: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        options: ['Option 1', 'Option 2'],
      };

      databases.getDocument.mockResolvedValue(mockPoll);

      await expect(
        pollService.voteOnPoll('poll-1', 'user-1', 'Option 1')
      ).rejects.toThrow('Poll is not active');
    });
  });

  describe('getPollResults', () => {
    it('should calculate poll results correctly', async () => {
      const { databases } = await import('@/lib/appwrite');
      
      const mockPoll = {
        $id: 'poll-1',
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockVotes = {
        documents: [
          { selectedOptions: ['Option 1'] },
          { selectedOptions: ['Option 1'] },
          { selectedOptions: ['Option 2'] },
        ]
      };

      databases.getDocument.mockResolvedValue(mockPoll);
      databases.listDocuments.mockResolvedValue(mockVotes);

      const result = await pollService.getPollResults('poll-1');

      expect(result.results).toEqual([
        { option: 'Option 1', votes: 2, percentage: 67 },
        { option: 'Option 2', votes: 1, percentage: 33 },
      ]);

      expect(result.totalVotes).toBe(3);
      expect(result.uniqueVoters).toBe(3);
      expect(result.winners).toEqual(['Option 1']);
    });
  });

  describe('createQuickPoll', () => {
    it('should create a yes/no poll', async () => {
      const { databases } = await import('@/lib/appwrite');
      
      const mockPoll = {
        $id: 'poll-1',
        teamId: 'team-1',
        createdBy: 'user-1',
        question: 'Quick question?',
        options: ['Yes', 'No'],
        allowMultiple: false,
      };

      databases.createDocument.mockResolvedValue(mockPoll);

      const result = await pollService.createQuickPoll('team-1', 'user-1', 'Quick question?', 2);

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'polls',
        'unique-id',
        expect.objectContaining({
          question: 'Quick question?',
          options: ['Yes', 'No'],
          allowMultiple: false,
        })
      );

      expect(result).toEqual(mockPoll);
    });
  });
});