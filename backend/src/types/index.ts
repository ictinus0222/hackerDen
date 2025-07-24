// Core TypeScript interfaces and types for hackerDen

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  joinedAt: Date;
}

export interface JudgingCriterion {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
}

export interface PivotEntry {
  id: string;
  description: string;
  reason: string;
  timestamp: Date;
}

export interface ProjectHub {
  projectId: string;
  projectName: string;
  oneLineIdea: string;
  teamMembers: TeamMember[];
  deadlines?: {
    hackingEnds: Date;
    submissionDeadline: Date;
    presentationTime: Date;
  };
  judgingCriteria: JudgingCriterion[];
  pivotLog: PivotEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskColumn {
  id: string;
  name: 'todo' | 'inprogress' | 'done';
  displayName: string;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  columnId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface TaskBoard {
  projectId: string;
  columns: TaskColumn[];
  tasks: Task[];
}

export interface SubmissionPackage {
  projectId: string;
  githubUrl?: string;
  presentationUrl?: string;
  demoVideoUrl?: string;
  generatedPageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

// Column name type for type safety
export type ColumnName = 'todo' | 'inprogress' | 'done';