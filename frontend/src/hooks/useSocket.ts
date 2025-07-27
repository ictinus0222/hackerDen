import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService, type SocketEvents } from '../services/socket';
import type { ProjectHub, Task, PivotEntry, TeamMember } from '../types';

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

export interface UseSocketOptions {
  projectId?: string;
  userName?: string;
  autoConnect?: boolean;
}

export interface UseSocketReturn {
  connectionStatus: ConnectionStatus;
  joinProject: (projectId: string, userName?: string) => void;
  leaveProject: () => void;
  reconnect: () => void;
  isInProject: (projectId: string) => boolean;
}

// Main socket hook
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { projectId, userName, autoConnect = true } = options;
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: socketService.isConnected(),
    reconnecting: false,
    reconnectAttempts: socketService.getReconnectAttempts(),
    maxReconnectAttempts: socketService.getMaxReconnectAttempts(),
  });

  const reconnectTimeoutRef = useRef<number | null>(null);

  // Update connection status
  const updateConnectionStatus = useCallback((connected: boolean) => {
    setConnectionStatus(prev => ({
      ...prev,
      connected,
      reconnecting: !connected && prev.reconnectAttempts < prev.maxReconnectAttempts,
      reconnectAttempts: socketService.getReconnectAttempts(),
    }));
  }, []);

  // Join project
  const joinProject = useCallback((projectId: string, userName?: string) => {
    socketService.joinProject(projectId, userName);
  }, []);

  // Leave project
  const leaveProject = useCallback(() => {
    socketService.leaveProject();
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    setConnectionStatus(prev => ({ ...prev, reconnecting: true }));
    socketService.reconnect();
  }, []);

  // Check if currently in project
  const isInProject = useCallback((projectId: string) => {
    return socketService.getCurrentProjectId() === projectId;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      socketService.connect();
    }

    // Listen for connection changes
    const unsubscribe = socketService.onConnectionChange(updateConnectionStatus);

    // Auto-join project if provided
    if (projectId && socketService.isConnected()) {
      joinProject(projectId, userName);
    }

    return () => {
      unsubscribe();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [projectId, userName, autoConnect, joinProject, updateConnectionStatus]);

  return {
    connectionStatus,
    joinProject,
    leaveProject,
    reconnect,
    isInProject,
  };
}

// Hook for listening to specific socket events
export function useSocketEvent<K extends keyof SocketEvents>(
  event: K,
  handler: SocketEvents[K],
  deps: React.DependencyList = []
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrappedHandler = (...args: any[]) => {
      (handlerRef.current as any)(...args);
    };

    socketService.on(event, wrappedHandler);

    return () => {
      socketService.off(event, wrappedHandler);
    };
  }, [event, ...deps]);
}

// Hook for real-time project updates
export function useProjectRealtime(
  projectId: string | undefined,
  onProjectUpdate?: (project: ProjectHub) => void,
  onMemberJoined?: (member: TeamMember) => void,
  onMemberLeft?: (data: { memberId: string }) => void,
  onPivotLogged?: (pivot: PivotEntry) => void
): void {
  useSocketEvent('project:updated', (project: ProjectHub) => {
    if (project.projectId === projectId && onProjectUpdate) {
      onProjectUpdate(project);
    }
  }, [projectId, onProjectUpdate]);

  useSocketEvent('member:joined', (member: TeamMember) => {
    if (onMemberJoined) {
      onMemberJoined(member);
    }
  }, [onMemberJoined]);

  useSocketEvent('member:left', (data: { memberId: string }) => {
    if (onMemberLeft) {
      onMemberLeft(data);
    }
  }, [onMemberLeft]);

  useSocketEvent('pivot:logged', (pivot: PivotEntry) => {
    if (onPivotLogged) {
      onPivotLogged(pivot);
    }
  }, [onPivotLogged]);
}

// Hook for real-time task updates
export function useTaskRealtime(
  projectId: string | undefined,
  onTaskCreated?: (task: Task) => void,
  onTaskUpdated?: (task: Task) => void,
  onTaskMoved?: (task: Task) => void,
  onTaskDeleted?: (data: { taskId: string }) => void
): void {
  useSocketEvent('task:created', (task: Task) => {
    if ((task as any).projectId === projectId && onTaskCreated) {
      onTaskCreated(task);
    }
  }, [projectId, onTaskCreated]);

  useSocketEvent('task:updated', (task: Task) => {
    if ((task as any).projectId === projectId && onTaskUpdated) {
      onTaskUpdated(task);
    }
  }, [projectId, onTaskUpdated]);

  useSocketEvent('task:moved', (task: Task) => {
    if ((task as any).projectId === projectId && onTaskMoved) {
      onTaskMoved(task);
    }
  }, [projectId, onTaskMoved]);

  useSocketEvent('task:deleted', (data: { taskId: string }) => {
    if (onTaskDeleted) {
      onTaskDeleted(data);
    }
  }, [onTaskDeleted]);
}

// Hook for connection status indicator
export function useConnectionStatus(): ConnectionStatus & {
  showReconnectButton: boolean;
} {
  const { connectionStatus, reconnect } = useSocket({ autoConnect: false });
  
  const showReconnectButton = !connectionStatus.connected && 
    !connectionStatus.reconnecting && 
    connectionStatus.reconnectAttempts >= connectionStatus.maxReconnectAttempts;

  return {
    ...connectionStatus,
    showReconnectButton,
  };
}