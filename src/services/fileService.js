/**
 * @fileoverview File Service for HackerDen Enhancement Features
 * Handles file uploads, storage, annotations, and team file management
 */

import { databases, storage, DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS, Query, ID } from '../lib/appwrite';
import client from '../lib/appwrite';

export const fileService = {
  /**
   * Upload a file to team storage
   * @param {string} teamId - The team ID
   * @param {File} file - The file to upload
   * @param {string} uploadedBy - User ID of uploader
   * @param {string} hackathonId - Hackathon ID for chat integration
   * @param {string} uploaderName - Name of uploader for chat messages
   * @returns {Promise<Object>} File document
   */
  async uploadFile(teamId, file, uploadedBy, hackathonId = null, uploaderName = 'Team Member') {
    try {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json',
        'text/javascript', 'application/javascript', 'text/typescript', 'text/jsx',
        'text/css', 'text/html', 'text/xml', 'application/zip', 'application/x-tar',
        'application/gzip'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported');
      }

      // Upload to Appwrite Storage
      const storageFile = await storage.createFile(
        STORAGE_BUCKETS.TEAM_FILES,
        ID.unique(),
        file
      );

      // Generate preview URL
      const previewUrl = storage.getFilePreview(
        STORAGE_BUCKETS.TEAM_FILES,
        storageFile.$id,
        300, // width
        300, // height
        'center', // gravity
        80 // quality
      );

      // Create file document in database
      const fileDocument = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        ID.unique(),
        {
          teamId,
          uploadedBy,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storageId: storageFile.$id,
          previewUrl: previewUrl.href,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );


      // Send file upload notification to chat
      if (hackathonId) {
        try {
          // Import messageService dynamically to avoid circular dependency
          const messageServiceModule = await import('./messageService.js');
          await messageServiceModule.messageService.sendFileUploadMessage(
            teamId,
            hackathonId,
            file.name,
            uploaderName,
            file.type
          );
        } catch (chatError) {
          console.warn('Failed to send file upload notification to chat:', chatError);
          // Don't fail file upload if chat notification fails
        }
      }

      return fileDocument;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  },

  /**
   * Get all files for a team
   * @param {string} teamId - The team ID
   * @returns {Promise<Array>} Array of file documents
   */
  async getTeamFiles(teamId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FILES,
        [
          Query.equal('teamId', teamId),
          Query.orderDesc('createdAt')
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error fetching team files:', error);
      throw new Error(`Failed to fetch team files: ${error.message}`);
    }
  },

  /**
   * Delete a file
   * @param {string} fileId - The file document ID
   * @param {string} userId - User ID requesting deletion
   * @returns {Promise<Object>} Success response
   */
  async deleteFile(fileId, userId) {
    try {
      // Get file document first
      const fileDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId
      );

      // Check if user has permission to delete (file owner or team member)
      if (fileDoc.uploadedBy !== userId) {
        // In a full implementation, you'd check team membership here
        console.warn('User attempting to delete file they did not upload');
      }

      // Delete from storage
      await storage.deleteFile(
        STORAGE_BUCKETS.TEAM_FILES,
        fileDoc.storageId
      );

      // Delete file document
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId
      );


      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  },


  /**
   * Get file download URL
   * @param {string} storageId - The storage file ID
   * @returns {string} Download URL
   */
  getFileDownloadUrl(storageId) {
    return storage.getFileDownload(STORAGE_BUCKETS.TEAM_FILES, storageId).href;
  },

  /**
   * Get file view URL
   * @param {string} storageId - The storage file ID
   * @returns {string} View URL
   */
  getFileViewUrl(storageId) {
    return storage.getFileView(STORAGE_BUCKETS.TEAM_FILES, storageId).href;
  },

  /**
   * Subscribe to real-time file updates
   * @param {string} teamId - The team ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToFiles(teamId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.FILES}.documents`,
        (response) => {
          // Only process events for this team
          if (response.payload.teamId === teamId) {
            callback(response);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to files:', error);
      throw new Error('Failed to subscribe to file updates');
    }
  },

  /**
   * Attach file to a task
   * @param {string} fileId - The file document ID
   * @param {string} taskId - The task document ID
   * @param {string} userId - User ID performing the attachment
   * @param {string} hackathonId - Hackathon ID for chat integration
   * @param {string} userName - User name for chat messages
   * @returns {Promise<Object>} Updated task document
   */
  async attachFileToTask(fileId, taskId, userId, hackathonId = null, userName = 'Team Member') {
    try {
      // Get file details
      const fileDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId
      );

      // Import taskService dynamically to avoid circular dependency
      const { taskService } = await import('./taskService');
      
      // Attach file to task
      const updatedTask = await taskService.attachFilesToTask(
        taskId,
        [fileId],
        fileDoc.teamId,
        hackathonId,
        userId,
        userName
      );

      return updatedTask;
    } catch (error) {
      console.error('Error attaching file to task:', error);
      throw new Error(`Failed to attach file to task: ${error.message}`);
    }
  },

  /**
   * Remove file from a task
   * @param {string} fileId - The file document ID
   * @param {string} taskId - The task document ID
   * @param {string} userId - User ID performing the removal
   * @param {string} hackathonId - Hackathon ID for chat integration
   * @param {string} userName - User name for chat messages
   * @returns {Promise<Object>} Updated task document
   */
  async removeFileFromTask(fileId, taskId, userId, hackathonId = null, userName = 'Team Member') {
    try {
      // Get file details
      const fileDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId
      );

      // Import taskService dynamically to avoid circular dependency
      const { taskService } = await import('./taskService');
      
      // Remove file from task
      const updatedTask = await taskService.removeFilesFromTask(
        taskId,
        [fileId],
        fileDoc.teamId,
        hackathonId,
        userId,
        userName
      );

      return updatedTask;
    } catch (error) {
      console.error('Error removing file from task:', error);
      throw new Error(`Failed to remove file from task: ${error.message}`);
    }
  },

  /**
   * Get tasks that have this file attached
   * @param {string} fileId - The file document ID
   * @returns {Promise<Array>} Array of task documents
   */
  async getTasksWithFile(fileId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        [
          Query.contains('attachedFiles', fileId),
          Query.orderDesc('$createdAt')
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error getting tasks with file:', error);
      throw new Error(`Failed to get tasks with file: ${error.message}`);
    }
  },

  /**
   * Subscribe to real-time annotation updates
   * @param {string} fileId - The file ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToAnnotations(fileId, callback) {
    throw new Error('File annotation features have been removed for final submission');
  },

  /**
   * Update file name
   * @param {string} fileId - The file document ID
   * @param {string} newFileName - The new file name
   * @returns {Promise<Object>} Updated file document
   */
  async updateFileName(fileId, newFileName) {
    try {
      const updatedFile = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FILES,
        fileId,
        {
          fileName: newFileName,
          updatedAt: new Date().toISOString()
        }
      );

      return updatedFile;
    } catch (error) {
      console.error('Error updating file name:', error);
      throw new Error('Failed to update file name');
    }
  }
};