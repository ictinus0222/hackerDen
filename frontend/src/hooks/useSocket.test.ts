import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSocket, useSocketEvent, useProjectRealtime, useTaskRealtime, useConnectionStatus } from './useSocket';
import { socketService } from '../services/socket';
import type { ProjectHub, Task, PivotEntry, TeamMember } from '../types';

// Mock the socket service
vi.mock('../services/socket', () => ({
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn(),
    joinProject: vi.fn(),
    leaveProject: vi.fn(),
    getCurrentProjectId: vi.fn(),
    reconnect: vi.fn(),
    getReconnectAttempts: vi.fn(),
    getMaxReconnectAttempts: vi.fn(),
    onConnectionChange: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (socketService.isConnected as any).mockReturnValue(false);
    (socketService.getReconnectAttempts as any).mockReturnValue(0);
    (socketService.getMaxReconnectAttempts as any).mockReturnValue(5);
    (socketService.onConnectionChange as any).mockReturnValue(() => {});
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.connectionStatus).toEqual({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
    });
  });

  it('should auto-connect by default', () => {
    renderHook(() => useSocket());
    expect(socketService.connect).toHaveBeenCalled();
  });

  it('should not auto-connect when disabled', () => {
    renderHook(() => useSocket({ autoConnect: false }));
    expect(socketService.connect).not.toHaveBeenCalled();
  });

  it('should join project when projectId is provided', () => {
    (socketService.isConnected as any).mockReturnValue(true);
    
    renderHook(() => useSocket({ 
      projectId: 'test-project',
      userName: 'Test User'
    }));

    expect(socketService.joinProject).toHaveBeenCalledWith('test-project', 'Test User');
  });

  it('should provide join and leave project functions', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.joinProject('test-project', 'Test User');
    });
    expect(socketService.joinProject).toHaveBeenCalledWith('test-project', 'Test User');

    act(() => {
      result.current.leaveProject();
    });
    expect(socketService.leaveProject).toHaveBeenCalled();
  });

  it('should provide reconnect function', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.reconnect();
    });
    expect(socketService.reconnect).toHaveBeenCalled();
  });

  it('should check if in project correctly', () => {
    (socketService.getCurrentProjectId as any).mockReturnValue('test-project');
    
    const { result } = renderHook(() => useSocket());

    expect(result.current.isInProject('test-project')).toBe(true);
    expect(result.current.isInProject('other-project')).toBe(false);
  });

  it('should update connection status when connection changes', () => {
    let connectionCallback: (connected: boolean) => void;
    (socketService.onConnectionChange as any).mockImplementation((callback: any) => {
      connectionCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSocket());

    // Simulate connection
    act(() => {
      connectionCallback(true);
    });

    expect(result.current.connectionStatus.connected).toBe(true);

    // Simulate disconnection
    act(() => {
      connectionCallback(false);
    });

    expect(result.current.connectionStatus.connected).toBe(false);
  });
});

describe('useSocketEvent', () => {
  it('should register and unregister event listeners', () => {
    const handler = vi.fn();
    
    const { unmount } = renderHook(() => 
      useSocketEvent('project:updated', handler)
    );

    expect(socketService.on).toHaveBeenCalledWith('project:updated', expect.any(Function));

    unmount();

    expect(socketService.off).toHaveBeenCalledWith('project:updated', expect.any(Function));
  });

  it('should call handler with current reference', () => {
    let registeredHandler: Function;
    (socketService.on as any).mockImplementation((event: string, handler: Function) => {
      registeredHandler = handler;
    });

    const handler = vi.fn();
    renderHook(() => useSocketEvent('project:updated', handler));

    const testData = { projectId: 'test' };
    act(() => {
      registeredHandler(testData);
    });

    expect(handler).toHaveBeenCalledWith(testData);
  });
});

