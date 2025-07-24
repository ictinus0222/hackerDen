import { describe, it, expect } from 'vitest';
import {
  TeamMemberSchema,
  JudgingCriterionSchema,
  PivotEntrySchema,
  ProjectHubSchema,
  TaskColumnSchema,
  TaskSchema,
  TaskBoardSchema,
  SubmissionPackageSchema,
  CreateProjectInputSchema,
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  CreateSubmissionInputSchema,
  LogPivotInputSchema
} from './validation.js';

describe('TeamMemberSchema', () => {
  it('should validate a valid team member', () => {
    const validMember = {
      id: 'member-1',
      name: 'John Doe',
      role: 'Developer',
      joinedAt: new Date()
    };
    
    expect(() => TeamMemberSchema.parse(validMember)).not.toThrow();
  });

  it('should validate a team member without role', () => {
    const validMember = {
      id: 'member-1',
      name: 'John Doe',
      joinedAt: new Date()
    };
    
    expect(() => TeamMemberSchema.parse(validMember)).not.toThrow();
  });

  it('should reject team member with empty name', () => {
    const invalidMember = {
      id: 'member-1',
      name: '',
      joinedAt: new Date()
    };
    
    expect(() => TeamMemberSchema.parse(invalidMember)).toThrow();
  });

  it('should reject team member with missing id', () => {
    const invalidMember = {
      name: 'John Doe',
      joinedAt: new Date()
    };
    
    expect(() => TeamMemberSchema.parse(invalidMember)).toThrow();
  });
});

describe('JudgingCriterionSchema', () => {
  it('should validate a valid judging criterion', () => {
    const validCriterion = {
      id: 'criterion-1',
      name: 'Business Potential',
      description: 'How viable is this as a business?',
      completed: false
    };
    
    expect(() => JudgingCriterionSchema.parse(validCriterion)).not.toThrow();
  });

  it('should validate criterion without description', () => {
    const validCriterion = {
      id: 'criterion-1',
      name: 'Business Potential',
      completed: true
    };
    
    expect(() => JudgingCriterionSchema.parse(validCriterion)).not.toThrow();
  });

  it('should reject criterion with empty name', () => {
    const invalidCriterion = {
      id: 'criterion-1',
      name: '',
      completed: false
    };
    
    expect(() => JudgingCriterionSchema.parse(invalidCriterion)).toThrow();
  });
});

describe('PivotEntrySchema', () => {
  it('should validate a valid pivot entry', () => {
    const validPivot = {
      id: 'pivot-1',
      description: 'Changed from mobile app to web app',
      reason: 'Mobile development was taking too long',
      timestamp: new Date()
    };
    
    expect(() => PivotEntrySchema.parse(validPivot)).not.toThrow();
  });

  it('should reject pivot with empty description', () => {
    const invalidPivot = {
      id: 'pivot-1',
      description: '',
      reason: 'Some reason',
      timestamp: new Date()
    };
    
    expect(() => PivotEntrySchema.parse(invalidPivot)).toThrow();
  });

  it('should reject pivot with empty reason', () => {
    const invalidPivot = {
      id: 'pivot-1',
      description: 'Some description',
      reason: '',
      timestamp: new Date()
    };
    
    expect(() => PivotEntrySchema.parse(invalidPivot)).toThrow();
  });
});

describe('TaskColumnSchema', () => {
  it('should validate valid task columns', () => {
    const validColumns = [
      { id: 'col-1', name: 'todo' as const, displayName: 'To Do', order: 0 },
      { id: 'col-2', name: 'inprogress' as const, displayName: 'In Progress', order: 1 },
      { id: 'col-3', name: 'done' as const, displayName: 'Done', order: 2 }
    ];
    
    validColumns.forEach(column => {
      expect(() => TaskColumnSchema.parse(column)).not.toThrow();
    });
  });

  it('should reject invalid column name', () => {
    const invalidColumn = {
      id: 'col-1',
      name: 'invalid',
      displayName: 'Invalid',
      order: 0
    };
    
    expect(() => TaskColumnSchema.parse(invalidColumn)).toThrow();
  });

  it('should reject negative order', () => {
    const invalidColumn = {
      id: 'col-1',
      name: 'todo',
      displayName: 'To Do',
      order: -1
    };
    
    expect(() => TaskColumnSchema.parse(invalidColumn)).toThrow();
  });
});

describe('TaskSchema', () => {
  it('should validate a valid task', () => {
    const validTask = {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Add login and registration functionality',
      assignedTo: 'John Doe',
      columnId: 'col-1',
      projectId: 'project-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0
    };
    
    expect(() => TaskSchema.parse(validTask)).not.toThrow();
  });

  it('should validate task without optional fields', () => {
    const validTask = {
      id: 'task-1',
      title: 'Implement user authentication',
      columnId: 'col-1',
      projectId: 'project-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0
    };
    
    expect(() => TaskSchema.parse(validTask)).not.toThrow();
  });

  it('should reject task with empty title', () => {
    const invalidTask = {
      id: 'task-1',
      title: '',
      columnId: 'col-1',
      projectId: 'project-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0
    };
    
    expect(() => TaskSchema.parse(invalidTask)).toThrow();
  });
});

