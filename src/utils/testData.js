import { taskService } from '../services/taskService';

// Utility function to create test tasks for development
export const createTestTasks = async (teamId, userId) => {
  const testTasks = [
    {
      title: 'Set up project structure',
      description: 'Initialize the React project with all necessary dependencies and folder structure',
      assignedTo: userId,
      createdBy: userId
    },
    {
      title: 'Design user interface mockups',
      description: 'Create wireframes and mockups for the main dashboard and key user flows',
      assignedTo: userId,
      createdBy: userId
    },
    {
      title: 'Implement authentication system',
      description: 'Set up user registration, login, and session management using Appwrite',
      assignedTo: userId,
      createdBy: userId
    },
    {
      title: 'Build team management features',
      description: 'Allow users to create teams, generate join codes, and manage team membership',
      assignedTo: userId,
      createdBy: userId
    },
    {
      title: 'Fix critical bug in payment system',
      description: 'There is a critical issue with payment processing that needs immediate attention',
      assignedTo: userId,
      createdBy: userId
    }
  ];

  try {
    const createdTasks = [];
    for (const taskData of testTasks) {
      const task = await taskService.createTask(teamId, taskData);
      createdTasks.push(task);
      console.log('Created test task:', task.title);
      
      // Add a small delay to ensure proper ordering
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update some tasks to different statuses for testing
    if (createdTasks.length >= 2) {
      await taskService.updateTaskStatus(createdTasks[1].$id, 'in_progress');
      console.log('Updated task to in_progress');
    }
    
    if (createdTasks.length >= 3) {
      await taskService.updateTaskStatus(createdTasks[2].$id, 'done');
      console.log('Updated task to done');
    }
    
    if (createdTasks.length >= 5) {
      await taskService.updateTaskStatus(createdTasks[4].$id, 'blocked');
      console.log('Updated task to blocked');
    }
    
    return createdTasks;
  } catch (error) {
    console.error('Error creating test tasks:', error);
    throw error;
  }
};

// Function to clear all tasks for a team (for testing)
export const clearTestTasks = async (teamId) => {
  try {
    const tasks = await taskService.getTeamTasks(teamId);
    console.log(`Found ${tasks.length} tasks to delete`);
    
    // Note: We would need a delete function in taskService for this
    // For now, just log what we would delete
    tasks.forEach(task => {
      console.log('Would delete task:', task.title);
    });
    
    return tasks.length;
  } catch (error) {
    console.error('Error clearing test tasks:', error);
    throw error;
  }
};