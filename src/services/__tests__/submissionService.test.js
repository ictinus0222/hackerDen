import { describe, it, expect, vi, beforeEach } from 'vitest';
import submissionService from '../submissionService';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

// Mock Appwrite
vi.mock('@/lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    getDocument: vi.fn(),
    listDocuments: vi.fn()
  },
  DATABASE_ID: 'test-database',
  COLLECTIONS: {
    SUBMISSIONS: 'submissions'
  },
  Query: {
    equal: vi.fn((field, value) => `${field}=${value}`)
  },
  ID: {
    unique: () => 'test-id'
  }
}));

describe('submissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSubmission', () => {
    it('should create a new submission successfully', async () => {
      const mockSubmission = {
        $id: 'test-id',
        teamId: 'team-123',
        title: 'Test Project',
        description: 'Test description',
        techStack: ['React', 'Node.js'],
        isFinalized: false,
        publicUrl: 'http://localhost/submission/test-id',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      };

      databases.listDocuments.mockResolvedValue({ documents: [] });
      databases.createDocument.mockResolvedValue(mockSubmission);

      const result = await submissionService.createSubmission('team-123', {
        title: 'Test Project',
        description: 'Test description',
        techStack: ['React', 'Node.js']
      });

      expect(databases.listDocuments).toHaveBeenCalledWith(
        'test-database',
        'submissions',
        expect.any(Array)
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-database',
        'submissions',
        'test-id',
        expect.objectContaining({
          teamId: 'team-123',
          title: 'Test Project',
          description: 'Test description',
          techStack: ['React', 'Node.js'],
          isFinalized: false
        })
      );

      expect(result).toEqual(mockSubmission);
    });

    it('should throw error if submission already exists', async () => {
      databases.listDocuments.mockResolvedValue({ 
        documents: [{ $id: 'existing-submission' }] 
      });

      await expect(
        submissionService.createSubmission('team-123', {})
      ).rejects.toThrow('Submission already exists for this team');
    });
  });

  describe('updateSubmission', () => {
    it('should update submission successfully', async () => {
      const mockSubmission = {
        $id: 'submission-123',
        isFinalized: false
      };

      const mockUpdatedSubmission = {
        ...mockSubmission,
        title: 'Updated Title',
        updatedAt: expect.any(String)
      };

      databases.getDocument.mockResolvedValue(mockSubmission);
      databases.updateDocument.mockResolvedValue(mockUpdatedSubmission);

      const result = await submissionService.updateSubmission('submission-123', {
        title: 'Updated Title'
      });

      expect(databases.getDocument).toHaveBeenCalledWith(
        'test-database',
        'submissions',
        'submission-123'
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-database',
        'submissions',
        'submission-123',
        expect.objectContaining({
          title: 'Updated Title',
          updatedAt: expect.any(String)
        })
      );

      expect(result).toEqual(mockUpdatedSubmission);
    });

    it('should throw error if submission is finalized', async () => {
      const mockSubmission = {
        $id: 'submission-123',
        isFinalized: true
      };

      databases.getDocument.mockResolvedValue(mockSubmission);

      await expect(
        submissionService.updateSubmission('submission-123', { title: 'New Title' })
      ).rejects.toThrow('Cannot update finalized submission');
    });
  });

  describe('validateSubmission', () => {
    it('should validate required fields correctly', () => {
      const validSubmission = {
        title: 'Test Project',
        description: 'Test description',
        techStack: ['React']
      };

      const result = submissionService.validateSubmission(validSubmission);

      expect(result.isValid).toBe(true);
      expect(result.missing.required).toHaveLength(0);
    });

    it('should identify missing required fields', () => {
      const invalidSubmission = {
        title: '',
        description: '',
        techStack: []
      };

      const result = submissionService.validateSubmission(invalidSubmission);

      expect(result.isValid).toBe(false);
      expect(result.missing.required).toContain('title');
      expect(result.missing.required).toContain('description');
      expect(result.missing.required).toContain('techStack');
    });

    it('should identify missing recommended fields', () => {
      const partialSubmission = {
        title: 'Test Project',
        description: 'Test description',
        techStack: ['React'],
        challenges: '',
        accomplishments: ''
      };

      const result = submissionService.validateSubmission(partialSubmission);

      expect(result.isValid).toBe(true);
      expect(result.missing.recommended).toContain('challenges');
      expect(result.missing.recommended).toContain('accomplishments');
    });
  });

  describe('generateSubmissionUrl', () => {
    it('should generate correct public URL', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://hackerden.com'
        },
        writable: true
      });

      const url = submissionService.generateSubmissionUrl('test-id');
      expect(url).toBe('https://hackerden.com/submission/test-id');
    });
  });

  describe('finalizeSubmission', () => {
    it('should finalize submission successfully', async () => {
      const mockFinalizedSubmission = {
        $id: 'submission-123',
        isFinalized: true,
        finalizedAt: expect.any(String),
        updatedAt: expect.any(String)
      };

      databases.updateDocument.mockResolvedValue(mockFinalizedSubmission);

      const result = await submissionService.finalizeSubmission('submission-123');

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-database',
        'submissions',
        'submission-123',
        expect.objectContaining({
          isFinalized: true,
          finalizedAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      );

      expect(result).toEqual(mockFinalizedSubmission);
    });
  });
});