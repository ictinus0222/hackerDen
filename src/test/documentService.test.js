import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { documentService } from '../services/documentService';
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../lib/appwrite';

// Mock the appwrite module
vi.mock('../lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    listDocuments: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn()
  },
  DATABASE_ID: 'test-database',
  COLLECTIONS: {
    DOCUMENTS: 'documents'
  },
  ID: {
    unique: vi.fn(() => 'test-id-123')
  },
  Query: {
    equal: vi.fn((field, value) => ({ field, value, type: 'equal' })),
    contains: vi.fn((field, value) => ({ field, value, type: 'contains' })),
    limit: vi.fn((value) => ({ value, type: 'limit' })),
    offset: vi.fn((value) => ({ value, type: 'offset' })),
    orderDesc: vi.fn((field) => ({ field, type: 'orderDesc' }))
  }
}));

describe('documentService', () => {
  const mockTeamId = 'team-123';
  const mockHackathonId = 'hackathon-456';
  const mockUserId = 'user-789';
  const mockUserName = 'Test User';
  
  const mockDocument = {
    $id: 'doc-123',
    teamId: mockTeamId,
    hackathonId: mockHackathonId,
    title: 'Test Document',
    content: '# Test Content',
    contentVersion: 1,
    createdBy: mockUserId,
    createdByName: mockUserName,
    lastModifiedBy: mockUserId,
    lastModifiedByName: mockUserName,
    tags: ['test', 'document'],
    permissions: {
      visibility: 'team',
      allowedUsers: [],
      allowEdit: true,
      allowComment: true
    },
    collaborators: [mockUserId],
    isArchived: false,
    $createdAt: '2024-01-01T00:00:00.000Z',
    $updatedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createDocument', () => {
    it('should create a document with valid data', async () => {
      const documentData = {
        title: 'New Document',
        content: '# Hello World',
        tags: ['new', 'test'],
        createdBy: mockUserId,
        createdByName: mockUserName
      };

      databases.createDocument.mockResolvedValue(mockDocument);

      const result = await documentService.createDocument(
        mockTeamId,
        mockHackathonId,
        documentData
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'test-id-123',
        expect.objectContaining({
          teamId: mockTeamId,
          hackathonId: mockHackathonId,
          title: 'New Document',
          content: '# Hello World',
          tags: ['new', 'test'],
          createdBy: mockUserId,
          createdByName: mockUserName,
          contentVersion: 1,
          isArchived: false
        })
      );

      expect(result).toEqual(mockDocument);
    });

    it('should create a document with default values', async () => {
      const documentData = {
        title: 'Minimal Document',
        createdBy: mockUserId,
        createdByName: mockUserName
      };

      databases.createDocument.mockResolvedValue(mockDocument);

      await documentService.createDocument(
        mockTeamId,
        mockHackathonId,
        documentData
      );

      expect(databases.createDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'test-id-123',
        expect.objectContaining({
          content: '',
          tags: [],
          permissions: {
            visibility: 'team',
            allowedUsers: [],
            allowEdit: true,
            allowComment: true
          }
        })
      );
    });

    it('should throw validation error for missing title', async () => {
      const documentData = {
        createdBy: mockUserId,
        createdByName: mockUserName
      };

      await expect(
        documentService.createDocument(mockTeamId, mockHackathonId, documentData)
      ).rejects.toThrow('Validation failed: Title is required and must be a string');
    });

    it('should throw validation error for empty title', async () => {
      const documentData = {
        title: '   ',
        createdBy: mockUserId,
        createdByName: mockUserName
      };

      await expect(
        documentService.createDocument(mockTeamId, mockHackathonId, documentData)
      ).rejects.toThrow('Validation failed: Title cannot be empty');
    });

    it('should throw validation error for long title', async () => {
      const documentData = {
        title: 'a'.repeat(201),
        createdBy: mockUserId,
        createdByName: mockUserName
      };

      await expect(
        documentService.createDocument(mockTeamId, mockHackathonId, documentData)
      ).rejects.toThrow('Validation failed: Title must be less than 200 characters');
    });

    it('should handle authentication errors', async () => {
      const documentData = {
        title: 'Test Document',
        createdBy: mockUserId,
        createdByName: mockUserName
      };

      databases.createDocument.mockRejectedValue({ code: 401, message: 'Unauthorized' });

      await expect(
        documentService.createDocument(mockTeamId, mockHackathonId, documentData)
      ).rejects.toThrow('Authentication failed. Please log in again.');
    });

    it('should handle permission errors', async () => {
      const documentData = {
        title: 'Test Document',
        createdBy: mockUserId,
        createdByName: mockUserName
      };

      databases.createDocument.mockRejectedValue({ code: 403, message: 'Forbidden' });

      await expect(
        documentService.createDocument(mockTeamId, mockHackathonId, documentData)
      ).rejects.toThrow('Permission denied. You do not have access to create documents.');
    });
  });

  describe('getTeamDocuments', () => {
    const mockDocumentsList = {
      documents: [mockDocument],
      total: 1
    };

    it('should get team documents with basic filters', async () => {
      databases.listDocuments.mockResolvedValue(mockDocumentsList);

      const result = await documentService.getTeamDocuments(
        mockTeamId,
        mockHackathonId
      );

      expect(databases.listDocuments).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        expect.arrayContaining([
          { field: 'teamId', value: mockTeamId, type: 'equal' },
          { field: 'hackathonId', value: mockHackathonId, type: 'equal' },
          { field: 'isArchived', value: false, type: 'equal' },
          { field: '$updatedAt', type: 'orderDesc' }
        ])
      );

      expect(result).toEqual({
        documents: [mockDocument],
        total: 1,
        hasMore: true // hasMore is true when documents.length === limit or result.documents.length
      });
    });

    it('should apply search filter', async () => {
      databases.listDocuments.mockResolvedValue(mockDocumentsList);

      const result = await documentService.getTeamDocuments(
        mockTeamId,
        mockHackathonId,
        { search: 'test' }
      );

      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].title).toContain('Test');
    });

    it('should filter by tags', async () => {
      databases.listDocuments.mockResolvedValue(mockDocumentsList);

      await documentService.getTeamDocuments(
        mockTeamId,
        mockHackathonId,
        { tags: ['test'] }
      );

      expect(databases.listDocuments).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        expect.arrayContaining([
          { field: 'tags', value: ['test'], type: 'contains' }
        ])
      );
    });

    it('should apply pagination', async () => {
      databases.listDocuments.mockResolvedValue(mockDocumentsList);

      await documentService.getTeamDocuments(
        mockTeamId,
        mockHackathonId,
        { limit: 10, offset: 20 }
      );

      expect(databases.listDocuments).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        expect.arrayContaining([
          { value: 10, type: 'limit' },
          { value: 20, type: 'offset' }
        ])
      );
    });

    it('should throw error for missing team ID', async () => {
      await expect(
        documentService.getTeamDocuments(null, mockHackathonId)
      ).rejects.toThrow('Team ID and Hackathon ID are required');
    });

    it('should handle authentication errors', async () => {
      databases.listDocuments.mockRejectedValue({ code: 401 });

      await expect(
        documentService.getTeamDocuments(mockTeamId, mockHackathonId)
      ).rejects.toThrow('Authentication failed. Please log in again.');
    });
  });

  describe('getDocument', () => {
    it('should get a document by ID', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);

      const result = await documentService.getDocument('doc-123');

      expect(databases.getDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'doc-123'
      );

      expect(result).toEqual(mockDocument);
    });

    it('should check permissions for custom visibility', async () => {
      const restrictedDoc = {
        ...mockDocument,
        permissions: {
          visibility: 'custom',
          allowedUsers: ['other-user'],
          allowEdit: true,
          allowComment: true
        }
      };

      databases.getDocument.mockResolvedValue(restrictedDoc);

      await expect(
        documentService.getDocument('doc-123', 'unauthorized-user')
      ).rejects.toThrow('You do not have permission to view this document');
    });

    it('should allow creator to view custom visibility document', async () => {
      const restrictedDoc = {
        ...mockDocument,
        permissions: {
          visibility: 'custom',
          allowedUsers: ['other-user'],
          allowEdit: true,
          allowComment: true
        }
      };

      databases.getDocument.mockResolvedValue(restrictedDoc);

      const result = await documentService.getDocument('doc-123', mockUserId);

      expect(result).toEqual(restrictedDoc);
    });

    it('should throw error for missing document ID', async () => {
      await expect(
        documentService.getDocument(null)
      ).rejects.toThrow('Document ID is required');
    });

    it('should handle document not found', async () => {
      databases.getDocument.mockRejectedValue({ code: 404 });

      await expect(
        documentService.getDocument('nonexistent')
      ).rejects.toThrow('Document not found');
    });
  });

  describe('updateDocument', () => {
    it('should update document with valid data', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);
      databases.updateDocument.mockResolvedValue({
        ...mockDocument,
        title: 'Updated Title',
        contentVersion: 2
      });

      const updates = {
        title: 'Updated Title',
        content: '# Updated Content'
      };

      const result = await documentService.updateDocument(
        'doc-123',
        updates,
        mockUserId,
        mockUserName
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'doc-123',
        expect.objectContaining({
          title: 'Updated Title',
          content: '# Updated Content',
          contentVersion: 2,
          lastModifiedBy: mockUserId,
          lastModifiedByName: mockUserName
        })
      );

      expect(result.title).toBe('Updated Title');
    });

    it('should increment content version when content is updated', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);
      databases.updateDocument.mockResolvedValue(mockDocument);

      await documentService.updateDocument(
        'doc-123',
        { content: 'New content' },
        mockUserId,
        mockUserName
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'doc-123',
        expect.objectContaining({
          contentVersion: 2
        })
      );
    });

    it('should add updater to collaborators', async () => {
      const newUserId = 'new-user-123';
      const newUserName = 'New User';

      databases.getDocument.mockResolvedValue(mockDocument);
      databases.updateDocument.mockResolvedValue(mockDocument);

      await documentService.updateDocument(
        'doc-123',
        { title: 'Updated by new user' },
        newUserId,
        newUserName
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'doc-123',
        expect.objectContaining({
          collaborators: [mockUserId, newUserId]
        })
      );
    });

    it('should validate title updates', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);

      await expect(
        documentService.updateDocument(
          'doc-123',
          { title: '' },
          mockUserId,
          mockUserName
        )
      ).rejects.toThrow('Title must be a non-empty string');
    });

    it('should validate content updates', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);

      await expect(
        documentService.updateDocument(
          'doc-123',
          { content: 123 },
          mockUserId,
          mockUserName
        )
      ).rejects.toThrow('Content must be a string');
    });

    it('should throw error for missing updater info', async () => {
      await expect(
        documentService.updateDocument('doc-123', { title: 'New Title' })
      ).rejects.toThrow('Updater information is required');
    });

    it('should handle document not found', async () => {
      databases.getDocument.mockRejectedValue({ code: 404 });

      await expect(
        documentService.updateDocument(
          'nonexistent',
          { title: 'New Title' },
          mockUserId,
          mockUserName
        )
      ).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document when user is creator', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);
      databases.deleteDocument.mockResolvedValue(true);

      const result = await documentService.deleteDocument('doc-123', mockUserId);

      expect(databases.deleteDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'doc-123'
      );

      expect(result).toBe(true);
    });

    it('should throw error when user is not creator', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);

      await expect(
        documentService.deleteDocument('doc-123', 'other-user')
      ).rejects.toThrow('Only the document creator can delete this document');
    });

    it('should throw error for missing document ID', async () => {
      await expect(
        documentService.deleteDocument(null, mockUserId)
      ).rejects.toThrow('Document ID is required');
    });

    it('should throw error for missing user ID', async () => {
      await expect(
        documentService.deleteDocument('doc-123', null)
      ).rejects.toThrow('User ID is required');
    });

    it('should handle document not found', async () => {
      databases.getDocument.mockRejectedValue({ code: 404 });

      await expect(
        documentService.deleteDocument('nonexistent', mockUserId)
      ).rejects.toThrow('Document not found');
    });
  });

  describe('archiveDocument', () => {
    it('should archive document when user is creator', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);
      databases.updateDocument.mockResolvedValue({
        ...mockDocument,
        isArchived: true
      });

      const result = await documentService.archiveDocument('doc-123', true, mockUserId);

      expect(databases.updateDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'doc-123',
        expect.objectContaining({
          isArchived: true
        })
      );

      expect(result.isArchived).toBe(true);
    });

    it('should unarchive document', async () => {
      const archivedDoc = { ...mockDocument, isArchived: true };
      databases.getDocument.mockResolvedValue(archivedDoc);
      databases.updateDocument.mockResolvedValue({
        ...archivedDoc,
        isArchived: false
      });

      const result = await documentService.archiveDocument('doc-123', false, mockUserId);

      expect(databases.updateDocument).toHaveBeenCalledWith(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        'doc-123',
        expect.objectContaining({
          isArchived: false
        })
      );

      expect(result.isArchived).toBe(false);
    });

    it('should throw error when user is not creator', async () => {
      databases.getDocument.mockResolvedValue(mockDocument);

      await expect(
        documentService.archiveDocument('doc-123', true, 'other-user')
      ).rejects.toThrow('Only the document creator can archive this document');
    });
  });

  describe('searchDocuments', () => {
    const mockSearchResults = {
      documents: [
        mockDocument,
        {
          ...mockDocument,
          $id: 'doc-456',
          title: 'Another Document',
          content: 'Different content'
        }
      ]
    };

    it('should search documents by title', async () => {
      databases.listDocuments.mockResolvedValue(mockSearchResults);

      const results = await documentService.searchDocuments(
        mockTeamId,
        mockHackathonId,
        'test'
      );

      expect(results).toHaveLength(2); // Both documents contain "test" in some form
      expect(results.some(doc => doc.title.includes('Test'))).toBe(true);
    });

    it('should search documents by content', async () => {
      databases.listDocuments.mockResolvedValue(mockSearchResults);

      const results = await documentService.searchDocuments(
        mockTeamId,
        mockHackathonId,
        'content'
      );

      expect(results).toHaveLength(2);
    });

    it('should return empty array for empty search term', async () => {
      const results = await documentService.searchDocuments(
        mockTeamId,
        mockHackathonId,
        ''
      );

      expect(results).toEqual([]);
      expect(databases.listDocuments).not.toHaveBeenCalled();
    });

    it('should sort results by relevance', async () => {
      const mockResults = {
        documents: [
          {
            ...mockDocument,
            $id: 'doc-1',
            title: 'Other Document',
            content: 'Contains search term',
            $updatedAt: '2024-01-02T00:00:00.000Z'
          },
          {
            ...mockDocument,
            $id: 'doc-2',
            title: 'Search Document',
            content: 'Different content',
            $updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };

      databases.listDocuments.mockResolvedValue(mockResults);

      const results = await documentService.searchDocuments(
        mockTeamId,
        mockHackathonId,
        'search'
      );

      expect(results[0].title).toBe('Search Document'); // Title match first
      expect(results[1].title).toBe('Other Document'); // Content match second
    });
  });

  describe('getDocumentStats', () => {
    it('should calculate document statistics', async () => {
      const mockStatsData = {
        documents: [
          mockDocument,
          {
            ...mockDocument,
            $id: 'doc-2',
            isArchived: true,
            collaborators: ['user-1', 'user-2'],
            $updatedAt: new Date().toISOString() // Recent
          },
          {
            ...mockDocument,
            $id: 'doc-3',
            collaborators: ['user-1', 'user-3'],
            $updatedAt: '2024-01-01T00:00:00.000Z' // Old
          }
        ]
      };

      databases.listDocuments.mockResolvedValue(mockStatsData);

      const stats = await documentService.getDocumentStats(mockTeamId, mockHackathonId);

      expect(stats).toEqual({
        total: 3,
        active: 2,
        archived: 1,
        totalCollaborators: 4, // user-789, user-1, user-2, user-3 (unique count)
        recentlyModified: 1
      });
    });

    it('should handle empty document list', async () => {
      databases.listDocuments.mockResolvedValue({ documents: [] });

      const stats = await documentService.getDocumentStats(mockTeamId, mockHackathonId);

      expect(stats).toEqual({
        total: 0,
        active: 0,
        archived: 0,
        totalCollaborators: 0,
        recentlyModified: 0
      });
    });
  });
});