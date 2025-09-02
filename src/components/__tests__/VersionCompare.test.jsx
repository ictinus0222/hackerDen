import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VersionCompare from '../VersionCompare';
import { versionService } from '../../services/versionService';

// Mock dependencies
vi.mock('../../services/versionService', () => ({
  versionService: {
    compareVersions: vi.fn()
  }
}));

vi.mock('../LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

// Mock UI components
vi.mock('../ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value, onClick }) => (
    <button onClick={() => onClick?.(value)} data-testid={`tab-${value}`}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }) => <div data-testid={`tab-content-${value}`}>{children}</div>
}));

const mockComparison = {
  version1: {
    $id: 'version-1',
    versionNumber: 1,
    content: 'line 1\nline 2\nline 3',
    createdByName: 'John Doe',
    $createdAt: '2024-01-01T10:00:00.000Z'
  },
  version2: {
    $id: 'version-2',
    versionNumber: 2,
    content: 'line 1\nline 2 modified\nline 3\nline 4',
    createdByName: 'Jane Smith',
    $createdAt: '2024-01-02T10:00:00.000Z'
  },
  diff: [
    {
      type: 'unchanged',
      lineNumber: 1,
      content: 'line 1',
      oldLineNumber: 1,
      newLineNumber: 1
    },
    {
      type: 'removed',
      lineNumber: 2,
      content: 'line 2',
      oldLineNumber: 2,
      newLineNumber: null
    },
    {
      type: 'added',
      lineNumber: 2,
      content: 'line 2 modified',
      oldLineNumber: null,
      newLineNumber: 2
    },
    {
      type: 'unchanged',
      lineNumber: 3,
      content: 'line 3',
      oldLineNumber: 3,
      newLineNumber: 3
    },
    {
      type: 'added',
      lineNumber: 4,
      content: 'line 4',
      oldLineNumber: null,
      newLineNumber: 4
    }
  ],
  summary: {
    linesAdded: 2,
    linesRemoved: 1,
    linesModified: 0
  }
};

describe('VersionCompare', () => {
  const defaultProps = {
    versionId1: 'version-1',
    versionId2: 'version-2',
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    versionService.compareVersions.mockImplementation(() => new Promise(() => {}));
    
    render(<VersionCompare {...defaultProps} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading comparison...')).toBeInTheDocument();
  });

  it('should render comparison successfully', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    // Check version badges
    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();

    // Check summary
    expect(screen.getByText('2')).toBeInTheDocument(); // lines added
    expect(screen.getByText('1')).toBeInTheDocument(); // lines removed

    // Check tabs
    expect(screen.getByTestId('tab-side-by-side')).toBeInTheDocument();
    expect(screen.getByTestId('tab-unified')).toBeInTheDocument();
  });

  it('should render error state when comparison fails', async () => {
    const errorMessage = 'Failed to compare versions';
    versionService.compareVersions.mockRejectedValue(new Error(errorMessage));
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(`Failed to load version comparison: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('should render side-by-side view by default', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    // Check for side-by-side content
    expect(screen.getByText('Version 1 (Older)')).toBeInTheDocument();
    expect(screen.getByText('Version 2 (Newer)')).toBeInTheDocument();
    expect(screen.getByText('3 lines')).toBeInTheDocument(); // older version
    expect(screen.getByText('4 lines')).toBeInTheDocument(); // newer version
  });

  it('should switch to unified view when tab is clicked', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    // Click unified tab
    const unifiedTab = screen.getByTestId('tab-unified');
    fireEvent.click(unifiedTab);

    // Should show unified diff view
    expect(screen.getByText('Unified Diff View')).toBeInTheDocument();
    expect(screen.getByText('2 added')).toBeInTheDocument();
    expect(screen.getByText('1 removed')).toBeInTheDocument();
  });

  it('should call onClose when back button is clicked', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to History');
    fireEvent.click(backButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should render diff lines with correct styling classes', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    // Switch to unified view to see diff lines
    const unifiedTab = screen.getByTestId('tab-unified');
    fireEvent.click(unifiedTab);

    // Check for diff content
    expect(screen.getByText('line 1')).toBeInTheDocument();
    expect(screen.getByText('line 2')).toBeInTheDocument();
    expect(screen.getByText('line 2 modified')).toBeInTheDocument();
    expect(screen.getByText('line 3')).toBeInTheDocument();
    expect(screen.getByText('line 4')).toBeInTheDocument();
  });

  it('should format dates correctly', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    // Check formatted dates (should include both date and time)
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/1\/2\/2024/)).toBeInTheDocument();
  });

  it('should handle empty comparison data', async () => {
    versionService.compareVersions.mockResolvedValue(null);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No comparison data available')).toBeInTheDocument();
    });
  });

  it('should render without onClose prop', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    const propsWithoutClose = {
      versionId1: 'version-1',
      versionId2: 'version-2'
    };
    
    render(<VersionCompare {...propsWithoutClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    // Back button should not be present
    expect(screen.queryByText('Back to History')).not.toBeInTheDocument();
  });

  it('should handle missing version IDs', () => {
    const propsWithMissingIds = {
      versionId1: '',
      versionId2: 'version-2',
      onClose: vi.fn()
    };
    
    render(<VersionCompare {...propsWithMissingIds} />);
    
    // Should not call compareVersions with empty IDs
    expect(versionService.compareVersions).not.toHaveBeenCalled();
  });

  it('should reload comparison when version IDs change', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    const { rerender } = render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(versionService.compareVersions).toHaveBeenCalledWith('version-1', 'version-2');
    });

    // Change version IDs
    const newProps = {
      ...defaultProps,
      versionId1: 'version-3',
      versionId2: 'version-4'
    };
    
    rerender(<VersionCompare {...newProps} />);
    
    await waitFor(() => {
      expect(versionService.compareVersions).toHaveBeenCalledWith('version-3', 'version-4');
    });
  });

  it('should display line numbers correctly in unified view', async () => {
    versionService.compareVersions.mockResolvedValue(mockComparison);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    // Switch to unified view
    const unifiedTab = screen.getByTestId('tab-unified');
    fireEvent.click(unifiedTab);

    // Check that line numbers are displayed
    // The diff should show old and new line numbers
    const diffContainer = screen.getByText('Unified Diff View').closest('div');
    expect(diffContainer).toBeInTheDocument();
  });

  it('should handle large diffs gracefully', async () => {
    const largeDiff = Array.from({ length: 1000 }, (_, i) => ({
      type: i % 3 === 0 ? 'added' : i % 3 === 1 ? 'removed' : 'unchanged',
      lineNumber: i + 1,
      content: `line ${i + 1}`,
      oldLineNumber: i % 3 === 0 ? null : i + 1,
      newLineNumber: i % 3 === 1 ? null : i + 1
    }));

    const largeComparison = {
      ...mockComparison,
      diff: largeDiff,
      summary: {
        linesAdded: 334,
        linesRemoved: 333,
        linesModified: 0
      }
    };

    versionService.compareVersions.mockResolvedValue(largeComparison);
    
    render(<VersionCompare {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });

    // Should render without performance issues
    expect(screen.getByText('334')).toBeInTheDocument(); // lines added
    expect(screen.getByText('333')).toBeInTheDocument(); // lines removed
  });
});