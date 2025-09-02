import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../lib/appwrite';
import { documentService } from './documentService';

/**
 * Version service for managing document versions and history
 */
export const versionService = {
  /**
   * Create a version snapshot of a document
   * @param {string} documentId - Document ID
   * @param {string} content - Document content at this version
   * @param {Object} metadata - Version metadata
   * @param {string} metadata.createdBy - User ID who created this version
   * @param {string} metadata.createdByName - Name of user who created this version
   * @param {string} metadata.changesSummary - Summary of changes (optional)
   * @param {boolean} metadata.isSnapshot - Whether this is a manual snapshot (default: false)
   * @returns {Promise<Object>} Created version
   */
  async createSnapshot(documentId, content, metadata) {
    try {
      if (!documentId || !content || !metadata.createdBy || !metadata.createdByName) {
        throw new Error('Document ID, content, and creator information are required');
      }

      // Get current document to determine version number
      const document = await documentService.getDocument(documentId);
      
      // Get latest version number
      const existingVersions = await this.getVersionHistory(documentId, { limit: 1 });
      const nextVersionNumber = existingVersions.length > 0 
        ? existingVersions[0].versionNumber + 1 
        : 1;

      // Create content hash for deduplication
      const contentHash = await this._generateContentHash(content);

      // Check if this exact content already exists
      const duplicateCheck = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        [
          Query.equal('documentId', documentId),
          Query.equal('contentHash', contentHash),
          Query.limit(1)
        ]
      );

      if (duplicateCheck.documents.length > 0) {
        // Return existing version if content is identical
        return duplicateCheck.documents[0];
      }

      const versionData = {
        documentId,
        versionNumber: nextVersionNumber,
        content,
        contentHash,
        createdBy: metadata.createdBy,
        createdByName: metadata.createdByName,
        changesSummary: metadata.changesSummary || 'Document updated',
        isSnapshot: Boolean(metadata.isSnapshot)
      };

      const version = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        ID.unique(),
        versionData
      );

      return version;
    } catch (error) {
      console.error('Error creating version snapshot:', error);
      
      if (error.code === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.code === 403) {
        throw new Error('Permission denied. You do not have access to create versions.');
      }
      
      throw new Error(error.message || 'Failed to create version snapshot');
    }
  },

  /**
   * Get version history for a document
   * @param {string} documentId - Document ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Limit number of versions (default: 50)
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.snapshotsOnly - Only return manual snapshots
   * @returns {Promise<Array>} Array of versions
   */
  async getVersionHistory(documentId, options = {}) {
    try {
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const queries = [
        Query.equal('documentId', documentId),
        Query.orderDesc('versionNumber')
      ];

      if (options.snapshotsOnly) {
        queries.push(Query.equal('isSnapshot', true));
      }

      if (options.limit) {
        queries.push(Query.limit(Math.min(options.limit, 100))); // Cap at 100
      } else {
        queries.push(Query.limit(50)); // Default limit
      }

      if (options.offset) {
        queries.push(Query.offset(options.offset));
      }

      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        queries
      );

      return result.documents;
    } catch (error) {
      console.error('Error getting version history:', error);
      
      if (error.code === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.code === 403) {
        throw new Error('Permission denied. You do not have access to view version history.');
      }
      
      throw new Error(error.message || 'Failed to load version history');
    }
  },

  /**
   * Get content of a specific version
   * @param {string} versionId - Version ID
   * @returns {Promise<Object>} Version with content
   */
  async getVersionContent(versionId) {
    try {
      if (!versionId) {
        throw new Error('Version ID is required');
      }

      const version = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        versionId
      );

      return version;
    } catch (error) {
      console.error('Error getting version content:', error);
      
      if (error.code === 404) {
        throw new Error('Version not found');
      }
      
      if (error.code === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(error.message || 'Failed to load version content');
    }
  },

  /**
   * Compare two versions and return differences
   * @param {string} versionId1 - First version ID (older)
   * @param {string} versionId2 - Second version ID (newer)
   * @returns {Promise<Object>} Comparison result with differences
   */
  async compareVersions(versionId1, versionId2) {
    try {
      if (!versionId1 || !versionId2) {
        throw new Error('Both version IDs are required');
      }

      const [version1, version2] = await Promise.all([
        this.getVersionContent(versionId1),
        this.getVersionContent(versionId2)
      ]);

      // Generate diff using a simple line-by-line comparison
      const diff = this._generateDiff(version1.content, version2.content);

      return {
        version1,
        version2,
        diff,
        summary: {
          linesAdded: diff.filter(line => line.type === 'added').length,
          linesRemoved: diff.filter(line => line.type === 'removed').length,
          linesModified: diff.filter(line => line.type === 'modified').length
        }
      };
    } catch (error) {
      console.error('Error comparing versions:', error);
      throw new Error(error.message || 'Failed to compare versions');
    }
  },

  /**
   * Restore a document to a previous version
   * @param {string} documentId - Document ID
   * @param {string} versionId - Version ID to restore
   * @param {string} restoredBy - User ID performing the restoration
   * @param {string} restoredByName - Name of user performing the restoration
   * @returns {Promise<Object>} Updated document
   */
  async restoreVersion(documentId, versionId, restoredBy, restoredByName) {
    try {
      if (!documentId || !versionId || !restoredBy || !restoredByName) {
        throw new Error('Document ID, version ID, and restorer information are required');
      }

      // Get the version to restore
      const versionToRestore = await this.getVersionContent(versionId);
      
      if (versionToRestore.documentId !== documentId) {
        throw new Error('Version does not belong to the specified document');
      }

      // Create a new version snapshot before restoration (backup current state)
      const currentDocument = await documentService.getDocument(documentId);
      await this.createSnapshot(documentId, currentDocument.content, {
        createdBy: restoredBy,
        createdByName: restoredByName,
        changesSummary: `Backup before restoring to version ${versionToRestore.versionNumber}`,
        isSnapshot: true
      });

      // Update the document with the restored content
      const updatedDocument = await documentService.updateDocument(
        documentId,
        {
          content: versionToRestore.content
        },
        restoredBy,
        restoredByName
      );

      // Create a new version for the restoration
      await this.createSnapshot(documentId, versionToRestore.content, {
        createdBy: restoredBy,
        createdByName: restoredByName,
        changesSummary: `Restored to version ${versionToRestore.versionNumber} (${versionToRestore.changesSummary})`,
        isSnapshot: true
      });

      return updatedDocument;
    } catch (error) {
      console.error('Error restoring version:', error);
      throw new Error(error.message || 'Failed to restore version');
    }
  },

  /**
   * Create automatic version snapshots based on content changes
   * @param {string} documentId - Document ID
   * @param {string} oldContent - Previous content
   * @param {string} newContent - New content
   * @param {string} userId - User ID making the change
   * @param {string} userName - Name of user making the change
   * @returns {Promise<Object|null>} Created version or null if no snapshot needed
   */
  async createAutoSnapshot(documentId, oldContent, newContent, userId, userName) {
    try {
      // Don't create snapshot if content hasn't changed significantly
      if (!this._shouldCreateAutoSnapshot(oldContent, newContent)) {
        return null;
      }

      // Generate automatic summary of changes
      const changesSummary = this._generateChangesSummary(oldContent, newContent);

      return await this.createSnapshot(documentId, newContent, {
        createdBy: userId,
        createdByName: userName,
        changesSummary,
        isSnapshot: false // Auto-snapshots are not manual snapshots
      });
    } catch (error) {
      console.error('Error creating auto snapshot:', error);
      // Don't throw error for auto-snapshots to avoid disrupting document updates
      return null;
    }
  },

  /**
   * Delete old versions to manage storage (keep recent versions and all manual snapshots)
   * @param {string} documentId - Document ID
   * @param {Object} options - Cleanup options
   * @param {number} options.keepRecentCount - Number of recent versions to keep (default: 50)
   * @param {boolean} options.keepAllSnapshots - Keep all manual snapshots (default: true)
   * @returns {Promise<number>} Number of versions deleted
   */
  async cleanupOldVersions(documentId, options = {}) {
    try {
      const keepRecentCount = options.keepRecentCount || 50;
      const keepAllSnapshots = options.keepAllSnapshots !== false;

      // Get all versions for the document
      const allVersions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCUMENT_VERSIONS,
        [
          Query.equal('documentId', documentId),
          Query.orderDesc('versionNumber')
        ]
      );

      if (allVersions.documents.length <= keepRecentCount) {
        return 0; // No cleanup needed
      }

      // Determine which versions to delete
      const versionsToDelete = [];
      const versions = allVersions.documents;

      for (let i = keepRecentCount; i < versions.length; i++) {
        const version = versions[i];
        
        // Keep manual snapshots if specified
        if (keepAllSnapshots && version.isSnapshot) {
          continue;
        }
        
        versionsToDelete.push(version.$id);
      }

      // Delete versions in batches
      let deletedCount = 0;
      for (const versionId of versionsToDelete) {
        try {
          await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.DOCUMENT_VERSIONS,
            versionId
          );
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting version ${versionId}:`, error);
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old versions:', error);
      throw new Error(error.message || 'Failed to cleanup old versions');
    }
  },

  /**
   * Generate a simple content hash for deduplication
   * @private
   */
  async _generateContentHash(content) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Determine if an auto-snapshot should be created based on content changes
   * @private
   */
  _shouldCreateAutoSnapshot(oldContent, newContent) {
    if (!oldContent || !newContent) return true;
    
    // Calculate change percentage
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    // Create snapshot if significant changes (>10% of lines changed or >100 characters difference)
    const lineDiff = Math.abs(oldLines.length - newLines.length);
    const charDiff = Math.abs(oldContent.length - newContent.length);
    
    const significantLineChange = lineDiff > Math.max(1, oldLines.length * 0.1);
    const significantCharChange = charDiff > 100;
    
    return significantLineChange || significantCharChange;
  },

  /**
   * Generate a summary of changes between two content versions
   * @private
   */
  _generateChangesSummary(oldContent, newContent) {
    if (!oldContent) return 'Initial content';
    if (!newContent) return 'Content cleared';
    
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const lineDiff = newLines.length - oldLines.length;
    const charDiff = newContent.length - oldContent.length;
    
    const changes = [];
    
    if (lineDiff > 0) {
      changes.push(`+${lineDiff} lines`);
    } else if (lineDiff < 0) {
      changes.push(`${lineDiff} lines`);
    }
    
    if (charDiff > 0) {
      changes.push(`+${charDiff} chars`);
    } else if (charDiff < 0) {
      changes.push(`${charDiff} chars`);
    }
    
    return changes.length > 0 ? changes.join(', ') : 'Content modified';
  },

  /**
   * Generate a simple diff between two text contents
   * @private
   */
  _generateDiff(oldContent, newContent) {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const diff = [];
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      
      if (oldLine === undefined) {
        // Line added
        diff.push({
          type: 'added',
          lineNumber: i + 1,
          content: newLine,
          oldLineNumber: null,
          newLineNumber: i + 1
        });
      } else if (newLine === undefined) {
        // Line removed
        diff.push({
          type: 'removed',
          lineNumber: i + 1,
          content: oldLine,
          oldLineNumber: i + 1,
          newLineNumber: null
        });
      } else if (oldLine !== newLine) {
        // Line modified
        diff.push({
          type: 'removed',
          lineNumber: i + 1,
          content: oldLine,
          oldLineNumber: i + 1,
          newLineNumber: null
        });
        diff.push({
          type: 'added',
          lineNumber: i + 1,
          content: newLine,
          oldLineNumber: null,
          newLineNumber: i + 1
        });
      } else {
        // Line unchanged
        diff.push({
          type: 'unchanged',
          lineNumber: i + 1,
          content: oldLine,
          oldLineNumber: i + 1,
          newLineNumber: i + 1
        });
      }
    }
    
    return diff;
  }
};