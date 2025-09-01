import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DocumentList from '../DocumentList';
import { documentService } from '../../services/documentService';

// Mock the document service
vi.mock('../../services/documentService', () => ({
  documentService: {
    getTeamDocuments: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn()
  }
}));

// Mock the auth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      $id: 'user123',
      name: 'Test User'
    }
  })
}));

// Mock LoadingSpinner
vi.mock('../LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

const mockDocuments = [
  {
    $id: 'doc1',
    title: 'Test Document 1',
    content: 'This is test content for document 1',
    tags: ['planning', 'frontend'],
    createdBy: 'user123',
    createdByName: 'Test User',
    lastModifiedBy: 'user123',
    lastModifiedByName: 'Test User',
    collaborators: ['user123'],
    permissions: {
      visibility: 'team',
      allowEdit: true,
      allowComment: true
    },
    contentVersion: 1,
    $createdAt: '2024-01-01T10:00:00.000Z',
    $updatedAt: '2024-01-01T10:30:00.000Z'
  },
  {
    $id: 'doc2',
    title: 'Test Document 2',
    content: 'This is test content for document 2',
    tags: ['backend', 'api'],
    createdBy: 'user456',
    createdByName: 'Another User',
    lastModifiedBy: 'user456',
    lastModifiedByName: 'Another User',
    collaborators: ['user456'],
    permissions: {
      visibility: 'team',
      allowEdit: true,
      allowComment: true
    },
    contentVersion: 2,
    $createdAt: '2024-01-02T10:00:00.000Z',
    $updatedAt: '2024-01-02T11:00:00.000Z'
  }
];

const renderDocumentList = (props = {}) => {
  const defaultProps = {
    teamId: 'team123',
    hackathonId: 'hackathon123',
    ...props
  };

  return render(
    <BrowserRouter>
      <DocumentList {...defaultProps} />
    </BrowserRouter>
  );
};

describe('DocumentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    documentService.getTeamDocuments.mockImplementation(() => new Promise(() => {}));
    
    renderDocumentList();
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders documents after loading', async () => {
    documentService.getTeamDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: 2
    });

    renderDocumentList();

    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      expect(screen.getByText('Test Document 2')).toBeInTheDocument();
    });

    expect(screen.getByText(/2 documents.*2 showing/)).toBeInTheDocument();
  });

  it('renders empty state when no documents', async () => {
    documentService.getTeamDocuments.mockResolvedValue({
      documents: [],
      total: 0
    });

    renderDocumentList();

    await waitFor(() => {
      expect(screen.getByText('No documents yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first team document to start collaborating')).toBeInTheDocument();
    });
  });

  it('filters documents by search term', async () => {
    documentService.getTeamDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: 2
    });

    renderDocumentList();

    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      expect(screen.getByText('Test Document 2')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(searchInput, { target: { value: 'Document 1' } });

    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Document 2')).not.toBeInTheDocument();
    });
  });

  it('opens create modal when New Document button is clicked', async () => {
    documentService.getTeamDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: 2
    });

    renderDocumentList();

    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    });

    const newDocButton = screen.getByText('New Document');
    fireEvent.click(newDocButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Document')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    const errorMessage = 'Failed to load documents';
    documentService.getTeamDocuments.mockRejectedValue(new Error(errorMessage));

    renderDocumentList();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('filters documents by tag', async () => {
    documentService.getTeamDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: 2
    });

    renderDocumentList();

    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      expect(screen.getByText('Test Document 2')).toBeInTheDocument();
    });

    // Open tag filter dropdown
    const tagFilter = screen.getByText('All Tags');
    fireEvent.click(tagFilter);

    // Select 'planning' tag
    await waitFor(() => {
      const planningOptions = screen.getAllByText('planning');
      // Click the first one (should be in the dropdown)
      fireEvent.click(planningOptions[0]);
    });

    // Should only show Document 1 which has 'planning' tag
    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Document 2')).not.toBeInTheDocument();
    });
  });

  it('sorts documents correctly', async () => {
    documentService.getTeamDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: 2
    });

    renderDocumentList();

    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    });

    // Open sort dropdown
    const sortFilter = screen.getByText('Last Modified');
    fireEvent.click(sortFilter);

    // Select title sorting
    await waitFor(() => {
      const titleOption = screen.getByText('Title A-Z');
      fireEvent.click(titleOption);
    });

    // Documents should be sorted by title
    await waitFor(() => {
      const documentCards = screen.getAllByRole('button', { name: /Document:/ });
      expect(documentCards[0]).toHaveAttribute('aria-label', expect.stringContaining('Test Document 1'));
      expect(documentCards[1]).toHaveAttribute('aria-label', expect.stringContaining('Test Document 2'));
    });
  });

  it('clears filters when clear button is clicked', async () => {
    documentService.getTeamDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: 2
    });

    renderDocumentList();

    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    });

    // Apply a search filter
    const searchInput = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(searchInput, { target: { value: 'Document 1' } });

    await waitFor(() => {
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    // Clear filters
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      expect(screen.getByText('Test Document 2')).toBeInTheDocument();
    });
  });
});