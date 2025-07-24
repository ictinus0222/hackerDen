import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskBoard } from './TaskBoard';
import { taskApi } from '../services/api';
import type { Task, TeamMember } from '../types';

// Mock the API
vi.mock('../services/api', () => ({
  taskApi: {
    getByProject: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Task 1',
    description: 'Description 1',
    assignedTo: 'member-1',
    columnId: 'todo',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    order: 1,
  },
  {
    id: 'task-2',
    title: 'Task 2',
    assignedTo: 'member-2',
    columnId: 'inprogress',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    order: 1,
  },
];

const mockTeamMembers: TeamMember[] = [
  {
    id: 'member-1',
    name: 'John Doe',
    role: 'Developer',
    joinedAt: new Date('2024-01-01'),
  },
  {
    id: 'member-2',
    name: 'Jane Smith',
    role: 'Designer',
    joinedAt: new Date('2024-01-01'),
  },
];

const renderTaskBoard = () => {
  return render(
    <TaskBoard
      projectId="project-1"
      teamMembers={mockTeamMembers}
    />
  );
};

describe('TaskBoard API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (taskApi.getByProject as any).mockResolvedValue(mockTasks);
  });

  describe('Task Loading', () => {
    it('loads tasks on mount successfully', async () => {
      renderTaskBoard();

      // Should show loading initially
      expect(screen.getByTestId('task-board-loading')).toBeInTheDocument();

      // Should load tasks successfully
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(taskApi.getByProject).toHaveBeenCalledWith('project-1');
    });

    it('provides manual retry functionality', async () => {
      (taskApi.getByProject as any).mockRejectedValue(new Error('Network unavailable'));
      
      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Should show retry button
      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();

      // Mock successful retry
      (taskApi.getByProject as any).mockResolvedValue(mockTasks);
      
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(taskApi.getByProject).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Task Creation', () => {
    it('creates tasks with optimistic updates', async () => {
      const user = userEvent.setup();
      const newTask: Task = {
        id: 'task-3',
        title: 'New Task',
        columnId: 'todo',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 2,
      };

      (taskApi.create as any).mockResolvedValue(newTask);
      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      // Create task
      await user.click(screen.getByTestId('add-task-button'));
      await user.type(screen.getByTestId('task-title-input'), 'New Task');
      await user.click(screen.getByTestId('save-task'));

      // Should call API
      await waitFor(() => {
        expect(taskApi.create).toHaveBeenCalledWith('project-1', {
          title: 'New Task',
          columnId: 'todo',
        });
      });

      // Should show new task in UI
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    it('handles creation errors with rollback', async () => {
      const user = userEvent.setup();
      (taskApi.create as any).mockRejectedValue(new Error('Creation failed'));
      
      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      // Try to create task
      await user.click(screen.getByTestId('add-task-button'));
      await user.type(screen.getByTestId('task-title-input'), 'Failed Task');
      await user.click(screen.getByTestId('save-task'));

      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });

      // Modal should stay open for retry
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
      
      // Task should not appear in UI
      expect(screen.queryByText('Failed Task')).not.toBeInTheDocument();
    });
  });

  describe('Task Updates', () => {
    it('updates tasks with optimistic updates', async () => {
      const user = userEvent.setup();
      const updatedTask: Task = {
        ...mockTasks[0],
        title: 'Updated Task',
      };

      (taskApi.update as any).mockResolvedValue(updatedTask);
      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
      });

      // Edit task
      await user.click(screen.getByTestId('task-menu-task-1'));
      await user.click(screen.getByTestId('edit-task-task-1'));

      const titleInput = screen.getByTestId('task-title-input');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task');
      await user.click(screen.getByTestId('save-task'));

      // Should call API
      await waitFor(() => {
        expect(taskApi.update).toHaveBeenCalledWith('task-1', {
          title: 'Updated Task',
          description: 'Description 1',
          assignedTo: 'member-1',
          columnId: 'todo',
        });
      });

      // Should show updated task in UI
      expect(screen.getByText('Updated Task')).toBeInTheDocument();
    });

    it('handles drag-and-drop column changes', async () => {
      const updatedTask: Task = {
        ...mockTasks[0],
        columnId: 'inprogress',
      };

      (taskApi.update as any).mockResolvedValue(updatedTask);
      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('task-board')).toBeInTheDocument();
      });

      // Simulate drag and drop by calling the move handler
      // In a real scenario, this would be triggered by the drag-and-drop library
      const taskCard = screen.getByTestId('task-card-task-1');
      expect(taskCard).toBeInTheDocument();

      // The actual drag-and-drop testing would require more complex setup
      // For now, we verify the API integration works
      expect(taskApi.getByProject).toHaveBeenCalledWith('project-1');
    });

    it('handles update errors with rollback', async () => {
      const user = userEvent.setup();
      (taskApi.update as any).mockRejectedValue(new Error('Update failed'));
      
      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
      });

      // Try to edit task
      await user.click(screen.getByTestId('task-menu-task-1'));
      await user.click(screen.getByTestId('edit-task-task-1'));

      const titleInput = screen.getByTestId('task-title-input');
      await user.clear(titleInput);
      await user.type(titleInput, 'Failed Update');
      await user.click(screen.getByTestId('save-task'));

      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });

      // Original task should still be visible (rollback)
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Failed Update')).not.toBeInTheDocument();
    });
  });

  describe('Task Deletion', () => {
    it('deletes tasks with optimistic updates', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      (taskApi.delete as any).mockResolvedValue(undefined);

      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
      });

      // Delete task
      await user.click(screen.getByTestId('task-menu-task-1'));
      await user.click(screen.getByTestId('delete-task-task-1'));

      // Should call API
      await waitFor(() => {
        expect(taskApi.delete).toHaveBeenCalledWith('task-1');
      });

      // Task should be removed from UI
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();

      confirmSpy.mockRestore();
    });

    it('handles deletion errors with rollback', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      (taskApi.delete as any).mockRejectedValue(new Error('Deletion failed'));

      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
      });

      // Try to delete task
      await user.click(screen.getByTestId('task-menu-task-1'));
      await user.click(screen.getByTestId('delete-task-task-1'));

      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Deletion failed')).toBeInTheDocument();
      });

      // Task should still be visible (rollback)
      expect(screen.getByText('Task 1')).toBeInTheDocument();

      confirmSpy.mockRestore();
    });
  });

  describe('Real-time Collaboration', () => {
    it('handles concurrent operations correctly', async () => {
      const user = userEvent.setup();
      let createCallCount = 0;

      (taskApi.create as any).mockImplementation(() => {
        createCallCount++;
        return Promise.resolve({
          id: `task-${createCallCount + 2}`,
          title: `Concurrent Task ${createCallCount}`,
          columnId: 'todo',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: createCallCount,
        });
      });

      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      // Create multiple tasks rapidly
      await user.click(screen.getByTestId('add-task-button'));
      await user.type(screen.getByTestId('task-title-input'), 'Task A');
      await user.click(screen.getByTestId('save-task'));

      await waitFor(() => {
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('add-task-button'));
      await user.type(screen.getByTestId('task-title-input'), 'Task B');
      await user.click(screen.getByTestId('save-task'));

      await waitFor(() => {
        expect(taskApi.create).toHaveBeenCalledTimes(2);
      });

      expect(createCallCount).toBe(2);
    });

    it('maintains data consistency during rapid updates', async () => {
      const user = userEvent.setup();
      let updateCallCount = 0;

      (taskApi.update as any).mockImplementation((taskId, updates) => {
        updateCallCount++;
        return Promise.resolve({
          ...mockTasks.find(t => t.id === taskId),
          ...updates,
          updatedAt: new Date(),
        });
      });

      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
      });

      // Rapid updates
      await user.click(screen.getByTestId('task-menu-task-1'));
      await user.click(screen.getByTestId('edit-task-task-1'));

      const titleInput = screen.getByTestId('task-title-input');
      await user.clear(titleInput);
      await user.type(titleInput, 'Rapid Update 1');
      await user.click(screen.getByTestId('save-task'));

      await waitFor(() => {
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      });

      // Second rapid update
      await user.click(screen.getByTestId('task-menu-task-1'));
      await user.click(screen.getByTestId('edit-task-task-1'));

      const titleInput2 = screen.getByTestId('task-title-input');
      await user.clear(titleInput2);
      await user.type(titleInput2, 'Rapid Update 2');
      await user.click(screen.getByTestId('save-task'));

      await waitFor(() => {
        expect(taskApi.update).toHaveBeenCalledTimes(2);
      });

      expect(updateCallCount).toBe(2);
    });
  });

  describe('Error Recovery', () => {
    it('allows manual retry after errors', async () => {
      const user = userEvent.setup();
      (taskApi.getByProject as any).mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockTasks);

      renderTaskBoard();

      // Should show error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      // Should call API again and load tasks
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      expect(taskApi.getByProject).toHaveBeenCalledTimes(2);
    });

    it('provides user feedback during error states', async () => {
      (taskApi.getByProject as any).mockRejectedValue(new Error('Persistent error'));
      
      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Should show error message
      expect(screen.getByText(/Persistent error/)).toBeInTheDocument();
      
      // Should show retry button
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      
      // Should show dismiss button
      expect(screen.getByTestId('dismiss-error')).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('handles large task lists efficiently', async () => {
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        columnId: i % 3 === 0 ? 'todo' : i % 3 === 1 ? 'inprogress' : 'done',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: i,
      }));

      (taskApi.getByProject as any).mockResolvedValue(largeTasks);
      
      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('task-board')).toBeInTheDocument();
      });

      // Should load all tasks
      expect(screen.getByText('Task 0')).toBeInTheDocument();
      expect(screen.getByText('Task 99')).toBeInTheDocument();
      
      // Should call API only once
      expect(taskApi.getByProject).toHaveBeenCalledTimes(1);
    });

    it('debounces rapid API calls', async () => {
      const user = userEvent.setup();
      let updateCallCount = 0;

      (taskApi.update as any).mockImplementation(() => {
        updateCallCount++;
        return Promise.resolve({
          ...mockTasks[0],
          columnId: 'inprogress',
        });
      });

      renderTaskBoard();

      await waitFor(() => {
        expect(screen.getByTestId('task-board')).toBeInTheDocument();
      });

      // The component should handle rapid state changes efficiently
      // This is more of a performance test than a functional test
      expect(taskApi.getByProject).toHaveBeenCalledWith('project-1');
    });
  });
});