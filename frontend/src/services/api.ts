import type { ProjectHub, TeamMember, Task, TaskBoard, PivotEntry, SubmissionPackage } from '../types';
import { queueOfflineAction } from '../utils/serviceWorker';
import { withRetry, getAdaptiveTimeout } from '../utils/apiHelpers';

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

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('hackerden_token', token);
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('hackerden_token');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('hackerden_token');
};

// Request deduplication cache (simplified for now)
const requestCache = new Map<string, Promise<any>>();

// This function is now imported from apiHelpers

// Generic API request function with enhanced error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const timeout = getAdaptiveTimeout();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    signal: AbortSignal.timeout(timeout),
    ...options,
  };

  // Create cache key for GET requests to avoid duplicate calls
  const cacheKey = options.method === 'GET' || !options.method 
    ? `${endpoint}:${JSON.stringify(config)}` 
    : null;

  const operation = async (): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle different response types
      let data: ApiResponse<T>;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        data = {
          success: response.ok,
          data: text as any,
          timestamp: new Date(),
        };
      }
      
      // Convert date strings back to Date objects
      if (data.data && typeof data.data === 'object') {
        convertDates(data.data);
      }
      
      if (!response.ok) {
        const errorMessage = data.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new ApiError(errorMessage, data.error?.code, data.error?.details);
      }
      
      return data;
    } catch (error) {
      // Handle offline scenarios
      if (!navigator.onLine) {
        // Queue non-GET requests for background sync
        if (options.method && options.method !== 'GET') {
          await queueOfflineAction({
            id: `${Date.now()}-${Math.random()}`,
            url: `${API_BASE_URL}${endpoint}`,
            options: config
          });
        }
        
        throw new ApiError('You are currently offline. Changes will be synced when connection is restored.', 'OFFLINE');
      }
      
      console.error('API request failed:', error);
      
      // Convert generic errors to ApiError
      if (!(error instanceof ApiError)) {
        throw new ApiError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          'NETWORK_ERROR'
        );
      }
      
      throw error;
    }
  };

  // Use retry logic with caching for GET requests
  const executeWithRetry = () => withRetry(operation);

  // Use request deduplication for GET requests
  if (cacheKey) {
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }
    
    const promise = executeWithRetry().finally(() => {
      // Clean up cache after request completes
      setTimeout(() => requestCache.delete(cacheKey), 1000);
    });
    
    requestCache.set(cacheKey, promise);
    return promise;
  }

  return executeWithRetry();
}

// Helper function to convert date strings to Date objects
function convertDates(obj: any): void {
  if (!obj || typeof obj !== 'object') return;
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string' && isDateString(value)) {
      obj[key] = new Date(value);
    } else if (Array.isArray(value)) {
      value.forEach(convertDates);
    } else if (typeof value === 'object' && value !== null) {
      convertDates(value);
    }
  }
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}

// Project API functions
export const projectApi = {
  // Create a new project
  async create(data: {
    projectName: string;
    oneLineIdea: string;
    creatorName: string;
  }): Promise<{ project: ProjectHub; token: string }> {
    const response = await apiRequest<{ project: ProjectHub; token: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create project');
    }
    
    // Store the token for future requests
    setAuthToken(response.data.token);
    
    return response.data;
  },

  // Get project by ID
  async getById(projectId: string): Promise<ProjectHub> {
    const response = await apiRequest<ProjectHub>(`/projects/${projectId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch project');
    }
    
    return response.data;
  },

  // Update project
  async update(projectId: string, updates: Partial<ProjectHub>): Promise<ProjectHub> {
    const response = await apiRequest<ProjectHub>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update project');
    }
    
    return response.data;
  },

  // Add team member
  async addMember(projectId: string, member: { name: string; role?: string }): Promise<TeamMember> {
    const response = await apiRequest<TeamMember>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify(member),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to add team member');
    }
    
    return response.data;
  },

  // Remove team member
  async removeMember(projectId: string, memberId: string): Promise<void> {
    const response = await apiRequest(`/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove team member');
    }
  },
};

