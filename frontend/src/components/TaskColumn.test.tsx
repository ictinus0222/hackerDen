import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TaskColumn } from './TaskColumn';
import type { Task, TaskColumn as TaskColumnType, TeamMember } from '../types';

const mockColumn: TaskColumnType = {
  id: 'todo',
  name: 'todo',
  displayName: 'To Do',
  order: 1,
};

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
    columnId: 'todo',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    order: 2,
  },
  {
    id: 'task-3',
    title: 'Task 3',
    columnId: 'inprogress',
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

const mockOnTaskMove = vi.fn();
const mockOnTaskEdit = vi.fn();
const mockOnTaskDelete = vi.fn();
const mockOnAddTask = vi.fn();

const renderTaskColumn = (
  column: TaskColumnType = mockColumn,
  tasks: Task[] = mockTasks
) => {
  return render(
    <DndProvider backend={HTML5Backend}>
      <TaskColumn
        column={column}
        tasks={tasks}
        teamMembers={mockTeamMembers}
        onTaskMove={mockOnTaskMove}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onAddTask={mockOnAddTask}
      />
    </DndProvider>
  );
};

describe('TaskColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders column title and task count', () => {
    renderTaskColumn();
    
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 tasks in todo column
  });

  it('renders tasks in the correct column', () => {
    renderTaskColumn();
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument(); // Task 3 is in different column
  });

  it('shows empty state when no tasks', () => {
    const emptyColumn: TaskColumnType = {
      id: 'empty',
      name: 'todo',
      displayName: 'Empty Column',
      order: 1,
    };
    renderTaskColumn(emptyColumn, []);
    
    expect(screen.getByText('No tasks')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Task count
  });

  it('calls onAddTask when add button is clicked', () => {
    renderTaskColumn();
    
    const addButton = screen.getByTestId('add-task-todo');
    fireEvent.click(addButton);
    
    expect(mockOnAddTask).toHaveBeenCalledWith('todo');
  });

  it('applies correct styling for todo column', () => {
    renderTaskColumn();
    
    const column = screen.getByTestId('task-column-todo');
    expect(column).toHaveClass('bg-gray-50', 'border-gray-200');
    
    const header = screen.getByText('To Do');
    expect(header).toHaveClass('text-gray-700');
  });

  it('applies correct styling for inprogress column', () => {
    const inProgressColumn: TaskColumnType = {
      id: 'inprogress',
      name: 'inprogress',
      displayName: 'In Progress',
      order: 2,
    };
    renderTaskColumn(inProgressColumn);
    
    const column = screen.getByTestId('task-column-inprogress');
    expect(column).toHaveClass('bg-blue-50', 'border-blue-200');
    
    const header = screen.getByText('In Progress');
    expect(header).toHaveClass('text-blue-700');
  });

  it('applies correct styling for done column', () => {
    const doneColumn: TaskColumnType = {
      id: 'done',
      name: 'done',
      displayName: 'Done',
      order: 3,
    };
    renderTaskColumn(doneColumn);
    
    const column = screen.getByTestId('task-column-done');
    expect(column).toHaveClass('bg-green-50', 'border-green-200');
    
    const header = screen.getByText('Done');
    expect(header).toHaveClass('text-green-700');
  });

  it('sorts tasks by order', () => {
    const unsortedTasks: Task[] = [
      {
        id: 'task-2',
        title: 'Second Task',
        columnId: 'todo',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        order: 2,
      },
      {
        id: 'task-1',
        title: 'First Task',
        columnId: 'todo',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        order: 1,
      },
    ];
    
    renderTaskColumn(mockColumn, unsortedTasks);
    
    const taskCards = screen.getAllByTestId(/task-card-/);
    expect(taskCards[0]).toHaveAttribute('data-testid', 'task-card-task-1');
    expect(taskCards[1]).toHaveAttribute('data-testid', 'task-card-task-2');
  });

  it('has correct test id', () => {
    renderTaskColumn();
    
    expect(screen.getByTestId('task-column-todo')).toBeInTheDocument();
  });

  it('passes correct props to TaskCard components', () => {
    renderTaskColumn();
    
    // Check that task cards are rendered with correct test ids
    expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-task-2')).toBeInTheDocument();
  });

  it('filters tasks correctly by column id', () => {
    const mixedTasks: Task[] = [
      { ...mockTasks[0], columnId: 'todo' },
      { ...mockTasks[1], columnId: 'inprogress' },
      { ...mockTasks[2], columnId: 'todo' },
    ];
    
    renderTaskColumn(mockColumn, mixedTasks);
    
    // Should only show tasks with columnId 'todo'
    expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-task-3')).toBeInTheDocument();
    expect(screen.queryByTestId('task-card-task-2')).not.toBeInTheDocument();
  });

  it('shows correct task count for filtered tasks', () => {
    const mixedTasks: Task[] = [
      { ...mockTasks[0], columnId: 'todo' },
      { ...mockTasks[1], columnId: 'inprogress' },
      { ...mockTasks[2], columnId: 'todo' },
    ];
    
    renderTaskColumn(mockColumn, mixedTasks);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Only 2 tasks in todo column
  });
});