import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { generateProjectToken } from '../middleware/auth.js';
import { connectDB, disconnectDB } from '../test/setup.js';

describe('Task API Endpoints', () => {
  let projectId: string;
  let token: string;
  let projectData: any;

  beforeEach(async () => {
    await connectDB();
    
    // Create a test project
    projectData = {
      projectId: 'test-project-123',
      projectName: 'Test Project',
      oneLineIdea: 'A test project for task management',
      teamMembers: [
        {
          id: 'member-1',
          name: 'John Doe',
          role: 'Team Lead',
          joinedAt: new Date()
        },
        {
          id: 'member-2',
          name: 'Jane Smith',
          role: 'Developer',
          joinedAt: new Date()
        }
      ],
      judgingCriteria: [],
      pivotLog: []
    };

    const project = new Project(projectData);
    await project.save();
    
    projectId = projectData.projectId;
    token = generateProjectToken(projectId);
  });

  afterEach(async () => {
    await Task.deleteMany({});
    await Project.deleteMany({});
    await disconnectDB();
  });

  describe('GET /api/projects/:id/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return all tasks for a project sorted by column and order', async () => {
      // Create test tasks
      const tasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'First task',
          projectId,
          columnId: 'todo',
          order: 0,
          assignedTo: 'John Doe'
        },
        {
          id: 'task-2',
          title: 'Task 2',
          projectId,
          columnId: 'inprogress',
          order: 0
        },
        {
          id: 'task-3',
          title: 'Task 3',
          projectId,
          columnId: 'todo',
          order: 1
        }
      ];

      await Task.insertMany(tasks);

      const response = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      
      // Verify tasks are sorted properly
      const returnedTasks = response.body.data;
      expect(returnedTasks[0].title).toBe('Task 2'); // inprogress comes first
      expect(returnedTasks[1].title).toBe('Task 1'); // todo order 0
      expect(returnedTasks[2].title).toBe('Task 3'); // todo order 1
    });

    it('should return 403 when accessing tasks for different project', async () => {
      const otherToken = generateProjectToken('other-project');
      
      const response = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should return 404 when project does not exist', async () => {
      const nonExistentProjectId = 'non-existent-project';
      const nonExistentToken = generateProjectToken(nonExistentProjectId);
      
      const response = await request(app)
        .get(`/api/projects/${nonExistentProjectId}/tasks`)
        .set('Authorization', `Bearer ${nonExistentToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
    });

    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('POST /api/projects/:id/tasks', () => {
    it('should create a new task with minimal data', async () => {
      const taskData = {
        title: 'New Task'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Task');
      expect(response.body.data.columnId).toBe('todo'); // default
      expect(response.body.data.projectId).toBe(projectId);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.order).toBe(0); // first task
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should create a new task with full data', async () => {
      const taskData = {
        title: 'Detailed Task',
        description: 'This is a detailed task description',
        assignedTo: 'John Doe',
        columnId: 'inprogress',
        order: 5
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Detailed Task');
      expect(response.body.data.description).toBe('This is a detailed task description');
      expect(response.body.data.assignedTo).toBe('John Doe');
      expect(response.body.data.columnId).toBe('inprogress');
      expect(response.body.data.order).toBe(5);
    });

    it('should auto-increment order when not provided', async () => {
      // Create first task
      await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'First Task' })
        .expect(201);

      // Create second task - should get order 1
      const response = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Second Task' })
        .expect(201);

      expect(response.body.data.order).toBe(1);
    });

    it('should return 400 when assignedTo is not a team member', async () => {
      const taskData = {
        title: 'Invalid Assignment',
        assignedTo: 'Non Existent Member'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ASSIGNEE');
    });

    it('should return 400 when title is missing', async () => {
      const taskData = {
        description: 'Task without title'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CREATE_TASK_FAILED');
    });

    it('should return 400 when columnId is invalid', async () => {
      const taskData = {
        title: 'Invalid Column',
        columnId: 'invalid-column'
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CREATE_TASK_FAILED');
    });

    it('should return 403 when creating task for different project', async () => {
      const otherToken = generateProjectToken('other-project');
      
      const response = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized Task' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = new Task({
        id: 'test-task-123',
        title: 'Original Task',
        description: 'Original description',
        projectId,
        columnId: 'todo',
        order: 0,
        assignedTo: 'John Doe'
      });
      await task.save();
      taskId = task.id;
    });

    it('should update task title', async () => {
      const updateData = {
        title: 'Updated Task Title'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Task Title');
      expect(response.body.data.description).toBe('Original description'); // unchanged
    });

    it('should update multiple task fields', async () => {
      const updateData = {
        title: 'New Title',
        description: 'New description',
        columnId: 'inprogress',
        assignedTo: 'Jane Smith',
        order: 5
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Title');
      expect(response.body.data.description).toBe('New description');
      expect(response.body.data.columnId).toBe('inprogress');
      expect(response.body.data.assignedTo).toBe('Jane Smith');
      expect(response.body.data.order).toBe(5);
    });

    it('should clear assignedTo when set to empty string', async () => {
      const updateData = {
        assignedTo: ''
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedTo).toBe('');
    });

    it('should return 400 when assignedTo is not a team member', async () => {
      const updateData = {
        assignedTo: 'Non Existent Member'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ASSIGNEE');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-task')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('should return 403 when updating task from different project', async () => {
      const otherToken = generateProjectToken('other-project');
      
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should return 400 when validation fails', async () => {
      const updateData = {
        title: '', // empty title should fail validation
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UPDATE_TASK_FAILED');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = new Task({
        id: 'test-task-delete',
        title: 'Task to Delete',
        projectId,
        columnId: 'todo',
        order: 0
      });
      await task.save();
      taskId = task.id;
    });

    it('should delete a task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.timestamp).toBeDefined();

      // Verify task is actually deleted
      const deletedTask = await Task.findByTaskId(taskId);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-task')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('should return 403 when deleting task from different project', async () => {
      const otherToken = generateProjectToken('other-project');
      
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('Task API Integration', () => {
    it('should handle complete task lifecycle', async () => {
      // Create a task
      const createResponse = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Lifecycle Task',
          description: 'Testing complete lifecycle',
          assignedTo: 'John Doe'
        })
        .expect(201);

      const taskId = createResponse.body.data.id;

      // Get all tasks
      const getResponse = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getResponse.body.data).toHaveLength(1);
      expect(getResponse.body.data[0].id).toBe(taskId);

      // Update the task
      const updateResponse = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Lifecycle Task',
          columnId: 'done',
          assignedTo: 'Jane Smith'
        })
        .expect(200);

      expect(updateResponse.body.data.title).toBe('Updated Lifecycle Task');
      expect(updateResponse.body.data.columnId).toBe('done');
      expect(updateResponse.body.data.assignedTo).toBe('Jane Smith');

      // Delete the task
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify task is gone
      const finalGetResponse = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(finalGetResponse.body.data).toHaveLength(0);
    });

    it('should maintain task ordering correctly', async () => {
      // Create multiple tasks in todo column
      const tasks = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post(`/api/projects/${projectId}/tasks`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: `Task ${i}` })
          .expect(201);
        tasks.push(response.body.data);
      }

      // Verify ordering
      expect(tasks[0].order).toBe(0);
      expect(tasks[1].order).toBe(1);
      expect(tasks[2].order).toBe(2);

      // Move middle task to different column
      await request(app)
        .put(`/api/tasks/${tasks[1].id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ columnId: 'inprogress' })
        .expect(200);

      // Get all tasks and verify structure
      const getResponse = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const allTasks = getResponse.body.data;
      const todoTasks = allTasks.filter((t: any) => t.columnId === 'todo');
      const inProgressTasks = allTasks.filter((t: any) => t.columnId === 'inprogress');

      expect(todoTasks).toHaveLength(2);
      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0].title).toBe('Task 1');
    });
  });
});