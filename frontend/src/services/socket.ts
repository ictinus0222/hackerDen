import { io, Socket } from 'socket.io-client';
import type { ProjectHub, Task, PivotEntry, TeamMember } from '../types';

// Socket.io client configuration
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export interface SocketEvents {
  // Connection events
  'joined-project': (data: { projectId: string }) => void;
  'user-joined': (data: { userId: string; userName: string }) => void;
  'user-left': (data: { userId: string; userName: string }) => void;
  'error': (data: { message: string }) => void;

  // Project events
  'project:updated': (project: ProjectHub) => void;
  'member:joined': (member: TeamMember) => void;
  'member:left': (data: { memberId: string }) => void;
  'pivot:logged': (pivot: PivotEntry) => void;

  // Task events
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'task:moved': (task: Task) => void;
  'task:deleted': (data: { taskId: string }) => void;
}

export interface SocketEmitEvents {
  'join-project': (data: { projectId: string; userName?: string }) => void;
  'leave-project': () => void;
}

export class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentProjectId: string | null = null;
  private userName: string | null = null;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private eventListeners: Map<keyof SocketEvents, Set<Function>> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);

      // Rejoin project if we were in one
      if (this.currentProjectId) {
        this.joinProject(this.currentProjectId, this.userName || undefined);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.notifyConnectionListeners(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.notifyConnectionListeners(false);
      }
    });

    // Project and task events
    const eventTypes: (keyof SocketEvents)[] = [
      'joined-project',
      'user-joined',
      'user-left',
      'error',
      'project:updated',
      'member:joined',
      'member:left',
      'pivot:logged',
      'task:created',
      'task:updated',
      'task:moved',
      'task:deleted',
    ];

    eventTypes.forEach(eventType => {
      this.socket!.on(eventType, (data: any) => {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
          listeners.forEach(listener => {
            try {
              listener(data);
            } catch (error) {
              console.error(`Error in ${eventType} listener:`, error);
            }
          });
        }
      });
    });
  }

  // Connection management
  connect(): void {
    if (!this.socket || !this.socket.connected) {
      this.initializeSocket();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentProjectId = null;
    this.userName = null;
    this.notifyConnectionListeners(false);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Project management
  joinProject(projectId: string, userName?: string): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.currentProjectId = projectId;
    this.userName = userName || null;

    this.socket.emit('join-project', { projectId, userName });
  }

  leaveProject(): void {
    if (!this.socket) return;

    this.socket.emit('leave-project');
    this.currentProjectId = null;
    this.userName = null;
  }

  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  // Event listeners
  on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // Connection status listeners
  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  // Utility methods
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getMaxReconnectAttempts(): number {
    return this.maxReconnectAttempts;
  }

  // Manual reconnection
  reconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.reconnectAttempts = 0;
    this.initializeSocket();
  }
}

// Singleton instance
export const socketService = new SocketService();