import { Router } from 'express';
import type { Request, Response } from 'express';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { authenticateProject, type AuthRequest } from '../middleware/auth.js';
import { validateTaskUpdate } from '../utils/validation.js';
import type { ApiResponse, Task as TaskType } from '../types/index.js';

// Helper function to get socket service (will be set by server)
let getSocketService: () => any = () => null;

const router = Router();

// Function to set socket service reference
export const setSocketService = (socketServiceGetter: () => any) => {
  getSocketService = socketServiceGetter;
};

// PUT /api/tasks/:id - Update task
router.put('/:id', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    
    const task = await Task.findByTaskId(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    // Verify the authenticated project matches the task's project
    if (req.projectId !== task.projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only update tasks in your own project'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const validatedData = validateTaskUpdate(req.body);
    
    // If assignedTo is being updated, verify the team member exists
    if (validatedData.assignedTo !== undefined) {
      const project = await Project.findByProjectId(task.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found'
          },
          timestamp: new Date()
        } as ApiResponse);
      }

      if (validatedData.assignedTo && !project.teamMembers.some(member => member.name === validatedData.assignedTo)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ASSIGNEE',
            message: 'Assigned team member does not exist in this project'
          },
          timestamp: new Date()
        } as ApiResponse);
      }
    }

    // Update task fields
    const originalColumnId = task.columnId;
    Object.assign(task, validatedData);
    await task.save();

    const taskData = task.toObject();

    // Emit socket event for real-time updates
    const socketService = getSocketService();
    if (socketService) {
      // If column changed, emit task moved event, otherwise emit task updated
      if (validatedData.columnId && validatedData.columnId !== originalColumnId) {
        socketService.emitTaskMoved(task.projectId, taskData);
      } else {
        socketService.emitTaskUpdated(task.projectId, taskData);
      }
    }

    const response: ApiResponse<TaskType> = {
      success: true,
      data: taskData,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'UPDATE_TASK_FAILED',
        message: error.message || 'Failed to update task'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    
    const task = await Task.findByTaskId(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    // Verify the authenticated project matches the task's project
    if (req.projectId !== task.projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only delete tasks in your own project'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const projectId = task.projectId;
    await Task.deleteOne({ id: taskId });

    // Emit socket event for real-time updates
    const socketService = getSocketService();
    if (socketService) {
      socketService.emitTaskDeleted(projectId, taskId);
    }

    const response: ApiResponse = {
      success: true,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_TASK_FAILED',
        message: 'Failed to delete task'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

export default router;