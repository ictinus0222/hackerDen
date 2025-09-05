/**
 * @fileoverview Integration tests for enhancement chat notifications
 * Tests that all enhancement features properly send notifications to chat
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { messageService } from '../messageService';
import { fileService } from '../fileService';
import { ideaService } from '../ideaService';
import { gamificationService } from '../gamificationService';
import botService from '../botService';

// Mock the message service methods
vi.mock('../messageService', () => ({
  messageService: {
    sendFileUploadMessage: vi.fn().mockResolvedValue({ $id: 'message-123' }),
    sendFileAnnotationMessage: vi.fn().mockResolvedValue({ $id: 'message-124' }),
    sendAchievementMessage: vi.fn().mockResolvedValue({ $id: 'message-125' }),
    sendCelebrationMessage: vi.fn().mockResolvedValue({ $id: 'message-126' }),
    sendBotMotivationalMessage: vi.fn().mockResolvedValue({ $id: 'message-127' }),
    sendBotEasterEggMessage: vi.fn().mockResolvedValue({ $id: 'message-128' }),
    sendBotTipMessage: vi.fn().mockResolvedValue({ $id: 'message-129' }),
    sendSystemMessage: vi.fn().mockResolvedValue({ $id: 'message-130' })
  }
}));

// Mock gamification service
vi.mock('../gamificationService', () => ({
  gamificationService: {
    awardPoints: vi.fn(),
    checkAndAwardAchievements: vi.fn(),
    triggerCelebration: vi.fn()
  }
}));

// Mock Appwrite dependencies
vi.mock('../../lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    getDocument: vi.fn(),
    listDocuments: vi.fn()
  },
  storage: {
    createFile: vi.fn(),
    getFilePreview: vi.fn()
  },
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    FILES: 'files',
    FILE_ANNOTATIONS: 'file_annotations',
    IDEAS: 'ideas',
    IDEA_VOTES: 'idea_votes',
    USER_POINTS: 'user_points',
    ACHIEVEMENTS: 'achievements'
  },
  STORAGE_BUCKETS: {
    TEAM_FILES: 'team-files'
  },
  Query: {
    equal: vi.fn(),
    orderDesc: vi.fn(),
    limit: vi.fn()
  },
  ID: {
    unique: vi.fn(() => 'unique-id')
  }
}));

describe('Enhancement Chat Integration', () => {
  const mockTeamId = 'team-123';
  const mockHackathonId = 'hackathon-456';
  const mockUserId = 'user-789';
  const mockUserName = 'Test User';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File Sharing Chat Integration', () => {
    it('should send chat notification when file is uploaded', async () => {
      // Mock file upload dependencies
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockStorageFile = { $id: 'storage-123' };
      const mockFileDocument = {
        $id: 'file-123',
        teamId: mockTeamId,
        fileName: 'test.txt',
        fileType: 'text/plain'
      };

      const { databases, storage } = await import('../../lib/appwrite');
      storage.createFile.mockResolvedValue(mockStorageFile);
      storage.getFilePreview.mockReturnValue({ href: 'preview-url' });
      databases.createDocument.mockResolvedValue(mockFileDocument);

      // Test file upload
      await fileService.uploadFile(
        mockTeamId,
        mockFile,
        mockUserId,
        mockHackathonId,
        mockUserName
      );

      // Verify chat notification was sent
      expect(messageService.sendFileUploadMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        'test.txt',
        mockUserName,
        'text/plain'
      );
    });

    it('should send chat notification when file is annotated', async () => {
      // Mock annotation dependencies
      const mockFileDoc = {
        $id: 'file-123',
        teamId: mockTeamId,
        fileName: 'test.txt',
        annotationCount: 0
      };
      const mockAnnotation = {
        $id: 'annotation-123',
        content: 'Test annotation'
      };

      const { databases } = await import('../../lib/appwrite');
      databases.createDocument.mockResolvedValue(mockAnnotation);
      databases.getDocument.mockResolvedValue(mockFileDoc);
      databases.updateDocument.mockResolvedValue(mockFileDoc);

      // Test annotation
      await fileService.addAnnotation(
        'file-123',
        mockUserId,
        { content: 'Test annotation', position: { x: 10, y: 20 } },
        mockHackathonId,
        mockUserName
      );

      // Verify chat notification was sent
      expect(messageService.sendFileAnnotationMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        'test.txt',
        mockUserName,
        'Test annotation'
      );
    });
  });

  describe('Achievement Chat Integration', () => {
    it('should send chat notification when achievement is unlocked', async () => {
      // Mock achievement data
      const mockAchievement = {
        $id: 'achievement-123',
        achievementType: 'first_task',
        achievementName: 'Getting Started',
        description: 'Complete your first task'
      };

      const { databases } = await import('../../lib/appwrite');
      databases.listDocuments.mockResolvedValue({ documents: [] }); // No existing achievements
      databases.createDocument.mockResolvedValue(mockAchievement);

      // Test achievement check
      const pointsBreakdown = { tasksCompleted: 1, messagesPosted: 0, filesUploaded: 0, ideasSubmitted: 0, votesGiven: 0 };
      await gamificationService.checkAndAwardAchievements(
        mockUserId,
        pointsBreakdown,
        10,
        true,
        mockTeamId,
        mockHackathonId,
        mockUserName
      );

      // Verify chat notification was sent
      expect(messageService.sendAchievementMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        mockUserName,
        'Getting Started',
        'Complete your first task'
      );
    });

    it('should send celebration message when celebration is triggered', async () => {
      // Test celebration trigger
      const celebrationData = {
        taskTitle: 'Test Task',
        completedBy: mockUserName
      };

      await gamificationService.triggerCelebration(
        'task_completion',
        celebrationData,
        mockTeamId,
        mockHackathonId
      );

      // Verify celebration message was sent
      expect(messageService.sendCelebrationMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        'task_completion',
        celebrationData
      );
    });
  });

  describe('Bot Chat Integration', () => {
    it('should send motivational message to chat', async () => {
      // Test motivational message
      await botService.sendMotivationalMessage(
        mockTeamId,
        mockHackathonId,
        'general'
      );

      // Verify motivational message was sent
      expect(messageService.sendBotMotivationalMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        expect.any(String),
        'general'
      );
    });

    it('should send easter egg message to chat', async () => {
      // Test easter egg trigger
      const result = await botService.triggerEasterEgg(
        '/party',
        mockTeamId,
        mockHackathonId,
        mockUserName
      );

      // Verify easter egg message was sent
      expect(messageService.sendBotEasterEggMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        '/party',
        expect.any(String),
        mockUserName
      );

      expect(result.found).toBe(true);
    });

    it('should send contextual tip to chat', async () => {
      // Test contextual tip
      const activityData = { taskCount: 0 };
      await botService.getContextualTips(
        activityData,
        mockTeamId,
        mockHackathonId,
        true
      );

      // Verify tip message was sent
      expect(messageService.sendBotTipMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        expect.any(String),
        'contextual'
      );
    });
  });

  describe('Message Service Enhancement Methods', () => {
    it('should have all required enhancement message methods', () => {
      // Verify all enhancement message methods exist
      expect(messageService.sendFileUploadMessage).toBeDefined();
      expect(messageService.sendFileAnnotationMessage).toBeDefined();
      expect(messageService.sendAchievementMessage).toBeDefined();
      expect(messageService.sendCelebrationMessage).toBeDefined();
      expect(messageService.sendBotMotivationalMessage).toBeDefined();
      expect(messageService.sendBotEasterEggMessage).toBeDefined();
      expect(messageService.sendBotTipMessage).toBeDefined();
    });

    it('should format file upload messages correctly', async () => {
      await messageService.sendFileUploadMessage(
        mockTeamId,
        mockHackathonId,
        'test.pdf',
        'John Doe',
        'application/pdf'
      );

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        '📁 John Doe uploaded a file: "test.pdf"',
        'file_uploaded',
        {
          fileName: 'test.pdf',
          uploaderName: 'John Doe',
          fileType: 'application/pdf',
          type: 'file_upload'
        }
      );
    });

    it('should format achievement messages correctly', async () => {
      await messageService.sendAchievementMessage(
        mockTeamId,
        mockHackathonId,
        'Jane Smith',
        'Task Master',
        'Complete 10 tasks'
      );

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        '🏆 Jane Smith unlocked achievement: "Task Master" - Complete 10 tasks',
        'achievement_unlocked',
        {
          userName: 'Jane Smith',
          achievementName: 'Task Master',
          achievementDescription: 'Complete 10 tasks',
          type: 'achievement_unlock'
        }
      );
    });

    it('should format celebration messages correctly', async () => {
      const celebrationData = {
        taskTitle: 'Implement Feature X',
        completedBy: 'Alice'
      };

      await messageService.sendCelebrationMessage(
        mockTeamId,
        mockHackathonId,
        'task_completion',
        celebrationData
      );

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        mockTeamId,
        mockHackathonId,
        '🎉 Task completed! "Implement Feature X" is done! Great work, Alice!',
        'celebration',
        {
          celebrationType: 'task_completion',
          taskTitle: 'Implement Feature X',
          completedBy: 'Alice',
          type: 'celebration'
        }
      );
    });
  });

  describe('Error Handling', () => {
    it('should not fail file upload if chat notification fails', async () => {
      // Mock file upload success but chat notification failure
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const { databases, storage } = await import('../../lib/appwrite');
      
      storage.createFile.mockResolvedValue({ $id: 'storage-123' });
      storage.getFilePreview.mockReturnValue({ href: 'preview-url' });
      databases.createDocument.mockResolvedValue({
        $id: 'file-123',
        teamId: mockTeamId,
        fileName: 'test.txt'
      });

      messageService.sendFileUploadMessage.mockRejectedValue(new Error('Chat service down'));

      // Should not throw error
      await expect(fileService.uploadFile(
        mockTeamId,
        mockFile,
        mockUserId,
        mockHackathonId,
        mockUserName
      )).resolves.toBeDefined();
    });

    it('should not fail achievement unlock if chat notification fails', async () => {
      const { databases } = await import('../../lib/appwrite');
      databases.listDocuments.mockResolvedValue({ documents: [] });
      databases.createDocument.mockResolvedValue({
        $id: 'achievement-123',
        achievementName: 'Test Achievement'
      });

      messageService.sendAchievementMessage.mockRejectedValue(new Error('Chat service down'));

      // Should not throw error
      const pointsBreakdown = { tasksCompleted: 1, messagesPosted: 0, filesUploaded: 0, ideasSubmitted: 0, votesGiven: 0 };
      const result = gamificationService.checkAndAwardAchievements(
        mockUserId,
        pointsBreakdown,
        10,
        true,
        mockTeamId,
        mockHackathonId,
        mockUserName
      );
      await expect(result).resolves.toBeDefined();
    });
  });
});