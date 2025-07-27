import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(),
}));

describe('SocketService', () => {
  let mockSocket: any;
  let SocketService: any;
  let socketService: any;

  beforeEach(async () => {
    // Create mock socket
    mockSocket = {
      id: 'test-socket-id',
      connected: false,
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };

    // Mock io function
    (io as any).mockReturnValue(mockSocket);

    // Import SocketService after mocking
    const module = await import('./socket');
    SocketService = module.SocketService;
    socketService = new SocketService();
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (socketService) {
      socketService.disconnect();
    }
  });

  describe('initialization', () => {
    it('should initialize socket with correct configuration', () => {
      expect(io).toHaveBeenCalledWith('http://localhost:3000', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
    });

    it('should set up event handlers', () => {
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    });
  });

  describe('connection management', () => {
    it('should report connection status correctly', () => {
      mockSocket.connected = false;
      expect(socketService.isConnected()).toBe(false);

      mockSocket.connected = true;
      expect(socketService.isConnected()).toBe(true);
    });

    it('should handle connection events', () => {
      const connectionListener = vi.fn();
      socketService.onConnectionChange(connectionListener);

      // Simulate connect event
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )[1];
      connectHandler();

      expect(connectionListener).toHaveBeenCalledWith(true);
    });

    it('should handle disconnect events', () => {
      const connectionListener = vi.fn();
      socketService.onConnectionChange(connectionListener);

      // Simulate disconnect event
      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )[1];
      disconnectHandler('transport close');

      expect(connectionListener).toHaveBeenCalledWith(false);
    });

    it('should handle connection errors', () => {
      const connectionListener = vi.fn();
      socketService.onConnectionChange(connectionListener);

      // Simulate multiple connection errors
      const errorHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect_error'
      )[1];
      
      // First 4 errors should not trigger final failure
      for (let i = 0; i < 4; i++) {
        errorHandler(new Error('Connection failed'));
        expect(connectionListener).not.toHaveBeenCalledWith(false);
      }

      // 5th error should trigger final failure
      errorHandler(new Error('Connection failed'));
      expect(connectionListener).toHaveBeenCalledWith(false);
    });
  });

  describe('project management', () => {
    it('should join project room', () => {
      const projectId = 'test-project-id';
      const userName = 'Test User';

      socketService.joinProject(projectId, userName);

      expect(mockSocket.emit).toHaveBeenCalledWith('join-project', {
        projectId,
        userName,
      });
      expect(socketService.getCurrentProjectId()).toBe(projectId);
    });

    it('should leave project room', () => {
      // First join a project
      socketService.joinProject('test-project-id', 'Test User');
      
      // Then leave
      socketService.leaveProject();

      expect(mockSocket.emit).toHaveBeenCalledWith('leave-project');
      expect(socketService.getCurrentProjectId()).toBe(null);
    });

    it('should rejoin project on reconnection', () => {
      const projectId = 'test-project-id';
      const userName = 'Test User';

      // Join project
      socketService.joinProject(projectId, userName);
      expect(mockSocket.emit).toHaveBeenCalledWith('join-project', {
        projectId,
        userName,
      });

      // Clear previous calls
      mockSocket.emit.mockClear();

      // Simulate reconnection
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )[1];
      connectHandler();

      // Should rejoin project
      expect(mockSocket.emit).toHaveBeenCalledWith('join-project', {
        projectId,
        userName,
      });
    });
  });

  describe('event listeners', () => {
    it('should register and call event listeners', () => {
      const projectUpdateListener = vi.fn();
      const taskCreatedListener = vi.fn();

      socketService.on('project:updated', projectUpdateListener);
      socketService.on('task:created', taskCreatedListener);

      // Simulate receiving events
      const projectUpdateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'project:updated'
      )[1];
      const taskCreatedHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'task:created'
      )[1];

      const projectData = { projectId: 'test', projectName: 'Test Project' };
      const taskData = { id: 'task-1', title: 'Test Task' };

      projectUpdateHandler(projectData);
      taskCreatedHandler(taskData);

      expect(projectUpdateListener).toHaveBeenCalledWith(projectData);
      expect(taskCreatedListener).toHaveBeenCalledWith(taskData);
    });

    it('should remove event listeners', () => {
      const listener = vi.fn();
      
      socketService.on('project:updated', listener);
      socketService.off('project:updated', listener);

      // Simulate event
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'project:updated'
      )[1];
      handler({ projectId: 'test' });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const faultyListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();

      socketService.on('project:updated', faultyListener);
      socketService.on('project:updated', goodListener);

      // Simulate event
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'project:updated'
      )[1];
      
      // Should not throw and should call good listener
      expect(() => handler({ projectId: 'test' })).not.toThrow();
      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('connection status listeners', () => {
    it('should notify connection listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = socketService.onConnectionChange(listener1);
      const unsubscribe2 = socketService.onConnectionChange(listener2);

      // Simulate connection
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )[1];
      connectHandler();

      expect(listener1).toHaveBeenCalledWith(true);
      expect(listener2).toHaveBeenCalledWith(true);

      // Unsubscribe one listener
      unsubscribe1();

      // Simulate disconnection
      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )[1];
      disconnectHandler('transport close');

      expect(listener1).toHaveBeenCalledTimes(1); // Should not be called again
      expect(listener2).toHaveBeenCalledWith(false);
    });

    it('should handle connection listener errors gracefully', () => {
      const faultyListener = vi.fn(() => {
        throw new Error('Listener error');
      });

      socketService.onConnectionChange(faultyListener);

      // Should not throw
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )[1];
      expect(() => connectHandler()).not.toThrow();
    });
  });

  describe('reconnection', () => {
    it('should track reconnection attempts', () => {
      expect(socketService.getReconnectAttempts()).toBe(0);
      expect(socketService.getMaxReconnectAttempts()).toBe(5);

      // Simulate connection errors
      const errorHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect_error'
      )[1];
      
      errorHandler(new Error('Connection failed'));
      expect(socketService.getReconnectAttempts()).toBe(1);

      errorHandler(new Error('Connection failed'));
      expect(socketService.getReconnectAttempts()).toBe(2);
    });

    it('should reset reconnection attempts on successful connection', () => {
      // Simulate connection errors
      const errorHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect_error'
      )[1];
      errorHandler(new Error('Connection failed'));
      errorHandler(new Error('Connection failed'));
      
      expect(socketService.getReconnectAttempts()).toBe(2);

      // Simulate successful connection
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )[1];
      connectHandler();

      expect(socketService.getReconnectAttempts()).toBe(0);
    });

    it('should allow manual reconnection', () => {
      socketService.reconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(io).toHaveBeenCalledTimes(2); // Initial + reconnect
    });
  });

  describe('cleanup', () => {
    it('should disconnect and clean up on disconnect call', () => {
      socketService.joinProject('test-project', 'Test User');
      
      socketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(socketService.getCurrentProjectId()).toBe(null);
      expect(socketService.isConnected()).toBe(false);
    });
  });
});