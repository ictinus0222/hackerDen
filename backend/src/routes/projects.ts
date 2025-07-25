import { Router } from 'express';
import type { Request, Response } from 'express';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { authenticateProject, generateProjectToken, type AuthRequest } from '../middleware/auth.js';
import { validateProjectCreation, validateProjectUpdate, validateTeamMember, validateTaskCreation, validatePivotEntry } from '../utils/validation.js';
import type { ApiResponse, ProjectHub, TeamMember, Task as TaskType, PivotEntry } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get socket service (will be set by server)
let getSocketService: () => any = () => null;

const router = Router();

// Function to set socket service reference
export const setSocketService = (socketServiceGetter: () => any) => {
  getSocketService = socketServiceGetter;
};

// POST /api/projects - Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = validateProjectCreation(req.body);
    
    // Generate unique project ID
    const projectId = uuidv4();
    
    // Create project with initial team member
    const projectData = {
      projectId,
      ...validatedData,
      teamMembers: [{
        id: uuidv4(),
        name: validatedData.creatorName,
        role: 'Team Lead',
        joinedAt: new Date()
      }]
    };

    const project = new Project(projectData);
    await project.save();

    // Generate JWT token for project access
    const token = generateProjectToken(projectId);

    const response: ApiResponse<{ project: ProjectHub; token: string }> = {
      success: true,
      data: {
        project: project.toObject(),
        token
      },
      timestamp: new Date()
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating project:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PROJECT_EXISTS',
          message: 'A project with this ID already exists'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    res.status(400).json({
      success: false,
      error: {
        code: 'CREATION_FAILED',
        message: error.message || 'Failed to create project'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// GET /api/projects/:id - Get project details
router.get('/:id', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own project'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const project = await Project.findByProjectId(projectId);
    
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

    const response: ApiResponse<ProjectHub> = {
      success: true,
      data: project.toObject(),
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch project'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// PUT /api/projects/:id - Update project information
router.put('/:id', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only update your own project'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const validatedData = validateProjectUpdate(req.body);
    
    const project = await Project.findByProjectId(projectId);
    
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

    // Update project fields
    Object.assign(project, validatedData);
    await project.save();

    const projectData = project.toObject();

    // Emit socket event for real-time updates
    const socketService = getSocketService();
    if (socketService) {
      socketService.emitProjectUpdate(projectId, projectData);
    }

    const response: ApiResponse<ProjectHub> = {
      success: true,
      data: projectData,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error.message || 'Failed to update project'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// POST /api/projects/:id/members - Add team member
router.post('/:id/members', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only modify your own project'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const validatedMember = validateTeamMember(req.body);
    
    const project = await Project.findByProjectId(projectId);
    
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

    // Check if member already exists
    const existingMember = project.teamMembers.find(member => member.name === validatedMember.name);
    if (existingMember) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'MEMBER_EXISTS',
          message: 'Team member with this name already exists'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    // Add team member
    const newMember = {
      id: uuidv4(),
      ...validatedMember,
      joinedAt: new Date()
    };
    
    await project.addTeamMember(newMember);

    // Emit socket event for real-time updates
    const socketService = getSocketService();
    if (socketService) {
      socketService.emitMemberJoined(projectId, newMember);
    }

    const response: ApiResponse<TeamMember> = {
      success: true,
      data: newMember,
      timestamp: new Date()
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error adding team member:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'ADD_MEMBER_FAILED',
        message: error.message || 'Failed to add team member'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// DELETE /api/projects/:id/members/:memberId - Remove team member
router.delete('/:id/members/:memberId', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only modify your own project'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const project = await Project.findByProjectId(projectId);
    
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

    // Check if member exists
    const memberExists = project.teamMembers.some(member => member.id === memberId);
    if (!memberExists) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEMBER_NOT_FOUND',
          message: 'Team member not found'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    // Prevent removing the last team member
    if (project.teamMembers.length <= 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_REMOVE_LAST_MEMBER',
          message: 'Cannot remove the last team member'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    // Remove team member
    await project.removeTeamMember(memberId);

    // Emit socket event for real-time updates
    const socketService = getSocketService();
    if (socketService) {
      socketService.emitMemberLeft(projectId, memberId);
    }

    const response: ApiResponse = {
      success: true,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error removing team member:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'REMOVE_MEMBER_FAILED',
        message: error.message || 'Failed to remove team member'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// GET /api/projects/:id/tasks - Get all tasks for project
router.get('/:id/tasks', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own project tasks'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    // Verify project exists
    const project = await Project.findByProjectId(projectId);
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

    // Get all tasks for the project, sorted by column and order
    const tasks = await Task.findByProjectId(projectId);

    const response: ApiResponse<TaskType[]> = {
      success: true,
      data: tasks.map(task => task.toObject()),
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TASKS_FAILED',
        message: 'Failed to fetch tasks'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// POST /api/projects/:id/tasks - Create new task
router.post('/:id/tasks', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only create tasks in your own project'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    // Verify project exists
    const project = await Project.findByProjectId(projectId);
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

    const validatedData = validateTaskCreation(req.body);
    
    // If assignedTo is provided, verify the team member exists
    if (validatedData.assignedTo) {
      const memberExists = project.teamMembers.some(member => member.name === validatedData.assignedTo);
      if (!memberExists) {
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

    // Get the next order number for the column if not provided
    let order = validatedData.order;
    if (order === undefined) {
      const maxOrder = await Task.getMaxOrderInColumn(projectId, validatedData.columnId);
      order = maxOrder + 1;
    }

    // Create task
    const taskData = {
      id: uuidv4(),
      projectId,
      ...validatedData,
      order
    };

    const task = new Task(taskData);
    await task.save();

    const taskObject = task.toObject();

    // Emit socket event for real-time updates
    const socketService = getSocketService();
    if (socketService) {
      socketService.emitTaskCreated(projectId, taskObject);
    }

    const response: ApiResponse<TaskType> = {
      success: true,
      data: taskObject,
      timestamp: new Date()
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'CREATE_TASK_FAILED',
        message: error.message || 'Failed to create task'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// POST /api/projects/:id/pivots - Log new pivot
router.post('/:id/pivots', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only add pivots to your own project'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const validatedPivot = validatePivotEntry(req.body);
    
    const project = await Project.findByProjectId(projectId);
    
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

    // Create new pivot entry
    const newPivot = {
      id: uuidv4(),
      ...validatedPivot,
      timestamp: new Date()
    };
    
    await project.addPivotEntry(newPivot);

    // Emit socket event for real-time updates
    const socketService = getSocketService();
    if (socketService) {
      socketService.emitPivotLogged(projectId, newPivot);
    }

    const response: ApiResponse<PivotEntry> = {
      success: true,
      data: newPivot,
      timestamp: new Date()
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error adding pivot entry:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'ADD_PIVOT_FAILED',
        message: error.message || 'Failed to add pivot entry'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// GET /api/projects/:id/pivots - Get pivot history
router.get('/:id/pivots', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own project pivots'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const project = await Project.findByProjectId(projectId);
    
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

    // Return pivot log sorted by timestamp (most recent first)
    const sortedPivots = [...project.pivotLog].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const response: ApiResponse<PivotEntry[]> = {
      success: true,
      data: sortedPivots,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching pivot history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PIVOTS_FAILED',
        message: 'Failed to fetch pivot history'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

export default router;