/**
 * @fileoverview Enhancement Offline Service
 * Provides offline resilience with local storage caching for enhancement data
 */

import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';

/**
 * Offline service for enhancement features
 * Handles caching, offline operations, and sync when back online
 */
class EnhancementOfflineService {
  constructor() {
    this.storagePrefix = 'hackerden_enhancement_';
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Initialize sync queue from localStorage
    this.loadSyncQueue();
  }

  /**
   * Check if we're currently online
   */
  get online() {
    return this.isOnline;
  }

  /**
   * Handle coming back online
   */
  handleOnline() {
    console.log('Enhancement features: Back online, starting sync...');
    this.isOnline = true;
    this.syncOfflineData();
    this.dispatchEvent('online');
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('Enhancement features: Gone offline, enabling offline mode...');
    this.isOnline = false;
    this.dispatchEvent('offline');
  }

  /**
   * Dispatch custom events for online/offline status
   */
  dispatchEvent(type) {
    const event = new CustomEvent(`enhancement-${type}`, {
      detail: { timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  }

  /**
   * Generate cache key for data
   */
  getCacheKey(type, identifier) {
    return `${this.storagePrefix}${type}_${identifier}`;
  }

  /**
   * Store data in localStorage with metadata
   */
  cacheData(type, identifier, data, metadata = {}) {
    try {
      const cacheEntry = {
        data,
        metadata: {
          ...metadata,
          cachedAt: new Date().toISOString(),
          type,
          identifier
        }
      };
      
      const key = this.getCacheKey(type, identifier);
      localStorage.setItem(key, JSON.stringify(cacheEntry));
      
      // Update cache index
      this.updateCacheIndex(type, identifier);
      
      return true;
    } catch (error) {
      console.error('Failed to cache data:', error);
      return false;
    }
  }

  /**
   * Retrieve data from localStorage
   */
  getCachedData(type, identifier) {
    try {
      const key = this.getCacheKey(type, identifier);
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;
      
      const cacheEntry = JSON.parse(cached);
      
      // Check if cache is expired (24 hours default)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      const cacheAge = Date.now() - new Date(cacheEntry.metadata.cachedAt).getTime();
      
      if (cacheAge > maxAge) {
        this.removeCachedData(type, identifier);
        return null;
      }
      
      return cacheEntry;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Remove cached data
   */
  removeCachedData(type, identifier) {
    try {
      const key = this.getCacheKey(type, identifier);
      localStorage.removeItem(key);
      this.removeFromCacheIndex(type, identifier);
      return true;
    } catch (error) {
      console.error('Failed to remove cached data:', error);
      return false;
    }
  }

  /**
   * Update cache index for efficient lookups
   */
  updateCacheIndex(type, identifier) {
    try {
      const indexKey = `${this.storagePrefix}index_${type}`;
      const existing = JSON.parse(localStorage.getItem(indexKey) || '[]');
      
      if (!existing.includes(identifier)) {
        existing.push(identifier);
        localStorage.setItem(indexKey, JSON.stringify(existing));
      }
    } catch (error) {
      console.error('Failed to update cache index:', error);
    }
  }

  /**
   * Remove from cache index
   */
  removeFromCacheIndex(type, identifier) {
    try {
      const indexKey = `${this.storagePrefix}index_${type}`;
      const existing = JSON.parse(localStorage.getItem(indexKey) || '[]');
      const filtered = existing.filter(id => id !== identifier);
      localStorage.setItem(indexKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from cache index:', error);
    }
  }

  /**
   * Get all cached items of a specific type
   */
  getAllCachedData(type) {
    try {
      const indexKey = `${this.storagePrefix}index_${type}`;
      const identifiers = JSON.parse(localStorage.getItem(indexKey) || '[]');
      
      const cachedItems = [];
      for (const identifier of identifiers) {
        const cached = this.getCachedData(type, identifier);
        if (cached) {
          cachedItems.push(cached);
        }
      }
      
      return cachedItems;
    } catch (error) {
      console.error('Failed to get all cached data:', error);
      return [];
    }
  }

  /**
   * Add operation to sync queue for when back online
   */
  queueForSync(operation) {
    try {
      const queueItem = {
        id: Date.now() + Math.random(),
        operation,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3
      };
      
      this.syncQueue.push(queueItem);
      this.saveSyncQueue();
      
      console.log('Queued operation for sync:', operation.type);
      return queueItem.id;
    } catch (error) {
      console.error('Failed to queue operation for sync:', error);
      return null;
    }
  }

  /**
   * Save sync queue to localStorage
   */
  saveSyncQueue() {
    try {
      const queueKey = `${this.storagePrefix}sync_queue`;
      localStorage.setItem(queueKey, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Load sync queue from localStorage
   */
  loadSyncQueue() {
    try {
      const queueKey = `${this.storagePrefix}sync_queue`;
      const saved = localStorage.getItem(queueKey);
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Sync offline data when back online
   */
  async syncOfflineData() {
    if (this.syncInProgress || !this.isOnline) return;
    
    this.syncInProgress = true;
    console.log(`Starting sync of ${this.syncQueue.length} queued operations...`);
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Process sync queue
    const queueCopy = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const queueItem of queueCopy) {
      try {
        await this.processSyncItem(queueItem);
        results.successful++;
      } catch (error) {
        console.error('Sync failed for item:', queueItem, error);
        results.failed++;
        results.errors.push({ item: queueItem, error: error.message });
        
        // Retry logic
        if (queueItem.retryCount < queueItem.maxRetries) {
          queueItem.retryCount++;
          this.syncQueue.push(queueItem);
        }
      }
    }
    
    this.saveSyncQueue();
    this.syncInProgress = false;
    
    console.log('Sync completed:', results);
    
    // Dispatch sync completion event
    const event = new CustomEvent('enhancement-sync-complete', {
      detail: results
    });
    window.dispatchEvent(event);
    
    return results;
  }

  /**
   * Process individual sync item
   */
  async processSyncItem(queueItem) {
    const { operation } = queueItem;
    
    switch (operation.type) {
      case 'file_upload':
        return await this.syncFileUpload(operation);
      case 'idea_create':
        return await this.syncIdeaCreate(operation);
      case 'idea_vote':
        return await this.syncIdeaVote(operation);
      case 'poll_create':
        return await this.syncPollCreate(operation);
      case 'poll_vote':
        return await this.syncPollVote(operation);
      case 'submission_update':
        return await this.syncSubmissionUpdate(operation);
      case 'annotation_add':
        return await this.syncAnnotationAdd(operation);
      default:
        throw new Error(`Unknown sync operation type: ${operation.type}`);
    }
  }

  /**
   * Sync file upload operation
   */
  async syncFileUpload(operation) {
    // File uploads can't be synced from cache since we don't store file blobs
    // This would need to be handled by re-prompting the user
    console.warn('File upload sync not implemented - user needs to re-upload');
    throw new Error('File upload sync requires user intervention');
  }

  /**
   * Sync idea creation
   */
  async syncIdeaCreate(operation) {
    const { ideaService } = await import('./ideaService');
    return await ideaService.createIdea(
      operation.data.teamId,
      operation.data.hackathonId,
      operation.data.ideaData
    );
  }

  /**
   * Sync idea vote
   */
  async syncIdeaVote(operation) {
    const { ideaService } = await import('./ideaService');
    return await ideaService.voteOnIdea(
      operation.data.ideaId,
      operation.data.userId,
      operation.data.teamId,
      operation.data.hackathonId
    );
  }

  /**
   * Sync poll creation
   */
  async syncPollCreate(operation) {
    const { default: pollService } = await import('./pollService');
    return await pollService.createPoll(
      operation.data.teamId,
      operation.data.createdBy,
      operation.data.pollData,
      operation.data.hackathonId,
      operation.data.creatorName
    );
  }

  /**
   * Sync poll vote
   */
  async syncPollVote(operation) {
    const { default: pollService } = await import('./pollService');
    return await pollService.voteOnPoll(
      operation.data.pollId,
      operation.data.userId,
      operation.data.selectedOptions,
      operation.data.hackathonId,
      operation.data.voterName
    );
  }

  /**
   * Sync submission update
   */
  async syncSubmissionUpdate(operation) {
    const { submissionService } = await import('./submissionService');
    return await submissionService.updateSubmission(
      operation.data.submissionId,
      operation.data.updates
    );
  }

  /**
   * Sync annotation addition
   */
  async syncAnnotationAdd(operation) {
    const { fileService } = await import('./fileService');
    return await fileService.addAnnotation(
      operation.data.fileId,
      operation.data.userId,
      operation.data.annotationData,
      operation.data.hackathonId,
      operation.data.annotatorName
    );
  }

  /**
   * Clear all cached data (for cleanup or reset)
   */
  clearAllCache() {
    try {
      const keys = Object.keys(localStorage);
      const enhancementKeys = keys.filter(key => key.startsWith(this.storagePrefix));
      
      for (const key of enhancementKeys) {
        localStorage.removeItem(key);
      }
      
      this.syncQueue = [];
      console.log(`Cleared ${enhancementKeys.length} cached enhancement items`);
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    try {
      const keys = Object.keys(localStorage);
      const enhancementKeys = keys.filter(key => key.startsWith(this.storagePrefix));
      
      const stats = {
        totalItems: enhancementKeys.length,
        syncQueueSize: this.syncQueue.length,
        cacheSize: 0,
        types: {}
      };
      
      for (const key of enhancementKeys) {
        const value = localStorage.getItem(key);
        stats.cacheSize += value ? value.length : 0;
        
        // Extract type from key
        const type = key.replace(this.storagePrefix, '').split('_')[0];
        stats.types[type] = (stats.types[type] || 0) + 1;
      }
      
      // Convert bytes to KB
      stats.cacheSizeKB = Math.round(stats.cacheSize / 1024);
      
      return stats;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * Enhanced data fetching with offline fallback
   */
  async fetchWithOfflineFallback(type, identifier, fetchFunction, cacheMetadata = {}) {
    try {
      if (this.isOnline) {
        // Try to fetch fresh data
        const freshData = await fetchFunction();
        
        // Cache the fresh data
        this.cacheData(type, identifier, freshData, {
          ...cacheMetadata,
          source: 'online'
        });
        
        return {
          data: freshData,
          source: 'online',
          cached: false
        };
      } else {
        throw new Error('Offline - using cached data');
      }
    } catch (error) {
      // Fallback to cached data
      const cached = this.getCachedData(type, identifier);
      
      if (cached) {
        console.log(`Using cached data for ${type}:${identifier}`);
        return {
          data: cached.data,
          source: 'cache',
          cached: true,
          cachedAt: cached.metadata.cachedAt
        };
      }
      
      // No cached data available
      throw new Error(`No data available offline for ${type}:${identifier}`);
    }
  }

  /**
   * Enhanced data mutation with offline queueing
   */
  async mutateWithOfflineQueue(operation, mutationFunction) {
    try {
      if (this.isOnline) {
        // Try to perform mutation online
        const result = await mutationFunction();
        return {
          result,
          queued: false,
          source: 'online'
        };
      } else {
        // Queue for later sync
        const queueId = this.queueForSync(operation);
        return {
          result: null,
          queued: true,
          queueId,
          source: 'offline'
        };
      }
    } catch (error) {
      if (!this.isOnline) {
        // Queue for later sync
        const queueId = this.queueForSync(operation);
        return {
          result: null,
          queued: true,
          queueId,
          source: 'offline',
          error: error.message
        };
      }
      
      throw error;
    }
  }

  /**
   * Get offline status and capabilities
   */
  getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      syncQueueSize: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
      cacheStats: this.getCacheStats(),
      lastSyncAttempt: this.lastSyncAttempt || null
    };
  }
}

// Create singleton instance
const enhancementOfflineService = new EnhancementOfflineService();

export default enhancementOfflineService;