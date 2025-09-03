import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, renderHook } from '@testing-library/react';
import { useTasks } from '../../hooks/useTasks';
import { useMessages } from '../../hooks/useMessages';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { realtimeService } from '../../services/realtimeService';

// Mock Appwrite client
vi.mock('../../lib/appwrite', () => {
  const mockClient = {
    subscribe: vi.fn(),
    call: vi.fn()
  };
  
  const mockQuery = {
    equal: vi.fn(),
    orderDesc: vi.fn(),
    orderAsc: vi.fn(),
    limit: vi.fn()
  };
  
  return {
    default: mockClient,
    databases: {
      listDocuments: vi.fn().mockResolvedValue({ documents: [] }),
      createDocument: vi.fn(),
      updateDocument: vi.fn()
    },
    DATABASE_ID: 'test-db',
    COLLECTIONS: {
      TASKS: 'tasks',
      MESSAGES: 'messages'
    },
    Query: mockQuery,
    ID: {
      unique: vi.fn().mockReturnValue('mock-id')
    }
  };
});

// Mock team context
const mockTeam = {
  $id: 'test-team-id',
  name: 'Test Team',
  joinCode: 'ABC123'
};

vi.mock('../../hooks/useTeam', () => ({
  useTeam: () => ({
    team: mockTeam,
    loading: false,
    hasTeam: true
  })
}));

// Mock auth context
const mockUser = {
  $id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com'
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    isAuthenticated: true
  })
}));

