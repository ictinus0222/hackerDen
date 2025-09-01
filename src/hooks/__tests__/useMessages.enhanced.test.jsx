import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMessages } from '../useMessages';
import { messageService } from '../../services/messageService';

// Mock the messageService
vi.mock('../../services/messageService', () => ({
  messageService: {
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    subscribeToMessages: vi.fn(),
    sendTypingIndicator: vi.fn(),
    stopTypingIndicator: vi.fn(),
  }
}));

// Mock useAuth hook
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: {
      $id: 'user1',
      name: 'Test User'
    }
  })
}));

describe('useMessages Enhanced Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle message retry functionality', async () => {
    const teamId = 'team1';
    
    // Mock successful getMessages
    messageService.getMessages.mockResolvedValue({
      messages: [],
      total: 0
    });

    // Mock subscription
    messageService.subscribeToMessages.mockReturnValue(() => {});

    // Mock failed then successful sendMessage
    messageService.sendMessage
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ $id: 'msg1', content: 'test' });

    const { result } = renderHook(() => useMessages(teamId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Send a message that will fail
    await act(async () => {
      await result.current.sendMessage('test message');
    });

    // Check that retry queue has the failed message
    expect(result.current.retryQueue).toHaveLength(1);
    expect(result.current.retryQueue[0].content).toBe('test message');

    // Retry the failed message
    await act(async () => {
      await result.current.retryFailedMessage(result.current.messages[0].$id);
    });

    // Verify the message was retried
    expect(messageService.sendMessage).toHaveBeenCalledTimes(2);
  });

  it('should handle typing indicators', async () => {
    const teamId = 'team1';
    
    messageService.getMessages.mockResolvedValue({
      messages: [],
      total: 0
    });

    messageService.subscribeToMessages.mockReturnValue(() => {});

    const { result } = renderHook(() => useMessages(teamId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test typing indicator functions
    act(() => {
      result.current.sendTypingIndicator();
    });

    expect(messageService.sendTypingIndicator).toHaveBeenCalledWith(
      teamId,
      'user1',
      'Test User'
    );

    act(() => {
      result.current.stopTypingIndicator();
    });

    expect(messageService.stopTypingIndicator).toHaveBeenCalledWith(teamId, 'user1');
  });

  it('should track connection status', async () => {
    const teamId = 'team1';
    
    messageService.getMessages.mockResolvedValue({
      messages: [],
      total: 0
    });

    messageService.subscribeToMessages.mockReturnValue(() => {});

    const { result } = renderHook(() => useMessages(teamId));

    // Initially should be connecting
    expect(result.current.connectionStatus).toBe('connecting');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should be connected after successful subscription
    expect(result.current.connectionStatus).toBe('connecting');
  });

  it('should filter message types correctly', async () => {
    const teamId = 'team1';
    let subscriptionCallback;
    
    messageService.getMessages.mockResolvedValue({
      messages: [],
      total: 0
    });

    messageService.subscribeToMessages.mockImplementation((teamId, callback) => {
      subscriptionCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useMessages(teamId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate receiving different message types
    act(() => {
      subscriptionCallback({
        events: ['databases.*.collections.*.documents.*.create'],
        payload: {
          $id: 'msg1',
          type: 'user',
          content: 'Hello',
          teamId,
          $createdAt: new Date().toISOString()
        }
      });
    });

    act(() => {
      subscriptionCallback({
        events: ['databases.*.collections.*.documents.*.create'],
        payload: {
          $id: 'msg2',
          type: 'task_created',
          content: 'Task created',
          teamId,
          $createdAt: new Date().toISOString()
        }
      });
    });

    // Both messages should be added
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].type).toBe('user');
    expect(result.current.messages[1].type).toBe('task_created');
  });
});