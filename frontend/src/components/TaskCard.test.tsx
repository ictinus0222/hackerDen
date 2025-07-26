import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TaskCard } from './TaskCard';
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

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

const renderTaskCard = (task: Task = mockTask) => {
  return render(
    <DndProvider backend={HTML5Backend}>
      <TaskCard
        task={task}
        teamMembers={mockTeamMembers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    </DndProvider>
  );
};

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title and description', () => {
    renderTaskCard();
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders without description when not provided', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    renderTaskCard(taskWithoutDescription);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('displays assigned team member', () => {
    renderTaskCard();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // Avatar initial
  });

  it('does not display assignment when no member assigned', () => {
    const unassignedTask = { ...mockTask, assignedTo: undefined };
    renderTaskCard(unassignedTask);
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('opens menu when menu button is clicked', () => {
    renderTaskCard();
    
    const menuButton = screen.getByTestId('task-menu-task-1');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('closes menu when clicking menu button again', () => {
    renderTaskCard();
    
    const menuButton = screen.getByTestId('task-menu-task-1');
    fireEvent.click(menuButton);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    
    fireEvent.click(menuButton);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    renderTaskCard();
    
    const menuButton = screen.getByTestId('task-menu-task-1');
    fireEvent.click(menuButton);
    
    const editButton = screen.getByTestId('edit-task-task-1');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderTaskCard();
    
    const menuButton = screen.getByTestId('task-menu-task-1');
    fireEvent.click(menuButton);
    
    const deleteButton = screen.getByTestId('delete-task-task-1');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('task-1');
  });

  it('closes menu after edit action', () => {
    renderTaskCard();
    
    const menuButton = screen.getByTestId('task-menu-task-1');
    fireEvent.click(menuButton);
    
    const editButton = screen.getByTestId('edit-task-task-1');
    fireEvent.click(editButton);
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('closes menu after delete action', () => {
    renderTaskCard();
    
    const menuButton = screen.getByTestId('task-menu-task-1');
    fireEvent.click(menuButton);
    
    const deleteButton = screen.getByTestId('delete-task-task-1');
    fireEvent.click(deleteButton);
    
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('has correct test id', () => {
    renderTaskCard();
    
    expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument();
  });

  it('handles long task titles with truncation', () => {
    const longTitleTask = {
      ...mockTask,
      title: 'This is a very long task title that should be truncated when displayed in the card',
    };
    renderTaskCard(longTitleTask);
    
    const titleElement = screen.getByText(longTitleTask.title);
    expect(titleElement).toHaveClass('break-words');
  });

  it('handles team member not found gracefully', () => {
    const taskWithInvalidAssignee = { ...mockTask, assignedTo: 'invalid-member-id' };
    renderTaskCard(taskWithInvalidAssignee);
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});