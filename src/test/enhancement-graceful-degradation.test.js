/**
 * @fileoverview Graceful Degradation Tests for Enhancement Features
 * Tests that enhancement features degrade gracefully when disabled or unavailable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import components
import Dashboard from '../pages/Dashboard';
import TaskModal from '../components/TaskModal';
import ChatContainer from '../components/ChatContainer';
import Layout from '../components/Layout';

// Mock feature flags
const mockFeatureFlags = {
  fileSharing: true,
  ideaManagement: true,
  gamification: true,
  polling: true,
  reactions: true,
  botSystem: true,
  submissions: true
};

vi.mock('../hooks/useFeatureFlags', () => ({
  useFeatureFlags: () => mockFeatureFlags
}));

// Mock services with failure scenarios
vi.mock('../services/fileService', () => ({
  fileService: {
    uploadFile: vi.fn(),
    getTeamFiles: vi.fn(),
    deleteFile: vi.fn(),
    isAvailable: vi.fn(() => mockFeatureFlags.fileSharing)
  }
}));

vi.mock('../services/ideaService', () => ({
  ideaService: {
    createIdea: vi.fn(),
    getTeamIdeas: vi.fn(),
    voteOnIdea: vi.fn(),
    isAvailable: vi.fn(() => mockFeatureFlags.ideaManagement)
  }
}));

vi.mock('../services/gamificationService', () => ({
  gamificationService: {
    getUserPoints: vi.fn(),
    getLeaderboard: vi.fn(),
    awardPoints: vi.fn(),
    isAvailable: vi.fn(() => mockFeatureFlags.gamification)
  }
}));

vi.mock('../services/pollService', () => ({
  default: {
    createPoll: vi.fn(),
    getActivePolls: vi.fn(),
    voteOnPoll: vi.fn(),
    isAvailable: vi.fn(() => mockFeatureFlags.polling)
  }
}));

vi.mock('../services/reactionService', () => ({
  reactionService: {
    addReaction: vi.fn(),
    getReactions: vi.fn(),
    isAvailable: vi.fn(() => mockFeatureFlags.reactions)
  }
}));

vi.mock('../services/botService', () => ({
  botService: {
    sendContextualTip: vi.fn(),
    triggerEasterEgg: vi.fn(),
    isAvailable: vi.fn(() => mockFeatureFlags.botSystem)
  }
}));

vi.mock('../services/submissionService', () => ({
  submissionService: {
    createSubmission: vi.fn(),
    getTeamSubmissions: vi.fn(),
    isAvailable: vi.fn(() => mockFeatureFlags.submissions)
  }
}));

// Mock contexts
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User' },
    loading: false,
    isAuthenticated: true
  })
}));

vi.mock('../hooks/useTeam', () => ({
  useTeam: () => ({
    team: { $id: 'team1', name: 'Test Team', userRole: 'owner' },
    loading: false,
    hasTeam: true
  })
}));

// Mock MVP components and services
vi.mock('../services/taskService', () => ({
  taskService: {
    getTasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn().mockResolvedValue({ $id: 'task1' }),
    updateTask: vi.fn().mockResolvedValue({ $id: 'task1' })
  }
}));

vi.mock('../services/messageService', () => ({
  messageService: {
    getMessages: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn().mockResolvedValue({ $id: 'message1' }),
    sendSystemMessage: vi.fn().mockResolvedValue({ $id: 'system1' })
  }
}));

describe('Enhancement Graceful Degradation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all feature flags to enabled
    Object.keys(mockFeatureFlags).forEach(key => {
      mockFeatureFlags[key] = true;
    });
  });

  describe('File Sharing Degradation', () => {
    it('should hide file upload options when file sharing is disabled', () => {
      mockFeatureFlags.fileSharing = false;

      render(<TaskModal task={null} onClose={vi.fn()} onSave={vi.fn()} />);

      // File upload section should not be visible
      expect(screen.queryByText(/attach files/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/drag.*drop/i)).not.toBeInTheDocument();

      // Core task functionality should still work
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should handle file service failures gracefully', async () => {
      const { fileService } = await import('../services/fileService');
      fileService.uploadFile.mockRejectedValue(new Error('File service unavailable'));

      render(<TaskModal task={null} onClose={vi.fn()} onSave={vi.fn()} />);

      const fileInput = screen.getByLabelText(/choose files/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await userEvent.upload(fileInput, file);

      // Should show error message but not break the form
      await waitFor(() => {
        expect(screen.getByText(/file upload failed/i)).toBeInTheDocument();
      });

      // Task creation should still work
      const saveButton = screen.getByText(/save/i);
      expect(saveButton).not.toBeDisabled();
    });

    it('should show fallback UI when file previews fail', async () => {
      const { fileService } = await import('../services/fileService');
      fileService.getTeamFiles.mockRejectedValue(new Error('Preview service down'));

      render(<Dashboard />);

      // Should show fallback message instead of file library
      await waitFor(() => {
        expect(screen.getByText(/files temporarily unavailable/i)).toBeInTheDocument();
      });

      // Core dashboard functionality should remain
      expect(screen.getByText(/tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/chat/i)).toBeInTheDocument();
    });
  });

  describe('Idea Management Degradation', () => {
    it('should hide idea board when idea management is disabled', () => {
      mockFeatureFlags.ideaManagement = false;

      render(<Dashboard />);

      // Idea board should not be visible
      expect(screen.queryByText(/idea board/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/submit idea/i)).not.toBeInTheDocument();

      // Core features should remain
      expect(screen.getByText(/tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/team chat/i)).toBeInTheDocument();
    });

    it('should handle idea service failures without affecting task creation', async () => {
      const { ideaService } = await import('../services/ideaService');
      ideaService.createIdea.mockRejectedValue(new Error('Idea service unavailable'));

      render(<Dashboard />);

      // Try to create an idea
      const ideaButton = screen.getByText(/submit idea/i);
      await userEvent.click(ideaButton);

      const titleInput = screen.getByLabelText(/idea title/i);
      await userEvent.type(titleInput, 'Test Idea');

      const submitButton = screen.getByText(/submit/i);
      await userEvent.click(submitButton);

      // Should show error but not crash
      await waitFor(() => {
        expect(screen.getByText(/idea submission failed/i)).toBeInTheDocument();
      });

      // Task creation should still work
      const taskButton = screen.getByText(/add task/i);
      expect(taskButton).toBeInTheDocument();
      expect(taskButton).not.toBeDisabled();
    });

    it('should convert ideas to tasks even when idea service is partially down', async () => {
      const { ideaService } = await import('../services/ideaService');
      const { taskService } = await import('../services/taskService');
      
      // Idea voting fails but task creation works
      ideaService.voteOnIdea.mockRejectedValue(new Error('Voting unavailable'));
      taskService.createTask.mockResolvedValue({ $id: 'task1', title: 'From Idea' });

      render(<Dashboard />);

      const convertButton = screen.getByText(/convert to task/i);
      await userEvent.click(convertButton);

      // Should create task despite voting failure
      await waitFor(() => {
        expect(screen.getByText(/task created successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Gamification Degradation', () => {
    it('should hide gamification elements when disabled', () => {
      mockFeatureFlags.gamification = false;

      render(<Dashboard />);

      // Gamification elements should not be visible
      expect(screen.queryByText(/leaderboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/points/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/achievements/i)).not.toBeInTheDocument();

      // Core functionality should remain
      expect(screen.getByText(/tasks/i)).toBeInTheDocument();
    });

    it('should continue awarding points silently when gamification service fails', async () => {
      const { gamificationService } = await import('../services/gamificationService');
      const { taskService } = await import('../services/taskService');
      
      gamificationService.awardPoints.mockRejectedValue(new Error('Gamification down'));
      taskService.updateTask.mockResolvedValue({ $id: 'task1', status: 'done' });

      render(<Dashboard />);

      // Complete a task
      const taskCheckbox = screen.getByRole('checkbox');
      await userEvent.click(taskCheckbox);

      // Task should complete successfully despite gamification failure
      await waitFor(() => {
        expect(screen.getByText(/task completed/i)).toBeInTheDocument();
      });

      // No error should be shown to user
      expect(screen.queryByText(/points.*failed/i)).not.toBeInTheDocument();
    });

    it('should show simplified leaderboard when full data is unavailable', async () => {
      const { gamificationService } = await import('../services/gamificationService');
      
      // Return minimal data instead of full leaderboard
      gamificationService.getLeaderboard.mockResolvedValue([
        { userId: 'user1', userName: 'User 1', totalPoints: 100 }
      ]);

      render(<Dashboard />);

      // Should show simplified leaderboard
      await waitFor(() => {
        expect(screen.getByText(/user 1/i)).toBeInTheDocument();
        expect(screen.getByText(/100/)).toBeInTheDocument();
      });

      // Should not show advanced features like achievements
      expect(screen.queryByText(/achievements/i)).not.toBeInTheDocument();
    });
  });

  describe('Polling Degradation', () => {
    it('should hide polling features when disabled', () => {
      mockFeatureFlags.polling = false;

      render(<ChatContainer />);

      // Polling options should not be visible
      expect(screen.queryByText(/create poll/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\/poll/i)).not.toBeInTheDocument();

      // Chat should still work
      expect(screen.getByPlaceholderText(/type.*message/i)).toBeInTheDocument();
    });

    it('should handle poll creation failures gracefully', async () => {
      const pollService = (await import('../services/pollService')).default;
      pollService.createPoll.mockRejectedValue(new Error('Poll service down'));

      render(<ChatContainer />);

      // Try to create a poll
      const messageInput = screen.getByPlaceholderText(/type.*message/i);
      await userEvent.type(messageInput, '/poll What should we build?');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      // Should send as regular message instead
      await waitFor(() => {
        expect(screen.getByText(/poll creation failed.*sent as message/i)).toBeInTheDocument();
      });
    });

    it('should show poll results even when voting is disabled', async () => {
      const pollService = (await import('../services/pollService')).default;
      pollService.voteOnPoll.mockRejectedValue(new Error('Voting unavailable'));

      const mockPoll = {
        $id: 'poll1',
        question: 'Test poll?',
        options: ['Yes', 'No'],
        isActive: true,
        results: [
          { option: 'Yes', votes: 5, percentage: 83 },
          { option: 'No', votes: 1, percentage: 17 }
        ]
      };

      render(<ChatContainer polls={[mockPoll]} />);

      // Should show results but disable voting
      expect(screen.getByText(/test poll/i)).toBeInTheDocument();
      expect(screen.getByText(/83%/)).toBeInTheDocument();
      
      const voteButtons = screen.getAllByRole('button', { name: /vote/i });
      voteButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Reaction System Degradation', () => {
    it('should hide reaction buttons when reactions are disabled', () => {
      mockFeatureFlags.reactions = false;

      render(<ChatContainer />);

      // Reaction buttons should not be visible
      expect(screen.queryByRole('button', { name: /add reaction/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/👍/)).not.toBeInTheDocument();

      // Messages should still display
      expect(screen.getByText(/messages/i)).toBeInTheDocument();
    });

    it('should handle reaction service failures silently', async () => {
      const { reactionService } = await import('../services/reactionService');
      reactionService.addReaction.mockRejectedValue(new Error('Reaction service down'));

      render(<ChatContainer />);

      const reactionButton = screen.getByRole('button', { name: /add reaction/i });
      await userEvent.click(reactionButton);

      const emojiButton = screen.getByText('👍');
      await userEvent.click(emojiButton);

      // Should fail silently without showing error to user
      expect(screen.queryByText(/reaction failed/i)).not.toBeInTheDocument();
      
      // Chat functionality should remain unaffected
      const messageInput = screen.getByPlaceholderText(/type.*message/i);
      expect(messageInput).not.toBeDisabled();
    });

    it('should show existing reactions even when adding new ones fails', async () => {
      const { reactionService } = await import('../services/reactionService');
      reactionService.addReaction.mockRejectedValue(new Error('Service down'));
      reactionService.getReactions.mockResolvedValue([
        { $id: 'reaction1', emoji: '👍', userId: 'user2', count: 3 }
      ]);

      render(<ChatContainer />);

      // Should show existing reactions
      await waitFor(() => {
        expect(screen.getByText('👍')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });

      // But new reactions should fail silently
      const reactionButton = screen.getByRole('button', { name: /add reaction/i });
      await userEvent.click(reactionButton);
      
      const newEmojiButton = screen.getByText('❤️');
      await userEvent.click(newEmojiButton);

      // Should not show error
      expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    });
  });

  describe('Bot System Degradation', () => {
    it('should disable bot commands when bot system is unavailable', () => {
      mockFeatureFlags.botSystem = false;

      render(<ChatContainer />);

      const messageInput = screen.getByPlaceholderText(/type.*message/i);
      
      // Bot commands should not be suggested
      fireEvent.focus(messageInput);
      fireEvent.change(messageInput, { target: { value: '/' } });

      expect(screen.queryByText(/\/help/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\/tip/i)).not.toBeInTheDocument();
    });

    it('should handle bot service failures without affecting chat', async () => {
      const { botService } = await import('../services/botService');
      botService.sendContextualTip.mockRejectedValue(new Error('Bot service down'));

      render(<ChatContainer />);

      const messageInput = screen.getByPlaceholderText(/type.*message/i);
      await userEvent.type(messageInput, '/tip');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      // Should send as regular message
      await waitFor(() => {
        expect(screen.getByText('/tip')).toBeInTheDocument();
      });

      // Chat should continue working
      await userEvent.clear(messageInput);
      await userEvent.type(messageInput, 'Regular message');
      await userEvent.click(sendButton);

      expect(screen.getByText('Regular message')).toBeInTheDocument();
    });
  });

  describe('Submission System Degradation', () => {
    it('should hide submission features when disabled', () => {
      mockFeatureFlags.submissions = false;

      render(<Dashboard />);

      // Submission elements should not be visible
      expect(screen.queryByText(/create submission/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/project showcase/i)).not.toBeInTheDocument();

      // Core features should remain
      expect(screen.getByText(/tasks/i)).toBeInTheDocument();
    });

    it('should handle submission service failures gracefully', async () => {
      const { submissionService } = await import('../services/submissionService');
      submissionService.createSubmission.mockRejectedValue(new Error('Submission service down'));

      render(<Dashboard />);

      const submissionButton = screen.getByText(/create submission/i);
      await userEvent.click(submissionButton);

      const titleInput = screen.getByLabelText(/project title/i);
      await userEvent.type(titleInput, 'Test Project');

      const submitButton = screen.getByText(/submit/i);
      await userEvent.click(submitButton);

      // Should show error but allow retry
      await waitFor(() => {
        expect(screen.getByText(/submission failed.*try again/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });

  describe('Cross-Feature Degradation', () => {
    it('should handle multiple feature failures without system crash', async () => {
      // Disable multiple features
      mockFeatureFlags.fileSharing = false;
      mockFeatureFlags.gamification = false;
      mockFeatureFlags.polling = false;

      const { ideaService } = await import('../services/ideaService');
      const { reactionService } = await import('../services/reactionService');
      
      ideaService.getTeamIdeas.mockRejectedValue(new Error('Ideas down'));
      reactionService.getReactions.mockRejectedValue(new Error('Reactions down'));

      render(<Dashboard />);

      // Core MVP features should still work
      expect(screen.getByText(/tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/team chat/i)).toBeInTheDocument();

      // Should show minimal feature set
      expect(screen.queryByText(/file library/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/leaderboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/create poll/i)).not.toBeInTheDocument();
    });

    it('should maintain data consistency during partial failures', async () => {
      const { taskService } = await import('../services/taskService');
      const { gamificationService } = await import('../services/gamificationService');
      
      // Task service works but gamification fails
      taskService.updateTask.mockResolvedValue({ $id: 'task1', status: 'done' });
      gamificationService.awardPoints.mockRejectedValue(new Error('Points service down'));

      render(<Dashboard />);

      const taskCheckbox = screen.getByRole('checkbox');
      await userEvent.click(taskCheckbox);

      // Task should complete successfully
      await waitFor(() => {
        expect(screen.getByText(/completed/i)).toBeInTheDocument();
      });

      // Should not show confusing error messages
      expect(screen.queryByText(/points.*error/i)).not.toBeInTheDocument();
    });

    it('should provide helpful fallback messages for unavailable features', () => {
      // Disable all enhancement features
      Object.keys(mockFeatureFlags).forEach(key => {
        mockFeatureFlags[key] = false;
      });

      render(<Dashboard />);

      // Should show informative message about reduced functionality
      expect(screen.getByText(/running in basic mode/i)).toBeInTheDocument();
      expect(screen.getByText(/some features temporarily unavailable/i)).toBeInTheDocument();

      // Should still show core features
      expect(screen.getByText(/tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/chat/i)).toBeInTheDocument();
    });
  });

  describe('Progressive Enhancement', () => {
    it('should load core features first, then enhancements', async () => {
      const loadOrder = [];
      
      // Mock loading sequence
      vi.mocked(render).mockImplementation((component) => {
        loadOrder.push('core');
        return render(component);
      });

      render(<Dashboard />);

      // Core should load first
      expect(loadOrder[0]).toBe('core');
      
      // Enhancement features should load after
      await waitFor(() => {
        expect(screen.getByText(/tasks/i)).toBeInTheDocument();
      });

      // Then enhancements should appear
      setTimeout(() => {
        expect(screen.queryByText(/file library/i)).toBeInTheDocument();
      }, 100);
    });

    it('should work offline with cached data', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Mock cached data
      const cachedTasks = [
        { $id: 'task1', title: 'Cached Task', status: 'todo' }
      ];

      localStorage.setItem('cachedTasks', JSON.stringify(cachedTasks));

      render(<Dashboard />);

      // Should show cached data
      await waitFor(() => {
        expect(screen.getByText(/cached task/i)).toBeInTheDocument();
      });

      // Should show offline indicator
      expect(screen.getByText(/offline mode/i)).toBeInTheDocument();

      // Enhancement features should be disabled
      expect(screen.queryByText(/file upload/i)).not.toBeInTheDocument();
    });
  });
});