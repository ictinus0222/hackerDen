import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(),
}));

describe('SocketService Reconnection Edge Cases', () => {
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

  describe('Connection Failure Scenarios', () => {
    it('handles immediate connection failure', () => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];

      expect(errorHandler).toBeDefined();

      // Simulate immediate connection error
      errorHandler(new Error('Connection refused'));

      expect(socketService.getReconnectAttempts()).toBe(1);
      expect(socketService.isConnected()).toBe(false);
    });

    it('handles network timeout during connection', () => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];

      // Simulate timeout error
      errorHandler(new Error('timeout'));

      expect(socketService.getReconnectAttempts()).toBe(1);
    });

    it('handles DNS resolution failure', () => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];

      // Simulate DNS error
      errorHandler(new Error('getaddrinfo ENOTFOUND'));

      expect(socketService.getReconnectAttempts()).toBe(1);
    });

    it('handles server unavailable error', () => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];

      // Simulate server unavailable
      errorHandler(new Error('ECONNREFUSED'));

      expect(socketService.getReconnectAttempts()).toBe(1);
    });
  });

  describe('Reconnection Attempts', () => {
    it('tracks multiple reconnection attempts', () => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];

      // Simulate multiple connection errors
      for (let i = 1; i <= 3; i++) {
        errorHandler(new Error(`Connection attempt ${i} failed`));
        expect(socketService.getReconnectAttempts()).toBe(i);
      }
    });

    it('stops reconnecting after max attempts', () => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];

      const connectionListener = vi.fn();
      socketService.onConnectionChange(connectionListener);

      // Simulate max reconnection attempts
      for (let i = 1; i <= 5; i++) {
        errorHandler(new Error(`Connection attempt ${i} failed`));
      }

      expect(socketService.getReconnectAttempts()).toBe(5);
      expect(connectionListener).toHaveBeenCalledWith(false);
    });

    it('resets reconnection attempts on successful connection', () => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];

      // Simulate failed attempts
      errorHandler(new Error('Connection failed'));
      errorHandler(new Error('Connection failed'));
      expect(socketService.getReconnectAttempts()).toBe(2);

      // Simulate successful connection
      mockSocket.connected = true;
      connectHandler();

      expect(socketService.getReconnectAttempts()).toBe(0);
    });
  });

  describe('Connection State Management', () => {
    it('handles rapid connect/disconnect cycles', () => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )?.[1];

      const connectionListener = vi.fn();
      socketService.onConnectionChange(connectionListener);

      // Simulate rapid connect/disconnect
      mockSocket.connected = true;
      connectHandler();
      expect(connectionListener).toHaveBeenCalledWith(true);

      mockSocket.connected = false;
      disconnectHandler('transport close');
      expect(connectionListener).toHaveBeenCalledWith(false);

      mockSocket.connected = true;
      connectHandler();
      expect(connectionListener).toHaveBeenCalledWith(true);

      expect(connectionListener).toHaveBeenCalledTimes(3);
    });

    it('handles connection state during page visibility changes', () => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )?.[1];

      // Simulate page becoming hidden (mobile background)
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      });

      // Connection should still work when page is hidden
      mockSocket.connected = true;
      connectHandler();
      expect(socketService.isConnected()).toBe(true);

      // Simulate page becoming visible again
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      });

      // Should maintain connection state
      expect(socketService.isConnected()).toBe(true);
    });
  });

  describe('Project Rejoin Logic', () => {
    it('rejoins project after reconnection', () => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];

      // Join a project initially
      socketService.joinProject('test-project', 'test-user');
      expect(mockSocket.emit).toHaveBeenCalledWith('join-project', {
        projectId: 'test-project',
        userName: 'test-user',
      });

      // Clear previous calls
      mockSocket.emit.mockClear();

      // Simulate reconnection
      mockSocket.connected = true;
      connectHandler();

      // Should automatically rejoin the project
      expect(mockSocket.emit).toHaveBeenCalledWith('join-project', {
        projectId: 'test-project',
        userName: 'test-user',
      });
    });

    it('does not rejoin if no project was active', () => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];

      // Simulate reconnection without previous project
      mockSocket.connected = true;
      connectHandler();

      // Should not emit join-project
      expect(mockSocket.emit).not.toHaveBeenCalledWith('join-project', expect.anything());
    });

    it('handles rejoin failure gracefully', () => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'error'
      )?.[1];

      // Join a project initially
      socketService.joinProject('test-project', 'test-user');

      // Simulate reconnection
      mockSocket.connected = true;
      connectHandler();

      // Simulate rejoin error
      errorHandler({ message: 'Project not found' });

      // Should handle error gracefully
      expect(socketService.getCurrentProjectId()).toBe('test-project');
    });
  });

  describe('Event Listener Resilience', () => {
    it('handles listener errors during reconnection', () => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];

      // Add a listener that throws an error
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      socketService.onConnectionChange(errorListener);

      // Add a normal listener
      const normalListener = vi.fn();
      socketService.onConnectionChange(normalListener);

      // Simulate connection - should not crash
      mockSocket.connected = true;
      expect(() => connectHandler()).not.toThrow();

      // Normal listener should still be called
      expect(normalListener).toHaveBeenCalledWith(true);
      expect(errorListener).toHaveBeenCalledWith(true);
    });

    it('maintains event listeners across reconnections', () => {
      const projectUpdateListener = vi.fn();
      const taskCreatedListener = vi.fn();

      socketService.on('project:updated', projectUpdateListener);
      socketService.on('task:created', taskCreatedListener);

      // Simulate reconnection
      socketService.reconnect();

      // Listeners should still be registered
      const projectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'project:updated'
      )?.[1];
      const taskHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'task:created'
      )?.[1];

      expect(projectHandler).toBeDefined();
      expect(taskHandler).toBeDefined();

      // Test that listeners are called
      projectHandler({ projectId: 'test' });
      taskHandler({ id: 'task1' });

      expect(projectUpdateListener).toHaveBeenCalledWith({ projectId: 'test' });
      expect(taskCreatedListener).toHaveBeenCalledWith({ id: 'task1' });
    });
  });

  describe('Memory Management', () => {
    it('cleans up listeners on disconnect', () => {
      const connectionListener = vi.fn();
      const cleanup = socketService.onConnectionChange(connectionListener);

      // Verify listener is added
      expect(socketService.connectionListeners?.size).toBeGreaterThan(0);

      // Clean up listener
      cleanup();

      // Verify listener is removed
      expect(socketService.connectionListeners?.has(connectionListener)).toBe(false);
    });

    it('prevents memory leaks with multiple reconnections', () => {
      const initialCallCount = mockSocket.on.mock.calls.length;

      // Perform multiple reconnections
      for (let i = 0; i < 5; i++) {
        socketService.reconnect();
      }

      // Should not accumulate event listeners
      const finalCallCount = mockSocket.on.mock.calls.length;
      expect(finalCallCount).toBeGreaterThan(initialCallCount);
      // But should not grow exponentially
      expect(finalCallCount).toBeLessThan(initialCallCount * 5);
    });
  });

  describe('Network Quality Adaptation', () => {
    it('handles slow network conditions', () => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];

      // Simulate slow network timeout
      errorHandler(new Error('timeout'));

      expect(socketService.getReconnectAttempts()).toBe(1);
    });

    it('handles intermittent connectivity', () => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )?.[1];

      const connectionListener = vi.fn();
      socketService.onConnectionChange(connectionListener);

      // Simulate intermittent connectivity
      mockSocket.connected = true;
      connectHandler();
      expect(connectionListener).toHaveBeenCalledWith(true);

      mockSocket.connected = false;
      disconnectHandler('ping timeout');
      expect(connectionListener).toHaveBeenCalledWith(false);

      mockSocket.connected = true;
      connectHandler();
      expect(connectionListener).toHaveBeenCalledWith(true);

      // Should handle multiple state changes
      expect(connectionListener).toHaveBeenCalledTimes(3);
    });
  });
});