import { z } from 'zod';
import type { ApiResponse, TeamMember, JudgingCriterion, Task, ColumnName } from '../types/index.js';

// Validation schemas
const TeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  role: z.string().max(50, 'Role must be less than 50 characters').optional()
});

const JudgingCriterionSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  completed: z.boolean().default(false)
});

const ProjectCreationSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(200, 'Project name must be less than 200 characters'),
  oneLineIdea: z.string().min(1, 'One line idea is required').max(500, 'One line idea must be less than 500 characters'),
  creatorName: z.string().min(1, 'Creator name is required').max(100, 'Creator name must be less than 100 characters'),
  deadlines: z.object({
    hackingEnds: z.string().datetime('Invalid hacking end date').transform(str => new Date(str)),
    submissionDeadline: z.string().datetime('Invalid submission deadline').transform(str => new Date(str)),
    presentationTime: z.string().datetime('Invalid presentation time').transform(str => new Date(str))
  }).refine(data => {
    return data.hackingEnds < data.submissionDeadline;
  }, {
    message: 'Hacking end time must be before submission deadline'
  }).refine(data => {
    return data.submissionDeadline < data.presentationTime;
  }, {
    message: 'Submission deadline must be before presentation time'
  }).optional(),
  judgingCriteria: z.array(JudgingCriterionSchema).default([])
});

const ProjectUpdateSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(200, 'Project name must be less than 200 characters').optional(),
  oneLineIdea: z.string().min(1, 'One line idea is required').max(500, 'One line idea must be less than 500 characters').optional(),
  deadlines: z.object({
    hackingEnds: z.string().datetime('Invalid hacking end date').transform(str => new Date(str)),
    submissionDeadline: z.string().datetime('Invalid submission deadline').transform(str => new Date(str)),
    presentationTime: z.string().datetime('Invalid presentation time').transform(str => new Date(str))
  }).refine(data => {
    return data.hackingEnds < data.submissionDeadline;
  }, {
    message: 'Hacking end time must be before submission deadline'
  }).refine(data => {
    return data.submissionDeadline < data.presentationTime;
  }, {
    message: 'Submission deadline must be before presentation time'
  }).optional(),
  judgingCriteria: z.array(JudgingCriterionSchema).optional()
});

const TaskCreationSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().max(1000, 'Task description must be less than 1000 characters').optional(),
  assignedTo: z.string().max(100, 'Assignee name must be less than 100 characters').optional(),
  columnId: z.enum(['todo', 'inprogress', 'done']).default('todo'),
  order: z.number().min(0, 'Order must be non-negative').optional()
});

const TaskUpdateSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Task description must be less than 1000 characters').optional(),
  assignedTo: z.string().max(100, 'Assignee name must be less than 100 characters').optional(),
  columnId: z.enum(['todo', 'inprogress', 'done']).optional(),
  order: z.number().min(0, 'Order must be non-negative').optional()
});

/**
 * Validates data against a Zod schema and returns a standardized result
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ApiResponse['error'] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.issues.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: 'UNKNOWN_VALIDATION_ERROR',
        message: 'An unexpected validation error occurred',
        details: error
      }
    };
  }
}

/**
 * Validates data against a Zod schema and throws an error if validation fails
 */
export function validateDataOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = validateData(schema, data);
  if (!result.success) {
    const error = new Error(result.error!.message);
    (error as any).code = result.error!.code;
    (error as any).details = result.error!.details;
    throw error;
  }
  return result.data;
}

/**
 * Creates a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: ApiResponse['error']
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: new Date()
  };
}

/**
 * Creates a success API response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return createApiResponse(true, data);
}

/**
 * Creates an error API response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any
): ApiResponse {
  return createApiResponse(false, undefined, {
    code,
    message,
    details
  });
}

// Validation functions for API endpoints
export function validateProjectCreation(data: unknown) {
  return validateDataOrThrow(ProjectCreationSchema, data);
}

export function validateProjectUpdate(data: unknown) {
  return validateDataOrThrow(ProjectUpdateSchema, data);
}

export function validateTeamMember(data: unknown): Omit<TeamMember, 'id' | 'joinedAt'> {
  return validateDataOrThrow(TeamMemberSchema, data);
}

export function validateTaskCreation(data: unknown) {
  return validateDataOrThrow(TaskCreationSchema, data);
}

export function validateTaskUpdate(data: unknown) {
  return validateDataOrThrow(TaskUpdateSchema, data);
}