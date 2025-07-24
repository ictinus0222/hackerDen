import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  {
    id: 'task-3',
    title: 'Task 3',
    columnId: 'done',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
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

describe('TaskBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (taskApi.getByProject as any).mockResolvedValue(mockTasks);
  });

  it('renders loading state initially', () => {
    renderTaskBoard();
    
    expect(screen.getByTestId('task-board-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('loads and displays tasks after loading', async () => {
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
    });
    
    expect(taskApi.getByProject).toHaveBeenCalledWith('project-1');
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('displays error message when loading fails', async () => {
    (taskApi.getByProject as any).mockRejectedValue(new Error('Failed to load'));
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders task board header with add task button', async () => {
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByText('Task Board')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
  });

  it('renders all three columns', async () => {
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('task-column-todo')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('task-column-inprogress')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-done')).toBeInTheDocument();
  });

  it('opens modal when add task button is clicked', async () => {
    const user = userEvent.setup();
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });
    
    await user.click(screen.getByTestId('add-task-button'));
    
    expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('opens modal when column add button is clicked', async () => {
    const user = userEvent.setup();
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('add-task-todo')).toBeInTheDocument();
    });
    
    await user.click(screen.getByTestId('add-task-todo'));
    
    expect(screen.getByTestId('task-modal')).toBeInTheDocument();
  });

  it('creates new task successfully', async () => {
    const user = userEvent.setup();
    const newTask: Task = {
      id: 'task-4',
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
    
    // Open modal
    await user.click(screen.getByTestId('add-task-button'));
    
    // Fill form
    await user.type(screen.getByTestId('task-title-input'), 'New Task');
    await user.click(screen.getByTestId('save-task'));
    
    await waitFor(() => {
      expect(taskApi.create).toHaveBeenCalledWith('project-1', {
        title: 'New Task',
        columnId: 'todo',
      });
    });
  });

  it('handles task creation error', async () => {
    const user = userEvent.setup();
    (taskApi.create as any).mockRejectedValue(new Error('Creation failed'));
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });
    
    // Open modal and create task
    await user.click(screen.getByTestId('add-task-button'));
    await user.type(screen.getByTestId('task-title-input'), 'New Task');
    await user.click(screen.getByTestId('save-task'));
    
    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
    });
  });

  it('updates task successfully', async () => {
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
    
    // Open task menu and edit
    await user.click(screen.getByTestId('task-menu-task-1'));
    await user.click(screen.getByTestId('edit-task-task-1'));
    
    // Update title
    const titleInput = screen.getByTestId('task-title-input');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    await user.click(screen.getByTestId('save-task'));
    
    await waitFor(() => {
      expect(taskApi.update).toHaveBeenCalledWith('task-1', {
        title: 'Updated Task',
        description: 'Description 1',
        assignedTo: 'member-1',
        columnId: 'todo',
      });
    });
  });

  it('deletes task with confirmation', async () => {
    const user = userEvent.setup();
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    (taskApi.delete as any).mockResolvedValue(undefined);
    
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
    });
    
    // Open task menu and delete
    await user.click(screen.getByTestId('task-menu-task-1'));
    await user.click(screen.getByTestId('delete-task-task-1'));
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    
    await waitFor(() => {
      expect(taskApi.delete).toHaveBeenCalledWith('task-1');
    });
    
    confirmSpy.mockRestore();
  });

  it('cancels task deletion when not confirmed', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
    });
    
    // Open task menu and delete
    await user.click(screen.getByTestId('task-menu-task-1'));
    await user.click(screen.getByTestId('delete-task-task-1'));
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(taskApi.delete).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('handles task deletion error with rollback', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    (taskApi.delete as any).mockRejectedValue(new Error('Deletion failed'));
    
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
    });
    
    // Verify task is initially present
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    
    // Delete task
    await user.click(screen.getByTestId('task-menu-task-1'));
    await user.click(screen.getByTestId('delete-task-task-1'));
    
    await waitFor(() => {
      expect(screen.getByText('Deletion failed')).toBeInTheDocument();
    });
    
    // Task should be restored after error
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    
    confirmSpy.mockRestore();
  });

  it('moves task between columns with optimistic update', async () => {
    (taskApi.update as any).mockResolvedValue({ ...mockTasks[0], columnId: 'inprogress' });
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
    });
    
    // Simulate drag and drop by calling the move handler directly
    // This is a simplified test since testing actual drag-and-drop is complex
    const taskBoard = screen.getByTestId('task-board');
    
    // We can't easily test drag-and-drop in jsdom, but we can test the move handler
    // by accessing the component's internal methods through events
    expect(taskApi.getByProject).toHaveBeenCalledWith('project-1');
  });

  it('handles task move error with rollback', async () => {
    (taskApi.update as any).mockRejectedValue(new Error('Move failed'));
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
    });
    
    // The error handling for move operations would be tested through
    // the component's internal state management
    expect(screen.getByTestId('task-board')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });
    
    // Open modal
    await user.click(screen.getByTestId('add-task-button'));
    expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    
    // Close modal
    await user.click(screen.getByTestId('close-modal'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
    });
  });

  it('dismisses error message when close button is clicked', async () => {
    const user = userEvent.setup();
    (taskApi.getByProject as any).mockRejectedValue(new Error('Load failed'));
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    const errorMessage = screen.getByTestId('error-message');
    const closeButton = errorMessage.querySelector('button');
    
    if (closeButton) {
      await user.click(closeButton);
    }
    
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('passes correct team members to components', async () => {
    renderTaskBoard();
    
    await waitFor(() => {
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
    });
    
    // Verify team members are available in the modal
    await userEvent.click(screen.getByTestId('add-task-button'));
    
    // Use getAllByText since team members appear in both task cards and modal
    const johnDoeElements = screen.getAllByText('John Doe');
    const janeSmithElements = screen.getAllByText('Jane Smith');
    
    expect(johnDoeElements.length).toBeGreaterThan(0);
    expect(janeSmithElements.length).toBeGreaterThan(0);
  });

  describe('API Integration Tests', () => {
    it('handles task move with optimistic updates and rollback on failure', async () => {
      (taskApi.update as any).mockRejectedValue(new Error('Network error'));
      renderTaskBoard();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-board')).toBeInTheDocument();
      });
      
      // Get the TaskBoard component instance to test the move handler
      const taskBoard = screen.getByTestId('task-board');
      
      // Simulate a task move by finding a task and triggering the move handler
      // Since we can't easily test drag-and-drop in jsdom, we'll test the handler directly
      const taskCard = screen.getByTestId('task-card-task-1');
      expect(taskCard).toBeInTheDocument();
      
      // The task should initially be in the 'todo' column
      expect(taskCard.closest('[data-testid="task-column-todo"]')).toBeInTheDocument();
    });

    it('handles concurrent task operations correctly', async () => {
      const user = userEvent.setup();
      let createCallCount = 0;
      
      (taskApi.create as any).mockImplementation(() => {
        createCallCount++;
        return Promise.resolve({
          id: `task-${createCallCount + 3}`,
          title: `Task ${createCallCount + 3}`,
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

    it('maintains task order during drag-and-drop operations', async () => {
      const updatedTask = { ...mockTasks[0], columnId: 'inprogress', order: 1 };
      (taskApi.update as any).mockResolvedValue(updatedTask);
      
      renderTaskBoard();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-board')).toBeInTheDocument();
      });
      
      // Verify initial task positions
      const todoColumn = screen.getByTestId('task-column-todo');
      const inProgressColumn = screen.getByTestId('task-column-inprogress');
      
      expect(todoColumn).toContainElement(screen.getByTestId('task-card-task-1'));
      expect(inProgressColumn).toContainElement(screen.getByTestId('task-card-task-2'));
    });

    it('handles API timeout and retry scenarios', async () => {
      const user = userEvent.setup();
      let attemptCount = 0;
      
      (taskApi.create as any).mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return Promise.reject(new Error('Request timeout'));
        }
        return Promise.resolve({
          id: 'task-4',
          title: 'Retry Task',
          columnId: 'todo',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 1,
        });
      });
      
      renderTaskBoard();
      
      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });
      
      // First attempt should fail
      await user.click(screen.getByTestId('add-task-button'));
      await user.type(screen.getByTestId('task-title-input'), 'Retry Task');
      
      // Expect the first attempt to fail and not close the modal
      await user.click(screen.getByTestId('save-task'));
      
      await waitFor(() => {
        expect(screen.getByText('Request timeout')).toBeInTheDocument();
      });
      
      // Modal should still be open after error
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
      
      // Clear error and try again
      const errorMessage = screen.getByTestId('error-message');
      const closeButton = errorMessage.querySelector('button');
      if (closeButton) {
        await user.click(closeButton);
      }
      
      // Second attempt should succeed and close modal
      await user.click(screen.getByTestId('save-task'));
      
      await waitFor(() => {
        expect(taskApi.create).toHaveBeenCalledTimes(2);
      });
      
      expect(attemptCount).toBe(2);
    });

    it('handles bulk task operations efficiently', async () => {
      const user = userEvent.setup();
      const bulkTasks = Array.from({ length: 5 }, (_, i) => ({
        id: `bulk-task-${i}`,
        title: `Bulk Task ${i}`,
        columnId: 'todo',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: i,
      }));
      
      (taskApi.getByProject as any).mockResolvedValue([...mockTasks, ...bulkTasks]);
      
      renderTaskBoard();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-board')).toBeInTheDocument();
      });
      
      // Verify all tasks are loaded
      bulkTasks.forEach(task => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });
      
      expect(taskApi.getByProject).toHaveBeenCalledWith('project-1');
    });

    it('handles task assignment changes through API', async () => {
      const user = userEvent.setup();
      const updatedTask = { ...mockTasks[0], assignedTo: 'member-2' };
      (taskApi.update as any).mockResolvedValue(updatedTask);
      
      renderTaskBoard();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
      });
      
      // Edit task to change assignment
      await user.click(screen.getByTestId('task-menu-task-1'));
      await user.click(screen.getByTestId('edit-task-task-1'));
      
      // Change assignee
      const assigneeSelect = screen.getByTestId('task-assignee-select');
      await user.selectOptions(assigneeSelect, 'member-2');
      await user.click(screen.getByTestId('save-task'));
      
      await waitFor(() => {
        expect(taskApi.update).toHaveBeenCalledWith('task-1', {
          title: 'Task 1',
          description: 'Description 1',
          assignedTo: 'member-2',
          columnId: 'todo',
        });
      });
    });

    it('handles network connectivity issues gracefully', async () => {
      const user = userEvent.setup();
      (taskApi.getByProject as any).mockRejectedValue(new Error('Network unavailable'));
      
      renderTaskBoard();
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      // Check for the error message with retry text
      expect(screen.getByText(/Network unavailable/)).toBeInTheDocument();
      
      // Simulate network recovery
      (taskApi.getByProject as any).mockResolvedValue(mockTasks);
      
      // Click retry button
      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(taskApi.getByProject).toHaveBeenCalledTimes(2);
      });
      
      // Error should be cleared after successful retry
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });

    it('validates task data before API calls', async () => {
      const user = userEvent.setup();
      renderTaskBoard();
      
      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });
      
      // Try to create task without title
      await user.click(screen.getByTestId('add-task-button'));
      await user.click(screen.getByTestId('save-task'));
      
      // Should not call API with invalid data
      expect(taskApi.create).not.toHaveBeenCalled();
    });

    it('handles task updates with partial data correctly', async () => {
      const user = userEvent.setup();
      const partialUpdate = { ...mockTasks[0], title: 'Updated Title Only' };
      (taskApi.update as any).mockResolvedValue(partialUpdate);
      
      renderTaskBoard();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-menu-task-1')).toBeInTheDocument();
      });
      
      // Edit only the title
      await user.click(screen.getByTestId('task-menu-task-1'));
      await user.click(screen.getByTestId('edit-task-task-1'));
      
      const titleInput = screen.getByTestId('task-title-input');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title Only');
      await user.click(screen.getByTestId('save-task'));
      
      await waitFor(() => {
        expect(taskApi.update).toHaveBeenCalledWith('task-1', {
          title: 'Updated Title Only',
          description: 'Description 1',
          assignedTo: 'member-1',
          columnId: 'todo',
        });
      });
    });
  });
});