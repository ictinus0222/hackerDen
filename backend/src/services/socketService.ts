import { Server, Socket } from 'socket.io';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

export interface SocketUser {
  id: string;
  projectId?: string;
  name?: string;
}

export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('User connected:', socket.id);
      
      // Store user connection
      this.connectedUsers.set(socket.id, { id: socket.id });

      // Handle joining project room
      socket.on('join-project', async (data: { projectId: string; userName?: string }) => {
        try {
          const { projectId, userName } = data;
          
          // Validate project exists
          const project = await Project.findByProjectId(projectId);
          if (!project) {
            socket.emit('error', { message: 'Project not found' });
            return;
          }

          // Leave any previous project room
          const user = this.connectedUsers.get(socket.id);
          if (user?.projectId) {
            socket.leave(`project:${user.projectId}`);
          }

          // Join new project room
          socket.join(`project:${projectId}`);
          
          // Update user info
          this.connectedUsers.set(socket.id, {
            id: socket.id,
            projectId,
            name: userName
          });

          // Notify others in the room
          socket.to(`project:${projectId}`).emit('user-joined', {
            userId: socket.id,
            userName: userName || 'Anonymous'
          });

          // Send confirmation to user
          socket.emit('joined-project', { projectId });
          
          console.log(`User ${socket.id} joined project ${projectId}`);
        } catch (error) {
          console.error('Error joining project:', error);
          socket.emit('error', { message: 'Failed to join project' });
        }
      });

      // Handle leaving project room
      socket.on('leave-project', () => {
        const user = this.connectedUsers.get(socket.id);
        if (user?.projectId) {
          socket.leave(`project:${user.projectId}`);
          socket.to(`project:${user.projectId}`).emit('user-left', {
            userId: socket.id,
            userName: user.name || 'Anonymous'
          });
          
          // Update user info
          this.connectedUsers.set(socket.id, { id: socket.id });
          console.log(`User ${socket.id} left project ${user.projectId}`);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const user = this.connectedUsers.get(socket.id);
        if (user?.projectId) {
          socket.to(`project:${user.projectId}`).emit('user-left', {
            userId: socket.id,
            userName: user.name || 'Anonymous'
          });
        }
        
        this.connectedUsers.delete(socket.id);
        console.log('User disconnected:', socket.id);
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  // Project-related events
  emitProjectUpdate(projectId: string, project: any) {
    this.io.to(`project:${projectId}`).emit('project:updated', project);
  }

  emitMemberJoined(projectId: string, member: any) {
    this.io.to(`project:${projectId}`).emit('member:joined', member);
  }

  emitMemberLeft(projectId: string, memberId: string) {
    this.io.to(`project:${projectId}`).emit('member:left', { memberId });
  }

  emitPivotLogged(projectId: string, pivot: any) {
    this.io.to(`project:${projectId}`).emit('pivot:logged', pivot);
  }

  // Task-related events
  emitTaskCreated(projectId: string, task: any) {
    this.io.to(`project:${projectId}`).emit('task:created', task);
  }

  emitTaskUpdated(projectId: string, task: any) {
    this.io.to(`project:${projectId}`).emit('task:updated', task);
  }

  emitTaskMoved(projectId: string, task: any) {
    this.io.to(`project:${projectId}`).emit('task:moved', task);
  }

  emitTaskDeleted(projectId: string, taskId: string) {
    this.io.to(`project:${projectId}`).emit('task:deleted', { taskId });
  }

  // Submission-related events
  emitSubmissionUpdated(projectId: string, submission: any) {
    this.io.to(`project:${projectId}`).emit('submission:updated', submission);
  }

  // Utility methods
  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getUsersInProject(projectId: string): SocketUser[] {
    return Array.from(this.connectedUsers.values())
      .filter(user => user.projectId === projectId);
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}