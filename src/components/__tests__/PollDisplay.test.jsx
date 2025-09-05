import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PollDisplay from '../PollDisplay';
import pollService from '../../services/pollService';

// Mock the services and components
vi.mock('../../services/pollService');
vi.mock('../PollResults', () => ({
  default: ({ poll, pollResults, onTaskCreated, showExport, showTaskConversion, compact }) => (
    <div data-testid="poll-results">
      <div>Poll Results Component</div>
      <div>Poll: {poll.question}</div>
      <div>Total Votes: {pollResults?.totalVotes || 0}</div>
      <div>Compact: {compact ? 'true' : 'false'}</div>
      <div>Show Export: {showExport ? 'true' : 'false'}</div>
      <div>Show Task Conversion: {showTaskConversion ? 'true' : 'false'}</div>
      {onTaskCreated && <button onClick={() => onTaskCreated({}, 'Yes')}>Mock Create Task</button>}
    </div>
  )
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user123', name: 'Test User' }
  })
}));

describe('PollDisplay Component', () => {
  const mockPoll = {
    $id: 'poll123',
    teamId: 'team123',
    question: 'Should we implement feature X?',
    options: ['Yes', 'No', 'Maybe'],
    allowMultiple: false,
    isActive: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    createdAt: '2024-01-01T00:00:00Z'
  };

  const mockPollResults = {
    poll: mockPoll,
    results: [
      { option: 'Yes', votes: 5, percentage: 50 },
      { option: 'No', votes: 3, percentage: 30 },
      { option: 'Maybe', votes: 2, percentage: 20 }
    ],
    totalVotes: 10,
    uniqueVoters: 10,
    winners: ['Yes'],
    isExpired: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    pollService.getUserVote.mockResolvedValue(null);
    pollService.getPollResults.mockResolvedValue(mockPollResults);
  });

  it('renders poll question and options for voting', async () => {
    render(<PollDisplay poll={mockPoll} />);

    expect(screen.getByText('Should we implement feature X?')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Maybe')).toBeInTheDocument();
    });
  });

  it('handles single choice voting correctly', async () => {
    pollService.voteOnPoll.mockResolvedValue({
      $id: 'vote123',
      selectedOptions: ['Yes']
    });

    render(<PollDisplay poll={mockPoll} onVoteUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    // Select an option
    const yesOption = screen.getByLabelText('Yes');
    fireEvent.click(yesOption);

    // Submit vote
    const submitButton = screen.getByText('Submit Vote');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(pollService.voteOnPoll).toHaveBeenCalledWith('poll123', 'user123', ['Yes']);
    });
  });

  it('handles multiple choice voting correctly', async () => {
    const multipleChoicePoll = { ...mockPoll, allowMultiple: true };
    
    pollService.voteOnPoll.mockResolvedValue({
      $id: 'vote123',
      selectedOptions: ['Yes', 'Maybe']
    });

    render(<PollDisplay poll={multipleChoicePoll} onVoteUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    // Select multiple options
    const yesOption = screen.getByLabelText('Yes');
    const maybeOption = screen.getByLabelText('Maybe');
    
    fireEvent.click(yesOption);
    fireEvent.click(maybeOption);

    // Submit vote
    const submitButton = screen.getByText('Submit Vote');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(pollService.voteOnPoll).toHaveBeenCalledWith('poll123', 'user123', ['Yes', 'Maybe']);
    });
  });

  it('shows results when user has voted', async () => {
    pollService.getUserVote.mockResolvedValue({
      $id: 'vote123',
      selectedOptions: ['Yes']
    });

    render(<PollDisplay poll={mockPoll} />);

    await waitFor(() => {
      expect(screen.getByTestId('poll-results')).toBeInTheDocument();
      expect(screen.getByText('Poll Results Component')).toBeInTheDocument();
    });
  });

  it('shows results when showResults prop is true', async () => {
    render(<PollDisplay poll={mockPoll} showResults={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('poll-results')).toBeInTheDocument();
    });
  });

  it('passes correct props to PollResults component', async () => {
    const onTaskCreated = vi.fn();
    
    render(
      <PollDisplay 
        poll={mockPoll} 
        showResults={true}
        showExport={false}
        showTaskConversion={true}
        compact={true}
        onTaskCreated={onTaskCreated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Compact: true')).toBeInTheDocument();
      expect(screen.getByText('Show Export: false')).toBeInTheDocument();
      expect(screen.getByText('Show Task Conversion: true')).toBeInTheDocument();
    });

    // Test task creation callback
    const createTaskButton = screen.getByText('Mock Create Task');
    fireEvent.click(createTaskButton);
    
    expect(onTaskCreated).toHaveBeenCalledWith({}, 'Yes');
  });

  it('handles refresh results functionality', async () => {
    pollService.getUserVote.mockResolvedValue({
      $id: 'vote123',
      selectedOptions: ['Yes']
    });

    render(<PollDisplay poll={mockPoll} />);

    await waitFor(() => {
      expect(screen.getByTestId('poll-results')).toBeInTheDocument();
    });

    // Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(pollService.getPollResults).toHaveBeenCalledWith('poll123');
    });
  });

  it('shows expired status for expired polls', () => {
    const expiredPoll = {
      ...mockPoll,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      isActive: false
    };

    render(<PollDisplay poll={expiredPoll} />);

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('renders compact version correctly', async () => {
    render(<PollDisplay poll={mockPoll} compact={true} showResults={true} />);

    await waitFor(() => {
      expect(screen.getByText('Compact: true')).toBeInTheDocument();
    });
  });

  it('disables voting when user has already voted', async () => {
    pollService.getUserVote.mockResolvedValue({
      $id: 'vote123',
      selectedOptions: ['Yes']
    });

    render(<PollDisplay poll={mockPoll} />);

    await waitFor(() => {
      const yesOption = screen.getByLabelText('Yes');
      expect(yesOption).toBeDisabled();
    });
  });

  it('shows user vote confirmation', async () => {
    pollService.getUserVote.mockResolvedValue({
      $id: 'vote123',
      selectedOptions: ['Yes']
    });

    render(<PollDisplay poll={mockPoll} />);

    await waitFor(() => {
      expect(screen.getByText('You voted for: Yes')).toBeInTheDocument();
    });
  });
});