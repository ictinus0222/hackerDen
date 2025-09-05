/**
 * @fileoverview Integration tests for HackerDen Enhancement Features
 * Tests the integration between enhancement features and existing MVP systems
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '../taskService';
import { fileService } from '../fileService';
import { ideaService } from '../ideaService';
import pollService from '../pollService';
import submissionService from '../submissionService';
import { gamificationService } from '../gamificationService';

// Mock Appwrite
vi.mock('../../lib/appwrite', () => ({
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
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    TASKS: 'tasks',
    FILES: 'files',
    FILE_ANNOTATIONS: 'file_annotations',
    IDEAS: 'ideas',
    IDEA_VOTES: 'idea_votes',
    USER_POINTS: 'user_points',
    ACHIEVEMENTS: 'achievements',
    SUBMISSIONS: 'submissions',
    POLLS: 'polls',
    POLL_VOTES: 'poll_votes',
    TEAMS: 'teams',
    TEAM_MEMBERS: 'team_members'
  },
  STORAGE_BUCKETS: {
    TEAM_FILES: 'team-files'
  },
  Query: {
    equal: vi.fn(),
    contains: vi.fn(),
    orderDesc: vi.fn(),
    limit: vi.fn()
  },
  ID: {
    unique: vi.fn(() => 'test-id')
  }
}));

// Mock message service
vi.mock('../messageService', () => ({
  messageService: {
    sendSystemMessage: vi.fn(),
    sendFileUploadMessage: vi.fn(),
    sendFileAnnotationMessage: vi.fn(),
    sendAchievementMessage: vi.fn(),
    sendPollMessage: vi.fn(),
    sendPollResultMessage: vi.fn(),
    sendPollToTaskMessage: vi.fn()
  }
}));

describe('Enhancement Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File-Task Integration', () => {
    it('should attach files to tasks', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock task document
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

      const result = await taskService.attachFilesToTask(
        'task-1',
        ['file-1'],
        'team-1',
        'hackathon-1',
        'user-1',
        'Test User'
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-db',
        'tasks',
        'task-1',
        { attachedFiles: ['file-1'] }
      );

      expect(result.attachedFiles).toContain('file-1');
    });

    it('should get files attached to a task', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock task with attached files
      databases.getDocument.mockResolvedValueOnce({
        $id: 'task-1',
        attachedFiles: ['file-1', 'file-2']
      });

      // Mock file documents
      databases.getDocument
        .mockResolvedValueOnce({ $id: 'file-1', fileName: 'test1.pdf' })
        .mockResolvedValueOnce({ $id: 'file-2', fileName: 'test2.jpg' });

      const files = await taskService.getTaskFiles('task-1');

      expect(files).toHaveLength(2);
      expect(files[0].fileName).toBe('test1.pdf');
      expect(files[1].fileName).toBe('test2.jpg');
    });
  });

  describe('Idea-Task Integration', () => {
    it('should create task from idea', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock idea document
      databases.getDocument.mockResolvedValue({
        $id: 'idea-1',
        title: 'Great Idea',
        description: 'This is a great idea',
        tags: ['innovation', 'feature']
      });

      // Mock task creation
      databases.createDocument.mockResolvedValue({
        $id: 'task-1',
        title: 'Great Idea',
        description: 'Converted from idea: This is a great idea',
        labels: ['innovation', 'feature', 'idea-conversion']
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
        'test-id',
        expect.objectContaining({
          title: 'Great Idea',
          labels: ['innovation', 'feature', 'idea-conversion']
        })
      );

      expect(task.labels).toContain('idea-conversion');
    });
  });

  describe('Poll-Task Integration', () => {
    it('should create task from poll result', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock poll document
      databases.getDocument.mockResolvedValue({
        $id: 'poll-1',
        question: 'Which feature should we implement?',
        options: ['Feature A', 'Feature B', 'Feature C'],
        teamId: 'team-1'
      });

      // Mock poll results
      const mockPollService = {
        getPollResults: vi.fn().mockResolvedValue({
          results: [
            { option: 'Feature A', votes: 5, percentage: 50 },
            { option: 'Feature B', votes: 3, percentage: 30 },
            { option: 'Feature C', votes: 2, percentage: 20 }
          ],
          totalVotes: 10,
          uniqueVoters: 8
        })
      };

      // Mock task creation
      databases.createDocument.mockResolvedValue({
        $id: 'task-1',
        title: 'Implement: Feature A',
        labels: ['poll-decision']
      });

      const task = await taskService.createTaskFromPoll(
        'poll-1',
        'Feature A',
        'team-1',
        'hackathon-1',
        'user-1',
        'Creator'
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'tasks',
        'test-id',
        expect.objectContaining({
          title: 'Implement: Feature A',
          labels: ['poll-decision']
        })
      );

      expect(task.labels).toContain('poll-decision');
    });
  });

  describe('Submission Integration', () => {
    it('should get comprehensive team data for submission', async () => {
      const { databases } = await import('../../lib/appwrite');
      
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

  describe('Gamification Integration', () => {
    it('should award points for MVP actions', async () => {
      const { databases } = await import('../../lib/appwrite');
      
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
  });

  describe('Real-time Integration', () => {
    it('should handle file upload with task attachment', async () => {
      const { databases, storage } = await import('../../lib/appwrite');
      
      // Mock file upload to storage
      storage.createFile.mockResolvedValue({
        $id: 'storage-file-1'
      });

      storage.getFilePreview.mockReturnValue({
        href: 'https://preview-url.com/file.jpg'
      });

      // Mock file document creation
      databases.createDocument.mockResolvedValue({
        $id: 'file-1',
        fileName: 'test.jpg',
        storageId: 'storage-file-1',
        teamId: 'team-1'
      });

      // Mock task update for file attachment
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
      const updatedTask = await fileService.attachFileToTask(
        uploadedFile.$id,
        'task-1',
        'user-1',
        'hackathon-1',
        'Test User'
      );

      expect(storage.createFile).toHaveBeenCalled();
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'files',
        'test-id',
        expect.objectContaining({
          fileName: 'test.jpg',
          teamId: 'team-1'
        })
      );
      expect(updatedTask.attachedFiles).toContain('file-1');
    });
  });
});