describe('Real-time Synchronization Tests', () => {
  let mockUnsubscribe;
  let mockClient;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();
    
    // Get the mocked client
    const appwriteModule = await import('../../lib/appwrite');
    mockClient = appwriteModule.default;
    
    mockClient.subscribe.mockReturnValue(mockUnsubscribe);
    mockClient.call.mockResolvedValue({ status: 'ok' });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Task Real-time Updates', () => {
    it('should sync task creation across clients within 2 seconds', async () => {
      const { result } = renderHook(() => useTasks());
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Get the subscription callback
      expect(mockClient.subscribe).toHaveBeenCalled();
      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Simulate task creation event
      const newTask = {
        $id: 'new-task-id',
        teamId: mockTeam.$id,
        title: 'New Task',
        description: 'Test task',
        status: 'todo',
        assignedTo: mockUser.$id,
        createdBy: mockUser.$id,
        $createdAt: new Date().toISOString()
      };

      const startTime = Date.now();
      
      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.tasks.documents.new-task-id.create'],
          payload: newTask
        });
      });

      const endTime = Date.now();
      const syncTime = endTime - startTime;

      // Verify task was added to state
      expect(result.current.tasks).toContainEqual(newTask);
      
      // Verify sync time is under 2 seconds (should be nearly instantaneous in tests)
      expect(syncTime).toBeLessThan(2000);
      
      // Verify last sync time was updated
      expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    });

    it('should sync task status updates across clients', async () => {
      const { result } = renderHook(() => useTasks());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Add initial task
      const initialTask = {
        $id: 'task-1',
        teamId: mockTeam.$id,
        title: 'Test Task',
        status: 'todo'
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.tasks.documents.task-1.create'],
          payload: initialTask
        });
      });

      // Update task status
      const updatedTask = {
        ...initialTask,
        status: 'done'
      };

      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.tasks.documents.task-1.update'],
          payload: updatedTask
        });
      });

      // Verify task status was updated
      const taskInState = result.current.tasks.find(t => t.$id === 'task-1');
      expect(taskInState.status).toBe('done');
    });

    it('should handle subscription errors with retry logic', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock subscription failure
      mockClient.subscribe.mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.subscriptionError).toContain('Connection issue');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Message Real-time Updates', () => {
    it('should sync new messages across clients within 2 seconds', async () => {
      const { result } = renderHook(() => useMessages());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      const newMessage = {
        $id: 'new-message-id',
        teamId: mockTeam.$id,
        userId: mockUser.$id,
        content: 'Hello team!',
        type: 'user',
        $createdAt: new Date().toISOString()
      };

      const startTime = Date.now();
      
      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.new-message-id.create'],
          payload: newMessage
        });
      });

      const endTime = Date.now();
      const syncTime = endTime - startTime;

      // Verify message was added
      expect(result.current.messages).toContainEqual(
        expect.objectContaining({
          $id: 'new-message-id',
          content: 'Hello team!'
        })
      );
      
      // Verify sync time
      expect(syncTime).toBeLessThan(2000);
      
      // Verify last sync time was updated
      expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    });

    it('should prevent duplicate messages from optimistic updates', async () => {
      const { result } = renderHook(() => useMessages());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Add optimistic message first
      const optimisticMessage = {
        $id: 'temp-123',
        teamId: mockTeam.$id,
        userId: mockUser.$id,
        content: 'Test message',
        type: 'user',
        isOptimistic: true
      };

      // Simulate the real message arriving
      const realMessage = {
        $id: 'real-message-id',
        teamId: mockTeam.$id,
        userId: mockUser.$id,
        content: 'Test message',
        type: 'user',
        $createdAt: new Date().toISOString()
      };

      // Add optimistic message to state manually (simulating sendMessage)
      act(() => {
        result.current.messages.push(optimisticMessage);
      });

      // Simulate real message arriving
      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.messages.documents.real-message-id.create'],
          payload: realMessage
        });
      });

      // Should not have duplicate messages
      const messageCount = result.current.messages.filter(
        msg => msg.content === 'Test message'
      ).length;
      expect(messageCount).toBe(1);
    });
  });

  describe('Connection Status Monitoring', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should detect connection loss and attempt reconnection', async () => {
      // Mock successful connection initially
      mockClient.call.mockResolvedValueOnce({ status: 'ok' });
      
      const { result } = renderHook(() => useConnectionStatus());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate connection failure
      mockClient.call.mockRejectedValueOnce(new Error('Network error'));

      // Trigger connection check
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isReconnecting).toBe(true);
      });
    });

    it('should implement exponential backoff for reconnection attempts', async () => {
      mockClient.call.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useConnectionStatus());

      // First reconnection attempt should be after 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.reconnectAttempts).toBe(1);
      });

      // Second attempt should be after 2 more seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.reconnectAttempts).toBe(2);
      });

      // Third attempt should be after 4 more seconds
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(result.current.reconnectAttempts).toBe(3);
      });
    });

    it('should handle browser online/offline events', async () => {
      const { result } = renderHook(() => useConnectionStatus());

      // Simulate going offline
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.lastDisconnect).toBeInstanceOf(Date);

      // Simulate coming back online
      mockClient.call.mockResolvedValueOnce({ status: 'ok' });
      
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });
  });

  describe('Realtime Service', () => {
    it('should track subscription status', () => {
      const callback = vi.fn();
      
      // Create subscription
      const unsubscribe = realtimeService.subscribeToTasks('team-1', callback);
      
      const status = realtimeService.getSubscriptionStatus();
      expect(status.active).toBe(1);
      expect(status.total).toBe(1);
      
      // Unsubscribe
      unsubscribe();
      
      const statusAfter = realtimeService.getSubscriptionStatus();
      expect(statusAfter.active).toBe(0);
    });

    it('should retry failed subscriptions with exponential backoff', async () => {
      vi.useFakeTimers();
      
      const callback = vi.fn();
      const onError = vi.fn();
      
      // Mock subscription failure
      mockClient.subscribe.mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });

      realtimeService.subscribeToTasks('team-1', callback, { onError });

      // First retry after 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        1
      );

      vi.useRealTimers();
    });
  });

  describe('Multi-tab Synchronization', () => {
    it('should handle concurrent updates from multiple clients', async () => {
      const { result } = renderHook(() => useTasks());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const subscriptionCallback = mockClient.subscribe.mock.calls[0][1];

      // Simulate rapid updates from different clients
      const updates = [
        {
          $id: 'task-1',
          teamId: mockTeam.$id,
          title: 'Task 1',
          status: 'todo'
        },
        {
          $id: 'task-1',
          teamId: mockTeam.$id,
          title: 'Task 1 Updated',
          status: 'in_progress'
        },
        {
          $id: 'task-1',
          teamId: mockTeam.$id,
          title: 'Task 1 Final',
          status: 'done'
        }
      ];

      // Apply updates rapidly
      act(() => {
        subscriptionCallback({
          events: ['databases.test-db.collections.tasks.documents.task-1.create'],
          payload: updates[0]
        });
        
        subscriptionCallback({
          events: ['databases.test-db.collections.tasks.documents.task-1.update'],
          payload: updates[1]
        });
        
        subscriptionCallback({
          events: ['databases.test-db.collections.tasks.documents.task-1.update'],
          payload: updates[2]
        });
      });

      // Should have the final state
      const finalTask = result.current.tasks.find(t => t.$id === 'task-1');
      expect(finalTask.title).toBe('Task 1 Final');
      expect(finalTask.status).toBe('done');
      
      // Should only have one instance of the task
      const taskCount = result.current.tasks.filter(t => t.$id === 'task-1').length;
      expect(taskCount).toBe(1);
    });
  });
});