describe('useProjectRealtime', () => {
  let registeredHandlers: Map<string, Function>;

  beforeEach(() => {
    registeredHandlers = new Map();
    (socketService.on as any).mockImplementation((event: string, handler: Function) => {
      registeredHandlers.set(event, handler);
    });
  });

  it('should register all project event handlers', () => {
    const onProjectUpdate = vi.fn();
    const onMemberJoined = vi.fn();
    const onMemberLeft = vi.fn();
    const onPivotLogged = vi.fn();

    renderHook(() => 
      useProjectRealtime(
        'test-project',
        onProjectUpdate,
        onMemberJoined,
        onMemberLeft,
        onPivotLogged
      )
    );

    expect(socketService.on).toHaveBeenCalledWith('project:updated', expect.any(Function));
    expect(socketService.on).toHaveBeenCalledWith('member:joined', expect.any(Function));
    expect(socketService.on).toHaveBeenCalledWith('member:left', expect.any(Function));
    expect(socketService.on).toHaveBeenCalledWith('pivot:logged', expect.any(Function));
  });

  it('should call project update handler for matching project', () => {
    const onProjectUpdate = vi.fn();
    
    renderHook(() => 
      useProjectRealtime('test-project', onProjectUpdate)
    );

    const projectData: ProjectHub = {
      projectId: 'test-project',
      projectName: 'Test Project',
      oneLineIdea: 'Test idea',
      teamMembers: [],
      deadlines: {
        hackingEnds: new Date(),
        submissionDeadline: new Date(),
        presentationTime: new Date(),
      },
      judgingCriteria: [],
      pivotLog: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      registeredHandlers.get('project:updated')!(projectData);
    });

    expect(onProjectUpdate).toHaveBeenCalledWith(projectData);
  });

  it('should not call project update handler for different project', () => {
    const onProjectUpdate = vi.fn();
    
    renderHook(() => 
      useProjectRealtime('test-project', onProjectUpdate)
    );

    const projectData: ProjectHub = {
      projectId: 'other-project',
      projectName: 'Other Project',
      oneLineIdea: 'Other idea',
      teamMembers: [],
      deadlines: {
        hackingEnds: new Date(),
        submissionDeadline: new Date(),
        presentationTime: new Date(),
      },
      judgingCriteria: [],
      pivotLog: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      registeredHandlers.get('project:updated')!(projectData);
    });

    expect(onProjectUpdate).not.toHaveBeenCalled();
  });

  it('should call other event handlers regardless of project', () => {
    const onMemberJoined = vi.fn();
    const onMemberLeft = vi.fn();
    const onPivotLogged = vi.fn();

    renderHook(() => 
      useProjectRealtime(
        'test-project',
        undefined,
        onMemberJoined,
        onMemberLeft,
        onPivotLogged
      )
    );

    const member: TeamMember = {
      id: 'member-1',
      name: 'Test Member',
      joinedAt: new Date(),
    };

    const pivot: PivotEntry = {
      id: 'pivot-1',
      description: 'Test pivot',
      reason: 'Test reason',
      timestamp: new Date(),
    };

    act(() => {
      registeredHandlers.get('member:joined')!(member);
      registeredHandlers.get('member:left')!({ memberId: 'member-1' });
      registeredHandlers.get('pivot:logged')!(pivot);
    });

    expect(onMemberJoined).toHaveBeenCalledWith(member);
    expect(onMemberLeft).toHaveBeenCalledWith({ memberId: 'member-1' });
    expect(onPivotLogged).toHaveBeenCalledWith(pivot);
  });
});

describe('useTaskRealtime', () => {
  let registeredHandlers: Map<string, Function>;

  beforeEach(() => {
    registeredHandlers = new Map();
    (socketService.on as any).mockImplementation((event: string, handler: Function) => {
      registeredHandlers.set(event, handler);
    });
  });

  it('should register all task event handlers', () => {
    const onTaskCreated = vi.fn();
    const onTaskUpdated = vi.fn();
    const onTaskMoved = vi.fn();
    const onTaskDeleted = vi.fn();

    renderHook(() => 
      useTaskRealtime(
        'test-project',
        onTaskCreated,
        onTaskUpdated,
        onTaskMoved,
        onTaskDeleted
      )
    );

    expect(socketService.on).toHaveBeenCalledWith('task:created', expect.any(Function));
    expect(socketService.on).toHaveBeenCalledWith('task:updated', expect.any(Function));
    expect(socketService.on).toHaveBeenCalledWith('task:moved', expect.any(Function));
    expect(socketService.on).toHaveBeenCalledWith('task:deleted', expect.any(Function));
  });

  it('should call task handlers for matching project', () => {
    const onTaskCreated = vi.fn();
    const onTaskUpdated = vi.fn();
    const onTaskMoved = vi.fn();
    const onTaskDeleted = vi.fn();

    renderHook(() => 
      useTaskRealtime(
        'test-project',
        onTaskCreated,
        onTaskUpdated,
        onTaskMoved,
        onTaskDeleted
      )
    );

    const task: Task = {
      id: 'task-1',
      projectId: 'test-project',
      title: 'Test Task',
      columnId: 'todo',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      registeredHandlers.get('task:created')!(task);
      registeredHandlers.get('task:updated')!(task);
      registeredHandlers.get('task:moved')!(task);
      registeredHandlers.get('task:deleted')!({ taskId: 'task-1' });
    });

    expect(onTaskCreated).toHaveBeenCalledWith(task);
    expect(onTaskUpdated).toHaveBeenCalledWith(task);
    expect(onTaskMoved).toHaveBeenCalledWith(task);
    expect(onTaskDeleted).toHaveBeenCalledWith({ taskId: 'task-1' });
  });

  it('should not call task handlers for different project', () => {
    const onTaskCreated = vi.fn();

    renderHook(() => 
      useTaskRealtime('test-project', onTaskCreated)
    );

    const task: Task = {
      id: 'task-1',
      projectId: 'other-project',
      title: 'Test Task',
      columnId: 'todo',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      registeredHandlers.get('task:created')!(task);
    });

    expect(onTaskCreated).not.toHaveBeenCalled();
  });
});

describe('useConnectionStatus', () => {
  beforeEach(() => {
    (socketService.getReconnectAttempts as any).mockReturnValue(0);
    (socketService.getMaxReconnectAttempts as any).mockReturnValue(5);
  });

  it('should return connection status with show reconnect button flag', () => {
    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current).toEqual({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });
  });

  it('should show reconnect button when max attempts reached', () => {
    (socketService.getReconnectAttempts as any).mockReturnValue(5);
    
    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current.showReconnectButton).toBe(true);
  });

  it('should not show reconnect button when reconnecting', () => {
    (socketService.getReconnectAttempts as any).mockReturnValue(3);
    
    let connectionCallback: (connected: boolean) => void;
    (socketService.onConnectionChange as any).mockImplementation((callback: any) => {
      connectionCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useConnectionStatus());

    // Simulate disconnection (which would set reconnecting to true)
    act(() => {
      connectionCallback(false);
    });

    expect(result.current.showReconnectButton).toBe(false);
  });
});