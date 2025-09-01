import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '../taskService';
import { messageService } from '../messageService';

// Mock the messageService
vi.mock('../messageService', () => ({
  messageService: {
    sendSystemMessage: vi.fn()
  }
}));

// Mock the appwrite dependencies
vi.mock('../../lib/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    getDocument: vi.fn(),
    listDocuments: vi.fn(),
    deleteDocument: vi.fn()
  },
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    TASKS: 'test-tasks-collection'
  },
  Query: {
    equal: vi.fn(),
    orderDesc: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn()
  },
  ID: {
    unique: vi.fn(() => 'test-id')
  },
  default: {
    subscribe: vi.fn()
  }
}));

// Mock userNameService
vi.mock('../userNameService', () => ({
  userNameService: {
    setUserName: vi.fn()
  }
}));

describe('taskService system message integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should send system message when task is created', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock successful task creation
      const mockTask = {
        $id: 'task-123',
        title: 'Test Task',
        teamId: 'team-123'
      };
      databases.createDocument.mockResolvedValue(mockTask);

      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        assignedTo: 'user-456',
        createdBy: 'user-123',
        priority: 'high'
      };

      await taskService.createTask(
        'team-123',
        'hackathon-123',
        taskData,
        'John Doe',
        'Jane Smith'
      );

      // Verify system message was sent
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        '📝 John Doe created a new task: "Test Task" (assigned to Jane Smith)',
        'task_created',
        {
          taskId: 'task-123',
          taskTitle: 'Test Task',
          createdBy: 'John Doe',
          assignedTo: 'Jane Smith',
          priority: 'high'
        }
      );
    });

    it('should continue task creation even if system message fails', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock successful task creation
      const mockTask = {
        $id: 'task-123',
        title: 'Test Task',
        teamId: 'team-123'
      };
      databases.createDocument.mockResolvedValue(mockTask);

      // Mock system message failure
      messageService.sendSystemMessage.mockRejectedValue(new Error('Message service error'));

      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        createdBy: 'user-123'
      };

      // Should not throw error even if system message fails
      const result = await taskService.createTask(
        'team-123',
        'hackathon-123',
        taskData,
        'John Doe'
      );

      expect(result).toEqual(mockTask);
      expect(messageService.sendSystemMessage).toHaveBeenCalled();
    });
  });

  describe('updateTaskStatus', () => {
    it('should send system message when task status changes', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock current task
      const currentTask = {
        $id: 'task-123',
        title: 'Test Task',
        status: 'todo'
      };
      databases.getDocument.mockResolvedValue(currentTask);

      // Mock updated task
      const updatedTask = {
        ...currentTask,
        status: 'in_progress'
      };
      databases.updateDocument.mockResolvedValue(updatedTask);

      await taskService.updateTaskStatus(
        'task-123',
        'in_progress',
        'Test Task',
        'team-123',
        'hackathon-123',
        'user-123',
        'John Doe'
      );

      // Verify system message was sent
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        '🔄 John Doe changed task "Test Task" from todo to in_progress',
        'task_status_changed',
        {
          taskId: 'task-123',
          taskTitle: 'Test Task',
          oldStatus: 'todo',
          newStatus: 'in_progress',
          changedBy: 'John Doe'
        }
      );
    });

    it('should send completion message when task is completed', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock current task
      const currentTask = {
        $id: 'task-123',
        title: 'Test Task',
        status: 'in_progress'
      };
      databases.getDocument.mockResolvedValue(currentTask);

      // Mock updated task
      const updatedTask = {
        ...currentTask,
        status: 'completed'
      };
      databases.updateDocument.mockResolvedValue(updatedTask);

      await taskService.updateTaskStatus(
        'task-123',
        'completed',
        'Test Task',
        'team-123',
        'hackathon-123',
        'user-123',
        'John Doe'
      );

      // Verify completion message was sent
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        '✅ John Doe completed task: "Test Task"',
        'task_completed',
        {
          taskId: 'task-123',
          taskTitle: 'Test Task',
          oldStatus: 'in_progress',
          newStatus: 'completed',
          changedBy: 'John Doe'
        }
      );
    });

    it('should not send system message if status unchanged', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock current task
      const currentTask = {
        $id: 'task-123',
        title: 'Test Task',
        status: 'todo'
      };
      databases.getDocument.mockResolvedValue(currentTask);

      // Mock updated task with same status
      databases.updateDocument.mockResolvedValue(currentTask);

      await taskService.updateTaskStatus(
        'task-123',
        'todo', // Same status
        'Test Task',
        'team-123',
        'hackathon-123',
        'user-123',
        'John Doe'
      );

      // Verify no system message was sent
      expect(messageService.sendSystemMessage).not.toHaveBeenCalled();
    });
  });
});