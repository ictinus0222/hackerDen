import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../lib/appwrite';

/**
 * Simple document service for a single collaborative document per team
 */
export const simpleDocumentService = {
  /**
   * Get or create the team's collaborative document
   * @param {string} teamId - Team ID
   * @param {string} hackathonId - Hackathon ID
   * @returns {Promise<Object>} Document data
   */
  async getTeamDocument(teamId, hackathonId) {
    try {
      // Try to find existing document for this team
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        [
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId)
        ]
      );

      if (result.documents.length > 0) {
        return result.documents[0];
      }

      // Create new document if none exists
      return await this.createTeamDocument(teamId, hackathonId);
    } catch (error) {
      console.error('Error getting team document:', error);
      throw new Error('Failed to load team document');
    }
  },

  /**
   * Create a new team document
   * @param {string} teamId - Team ID
   * @param {string} hackathonId - Hackathon ID
   * @returns {Promise<Object>} Created document
   */
  async createTeamDocument(teamId, hackathonId) {
    try {
      const document = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        ID.unique(),
        {
          teamId,
          hackathonId,
          title: 'Team Collaborative Document',
          content: '# Welcome to your team document!\n\nStart collaborating here...',
          contentVersion: 1
        }
      );

      return document;
    } catch (error) {
      console.error('Error creating team document:', error);
      throw new Error('Failed to create team document');
    }
  },

  /**
   * Update document content
   * @param {string} documentId - Document ID
   * @param {string} content - New content
   * @param {string} title - New title (optional)
   * @returns {Promise<Object>} Updated document
   */
  async updateDocument(documentId, content, title = null) {
    try {
      const updateData = {
        content,
        contentVersion: Date.now() // Simple versioning using timestamp
      };

      if (title) {
        updateData.title = title;
      }

      const document = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        documentId,
        updateData
      );

      return document;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }
};