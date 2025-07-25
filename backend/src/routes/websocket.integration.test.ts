import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import express from 'express';
import request from 'supertest';
import { SocketService } from '../services/socketService.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { connectDB, disconnectDB } from '../test/setup.js';
import { generateProjectToken } from '../middleware/auth.js';
import projectRoutes, { setSocketService as setProjectSocketService } from './projects.js';
import taskRoutes, { setSocketService as setTaskSocketService } from './tasks.js';

describe('WebSocket Integration with API Routes', () => {
  let app: express.Application;
  let httpServer: any;
  let io: Server;
  let socketService: SocketService;
  let clientSocket: ClientSocket;
  let serverPort: number;
  let testProject: any;
  let authToken: string;

  beforeEach(async () => {
    await connectDB();
    
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Create HTTP server and Socket.io server
    httpServer = createServer(app);
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialize socket service
    socketService = new SocketService(io);
    
    // Set socket service references in routes
    setProjectSocketService(() => socketService);
    setTaskSocketService(() => socketService);

    // Add routes
    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);

    // Start server on random port
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        serverPort = httpServer.address()?.port;
        resolve();
      });
    });

    // Create test project
    testProject = new Project({
      projectId: 'test-project-123',
      projectName: 'Test Project',
      oneLineIdea: 'A test project for integration testing',
      teamMembers: [{
        id: 'member-1',
        name: 'Test User',
        role: 'Developer',
        joinedAt: new Date()
      }],
      deadlines: {
        hackingEnds: new Date(Date.now() + 86400000),
        submissionDeadline: new Date(Date.now() + 90000000),
        presentationTime: new Date(Date.now() + 93600000)
      },
      judgingCriteria: [],
      pivotLog: []
    });
    await testProject.save();

    // Generate auth token
    authToken = generateProjectToken('test-project-123');

    // Create client socket and join project room
    clientSocket = Client(`http://localhost:${serverPort}`);
    
    await new Promise<void>((resolve) => {
      clientSocket.on('connect', resolve);
    });

    clientSocket.emit('join-project', { 
      projectId: 'test-project-123', 
      userName: 'Test User' 
    });

    await new Promise<void>((resolve) => {
      clientSocket.on('joined-project', resolve);
    });
  });

  afterEach(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    if (httpServer) {
      httpServer.close();
    }
    await disconnectDB();
  });

  describe('Project Updates via API', () => {
    it('should emit socket events when project is updated via API', async () => {
      const updatePromise = new Promise<void>((resolve) => {
        clientSocket.on('project:updated', (data) => {
          expect(data.projectName).toBe('Updated Project Name');
          expect(data.oneLineIdea).toBe('Updated project idea');
          resolve();
        });
      });

      // Update project via API
      const response = await request(app)
        .put('/api/projects/test-project-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectName: 'Updated Project Name',
          oneLineIdea: 'Updated project idea'
        });

      expect(response.status).toBe(200);
      await updatePromise;
    });

    it('should emit socket events when team member is added via API', async () => {
      const memberJoinedPromise = new Promise<void>((resolve) => {
        clientSocket.on('member:joined', (data) => {
          expect(data.name).toBe('New Team Member');
          expect(data.role).toBe('Designer');
          resolve();
        });
      });

      // Add team member via API
      const response = await request(app)
        .post('/api/projects/test-project-123/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Team Member',
          role: 'Designer'
        });

      expect(response.status).toBe(201);
      await memberJoinedPromise;
    });

    it('should emit socket events when team member is removed via API', async () => {
      // First add a second member so we can remove one
      await request(app)
        .post('/api/projects/test-project-123/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Member to Remove',
          role: 'Tester'
        });

      // Get the updated project to find the member ID
      const projectResponse = await request(app)
        .get('/api/projects/test-project-123')
        .set('Authorization', `Bearer ${authToken}`);

      const memberToRemove = projectResponse.body.data.teamMembers.find(
        (m: any) => m.name === 'Member to Remove'
      );

      const memberLeftPromise = new Promise<void>((resolve) => {
        clientSocket.on('member:left', (data) => {
          expect(data.memberId).toBe(memberToRemove.id);
          resolve();
        });
      });

      // Remove team member via API
      const response = await request(app)
        .delete(`/api/projects/test-project-123/members/${memberToRemove.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      await memberLeftPromise;
    });

    it('should emit socket events when pivot is logged via API', async () => {
      const pivotLoggedPromise = new Promise<void>((resolve) => {
        clientSocket.on('pivot:logged', (data) => {
          expect(data.description).toBe('Changed from web to mobile');
          expect(data.reason).toBe('Better user experience');
          resolve();
        });
      });

      // Log pivot via API
      const response = await request(app)
        .post('/api/projects/test-project-123/pivots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Changed from web to mobile',
          reason: 'Better user experience'
        });

      expect(response.status).toBe(201);
      await pivotLoggedPromise;
    });
  });

  describe('Task Updates via API', () => {
    let testTask: any;

    beforeEach(async () => {
      // Create a test task
      testTask = new Task({
        id: 'test-task-123',
        projectId: 'test-project-123',
        title: 'Test Task',
        description: 'A test task for integration testing',
        columnId: 'todo',
        assignedTo: 'Test User',
        order: 1
      });
      await testTask.save();
    });

    it('should emit socket events when task is created via API', async () => {
      const taskCreatedPromise = new Promise<void>((resolve) => {
        clientSocket.on('task:created', (data) => {
          expect(data.title).toBe('New Task from API');
          expect(data.columnId).toBe('todo');
          expect(data.assignedTo).toBe('Test User');
          resolve();
        });
      });

      // Create task via API
      const response = await request(app)
        .post('/api/projects/test-project-123/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Task from API',
          description: 'A task created via API',
          columnId: 'todo',
          assignedTo: 'Test User'
        });

      expect(response.status).toBe(201);
      await taskCreatedPromise;
    });

    it('should emit socket events when task is updated via API', async () => {
      const taskUpdatedPromise = new Promise<void>((resolve) => {
        clientSocket.on('task:updated', (data) => {
          expect(data.title).toBe('Updated Task Title');
          expect(data.description).toBe('Updated description');
          resolve();
        });
      });

      // Update task via API
      const response = await request(app)
        .put('/api/tasks/test-task-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task Title',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      await taskUpdatedPromise;
    });

    it('should emit socket events when task is moved between columns via API', async () => {
      const taskMovedPromise = new Promise<void>((resolve) => {
        clientSocket.on('task:moved', (data) => {
          expect(data.columnId).toBe('inprogress');
          expect(data.title).toBe('Test Task');
          resolve();
        });
      });

      // Move task to different column via API
      const response = await request(app)
        .put('/api/tasks/test-task-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          columnId: 'inprogress'
        });

      expect(response.status).toBe(200);
      await taskMovedPromise;
    });

    it('should emit socket events when task is deleted via API', async () => {
      const taskDeletedPromise = new Promise<void>((resolve) => {
        clientSocket.on('task:deleted', (data) => {
          expect(data.taskId).toBe('test-task-123');
          resolve();
        });
      });

      // Delete task via API
      const response = await request(app)
        .delete('/api/tasks/test-task-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      await taskDeletedPromise;
    });
  });

  describe('Multi-User Scenarios', () => {
    let client2: ClientSocket;

    beforeEach(async () => {
      // Create second client and join same project
      client2 = Client(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        client2.on('connect', resolve);
      });

      client2.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'Second User' 
      });

      await new Promise<void>((resolve) => {
        client2.on('joined-project', resolve);
      });
    });

    afterEach(() => {
      if (client2) {
        client2.disconnect();
      }
    });

    it('should broadcast updates to all users in the same project', async () => {
      const client1Promise = new Promise<void>((resolve) => {
        clientSocket.on('project:updated', (data) => {
          expect(data.projectName).toBe('Multi-User Update');
          resolve();
        });
      });

      const client2Promise = new Promise<void>((resolve) => {
        client2.on('project:updated', (data) => {
          expect(data.projectName).toBe('Multi-User Update');
          resolve();
        });
      });

      // Update project via API
      await request(app)
        .put('/api/projects/test-project-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectName: 'Multi-User Update'
        });

      await Promise.all([client1Promise, client2Promise]);
    });

    it('should broadcast task updates to all users in the same project', async () => {
      // Create a test task first
      const testTask = new Task({
        id: 'multi-user-task',
        projectId: 'test-project-123',
        title: 'Multi-User Task',
        description: 'A task for multi-user testing',
        columnId: 'todo',
        assignedTo: 'Test User',
        order: 1
      });
      await testTask.save();

      const client1Promise = new Promise<void>((resolve) => {
        clientSocket.on('task:moved', (data) => {
          expect(data.columnId).toBe('done');
          resolve();
        });
      });

      const client2Promise = new Promise<void>((resolve) => {
        client2.on('task:moved', (data) => {
          expect(data.columnId).toBe('done');
          resolve();
        });
      });

      // Move task via API
      await request(app)
        .put('/api/tasks/multi-user-task')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          columnId: 'done'
        });

      await Promise.all([client1Promise, client2Promise]);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors without affecting WebSocket connections', async () => {
      // Try to update non-existent project
      const response = await request(app)
        .put('/api/projects/non-existent-project')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectName: 'Should Fail'
        });

      expect(response.status).toBe(403); // Access denied due to project mismatch

      // WebSocket connection should still be active
      expect(socketService.isUserConnected(clientSocket.id)).toBe(true);
      expect(socketService.getUsersInProject('test-project-123')).toHaveLength(1);
    });

    it('should handle WebSocket disconnections without affecting API', async () => {
      // Disconnect WebSocket
      clientSocket.disconnect();

      // Wait for disconnect to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // API should still work
      const response = await request(app)
        .get('/api/projects/test-project-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.projectName).toBe('Test Project');
    });
  });

  describe('Connection Management', () => {
    it('should handle reconnection scenarios', async () => {
      // Disconnect and reconnect
      clientSocket.disconnect();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(socketService.getUsersInProject('test-project-123')).toHaveLength(0);

      // Reconnect
      clientSocket = Client(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket.on('connect', resolve);
      });

      clientSocket.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'Reconnected User' 
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('joined-project', resolve);
      });

      expect(socketService.getUsersInProject('test-project-123')).toHaveLength(1);
    });

    it('should handle room switching', async () => {
      // Create second project
      const project2 = new Project({
        projectId: 'test-project-456',
        projectName: 'Second Project',
        oneLineIdea: 'Another test project',
        teamMembers: [{
          id: 'member-1',
          name: 'Test User',
          role: 'Developer',
          joinedAt: new Date()
        }],
        deadlines: {
          hackingEnds: new Date(Date.now() + 86400000),
          submissionDeadline: new Date(Date.now() + 90000000),
          presentationTime: new Date(Date.now() + 93600000)
        },
        judgingCriteria: [],
        pivotLog: []
      });
      await project2.save();

      // Switch to second project
      clientSocket.emit('join-project', { 
        projectId: 'test-project-456', 
        userName: 'Test User' 
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('joined-project', (data) => {
          expect(data.projectId).toBe('test-project-456');
          resolve();
        });
      });

      // Should be in new project room, not old one
      expect(socketService.getUsersInProject('test-project-123')).toHaveLength(0);
      expect(socketService.getUsersInProject('test-project-456')).toHaveLength(1);
    });
  });
});