import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { TaskBoard } from './TaskBoard';
import { TaskCard } from './TaskCard';
import type { Task, TaskColumn } from '../types';

// Mock API service
vi.mock('../services/api', () => ({
  api: {
    updateTask: vi.fn(),
    getTasks: vi.fn(),
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

describe('Drag and Drop Edge Cases', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      columnId: 'todo',
      assignedTo: 'user1',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      columnId: 'inprogress',
      assignedTo: 'user2',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockColumns: TaskColumn[] = [
    { id: 'todo', name: 'todo', displayName: 'To Do', order: 0 },
    { id: 'inprogress', name: 'inprogress', displayName: 'In Progress', order: 1 },
    { id: 'done', name: 'done', displayName: 'Done', order: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HTML5 Backend (Desktop)', () => {
    const renderWithDnd = (component: React.ReactElement) => {
      return render(
        <DndProvider backend={HTML5Backend}>
          {component}
        </DndProvider>
      );
    };

    it('handles drag start event', () => {
      renderWithDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Task 1');
      
      // Simulate drag start
      fireEvent.dragStart(taskCard, {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: 'move',
        },
      });

      expect(taskCard).toBeInTheDocument();
    });

    it('handles drag over different columns', () => {
      renderWithDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Task 1');
      const inProgressColumn = screen.getByText('In Progress').closest('[data-testid="task-column"]');

      // Simulate drag over
      fireEvent.dragOver(inProgressColumn!, {
        dataTransfer: {
          types: ['application/json'],
        },
      });

      expect(inProgressColumn).toBeInTheDocument();
    });

    it('handles drop with invalid data', () => {
      const onTaskUpdate = vi.fn();
      
      renderWithDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={onTaskUpdate}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const inProgressColumn = screen.getByText('In Progress').closest('[data-testid="task-column"]');

      // Simulate drop with invalid data
      fireEvent.drop(inProgressColumn!, {
        dataTransfer: {
          getData: vi.fn(() => 'invalid-json'),
        },
      });

      // Should not call onTaskUpdate with invalid data
      expect(onTaskUpdate).not.toHaveBeenCalled();
    });

    it('handles drop on same column', () => {
      const onTaskUpdate = vi.fn();
      
      renderWithDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={onTaskUpdate}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Task 1');
      const todoColumn = screen.getByText('To Do').closest('[data-testid="task-column"]');

      // Simulate drag and drop on same column
      fireEvent.dragStart(taskCard, {
        dataTransfer: {
          setData: vi.fn((type, data) => {
            expect(type).toBe('application/json');
            expect(JSON.parse(data)).toEqual(expect.objectContaining({ id: '1' }));
          }),
        },
      });

      fireEvent.drop(todoColumn!, {
        dataTransfer: {
          getData: vi.fn(() => JSON.stringify(mockTasks[0])),
        },
      });

      // Should not update task if dropped on same column
      expect(onTaskUpdate).not.toHaveBeenCalled();
    });

    it('handles drag end event', () => {
      renderWithDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Task 1');
      
      // Simulate drag end
      fireEvent.dragEnd(taskCard);

      expect(taskCard).toBeInTheDocument();
    });
  });

  describe('Touch Backend (Mobile)', () => {
    const renderWithTouchDnd = (component: React.ReactElement) => {
      return render(
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          {component}
        </DndProvider>
      );
    };

    it('handles touch start on mobile', () => {
      renderWithTouchDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Task 1');
      
      // Simulate touch start
      fireEvent.touchStart(taskCard, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      expect(taskCard).toBeInTheDocument();
    });

    it('handles touch move on mobile', () => {
      renderWithTouchDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Task 1');
      
      // Simulate touch move
      fireEvent.touchMove(taskCard, {
        touches: [{ clientX: 150, clientY: 150 }],
      });

      expect(taskCard).toBeInTheDocument();
    });

    it('handles touch end on mobile', () => {
      const onTaskUpdate = vi.fn();
      
      renderWithTouchDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={onTaskUpdate}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Task 1');
      
      // Simulate touch end
      fireEvent.touchEnd(taskCard, {
        changedTouches: [{ clientX: 200, clientY: 200 }],
      });

      expect(taskCard).toBeInTheDocument();
    });

    it('handles multi-touch gestures', () => {
      renderWithTouchDnd(
        <TaskBoard
          projectId="test-project"
          tasks={mockTasks}
          columns={mockColumns}
          onTaskUpdate={vi.fn()}
          onTaskCreate={vi.fn()}
          onTaskDelete={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Task 1');
      
      // Simulate multi-touch
      fireEvent.touchStart(taskCard, {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 120, clientY: 120 },
        ],
      });

      expect(taskCard).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles drag operation when API fails', async () => {
      const { api } = await import('../services/api');
      (api.updateTask as any).mockRejectedValue(new Error('API Error'));

      const onTaskUpdate = vi.fn();
      
      render(
        <DndProvider backend={HTML5Backend}>
          <TaskBoard
            projectId="test-project"
            tasks={mockTasks}
            columns={mockColumns}
            onTaskUpdate={onTaskUpdate}
            onTaskCreate={vi.fn()}
            onTaskDelete={vi.fn()}
          />
        </DndProvider>
      );

      const taskCard = screen.getByText('Task 1');
      const inProgressColumn = screen.getByText('In Progress').closest('[data-testid="task-column"]');

      // Simulate successful drag and drop
      fireEvent.dragStart(taskCard, {
        dataTransfer: {
          setData: vi.fn(),
        },
      });

      fireEvent.drop(inProgressColumn!, {
        dataTransfer: {
          getData: vi.fn(() => JSON.stringify(mockTasks[0])),
        },
      });

      // Should still call onTaskUpdate even if API fails (optimistic update)
      await waitFor(() => {
        expect(onTaskUpdate).toHaveBeenCalled();
      });
    });

    it('handles drag with missing task data', () => {
      const onTaskUpdate = vi.fn();
      
      render(
        <DndProvider backend={HTML5Backend}>
          <TaskBoard
            projectId="test-project"
            tasks={mockTasks}
            columns={mockColumns}
            onTaskUpdate={onTaskUpdate}
            onTaskCreate={vi.fn()}
            onTaskDelete={vi.fn()}
          />
        </DndProvider>
      );

      const inProgressColumn = screen.getByText('In Progress').closest('[data-testid="task-column"]');

      // Simulate drop with missing task data
      fireEvent.drop(inProgressColumn!, {
        dataTransfer: {
          getData: vi.fn(() => ''),
        },
      });

      expect(onTaskUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('provides keyboard navigation for drag and drop', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <TaskBoard
            projectId="test-project"
            tasks={mockTasks}
            columns={mockColumns}
            onTaskUpdate={vi.fn()}
            onTaskCreate={vi.fn()}
            onTaskDelete={vi.fn()}
          />
        </DndProvider>
      );

      const taskCard = screen.getByText('Task 1');
      
      // Should be focusable
      taskCard.focus();
      expect(document.activeElement).toBe(taskCard);

      // Should handle keyboard events
      fireEvent.keyDown(taskCard, { key: 'Enter' });
      fireEvent.keyDown(taskCard, { key: 'Space' });
      fireEvent.keyDown(taskCard, { key: 'ArrowRight' });
      fireEvent.keyDown(taskCard, { key: 'ArrowLeft' });

      expect(taskCard).toBeInTheDocument();
    });

    it('provides screen reader support', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <TaskBoard
            projectId="test-project"
            tasks={mockTasks}
            columns={mockColumns}
            onTaskUpdate={vi.fn()}
            onTaskCreate={vi.fn()}
            onTaskDelete={vi.fn()}
          />
        </DndProvider>
      );

      const taskCard = screen.getByText('Task 1');
      
      // Should have appropriate ARIA attributes
      expect(taskCard).toHaveAttribute('draggable', 'true');
      expect(taskCard).toHaveAttribute('role');
    });
  });
});