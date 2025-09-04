import { describe, it, expect, vi, beforeEach } from 'vitest';
import fileService from '../fileService';

// Mock the appwrite dependencies
vi.mock('../../lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    getDocument: vi.fn(),
    listDocuments: vi.fn(),
    deleteDocument: vi.fn()
  },
  storage: {
    createFile: vi.fn(),
    deleteFile: vi.fn(),
    getFilePreview: vi.fn(),
    getFileDownload: vi.fn(),
    getFileView: vi.fn()
  },
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    FILES: 'test-files-collection',
    FILE_ANNOTATIONS: 'test-annotations-collection'
  },
  STORAGE_BUCKETS: {
    TEAM_FILES: 'team-files-bucket'
  },
  getBucketId: vi.fn(() => 'team-files-bucket'),
  Query: {
    equal: vi.fn(),
    orderDesc: vi.fn(),
    orderAsc: vi.fn(),
    limit: vi.fn()
  },
  ID: {
    unique: vi.fn(() => 'test-id')
  }
}));

// Mock BaseService
vi.mock('../BaseService.js', () => ({
  BaseService: class {
    constructor(name) {
      this.serviceName = name;
    }
    
    async createDocument(collection, data) {
      const { databases, DATABASE_ID } = await import('../../lib/appwrite');
      return databases.createDocument(DATABASE_ID, collection, 'test-id', {
        $id: 'test-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      });
    }
    
    handleError(method, error, context) {
      console.error(`${this.serviceName}.${method}:`, error, context);
      throw error;
    }
  }
}));

describe('FileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should throw error for missing file', () => {
      expect(() => fileService.validateFile(null)).toThrow('No file provided');
    });

    it('should throw error for oversized file', () => {
      const largeFile = {
        size: 11 * 1024 * 1024, // 11MB
        type: 'image/jpeg'
      };
      
      expect(() => fileService.validateFile(largeFile)).toThrow('File size exceeds 10MB limit');
    });

    it('should throw error for unsupported file type', () => {
      const unsupportedFile = {
        size: 1024,
        type: 'application/exe'
      };
      
      expect(() => fileService.validateFile(unsupportedFile)).toThrow('File type \'application/exe\' not supported');
    });

    it('should pass validation for valid file', () => {
      const validFile = {
        size: 1024,
        type: 'image/jpeg'
      };
      
      expect(() => fileService.validateFile(validFile)).not.toThrow();
    });

    it('should validate all supported file types', () => {
      const supportedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain', 'text/markdown', 'text/csv',
        'application/json', 'text/javascript', 'text/css', 'text/html',
        'application/zip', 'application/x-zip-compressed'
      ];

      supportedTypes.forEach(type => {
        const file = { size: 1024, type };
        expect(() => fileService.validateFile(file)).not.toThrow();
      });
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const { databases, storage } = await import('../../lib/appwrite');
      
      const mockFile = {
        name: 'test.jpg',
        size: 1024,
        type: 'image/jpeg'
      };

      const mockStorageFile = {
        $id: 'storage-123'
      };

      const mockFileDocument = {
        $id: 'file-123',
        teamId: 'team-123',
        uploadedBy: 'user-123',
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024,
        storageId: 'storage-123',
        previewUrl: null,
        annotationCount: 0
      };

      storage.createFile.mockResolvedValue(mockStorageFile);
      databases.createDocument.mockResolvedValue(mockFileDocument);

      const result = await fileService.uploadFile('team-123', mockFile, 'user-123');

      expect(storage.createFile).toHaveBeenCalledWith(
        'team-files-bucket',
        'test-id',
        mockFile
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'test-files-collection',
        'test-id',
        expect.objectContaining({
          teamId: 'team-123',
          uploadedBy: 'user-123',
          fileName: 'test.jpg',
          fileType: 'image/jpeg',
          fileSize: 1024,
          storageId: 'storage-123',
          annotationCount: 0
        })
      );

      expect(result).toEqual(mockFileDocument);
    });

    it('should throw error for missing required parameters', async () => {
      const mockFile = {
        name: 'test.jpg',
        size: 1024,
        type: 'image/jpeg'
      };

      await expect(fileService.uploadFile(null, mockFile, 'user-123')).rejects.toThrow('Team ID and uploader ID are required');
      await expect(fileService.uploadFile('team-123', mockFile, null)).rejects.toThrow('Team ID and uploader ID are required');
    });

    it('should handle file validation errors', async () => {
      const invalidFile = {
        name: 'test.exe',
        size: 1024,
        type: 'application/exe'
      };

      await expect(fileService.uploadFile('team-123', invalidFile, 'user-123')).rejects.toThrow('File type \'application/exe\' not supported');
    });

    it('should generate preview URL for images', async () => {
      const { databases, storage } = await import('../../lib/appwrite');
      
      const mockFile = {
        name: 'test.jpg',
        size: 1024,
        type: 'image/jpeg'
      };

      const mockStorageFile = {
        $id: 'storage-123'
      };

      const mockPreview = {
        href: 'https://example.com/preview.jpg'
      };

      storage.createFile.mockResolvedValue(mockStorageFile);
      storage.getFilePreview.mockReturnValue(mockPreview);
      databases.createDocument.mockResolvedValue({
        $id: 'file-123',
        previewUrl: 'https://example.com/preview.jpg'
      });

      await fileService.uploadFile('team-123', mockFile, 'user-123');

      expect(storage.getFilePreview).toHaveBeenCalledWith(
        'team-files-bucket',
        'storage-123',
        300,
        300,
        'center',
        100
      );
    });

    it('should handle preview generation errors gracefully', async () => {
      const { databases, storage } = await import('../../lib/appwrite');
      
      const mockFile = {
        name: 'test.jpg',
        size: 1024,
        type: 'image/jpeg'
      };

      const mockStorageFile = {
        $id: 'storage-123'
      };

      storage.createFile.mockResolvedValue(mockStorageFile);
      storage.getFilePreview.mockImplementation(() => {
        throw new Error('Preview generation failed');
      });
      databases.createDocument.mockResolvedValue({
        $id: 'file-123',
        previewUrl: null
      });

      const result = await fileService.uploadFile('team-123', mockFile, 'user-123');

      expect(result.previewUrl).toBeNull();
    });
  });

  describe('getTeamFiles', () => {
    it('should retrieve team files successfully', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      const mockFiles = {
        documents: [
          { $id: 'file-1', fileName: 'test1.jpg' },
          { $id: 'file-2', fileName: 'test2.pdf' }
        ]
      };

      databases.listDocuments.mockResolvedValue(mockFiles);

      const result = await fileService.getTeamFiles('team-123');

      expect(databases.listDocuments).toHaveBeenCalledWith(
        'test-db',
        'test-files-collection',
        expect.any(Array)
      );

      expect(result).toEqual(mockFiles.documents);
    });

    it('should handle database errors', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      const error = new Error('Database error');
      databases.listDocuments.mockRejectedValue(error);

      await expect(fileService.getTeamFiles('team-123')).rejects.toThrow('Database error');
    });
  });

  describe('deleteFile', () => {
    it('should delete file and its annotations successfully', async () => {
      const { databases, storage } = await import('../../lib/appwrite');
      
      const mockFileDoc = {
        $id: 'file-123',
        storageId: 'storage-123'
      };

      const mockAnnotations = [
        { $id: 'annotation-1', position: JSON.stringify({x:100,y:200}) },
        { $id: 'annotation-2', position: JSON.stringify({x:150,y:250}) }
      ];

      databases.getDocument.mockResolvedValue(mockFileDoc);
      databases.listDocuments.mockResolvedValue({ documents: mockAnnotations });
      storage.deleteFile.mockResolvedValue();
      databases.deleteDocument.mockResolvedValue();

      await fileService.deleteFile('file-123');

      expect(storage.deleteFile).toHaveBeenCalledWith('team-files-bucket', 'storage-123');
      expect(databases.deleteDocument).toHaveBeenCalledTimes(3); // 2 annotations + 1 file
    });

    it('should handle deletion errors', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      const error = new Error('File not found');
      databases.getDocument.mockRejectedValue(error);

      await expect(fileService.deleteFile('file-123')).rejects.toThrow('File not found');
    });
  });

  describe('addAnnotation', () => {
    it('should add annotation and update file count', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      const mockAnnotation = {
        $id: 'annotation-123',
        fileId: 'file-123',
        userId: 'user-123',
        content: 'Test annotation'
      };

      const mockFileDoc = {
        $id: 'file-123',
        annotationCount: 0
      };

      databases.createDocument.mockResolvedValue(mockAnnotation);
      databases.getDocument.mockResolvedValue(mockFileDoc);
      databases.updateDocument.mockResolvedValue();

      const annotationData = {
        content: 'Test annotation',
        position: { x: 100, y: 200 },
        type: 'point'
      };

      const result = await fileService.addAnnotation('file-123', 'user-123', annotationData);

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'test-annotations-collection',
        'test-id',
        expect.objectContaining({
          fileId: 'file-123',
          userId: 'user-123',
          content: 'Test annotation',
          position: JSON.stringify({ x: 100, y: 200 }),
          type: 'point'
        })
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-db',
        'test-files-collection',
        'file-123',
        expect.objectContaining({
          annotationCount: 1
        })
      );

      expect(result).toEqual(mockAnnotation);
    });
  });

  describe('getFileAnnotations', () => {
    it('should retrieve and parse annotations', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      const mockAnnotations = {
        documents: [
          {
            $id: 'annotation-1',
            position: JSON.stringify({x:100,y:200})
          },
          {
            $id: 'annotation-2',
            position: JSON.stringify({x:150,y:250})
          }
        ]
      };

      databases.listDocuments.mockResolvedValue(mockAnnotations);

      const result = await fileService.getFileAnnotations('file-123');

      expect(result).toEqual([
        {
          $id: 'annotation-1',
          position: { x: 100, y: 200 }
        },
        {
          $id: 'annotation-2',
          position: { x: 150, y: 250 }
        }
      ]);
    });
  });

  describe('URL generation methods', () => {
    it('should generate download URL', async () => {
      const { storage } = await import('../../lib/appwrite');
      
      storage.getFileDownload.mockReturnValue('https://example.com/download/file-123');

      const url = fileService.getFileDownloadUrl('file-123');

      expect(storage.getFileDownload).toHaveBeenCalledWith('team-files-bucket', 'file-123');
      expect(url).toBe('https://example.com/download/file-123');
    });

    it('should generate view URL', async () => {
      const { storage } = await import('../../lib/appwrite');
      
      storage.getFileView.mockReturnValue('https://example.com/view/file-123');

      const url = fileService.getFileViewUrl('file-123');

      expect(storage.getFileView).toHaveBeenCalledWith('team-files-bucket', 'file-123');
      expect(url).toBe('https://example.com/view/file-123');
    });
  });
});