import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '../lib/appwrite';
import client from '../lib/appwrite';
import { messageService } from './messageService';
import { gamificationService } from './gamificationService';

// Helper function to send task system messages with error handling
const sendTaskSystemMessage = async (teamId, hackathonId, messageType, content, systemData) => {
  try {
    await messageService.sendSystemMessage(teamId, hackathonId, content, messageType, systemData);
  } catch (error) {
    console.warn('Failed to send task system message:', error);
    // Don't fail the parent operation - just log the warning
  }
};

// Helper function to award points with error handling
const awardPointsForAction = async (userId, teamId, action) => {
  try {
    await gamificationService.awardPoints(userId, teamId, action);
  } catch (error) {
    console.warn('Failed to award points:', error);
    // Don't fail the parent operation - just log the warning
  }
};

export const taskService = {
  // Create a new task
  async createTask(teamId, hackathonId, taskData, creatorName, assignedToName) {
    try {
      // Store user names in the userNameService cache when creating tasks
      if (taskData.assignedTo && (assignedToName || creatorName)) {
        const { userNameService } = await import('./userNameService');
        userNameService.setUserName(taskData.assignedTo, assignedToName || creatorName);
      }
      if (taskData.createdBy && creatorName) {
        const { userNameService } = await import('./userNameService');
        userNameService.setUserName(taskData.createdBy, creatorName);
      }

      const task = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        ID.unique(),
        {
          teamId,
          hackathonId,
          title: taskData.title,
          description: taskData.description || '',
          status: 'todo',
          assignedTo: taskData.assignedTo, // User ID
          assigned_to: assignedToName || creatorName, // User name for display
          createdBy: taskData.createdBy, // User ID
          created_by: creatorName, // User name for display
          priority: taskData.priority || 'medium',
          // Store labels as array (now that we have string array attribute)
          labels: taskData.labels && Array.isArray(taskData.labels) ? 
            taskData.labels : 
            [],
          // Store attached file IDs as array for file attachment functionality
          attachedFiles: taskData.attachedFiles && Array.isArray(taskData.attachedFiles) ? 
            taskData.attachedFiles : 
            []
        }
      );

      // Send system message for task creation
      const assignedToDisplay = assignedToName || creatorName;
      const systemMessageContent = `📝 ${creatorName} created a new task: "${taskData.title}"${assignedToDisplay && assignedToDisplay !== creatorName ? ` (assigned to ${assignedToDisplay})` : ''}`;
      
      const systemData = {
        taskId: task.$id,
        taskTitle: taskData.title,
        createdBy: creatorName,
        assignedTo: assignedToDisplay,
        priority: taskData.priority || 'medium'
      };

      await sendTaskSystemMessage(teamId, hackathonId, 'task_created', systemMessageContent, systemData);

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Task data being sent:', {
        teamId,
        hackathonId,
        title: taskData.title,
        description: taskData.description || '',
        status: 'todo',
        assignedTo: taskData.assignedTo,
        assigned_to: assignedToName || creatorName,
        createdBy: taskData.createdBy,
        created_by: creatorName,
        priority: taskData.priority || 'medium',
        labels: taskData.labels || []
      });
      
      // Provide more specific error messages
      if (error.code === 400) {
        throw new Error(`Database validation error: ${error.message}`);
      } else if (error.code === 401) {
        throw new Error('Permission denied. Check your Appwrite permissions.');
      } else if (error.code === 404) {
        throw new Error('Tasks collection not found. Please check your database setup.');
      } else if (error.message.includes('Attribute not found')) {
        throw new Error(`Missing database attribute: ${error.message}`);
      } else {
        throw new Error(`Failed to create task: ${error.message || 'Unknown error'}`);
      }
    }
  },

  // Get all tasks for a team in a specific hackathon
  async getTeamTasks(teamId, hackathonId) {
    // Backward compatibility: if hackathonId is not provided, use legacy method
    if (arguments.length === 1) {
      return this.getLegacyTeamTasks(teamId);
    }

    // Validate parameters
    if (!teamId) {
      throw new Error('Team ID is required to fetch tasks');
    }
    if (!hackathonId) {
      throw new Error('Hackathon ID is required to fetch tasks');
    }

    try {
      console.log('Fetching tasks for team:', teamId, 'in hackathon:', hackathonId);
      console.log('Database ID:', DATABASE_ID);
      console.log('Tasks Collection:', COLLECTIONS.TASKS);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        [
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId),
          Query.orderDesc('$createdAt')
        ]
      );
      
      console.log('Tasks response:', response);
      return response.documents;
    } catch (error) {
      console.error('Error fetching team tasks:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      // Handle specific error cases
      if (error.message.includes('Collection with the requested ID could not be found')) {
        throw new Error('Tasks collection not found. Please create the "tasks" collection in your Appwrite database.');
      } else if (error.message.includes('Attribute not found in schema')) {
        throw new Error('Tasks collection schema is incomplete. Please add the required attributes (teamId, title, description, status, assignedTo, createdBy) to the tasks collection.');
      } else if (error.code === 401) {
        throw new Error('Unauthorized access to tasks. Please check collection permissions.');
      } else {
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }
    }
  },

  // Legacy method for backward compatibility (without hackathon scoping)
  async getLegacyTeamTasks(teamId) {
    // Validate parameters
    if (!teamId) {
      throw new Error('Team ID is required to fetch tasks');
    }

    try {
      console.log('Fetching legacy tasks for team:', teamId);
      console.log('Database ID:', DATABASE_ID);
      console.log('Tasks Collection:', COLLECTIONS.TASKS);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        [
          Query.equal('teamId', teamId),
          Query.orderDesc('$createdAt')
        ]
      );
      
      console.log('Legacy tasks response:', response);
      return response.documents;
    } catch (error) {
      console.error('Error fetching legacy team tasks:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      // Handle specific error cases
      if (error.message.includes('Collection with the requested ID could not be found')) {
        throw new Error('Tasks collection not found. Please create the "tasks" collection in your Appwrite database.');
      } else if (error.message.includes('Attribute not found in schema')) {
        throw new Error('Tasks collection schema is incomplete. Please add the required attributes (teamId, title, description, status, assignedTo, createdBy) to the tasks collection.');
      } else if (error.code === 401) {
        throw new Error('Unauthorized access to tasks. Please check collection permissions.');
      } else {
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }
    }
  },

  // Update task status
  async updateTaskStatus(taskId, status, taskTitle, teamId, hackathonId, userId = 'system', userName = 'System') {
    try {
      // Get the current task to check the old status
      const currentTask = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId
      );

      const oldStatus = currentTask.status;

      const task = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId,
        {
          status
        }
      );

      // Send system message for status change
      if (oldStatus !== status) {
        let systemMessageContent;
        let messageType;

        if (status === 'completed') {
          // Task completion message
          systemMessageContent = `✅ ${userName} completed task: "${taskTitle || task.title}"`;
          messageType = 'task_completed';
          
          // Award points for task completion
          if (userId && userId !== 'system') {
            await awardPointsForAction(userId, teamId, 'task_completion');
          }
        } else {
          // General status change message
          const statusEmoji = {
            'todo': '📋',
            'in_progress': '🔄',
            'completed': '✅',
            'blocked': '🚫'
          };
          
          systemMessageContent = `${statusEmoji[status] || '🔄'} ${userName} changed task "${taskTitle || task.title}" from ${oldStatus} to ${status}`;
          messageType = 'task_status_changed';
        }

        const systemData = {
          taskId: taskId,
          taskTitle: taskTitle || task.title,
          oldStatus: oldStatus,
          newStatus: status,
          changedBy: userName
        };

        await sendTaskSystemMessage(teamId, hackathonId, messageType, systemMessageContent, systemData);
      }

      return task;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  },

  // Delete a task
  async deleteTask(taskId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  },

  // Update task with priority and labels (for existing tasks)
  async updateTaskFields(taskId, updates, teamId, userName = 'System') {
    try {
      // Get the current task to check for status changes
      const currentTask = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId
      );

      const task = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId,
        updates
      );

      // If status was updated, send system message
      if (updates.status && updates.status !== currentTask.status && teamId) {
        const oldStatus = currentTask.status;
        const newStatus = updates.status;

        let systemMessageContent;
        let messageType;

        if (newStatus === 'completed') {
          // Task completion message
          systemMessageContent = `✅ ${userName} completed task: "${task.title}"`;
          messageType = 'task_completed';
          
          // Award points for task completion
          if (currentTask.assignedTo && currentTask.assignedTo !== 'system') {
            await awardPointsForAction(currentTask.assignedTo, teamId, 'task_completion');
          }
        } else {
          // General status change message
          const statusEmoji = {
            'todo': '📋',
            'in_progress': '🔄',
            'completed': '✅',
            'blocked': '🚫'
          };
          
          systemMessageContent = `${statusEmoji[newStatus] || '🔄'} ${userName} changed task "${task.title}" from ${oldStatus} to ${newStatus}`;
          messageType = 'task_status_changed';
        }

        const systemData = {
          taskId: taskId,
          taskTitle: task.title,
          oldStatus: oldStatus,
          newStatus: newStatus,
          changedBy: userName
        };

        await sendTaskSystemMessage(teamId, currentTask.hackathonId, messageType, systemMessageContent, systemData);
      }

      return task;
    } catch (error) {
      console.error('Error updating task fields:', error);
      throw new Error('Failed to update task fields');
    }
  },

  // Attach files to a task
  async attachFilesToTask(taskId, fileIds, teamId, hackathonId, userId = 'system', userName = 'System') {
    try {
      // Get current task to check existing attachments
      const currentTask = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId
      );

      // Merge new file IDs with existing ones (avoid duplicates)
      const existingFiles = currentTask.attachedFiles || [];
      const newFiles = Array.isArray(fileIds) ? fileIds : [fileIds];
      const updatedFiles = [...new Set([...existingFiles, ...newFiles])];

      const task = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId,
        {
          attachedFiles: updatedFiles
        }
      );

      // Send system message for file attachment
      const systemMessageContent = `📎 ${userName} attached ${newFiles.length} file(s) to task: "${currentTask.title}"`;
      const systemData = {
        taskId: taskId,
        taskTitle: currentTask.title,
        attachedBy: userName,
        fileCount: newFiles.length,
        newFileIds: newFiles
      };

      await sendTaskSystemMessage(teamId, hackathonId, 'task_files_attached', systemMessageContent, systemData);

      return task;
    } catch (error) {
      console.error('Error attaching files to task:', error);
      throw new Error('Failed to attach files to task');
    }
  },

  // Remove files from a task
  async removeFilesFromTask(taskId, fileIds, teamId, hackathonId, userId = 'system', userName = 'System') {
    try {
      // Get current task to check existing attachments
      const currentTask = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId
      );

      // Remove specified file IDs from existing attachments
      const existingFiles = currentTask.attachedFiles || [];
      const filesToRemove = Array.isArray(fileIds) ? fileIds : [fileIds];
      const updatedFiles = existingFiles.filter(fileId => !filesToRemove.includes(fileId));

      const task = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId,
        {
          attachedFiles: updatedFiles
        }
      );

      // Send system message for file removal
      const systemMessageContent = `📎 ${userName} removed ${filesToRemove.length} file(s) from task: "${currentTask.title}"`;
      const systemData = {
        taskId: taskId,
        taskTitle: currentTask.title,
        removedBy: userName,
        fileCount: filesToRemove.length,
        removedFileIds: filesToRemove
      };

      await sendTaskSystemMessage(teamId, hackathonId, 'task_files_removed', systemMessageContent, systemData);

      return task;
    } catch (error) {
      console.error('Error removing files from task:', error);
      throw new Error('Failed to remove files from task');
    }
  },

  // Get files attached to a task
  async getTaskFiles(taskId) {
    try {
      const task = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId
      );

      if (!task.attachedFiles || task.attachedFiles.length === 0) {
        return [];
      }

      // Import fileService dynamically to avoid circular dependency
      const { fileService } = await import('./fileService');
      
      // Get file documents for attached file IDs
      const filePromises = task.attachedFiles.map(async (fileId) => {
        try {
          return await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.FILES,
            fileId
          );
        } catch (error) {
          console.warn(`Failed to get file ${fileId}:`, error);
          return null;
        }
      });

      const files = await Promise.all(filePromises);
      return files.filter(file => file !== null);
    } catch (error) {
      console.error('Error getting task files:', error);
      throw new Error('Failed to get task files');
    }
  },

  // Create task from idea (integration with idea service)
  async createTaskFromIdea(ideaId, teamId, hackathonId, assignedTo, createdBy, creatorName = 'System', assignedToName = 'System') {
    try {
      // Import ideaService dynamically to avoid circular dependency
      const { ideaService } = await import('./ideaService');
      
      // Get idea details
      const idea = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      // Create task from idea
      const taskData = {
        title: idea.title,
        description: `Converted from idea: ${idea.description}`,
        assignedTo: assignedTo,
        createdBy: createdBy,
        priority: 'medium',
        labels: [...(idea.tags || []), 'idea-conversion']
      };

      const task = await this.createTask(
        teamId,
        hackathonId,
        taskData,
        creatorName,
        assignedToName
      );

      // Update idea status to in_progress
      await ideaService.updateIdeaStatus(ideaId, 'in_progress', teamId, hackathonId, createdBy);

      // Send system message
      const systemMessageContent = `💡➡️📝 Idea "${idea.title}" was converted to task: "${task.title}"`;
      const systemData = {
        ideaId: ideaId,
        ideaTitle: idea.title,
        taskId: task.$id,
        taskTitle: task.title,
        convertedBy: creatorName
      };

      await sendTaskSystemMessage(teamId, hackathonId, 'idea_converted_to_task', systemMessageContent, systemData);

      return task;
    } catch (error) {
      console.error('Error creating task from idea:', error);
      throw new Error('Failed to create task from idea');
    }
  },

  // Create task from poll result (integration with poll service)
  async createTaskFromPoll(pollId, winningOption, teamId, hackathonId, createdBy, creatorName = 'System') {
    try {
      // Get poll details
      const poll = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.POLLS,
        pollId
      );

      if (!poll.options.includes(winningOption)) {
        throw new Error('Invalid winning option');
      }

      // Import pollService dynamically to get poll results
      const pollServiceModule = await import('./pollService');
      const results = await pollServiceModule.default.getPollResults(pollId);
      const winningResult = results.results.find(r => r.option === winningOption);
      
      // Create detailed task description
      const description = [
        `Task created from team poll decision.`,
        ``,
        `**Poll Question:** ${poll.question}`,
        `**Winning Option:** ${winningOption} (${winningResult?.votes || 0} votes, ${winningResult?.percentage || 0}%)`,
        `**Total Votes:** ${results.totalVotes} from ${results.uniqueVoters} team members`,
        ``,
        `**Implementation Notes:**`,
        `- This task represents the team's collective decision`,
        `- Consider the poll discussion context when implementing`,
        `- Update task status to keep the team informed of progress`
      ].join('\n');

      const taskTitle = `Implement: ${winningOption}`;

      // Create the actual task
      const task = await this.createTask(
        teamId,
        hackathonId,
        {
          title: taskTitle,
          description,
          assignedTo: null, // Unassigned initially
          createdBy: createdBy,
          priority: 'medium',
          labels: ['poll-decision']
        },
        creatorName,
        null
      );

      // Send system message
      const systemMessageContent = `📊➡️📝 Poll "${poll.question}" result converted to task: "${taskTitle}"`;
      const systemData = {
        pollId: pollId,
        pollQuestion: poll.question,
        taskId: task.$id,
        taskTitle: taskTitle,
        winningOption: winningOption,
        convertedBy: creatorName
      };

      await sendTaskSystemMessage(teamId, hackathonId, 'poll_converted_to_task', systemMessageContent, systemData);

      return task;
    } catch (error) {
      console.error('Error creating task from poll:', error);
      throw new Error('Failed to create task from poll');
    }
  },

  // Subscribe to real-time task updates
  subscribeToTasks(teamId, hackathonId, callback) {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.TASKS}.documents`,
      (response) => {
        // Only process events for tasks belonging to this team and hackathon
        if (response.payload.teamId === teamId && response.payload.hackathonId === hackathonId) {
          callback(response);
        }
      }
    );

    return unsubscribe;
  }
};