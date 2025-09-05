/**
 * @fileoverview Comprehensive Integration Tests for HackerDen Enhancement Features
 * Tests integration between enhancement features and existing MVP systems
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import services
import { fileService } from '../services/fileService';
import { ideaService } from '../services/ideaService';
import { gamificationService } from '../services/gamificationService';
import pollService from '../services/pollService';
import submissionService from '../services/submissionService';
import { botService } from '../services/botService';
import { reactionService } from '../services/reactionService';
import { taskService } from '../services/taskService';
import { messageService } from '../services/messageService';

// Import components
import FileLibrary from '../components/FileLibrary';
import IdeaBoard from '../components/IdeaBoard';
import Leaderboard from '../components/Leaderboard';
import PollDisplay from '../components/PollDisplay';
import SubmissionBuilder from '../components/SubmissionBuilder';
import ReactionPicker from '../components/ReactionPicker';
import { ConfettiEffect } from '../components/CelebrationEffects';

// Mock Appwrite
vi.mock('../lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn(),
    listDocuments: vi.fn(),
    deleteDocument: vi.fn()
  },
  storage: {
    createFile: vi.fn(),
    getFilePreview: vi.fn(),
    deleteFile: vi.fn(),
    getFileDownload: vi.fn(),
    getFileView: vi.fn()
  },
  client: {
    subscribe: vi.fn(),
    call: vi.fn()
  },
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    TASKS: 'tasks',
    MESSAGES: 'messages',
    FILES: 'files',
    FILE_ANNOTATIONS: 'file_annotations',
    IDEAS: 'ideas',
    IDEA_VOTES: 'idea_votes',
    USER_POINTS: 'user_points',
    ACHIEVEMENTS: 'achievements',
    SUBMISSIONS: 'submissions',
    POLLS: 'polls',
    POLL_VOTES: 'poll_votes',
    REACTIONS: 'reactions'
  },
  STORAGE_BUCKETS: {
    TEAM_FILES: 'team-files',
    CUSTOM_EMOJI: 'custom-emoji'
  },
  Query: {
    equal: vi.fn(),
    contains: vi.fn(),
    orderDesc: vi.fn(),
    orderAsc: vi.fn(),
    limit: vi.fn()
  },
  ID: {
    unique: vi.fn(() => 'test-id-' + Math.random().toString(36).substr(2, 9))
  }
}));

// Mock contexts
const mockUser = {
  $id: 'user-1',
  name: 'Test User',
  email: 'test@example.com'
};

const mockTeam = {
  $id: 'team-1',
  name: 'Test Team',
  hackathonId: 'hackathon-1',
  userRole: 'owner'
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

// Mock notification system
const mockNotifications = {
  addNotification: vi.fn(),
  removeNotification: vi.fn()
};

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: () => mockNotifications
}));

describe('Enhancement Feature Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File Sharing Integration with MVP', () => {
    it('should integrate file uploads with task system', async () => {
      const { databases, storage } = await import('../lib/appwrite');
      
      // Mock file upload
      storage.createFile.mockResolvedValue({
        $id: 'storage-file-1'
      });

      storage.getFilePreview.mockReturnValue({
        href: 'https://preview-url.com/file.jpg'
      });

      databases.createDocument.mockResolvedValue({
        $id: 'file-1',
        fileName: 'test.jpg',
        storageId: 'storage-file-1',
        teamId: 'team-1',
        uploadedBy: 'user-1'
      });

      // Mock task update
      databases.getDocument.mockResolvedValue({
        $id: 'task-1',
        title: 'Test Task',
        attachedFiles: []
      });

      databases.updateDocument.mockResolvedValue({
        $id: 'task-1',
        title: 'Test Task',
        attachedFiles: ['file-1']
      });

      // Upload file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadedFile = await fileService.uploadFile(
        'team-1',
        file,
        'user-1',
        'hackathon-1',
        'Test User'
      );

      // Attach to task
      const updatedTask = await taskService.attachFilesToTask(
        'task-1',
        [uploadedFile.$id],
        'team-1',
        'hackathon-1',
        'user-1',
        'Test User'
      );

      expect(storage.createFile).toHaveBeenCalled();
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'files',
        expect.any(String),
        expect.objectContaining({
          fileName: 'test.jpg',
          teamId: 'team-1'
        })
      );
      expect(updatedTask.attachedFiles).toContain('file-1');
    });

    it('should send chat notifications for file uploads', async () => {
      const { databases, storage } = await import('../lib/appwrite');
      
      storage.createFile.mockResolvedValue({ $id: 'storage-file-1' });
      storage.getFilePreview.mockReturnValue({ href: 'https://preview.com/file.jpg' });
      
      databases.createDocument.mockResolvedValue({
        $id: 'file-1',
        fileName: 'design.pdf',
        teamId: 'team-1'
      });

      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage');

      const file = new File(['test'], 'design.pdf', { type: 'application/pdf' });
      await fileService.uploadFile('team-1', file, 'user-1', 'hackathon-1', 'Test User');

      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        'team-1',
        expect.stringContaining('Test User uploaded a file: design.pdf'),
        'file_upload',
        expect.any(Object)
      );
    });

    it('should award gamification points for file uploads', async () => {
      const { databases, storage } = await import('../lib/appwrite');
      
      storage.createFile.mockResolvedValue({ $id: 'storage-file-1' });
      storage.getFilePreview.mockReturnValue({ href: 'https://preview.com/file.jpg' });
      
      databases.createDocument.mockResolvedValue({
        $id: 'file-1',
        fileName: 'screenshot.png',
        teamId: 'team-1'
      });

      const awardPointsSpy = vi.spyOn(gamificationService, 'awardPoints');

      const file = new File(['test'], 'screenshot.png', { type: 'image/png' });
      await fileService.uploadFile('team-1', file, 'user-1', 'hackathon-1', 'Test User');

      expect(awardPointsSpy).toHaveBeenCalledWith(
        'user-1',
        'team-1',
        'file_upload',
        null,
        'hackathon-1',
        'Test User'
      );
    });
  });

  describe('Idea Management Integration with MVP', () => {
    it('should convert ideas to tasks in existing task system', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock idea
      databases.getDocument.mockResolvedValue({
        $id: 'idea-1',
        title: 'Great Feature Idea',
        description: 'This would be amazing',
        tags: ['frontend', 'ui']
      });

      // Mock task creation
      databases.createDocument.mockResolvedValue({
        $id: 'task-1',
        title: 'Great Feature Idea',
        description: 'Converted from idea: This would be amazing',
        labels: ['frontend', 'ui', 'idea-conversion'],
        status: 'todo'
      });

      // Mock idea status update
      databases.updateDocument.mockResolvedValue({
        $id: 'idea-1',
        status: 'in_progress'
      });

      const task = await taskService.createTaskFromIdea(
        'idea-1',
        'team-1',
        'hackathon-1',
        'user-1',
        'user-2',
        'Creator',
        'Assignee'
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'tasks',
        expect.any(String),
        expect.objectContaining({
          title: 'Great Feature Idea',
          labels: ['frontend', 'ui', 'idea-conversion']
        })
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-db',
        'ideas',
        'idea-1',
        { status: 'in_progress' }
      );

      expect(task.labels).toContain('idea-conversion');
    });

    it('should send chat notifications for idea activities', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValue({
        $id: 'idea-1',
        title: 'New Feature',
        teamId: 'team-1'
      });

      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage');

      await ideaService.createIdea('team-1', {
        title: 'New Feature',
        description: 'Great idea',
        tags: ['feature']
      }, 'user-1', 'hackathon-1', 'Test User');

      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        'team-1',
        expect.stringContaining('Test User submitted a new idea: New Feature'),
        'idea_submission',
        expect.any(Object)
      );
    });

    it('should award points for idea submissions and votes', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValue({
        $id: 'idea-1',
        title: 'Test Idea',
        teamId: 'team-1'
      });

      const awardPointsSpy = vi.spyOn(gamificationService, 'awardPoints');

      await ideaService.createIdea('team-1', {
        title: 'Test Idea',
        description: 'Test',
        tags: []
      }, 'user-1', 'hackathon-1', 'Test User');

      expect(awardPointsSpy).toHaveBeenCalledWith(
        'user-1',
        'team-1',
        'idea_submission',
        null,
        'hackathon-1',
        'Test User'
      );
    });
  });

  describe('Gamification Integration with MVP', () => {
    it('should award points for existing MVP task completion', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock existing user points
      databases.listDocuments.mockResolvedValue({
        documents: [{
          $id: 'points-1',
          userId: 'user-1',
          teamId: 'team-1',
          totalPoints: 50,
          pointsBreakdown: JSON.stringify({
            tasksCompleted: 3,
            messagesPosted: 20,
            filesUploaded: 2,
            ideasSubmitted: 1,
            votesGiven: 5
          })
        }]
      });

      // Mock points update
      databases.updateDocument.mockResolvedValue({
        $id: 'points-1',
        totalPoints: 60,
        pointsBreakdown: JSON.stringify({
          tasksCompleted: 4,
          messagesPosted: 20,
          filesUploaded: 2,
          ideasSubmitted: 1,
          votesGiven: 5
        })
      });

      const result = await gamificationService.awardPoints(
        'user-1',
        'team-1',
        'task_completion',
        null,
        'hackathon-1',
        'Test User'
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-db',
        'user_points',
        'points-1',
        expect.objectContaining({
          totalPoints: 60
        })
      );

      expect(result.totalPoints).toBe(60);
    });

    it('should trigger celebrations for task completion', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.listDocuments.mockResolvedValue({
        documents: [{
          $id: 'points-1',
          userId: 'user-1',
          totalPoints: 100
        }]
      });

      const triggerCelebrationSpy = vi.spyOn(gamificationService, 'triggerCelebration');

      await gamificationService.awardPoints(
        'user-1',
        'team-1',
        'task_completion',
        { taskTitle: 'Important Task' },
        'hackathon-1',
        'Test User'
      );

      expect(triggerCelebrationSpy).toHaveBeenCalledWith(
        'task_completion',
        expect.objectContaining({
          taskTitle: 'Important Task'
        })
      );
    });

    it('should send achievement notifications to chat', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValue({
        $id: 'achievement-1',
        achievementName: 'Task Master',
        description: 'Completed 10 tasks'
      });

      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage');

      await gamificationService.unlockAchievement(
        'user-1',
        'team-1',
        'task_master',
        'hackathon-1',
        'Test User'
      );

      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        'team-1',
        expect.stringContaining('Test User unlocked the "Task Master" achievement'),
        'achievement_unlock',
        expect.any(Object)
      );
    });
  });

  describe('Polling Integration with MVP', () => {
    it('should create tasks from poll results', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock poll
      databases.getDocument.mockResolvedValue({
        $id: 'poll-1',
        question: 'Which feature to implement?',
        options: ['Feature A', 'Feature B'],
        teamId: 'team-1'
      });

      // Mock task creation
      databases.createDocument.mockResolvedValue({
        $id: 'task-1',
        title: 'Implement: Feature A',
        description: 'Based on team poll decision',
        labels: ['poll-decision']
      });

      const task = await taskService.createTaskFromPoll(
        'poll-1',
        'Feature A',
        'team-1',
        'hackathon-1',
        'user-1',
        'Test User'
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'tasks',
        expect.any(String),
        expect.objectContaining({
          title: 'Implement: Feature A',
          labels: ['poll-decision']
        })
      );

      expect(task.labels).toContain('poll-decision');
    });

    it('should post poll results to chat', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.updateDocument.mockResolvedValue({
        $id: 'poll-1',
        isActive: false
      });

      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage');

      await pollService.closePoll('poll-1', 'user-1', 'hackathon-1', 'Test User');

      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Poll closed'),
        'poll_closed',
        expect.any(Object)
      );
    });
  });

  describe('Submission System Integration', () => {
    it('should aggregate data from all MVP and enhancement systems', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock team data
      databases.getDocument.mockResolvedValueOnce({
        $id: 'team-1',
        name: 'Test Team',
        hackathonId: 'hackathon-1'
      });

      // Mock team members
      databases.listDocuments.mockResolvedValueOnce({
        documents: [
          { userId: 'user-1', userName: 'User One', role: 'owner' },
          { userId: 'user-2', userName: 'User Two', role: 'member' }
        ]
      });

      // Mock tasks
      databases.listDocuments.mockResolvedValueOnce({
        documents: [
          { $id: 'task-1', status: 'completed', labels: ['idea-conversion'], attachedFiles: ['file-1'] },
          { $id: 'task-2', status: 'todo', labels: ['poll-decision'], attachedFiles: [] },
          { $id: 'task-3', status: 'completed', labels: [], attachedFiles: ['file-2'] }
        ]
      });

      // Mock files
      databases.listDocuments.mockResolvedValueOnce({
        documents: [
          { $id: 'file-1', fileName: 'design.pdf' },
          { $id: 'file-2', fileName: 'screenshot.png' }
        ]
      });

      // Mock ideas
      databases.listDocuments.mockResolvedValueOnce({
        documents: [
          { $id: 'idea-1', status: 'approved' },
          { $id: 'idea-2', status: 'submitted' }
        ]
      });

      // Mock polls
      databases.listDocuments.mockResolvedValueOnce({
        documents: [
          { $id: 'poll-1', question: 'Test poll 1' },
          { $id: 'poll-2', question: 'Test poll 2' }
        ]
      });

      const teamData = await submissionService.getTeamDataForSubmission('team-1');

      expect(teamData.teamName).toBe('Test Team');
      expect(teamData.members).toHaveLength(2);
      expect(teamData.progress.tasksCompleted).toBe(2);
      expect(teamData.progress.ideasImplemented).toBe(1);
      expect(teamData.progress.pollDecisionsImplemented).toBe(1);
      expect(teamData.progress.tasksWithAttachments).toBe(2);
      expect(teamData.collaboration.fileCollaboration).toBe(67); // 2/3 tasks have files
    });
  });

  describe('Bot System Integration', () => {
    it('should send contextual tips based on team activity', async () => {
      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage');

      await botService.sendContextualTip('team-1', 'low_task_completion', {
        completedTasks: 2,
        totalTasks: 10
      });

      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        'team-1',
        expect.stringContaining('productivity tip'),
        'bot_tip',
        expect.any(Object)
      );
    });

    it('should trigger team-wide effects for easter eggs', async () => {
      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage');

      await botService.triggerEasterEgg('/party', 'team-1', 'user-1', 'Test User');

      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        'team-1',
        expect.stringContaining('party time'),
        'easter_egg',
        expect.objectContaining({
          effect: 'confetti',
          triggeredBy: 'Test User'
        })
      );
    });
  });

  describe('Reaction System Integration', () => {
    it('should add reactions to existing messages', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValue({
        $id: 'reaction-1',
        targetId: 'message-1',
        targetType: 'message',
        userId: 'user-1',
        emoji: '👍'
      });

      const reaction = await reactionService.addReaction(
        'message-1',
        'message',
        'user-1',
        '👍',
        'team-1'
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'reactions',
        expect.any(String),
        expect.objectContaining({
          targetId: 'message-1',
          targetType: 'message',
          emoji: '👍'
        })
      );

      expect(reaction.emoji).toBe('👍');
    });

    it('should add reactions to existing tasks', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValue({
        $id: 'reaction-1',
        targetId: 'task-1',
        targetType: 'task',
        userId: 'user-1',
        emoji: '🎉'
      });

      const reaction = await reactionService.addReaction(
        'task-1',
        'task',
        'user-1',
        '🎉',
        'team-1'
      );

      expect(reaction.targetType).toBe('task');
      expect(reaction.emoji).toBe('🎉');
    });
  });

  describe('Cross-Feature Integration', () => {
    it('should handle file upload with idea attachment and gamification', async () => {
      const { databases, storage } = await import('../lib/appwrite');
      
      // Mock file upload
      storage.createFile.mockResolvedValue({ $id: 'storage-file-1' });
      storage.getFilePreview.mockReturnValue({ href: 'https://preview.com/file.jpg' });
      
      databases.createDocument.mockResolvedValueOnce({
        $id: 'file-1',
        fileName: 'mockup.jpg',
        teamId: 'team-1'
      });

      // Mock idea creation
      databases.createDocument.mockResolvedValueOnce({
        $id: 'idea-1',
        title: 'UI Improvement',
        attachedFiles: ['file-1']
      });

      const awardPointsSpy = vi.spyOn(gamificationService, 'awardPoints');
      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage');

      // Upload file
      const file = new File(['test'], 'mockup.jpg', { type: 'image/jpeg' });
      const uploadedFile = await fileService.uploadFile('team-1', file, 'user-1', 'hackathon-1', 'Test User');

      // Create idea with file
      await ideaService.createIdea('team-1', {
        title: 'UI Improvement',
        description: 'Based on mockup',
        tags: ['ui'],
        attachedFiles: [uploadedFile.$id]
      }, 'user-1', 'hackathon-1', 'Test User');

      // Verify file upload points
      expect(awardPointsSpy).toHaveBeenCalledWith(
        'user-1',
        'team-1',
        'file_upload',
        null,
        'hackathon-1',
        'Test User'
      );

      // Verify idea submission points
      expect(awardPointsSpy).toHaveBeenCalledWith(
        'user-1',
        'team-1',
        'idea_submission',
        null,
        'hackathon-1',
        'Test User'
      );

      // Verify chat notifications
      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        'team-1',
        expect.stringContaining('uploaded a file'),
        'file_upload',
        expect.any(Object)
      );

      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        'team-1',
        expect.stringContaining('submitted a new idea'),
        'idea_submission',
        expect.any(Object)
      );
    });

    it('should handle poll-to-task conversion with file attachment and celebration', async () => {
      const { databases } = await import('../lib/appwrite');
      
      // Mock poll
      databases.getDocument.mockResolvedValue({
        $id: 'poll-1',
        question: 'Implement feature X?',
        teamId: 'team-1'
      });

      // Mock task creation
      databases.createDocument.mockResolvedValue({
        $id: 'task-1',
        title: 'Implement: Feature X',
        labels: ['poll-decision']
      });

      const triggerCelebrationSpy = vi.spyOn(gamificationService, 'triggerCelebration');
      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage');

      const task = await taskService.createTaskFromPoll(
        'poll-1',
        'Feature X',
        'team-1',
        'hackathon-1',
        'user-1',
        'Test User'
      );

      expect(triggerCelebrationSpy).toHaveBeenCalledWith(
        'poll_to_task',
        expect.objectContaining({
          taskTitle: 'Implement: Feature X'
        })
      );

      expect(sendSystemMessageSpy).toHaveBeenCalledWith(
        'team-1',
        expect.stringContaining('created a task from poll decision'),
        'poll_to_task',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('should handle file upload failures gracefully', async () => {
      const { storage } = await import('../lib/appwrite');
      
      storage.createFile.mockRejectedValue(new Error('Storage quota exceeded'));

      const file = new File(['test'], 'large-file.jpg', { type: 'image/jpeg' });
      
      await expect(
        fileService.uploadFile('team-1', file, 'user-1', 'hackathon-1', 'Test User')
      ).rejects.toThrow('Storage quota exceeded');

      // Verify no points were awarded for failed upload
      const awardPointsSpy = vi.spyOn(gamificationService, 'awardPoints');
      expect(awardPointsSpy).not.toHaveBeenCalled();
    });

    it('should handle gamification service failures without breaking core functionality', async () => {
      const { databases } = await import('../lib/appwrite');
      
      databases.createDocument.mockResolvedValue({
        $id: 'idea-1',
        title: 'Test Idea'
      });

      // Mock gamification failure
      const awardPointsSpy = vi.spyOn(gamificationService, 'awardPoints')
        .mockRejectedValue(new Error('Gamification service unavailable'));

      // Idea creation should still work
      const idea = await ideaService.createIdea('team-1', {
        title: 'Test Idea',
        description: 'Test',
        tags: []
      }, 'user-1', 'hackathon-1', 'Test User');

      expect(idea.title).toBe('Test Idea');
      expect(awardPointsSpy).toHaveBeenCalled();
    });

    it('should handle bot service failures gracefully', async () => {
      const sendSystemMessageSpy = vi.spyOn(messageService, 'sendSystemMessage')
        .mockRejectedValue(new Error('Message service unavailable'));

      // Bot tip should fail silently
      await expect(
        botService.sendContextualTip('team-1', 'low_activity', {})
      ).resolves.not.toThrow();

      expect(sendSystemMessageSpy).toHaveBeenCalled();
    });
  });
});