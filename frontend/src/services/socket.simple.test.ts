import { describe, it, expect, vi, beforeEach } from 'vitest';
import { socketService } from './socket';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    id: 'test-socket-id',
    connected: true,
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

describe('Socket Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined and have required methods', () => {
    expect(socketService).toBeDefined();
    expect(typeof socketService.connect).toBe('function');
    expect(typeof socketService.disconnect).toBe('function');
    expect(typeof socketService.joinProject).toBe('function');
    expect(typeof socketService.leaveProject).toBe('function');
    expect(typeof socketService.on).toBe('function');
    expect(typeof socketService.off).toBe('function');
    expect(typeof socketService.isConnected).toBe('function');
  });

  it('should handle project joining', () => {
    expect(() => {
      socketService.joinProject('test-project', 'Test User');
    }).not.toThrow();
    
    expect(socketService.getCurrentProjectId()).toBe('test-project');
  });

  it('should handle project leaving', () => {
    socketService.joinProject('test-project', 'Test User');
    socketService.leaveProject();
    
    expect(socketService.getCurrentProjectId()).toBe(null);
  });

  it('should handle event listeners', () => {
    const listener = vi.fn();
    
    expect(() => {
      socketService.on('project:updated', listener);
      socketService.off('project:updated', listener);
    }).not.toThrow();
  });

  it('should handle connection status listeners', () => {
    const listener = vi.fn();
    
    expect(() => {
      const unsubscribe = socketService.onConnectionChange(listener);
      unsubscribe();
    }).not.toThrow();
  });
});