import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '../lib/appwrite';
import client from '../lib/appwrite';
import { messageService } from './messageService';

export const taskService = {
  // Create a new task
  async createTask(teamId, taskData, creatorName) {
    try {
      const task = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        ID.unique(),
        {
          teamId,
          title: taskData.title,
          description: taskData.description || '',
          status: 'todo',
          assignedTo: taskData.assignedTo,
          createdBy: taskData.createdBy,
          priority: taskData.priority || 'medium',
          labels: taskData.labels || []
        }
      );

      // Send system message about task creation
      try {
        const systemMessage = `📝 ${creatorName || 'Someone'} created a new task: "${task.title}"`;
        await messageService.sendSystemMessage(teamId, systemMessage, 'task_created');
      } catch (messageError) {
        console.warn('Failed to send task creation system message:', messageError);
        // Don't fail the task creation if system message fails
      }

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  },

  // Get all tasks for a team
  async getTeamTasks(teamId) {
    try {
      console.log('Fetching tasks for team:', teamId);
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

  // Update task status
  async updateTaskStatus(taskId, status, taskTitle, teamId) {
    try {
      const task = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId,
        {
          status
        }
      );

      // Send system message about status change
      try {
        let systemMessage;
        const statusLabels = {
          'todo': 'To-Do',
          'in_progress': 'In Progress',
          'blocked': 'Blocked',
          'done': 'Done'
        };

        if (status === 'done') {
          systemMessage = `✅ Task completed: "${taskTitle || task.title}"`;
        } else {
          systemMessage = `🔄 Task "${taskTitle || task.title}" moved to ${statusLabels[status] || status}`;
        }

        await messageService.sendSystemMessage(teamId, systemMessage, 'task_status_changed');
      } catch (messageError) {
        console.warn('Failed to send task status change system message:', messageError);
        // Don't fail the task update if system message fails
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
  async updateTaskFields(taskId, updates) {
    try {
      const task = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId,
        updates
      );

      return task;
    } catch (error) {
      console.error('Error updating task fields:', error);
      throw new Error('Failed to update task fields');
    }
  },

  // Subscribe to real-time task updates
  subscribeToTasks(teamId, callback) {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.TASKS}.documents`,
      (response) => {
        // Only process events for tasks belonging to this team
        if (response.payload.teamId === teamId) {
          callback(response);
        }
      }
    );

    return unsubscribe;
  }
};