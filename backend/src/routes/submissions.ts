import { Router } from 'express';
import type { Request, Response } from 'express';
import { Submission } from '../models/Submission.js';
import { Project } from '../models/Project.js';
import { authenticateProject, type AuthRequest } from '../middleware/auth.js';
import { validateSubmissionCreation } from '../utils/validation.js';
import type { ApiResponse, SubmissionPackage } from '../types/index.js';

// Helper function to get socket service (will be set by server)
let getSocketService: () => any = () => null;

const router = Router();

// Function to set socket service reference
export const setSocketService = (socketServiceGetter: () => any) => {
  getSocketService = socketServiceGetter;
};

// POST /api/projects/:id/submission - Create or update submission package
router.post('/:id/submission', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only manage your own project submission'
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

    const validatedData = validateSubmissionCreation(req.body);
    
    // Create or update submission package
    const submission = await Submission.createOrUpdate(projectId, validatedData);
    
    // Generate public URL if not already set
    if (!submission.generatedPageUrl) {
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;
      
      // Set the generated URL directly to avoid validation issues during save
      submission.generatedPageUrl = `${baseUrl}/api/submission/${projectId}/public`;
    }

    const submissionData = submission.toObject();

    // Emit socket event for real-time updates
    const socketService = getSocketService();
    if (socketService) {
      socketService.emitSubmissionUpdated(projectId, submissionData);
    }

    const response: ApiResponse<SubmissionPackage> = {
      success: true,
      data: submissionData,
      timestamp: new Date()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error creating/updating submission:', error);
    
    // If it's a validation error, preserve the original error structure
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        },
        timestamp: new Date()
      } as ApiResponse);
    }
    
    res.status(400).json({
      success: false,
      error: {
        code: 'SUBMISSION_FAILED',
        message: error.message || 'Failed to create or update submission package'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// GET /api/projects/:id/submission - Get submission package
router.get('/:id/submission', authenticateProject, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    
    // Verify the authenticated project matches the requested project
    if (req.projectId !== projectId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own project submission'
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

    const submission = await Submission.findByProjectId(projectId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: 'Submission package not found'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    const response: ApiResponse<SubmissionPackage> = {
      success: true,
      data: submission.toObject(),
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_SUBMISSION_FAILED',
        message: 'Failed to fetch submission package'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

// GET /api/submission/:id/public - Get public submission page
router.get('/:id/public', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    // Find the submission package
    const submission = await Submission.findByProjectId(projectId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: 'Submission package not found'
        },
        timestamp: new Date()
      } as ApiResponse);
    }

    // Get project information for the public page
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

    // Return public submission data with project information
    const publicData = {
      projectName: project.projectName,
      oneLineIdea: project.oneLineIdea,
      teamMembers: project.teamMembers.map(member => ({
        name: member.name,
        role: member.role
      })),
      submission: submission.getPublicData(),
      generatedAt: new Date()
    };

    const response: ApiResponse<typeof publicData> = {
      success: true,
      data: publicData,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching public submission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PUBLIC_SUBMISSION_FAILED',
        message: 'Failed to fetch public submission page'
      },
      timestamp: new Date()
    } as ApiResponse);
  }
});

export default router;