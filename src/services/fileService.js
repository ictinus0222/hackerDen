import { databases, storage, DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS, getBucketId, Query, ID } from '@/lib/appwrite';
import { BaseService } from './BaseService.js';

/**
 * File Service for handling team file uploads, storage, and annotations
 * Supports file sharing, preview generation, and collaborative annotations
 */
class FileService extends BaseService {
  constructor() {
    super('FileService');
    
    // File validation constants
    this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    this.ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/markdown', 'text/csv',
      'application/json', 'text/javascript', 'text/css', 'text/html',
      'application/zip', 'application/x-zip-compressed'
    ];
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @throws {Error} If file is invalid
   */
  validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type '${file.type}' not supported. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
    }
  }
  /**
   * Upload a file to team storage
   * @param {string} teamId - Team identifier
   * @param {File} file - File object to upload
   * @param {string} uploadedBy - User ID of uploader
   * @returns {Promise<Object>} File document with metadata
   */
  async uploadFile(teamId, file, uploadedBy) {
    try {
      // Validate inputs
      if (!teamId || !uploadedBy) {
        throw new Error('Team ID and uploader ID are required');
      }

      this.validateFile(file);

      // Upload to Appwrite Storage
      const fileId = ID.unique();
      const storageFile = await storage.createFile(
        getBucketId('TEAM_FILES'),
        fileId,
        file
      );

      // Generate preview URL (only for images)
      let previewUrl = null;
      if (file.type.startsWith('image/')) {
        try {
          const preview = storage.getFilePreview(
            getBucketId('TEAM_FILES'),
            storageFile.$id,
            300, // width
            300, // height
            'center', // gravity
            100 // quality
          );
          previewUrl = preview.href;
        } catch (previewError) {
          console.warn('Could not generate preview for image:', previewError);
          // Continue without preview - not a critical error
        }
      }

      // Create file document in database
      const fileDocument = await this.createDocument(
        COLLECTIONS.FILES,
        {
          teamId,
          uploadedBy,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storageId: storageFile.$id,
          previewUrl,
          annotationCount: 0
        }
      );

      return fileDocument;
    } catch (error) {
      this.handleError('uploadFile', error, { teamId, fileName: file?.name, fileSize: file?.size });
    }
  }

  /**
   * Get all files for a team
   * @param {string} teamId - Team identifier
   * @returns {Promise<Array>} Array of file documents
   */
  async getTeamFiles(teamId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FILES,
        [
          Query.equal('teamId', teamId),
          Query.orderDesc('createdAt'),
          Query.limit(100)
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching team files:', error);
      throw error;
    }
  }

  /**
   * Delete a file and its storage
   * @param {string} fileId - File document ID
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    try {
      // Get file document to get storage ID
      const fileDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId
      );

      // Delete from storage
      await storage.deleteFile(
        getBucketId('TEAM_FILES'),
        fileDoc.storageId
      );

      // Delete annotations
      const annotations = await this.getFileAnnotations(fileId);
      for (const annotation of annotations) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.FILE_ANNOTATIONS,
          annotation.$id
        );
      }

      // Delete file document
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId
      );
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Add annotation to a file
   * @param {string} fileId - File document ID
   * @param {string} userId - User ID adding annotation
   * @param {Object} annotationData - Annotation content and position
   * @returns {Promise<Object>} Annotation document
   */
  async addAnnotation(fileId, userId, annotationData) {
    try {
      const annotation = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FILE_ANNOTATIONS,
        ID.unique(),
        {
          fileId,
          userId,
          content: annotationData.content,
          position: JSON.stringify(annotationData.position),
          type: annotationData.type || 'point',
          createdAt: new Date().toISOString()
        }
      );

      // Update annotation count on file
      const fileDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId,
        {
          annotationCount: fileDoc.annotationCount + 1,
          updatedAt: new Date().toISOString()
        }
      );

      return annotation;
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  }

  /**
   * Get annotations for a file
   * @param {string} fileId - File document ID
   * @returns {Promise<Array>} Array of annotation documents
   */
  async getFileAnnotations(fileId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FILE_ANNOTATIONS,
        [
          Query.equal('fileId', fileId),
          Query.orderAsc('createdAt')
        ]
      );

      return response.documents.map(annotation => ({
        ...annotation,
        position: JSON.parse(annotation.position)
      }));
    } catch (error) {
      console.error('Error fetching file annotations:', error);
      throw error;
    }
  }

  /**
   * Subscribe to file changes for a team
   * @param {string} teamId - Team identifier
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToFiles(teamId, callback) {
    try {
      // Import realtime service dynamically to avoid circular dependencies
      import('./realtimeService.js').then(({ realtimeService }) => {
        const channelName = `databases.${DATABASE_ID}.collections.${COLLECTIONS.FILES}.documents`;
        
        return realtimeService.subscribe(
          channelName,
          (response) => {
            // Filter events for this team only
            if (response.payload?.teamId === teamId) {
              callback(response);
            }
          },
          {
            teamId,
            collection: COLLECTIONS.FILES
          }
        );
      });
    } catch (error) {
      this.handleError('subscribeToFiles', error, { teamId });
      return () => {}; // Return no-op function on error
    }
  }

  /**
   * Get file download URL
   * @param {string} storageId - Storage file ID
   * @returns {string} Download URL
   */
  getFileDownloadUrl(storageId) {
    return storage.getFileDownload(getBucketId('TEAM_FILES'), storageId);
  }

  /**
   * Get file view URL
   * @param {string} storageId - Storage file ID
   * @returns {string} View URL
   */
  getFileViewUrl(storageId) {
    return storage.getFileView(getBucketId('TEAM_FILES'), storageId);
  }
}

export default new FileService();