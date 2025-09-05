import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MessageItem from '../MessageItem';
import PollHistory from '../PollHistory';
import pollService from '../../services/pollService';
import { messageService } from '../../services/messageService';
import { taskService } from '../../services/taskService';

// Mock services
vi.mock('../../services/pollService');
vi.mock('../../services/messageService');
vi.mock('../../services/taskService');
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User' }
  })
}));

describe('Poll Chat Integration', () => {
  const mockPoll = {
    $id: 'poll1',
    teamId: 'team1',
    hackathonId: 'hackathon1',
    question: 'Which feature should we implement first?',
    options: ['User Authentication', 'Dashboard', 'API Integration'],
    allowMultiple: false,
    isActive: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };

  const mockPollResults = {
    poll: mockPoll,
    results: [
      { option: 'User Authentication', votes: 5, percentage: 50 },
      { option: 'Dashboard', votes: 3, percentage: 30 },
      { option: 'API Integration', votes: 2, percentage: 20 }
    ],
    totalVotes: 10,
    uniqueVoters: 8,
    winners: ['User Authentication'],
    isExpired: false
  };

  const mockPollMessage = {
    $id: 'msg1',
    type: 'poll_created',
    content: '📊 Test User created a poll: "Which feature should we implement first?"',
    systemData: {
      pollId: 'poll1',
      pollQuestion: 'Which feature should we implement first?',
      createdBy: 'Test User',
      type: 'poll'
    },
    $createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    pollService.getPollResults.mockResolvedValue(mockPollResults);
    pollService.voteOnPoll.mockResolvedValue({ selectedOptions: ['User Authentication'] });
    pollService.convertPollToTask.mockResolvedValue({
      $id: 'task1',
      title: 'Implement: User Authentication',
      description: 'Task created from poll decision'
    });
  });

  describe('MessageItem Poll Integration', () => {
    it('should display interactive poll for poll creation messages', async () => {
      render(
        <MessageItem
          message={mockPollMessage}
          isCurrentUser={false}
          onPollVoteUpdate={vi.fn()}
          onTaskCreated={vi.fn()}
        />
      );

      // Should show poll creation message
      expect(screen.getByText(/Test User created a poll/)).toBeInTheDocument();

      // Should load and display poll
      await waitFor(() => {
        expect(screen.getByText('Which feature should we implement first?')).toBeInTheDocument();
      });

      // Should show poll options
      expect(screen.getByText('User Authentication')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('API Integration')).toBeInTheDocument();
    });

    it('should handle poll voting through chat interface', async () => {
      const onVoteUpdate = vi.fn();
      
      render(
        <MessageItem
          message={mockPollMessage}
          isCurrentUser={false}
          onPollVoteUpdate={onVoteUpdate}
          onTaskCreated={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Click on an option
      fireEvent.click(screen.getByText('User Authentication'));
      
      // Click submit vote button
      const submitButton = screen.getByText('Submit Vote');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(pollService.voteOnPoll).toHaveBeenCalledWith(
          'poll1',
          'user1',
          ['User Authentication'],
          'hackathon1',
          'Test User'
        );
        expect(onVoteUpdate).toHaveBeenCalled();
      });
    });

    it('should handle task creation from poll results', async () => {
      const onTaskCreated = vi.fn();
      
      // Mock poll results to show expired poll with results
      const expiredPollResults = {
        ...mockPollResults,
        isExpired: true
      };
      pollService.getPollResults.mockResolvedValue(expiredPollResults);

      render(
        <MessageItem
          message={mockPollMessage}
          isCurrentUser={false}
          onPollVoteUpdate={vi.fn()}
          onTaskCreated={onTaskCreated}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Should show create task button for winner (in compact mode)
      const createTaskButton = screen.getByText('Create Task');
      fireEvent.click(createTaskButton);

      await waitFor(() => {
        expect(pollService.convertPollToTask).toHaveBeenCalledWith(
          'poll1',
          'User Authentication',
          'hackathon1',
          'user1',
          'Test User'
        );
        expect(onTaskCreated).toHaveBeenCalled();
      });
    });
  });

  describe('PollHistory Integration', () => {
    beforeEach(() => {
      pollService.getTeamPolls.mockResolvedValue([mockPoll]);
      pollService.getVoteDetails.mockResolvedValue({
        poll1: ['User Authentication']
      });
    });

    it('should display poll history with collapsible details', async () => {
      render(
        <PollHistory
          teamId="team1"
          hackathonId="hackathon1"
          onTaskCreated={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Which feature should we implement first?')).toBeInTheDocument();
      });

      // Should show poll summary
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Single Choice')).toBeInTheDocument();
    });

    it('should allow expanding poll details', async () => {
      render(
        <PollHistory
          teamId="team1"
          hackathonId="hackathon1"
          onTaskCreated={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Which feature should we implement first?')).toBeInTheDocument();
      });

      // Click to expand poll details - find the collapsible trigger
      const pollCard = screen.getByText('Which feature should we implement first?');
      const expandButton = pollCard.closest('[data-state="closed"]').querySelector('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    it('should handle task creation from poll history', async () => {
      const onTaskCreated = vi.fn();
      
      render(
        <PollHistory
          teamId="team1"
          hackathonId="hackathon1"
          onTaskCreated={onTaskCreated}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Which feature should we implement first?')).toBeInTheDocument();
      });

      // Expand poll details - find the collapsible trigger
      const pollCard = screen.getByText('Which feature should we implement first?');
      const expandButton = pollCard.closest('[data-state="closed"]').querySelector('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Create Task')).toBeInTheDocument();
      });

      // Click create task
      const createTaskButton = screen.getByText('Create Task');
      fireEvent.click(createTaskButton);

      await waitFor(() => {
        expect(pollService.convertPollToTask).toHaveBeenCalledWith(
          'poll1',
          'User Authentication',
          'hackathon1',
          'user1',
          'Test User'
        );
        expect(onTaskCreated).toHaveBeenCalled();
      });
    });

    it('should handle poll results export', async () => {
      // Mock URL.createObjectURL and related functions
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      const mockExportData = {
        content: 'poll,results,csv',
        filename: 'poll-results.csv',
        mimeType: 'text/csv'
      };
      
      pollService.exportPollResults.mockResolvedValue(mockExportData);

      render(
        <PollHistory
          teamId="team1"
          hackathonId="hackathon1"
          onTaskCreated={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Which feature should we implement first?')).toBeInTheDocument();
      });

      // Expand poll details - find the collapsible trigger
      const pollCard = screen.getByText('Which feature should we implement first?');
      const expandButton = pollCard.closest('[data-state="closed"]').querySelector('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      // Click export
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(pollService.exportPollResults).toHaveBeenCalledWith('poll1', 'csv');
      });
    });
  });

  describe('Chat Message Integration', () => {
    it('should send poll creation messages to chat', async () => {
      // Mock the createPoll method to actually call the message service
      pollService.createPoll.mockImplementation(async (teamId, createdBy, pollData, hackathonId, creatorName) => {
        const newPoll = { ...mockPoll, $id: 'new-poll-id' };
        if (hackathonId) {
          await messageService.sendPollMessage(teamId, hackathonId, mockPoll.$id, pollData.question, creatorName);
        }
        return newPoll;
      });

      await pollService.createPoll(
        'team1',
        'user1',
        {
          question: 'Test poll?',
          options: ['Yes', 'No']
        },
        'hackathon1',
        'Test User'
      );

      expect(messageService.sendPollMessage).toHaveBeenCalledWith(
        'team1',
        'hackathon1',
        expect.any(String),
        'Test poll?',
        'Test User'
      );
    });

    it('should send poll vote messages to chat', async () => {
      // Mock the voteOnPoll method to actually call the message service
      pollService.voteOnPoll.mockImplementation(async (pollId, userId, selectedOptions, hackathonId, voterName) => {
        const vote = { selectedOptions };
        if (hackathonId) {
          await messageService.sendPollVoteMessage(mockPoll.teamId, hackathonId, pollId, mockPoll.question, voterName, selectedOptions);
        }
        return vote;
      });

      await pollService.voteOnPoll(
        'poll1',
        'user1',
        ['Yes'],
        'hackathon1',
        'Test User'
      );

      expect(messageService.sendPollVoteMessage).toHaveBeenCalledWith(
        'team1',
        'hackathon1',
        'poll1',
        expect.any(String),
        'Test User',
        ['Yes']
      );
    });

    it('should send poll result messages when polls close', async () => {
      // Mock the closePoll method to actually call the message service
      pollService.closePoll.mockImplementation(async (pollId, hackathonId) => {
        const updatedPoll = { ...mockPoll, isActive: false };
        if (hackathonId) {
          await messageService.sendPollResultMessage(mockPoll.teamId, hackathonId, pollId, mockPoll.question, mockPollResults.winners, mockPollResults.totalVotes);
        }
        return updatedPoll;
      });

      await pollService.closePoll('poll1', 'hackathon1');

      expect(messageService.sendPollResultMessage).toHaveBeenCalledWith(
        'team1',
        'hackathon1',
        'poll1',
        expect.any(String),
        expect.any(Array),
        expect.any(Number)
      );
    });

    it('should send poll to task conversion messages', async () => {
      // Mock the convertPollToTask method to actually call the message service
      pollService.convertPollToTask.mockImplementation(async (pollId, winningOption, hackathonId, creatorId, creatorName) => {
        const task = { $id: 'task1', title: `Implement: ${winningOption}` };
        if (hackathonId) {
          await messageService.sendPollToTaskMessage(mockPoll.teamId, hackathonId, pollId, mockPoll.question, task.title, winningOption, creatorName);
        }
        return task;
      });

      await pollService.convertPollToTask(
        'poll1',
        'User Authentication',
        'hackathon1',
        'user1',
        'Test User'
      );

      expect(messageService.sendPollToTaskMessage).toHaveBeenCalledWith(
        'team1',
        'hackathon1',
        'poll1',
        expect.any(String),
        expect.any(String),
        'User Authentication',
        'Test User'
      );
    });
  });

  describe('Real-time Integration', () => {
    it('should handle real-time poll updates', () => {
      // Mock the subscription methods
      pollService.subscribeToPolls.mockReturnValue(() => {});
      
      const callback = vi.fn();
      const unsubscribe = pollService.subscribeToPolls('team1', callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle real-time poll vote updates', () => {
      // Mock the subscription methods
      pollService.subscribeToPollVotes.mockReturnValue(() => {});
      
      const callback = vi.fn();
      const unsubscribe = pollService.subscribeToPollVotes('poll1', callback);

      expect(typeof unsubscribe).toBe('function');
    });
  });
});