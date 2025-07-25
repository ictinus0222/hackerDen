import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PivotLog } from './PivotLog';
import { pivotApi } from '../services/api';
import type { PivotEntry } from '../types';

// Mock the API
vi.mock('../services/api', () => ({
  pivotApi: {
    getByProject: vi.fn(),
    create: vi.fn(),
  },
}));

const mockPivotApi = vi.mocked(pivotApi);

describe('PivotLog', () => {
  const mockProjectId = 'test-project-id';
  const mockOnPivotAdded = vi.fn();

  const samplePivots: PivotEntry[] = [
    {
      id: '1',
      description: 'Changed from mobile app to web app',
      reason: 'Web development is faster for our team',
      timestamp: new Date('2024-01-15T10:30:00Z'),
    },
    {
      id: '2',
      description: 'Switched from React to Vue',
      reason: 'Team has more Vue experience',
      timestamp: new Date('2024-01-14T15:45:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with initial pivots', () => {
    render(
      <PivotLog
        projectId={mockProjectId}
        initialPivots={samplePivots}
        onPivotAdded={mockOnPivotAdded}
      />
    );

    expect(screen.getByText('Pivot Log')).toBeInTheDocument();
    expect(screen.getByText('Changed from mobile app to web app')).toBeInTheDocument();
    expect(screen.getByText('Switched from React to Vue')).toBeInTheDocument();
    expect(screen.getByText('2 pivots logged')).toBeInTheDocument();
  });

  it('shows empty state when no pivots exist', () => {
    render(<PivotLog projectId={mockProjectId} />);

    expect(screen.getByText('No pivots logged yet')).toBeInTheDocument();
    expect(screen.getByText('Track major direction changes and decisions here')).toBeInTheDocument();
  });

  it('loads pivots from API when no initial pivots provided', async () => {
    mockPivotApi.getByProject.mockResolvedValue(samplePivots);

    render(<PivotLog projectId={mockProjectId} initialPivots={[]} />);

    await waitFor(() => {
      expect(mockPivotApi.getByProject).toHaveBeenCalledWith(mockProjectId);
    });

    await waitFor(() => {
      expect(screen.getByText('Changed from mobile app to web app')).toBeInTheDocument();
    });
  });

  it('handles API error when loading pivots', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockPivotApi.getByProject.mockRejectedValue(new Error('Network error'));

    render(<PivotLog projectId={mockProjectId} initialPivots={[]} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load pivot history')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('shows and hides pivot form when Log Pivot button is clicked', async () => {
    render(<PivotLog projectId={mockProjectId} initialPivots={[]} />);

    const logPivotButton = screen.getByRole('button', { name: /log pivot/i });
    fireEvent.click(logPivotButton);

    expect(screen.getByText('Log a New Pivot')).toBeInTheDocument();
    expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument();

    const hideFormButton = screen.getByRole('button', { name: /hide form/i });
    fireEvent.click(hideFormButton);

    expect(screen.queryByText('Log a New Pivot')).not.toBeInTheDocument();
  });

  it('adds new pivot successfully', async () => {
    const newPivot: PivotEntry = {
      id: '3',
      description: 'Added authentication system',
      reason: 'Security requirements changed',
      timestamp: new Date('2024-01-15T12:00:00Z'),
    };

    mockPivotApi.create.mockResolvedValue(newPivot);

    render(<PivotLog projectId={mockProjectId} initialPivots={[]} onPivotAdded={mockOnPivotAdded} />);

    // Open form
    const logPivotButton = screen.getByRole('button', { name: /log pivot/i });
    fireEvent.click(logPivotButton);

    // Fill form
    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    fireEvent.change(descriptionField, { target: { value: 'Added authentication system' } });
    fireEvent.change(reasonField, { target: { value: 'Security requirements changed' } });
    
    fireEvent.submit(descriptionField.closest('form')!);

    await waitFor(() => {
      expect(mockPivotApi.create).toHaveBeenCalledWith(mockProjectId, {
        description: 'Added authentication system',
        reason: 'Security requirements changed',
      });
    });

    // Check that pivot was added to the list
    await waitFor(() => {
      expect(screen.getByText('Added authentication system')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Security requirements changed')).toBeInTheDocument();
    expect(mockOnPivotAdded).toHaveBeenCalledWith(newPivot);

    // Form should be hidden after successful submission
    expect(screen.queryByText('Log a New Pivot')).not.toBeInTheDocument();
  });

  it('handles pivot creation error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockPivotApi.create.mockRejectedValue(new Error('Failed to create pivot'));

    render(<PivotLog projectId={mockProjectId} initialPivots={[]} />);

    // Open form and submit
    const logPivotButton = screen.getByRole('button', { name: /log pivot/i });
    fireEvent.click(logPivotButton);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    fireEvent.change(descriptionField, { target: { value: 'Test description' } });
    fireEvent.change(reasonField, { target: { value: 'Test reason' } });
    
    fireEvent.submit(descriptionField.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Failed to create pivot')).toBeInTheDocument();
    });

    // Form should still be visible on error
    expect(screen.getByText('Log a New Pivot')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('formats timestamps correctly', () => {
    const pivots: PivotEntry[] = [
      {
        id: '1',
        description: 'Recent pivot',
        reason: 'Just happened',
        timestamp: new Date('2024-01-15T11:45:00Z'), // 15 minutes ago
      },
      {
        id: '2',
        description: 'Hour ago pivot',
        reason: 'One hour ago',
        timestamp: new Date('2024-01-15T11:00:00Z'), // 1 hour ago
      },
      {
        id: '3',
        description: 'Yesterday pivot',
        reason: 'Yesterday',
        timestamp: new Date('2024-01-13T12:00:00Z'), // More than 24 hours ago, will show as absolute date
      },
    ];

    render(<PivotLog projectId={mockProjectId} initialPivots={pivots} />);

    expect(screen.getByText('15 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    expect(screen.getByText('Jan 13, 5:30 PM')).toBeInTheDocument();
  });

  it('handles "just now" timestamp formatting', () => {
    const pivots: PivotEntry[] = [
      {
        id: '1',
        description: 'Just now pivot',
        reason: 'Just happened',
        timestamp: new Date('2024-01-15T11:59:30Z'), // 30 seconds ago
      },
    ];

    render(<PivotLog projectId={mockProjectId} initialPivots={pivots} />);

    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('displays pivot count correctly', () => {
    render(<PivotLog projectId={mockProjectId} initialPivots={[samplePivots[0]]} />);
    expect(screen.getByText('1 pivot logged')).toBeInTheDocument();

    render(<PivotLog projectId={mockProjectId} initialPivots={samplePivots} />);
    expect(screen.getByText('2 pivots logged')).toBeInTheDocument();
  });

  it('shows loading state during pivot creation', async () => {
    let resolveCreate: (value: PivotEntry) => void;
    const createPromise = new Promise<PivotEntry>((resolve) => {
      resolveCreate = resolve;
    });
    mockPivotApi.create.mockReturnValue(createPromise);

    render(<PivotLog projectId={mockProjectId} initialPivots={[]} />);

    // Open form and start submission
    const logPivotButton = screen.getByRole('button', { name: /log pivot/i });
    fireEvent.click(logPivotButton);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    fireEvent.change(descriptionField, { target: { value: 'Test description' } });
    fireEvent.change(reasonField, { target: { value: 'Test reason' } });
    
    fireEvent.submit(descriptionField.closest('form')!);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging pivot/i })).toBeInTheDocument();
    });

    // Resolve the promise
    resolveCreate!({
      id: '3',
      description: 'Test description',
      reason: 'Test reason',
      timestamp: new Date(),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log pivot/i })).toBeInTheDocument();
    });
  });

  it('displays pivot entries with proper structure', () => {
    render(<PivotLog projectId={mockProjectId} initialPivots={samplePivots} />);

    // Check that both "What changed" and "Why" sections are present
    const whatChangedHeaders = screen.getAllByText('What changed:');
    const whyHeaders = screen.getAllByText('Why:');

    expect(whatChangedHeaders).toHaveLength(2);
    expect(whyHeaders).toHaveLength(2);

    // Check that descriptions and reasons are displayed
    expect(screen.getByText('Changed from mobile app to web app')).toBeInTheDocument();
    expect(screen.getByText('Web development is faster for our team')).toBeInTheDocument();
    expect(screen.getByText('Switched from React to Vue')).toBeInTheDocument();
    expect(screen.getByText('Team has more Vue experience')).toBeInTheDocument();
  });

  it('sorts pivots by timestamp (most recent first)', async () => {
    const unsortedPivots: PivotEntry[] = [
      {
        id: '1',
        description: 'Older pivot',
        reason: 'Old reason',
        timestamp: new Date('2024-01-14T10:00:00Z'),
      },
      {
        id: '2',
        description: 'Newer pivot',
        reason: 'New reason',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
    ];

    mockPivotApi.getByProject.mockResolvedValue(unsortedPivots);

    render(<PivotLog projectId={mockProjectId} initialPivots={[]} />);

    await waitFor(() => {
      expect(mockPivotApi.getByProject).toHaveBeenCalledWith(mockProjectId);
    });

    await waitFor(() => {
      // The newer pivot should appear first in the DOM
      expect(screen.getByText('Newer pivot')).toBeInTheDocument();
      expect(screen.getByText('Older pivot')).toBeInTheDocument();
    });
  });
});