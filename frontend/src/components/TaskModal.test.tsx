import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskModal } from './TaskModal';
import type { Task, TeamMember } from '../types';

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test description',
  assignedTo: 'member-1',
  columnId: 'todo',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  order: 1,
};

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

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

const renderTaskModal = (props: {
  isOpen?: boolean;
  task?: Task | null;
  columnId?: string;
} = {}) => {
  return render(
    <TaskModal
      isOpen={props.isOpen ?? true}
      onClose={mockOnClose}
      onSave={mockOnSave}
      task={props.task}
      columnId={props.columnId}
      teamMembers={mockTeamMembers}
    />
  );
};

describe('TaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    renderTaskModal({ isOpen: false });
    
    expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
  });

  it('renders create modal when no task provided', () => {
    renderTaskModal();
    
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByTestId('save-task')).toHaveTextContent('Create');
  });

  it('renders edit modal when task provided', () => {
    renderTaskModal({ task: mockTask });
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByTestId('save-task')).toHaveTextContent('Update');
  });

  it('populates form fields when editing task', () => {
    renderTaskModal({ task: mockTask });
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    
    const assigneeSelect = screen.getByTestId('task-assignee-select') as HTMLSelectElement;
    expect(assigneeSelect.value).toBe('member-1');
  });

  it('starts with empty form when creating new task', () => {
    renderTaskModal();
    
    const titleInput = screen.getByTestId('task-title-input') as HTMLInputElement;
    const descriptionInput = screen.getByTestId('task-description-input') as HTMLTextAreaElement;
    const assigneeSelect = screen.getByTestId('task-assignee-select') as HTMLSelectElement;
    
    expect(titleInput.value).toBe('');
    expect(descriptionInput.value).toBe('');
    expect(assigneeSelect.value).toBe('');
  });

  it('renders team members in assignee dropdown', () => {
    renderTaskModal();
    
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderTaskModal();
    
    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    renderTaskModal();
    
    const cancelButton = screen.getByTestId('cancel-task');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows validation error when title is empty', async () => {
    const user = userEvent.setup();
    renderTaskModal();
    
    const saveButton = screen.getByTestId('save-task');
    await user.click(saveButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with correct data when creating task', async () => {
    const user = userEvent.setup();
    renderTaskModal({ columnId: 'inprogress' });
    
    const titleInput = screen.getByTestId('task-title-input');
    const descriptionInput = screen.getByTestId('task-description-input');
    const assigneeSelect = screen.getByTestId('task-assignee-select');
    
    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New description');
    await user.selectOptions(assigneeSelect, 'member-2');
    
    const saveButton = screen.getByTestId('save-task');
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New description',
      assignedTo: 'member-2',
      columnId: 'inprogress',
    });
  });

  it('calls onSave with correct data when updating task', async () => {
    const user = userEvent.setup();
    renderTaskModal({ task: mockTask });
    
    const titleInput = screen.getByTestId('task-title-input');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    
    const saveButton = screen.getByTestId('save-task');
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'Updated Task',
      description: 'Test description',
      assignedTo: 'member-1',
      columnId: 'todo',
    });
  });

  it('uses default columnId when creating task without columnId', async () => {
    const user = userEvent.setup();
    renderTaskModal();
    
    const titleInput = screen.getByTestId('task-title-input');
    await user.type(titleInput, 'New Task');
    
    const saveButton = screen.getByTestId('save-task');
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'New Task',
      columnId: 'todo', // Default column
    });
  });

  it('handles empty description correctly', async () => {
    const user = userEvent.setup();
    renderTaskModal();
    
    const titleInput = screen.getByTestId('task-title-input');
    await user.type(titleInput, 'Task without description');
    
    const saveButton = screen.getByTestId('save-task');
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'Task without description',
      columnId: 'todo',
    });
  });

  it('handles unassigned task correctly', async () => {
    const user = userEvent.setup();
    renderTaskModal();
    
    const titleInput = screen.getByTestId('task-title-input');
    await user.type(titleInput, 'Unassigned task');
    
    const saveButton = screen.getByTestId('save-task');
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'Unassigned task',
      columnId: 'todo',
    });
  });

  it('trims whitespace from inputs', async () => {
    const user = userEvent.setup();
    renderTaskModal();
    
    const titleInput = screen.getByTestId('task-title-input');
    const descriptionInput = screen.getByTestId('task-description-input');
    
    await user.type(titleInput, '  Trimmed Task  ');
    await user.type(descriptionInput, '  Trimmed description  ');
    
    const saveButton = screen.getByTestId('save-task');
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'Trimmed Task',
      description: 'Trimmed description',
      columnId: 'todo',
    });
  });

  it('clears form when modal is closed and reopened', async () => {
    const { rerender } = renderTaskModal({ task: mockTask });
    
    // Modal should be populated with task data
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    
    // Close modal
    rerender(
      <TaskModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        task={mockTask}
        columnId=""
        teamMembers={mockTeamMembers}
      />
    );
    
    // Reopen modal without task (create mode)
    rerender(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        task={null}
        columnId=""
        teamMembers={mockTeamMembers}
      />
    );
    
    const titleInput = screen.getByTestId('task-title-input') as HTMLInputElement;
    expect(titleInput.value).toBe('');
  });

  it('prevents form submission with only whitespace title', async () => {
    const user = userEvent.setup();
    renderTaskModal();
    
    const titleInput = screen.getByTestId('task-title-input');
    await user.type(titleInput, '   ');
    
    const saveButton = screen.getByTestId('save-task');
    await user.click(saveButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});