// Task API functions
export const taskApi = {
  // Get all tasks for a project
  async getByProject(projectId: string): Promise<Task[]> {
    const response = await apiRequest<Task[]>(`/projects/${projectId}/tasks`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch tasks');
    }
    
    return response.data;
  },

  // Create a new task
  async create(projectId: string, task: {
    title: string;
    description?: string;
    assignedTo?: string;
    columnId: string;
  }): Promise<Task> {
    // Validate required fields
    if (!task.title.trim()) {
      throw new ApiError('Task title is required', 'VALIDATION_ERROR');
    }
    
    if (!task.columnId) {
      throw new ApiError('Task column is required', 'VALIDATION_ERROR');
    }

    const response = await apiRequest<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        ...task,
        title: task.title.trim(),
        description: task.description?.trim() || undefined,
      }),
    });
    
    if (!response.success || !response.data) {
      throw new ApiError(
        response.error?.message || 'Failed to create task',
        response.error?.code || 'CREATE_ERROR',
        response.error?.details
      );
    }
    
    return response.data;
  },

  // Update a task
  async update(taskId: string, updates: Partial<Task>): Promise<Task> {
    // Validate required fields
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new ApiError('Task title cannot be empty', 'VALIDATION_ERROR');
    }

    const response = await apiRequest<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updates,
        updatedAt: new Date().toISOString(),
      }),
    });
    
    if (!response.success || !response.data) {
      throw new ApiError(
        response.error?.message || 'Failed to update task',
        response.error?.code || 'UPDATE_ERROR',
        response.error?.details
      );
    }
    
    return response.data;
  },

  // Delete a task
  async delete(taskId: string): Promise<void> {
    const response = await apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete task');
    }
  },
};

// Pivot API functions
export const pivotApi = {
  // Get pivot history for a project
  async getByProject(projectId: string): Promise<PivotEntry[]> {
    const response = await apiRequest<PivotEntry[]>(`/projects/${projectId}/pivots`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch pivot history');
    }
    
    return response.data;
  },

  // Log a new pivot
  async create(projectId: string, pivot: {
    description: string;
    reason: string;
  }): Promise<PivotEntry> {
    // Validate required fields
    if (!pivot.description.trim()) {
      throw new ApiError('Pivot description is required', 'VALIDATION_ERROR');
    }
    
    if (!pivot.reason.trim()) {
      throw new ApiError('Pivot reason is required', 'VALIDATION_ERROR');
    }

    const response = await apiRequest<PivotEntry>(`/projects/${projectId}/pivots`, {
      method: 'POST',
      body: JSON.stringify({
        description: pivot.description.trim(),
        reason: pivot.reason.trim(),
      }),
    });
    
    if (!response.success || !response.data) {
      throw new ApiError(
        response.error?.message || 'Failed to log pivot',
        response.error?.code || 'CREATE_ERROR',
        response.error?.details
      );
    }
    
    return response.data;
  },
};

// Submission API functions
export const submissionApi = {
  // Create or update submission package
  async createOrUpdate(projectId: string, submission: {
    githubUrl?: string;
    presentationUrl?: string;
    demoVideoUrl?: string;
  }): Promise<SubmissionPackage> {
    const response = await apiRequest<SubmissionPackage>(`/projects/${projectId}/submission`, {
      method: 'POST',
      body: JSON.stringify(submission),
    });
    
    if (!response.success || !response.data) {
      throw new ApiError(
        response.error?.message || 'Failed to create or update submission package',
        response.error?.code || 'SUBMISSION_ERROR',
        response.error?.details
      );
    }
    
    return response.data;
  },

  // Get submission package
  async getByProject(projectId: string): Promise<SubmissionPackage | null> {
    try {
      const response = await apiRequest<SubmissionPackage>(`/projects/${projectId}/submission`);
      
      if (!response.success) {
        // Return null if submission doesn't exist yet
        if (response.error?.code === 'SUBMISSION_NOT_FOUND') {
          return null;
        }
        throw new Error(response.error?.message || 'Failed to fetch submission package');
      }
      
      return response.data || null;
    } catch (error) {
      // Return null if submission doesn't exist yet
      if (error instanceof ApiError && error.code === 'SUBMISSION_NOT_FOUND') {
        return null;
      }
      throw error;
    }
  },

  // Get public submission page data
  async getPublic(projectId: string): Promise<{
    projectName: string;
    oneLineIdea: string;
    teamMembers: Array<{ name: string; role?: string }>;
    submission: SubmissionPackage;
    generatedAt: Date;
  }> {
    const response = await apiRequest<{
      projectName: string;
      oneLineIdea: string;
      teamMembers: Array<{ name: string; role?: string }>;
      submission: SubmissionPackage;
      generatedAt: Date;
    }>(`/submission/${projectId}/public`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch public submission page');
    }
    
    return response.data;
  },
};

// Error types for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Main API object that combines all API functions
export const api = {
  // Project methods
  createProject: projectApi.create,
  getProject: projectApi.getById,
  updateProject: projectApi.update,
  addTeamMember: projectApi.addMember,
  removeTeamMember: projectApi.removeMember,
  
  // Task methods
  getTasks: taskApi.getByProject,
  createTask: taskApi.create,
  updateTask: taskApi.update,
  deleteTask: taskApi.delete,
  
  // Pivot methods
  getPivots: pivotApi.getByProject,
  createPivot: pivotApi.create,
  
  // Submission methods
  createOrUpdateSubmission: submissionApi.createOrUpdate,
  getSubmission: submissionApi.getByProject,
  getPublicSubmission: submissionApi.getPublic,
  
  // Auth methods
  setAuthToken,
  getAuthToken,
  clearAuthToken,
};