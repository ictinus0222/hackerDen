import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskModal from '../TaskModal';

// Mock the hooks and services
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User' }
  })
}));

vi.mock('../../hooks/useHackathonTeamMembers', () => ({
  useHackathonTeamMembers: () => ({
    members: [
      { id: 'user1', name: 'Test User', role: 'owner' },
      { id: 'user2', name: 'Team Member', role: 'member' }
    ]
  })
}));

vi.mock('../../services/taskService', () => ({
  taskService: {
    createTask: vi.fn(),
    updateTaskFields: vi.fn()
  }
}));

vi.mock('../../services/teamService', () => ({
  teamService: {
    getUserTeamForHackathon: vi.fn().mockResolvedValue({
      $id: 'team1',
      userRole: 'owner'
    })
  }
}));

// Mock react-router-dom useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ hackathonId: 'hackathon1' })
  };
});

const renderTaskModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onTaskCreated: vi.fn(),
    onTaskUpdated: vi.fn(),
    editTask: null,
    ...props
  };

  return render(
    <BrowserRouter>
      <TaskModal {...defaultProps} />
    </BrowserRouter>
  );
};

describe('TaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create task modal when no editTask is provided', () => {
    renderTaskModal();
    
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe the task details...')).toBeInTheDocument();
  });

  it('renders edit task modal when editTask is provided', () => {
    const editTask = {
      $id: 'task1',
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high',
      labels: ['urgent'],
      assignedTo: 'user1'
    };

    renderTaskModal({ editTask });
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('shows form validation errors for required fields', async () => {
    renderTaskModal();
    
    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task title is required')).toBeInTheDocument();
      expect(screen.getByText('Task description is required')).toBeInTheDocument();
    });
  });

  it('allows adding and removing labels', async () => {
    renderTaskModal();
    
    const labelInput = screen.getByPlaceholderText('Add a label...');
    const addButton = screen.getByText('Add');

    // Add a label
    fireEvent.change(labelInput, { target: { value: 'frontend' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('frontend')).toBeInTheDocument();
    });

    // Remove the label
    const removeButton = screen.getByLabelText('Remove frontend label');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('frontend')).not.toBeInTheDocument();
    });
  });

  it('closes modal when cancel button is clicked', () => {
    const onClose = vi.fn();
    renderTaskModal({ onClose });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    renderTaskModal({ isOpen: false });
    
    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
  });

  it('shows priority selection options', async () => {
    renderTaskModal();
    
    // Find and click the priority select trigger
    const priorityTrigger = screen.getByRole('combobox');
    fireEvent.click(priorityTrigger);

    await waitFor(() => {
      expect(screen.getByText('🟢 Low Priority')).toBeInTheDocument();
      expect(screen.getByText('🟡 Medium Priority')).toBeInTheDocument();
      expect(screen.getByText('🔴 High Priority')).toBeInTheDocument();
    });
  });
});