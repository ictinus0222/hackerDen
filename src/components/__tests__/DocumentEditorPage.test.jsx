import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DocumentEditorPage from '../../pages/DocumentEditorPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { TeamProvider } from '../../contexts/TeamContext';

// Mock the services
vi.mock('../../services/documentService', () => ({
  documentService: {
    getDocument: vi.fn(),
    updateDocument: vi.fn()
  }
}));

vi.mock('../../hooks/useHackathonTeam', () => ({
  useHackathonTeam: vi.fn(() => ({
    team: { $id: 'team-1', name: 'Test Team' },
    loading: false,
    error: null
  }))
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { $id: 'user-1', name: 'Test User' }
  }))
}));

// Mock react-router-dom params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({
      hackathonId: 'hackathon-1',
      documentId: 'document-1'
    }),
    useNavigate: () => vi.fn()
  };
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <TeamProvider>
        {children}
      </TeamProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('DocumentEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <DocumentEditorPage />
      </TestWrapper>
    );

    expect(screen.getAllByText('Loading document...')[0]).toBeInTheDocument();
  });

  it('renders document editor when document loads successfully', async () => {
    const mockDocument = {
      $id: 'document-1',
      title: 'Test Document',
      content: '# Hello World\n\nThis is a test document.',
      createdByName: 'Test User',
      collaborators: ['user-1'],
      tags: ['test', 'demo'],
      $updatedAt: new Date().toISOString()
    };

    const { documentService } = await import('../../services/documentService');
    documentService.getDocument.mockResolvedValue(mockDocument);

    render(
      <TestWrapper>
        <DocumentEditorPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Document')).toBeInTheDocument();
    });

    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Created by Test User')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('demo')).toBeInTheDocument();
  });

  it('renders error state when document fails to load', async () => {
    const { documentService } = await import('../../services/documentService');
    documentService.getDocument.mockRejectedValue(new Error('Document not found'));

    render(
      <TestWrapper>
        <DocumentEditorPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error Loading Document')).toBeInTheDocument();
    });

    expect(screen.getByText('Document not found')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Back to Documents')).toBeInTheDocument();
  });

  it('renders not found state when document is null', async () => {
    const { documentService } = await import('../../services/documentService');
    documentService.getDocument.mockResolvedValue(null);

    render(
      <TestWrapper>
        <DocumentEditorPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Document Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText("The document you're looking for doesn't exist or you don't have permission to view it.")).toBeInTheDocument();
    expect(screen.getByText('Back to Documents')).toBeInTheDocument();
  });
});