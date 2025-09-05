import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PollResults from '../PollResults';
import pollService from '../../services/pollService';
import { taskService } from '../../services/taskService';

// Mock the services
vi.mock('../../services/pollService');
vi.mock('../../services/taskService');
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user123', name: 'Test User' }
  })
}));

describe('PollResults Component', () => {
  const mockPoll = {
    $id: 'poll123',
    teamId: 'team123',
    question: 'Should we implement feature X?',
    options: ['Yes', 'No'],
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: '2024-01-02T00:00:00Z'
  };

  const mockPollResults = {
    poll: mockPoll,
    results: [
      { option: 'Yes', votes: 8, percentage: 80 },
      { option: 'No', votes: 2, percentage: 20 }
    ],
    totalVotes: 10,
    uniqueVoters: 10,
    winners: ['Yes'],
    isExpired: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders poll results correctly', () => {
    render(
      <PollResults 
        poll={mockPoll} 
        pollResults={mockPollResults} 
      />
    );

    expect(screen.getByText('Poll Results')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Total votes
    expect(screen.getByText('10')).toBeInTheDocument(); // Unique voters
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('8 votes (80%)')).toBeInTheDocument();
    expect(screen.getByText('2 votes (20%)')).toBeInTheDocument();
  });

  it('shows winner badge for winning option', () => {
    render(
      <PollResults 
        poll={mockPoll} 
        pollResults={mockPollResults} 
      />
    );

    expect(screen.getByText('Winner')).toBeInTheDocument();
  });

  it('handles export functionality', async () => {
    const mockExportData = {
      content: 'Option,Votes,Percentage\nYes,8,80%\nNo,2,20%',
      filename: 'poll-results-poll123-2024-01-01.csv',
      mimeType: 'text/csv'
    };

    pollService.exportPollResults.mockResolvedValue(mockExportData);

    // Mock URL.createObjectURL and related DOM methods
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {}
    };
    document.createElement = vi.fn(() => mockLink);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();

    render(
      <PollResults 
        poll={mockPoll} 
        pollResults={mockPollResults} 
        showExport={true}
      />
    );

    const exportButton = screen.getByText('Export Results');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(pollService.exportPollResults).toHaveBeenCalledWith('poll123', 'csv');
    });

    expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', mockExportData.filename);
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('handles task conversion for single winner', async () => {
    const mockTaskData = {
      title: 'Implement: Yes',
      description: 'Task created from poll decision',
      teamId: 'team123',
      createdBy: 'user123',
      priority: 'medium'
    };

    const mockNewTask = {
      $id: 'task123',
      ...mockTaskData
    };

    pollService.convertPollToTask.mockResolvedValue(mockTaskData);
    taskService.createTask.mockResolvedValue(mockNewTask);

    const onTaskCreated = vi.fn();

    render(
      <PollResults 
        poll={mockPoll} 
        pollResults={mockPollResults} 
        onTaskCreated={onTaskCreated}
        showTaskConversion={true}
      />
    );

    const createTaskButton = screen.getByText('Create Task from Winner');
    fireEvent.click(createTaskButton);

    await waitFor(() => {
      expect(pollService.convertPollToTask).toHaveBeenCalledWith('poll123', 'Yes');
    });

    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(
        'team123',
        null,
        expect.objectContaining({
          title: mockTaskData.title,
          description: mockTaskData.description,
          assignedTo: null,
          createdBy: 'user123',
          priority: 'medium'
        }),
        'Test User',
        null
      );
    });

    expect(onTaskCreated).toHaveBeenCalledWith(mockNewTask, 'Yes');
  });

  it('renders compact version correctly', () => {
    render(
      <PollResults 
        poll={mockPoll} 
        pollResults={mockPollResults} 
        compact={true}
      />
    );

    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('10 votes')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('8 (80%)')).toBeInTheDocument();
  });

  it('handles multiple winners correctly', () => {
    const multipleWinnerResults = {
      ...mockPollResults,
      results: [
        { option: 'Yes', votes: 5, percentage: 50 },
        { option: 'No', votes: 5, percentage: 50 }
      ],
      winners: ['Yes', 'No']
    };

    render(
      <PollResults 
        poll={mockPoll} 
        pollResults={multipleWinnerResults} 
        showTaskConversion={true}
      />
    );

    expect(screen.getByText('Multiple winners - choose one to create task:')).toBeInTheDocument();
    expect(screen.getByText('Create Task: "Yes"')).toBeInTheDocument();
    expect(screen.getByText('Create Task: "No"')).toBeInTheDocument();
  });

  it('shows no results message when pollResults is null', () => {
    render(
      <PollResults 
        poll={mockPoll} 
        pollResults={null} 
      />
    );

    expect(screen.getByText('No results available')).toBeInTheDocument();
  });
});