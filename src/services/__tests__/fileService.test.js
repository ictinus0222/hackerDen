/**
 * @fileoverview Tests for FileService
 */

import { describe, it, expect, vi } from 'vitest';
import { fileService } from '../fileService';

// Mock Appwrite
vi.mock('../../lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    listDocuments: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
  storage: {
    createFile: vi.fn(),
    deleteFile: vi.fn(),
    getFilePreview: vi.fn(),
    getFileDownload: vi.fn(() => ({ href: 'https://example.com/download' })),
    getFileView: vi.fn(() => ({ href: 'https://example.com/view' })),
  },
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    FILES: 'files',
    FILE_ANNOTATIONS: 'file_annotations'
  },
  STORAGE_BUCKETS: {
    TEAM_FILES: 'team-files'
  },
  Query: {
    equal: vi.fn((field, value) => ({ field, value, type: 'equal' })),
    orderDesc: vi.fn((field) => ({ field, type: 'orderDesc' })),
    orderAsc: vi.fn((field) => ({ field, type: 'orderAsc' }))
  },
  ID: {
    unique: vi.fn(() => 'unique-id')
  },
  default: {
    subscribe: vi.fn()
  }
}));

// Mock gamification service
vi.mock('../gamificationService', () => ({
  gamificationService: {
    awardPoints: vi.fn().mockResolvedValue({ totalPoints: 5 })
  }
}));

describe('FileService', () => {
  describe('getFileDownloadUrl', () => {
    it('should return download URL for a file', () => {
      const storageId = 'test-storage-id';
      const url = fileService.getFileDownloadUrl(storageId);
      
      // The function should call storage.getFileDownload
      expect(url).toBeDefined();
    });
  });

  describe('getFileViewUrl', () => {
    it('should return view URL for a file', () => {
      const storageId = 'test-storage-id';
      const url = fileService.getFileViewUrl(storageId);
      
      // The function should call storage.getFileView
      expect(url).toBeDefined();
    });
  });

  describe('getTeamFiles', () => {
    it('should fetch files for a team', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      databases.listDocuments.mockResolvedValueOnce({
        documents: [
          {
            $id: 'file1',
            teamId: 'team123',
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
            fileSize: 1024
          }
        ]
      });

      const files = await fileService.getTeamFiles('team123');
      
      expect(files).toHaveLength(1);
      expect(files[0].fileName).toBe('test.jpg');
    });
  });

  describe('addAnnotation', () => {
    it('should add annotation to a file', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock annotation creation
      databases.createDocument.mockResolvedValueOnce({
        $id: 'annotation1',
        fileId: 'file1',
        userId: 'user1',
        content: 'Test annotation'
      });

      // Mock file document fetch
      databases.getDocument.mockResolvedValueOnce({
        $id: 'file1',
        annotationCount: 0
      });

      // Mock file update
      databases.updateDocument.mockResolvedValueOnce({
        $id: 'file1',
        annotationCount: 1
      });

      const annotation = await fileService.addAnnotation('file1', 'user1', {
        content: 'Test annotation',
        position: { x: 100, y: 200 },
        type: 'point'
      });

      expect(annotation.content).toBe('Test annotation');
      expect(databases.createDocument).toHaveBeenCalled();
      expect(databases.updateDocument).toHaveBeenCalled();
    });
  });

  describe('getFileAnnotations', () => {
    it('should fetch annotations for a file', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      databases.listDocuments.mockResolvedValueOnce({
        documents: [
          {
            $id: 'annotation1',
            fileId: 'file1',
            content: 'Test annotation',
            position: JSON.stringify({ x: 100, y: 200 })
          }
        ]
      });

      const annotations = await fileService.getFileAnnotations('file1');
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].content).toBe('Test annotation');
      expect(annotations[0].position).toEqual({ x: 100, y: 200 });
    });
  });
});