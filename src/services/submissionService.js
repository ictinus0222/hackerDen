import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '@/lib/appwrite';

/**
 * Submission Service for managing hackathon judge submissions
 * Handles submission creation, public page generation, and finalization
 */
class SubmissionService {
  /**
   * Create a new submission for a team
   * @param {string} teamId - Team identifier
   * @param {Object} submissionData - Submission content
   * @returns {Promise<Object>} Submission document
   */
  async createSubmission(teamId, submissionData) {
    try {
      // Check if submission already exists for team
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        [Query.equal('teamId', teamId)]
      );

      if (existing.documents.length > 0) {
        throw new Error('Submission already exists for this team');
      }

      const submissionId = ID.unique();
      const publicUrl = this.generateSubmissionUrl(submissionId);

      const submission = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        submissionId,
        {
          teamId,
          title: submissionData.title || '',
          description: submissionData.description || '',
          techStack: submissionData.techStack || [],
          challenges: submissionData.challenges || '',
          accomplishments: submissionData.accomplishments || '',
          futureWork: submissionData.futureWork || '',
          demoUrl: submissionData.demoUrl || '',
          repositoryUrl: submissionData.repositoryUrl || '',
          isFinalized: false,
          publicUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return submission;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  /**
   * Update an existing submission
   * @param {string} submissionId - Submission document ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated submission document
   */
  async updateSubmission(submissionId, updates) {
    try {
      // Check if submission is finalized
      const submission = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        submissionId
      );

      if (submission.isFinalized) {
        throw new Error('Cannot update finalized submission');
      }

      const updatedSubmission = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        submissionId,
        {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      );

      return updatedSubmission;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }

  /**
   * Get submission by team ID
   * @param {string} teamId - Team identifier
   * @returns {Promise<Object|null>} Submission document
   */
  async getTeamSubmission(teamId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        [Query.equal('teamId', teamId)]
      );

      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
      console.error('Error getting team submission:', error);
      return null;
    }
  }

  /**
   * Get public submission data (for judges)
   * @param {string} submissionId - Submission document ID
   * @returns {Promise<Object>} Public submission data
   */
  async getPublicSubmission(submissionId) {
    try {
      const submission = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        submissionId
      );

      // Get additional team data for public view
      const teamData = await this.getTeamDataForSubmission(submission.teamId);

      return {
        ...submission,
        teamData
      };
    } catch (error) {
      console.error('Error getting public submission:', error);
      throw error;
    }
  }

  /**
   * Get team data for submission display
   * @param {string} teamId - Team identifier
   * @returns {Promise<Object>} Team data for submission
   */
  async getTeamDataForSubmission(teamId) {
    try {
      // This will integrate with existing team and task services
      // For now, return placeholder structure
      return {
        teamName: 'Team Name',
        members: [],
        completedTasks: 0,
        totalTasks: 0,
        files: [],
        progress: {
          tasksCompleted: 0,
          filesShared: 0,
          ideasImplemented: 0
        }
      };
    } catch (error) {
      console.error('Error getting team data for submission:', error);
      return {
        teamName: 'Unknown Team',
        members: [],
        completedTasks: 0,
        totalTasks: 0,
        files: [],
        progress: {
          tasksCompleted: 0,
          filesShared: 0,
          ideasImplemented: 0
        }
      };
    }
  }

  /**
   * Finalize submission (prevent further edits)
   * @param {string} submissionId - Submission document ID
   * @returns {Promise<Object>} Finalized submission document
   */
  async finalizeSubmission(submissionId) {
    try {
      const finalizedSubmission = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        submissionId,
        {
          isFinalized: true,
          finalizedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return finalizedSubmission;
    } catch (error) {
      console.error('Error finalizing submission:', error);
      throw error;
    }
  }

  /**
   * Generate public submission URL
   * @param {string} submissionId - Submission document ID
   * @returns {string} Public submission URL
   */
  generateSubmissionUrl(submissionId) {
    // This will be the public URL that judges can access
    const baseUrl = window.location.origin;
    return `${baseUrl}/submission/${submissionId}`;
  }

  /**
   * Validate submission completeness
   * @param {Object} submissionData - Submission data to validate
   * @returns {Object} Validation result with missing fields
   */
  validateSubmission(submissionData) {
    const required = ['title', 'description', 'techStack'];
    const recommended = ['challenges', 'accomplishments', 'demoUrl', 'repositoryUrl'];
    
    const missing = {
      required: [],
      recommended: []
    };

    required.forEach(field => {
      if (!submissionData[field] || 
          (Array.isArray(submissionData[field]) && submissionData[field].length === 0) ||
          (typeof submissionData[field] === 'string' && submissionData[field].trim() === '')) {
        missing.required.push(field);
      }
    });

    recommended.forEach(field => {
      if (!submissionData[field] || 
          (typeof submissionData[field] === 'string' && submissionData[field].trim() === '')) {
        missing.recommended.push(field);
      }
    });

    return {
      isValid: missing.required.length === 0,
      isComplete: missing.required.length === 0 && missing.recommended.length === 0,
      missing
    };
  }

  /**
   * Auto-save submission data
   * @param {string} submissionId - Submission document ID
   * @param {Object} formData - Current form data
   * @returns {Promise<void>}
   */
  async autoSave(submissionId, formData) {
    try {
      // Only save if submission exists and is not finalized
      const submission = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SUBMISSIONS,
        submissionId
      );

      if (!submission.isFinalized) {
        await this.updateSubmission(submissionId, formData);
      }
    } catch (error) {
      // Auto-save failures should not interrupt user experience
      console.warn('Auto-save failed:', error);
    }
  }

  /**
   * Get submission statistics for team
   * @param {string} teamId - Team identifier
   * @returns {Promise<Object>} Submission statistics
   */
  async getSubmissionStats(teamId) {
    try {
      const submission = await this.getTeamSubmission(teamId);
      
      if (!submission) {
        return {
          exists: false,
          completeness: 0,
          isFinalized: false,
          lastUpdated: null
        };
      }

      const validation = this.validateSubmission(submission);
      const totalFields = 8; // Total number of submission fields
      const completedFields = totalFields - validation.missing.required.length - validation.missing.recommended.length;
      
      return {
        exists: true,
        completeness: Math.round((completedFields / totalFields) * 100),
        isFinalized: submission.isFinalized,
        lastUpdated: submission.updatedAt,
        validation
      };
    } catch (error) {
      console.error('Error getting submission stats:', error);
      return {
        exists: false,
        completeness: 0,
        isFinalized: false,
        lastUpdated: null
      };
    }
  }
}

export default new SubmissionService();