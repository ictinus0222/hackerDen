import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { userNameService } from '../services/userNameService';

export const taskNameUpdater = {
  // Update existing tasks with user names for the current user
  async updateTasksWithCurrentUserName(teamId, currentUser) {
    if (!currentUser || !currentUser.$id || !currentUser.name) {
      console.warn('No current user provided for task name update');
      return { updated: 0, errors: [] };
    }

    try {
      console.log('🔄 Updating existing tasks with current user name:', currentUser.name);
      
      // Get all tasks where current user is assigned or creator
      const userTasks = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        [
          Query.equal('teamId', teamId),
          Query.or([
            Query.equal('assignedTo', currentUser.$id),
            Query.equal('createdBy', currentUser.$id)
          ])
        ]
      );

      console.log(`Found ${userTasks.documents.length} tasks to update for current user`);

      let updated = 0;
      const errors = [];

      // Update each task
      for (const task of userTasks.documents) {
        try {
          const updates = {};
          let needsUpdate = false;

          // Update assigned_to if user is assigned and field is missing/empty
          if (task.assignedTo === currentUser.$id && (!task.assigned_to || task.assigned_to === task.assignedTo)) {
            updates.assigned_to = currentUser.name;
            needsUpdate = true;
          }

          // Update created_by if user is creator and field is missing/empty
          if (task.createdBy === currentUser.$id && (!task.created_by || task.created_by === task.createdBy)) {
            updates.created_by = currentUser.name;
            needsUpdate = true;
          }

          if (needsUpdate) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.TASKS,
              task.$id,
              updates
            );
            
            console.log(`✅ Updated task "${task.title}" with user name`);
            updated++;

            // Cache the name for future use
            userNameService.setUserName(currentUser.$id, currentUser.name);
          }
        } catch (error) {
          console.error(`❌ Failed to update task "${task.title}":`, error);
          errors.push({ taskId: task.$id, taskTitle: task.title, error: error.message });
        }
      }

      console.log(`🎉 Successfully updated ${updated} tasks with current user name`);
      return { updated, errors };
    } catch (error) {
      console.error('Error updating tasks with user names:', error);
      return { updated: 0, errors: [{ error: error.message }] };
    }
  },

  // Update a specific task with user names (for manual updates)
  async updateTaskWithNames(taskId, assignedToName, createdByName) {
    try {
      const updates = {};
      if (assignedToName) updates.assigned_to = assignedToName;
      if (createdByName) updates.created_by = createdByName;

      if (Object.keys(updates).length === 0) {
        console.warn('No names provided for task update');
        return false;
      }

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        taskId,
        updates
      );

      console.log(`✅ Updated task ${taskId} with names:`, updates);
      return true;
    } catch (error) {
      console.error('Error updating task with names:', error);
      return false;
    }
  },

  // Bulk update tasks with a name mapping
  async bulkUpdateTasksWithNames(teamId, userNameMapping) {
    /*
    userNameMapping should be like:
    {
      'user-id-1': 'John Doe',
      'user-id-2': 'Jane Smith'
    }
    */
    try {
      console.log('🔄 Bulk updating tasks with name mapping:', userNameMapping);
      
      const allTasks = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        [
          Query.equal('teamId', teamId)
        ]
      );

      let updated = 0;
      const errors = [];

      for (const task of allTasks.documents) {
        try {
          const updates = {};
          let needsUpdate = false;

          // Update assigned_to if we have a name for the assigned user
          if (task.assignedTo && userNameMapping[task.assignedTo] && 
              (!task.assigned_to || task.assigned_to === task.assignedTo)) {
            updates.assigned_to = userNameMapping[task.assignedTo];
            needsUpdate = true;
          }

          // Update created_by if we have a name for the creator
          if (task.createdBy && userNameMapping[task.createdBy] && 
              (!task.created_by || task.created_by === task.createdBy)) {
            updates.created_by = userNameMapping[task.createdBy];
            needsUpdate = true;
          }

          if (needsUpdate) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.TASKS,
              task.$id,
              updates
            );
            
            console.log(`✅ Updated task "${task.title}" with names:`, updates);
            updated++;

            // Cache the names
            if (updates.assigned_to && task.assignedTo) {
              userNameService.setUserName(task.assignedTo, updates.assigned_to);
            }
            if (updates.created_by && task.createdBy) {
              userNameService.setUserName(task.createdBy, updates.created_by);
            }
          }
        } catch (error) {
          console.error(`❌ Failed to update task "${task.title}":`, error);
          errors.push({ taskId: task.$id, taskTitle: task.title, error: error.message });
        }
      }

      console.log(`🎉 Successfully bulk updated ${updated} tasks`);
      return { updated, errors };
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      return { updated: 0, errors: [{ error: error.message }] };
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.taskNameUpdater = taskNameUpdater;
}