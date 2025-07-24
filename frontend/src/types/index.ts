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
  deadlines: {
    hackingEnds: Date;
    submissionDeadline: Date;
    presentationTime: Date;
  };
  judgingCriteria: JudgingCriterion[];
  pivotLog: PivotEntry[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface TaskColumn {
  id: string;
  name: 'todo' | 'inprogress' | 'done';
  displayName: string;
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
  isComplete: boolean;
}