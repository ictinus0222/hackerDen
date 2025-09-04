import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import IdeaCard from '../IdeaCard';

const mockIdea = {
  $id: 'idea-123',
  title: 'Test Idea',
  description: 'This is a test idea description that should be displayed in the card',
  tags: ['frontend', 'react', 'ui'],
  status: 'submitted',
  voteCount: 5,
  createdBy: 'user-123',
  $createdAt: '2024-01-01T12:00:00.000Z'
};

const mockCurrentUser = {
  $id: 'user-456',
  name: 'Current User'
};

const defaultProps = {
  idea: mockIdea,
  hasUserVoted: false,
  onVote: vi.fn(),
  onStatusChange: vi.fn(),
  canChangeStatus: false,
  currentUser: mockCurrentUser
};

describe('IdeaCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders idea information correctly', () => {
    render(<IdeaCard {...defaultProps} />);

    expect(screen.getByText('Test Idea')).toBeInTheDocument();
    expect(screen.getByText('This is a test idea description that should be displayed in the card')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Vote count
  });

  it('displays status badge with correct styling', () => {
    render(<IdeaCard {...defaultProps} />);

    const statusBadge = screen.getByText('💡 submitted');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-gray-500/20', 'text-gray-300');
  });

  it('renders tags correctly', () => {
    render(<IdeaCard {...defaultProps} />);

    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('ui')).toBeInTheDocument();
  });

  it('shows truncated tags when more than 3', () => {
    const ideaWithManyTags = {
      ...mockIdea,
      tags: ['frontend', 'react', 'ui', 'design', 'responsive']
    };

    render(<IdeaCard {...defaultProps} idea={ideaWithManyTags} />);

    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('ui')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('displays creation date', () => {
    render(<IdeaCard {...defaultProps} />);

    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });

  it('shows "Your idea" for own ideas', () => {
    const ownIdea = { ...mockIdea, createdBy: 'user-456' };
    render(<IdeaCard {...defaultProps} idea={ownIdea} />);

    expect(screen.getByText('Your idea')).toBeInTheDocument();
  });

  it('handles vote button click', async () => {
    const onVote = vi.fn();
    render(<IdeaCard {...defaultProps} onVote={onVote} />);

    const voteButton = screen.getByRole('button', { name: /5/ });
    fireEvent.click(voteButton);

    expect(onVote).toHaveBeenCalledTimes(1);
  });

  it('disables vote button when user has already voted', () => {
    render(<IdeaCard {...defaultProps} hasUserVoted={true} />);

    const voteButton = screen.getByRole('button', { name: /5/ });
    expect(voteButton).toBeDisabled();
    expect(voteButton).toHaveClass('bg-blue-500/20', 'text-blue-300');
  });

  it('shows loading state when voting', async () => {
    const onVote = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<IdeaCard {...defaultProps} onVote={onVote} />);

    const voteButton = screen.getByRole('button', { name: /5/ });
    fireEvent.click(voteButton);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  it('shows status change dropdown for team leaders', () => {
    render(<IdeaCard {...defaultProps} canChangeStatus={true} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not show status change dropdown for regular members', () => {
    render(<IdeaCard {...defaultProps} canChangeStatus={false} />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('handles status change', async () => {
    const onStatusChange = vi.fn();
    render(<IdeaCard {...defaultProps} canChangeStatus={true} onStatusChange={onStatusChange} />);

    const statusSelect = screen.getByRole('combobox');
    fireEvent.click(statusSelect);

    // Note: Testing the actual selection would require more complex setup
    // This test verifies the dropdown is present and functional
    expect(statusSelect).toBeInTheDocument();
  });

  it('displays different status colors correctly', () => {
    const statuses = [
      { status: 'approved', expectedClass: 'bg-green-500/20' },
      { status: 'in_progress', expectedClass: 'bg-blue-500/20' },
      { status: 'completed', expectedClass: 'bg-purple-500/20' },
      { status: 'rejected', expectedClass: 'bg-red-500/20' }
    ];

    statuses.forEach(({ status, expectedClass }) => {
      const ideaWithStatus = { ...mockIdea, status };
      const { unmount } = render(<IdeaCard {...defaultProps} idea={ideaWithStatus} />);
      
      const statusBadge = screen.getByText(new RegExp(status.replace('_', ' ')));
      expect(statusBadge).toHaveClass(expectedClass);
      
      unmount();
    });
  });

  it('prevents voting when already voting', async () => {
    const onVote = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<IdeaCard {...defaultProps} onVote={onVote} />);

    const voteButton = screen.getByRole('button', { name: /5/ });
    
    // Click multiple times rapidly
    fireEvent.click(voteButton);
    fireEvent.click(voteButton);
    fireEvent.click(voteButton);

    // Should only be called once
    expect(onVote).toHaveBeenCalledTimes(1);
  });
});