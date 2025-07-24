import type { ProjectHub, TeamMember, Task, TaskBoard } from '../types';

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

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data: ApiResponse<T> = await response.json();
    
    // Convert date strings back to Date objects
    if (data.data && typeof data.data === 'object') {
      convertDates(data.data);
    }
    
    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
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
    const response = await apiRequest<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create task');
    }
    
    return response.data;
  },

  // Update a task
  async update(taskId: string, updates: Partial<Task>): Promise<Task> {
    const response = await apiRequest<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update task');
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