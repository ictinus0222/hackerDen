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
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const storageFile = await storage.createFile(
        STORAGE_BUCKETS.TEAM_FILES,
        ID.unique(),
        file
      );
      
      console.log('File uploaded successfully:', {
        storageId: storageFile.$id,
        size: storageFile.sizeOriginal
      });

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
          annotationCount: 0,
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
    try {
      const downloadUrl = storage.getFileDownload(STORAGE_BUCKETS.TEAM_FILES, storageId);
      return downloadUrl.href;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
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
   * Download file with proper integrity preservation
   * @param {string} storageId - The storage file ID
   * @param {string} fileName - The file name
   * @returns {Promise<void>}
   */
  async downloadFileWithFallback(storageId, fileName) {
    try {
      // Get the download URL (this should be the original file, not compressed)
      const downloadUrl = this.getFileDownloadUrl(storageId);
      console.log('Download URL:', downloadUrl);
      
      // Also get the view URL for comparison
      const viewUrl = this.getFileViewUrl(storageId);
      console.log('View URL:', viewUrl);
      
      // Method 1: Try direct download first
      try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        link.setAttribute('rel', 'noopener noreferrer');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Direct download initiated');
        return;
      } catch (directError) {
        console.warn('Direct download failed, trying fetch method:', directError);
      }
      
      // Method 2: Use fetch to get the file and ensure it's the original
      console.log('Using fetch method to download original file...');
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Content-Length:', response.headers.get('content-length'));
      
      // Get the file as array buffer to preserve binary data
      const arrayBuffer = await response.arrayBuffer();
      console.log('Downloaded file size:', arrayBuffer.byteLength, 'bytes');
      
      // Create blob with the correct MIME type
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const blob = new Blob([arrayBuffer], { type: contentType });
      
      // Create object URL and download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.setAttribute('rel', 'noopener noreferrer');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('File downloaded successfully via fetch method');
      
    } catch (error) {
      console.error('All download methods failed:', error);
      throw new Error('Failed to download file');
    }
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
  },

  /**
   * Verify file integrity by checking file size
   * @param {string} storageId - The storage file ID
   * @param {number} expectedSize - The expected file size
   * @returns {Promise<boolean>} True if file size matches
   */
  async verifyFileIntegrity(storageId, expectedSize) {
    try {
      // First, get the file info from storage
      const fileInfo = await storage.getFile(STORAGE_BUCKETS.TEAM_FILES, storageId);
      console.log('Storage file info:', {
        id: fileInfo.$id,
        name: fileInfo.name,
        sizeOriginal: fileInfo.sizeOriginal,
        mimeType: fileInfo.mimeType
      });
      
      // Check if the original size matches
      if (fileInfo.sizeOriginal !== expectedSize) {
        console.warn('File size mismatch:', {
          expected: expectedSize,
          actual: fileInfo.sizeOriginal,
          difference: fileInfo.sizeOriginal - expectedSize
        });
        return false;
      }
      
      // Also check the download URL
      const downloadUrl = this.getFileDownloadUrl(storageId);
      const response = await fetch(downloadUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        console.error('Failed to fetch file headers:', response.status);
        return false;
      }
      
      const downloadSize = parseInt(response.headers.get('content-length') || '0');
      const contentType = response.headers.get('content-type');
      
      console.log('Download URL info:', {
        url: downloadUrl,
        downloadSize,
        contentType,
        expectedSize,
        sizeMatch: downloadSize === expectedSize
      });
      
      return downloadSize === expectedSize;
    } catch (error) {
      console.error('Error verifying file integrity:', error);
      return false;
    }
  }
};