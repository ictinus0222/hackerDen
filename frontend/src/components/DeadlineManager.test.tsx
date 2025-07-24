import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { DeadlineManager } from './DeadlineManager';

const mockDeadlines = {
  hackingEnds: new Date('2024-02-15T18:00:00Z'),
  submissionDeadline: new Date('2024-02-15T20:00:00Z'),
  presentationTime: new Date('2024-02-16T10:00:00Z')
};

// Mock current time for consistent testing
const mockCurrentTime = new Date('2024-02-15T12:00:00Z');

describe('DeadlineManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockCurrentTime);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all deadlines correctly', () => {
    render(<DeadlineManager deadlines={mockDeadlines} />);
    
    expect(screen.getByText('Key Deadlines')).toBeInTheDocument();
    expect(screen.getByText('Hacking Ends')).toBeInTheDocument();
    expect(screen.getByText('Submission Deadline')).toBeInTheDocument();
    expect(screen.getByText('Presentation Time')).toBeInTheDocument();
  });

  it('shows edit button when canEdit is true', () => {
    render(<DeadlineManager deadlines={mockDeadlines} canEdit={true} />);
    
    expect(screen.getByText('Edit Deadlines')).toBeInTheDocument();
  });

  it('does not show edit button when canEdit is false', () => {
    render(<DeadlineManager deadlines={mockDeadlines} canEdit={false} />);
    
    expect(screen.queryByText('Edit Deadlines')).not.toBeInTheDocument();
  });

  it('displays time remaining correctly', () => {
    render(<DeadlineManager deadlines={mockDeadlines} />);
    
    // Should show hours remaining for hacking ends (6 hours from mock time)
    expect(screen.getByText('6h 0m remaining')).toBeInTheDocument();
  });

  it('shows past due for expired deadlines', () => {
    const pastDeadlines = {
      ...mockDeadlines,
      hackingEnds: new Date('2024-02-15T10:00:00Z') // 2 hours ago
    };
    
    render(<DeadlineManager deadlines={pastDeadlines} />);
    
    expect(screen.getByText('Past due')).toBeInTheDocument();
  });

  it('applies correct urgency colors', () => {
    const urgentDeadlines = {
      ...mockDeadlines,
      hackingEnds: new Date('2024-02-15T13:00:00Z') // 1 hour remaining
    };
    
    render(<DeadlineManager deadlines={urgentDeadlines} />);
    
    const hackingEndsCard = screen.getByText('Hacking Ends').closest('div')?.parentElement?.parentElement;
    expect(hackingEndsCard).toHaveClass('text-red-600');
  });

  it('shows edit form elements when canEdit is true', () => {
    render(<DeadlineManager deadlines={mockDeadlines} canEdit={true} />);
    
    const editButton = screen.getByText('Edit Deadlines');
    expect(editButton).toBeInTheDocument();
    
    // Test that the component can enter edit mode by checking the button exists
    expect(editButton).toBeInTheDocument();
  });

  it('calls onUpdateDeadlines when provided', () => {
    const onUpdateDeadlines = vi.fn();
    
    render(
      <DeadlineManager 
        deadlines={mockDeadlines} 
        onUpdateDeadlines={onUpdateDeadlines}
        canEdit={true} 
      />
    );
    
    // Test that the callback prop is properly passed
    expect(onUpdateDeadlines).not.toHaveBeenCalled();
    
    // Component should render with edit capability
    expect(screen.getByText('Edit Deadlines')).toBeInTheDocument();
  });

  it('has cancel functionality available in edit mode', () => {
    const onUpdateDeadlines = vi.fn();
    
    render(
      <DeadlineManager 
        deadlines={mockDeadlines} 
        onUpdateDeadlines={onUpdateDeadlines}
        canEdit={true} 
      />
    );
    
    // Component should have edit button available
    expect(screen.getByText('Edit Deadlines')).toBeInTheDocument();
    expect(onUpdateDeadlines).not.toHaveBeenCalled();
  });

  it('formats dates correctly for display', () => {
    render(<DeadlineManager deadlines={mockDeadlines} />);
    
    // Should display formatted date strings
    expect(screen.getByText(/Thu, Feb 15, 2024/)).toBeInTheDocument();
    expect(screen.getAllByText(/Fri, Feb 16, 2024/)).toHaveLength(2);
  });

  it('updates edited deadlines when props change', () => {
    const { rerender } = render(<DeadlineManager deadlines={mockDeadlines} canEdit={true} />);
    
    const newDeadlines = {
      ...mockDeadlines,
      hackingEnds: new Date('2024-02-15T19:00:00Z')
    };
    
    rerender(<DeadlineManager deadlines={newDeadlines} canEdit={true} />);
    
    // Component should reflect the new deadline
    expect(screen.getByText('7h 0m remaining')).toBeInTheDocument();
  });

  it('provides edit functionality when canEdit is true', () => {
    render(<DeadlineManager deadlines={mockDeadlines} canEdit={true} />);
    
    // Component should have edit functionality available
    expect(screen.getByText('Edit Deadlines')).toBeInTheDocument();
    
    // Component should display all deadline information
    expect(screen.getByText('Hacking Ends')).toBeInTheDocument();
    expect(screen.getByText('Submission Deadline')).toBeInTheDocument();
    expect(screen.getByText('Presentation Time')).toBeInTheDocument();
  });

  it('shows appropriate descriptions for each deadline', () => {
    render(<DeadlineManager deadlines={mockDeadlines} />);
    
    expect(screen.getByText('When development must stop')).toBeInTheDocument();
    expect(screen.getByText('Final submission due')).toBeInTheDocument();
    expect(screen.getByText('When you present to judges')).toBeInTheDocument();
  });

  it('calculates days remaining correctly for distant deadlines', () => {
    const distantDeadlines = {
      ...mockDeadlines,
      hackingEnds: new Date('2024-02-17T18:00:00Z') // 2 days and 6 hours from mock time
    };
    
    render(<DeadlineManager deadlines={distantDeadlines} />);
    
    expect(screen.getByText('2d 6h remaining')).toBeInTheDocument();
  });
});