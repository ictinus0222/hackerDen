import { z } from 'zod';

// Team Member validation schema
export const TeamMemberSchema = z.object({
  id: z.string().min(1, 'Team member ID is required'),
  name: z.string().min(1, 'Team member name is required').max(100, 'Name too long'),
  role: z.string().max(50, 'Role too long').optional(),
  joinedAt: z.date()
});

// Judging Criterion validation schema
export const JudgingCriterionSchema = z.object({
  id: z.string().min(1, 'Criterion ID is required'),
  name: z.string().min(1, 'Criterion name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  completed: z.boolean()
});

// Pivot Entry validation schema
export const PivotEntrySchema = z.object({
  id: z.string().min(1, 'Pivot ID is required'),
  description: z.string().min(1, 'Pivot description is required').max(1000, 'Description too long'),
  reason: z.string().min(1, 'Pivot reason is required').max(1000, 'Reason too long'),
  timestamp: z.date()
});

// Project Hub validation schema
export const ProjectHubSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  projectName: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  oneLineIdea: z.string().min(1, 'One line idea is required').max(500, 'Idea description too long'),
  teamMembers: z.array(TeamMemberSchema).min(1, 'At least one team member is required'),
  deadlines: z.object({
    hackingEnds: z.date(),
    submissionDeadline: z.date(),
    presentationTime: z.date()
  }),
  judgingCriteria: z.array(JudgingCriterionSchema),
  pivotLog: z.array(PivotEntrySchema),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Task Column validation schema
export const TaskColumnSchema = z.object({
  id: z.string().min(1, 'Column ID is required'),
  name: z.enum(['todo', 'inprogress', 'done'], {
    errorMap: () => ({ message: 'Column name must be todo, inprogress, or done' })
  }),
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name too long'),
  order: z.number().int().min(0, 'Order must be non-negative')
});

// Task validation schema
export const TaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  assignedTo: z.string().max(100, 'Assignee name too long').optional(),
  columnId: z.string().min(1, 'Column ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  createdAt: z.date(),
  updatedAt: z.date(),
  order: z.number().int().min(0, 'Order must be non-negative')
});

// Task Board validation schema
export const TaskBoardSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  columns: z.array(TaskColumnSchema),
  tasks: z.array(TaskSchema)
});

// Submission Package validation schema
export const SubmissionPackageSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  githubUrl: z.string().url('Invalid GitHub URL').optional(),
  presentationUrl: z.string().url('Invalid presentation URL').optional(),
  demoVideoUrl: z.string().url('Invalid demo video URL').optional(),
  generatedPageUrl: z.string().url('Invalid generated page URL').optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isComplete: z.boolean()
});

// Input validation schemas for API endpoints (without auto-generated fields)
export const CreateProjectInputSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  oneLineIdea: z.string().min(1, 'One line idea is required').max(500, 'Idea description too long'),
  teamMembers: z.array(z.object({
    name: z.string().min(1, 'Team member name is required').max(100, 'Name too long'),
    role: z.string().max(50, 'Role too long').optional()
  })).min(1, 'At least one team member is required'),
  deadlines: z.object({
    hackingEnds: z.string().datetime('Invalid hacking end date'),
    submissionDeadline: z.string().datetime('Invalid submission deadline'),
    presentationTime: z.string().datetime('Invalid presentation time')
  }),
  judgingCriteria: z.array(z.object({
    name: z.string().min(1, 'Criterion name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional()
  })).optional().default([])
});

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  assignedTo: z.string().max(100, 'Assignee name too long').optional(),
  columnId: z.string().min(1, 'Column ID is required')
});

export const UpdateTaskInputSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  assignedTo: z.string().max(100, 'Assignee name too long').optional(),
  columnId: z.string().min(1, 'Column ID is required').optional(),
  order: z.number().int().min(0, 'Order must be non-negative').optional()
});

export const CreateSubmissionInputSchema = z.object({
  githubUrl: z.string().url('Invalid GitHub URL').optional(),
  presentationUrl: z.string().url('Invalid presentation URL').optional(),
  demoVideoUrl: z.string().url('Invalid demo video URL').optional()
});

export const LogPivotInputSchema = z.object({
  description: z.string().min(1, 'Pivot description is required').max(1000, 'Description too long'),
  reason: z.string().min(1, 'Pivot reason is required').max(1000, 'Reason too long')
});

// Type inference from schemas
export type TeamMemberInput = z.infer<typeof TeamMemberSchema>;
export type JudgingCriterionInput = z.infer<typeof JudgingCriterionSchema>;
export type PivotEntryInput = z.infer<typeof PivotEntrySchema>;
export type ProjectHubInput = z.infer<typeof ProjectHubSchema>;
export type TaskColumnInput = z.infer<typeof TaskColumnSchema>;
export type TaskInput = z.infer<typeof TaskSchema>;
export type TaskBoardInput = z.infer<typeof TaskBoardSchema>;
export type SubmissionPackageInput = z.infer<typeof SubmissionPackageSchema>;

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
export type CreateSubmissionInput = z.infer<typeof CreateSubmissionInputSchema>;
export type LogPivotInput = z.infer<typeof LogPivotInputSchema>;