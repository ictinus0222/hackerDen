import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { versionService } from '../versionService';
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../../lib/appwrite';
import { documentService } from '../documentService';

// Mock Appwrite
vi.mock('../../lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    listDocuments: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn()
  },
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    DOCUMENT_VERSIONS: 'document_versions',
    DOCUMENTS: 'documents'
  },
  ID: {
    unique: vi.fn(() => 'unique-id')
  },
  Query: {
    equal: vi.fn((field, value) => `equal(${field}, ${value})`),
    orderDesc: vi.fn((field) => `orderDesc(${field})`),
    limit: vi.fn((limit) => `limit(${limit})`),
    offset: vi.fn((offset) => `offset(${offset})`)
  }
}));

// Mock documentService
vi.mock('../documentService', () => ({
  documentService: {
    getDocument: vi.fn(),
    updateDocument: vi.fn()
  }
}));

// Mock crypto.subtle for content hashing
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
    }
  }
});

describe('versionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createSnapshot', () => {
    it('should create a version snapshot successfully', async () => {
      const mockDocument = {
        $id: 'doc-1',
        content: 'existing content',
        contentVersion: 1
      };

      const mockVersion = {
        $id: 'version-1',
        documentId: 'doc-1',
        versionNumber: 2,
        content: 'new content',
        contentHash: 'hash123',
        createdBy: 'user-1',
        createdByName: 'John Doe',
        changesSummary: 'Updated content',
        isSnapshot: true
      };

      documentService.getDocument.mockResolvedValue(mockDocument);
      databases.listDocuments
        .mockResolvedValueOnce({ documents: [] }) // No existing versions
        .mockResolvedValueOnce({ documents: [] }); // No duplicate content
      databases.createDocument.mockResolvedValue(mockVersion);

      const result = await versionService.createSnapshot('doc-1', 'new content', {
        createdBy: 'user-1',
        createdByName: 'John Doe',
        changesSummary: 'Updated content',
        isSnapshot: true
      });

      expect(result).toEqual(mockVersion);
      expect(databases.createDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        'unique-id',
        expect.objectContaining({
          documentId: 'doc-1',
          versionNumber: 1,
          content: 'new content',
          createdBy: 'user-1',
          createdByName: 'John Doe',
          changesSummary: 'Updated content',
          isSnapshot: true
        })
      );
    });

    it('should return existing version if content is identical', async () => {
      const mockDocument = { $id: 'doc-1', contentVersion: 1 };
      const existingVersion = {
        $id: 'version-1',
        documentId: 'doc-1',
        contentHash: 'same-hash'
      };

      documentService.getDocument.mockResolvedValue(mockDocument);
      databases.listDocuments
        .mockResolvedValueOnce({ documents: [] }) // No existing versions
        .mockResolvedValueOnce({ documents: [existingVersion] }); // Duplicate found

      const result = await versionService.createSnapshot('doc-1', 'content', {
        createdBy: 'user-1',
        createdByName: 'John Doe'
      });

      expect(result).toEqual(existingVersion);
      expect(databases.createDocument).not.toHaveBeenCalled();
    });

    it('should throw error for missing required parameters', async () => {
      await expect(
        versionService.createSnapshot('', 'content', { createdBy: 'user-1', createdByName: 'John' })
      ).rejects.toThrow('Document ID, content, and creator information are required');

      await expect(
        versionService.createSnapshot('doc-1', '', { createdBy: 'user-1', createdByName: 'John' })
      ).rejects.toThrow('Document ID, content, and creator information are required');

      await expect(
        versionService.createSnapshot('doc-1', 'content', { createdByName: 'John' })
      ).rejects.toThrow('Document ID, content, and creator information are required');
    });
  });

  describe('getVersionHistory', () => {
    it('should get version history successfully', async () => {
      const mockVersions = [
        { $id: 'v1', versionNumber: 2, content: 'newer' },
        { $id: 'v2', versionNumber: 1, content: 'older' }
      ];

      databases.listDocuments.mockResolvedValue({ documents: mockVersions });

      const result = await versionService.getVersionHistory('doc-1');

      expect(result).toEqual(mockVersions);
      expect(databases.listDocuments).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        expect.arrayContaining([
          'equal(documentId, doc-1)',
          'orderDesc(versionNumber)',
          'limit(50)'
        ])
      );
    });

    it('should apply filters correctly', async () => {
      databases.listDocuments.mockResolvedValue({ documents: [] });

      await versionService.getVersionHistory('doc-1', {
        limit: 10,
        offset: 5,
        snapshotsOnly: true
      });

      expect(databases.listDocuments).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        expect.arrayContaining([
          'equal(documentId, doc-1)',
          'equal(isSnapshot, true)',
          'orderDesc(versionNumber)',
          'limit(10)',
          'offset(5)'
        ])
      );
    });

    it('should throw error for missing document ID', async () => {
      await expect(versionService.getVersionHistory('')).rejects.toThrow('Document ID is required');
    });
  });

  describe('getVersionContent', () => {
    it('should get version content successfully', async () => {
      const mockVersion = {
        $id: 'version-1',
        content: 'version content',
        versionNumber: 1
      };

      databases.getDocument.mockResolvedValue(mockVersion);

      const result = await versionService.getVersionContent('version-1');

      expect(result).toEqual(mockVersion);
      expect(databases.getDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        'version-1'
      );
    });

    it('should throw error for missing version ID', async () => {
      await expect(versionService.getVersionContent('')).rejects.toThrow('Version ID is required');
    });
  });

  describe('compareVersions', () => {
    it('should compare versions successfully', async () => {
      const version1 = {
        $id: 'v1',
        content: 'line 1\nline 2',
        versionNumber: 1
      };
      const version2 = {
        $id: 'v2',
        content: 'line 1\nline 2 modified\nline 3',
        versionNumber: 2
      };

      databases.getDocument
        .mockResolvedValueOnce(version1)
        .mockResolvedValueOnce(version2);

      const result = await versionService.compareVersions('v1', 'v2');

      expect(result.version1).toEqual(version1);
      expect(result.version2).toEqual(version2);
      expect(result.diff).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.linesAdded).toBeGreaterThan(0);
    });

    it('should throw error for missing version IDs', async () => {
      await expect(versionService.compareVersions('', 'v2')).rejects.toThrow('Both version IDs are required');
      await expect(versionService.compareVersions('v1', '')).rejects.toThrow('Both version IDs are required');
    });
  });

  describe('restoreVersion', () => {
    it('should restore version successfully', async () => {
      const versionToRestore = {
        $id: 'version-1',
        documentId: 'doc-1',
        content: 'restored content',
        versionNumber: 1
      };
      const currentDocument = {
        $id: 'doc-1',
        content: 'current content'
      };
      const updatedDocument = {
        $id: 'doc-1',
        content: 'restored content'
      };

      databases.getDocument.mockResolvedValue(versionToRestore);
      documentService.getDocument.mockResolvedValue(currentDocument);
      documentService.updateDocument.mockResolvedValue(updatedDocument);
      databases.listDocuments.mockResolvedValue({ documents: [] }); // For createSnapshot calls
      databases.createDocument.mockResolvedValue({});

      const result = await versionService.restoreVersion('doc-1', 'version-1', 'user-1', 'John Doe');

      expect(result).toEqual(updatedDocument);
      expect(documentService.updateDocument).toHaveBeenCalledWith(
        'doc-1',
        { content: 'restored content' },
        'user-1',
        'John Doe'
      );
    });

    it('should throw error if version does not belong to document', async () => {
      const versionToRestore = {
        $id: 'version-1',
        documentId: 'different-doc',
        content: 'content'
      };

      databases.getDocument.mockResolvedValue(versionToRestore);

      await expect(
        versionService.restoreVersion('doc-1', 'version-1', 'user-1', 'John Doe')
      ).rejects.toThrow('Version does not belong to the specified document');
    });
  });

  describe('createAutoSnapshot', () => {
    it('should create auto snapshot for significant changes', async () => {
      const oldContent = 'short content';
      const newContent = 'this is a much longer content that should trigger an auto snapshot because it has more than 100 characters difference from the original';

      databases.listDocuments
        .mockResolvedValueOnce({ documents: [] }) // For getVersionHistory
        .mockResolvedValueOnce({ documents: [] }); // For duplicate check
      databases.createDocument.mockResolvedValue({ $id: 'auto-version' });

      const result = await versionService.createAutoSnapshot(
        'doc-1',
        oldContent,
        newContent,
        'user-1',
        'John Doe'
      );

      expect(result).toBeDefined();
      expect(databases.createDocument).toHaveBeenCalled();
    });

    it('should not create auto snapshot for minor changes', async () => {
      const oldContent = 'some content';
      const newContent = 'some content with minor change';

      const result = await versionService.createAutoSnapshot(
        'doc-1',
        oldContent,
        newContent,
        'user-1',
        'John Doe'
      );

      expect(result).toBeNull();
      expect(databases.createDocument).not.toHaveBeenCalled();
    });
  });

  describe('cleanupOldVersions', () => {
    it('should delete old versions while keeping recent ones and snapshots', async () => {
      const mockVersions = Array.from({ length: 60 }, (_, i) => ({
        $id: `version-${i}`,
        versionNumber: 60 - i,
        isSnapshot: i % 10 === 0 // Every 10th version is a snapshot
      }));

      databases.listDocuments.mockResolvedValue({ documents: mockVersions });
      databases.deleteDocument.mockResolvedValue({});

      const deletedCount = await versionService.cleanupOldVersions('doc-1', {
        keepRecentCount: 50,
        keepAllSnapshots: true
      });

      expect(deletedCount).toBeGreaterThan(0);
      expect(databases.deleteDocument).toHaveBeenCalled();
    });

    it('should not delete anything if under the limit', async () => {
      const mockVersions = Array.from({ length: 30 }, (_, i) => ({
        $id: `version-${i}`,
        versionNumber: 30 - i,
        isSnapshot: false
      }));

      databases.listDocuments.mockResolvedValue({ documents: mockVersions });

      const deletedCount = await versionService.cleanupOldVersions('doc-1');

      expect(deletedCount).toBe(0);
      expect(databases.deleteDocument).not.toHaveBeenCalled();
    });
  });

  describe('private methods', () => {
    describe('_shouldCreateAutoSnapshot', () => {
      it('should return true for significant line changes', () => {
        const oldContent = 'line 1\nline 2\nline 3';
        const newContent = 'line 1\nline 2\nline 3\nline 4\nline 5\nline 6';

        const result = versionService._shouldCreateAutoSnapshot(oldContent, newContent);
        expect(result).toBe(true);
      });

      it('should return true for significant character changes', () => {
        const oldContent = 'short';
        const newContent = 'this is a much longer content that exceeds the 100 character threshold for automatic snapshot creation and should definitely trigger the auto snapshot functionality';

        const result = versionService._shouldCreateAutoSnapshot(oldContent, newContent);
        expect(result).toBe(true);
      });

      it('should return false for minor changes', () => {
        const oldContent = 'some content here';
        const newContent = 'some content here with small change';

        const result = versionService._shouldCreateAutoSnapshot(oldContent, newContent);
        expect(result).toBe(false);
      });
    });

    describe('_generateChangesSummary', () => {
      it('should generate summary for added lines and characters', () => {
        const oldContent = 'line 1';
        const newContent = 'line 1\nline 2\nline 3';

        const summary = versionService._generateChangesSummary(oldContent, newContent);
        expect(summary).toContain('+2 lines');
        expect(summary).toContain('+14 chars');
      });

      it('should generate summary for removed content', () => {
        const oldContent = 'line 1\nline 2\nline 3';
        const newContent = 'line 1';

        const summary = versionService._generateChangesSummary(oldContent, newContent);
        expect(summary).toContain('-2 lines');
        expect(summary).toContain('-14 chars');
      });

      it('should handle initial content', () => {
        const summary = versionService._generateChangesSummary('', 'new content');
        expect(summary).toBe('Initial content');
      });

      it('should handle cleared content', () => {
        const summary = versionService._generateChangesSummary('old content', '');
        expect(summary).toBe('Content cleared');
      });
    });

    describe('_generateDiff', () => {
      it('should generate diff for added lines', () => {
        const oldContent = 'line 1\nline 2';
        const newContent = 'line 1\nline 2\nline 3';

        const diff = versionService._generateDiff(oldContent, newContent);
        
        expect(diff).toHaveLength(3);
        expect(diff[0].type).toBe('unchanged');
        expect(diff[1].type).toBe('unchanged');
        expect(diff[2].type).toBe('added');
        expect(diff[2].content).toBe('line 3');
      });

      it('should generate diff for removed lines', () => {
        const oldContent = 'line 1\nline 2\nline 3';
        const newContent = 'line 1\nline 2';

        const diff = versionService._generateDiff(oldContent, newContent);
        
        expect(diff).toHaveLength(3);
        expect(diff[0].type).toBe('unchanged');
        expect(diff[1].type).toBe('unchanged');
        expect(diff[2].type).toBe('removed');
        expect(diff[2].content).toBe('line 3');
      });

      it('should generate diff for modified lines', () => {
        const oldContent = 'line 1\nline 2';
        const newContent = 'line 1\nline 2 modified';

        const diff = versionService._generateDiff(oldContent, newContent);
        
        expect(diff).toHaveLength(3);
        expect(diff[0].type).toBe('unchanged');
        expect(diff[1].type).toBe('removed');
        expect(diff[1].content).toBe('line 2');
        expect(diff[2].type).toBe('added');
        expect(diff[2].content).toBe('line 2 modified');
      });
    });
  });
});