describe('SubmissionPackageSchema', () => {
  it('should validate a valid submission package', () => {
    const validSubmission = {
      projectId: 'project-1',
      githubUrl: 'https://github.com/user/repo',
      presentationUrl: 'https://slides.com/presentation',
      demoVideoUrl: 'https://youtube.com/watch?v=123',
      generatedPageUrl: 'https://app.com/submission/123',
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true
    };
    
    expect(() => SubmissionPackageSchema.parse(validSubmission)).not.toThrow();
  });

  it('should validate submission with only required fields', () => {
    const validSubmission = {
      projectId: 'project-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: false
    };
    
    expect(() => SubmissionPackageSchema.parse(validSubmission)).not.toThrow();
  });

  it('should reject invalid URLs', () => {
    const invalidSubmission = {
      projectId: 'project-1',
      githubUrl: 'not-a-url',
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: false
    };
    
    expect(() => SubmissionPackageSchema.parse(invalidSubmission)).toThrow();
  });
});

describe('CreateProjectInputSchema', () => {
  it('should validate valid project creation input', () => {
    const validInput = {
      projectName: 'My Awesome Project',
      oneLineIdea: 'A tool to solve world hunger',
      teamMembers: [
        { name: 'John Doe', role: 'Developer' },
        { name: 'Jane Smith' }
      ],
      deadlines: {
        hackingEnds: '2024-12-01T18:00:00Z',
        submissionDeadline: '2024-12-01T20:00:00Z',
        presentationTime: '2024-12-02T10:00:00Z'
      },
      judgingCriteria: [
        { name: 'Innovation', description: 'How innovative is the solution?' }
      ]
    };
    
    expect(() => CreateProjectInputSchema.parse(validInput)).not.toThrow();
  });

  it('should validate input without judging criteria', () => {
    const validInput = {
      projectName: 'My Awesome Project',
      oneLineIdea: 'A tool to solve world hunger',
      teamMembers: [{ name: 'John Doe' }],
      deadlines: {
        hackingEnds: '2024-12-01T18:00:00Z',
        submissionDeadline: '2024-12-01T20:00:00Z',
        presentationTime: '2024-12-02T10:00:00Z'
      }
    };
    
    expect(() => CreateProjectInputSchema.parse(validInput)).not.toThrow();
  });

  it('should reject input with empty team members', () => {
    const invalidInput = {
      projectName: 'My Awesome Project',
      oneLineIdea: 'A tool to solve world hunger',
      teamMembers: [],
      deadlines: {
        hackingEnds: '2024-12-01T18:00:00Z',
        submissionDeadline: '2024-12-01T20:00:00Z',
        presentationTime: '2024-12-02T10:00:00Z'
      }
    };
    
    expect(() => CreateProjectInputSchema.parse(invalidInput)).toThrow();
  });

  it('should reject invalid date format', () => {
    const invalidInput = {
      projectName: 'My Awesome Project',
      oneLineIdea: 'A tool to solve world hunger',
      teamMembers: [{ name: 'John Doe' }],
      deadlines: {
        hackingEnds: 'invalid-date',
        submissionDeadline: '2024-12-01T20:00:00Z',
        presentationTime: '2024-12-02T10:00:00Z'
      }
    };
    
    expect(() => CreateProjectInputSchema.parse(invalidInput)).toThrow();
  });
});

describe('CreateTaskInputSchema', () => {
  it('should validate valid task creation input', () => {
    const validInput = {
      title: 'Implement authentication',
      description: 'Add login functionality',
      assignedTo: 'John Doe',
      columnId: 'col-1'
    };
    
    expect(() => CreateTaskInputSchema.parse(validInput)).not.toThrow();
  });

  it('should validate input with only required fields', () => {
    const validInput = {
      title: 'Implement authentication',
      columnId: 'col-1'
    };
    
    expect(() => CreateTaskInputSchema.parse(validInput)).not.toThrow();
  });

  it('should reject input with empty title', () => {
    const invalidInput = {
      title: '',
      columnId: 'col-1'
    };
    
    expect(() => CreateTaskInputSchema.parse(invalidInput)).toThrow();
  });
});

describe('LogPivotInputSchema', () => {
  it('should validate valid pivot input', () => {
    const validInput = {
      description: 'Changed from mobile to web',
      reason: 'Mobile development was too complex'
    };
    
    expect(() => LogPivotInputSchema.parse(validInput)).not.toThrow();
  });

  it('should reject input with empty description', () => {
    const invalidInput = {
      description: '',
      reason: 'Some reason'
    };
    
    expect(() => LogPivotInputSchema.parse(invalidInput)).toThrow();
  });

  it('should reject input with empty reason', () => {
    const invalidInput = {
      description: 'Some description',
      reason: ''
    };
    
    expect(() => LogPivotInputSchema.parse(invalidInput)).toThrow();
  });
});