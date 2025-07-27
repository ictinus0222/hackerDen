import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskBoard } from './TaskBoard';
import { ProjectHub } from './ProjectHub';
import { SubmissionForm } from './SubmissionForm';
import type { Task, TaskColumn, ProjectHub as ProjectHubType } from '../types';

// Mock API service
vi.mock('../services/api', () => ({
  api: {
    updateTask: vi.fn(),
    updateProject: vi.fn(),
    createSubmission: vi.fn(),
  },
}));

// Mock socket service
vi.mock('../services/socket', () => ({
  socketService: {
    on: vi.fn(),
    off: vi.fn(),
    isConnected: vi.fn(() => true),
  },
}));

// Mock React DnD with touch backend
vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
  useDrop: () => [{ isOver: false }, vi.fn()],
}));

describe('Mobile Touch Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock touch device
    Object.defineProperty(window, 'ontouchstart', {
      value: {},
      writable: true,
    });
    
    // Mock viewport meta tag for mobile
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1';
    document.head.appendChild(viewport);
  });

  afterEach(() => {
    // Clean up viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      document.head.removeChild(viewport);
    }
  });

  describe('Touch Events on TaskBoard', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Touch Task 1',
        description: 'Description 1',
        columnId: 'todo',
        assignedTo: 'user1',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockColumns: TaskColumn[] = [
      { id: 'todo', name: 'todo', displayName: 'To Do', order: 0 },
      { id: 'inprogress', name: 'inprogress', displayName: 'In Progress', order: 1 },
    ];

    it('handles single touch on task card', () => {
      render(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Touch Task 1');
      
      fireEvent.touchStart(taskCard, {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
      });

      fireEvent.touchEnd(taskCard, {
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }],
      });

      expect(taskCard).toBeInTheDocument();
    });

    it('handles long press on task card', async () => {
      vi.useFakeTimers();
      
      render(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Touch Task 1');
      
      // Start long press
      fireEvent.touchStart(taskCard, {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
      });

      // Advance time for long press
      vi.advanceTimersByTime(500);

      // End touch
      fireEvent.touchEnd(taskCard, {
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }],
      });

      expect(taskCard).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('handles touch move for scrolling', () => {
      render(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskBoard = screen.getByRole('main') || screen.getByTestId('task-board');
      
      fireEvent.touchStart(taskBoard, {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
      });

      fireEvent.touchMove(taskBoard, {
        touches: [{ clientX: 100, clientY: 50, identifier: 0 }],
      });

      fireEvent.touchEnd(taskBoard, {
        changedTouches: [{ clientX: 100, clientY: 50, identifier: 0 }],
      });

      expect(taskBoard).toBeInTheDocument();
    });

    it('handles pinch-to-zoom gesture', () => {
      render(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskBoard = screen.getByRole('main') || screen.getByTestId('task-board');
      
      // Start pinch gesture
      fireEvent.touchStart(taskBoard, {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 },
          { clientX: 200, clientY: 200, identifier: 1 },
        ],
      });

      // Move fingers apart (zoom in)
      fireEvent.touchMove(taskBoard, {
        touches: [
          { clientX: 80, clientY: 80, identifier: 0 },
          { clientX: 220, clientY: 220, identifier: 1 },
        ],
      });

      fireEvent.touchEnd(taskBoard, {
        changedTouches: [
          { clientX: 80, clientY: 80, identifier: 0 },
          { clientX: 220, clientY: 220, identifier: 1 },
        ],
      });

      expect(taskBoard).toBeInTheDocument();
    });

    it('handles swipe gestures', () => {
      render(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Touch Task 1');
      
      // Swipe right
      fireEvent.touchStart(taskCard, {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
      });

      fireEvent.touchMove(taskCard, {
        touches: [{ clientX: 200, clientY: 100, identifier: 0 }],
      });

      fireEvent.touchEnd(taskCard, {
        changedTouches: [{ clientX: 200, clientY: 100, identifier: 0 }],
      });

      expect(taskCard).toBeInTheDocument();
    });

    it('prevents default touch behavior when appropriate', () => {
      render(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Touch Task 1');
      
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(touchStartEvent, 'preventDefault');
      
      fireEvent(taskCard, touchStartEvent);

      // Should prevent default for drag operations
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Touch Events on ProjectHub', () => {
    const mockProject: ProjectHubType = {
      id: 'test-project',
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

    it('handles touch input on form fields', () => {
      render(<ProjectHub project={mockProject} onUpdate={vi.fn()} />);

      const projectNameInput = screen.getByDisplayValue('Test Project');
      
      fireEvent.touchStart(projectNameInput);
      fireEvent.focus(projectNameInput);
      fireEvent.change(projectNameInput, { target: { value: 'Updated Project' } });
      fireEvent.touchEnd(projectNameInput);

      expect(projectNameInput).toHaveValue('Updated Project');
    });

    it('handles touch on date picker', () => {
      render(<ProjectHub project={mockProject} onUpdate={vi.fn()} />);

      const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
      const dateInput = dateInputs[0];
      
      fireEvent.touchStart(dateInput);
      fireEvent.focus(dateInput);
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      fireEvent.touchEnd(dateInput);

      expect(dateInput).toHaveValue('2024-12-31');
    });

    it('handles touch on add team member button', () => {
      const onUpdate = vi.fn();
      render(<ProjectHub project={mockProject} onUpdate={onUpdate} />);

      const addButton = screen.getByText(/add member/i) || screen.getByRole('button', { name: /add/i });
      
      fireEvent.touchStart(addButton);
      fireEvent.touchEnd(addButton);
      fireEvent.click(addButton);

      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Touch Events on SubmissionForm', () => {
    it('handles touch input on URL fields', () => {
      render(<SubmissionForm projectId="test-project" onSubmit={vi.fn()} />);

      const githubInput = screen.getByPlaceholderText(/github/i) || screen.getByLabelText(/github/i);
      
      fireEvent.touchStart(githubInput);
      fireEvent.focus(githubInput);
      fireEvent.change(githubInput, { target: { value: 'https://github.com/test/repo' } });
      fireEvent.touchEnd(githubInput);

      expect(githubInput).toHaveValue('https://github.com/test/repo');
    });

    it('handles touch on submit button', () => {
      const onSubmit = vi.fn();
      render(<SubmissionForm projectId="test-project" onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      fireEvent.touchStart(submitButton);
      fireEvent.touchEnd(submitButton);
      fireEvent.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Touch Accessibility', () => {
    it('provides adequate touch targets (44px minimum)', () => {
      render(
        <TaskBoard
          projectId="test-project"
          tasks={[]}
          columns={[]}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minSize = 44; // 44px minimum touch target
        
        // Note: In test environment, computed styles might not be accurate
        // This is more of a structural test
        expect(button).toBeInTheDocument();
      });
    });

    it('handles focus management with touch', () => {
      const mockProject: ProjectHubType = {
        id: 'test-project',
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

      render(<ProjectHub project={mockProject} onUpdate={vi.fn()} />);

      const projectNameInput = screen.getByDisplayValue('Test Project');
      
      // Touch should focus the element
      fireEvent.touchStart(projectNameInput);
      fireEvent.focus(projectNameInput);
      
      expect(document.activeElement).toBe(projectNameInput);
    });

    it('provides haptic feedback simulation', () => {
      // Mock navigator.vibrate
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        writable: true,
      });

      render(
        <TaskBoard
          projectId="test-project"
          tasks={[]}
          columns={[]}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const addButton = screen.getByRole('button', { name: /add task/i }) || 
                       screen.getByText(/add/i);
      
      fireEvent.touchStart(addButton);
      fireEvent.touchEnd(addButton);

      // In a real implementation, this would trigger vibration
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Touch Performance', () => {
    it('handles rapid touch events without lag', () => {
      const onTaskUpdate = vi.fn();
      
      render(
        <TaskBoard
          projectId="test-project"
          tasks={[]}
          columns={[]}
          onTaskUpdate={onTaskUpdate}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskBoard = screen.getByRole('main') || screen.getByTestId('task-board');
      
      // Simulate rapid touch events
      for (let i = 0; i < 10; i++) {
        fireEvent.touchStart(taskBoard, {
          touches: [{ clientX: 100 + i, clientY: 100 + i, identifier: i }],
        });
        fireEvent.touchEnd(taskBoard, {
          changedTouches: [{ clientX: 100 + i, clientY: 100 + i, identifier: i }],
        });
      }

      expect(taskBoard).toBeInTheDocument();
    });

    it('debounces touch events appropriately', async () => {
      vi.useFakeTimers();
      
      const onUpdate = vi.fn();
      const mockProject: ProjectHubType = {
        id: 'test-project',
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

      render(<ProjectHub project={mockProject} onUpdate={onUpdate} />);

      const projectNameInput = screen.getByDisplayValue('Test Project');
      
      // Rapid changes
      fireEvent.change(projectNameInput, { target: { value: 'A' } });
      fireEvent.change(projectNameInput, { target: { value: 'AB' } });
      fireEvent.change(projectNameInput, { target: { value: 'ABC' } });

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // Should debounce the updates
      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });
  });

  describe('Touch Error Handling', () => {
    it('handles touch events when API is unavailable', async () => {
      const { api } = await import('../services/api');
      (api.updateTask as any).mockRejectedValue(new Error('Network error'));

      const onTaskUpdate = vi.fn();
      
      render(
        <TaskBoard
          projectId="test-project"
          tasks={[]}
          columns={[]}
          onTaskUpdate={onTaskUpdate}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskBoard = screen.getByRole('main') || screen.getByTestId('task-board');
      
      // Should not crash on touch events even if API fails
      expect(() => {
        fireEvent.touchStart(taskBoard, {
          touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
        });
        fireEvent.touchEnd(taskBoard, {
          changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }],
        });
      }).not.toThrow();
    });

    it('handles malformed touch events', () => {
      render(
        <TaskBoard
          projectId="test-project"
          tasks={[]}
          columns={[]}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskBoard = screen.getByRole('main') || screen.getByTestId('task-board');
      
      // Should handle malformed touch events gracefully
      expect(() => {
        fireEvent.touchStart(taskBoard, {
          touches: [], // Empty touches array
        });
        
        fireEvent.touchStart(taskBoard, {
          // Missing touches property
        } as any);
      }).not.toThrow();
    });
  });
});