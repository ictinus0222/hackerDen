import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { SocketService } from './socketService.js';
import { Project } from '../models/Project.js';
import { connectDB, disconnectDB } from '../test/setup.js';

describe('SocketService', () => {
  let httpServer: any;
  let io: Server;
  let socketService: SocketService;
  let clientSocket: ClientSocket;
  let serverPort: number;

  beforeEach(async () => {
    await connectDB();
    
    // Create HTTP server and Socket.io server
    httpServer = createServer();
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialize socket service
    socketService = new SocketService(io);

    // Start server on random port
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        serverPort = httpServer.address()?.port;
        resolve();
      });
    });

    // Create client socket
    clientSocket = Client(`http://localhost:${serverPort}`);
    
    // Wait for connection
    await new Promise<void>((resolve) => {
      clientSocket.on('connect', resolve);
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

  describe('Connection Management', () => {
    it('should handle user connection and disconnection', async () => {
      expect(socketService.isUserConnected(clientSocket.id)).toBe(true);
      
      const connectedUsers = socketService.getConnectedUsers();
      expect(connectedUsers).toHaveLength(1);
      expect(connectedUsers[0].id).toBe(clientSocket.id);

      clientSocket.disconnect();
      
      // Wait for disconnect to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(socketService.isUserConnected(clientSocket.id)).toBe(false);
      expect(socketService.getConnectedUsers()).toHaveLength(0);
    });

    it('should handle multiple user connections', async () => {
      const client2 = Client(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        client2.on('connect', resolve);
      });

      expect(socketService.getConnectedUsers()).toHaveLength(2);
      
      client2.disconnect();
      
      // Wait for disconnect to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(socketService.getConnectedUsers()).toHaveLength(1);
    });
  });

  describe('Project Room Management', () => {
    let testProject: any;

    beforeEach(async () => {
      // Create a test project
      testProject = new Project({
        projectId: 'test-project-123',
        projectName: 'Test Project',
        oneLineIdea: 'A test project for socket testing',
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
    });

    it('should allow users to join project rooms', async () => {
      const joinPromise = new Promise<void>((resolve) => {
        clientSocket.on('joined-project', (data) => {
          expect(data.projectId).toBe('test-project-123');
          resolve();
        });
      });

      clientSocket.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'Test User' 
      });

      await joinPromise;

      const usersInProject = socketService.getUsersInProject('test-project-123');
      expect(usersInProject).toHaveLength(1);
      expect(usersInProject[0].projectId).toBe('test-project-123');
      expect(usersInProject[0].name).toBe('Test User');
    });

    it('should handle joining non-existent project', async () => {
      const errorPromise = new Promise<void>((resolve) => {
        clientSocket.on('error', (data) => {
          expect(data.message).toBe('Project not found');
          resolve();
        });
      });

      clientSocket.emit('join-project', { 
        projectId: 'non-existent-project', 
        userName: 'Test User' 
      });

      await errorPromise;
    });

    it('should notify other users when someone joins', async () => {
      // First user joins
      clientSocket.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'User 1' 
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('joined-project', resolve);
      });

      // Second user joins
      const client2 = Client(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        client2.on('connect', resolve);
      });

      const userJoinedPromise = new Promise<void>((resolve) => {
        clientSocket.on('user-joined', (data) => {
          expect(data.userName).toBe('User 2');
          resolve();
        });
      });

      client2.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'User 2' 
      });

      await userJoinedPromise;
      
      client2.disconnect();
    });

    it('should allow users to leave project rooms', async () => {
      // Join project first
      clientSocket.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'Test User' 
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('joined-project', resolve);
      });

      // Leave project
      clientSocket.emit('leave-project');

      // Wait for leave to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      const usersInProject = socketService.getUsersInProject('test-project-123');
      expect(usersInProject).toHaveLength(0);
    });

    it('should notify other users when someone leaves', async () => {
      // First user joins
      clientSocket.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'User 1' 
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('joined-project', resolve);
      });

      // Second user connects and joins
      const client2 = Client(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        client2.on('connect', resolve);
      });

      // Set up listener for user-left event before second user joins
      const userLeftPromise = new Promise<void>((resolve) => {
        clientSocket.on('user-left', (data) => {
          expect(data.userName).toBe('User 2');
          resolve();
        });
      });

      client2.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'User 2' 
      });

      await new Promise<void>((resolve) => {
        client2.on('joined-project', resolve);
      });

      // User 2 leaves
      client2.disconnect();

      await userLeftPromise;
    });
  });

  describe('Event Broadcasting', () => {
    let testProject: any;

    beforeEach(async () => {
      // Create a test project
      testProject = new Project({
        projectId: 'test-project-123',
        projectName: 'Test Project',
        oneLineIdea: 'A test project for socket testing',
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

      // Join project room
      clientSocket.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'Test User' 
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('joined-project', resolve);
      });
    });

    it('should broadcast project updates', async () => {
      const updatePromise = new Promise<void>((resolve) => {
        clientSocket.on('project:updated', (data) => {
          expect(data.projectName).toBe('Updated Project Name');
          resolve();
        });
      });

      socketService.emitProjectUpdate('test-project-123', {
        ...testProject.toObject(),
        projectName: 'Updated Project Name'
      });

      await updatePromise;
    });

    it('should broadcast member joined events', async () => {
      const memberJoinedPromise = new Promise<void>((resolve) => {
        clientSocket.on('member:joined', (data) => {
          expect(data.name).toBe('New Member');
          expect(data.role).toBe('Designer');
          resolve();
        });
      });

      socketService.emitMemberJoined('test-project-123', {
        id: 'member-2',
        name: 'New Member',
        role: 'Designer',
        joinedAt: new Date()
      });

      await memberJoinedPromise;
    });

    it('should broadcast member left events', async () => {
      const memberLeftPromise = new Promise<void>((resolve) => {
        clientSocket.on('member:left', (data) => {
          expect(data.memberId).toBe('member-1');
          resolve();
        });
      });

      socketService.emitMemberLeft('test-project-123', 'member-1');

      await memberLeftPromise;
    });

    it('should broadcast pivot logged events', async () => {
      const pivotLoggedPromise = new Promise<void>((resolve) => {
        clientSocket.on('pivot:logged', (data) => {
          expect(data.description).toBe('Changed from web app to mobile app');
          expect(data.reason).toBe('Better market fit');
          resolve();
        });
      });

      socketService.emitPivotLogged('test-project-123', {
        id: 'pivot-1',
        description: 'Changed from web app to mobile app',
        reason: 'Better market fit',
        timestamp: new Date()
      });

      await pivotLoggedPromise;
    });

    it('should broadcast task created events', async () => {
      const taskCreatedPromise = new Promise<void>((resolve) => {
        clientSocket.on('task:created', (data) => {
          expect(data.title).toBe('New Task');
          expect(data.columnId).toBe('todo');
          resolve();
        });
      });

      socketService.emitTaskCreated('test-project-123', {
        id: 'task-1',
        title: 'New Task',
        description: 'A new task for testing',
        columnId: 'todo',
        assignedTo: 'Test User',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await taskCreatedPromise;
    });

    it('should broadcast task updated events', async () => {
      const taskUpdatedPromise = new Promise<void>((resolve) => {
        clientSocket.on('task:updated', (data) => {
          expect(data.title).toBe('Updated Task');
          expect(data.assignedTo).toBe('Another User');
          resolve();
        });
      });

      socketService.emitTaskUpdated('test-project-123', {
        id: 'task-1',
        title: 'Updated Task',
        description: 'An updated task',
        columnId: 'todo',
        assignedTo: 'Another User',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await taskUpdatedPromise;
    });

    it('should broadcast task moved events', async () => {
      const taskMovedPromise = new Promise<void>((resolve) => {
        clientSocket.on('task:moved', (data) => {
          expect(data.columnId).toBe('inprogress');
          expect(data.title).toBe('Moved Task');
          resolve();
        });
      });

      socketService.emitTaskMoved('test-project-123', {
        id: 'task-1',
        title: 'Moved Task',
        description: 'A task that was moved',
        columnId: 'inprogress',
        assignedTo: 'Test User',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await taskMovedPromise;
    });

    it('should broadcast task deleted events', async () => {
      const taskDeletedPromise = new Promise<void>((resolve) => {
        clientSocket.on('task:deleted', (data) => {
          expect(data.taskId).toBe('task-1');
          resolve();
        });
      });

      socketService.emitTaskDeleted('test-project-123', 'task-1');

      await taskDeletedPromise;
    });
  });

  describe('Error Handling', () => {
    it('should handle socket errors gracefully', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Simulate a socket error
      clientSocket.emit('error', new Error('Test socket error'));

      // Wait for error to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errorSpy).toHaveBeenCalledWith('Socket error:', expect.anything());
      
      errorSpy.mockRestore();
    });

    it('should handle connection errors during project join', async () => {
      // Mock Project.findByProjectId to throw an error
      const originalFindByProjectId = Project.findByProjectId;
      Project.findByProjectId = vi.fn().mockRejectedValue(new Error('Database error'));

      const errorPromise = new Promise<void>((resolve) => {
        clientSocket.on('error', (data) => {
          expect(data.message).toBe('Failed to join project');
          resolve();
        });
      });

      clientSocket.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'Test User' 
      });

      await errorPromise;

      // Restore original method
      Project.findByProjectId = originalFindByProjectId;
    });
  });

  describe('Utility Methods', () => {
    it('should correctly track connected users', () => {
      expect(socketService.getConnectedUsers()).toHaveLength(1);
      expect(socketService.isUserConnected(clientSocket.id)).toBe(true);
      expect(socketService.isUserConnected('non-existent-id')).toBe(false);
    });

    it('should correctly track users in projects', async () => {
      // Create test project
      const testProject = new Project({
        projectId: 'test-project-123',
        projectName: 'Test Project',
        oneLineIdea: 'A test project',
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

      expect(socketService.getUsersInProject('test-project-123')).toHaveLength(0);

      // Join project
      clientSocket.emit('join-project', { 
        projectId: 'test-project-123', 
        userName: 'Test User' 
      });

      await new Promise<void>((resolve) => {
        clientSocket.on('joined-project', resolve);
      });

      expect(socketService.getUsersInProject('test-project-123')).toHaveLength(1);
      expect(socketService.getUsersInProject('non-existent-project')).toHaveLength(0);
    });
  });
});