/**
 * @fileoverview Enhanced File Service with comprehensive error handling
 * Wraps the original fileService with retry mechanisms, offline support, and user feedback
 */

import { fileService } from './fileService';
import enhancementOfflineService from './EnhancementOfflineService';
import { toast } from 'sonner';

/**
 * Enhanced file service with error handling and offline support
 */
class EnhancedFileService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.uploadProgress = new Map();
  }

  /**
   * Enhanced file upload with progress tracking and error handling
   */
  async uploadFile(teamId, file, uploadedBy, hackathonId = null, uploaderName = 'Team Member', options = {}) {
    const {
      onProgress,
      onError,
      onSuccess,
      maxFileSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json',
        'text/javascript', 'application/javascript', 'text/typescript', 'text/jsx',
        'text/css', 'text/html', 'text/xml', 'application/zip', 'application/x-tar',
        'application/gzip'
      ]
    } = options;

    const uploadId = `upload_${Date.now()}_${Math.random()}`;
    
    try {
      // Validate file size
      if (file.size > maxFileSize) {
        const error = new Error(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
        error.type = 'validation';
        error.details = { fileSize: file.size, maxSize: maxFileSize };
        throw error;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        const error = new Error(`File type ${file.type} is not supported`);
        error.type = 'validation';
        error.details = { fileType: file.type, allowedTypes };
        throw error;
      }

      // Check if online
      if (!enhancementOfflineService.online) {
        const error = new Error('File uploads require an internet connection');
        error.type = 'network';
        error.details = { offline: true };
        throw error;
      }

      // Initialize progress tracking
      this.uploadProgress.set(uploadId, { progress: 0, status: 'starting' });
      onProgress?.(0, 'starting');

      // Simulate progress updates (in real implementation, this would come from Appwrite)
      const progressInterval = setInterval(() => {
        const current = this.uploadProgress.get(uploadId);
        if (current && current.progress < 90) {
          const newProgress = Math.min(current.progress + Math.random() * 20, 90);
          this.uploadProgress.set(uploadId, { ...current, progress: newProgress });
          onProgress?.(newProgress, 'uploading');
        }
      }, 500);

      try {
        // Perform the actual upload
        const result = await this.executeWithRetry(
          () => fileService.uploadFile(teamId, file, uploadedBy, hackathonId, uploaderName),
          {
            maxRetries: this.maxRetries,
            retryDelay: this.retryDelay,
            operation: 'file_upload',
            context: { fileName: file.name, fileSize: file.size }
          }
        );

        // Complete progress
        clearInterval(progressInterval);
        this.uploadProgress.set(uploadId, { progress: 100, status: 'complete' });
        onProgress?.(100, 'complete');

        // Success callback and toast
        onSuccess?.(result);
        toast.success('File Uploaded', {
          description: `"${file.name}" uploaded successfully`
        });

        return {
          success: true,
          data: result,
          uploadId
        };

      } finally {
        clearInterval(progressInterval);
        this.uploadProgress.delete(uploadId);
      }

    } catch (error) {
      // Clear progress tracking
      this.uploadProgress.delete(uploadId);
      onProgress?.(0, 'error');

      // Enhanced error handling
      const enhancedError = this.enhanceError(error, 'uploadFile', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        teamId,
        uploadedBy
      });

      // Error callback and toast
      onError?.(enhancedError);
      toast.error('Upload Failed', {
        description: enhancedError.message,
        action: enhancedError.retryable ? {
          label: 'Retry',
          onClick: () => this.uploadFile(teamId, file, uploadedBy, hackathonId, uploaderName, options)
        } : undefined
      });

      return {
        success: false,
        error: enhancedError,
        uploadId
      };
    }
  }

  /**
   * Enhanced file retrieval with caching
   */
  async getTeamFiles(teamId, options = {}) {
    const { useCache = true, onError } = options;
    const cacheKey = `team_files_${teamId}`;

    try {
      const result = await enhancementOfflineService.fetchWithOfflineFallback(
        'files',
        teamId,
        () => fileService.getTeamFiles(teamId),
        { teamId }
      );

      if (result.source === 'cache') {
        toast.info('Using Cached Data', {
          description: 'Showing cached files (offline mode)'
        });
      }

      return {
        success: true,
        data: result.data,
        source: result.source,
        cached: result.cached
      };

    } catch (error) {
      const enhancedError = this.enhanceError(error, 'getTeamFiles', { teamId });
      onError?.(enhancedError);

      if (!enhancementOfflineService.online) {
        toast.error('No Cached Files', {
          description: 'No files available offline'
        });
      }

      return {
        success: false,
        error: enhancedError
      };
    }
  }

  /**
   * Enhanced file deletion with confirmation
   */
  async deleteFile(fileId, userId, options = {}) {
    const { confirmDelete = true, onError, onSuccess } = options;

    try {
      // Show confirmation if requested
      if (confirmDelete) {
        const confirmed = await this.showDeleteConfirmation();
        if (!confirmed) {
          return { success: false, cancelled: true };
        }
      }

      const result = await this.executeWithRetry(
        () => fileService.deleteFile(fileId, userId),
        {
          maxRetries: this.maxRetries,
          retryDelay: this.retryDelay,
          operation: 'file_delete',
          context: { fileId, userId }
        }
      );

      // Remove from cache
      enhancementOfflineService.removeCachedData('file', fileId);

      onSuccess?.(result);
      toast.success('File Deleted', {
        description: 'File deleted successfully'
      });

      return {
        success: true,
        data: result
      };

    } catch (error) {
      const enhancedError = this.enhanceError(error, 'deleteFile', { fileId, userId });
      onError?.(enhancedError);

      toast.error('Delete Failed', {
        description: enhancedError.message
      });

      return {
        success: false,
        error: enhancedError
      };
    }
  }

  /**
   * Enhanced annotation addition with offline queueing
   */
  async addAnnotation(fileId, userId, annotationData, hackathonId = null, annotatorName = 'Team Member', options = {}) {
    const { onError, onSuccess } = options;

    try {
      const operation = {
        type: 'annotation_add',
        data: {
          fileId,
          userId,
          annotationData,
          hackathonId,
          annotatorName
        }
      };

      const result = await enhancementOfflineService.mutateWithOfflineQueue(
        operation,
        () => fileService.addAnnotation(fileId, userId, annotationData, hackathonId, annotatorName)
      );

      if (result.queued) {
        toast.info('Annotation Queued', {
          description: 'Annotation will be added when back online'
        });
      } else {
        onSuccess?.(result.result);
        toast.success('Annotation Added', {
          description: 'Annotation added successfully'
        });
      }

      return {
        success: true,
        data: result.result,
        queued: result.queued,
        queueId: result.queueId
      };

    } catch (error) {
      const enhancedError = this.enhanceError(error, 'addAnnotation', {
        fileId,
        userId,
        annotationData
      });

      onError?.(enhancedError);
      toast.error('Annotation Failed', {
        description: enhancedError.message
      });

      return {
        success: false,
        error: enhancedError
      };
    }
  }

  /**
   * Enhanced file annotations retrieval with caching
   */
  async getFileAnnotations(fileId, options = {}) {
    const { useCache = true, onError } = options;

    try {
      const result = await enhancementOfflineService.fetchWithOfflineFallback(
        'annotations',
        fileId,
        () => fileService.getFileAnnotations(fileId),
        { fileId }
      );

      return {
        success: true,
        data: result.data,
        source: result.source,
        cached: result.cached
      };

    } catch (error) {
      const enhancedError = this.enhanceError(error, 'getFileAnnotations', { fileId });
      onError?.(enhancedError);

      return {
        success: false,
        error: enhancedError
      };
    }
  }

  /**
   * Batch file operations with individual error tracking
   */
  async batchFileOperation(files, operation, operationFunction, options = {}) {
    const { onProgress, onError, continueOnError = true } = options;
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(i, files.length, file);

      try {
        const result = await operationFunction(file, i);
        results.push({ success: true, data: result, file });
        successCount++;
      } catch (error) {
        const enhancedError = this.enhanceError(error, operation, { file, index: i });
        results.push({ success: false, error: enhancedError, file });
        errorCount++;

        if (!continueOnError) {
          break;
        }
      }
    }

    // Show summary toast
    if (errorCount === 0) {
      toast.success('Batch Operation Complete', {
        description: `All ${files.length} files processed successfully`
      });
    } else if (successCount > 0) {
      toast.warning('Partial Success', {
        description: `${successCount} succeeded, ${errorCount} failed`
      });
    } else {
      toast.error('Batch Operation Failed', {
        description: `All ${files.length} operations failed`
      });
    }

    return {
      success: errorCount === 0,
      results,
      successCount,
      errorCount,
      total: files.length
    };
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry(operation, options = {}) {
    const { maxRetries = 3, retryDelay = 1000, context = {} } = options;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          // Calculate exponential backoff delay
          const delay = retryDelay * Math.pow(2, attempt);
          
          toast.info('Retrying Operation', {
            description: `Attempt ${attempt + 2}/${maxRetries + 1} in ${delay / 1000}s`
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Enhance error with additional context and metadata
   */
  enhanceError(error, operation, context = {}) {
    const enhancedError = new Error(error.message);
    enhancedError.originalError = error;
    enhancedError.operation = operation;
    enhancedError.context = context;
    enhancedError.timestamp = new Date().toISOString();
    
    // Categorize error type
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      enhancedError.type = 'network';
      enhancedError.retryable = true;
    } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
      enhancedError.type = 'permission';
      enhancedError.retryable = false;
    } else if (error.message?.includes('storage') || error.message?.includes('file')) {
      enhancedError.type = 'storage';
      enhancedError.retryable = true;
    } else if (error.message?.includes('validation') || error.message?.includes('invalid')) {
      enhancedError.type = 'validation';
      enhancedError.retryable = false;
    } else {
      enhancedError.type = error.type || 'unknown';
      enhancedError.retryable = true;
    }

    return enhancedError;
  }

  /**
   * Show delete confirmation dialog
   */
  async showDeleteConfirmation() {
    return new Promise((resolve) => {
      // In a real implementation, this would show a proper dialog
      // For now, using browser confirm
      const confirmed = window.confirm('Are you sure you want to delete this file?');
      resolve(confirmed);
    });
  }

  /**
   * Get upload progress for a specific upload
   */
  getUploadProgress(uploadId) {
    return this.uploadProgress.get(uploadId) || { progress: 0, status: 'unknown' };
  }

  /**
   * Cancel an ongoing upload
   */
  cancelUpload(uploadId) {
    if (this.uploadProgress.has(uploadId)) {
      this.uploadProgress.set(uploadId, { progress: 0, status: 'cancelled' });
      toast.info('Upload Cancelled');
      return true;
    }
    return false;
  }

  /**
   * Get file service statistics
   */
  getServiceStats() {
    return {
      activeUploads: this.uploadProgress.size,
      cacheStats: enhancementOfflineService.getCacheStats(),
      offlineStatus: enhancementOfflineService.getOfflineStatus()
    };
  }
}

// Create singleton instance
const enhancedFileService = new EnhancedFileService();

export default enhancedFileService;