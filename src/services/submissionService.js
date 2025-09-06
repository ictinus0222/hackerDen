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

      // Check if hackathon has ended
      const hackathonEnded = await this.checkHackathonEnded(submission.teamId);
      if (hackathonEnded) {
        throw new Error('Cannot update submission after hackathon has ended');
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
      // Import services dynamically to avoid circular dependencies
      const { teamService } = await import('./teamService');
      const { taskService } = await import('./taskService');
      
      let teamData = { teamName: 'Unknown Team', members: [] };
      let tasks = [];
      let files = [];
      
      // Get team information
      try {
        const team = await databases.getDocument(DATABASE_ID, COLLECTIONS.TEAMS, teamId);
        teamData.teamName = team.name;
        teamData.createdAt = team.createdAt; // Store team creation time
        
        // Get team members (use legacy method for backward compatibility)
        const members = await teamService.getLegacyTeamMembers(teamId);
        teamData.members = members;
      } catch (error) {
        console.warn('Could not fetch team data:', error);
      }

      // Get tasks for progress calculation
      try {
        tasks = await taskService.getLegacyTeamTasks(teamId);
      } catch (error) {
        console.warn('Could not fetch tasks:', error);
      }

      // Get files if file service is available
      try {
        const { fileService } = await import('./fileService');
        files = await fileService.getTeamFiles(teamId);
      } catch (error) {
        console.warn('Could not fetch files:', error);
      }

      // Get enhancement data if services are available
      let ideas = [];
      let polls = [];
      let achievements = [];
      let userPoints = [];
      
      // Ideas Management Flow has been removed for final submission

      // Polling features have been removed for final submission

      // Gamification features have been removed for final submission

      // Calculate enhanced progress metrics
      const completedTasks = tasks.filter(task => task.status === 'done' || task.status === 'completed').length;
      const totalTasks = tasks.length;
      const filesShared = files.length;
      
      // Calculate ideas implemented (from tasks that might have been converted from ideas)
      const ideasImplemented = tasks.filter(task => 
        task.labels && task.labels.includes('idea-conversion')
      ).length;

      // Calculate total time taken from team creation to final submission
      let totalTimeTaken = null;
      if (teamData.createdAt) {
        const teamCreationTime = new Date(teamData.createdAt);
        const currentTime = new Date();
        const timeDiffMs = currentTime - teamCreationTime;
        
        // Convert to hours, minutes, seconds
        const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiffMs % (1000 * 60)) / 1000);
        
        // Format time string
        if (hours > 0) {
          totalTimeTaken = `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
          totalTimeTaken = `${minutes}m ${seconds}s`;
        } else {
          totalTimeTaken = `${seconds}s`;
        }
      }

      // Calculate poll decisions implemented
      const pollDecisionsImplemented = tasks.filter(task => 
        task.labels && task.labels.includes('poll-decision')
      ).length;

      // Calculate team collaboration metrics
      const totalIdeas = ideas.length;
      const approvedIdeas = ideas.filter(idea => idea.status === 'approved').length;
      const totalPolls = polls.length;
      const totalAchievements = achievements.length;
      const totalPoints = userPoints.reduce((sum, up) => sum + up.totalPoints, 0);

      // Calculate file attachments to tasks
      const tasksWithFiles = tasks.filter(task => 
        task.attachedFiles && task.attachedFiles.length > 0
      ).length;

      return {
        teamName: teamData.teamName,
        members: teamData.members,
        completedTasks,
        totalTasks,
        totalTimeTaken,
        files,
        ideas,
        polls,
        achievements,
        userPoints,
        progress: {
          tasksCompleted: completedTasks,
          totalTimeTaken,
          filesShared,
          ideasSubmitted: totalIdeas,
          ideasImplemented,
          pollsCreated: totalPolls,
          pollDecisionsImplemented,
          achievementsUnlocked: totalAchievements,
          totalPointsEarned: totalPoints,
          tasksWithAttachments: tasksWithFiles
        },
        collaboration: {
          teamEngagement: Math.min(100, Math.round((totalIdeas + totalPolls + filesShared) / Math.max(1, teamData.members.length) * 20)),
          taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          ideaToImplementation: totalIdeas > 0 ? Math.round((ideasImplemented / totalIdeas) * 100) : 0,
          fileCollaboration: Math.round((tasksWithFiles / Math.max(1, totalTasks)) * 100)
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
        ideas: [],
        polls: [],
        achievements: [],
        userPoints: [],
        progress: {
          tasksCompleted: 0,
          filesShared: 0,
          ideasSubmitted: 0,
          ideasImplemented: 0,
          pollsCreated: 0,
          pollDecisionsImplemented: 0,
          achievementsUnlocked: 0,
          totalPointsEarned: 0,
          tasksWithAttachments: 0
        },
        collaboration: {
          teamEngagement: 0,
          taskCompletion: 0,
          ideaToImplementation: 0,
          fileCollaboration: 0
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
   * Check if hackathon has ended for a team
   * @param {string} teamId - Team identifier
   * @returns {Promise<boolean>} True if hackathon has ended
   */
  async checkHackathonEnded(teamId) {
    try {
      // Get team to find hackathon
      const team = await databases.getDocument(DATABASE_ID, COLLECTIONS.TEAMS, teamId);
      
      // Get hackathon details
      const hackathon = await databases.getDocument(DATABASE_ID, COLLECTIONS.HACKATHONS, team.hackathonId);
      
      // Check if hackathon has ended
      const now = new Date();
      const endDate = new Date(hackathon.endDate);
      
      return now > endDate;
    } catch (error) {
      console.warn('Could not check hackathon end date:', error);
      // If we can't determine, allow editing (fail open)
      return false;
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
          lastUpdated: null,
          hackathonEnded: false
        };
      }

      const validation = this.validateSubmission(submission);
      const totalFields = 8; // Total number of submission fields
      const completedFields = totalFields - validation.missing.required.length - validation.missing.recommended.length;
      const hackathonEnded = await this.checkHackathonEnded(submission.teamId);
      
      return {
        exists: true,
        completeness: Math.round((completedFields / totalFields) * 100),
        isFinalized: submission.isFinalized,
        lastUpdated: submission.updatedAt,
        hackathonEnded,
        validation
      };
    } catch (error) {
      console.error('Error getting submission stats:', error);
      return {
        exists: false,
        completeness: 0,
        isFinalized: false,
        lastUpdated: null,
        hackathonEnded: false
      };
    }
  }
}

export default new SubmissionService();