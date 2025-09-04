import { databases, storage, DATABASE_ID, COLLECTIONS, Query, ID } from '@/lib/appwrite';

/**
 * Base service class providing common functionality for all services
 * Ensures consistent error handling, logging, and database operations
 */
export class BaseService {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.databases = databases;
    this.storage = storage;
    this.DATABASE_ID = DATABASE_ID;
    this.COLLECTIONS = COLLECTIONS;
    this.Query = Query;
    this.ID = ID;
  }

  /**
   * Standardized error handling with context
   * @param {string} operation - Operation being performed
   * @param {Error} error - Original error
   * @param {Object} context - Additional context for debugging
   */
  handleError(operation, error, context = {}) {
    const errorMessage = `${this.serviceName} - ${operation} failed`;
    console.error(errorMessage, {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Re-throw with enhanced context
    const enhancedError = new Error(`${errorMessage}: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.context = context;
    throw enhancedError;
  }

  /**
   * Standardized success logging
   * @param {string} operation - Operation performed
   * @param {Object} result - Operation result
   * @param {Object} context - Additional context
   */
  logSuccess(operation, result, context = {}) {
    console.log(`${this.serviceName} - ${operation} successful`, {
      resultId: result?.$id,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Create document with standardized error handling
   * @param {string} collectionId - Collection identifier
   * @param {Object} data - Document data
   * @param {string} documentId - Optional document ID
   */
  async createDocument(collectionId, data, documentId = null) {
    try {
      const result = await this.databases.createDocument(
        this.DATABASE_ID,
        collectionId,
        documentId || this.ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      
      this.logSuccess('createDocument', result, { collectionId });
      return result;
    } catch (error) {
      this.handleError('createDocument', error, { collectionId, data });
    }
  }

  /**
   * Update document with standardized error handling
   * @param {string} collectionId - Collection identifier
   * @param {string} documentId - Document ID
   * @param {Object} data - Update data
   */
  async updateDocument(collectionId, documentId, data) {
    try {
      const result = await this.databases.updateDocument(
        this.DATABASE_ID,
        collectionId,
        documentId,
        {
          ...data,
          updatedAt: new Date().toISOString()
        }
      );
      
      this.logSuccess('updateDocument', result, { collectionId, documentId });
      return result;
    } catch (error) {
      this.handleError('updateDocument', error, { collectionId, documentId, data });
    }
  }

  /**
   * Delete document with standardized error handling
   * @param {string} collectionId - Collection identifier
   * @param {string} documentId - Document ID
   */
  async deleteDocument(collectionId, documentId) {
    try {
      await this.databases.deleteDocument(
        this.DATABASE_ID,
        collectionId,
        documentId
      );
      
      this.logSuccess('deleteDocument', { $id: documentId }, { collectionId, documentId });
    } catch (error) {
      this.handleError('deleteDocument', error, { collectionId, documentId });
    }
  }

  /**
   * List documents with standardized error handling and pagination
   * @param {string} collectionId - Collection identifier
   * @param {Array} queries - Query array
   * @param {number} limit - Results limit (default: 25)
   */
  async listDocuments(collectionId, queries = [], limit = 25) {
    try {
      const result = await this.databases.listDocuments(
        this.DATABASE_ID,
        collectionId,
        [
          ...queries,
          this.Query.limit(limit)
        ]
      );
      
      this.logSuccess('listDocuments', result, { 
        collectionId, 
        count: result.documents.length,
        total: result.total 
      });
      return result;
    } catch (error) {
      this.handleError('listDocuments', error, { collectionId, queries });
    }
  }
}