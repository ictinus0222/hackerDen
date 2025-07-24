import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { Task, ITask } from './Task.js';

describe('Task Model', () => {
  beforeEach(async () => {
    // Clear the collection before each test
    await Task.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await Task.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid task', async () => {
      const taskData = {
        id: 'task-1',
        title: 'Implement authentication',
        description: 'Add login and registration functionality',
        assignedTo: 'John Doe',
        columnId: 'todo',
        projectId: 'project-1',
        order: 0
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.id).toBe(taskData.id);
      expect(savedTask.title).toBe(taskData.title);
      expect(savedTask.description).toBe(taskData.description);
      expect(savedTask.assignedTo).toBe(taskData.assignedTo);
      expect(savedTask.columnId).toBe(taskData.columnId);
      expect(savedTask.projectId).toBe(taskData.projectId);
      expect(savedTask.order).toBe(taskData.order);
      expect(savedTask.createdAt).toBeDefined();
      expect(savedTask.updatedAt).toBeDefined();
    });

    it('should create task with minimal required fields', async () => {
      const taskData = {
        id: 'task-1',
        title: 'Simple task',
        columnId: 'todo',
        projectId: 'project-1'
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.id).toBe(taskData.id);
      expect(savedTask.title).toBe(taskData.title);
      expect(savedTask.description).toBeUndefined();
      expect(savedTask.assignedTo).toBeUndefined();
      expect(savedTask.order).toBe(0); // Default value
    });

    it('should require task id', async () => {
      const taskData = {
        title: 'Test task',
        columnId: 'todo',
        projectId: 'project-1'
      };

      const task = new Task(taskData);
      
      await expect(task.save()).rejects.toThrow();
    });

    it('should require title', async () => {
      const taskData = {
        id: 'task-1',
        columnId: 'todo',
        projectId: 'project-1'
      };

      const task = new Task(taskData);
      
      await expect(task.save()).rejects.toThrow();
    });

    it('should require valid columnId', async () => {
      const taskData = {
        id: 'task-1',
        title: 'Test task',
        columnId: 'invalid-column',
        projectId: 'project-1'
      };

      const task = new Task(taskData);
      
      await expect(task.save()).rejects.toThrow();
    });

    it('should validate columnId enum values', async () => {
      const validColumns = ['todo', 'inprogress', 'done'];
      
      for (const columnId of validColumns) {
        const taskData = {
          id: `task-${columnId}`,
          title: 'Test task',
          columnId,
          projectId: 'project-1'
        };

        const task = new Task(taskData);
        const savedTask = await task.save();
        
        expect(savedTask.columnId).toBe(columnId);
      }
    });

    it('should enforce unique task IDs', async () => {
      const taskData1 = {
        id: 'task-1',
        title: 'First task',
        columnId: 'todo',
        projectId: 'project-1'
      };

      const taskData2 = {
        id: 'task-1', // Same ID
        title: 'Second task',
        columnId: 'inprogress',
        projectId: 'project-2'
      };

      const task1 = new Task(taskData1);
      await task1.save();

      const task2 = new Task(taskData2);
      await expect(task2.save()).rejects.toThrow();
    });

    it('should reject negative order values', async () => {
      const taskData = {
        id: 'task-1',
        title: 'Test task',
        columnId: 'todo',
        projectId: 'project-1',
        order: -1
      };

      const task = new Task(taskData);
      
      await expect(task.save()).rejects.toThrow('is less than minimum allowed value');
    });
  });

  describe('Instance Methods', () => {
    let task: ITask;

    beforeEach(async () => {
      const taskData = {
        id: 'task-1',
        title: 'Test task',
        description: 'A test task',
        columnId: 'todo',
        projectId: 'project-1',
        order: 0
      };

      task = new Task(taskData);
      await task.save();
    });

    it('should move task to different column', async () => {
      await task.moveToColumn('inprogress', 1);
      
      expect(task.columnId).toBe('inprogress');
      expect(task.order).toBe(1);
    });

    it('should move task to column without changing order', async () => {
      await task.moveToColumn('done');
      
      expect(task.columnId).toBe('done');
      expect(task.order).toBe(0); // Should remain unchanged
    });

    it('should assign task to team member', async () => {
      await task.assignTo('Jane Doe');
      
      expect(task.assignedTo).toBe('Jane Doe');
    });

    it('should update task order', async () => {
      await task.updateOrder(5);
      
      expect(task.order).toBe(5);
    });

    it('should reject negative order in updateOrder', async () => {
      try {
        await task.updateOrder(-1);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Order must be non-negative');
      }
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          columnId: 'todo',
          projectId: 'project-1',
          order: 0,
          assignedTo: 'John Doe'
        },
        {
          id: 'task-2',
          title: 'Task 2',
          columnId: 'inprogress',
          projectId: 'project-1',
          order: 1,
          assignedTo: 'Jane Doe'
        },
        {
          id: 'task-3',
          title: 'Task 3',
          columnId: 'todo',
          projectId: 'project-2',
          order: 0
        }
      ];

      await Task.insertMany(tasks);
    });

    it('should find tasks by project ID', async () => {
      const tasks = await Task.findByProjectId('project-1');
      
      expect(tasks).toHaveLength(2);
      expect(tasks[0].columnId).toBe('inprogress'); // Should be sorted by columnId
      expect(tasks[1].columnId).toBe('todo');
    });

    it('should find tasks by column', async () => {
      const tasks = await Task.findByColumn('project-1', 'todo');
      
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 1');
    });

    it('should find tasks by assignee', async () => {
      const tasks = await Task.findByAssignee('project-1', 'John Doe');
      
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 1');
    });

    it('should find task by task ID', async () => {
      const task = await Task.findByTaskId('task-1');
      
      expect(task).toBeDefined();
      expect(task?.title).toBe('Task 1');
    });

    it('should return null for non-existent task', async () => {
      const task = await Task.findByTaskId('non-existent');
      
      expect(task).toBeNull();
    });

    it('should get max order in column', async () => {
      // Add more tasks to test max order
      await Task.create({
        id: 'task-4',
        title: 'Task 4',
        columnId: 'todo',
        projectId: 'project-1',
        order: 5
      });

      const maxOrder = await Task.getMaxOrderInColumn('project-1', 'todo');
      
      expect(maxOrder).toBe(5);
    });

    it('should return -1 for empty column', async () => {
      const maxOrder = await Task.getMaxOrderInColumn('project-1', 'done');
      
      expect(maxOrder).toBe(-1);
    });

    it('should reorder tasks in column', async () => {
      // Add another task to the same column
      await Task.create({
        id: 'task-4',
        title: 'Task 4',
        columnId: 'todo',
        projectId: 'project-1',
        order: 1
      });

      const reorderData = [
        { taskId: 'task-1', order: 2 },
        { taskId: 'task-4', order: 0 }
      ];

      await Task.reorderTasksInColumn('project-1', 'todo', reorderData);

      const task1 = await Task.findByTaskId('task-1');
      const task4 = await Task.findByTaskId('task-4');

      expect(task1?.order).toBe(2);
      expect(task4?.order).toBe(0);
    });
  });
});