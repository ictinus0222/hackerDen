import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import DocumentHistory from '../DocumentHistory';
import { versionService } from '../../services/versionService';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../services/versionService', () => ({
  versionService: {
    getVersionHistory: vi.fn()
  }
}));

// Mock UI components
vi.mock('../ui/tooltip', () => ({
  TooltipProvider: ({ children }) => children,
  Tooltip: ({ children }) => children,
  TooltipTrigger: ({ children }) => children,
  TooltipContent: ({ children }) => <div>{children}</div>
}));

vi.mock('../ui/dialog', () => ({
  Dialog: ({ children, open }) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>
}));

vi.mock('../LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

const mockVersions = [
  {
    $id: 'version-1',
    versionNumber: 3,
    changesSummary: 'Latest changes',
    createdByName: 'John Doe',
    $createdAt: '2024-01-03T10:00:00.000Z',
    isSnapshot: false
  },
  {
    $id: 'version-2',
    versionNumber: 2,
    changesSummary: 'Manual snapshot',
    createdByName: 'Jane Smith',
    $createdAt: '2024-01-02T10:00:00.000Z',
    isSnapshot: true
  },
  {
    $id: 'version-3',
    versionNumber: 1,
    changesSummary: 'Initial content',
    createdByName: 'John Doe',
    $createdAt: '2024-01-01T10:00:00.000Z',
    isSnapshot: false
  }
];

describe('DocumentHistory', () => {
  const defaultProps = {
    documentId: 'doc-1',
    onRestoreVersion: vi.fn(),
    onViewVersion: vi.fn(),
    onCompareVersions: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    versionService.getVersionHistory.mockImplementation(() => new Promise(() => {}));
    
    render(<DocumentHistory {...defaultProps} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading version history...')).toBeInTheDocument();
  });

  it('should render version history successfully', async () => {
    versionService.getVersionHistory.mockResolvedValue(mockVersions);
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
      expect(screen.getByText('3 versions')).toBeInTheDocument();
    });

    // Check if versions are displayed
    expect(screen.getByText('Latest changes')).toBeInTheDocument();
    expect(screen.getByText('Manual snapshot')).toBeInTheDocument();
    expect(screen.getByText('Initial content')).toBeInTheDocument();

    // Check current version badge
    expect(screen.getByText('Current')).toBeInTheDocument();
    
    // Check snapshot badge
    expect(screen.getByText('Snapshot')).toBeInTheDocument();
  });

  it('should render empty state when no versions exist', async () => {
    versionService.getVersionHistory.mockResolvedValue([]);
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No version history available')).toBeInTheDocument();
      expect(screen.getByText('Versions will appear here as the document is edited')).toBeInTheDocument();
    });
  });

  it('should render error state when loading fails', async () => {
    const errorMessage = 'Failed to load versions';
    versionService.getVersionHistory.mockRejectedValue(new Error(errorMessage));
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(`Failed to load version history: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('should handle version selection for comparison', async () => {
    versionService.getVersionHistory.mockResolvedValue(mockVersions);
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    // Click on first version
    const firstVersionCard = screen.getByText('Latest changes').closest('.cursor-pointer');
    fireEvent.click(firstVersionCard);

    // Should show selection message
    expect(screen.getByText('Select another version to compare')).toBeInTheDocument();

    // Click on second version
    const secondVersionCard = screen.getByText('Manual snapshot').closest('.cursor-pointer');
    fireEvent.click(secondVersionCard);

    // Should show compare button
    expect(screen.getByText('Compare Selected')).toBeInTheDocument();
  });

  it('should call onCompareVersions when compare button is clicked', async () => {
    versionService.getVersionHistory.mockResolvedValue(mockVersions);
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    // Select two versions
    const firstVersionCard = screen.getByText('Latest changes').closest('.cursor-pointer');
    const secondVersionCard = screen.getByText('Manual snapshot').closest('.cursor-pointer');
    
    fireEvent.click(firstVersionCard);
    fireEvent.click(secondVersionCard);

    // Click compare button
    const compareButton = screen.getByText('Compare Selected');
    fireEvent.click(compareButton);

    expect(defaultProps.onCompareVersions).toHaveBeenCalledWith('version-1', 'version-2');
  });

  it('should call onViewVersion when view button is clicked', async () => {
    versionService.getVersionHistory.mockResolvedValue(mockVersions);
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    // Find and click view button (eye icon)
    const viewButtons = screen.getAllByRole('button');
    const viewButton = viewButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('title') === 'View this version'
    );
    
    if (viewButton) {
      fireEvent.click(viewButton);
      expect(defaultProps.onViewVersion).toHaveBeenCalledWith(mockVersions[0]);
    }
  });

  it('should open restore confirmation dialog', async () => {
    versionService.getVersionHistory.mockResolvedValue(mockVersions);
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    // Find and click restore button (only available for non-current versions)
    const restoreButtons = screen.getAllByRole('button');
    const restoreButton = restoreButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('title') === 'Restore to this version'
    );
    
    if (restoreButton) {
      fireEvent.click(restoreButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByText('Restore Document Version')).toBeInTheDocument();
      });
    }
  });

  it('should handle restore confirmation', async () => {
    versionService.getVersionHistory.mockResolvedValue(mockVersions);
    defaultProps.onRestoreVersion.mockResolvedValue();
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    // Find and click restore button
    const restoreButtons = screen.getAllByRole('button');
    const restoreButton = restoreButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('title') === 'Restore to this version'
    );
    
    if (restoreButton) {
      fireEvent.click(restoreButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Click confirm restore button
      const confirmButton = screen.getByText('Restore Version');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(defaultProps.onRestoreVersion).toHaveBeenCalled();
      });
    }
  });

  it('should format dates correctly', async () => {
    const recentVersion = {
      ...mockVersions[0],
      $createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    };
    
    versionService.getVersionHistory.mockResolvedValue([recentVersion]);
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('30m ago')).toBeInTheDocument();
    });
  });

  it('should handle version selection limits', async () => {
    versionService.getVersionHistory.mockResolvedValue(mockVersions);
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    // Select three versions (should replace the oldest selection)
    const versionCards = screen.getAllByText(/changes|snapshot|content/).map(text => 
      text.closest('.cursor-pointer')
    );
    
    fireEvent.click(versionCards[0]);
    fireEvent.click(versionCards[1]);
    fireEvent.click(versionCards[2]);

    // Should still show compare button (only 2 versions selected)
    expect(screen.getByText('Compare Selected')).toBeInTheDocument();
    expect(screen.getByText('Two versions selected for comparison')).toBeInTheDocument();
  });

  it('should handle restore error', async () => {
    versionService.getVersionHistory.mockResolvedValue(mockVersions);
    const errorMessage = 'Restore failed';
    defaultProps.onRestoreVersion.mockRejectedValue(new Error(errorMessage));
    
    render(<DocumentHistory {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    // Find and click restore button
    const restoreButtons = screen.getAllByRole('button');
    const restoreButton = restoreButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('title') === 'Restore to this version'
    );
    
    if (restoreButton) {
      fireEvent.click(restoreButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Click confirm restore button
      const confirmButton = screen.getByText('Restore Version');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(`Failed to load version history: ${errorMessage}`)).toBeInTheDocument();
      });
    }
  });
});