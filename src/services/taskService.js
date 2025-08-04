import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '../lib/appwrite';
import client from '../lib/appwrite';

export const taskService = {
  // Create a new task
  async createTask(teamId, taskData) {
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
          createdBy: taskData.createdBy
        }
      );
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
  async updateTaskStatus(taskId, status) {
    try {
      const task = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId,
        {
          status
        }
      );
      return task;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
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