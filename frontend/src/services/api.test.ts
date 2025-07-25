import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { projectApi, taskApi, pivotApi, setAuthToken, getAuthToken, clearAuthToken, ApiError } from './api';
import type { ProjectHub, TeamMember, Task } from '../types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create proper mock response
const createMockResponse = (data: any, ok = true, status = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  headers: {
    get: vi.fn((name: string) => {
      if (name === 'content-type') return 'application/json';
      return null;
    })
  },
  json: () => Promise.resolve(data)
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Test Task 1',
    description: 'First test task',
    assignedTo: 'member-1',
    columnId: 'todo',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    order: 1
  },
  {
    id: 'task-2',
    title: 'Test Task 2',
    columnId: 'inprogress',
    createdAt: new Date('2024-01-01T11:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z'),
    order: 1
  }
];

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token management', () => {
    beforeEach(() => {
      clearAuthToken();
    });

    it('should set and get auth token', () => {
      const token = 'test-token-123';
      
      setAuthToken(token);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hackerden_token', token);
      expect(getAuthToken()).toBe(token);
    });

    it('should get token from localStorage if not in memory', () => {
      const token = 'stored-token-456';
      mockLocalStorage.getItem.mockReturnValue(token);
      
      expect(getAuthToken()).toBe(token);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('hackerden_token');
    });

    it('should clear auth token', () => {
      setAuthToken('test-token');
      
      clearAuthToken();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hackerden_token');
      
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('Task API', () => {
    beforeEach(() => {
      setAuthToken('test-token-123');
    });

    describe('getByProject', () => {
      it('should fetch tasks for project successfully', async () => {
        mockFetch.mockResolvedValue(createMockResponse({
          success: true,
          data: mockTasks,
          timestamp: new Date().toISOString()
        }));

        const result = await taskApi.getByProject('test-project-1');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/test-project-1/tasks',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token-123'
            })
          })
        );

        expect(result).toEqual(mockTasks);
        expect(result[0].createdAt).toBeInstanceOf(Date);
        expect(result[0].updatedAt).toBeInstanceOf(Date);
      });

      it('should handle fetch tasks errors', async () => {
        mockFetch.mockResolvedValue(createMockResponse({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found'
          },
          timestamp: new Date().toISOString()
        }, false, 404));

        await expect(taskApi.getByProject('nonexistent-project'))
          .rejects.toThrow('Project not found');
      });
    });

    describe('create', () => {
      it('should create task successfully', async () => {
        const taskData = {
          title: 'New Task',
          description: 'Task description',
          assignedTo: 'member-1',
          columnId: 'todo'
        };

        const createdTask: Task = {
          id: 'task-3',
          ...taskData,
          createdAt: new Date('2024-01-01T12:00:00Z'),
          updatedAt: new Date('2024-01-01T12:00:00Z'),
          order: 1
        };

        mockFetch.mockResolvedValue(createMockResponse({
          success: true,
          data: createdTask,
          timestamp: new Date().toISOString()
        }));

        const result = await taskApi.create('test-project-1', taskData);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/test-project-1/tasks',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token-123',
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(taskData)
          })
        );

        expect(result).toEqual(createdTask);
      });

      it('should validate required fields', async () => {
        await expect(taskApi.create('test-project-1', {
          title: '',
          columnId: 'todo'
        })).rejects.toThrow('Task title is required');

        await expect(taskApi.create('test-project-1', {
          title: '   ',
          columnId: 'todo'
        })).rejects.toThrow('Task title is required');

        await expect(taskApi.create('test-project-1', {
          title: 'Valid Title',
          columnId: ''
        })).rejects.toThrow('Task column is required');
      });

      it('should trim whitespace from inputs', async () => {
        const taskData = {
          title: '  Trimmed Task  ',
          description: '  Trimmed description  ',
          columnId: 'todo'
        };

        const createdTask: Task = {
          id: 'task-3',
          title: 'Trimmed Task',
          description: 'Trimmed description',
          columnId: 'todo',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 1
        };

        mockFetch.mockResolvedValue(createMockResponse({
          success: true,
          data: createdTask,
          timestamp: new Date().toISOString()
        }));

        await taskApi.create('test-project-1', taskData);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/test-project-1/tasks',
          expect.objectContaining({
            body: JSON.stringify({
              title: 'Trimmed Task',
              description: 'Trimmed description',
              columnId: 'todo'
            })
          })
        );
      });

      it('should handle creation errors', async () => {
        mockFetch.mockResolvedValue(createMockResponse({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid column ID',
            details: { columnId: 'invalid-column' }
          },
          timestamp: new Date().toISOString()
        }, false, 400));

        await expect(taskApi.create('test-project-1', {
          title: 'Test Task',
          columnId: 'invalid-column'
        })).rejects.toThrow('Invalid column ID');
      });
    });

    describe('update', () => {
      it('should update task successfully', async () => {
        const updates = {
          title: 'Updated Task',
          description: 'Updated description',
          assignedTo: 'member-2',
          columnId: 'inprogress'
        };

        const updatedTask: Task = {
          ...mockTasks[0],
          ...updates,
          updatedAt: new Date('2024-01-01T13:00:00Z')
        };

        mockFetch.mockResolvedValue(createMockResponse({
          success: true,
          data: updatedTask,
          timestamp: new Date().toISOString()
        }));

        const result = await taskApi.update('task-1', updates);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tasks/task-1',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token-123',
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('"title":"Updated Task"')
          })
        );

        expect(result).toEqual(updatedTask);
      });

      it('should handle partial updates', async () => {
        const updates = { columnId: 'done' };

        const updatedTask: Task = {
          ...mockTasks[0],
          columnId: 'done',
          updatedAt: new Date()
        };

        mockFetch.mockResolvedValue(createMockResponse({
          success: true,
          data: updatedTask,
          timestamp: new Date().toISOString()
        }));

        const result = await taskApi.update('task-1', updates);

        expect(result.columnId).toBe('done');
        expect(result.title).toBe(mockTasks[0].title);
      });

      it('should validate title updates', async () => {
        await expect(taskApi.update('task-1', { title: '' }))
          .rejects.toThrow('Task title cannot be empty');

        await expect(taskApi.update('task-1', { title: '   ' }))
          .rejects.toThrow('Task title cannot be empty');
      });

      it('should handle update errors', async () => {
        mockFetch.mockResolvedValue(createMockResponse({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          },
          timestamp: new Date().toISOString()
        }, false, 404));

        await expect(taskApi.update('nonexistent-task', { title: 'Updated' }))
          .rejects.toThrow('Task not found');
      });

      it('should include updatedAt timestamp in request', async () => {
        const updates = { title: 'Updated Task' };

        mockFetch.mockResolvedValue(createMockResponse({
          success: true,
          data: { ...mockTasks[0], ...updates },
          timestamp: new Date().toISOString()
        }));

        await taskApi.update('task-1', updates);

        const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(requestBody.updatedAt).toBeDefined();
        expect(new Date(requestBody.updatedAt)).toBeInstanceOf(Date);
      });
    });

    describe('delete', () => {
      it('should delete task successfully', async () => {
        mockFetch.mockResolvedValue(createMockResponse({
          success: true,
          timestamp: new Date().toISOString()
        }));

        await taskApi.delete('task-1');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tasks/task-1',
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token-123'
            })
          })
        );
      });

      it('should handle deletion errors', async () => {
        mockFetch.mockResolvedValue(createMockResponse({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          },
          timestamp: new Date().toISOString()
        }, false, 404));

        await expect(taskApi.delete('nonexistent-task'))
          .rejects.toThrow('Task not found');
      });
    });


  });
});