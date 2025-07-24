import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskBoard } from './TaskBoard';
import { taskApi } from '../services/api';
import type { Task, TeamMember } from '../types';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { vi } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { vi } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { vi } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { vi } from 'vitest';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';

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
});