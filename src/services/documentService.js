import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../lib/appwrite';

/**
 * Document validation utilities
 */
const validateDocument = (documentData) => {
  const errors = [];

  // Title validation
  if (!documentData.title || typeof documentData.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (documentData.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (documentData.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Content validation
  if (documentData.content !== undefined && typeof documentData.content !== 'string') {
    errors.push('Content must be a string');
  }

  // Team ID validation
  if (!documentData.teamId || typeof documentData.teamId !== 'string') {
    errors.push('Team ID is required and must be a string');
  }

  // Hackathon ID validation
  if (!documentData.hackathonId || typeof documentData.hackathonId !== 'string') {
    errors.push('Hackathon ID is required and must be a string');
  }

  // Tags validation
  if (documentData.tags && !Array.isArray(documentData.tags)) {
    errors.push('Tags must be an array');
  } else if (documentData.tags && documentData.tags.some(tag => typeof tag !== 'string')) {
    errors.push('All tags must be strings');
  }

  // Permissions validation
  if (documentData.permissions) {
    const { visibility, allowedUsers, allowEdit, allowComment } = documentData.permissions;
    
    if (visibility && !['team', 'leaders', 'custom'].includes(visibility)) {
      errors.push('Visibility must be one of: team, leaders, custom');
    }
    
    if (allowedUsers && !Array.isArray(allowedUsers)) {
      errors.push('Allowed users must be an array');
    }
    
    if (allowEdit !== undefined && typeof allowEdit !== 'boolean') {
      errors.push('Allow edit must be a boolean');
    }
    
    if (allowComment !== undefined && typeof allowComment !== 'boolean') {
      errors.push('Allow comment must be a boolean');
    }
  }

  return errors;
};

/**
 * Document service for managing collaborative documents
 */
export const documentService = {
  /**
   * Create a new document (minimal version for testing)
   * @param {string} teamId - Team ID
   * @param {string} hackathonId - Hackathon ID
   * @param {Object} documentData - Document data
   * @param {string} documentData.title - Document title
   * @param {string} documentData.content - Document content (optional, defaults to empty)
   * @returns {Promise<Object>} Created document
   */
  async createDocument(teamId, hackathonId, documentData) {
    try {
      // Validate input data
      const validationData = {
        ...documentData,
        teamId,
        hackathonId
      };
      
      const validationErrors = validateDocument(validationData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Start with absolutely minimal required fields
      const docData = {
        teamId,
        hackathonId,
        title: documentData.title.trim(),
        content: documentData.content || '',
        contentVersion: 1
      };

      const document = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        ID.unique(),
        docData
      );

      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      
      if (error.message && error.message.includes('Validation failed')) {
        throw error;
      }
      
      if (error.code === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.code === 403) {
        throw new Error('Permission denied. You do not have access to create documents.');
      }
      
      throw new Error(error.message || 'Failed to create document');
    }
  },

  /**
   * Get all documents for a team and hackathon
   * @param {string} teamId - Team ID
   * @param {string} hackathonId - Hackathon ID
   * @param {Object} filters - Optional filters
   * @param {string} filters.search - Search term for title/content
   * @param {Array<string>} filters.tags - Filter by tags
   * @param {string} filters.createdBy - Filter by creator
   * @param {boolean} filters.includeArchived - Include archived documents
   * @param {number} filters.limit - Limit number of results
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Object>} Documents list with metadata
   */
  async getTeamDocuments(teamId, hackathonId, filters = {}) {
    try {
      if (!teamId || !hackathonId) {
        throw new Error('Team ID and Hackathon ID are required');
      }

      // Build query filters
      const queries = [
        Query.equal('teamId', teamId),
        Query.equal('hackathonId', hackathonId)
      ];

      // Add archived filter
      if (!filters.includeArchived) {
        queries.push(Query.equal('isArchived', false));
      }

      // Add tag filters
      if (filters.tags && filters.tags.length > 0) {
        queries.push(Query.contains('tags', filters.tags));
      }

      // Add creator filter
      if (filters.createdBy) {
        queries.push(Query.equal('createdBy', filters.createdBy));
      }

      // Add pagination
      if (filters.limit) {
        queries.push(Query.limit(Math.min(filters.limit, 100))); // Cap at 100
      }

      if (filters.offset) {
        queries.push(Query.offset(filters.offset));
      }

      // Order by last modified (most recent first)
      queries.push(Query.orderDesc('$updatedAt'));

      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        queries
      );

      let documents = result.documents;

      // Apply search filter (client-side for now)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        documents = documents.filter(doc => 
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.content.toLowerCase().includes(searchTerm) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      return {
        documents,
        total: result.total,
        hasMore: documents.length === (filters.limit || result.documents.length)
      };
    } catch (error) {
      console.error('Error getting team documents:', error);
      
      if (error.code === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.code === 403) {
        throw new Error('Permission denied. You do not have access to view documents.');
      }
      
      throw new Error(error.message || 'Failed to load documents');
    }
  },

  /**
   * Get a single document by ID
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID for permission checking (optional)
   * @returns {Promise<Object>} Document data
   */
  async getDocument(documentId, userId = null) {
    try {
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const document = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        documentId
      );

      // Basic permission check (more comprehensive checks would be done server-side)
      if (userId && document.permissions) {
        const permissions = typeof document.permissions === 'string' 
          ? JSON.parse(document.permissions) 
          : document.permissions;
        
        if (permissions.visibility === 'custom') {
          if (!permissions.allowedUsers.includes(userId) && 
              document.createdBy !== userId) {
            throw new Error('You do not have permission to view this document');
          }
        }
      }

      return document;
    } catch (error) {
      console.error('Error getting document:', error);
      
      if (error.code === 404) {
        throw new Error('Document not found');
      }
      
      if (error.code === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.message && error.message.includes('permission')) {
        throw error;
      }
      
      throw new Error(error.message || 'Failed to load document');
    }
  },

  /**
   * Update a document
   * @param {string} documentId - Document ID
   * @param {Object} updates - Updates to apply
   * @param {string} updates.title - New title (optional)
   * @param {string} updates.content - New content (optional)
   * @param {Array<string>} updates.tags - New tags (optional)
   * @param {Object} updates.permissions - New permissions (optional)
   * @param {string} updatedBy - User ID of updater
   * @param {string} updatedByName - Name of updater
   * @returns {Promise<Object>} Updated document
   */
  async updateDocument(documentId, updates, updatedBy, updatedByName) {
    try {
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      if (!updatedBy || !updatedByName) {
        throw new Error('Updater information is required');
      }

      // Get current document to validate permissions and get current version
      const currentDoc = await this.getDocument(documentId);

      // Validate updates
      if (updates.title !== undefined) {
        if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
          throw new Error('Title must be a non-empty string');
        }
        if (updates.title.length > 200) {
          throw new Error('Title must be less than 200 characters');
        }
      }

      if (updates.content !== undefined && typeof updates.content !== 'string') {
        throw new Error('Content must be a string');
      }

      if (updates.tags !== undefined && !Array.isArray(updates.tags)) {
        throw new Error('Tags must be an array');
      }

      // Prepare update data
      const updateData = {
        lastModifiedBy: updatedBy,
        lastModifiedByName: updatedByName
        // updatedAt is handled automatically by Appwrite as $updatedAt
      };

      // Add specific updates
      if (updates.title !== undefined) {
        updateData.title = updates.title.trim();
      }

      if (updates.content !== undefined) {
        updateData.content = updates.content;
        updateData.contentVersion = (currentDoc.contentVersion || 1) + 1;
      }

      if (updates.tags !== undefined) {
        updateData.tags = updates.tags;
      }

      if (updates.permissions !== undefined) {
        // Parse existing permissions if they're stored as JSON string
        const existingPermissions = typeof currentDoc.permissions === 'string' 
          ? JSON.parse(currentDoc.permissions) 
          : currentDoc.permissions;
        
        updateData.permissions = JSON.stringify({
          ...existingPermissions,
          ...updates.permissions
        });
      }

      // Add updater to collaborators if not already present
      if (!currentDoc.collaborators.includes(updatedBy)) {
        updateData.collaborators = [...currentDoc.collaborators, updatedBy];
      }

      const updatedDocument = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        documentId,
        updateData
      );

      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      
      if (error.code === 404) {
        throw new Error('Document not found');
      }
      
      if (error.code === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.code === 403) {
        throw new Error('Permission denied. You do not have access to edit this document.');
      }
      
      if (error.message && error.message.includes('must be')) {
        throw error;
      }
      
      throw new Error(error.message || 'Failed to update document');
    }
  },

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID requesting deletion
   * @returns {Promise<boolean>} Success status
   */
  async deleteDocument(documentId, userId) {
    try {
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Get document to check permissions
      const document = await this.getDocument(documentId);

      // Only creator can delete (in a real app, team leaders might also be allowed)
      if (document.createdBy !== userId) {
        throw new Error('Only the document creator can delete this document');
      }

      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        documentId
      );

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      
      if (error.code === 404) {
        throw new Error('Document not found');
      }
      
      if (error.code === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.message && error.message.includes('Only the document creator')) {
        throw error;
      }
      
      throw new Error(error.message || 'Failed to delete document');
    }
  },

  /**
   * Archive/unarchive a document
   * @param {string} documentId - Document ID
   * @param {boolean} isArchived - Archive status
   * @param {string} userId - User ID requesting the action
   * @returns {Promise<Object>} Updated document
   */
  async archiveDocument(documentId, isArchived, userId) {
    try {
      if (!documentId || !userId) {
        throw new Error('Document ID and User ID are required');
      }

      // Get document to check permissions
      const document = await this.getDocument(documentId);

      // Only creator can archive (in a real app, team leaders might also be allowed)
      if (document.createdBy !== userId) {
        throw new Error('Only the document creator can archive this document');
      }

      const updatedDocument = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        documentId,
        {
          isArchived: Boolean(isArchived)
          // updatedAt is handled automatically by Appwrite as $updatedAt
        }
      );

      return updatedDocument;
    } catch (error) {
      console.error('Error archiving document:', error);
      
      if (error.message && error.message.includes('Only the document creator')) {
        throw error;
      }
      
      throw new Error(error.message || 'Failed to archive document');
    }
  },

  /**
   * Search documents across content and metadata
   * @param {string} teamId - Team ID
   * @param {string} hackathonId - Hackathon ID
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchDocuments(teamId, hackathonId, searchTerm, options = {}) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return [];
      }

      // Get all team documents and filter client-side
      // In a production app, this would be done server-side with full-text search
      const { documents } = await this.getTeamDocuments(teamId, hackathonId, {
        includeArchived: options.includeArchived || false
      });

      const searchTermLower = searchTerm.toLowerCase();
      
      const results = documents.filter(doc => {
        const titleMatch = doc.title.toLowerCase().includes(searchTermLower);
        const contentMatch = doc.content.toLowerCase().includes(searchTermLower);
        const tagMatch = doc.tags.some(tag => tag.toLowerCase().includes(searchTermLower));
        const authorMatch = doc.createdByName.toLowerCase().includes(searchTermLower);
        
        return titleMatch || contentMatch || tagMatch || authorMatch;
      });

      // Sort by relevance (title matches first, then content, then tags)
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(searchTermLower);
        const bTitle = b.title.toLowerCase().includes(searchTermLower);
        
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        
        // If both or neither match title, sort by last modified
        return new Date(b.$updatedAt) - new Date(a.$updatedAt);
      });

      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error(error.message || 'Failed to search documents');
    }
  },

  /**
   * Get document statistics for a team
   * @param {string} teamId - Team ID
   * @param {string} hackathonId - Hackathon ID
   * @returns {Promise<Object>} Document statistics
   */
  async getDocumentStats(teamId, hackathonId) {
    try {
      const { documents } = await this.getTeamDocuments(teamId, hackathonId, {
        includeArchived: true
      });

      const stats = {
        total: documents.length,
        active: documents.filter(doc => !doc.isArchived).length,
        archived: documents.filter(doc => doc.isArchived).length,
        totalCollaborators: new Set(documents.flatMap(doc => doc.collaborators)).size,
        recentlyModified: documents.filter(doc => {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return new Date(doc.$updatedAt) > dayAgo;
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error getting document stats:', error);
      throw new Error(error.message || 'Failed to get document statistics');
    }
  }
};