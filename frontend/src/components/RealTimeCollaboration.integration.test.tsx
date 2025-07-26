import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectHubContainer } from './ProjectHubContainer';
import { TaskBoard } from './TaskBoard';
import { socketService } from '../services/socket';
import { projectApi, taskApi } from '../services/api';
import type { ProjectHub, Task, TeamMember, PivotEntry } from '../types';

// Mock the APIs
vi.mock('../services/api', () => ({
  projectApi: {
    getById: vi.fn(),
    update: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  },
  taskApi: {
    getByProject: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  pivotApi: {
    getByProject: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock socket service
vi.mock('../services/socket', () => ({
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn(() => true),
    joinProject: vi.fn(),
    leaveProject: vi.fn(),
    getCurrentProjectId: vi.fn(),
    reconnect: vi.fn(),
    getReconnectAttempts: vi.fn(() => 0),
    getMaxReconnectAttempts: vi.fn(() => 5),
    onConnectionChange: vi.fn(() => () => {}),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe('Real-time Collaboration Integration', () => {
  let mockProject: ProjectHub;
  let mockTasks: Task[];
  let socketEventHandlers: Map<string, Function>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    socketEventHandlers = new Map();
    (socketService.on as any).mockImplementation((event: string, handler: Function) => {
      socketEventHandlers.set(event, handler);
    });

    mockProject = {
      projectId: 'test-project-123',
      projectName: 'Test Project',
      oneLineIdea: 'A test project for collaboration',
      teamMembers: [
        {
          id: 'member-1',
          name: 'Alice',
          role: 'Developer',
          joinedAt: new Date('2024-01-01'),
        },
        {
          id: 'member-2',
          name: 'Bob',
          role: 'Designer',
          joinedAt: new Date('2024-01-01'),
        },
      ],
      deadlines: {
        hackingEnds: new Date('2024-12-31T23:59:59Z'),
        submissionDeadline: new Date('2024-12-31T23:59:59Z'),
        presentationTime: new Date('2025-01-01T10:00:00Z'),
      },
      judgingCriteria: [
        {
          id: 'criteria-1',
          name: 'Innovation',
          description: 'How innovative is the solution?',
          completed: false,
        },
      ],
      pivotLog: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    mockTasks = [
      {
        id: 'task-1',
        projectId: 'test-project-123',
        title: 'Setup project structure',
        description: 'Initialize the project',
        assignedTo: 'Alice',
        columnId: 'todo',
        order: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'task-2',
        projectId: 'test-project-123',
        title: 'Design UI mockups',
        description: 'Create initial designs',
        assignedTo: 'Bob',
        columnId: 'inprogress',
        order: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    (projectApi.getById as any).mockResolvedValue(mockProject);
    (taskApi.getByProject as any).mockResolvedValue(mockTasks);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ProjectHub Real-time Updates', () => {
    it('should update project information in real-time', async () => {
      render(
        <ProjectHubContainer 
          projectId="test-project-123" 
          userName="Alice"
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
      });

      // Simulate real-time project update
      const updatedProject = {
        ...mockProject,
        projectName: 'Updated Test Project',
        oneLineIdea: 'An updated test project',
      };

      const projectUpdateHandler = socketEventHandlers.get('project:updated');
      expect(projectUpdateHandler).toBeDefined();

      // Trigger real-time update
      projectUpdateHandler!(updatedProject);

      // Verify UI updates
      await waitFor(() => {
        expect(screen.getByDisplayValue('Updated Test Project')).toBeInTheDocument();
        expect(screen.getByDisplayValue('An updated test project')).toBeInTheDocument();
      });
    });

    it('should add new team members in real-time', async () => {
      render(
        <ProjectHubContainer 
          projectId="test-project-123" 
          userName="Alice"
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });

      // Simulate new member joining
      const newMember: TeamMember = {
        id: 'member-3',
        name: 'Charlie',
        role: 'Tester',
        joinedAt: new Date(),
      };

      const memberJoinedHandler = socketEventHandlers.get('member:joined');
      expect(memberJoinedHandler).toBeDefined();

      // Trigger real-time update
      memberJoinedHandler!(newMember);

      // Verify new member appears
      await waitFor(() => {
        expect(screen.getByText('Charlie')).toBeInTheDocument();
      });
    });

    it('should remove team members in real-time', async () => {
      render(
        <ProjectHubContainer 
          projectId="test-project-123" 
          userName="Alice"
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });

      // Simulate member leaving
      const memberLeftHandler = socketEventHandlers.get('member:left');
      expect(memberLeftHandler).toBeDefined();

      // Trigger real-time update
      memberLeftHandler!({ memberId: 'member-2' });

      // Verify member is removed
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      });
    });

    it('should add pivot entries in real-time', async () => {
      render(
        <ProjectHubContainer 
          projectId="test-project-123" 
          userName="Alice"
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      // Simulate new pivot being logged
      const newPivot: PivotEntry = {
        id: 'pivot-1',
        description: 'Changed from web app to mobile app',
        reason: 'Better market fit for mobile',
        timestamp: new Date(),
      };

      const pivotLoggedHandler = socketEventHandlers.get('pivot:logged');
      expect(pivotLoggedHandler).toBeDefined();

      // Trigger real-time update
      pivotLoggedHandler!(newPivot);

      // Verify pivot appears in the log
      await waitFor(() => {
        expect(screen.getByText('Changed from web app to mobile app')).toBeInTheDocument();
        expect(screen.getByText('Better market fit for mobile')).toBeInTheDocument();
      });
    });
  });

  describe('TaskBoard Real-time Updates', () => {
    it('should add new tasks in real-time', async () => {
      render(
        <TaskBoard 
          projectId="test-project-123" 
          teamMembers={mockProject.teamMembers}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Setup project structure')).toBeInTheDocument();
        expect(screen.getByText('Design UI mockups')).toBeInTheDocument();
      });

      // Simulate new task being created
      const newTask: Task = {
        id: 'task-3',
        projectId: 'test-project-123',
        title: 'Write tests',
        description: 'Add unit tests',
        assignedTo: 'Alice',
        columnId: 'todo',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const taskCreatedHandler = socketEventHandlers.get('task:created');
      expect(taskCreatedHandler).toBeDefined();

      // Trigger real-time update
      taskCreatedHandler!(newTask);

      // Verify new task appears
      await waitFor(() => {
        expect(screen.getByText('Write tests')).toBeInTheDocument();
      });
    });

    it('should update existing tasks in real-time', async () => {
      render(
        <TaskBoard 
          projectId="test-project-123" 
          teamMembers={mockProject.teamMembers}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Setup project structure')).toBeInTheDocument();
      });

      // Simulate task being updated
      const updatedTask: Task = {
        ...mockTasks[0],
        title: 'Setup project structure - UPDATED',
        description: 'Initialize the project with new requirements',
      };

      const taskUpdatedHandler = socketEventHandlers.get('task:updated');
      expect(taskUpdatedHandler).toBeDefined();

      // Trigger real-time update
      taskUpdatedHandler!(updatedTask);

      // Verify task is updated
      await waitFor(() => {
        expect(screen.getByText('Setup project structure - UPDATED')).toBeInTheDocument();
        expect(screen.queryByText('Setup project structure')).not.toBeInTheDocument();
      });
    });

    it('should move tasks between columns in real-time', async () => {
      render(
        <TaskBoard 
          projectId="test-project-123" 
          teamMembers={mockProject.teamMembers}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Setup project structure')).toBeInTheDocument();
      });

      // Simulate task being moved
      const movedTask: Task = {
        ...mockTasks[0],
        columnId: 'inprogress',
      };

      const taskMovedHandler = socketEventHandlers.get('task:moved');
      expect(taskMovedHandler).toBeDefined();

      // Trigger real-time update
      taskMovedHandler!(movedTask);

      // Verify task moved to correct column
      await waitFor(() => {
        const inProgressColumn = screen.getByText('In Progress').closest('.task-column');
        expect(inProgressColumn).toContainElement(screen.getByText('Setup project structure'));
      });
    });

    it('should remove deleted tasks in real-time', async () => {
      render(
        <TaskBoard 
          projectId="test-project-123" 
          teamMembers={mockProject.teamMembers}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Setup project structure')).toBeInTheDocument();
        expect(screen.getByText('Design UI mockups')).toBeInTheDocument();
      });

      // Simulate task being deleted
      const taskDeletedHandler = socketEventHandlers.get('task:deleted');
      expect(taskDeletedHandler).toBeDefined();

      // Trigger real-time update
      taskDeletedHandler!({ taskId: 'task-1' });

      // Verify task is removed
      await waitFor(() => {
        expect(screen.queryByText('Setup project structure')).not.toBeInTheDocument();
        expect(screen.getByText('Design UI mockups')).toBeInTheDocument(); // Other task should remain
      });
    });

    it('should not duplicate tasks when receiving create events for existing tasks', async () => {
      render(
        <TaskBoard 
          projectId="test-project-123" 
          teamMembers={mockProject.teamMembers}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Setup project structure')).toBeInTheDocument();
      });

      // Simulate receiving create event for existing task
      const taskCreatedHandler = socketEventHandlers.get('task:created');
      expect(taskCreatedHandler).toBeDefined();

      // Trigger real-time update with existing task
      taskCreatedHandler!(mockTasks[0]);

      // Verify no duplicate appears
      await waitFor(() => {
        const taskElements = screen.getAllByText('Setup project structure');
        expect(taskElements).toHaveLength(1);
      });
    });
  });

  describe('Connection Status Integration', () => {
    it('should show connection status in both components', async () => {
      // Mock connected state
      (socketService.isConnected as any).mockReturnValue(true);
      
      let connectionChangeCallback: (connected: boolean) => void;
      (socketService.onConnectionChange as any).mockImplementation((callback: any) => {
        connectionChangeCallback = callback;
        return () => {};
      });

      render(
        <div>
          <ProjectHubContainer 
            projectId="test-project-123" 
            userName="Alice"
          />
          <TaskBoard 
            projectId="test-project-123" 
            teamMembers={mockProject.teamMembers}
          />
        </div>
      );

      // Wait for components to load
      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      // Simulate connection
      connectionChangeCallback!(true);

      // Verify connection status indicators are present
      await waitFor(() => {
        const connectionStatuses = screen.getAllByText('Connected');
        expect(connectionStatuses.length).toBeGreaterThan(0);
      });
    });

    it('should handle socket connection and disconnection', async () => {
      let connectionChangeCallback: (connected: boolean) => void;
      (socketService.onConnectionChange as any).mockImplementation((callback: any) => {
        connectionChangeCallback = callback;
        return () => {};
      });

      render(
        <ProjectHubContainer 
          projectId="test-project-123" 
          userName="Alice"
        />
      );

      // Wait for initial load (should show disconnected initially)
      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });

      // Simulate connection
      (socketService.isConnected as any).mockReturnValue(true);
      connectionChangeCallback!(true);

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });

      // Simulate disconnection
      (socketService.isConnected as any).mockReturnValue(false);
      connectionChangeCallback!(false);

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });
    });
  });

  describe('Socket Room Management', () => {
    it('should join project room when connected and project is loaded', async () => {
      // Mock connected state
      (socketService.isConnected as any).mockReturnValue(true);
      
      let connectionChangeCallback: (connected: boolean) => void;
      (socketService.onConnectionChange as any).mockImplementation((callback: any) => {
        connectionChangeCallback = callback;
        return () => {};
      });

      render(
        <ProjectHubContainer 
          projectId="test-project-123" 
          userName="Alice"
        />
      );

      // Wait for project to load
      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      // Simulate connection
      connectionChangeCallback!(true);

      // Should join project room
      await waitFor(() => {
        expect(socketService.joinProject).toHaveBeenCalledWith('test-project-123', 'Alice');
      });
    });

    it('should leave project room on component unmount', async () => {
      const { unmount } = render(
        <ProjectHubContainer 
          projectId="test-project-123" 
          userName="Alice"
        />
      );

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      expect(socketService.leaveProject).toHaveBeenCalled();
    });

    it('should handle project ID changes', async () => {
      // Mock connected state
      (socketService.isConnected as any).mockReturnValue(true);
      
      let connectionChangeCallback: (connected: boolean) => void;
      (socketService.onConnectionChange as any).mockImplementation((callback: any) => {
        connectionChangeCallback = callback;
        return () => {};
      });

      const { rerender } = render(
        <ProjectHubContainer 
          projectId="test-project-123" 
          userName="Alice"
        />
      );

      // Wait for initial project load
      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      // Simulate connection
      connectionChangeCallback!(true);

      // Wait for initial join
      await waitFor(() => {
        expect(socketService.joinProject).toHaveBeenCalledWith('test-project-123', 'Alice');
      });

      // Mock new project data
      const newProject = { ...mockProject, projectId: 'test-project-456', projectName: 'New Project' };
      (projectApi.getById as any).mockResolvedValue(newProject);

      // Change project ID
      rerender(
        <ProjectHubContainer 
          projectId="test-project-456" 
          userName="Alice"
        />
      );

      // Should join new project room
      await waitFor(() => {
        expect(socketService.joinProject).toHaveBeenCalledWith('test-project-456', 'Alice');
      });
    });
  });
});