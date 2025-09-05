import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PublicSubmissionPage from '@/pages/PublicSubmissionPage';
import submissionService from '@/services/submissionService';

// Mock the submission service
vi.mock('@/services/submissionService', () => ({
  default: {
    getPublicSubmission: vi.fn()
  }
}));

// Mock react-router-dom useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ submissionId: 'test-submission-id' })
  };
});

const mockSubmission = {
  $id: 'test-submission-id',
  title: 'Test Project',
  description: 'This is a test project description',
  techStack: ['React', 'Node.js', 'MongoDB'],
  challenges: 'We faced some challenges',
  accomplishments: 'We accomplished great things',
  futureWork: 'Future plans include...',
  demoUrl: 'https://demo.example.com',
  repositoryUrl: 'https://github.com/test/repo',
  isFinalized: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  teamData: {
    teamName: 'Test Team',
    members: [
      {
        userId: 'user1',
        userName: 'John Doe',
        role: 'owner'
      }
    ],
    completedTasks: 5,
    totalTasks: 10,
    progress: {
      tasksCompleted: 5,
      filesShared: 3,
      ideasImplemented: 2
    }
  }
};

describe('PublicSubmissionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    submissionService.getPublicSubmission.mockImplementation(() => new Promise(() => {}));
    
    render(
      <BrowserRouter>
        <PublicSubmissionPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading submission...')).toBeInTheDocument();
  });

  it('renders submission data correctly', async () => {
    submissionService.getPublicSubmission.mockResolvedValue(mockSubmission);
    
    render(
      <BrowserRouter>
        <PublicSubmissionPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.getByText('This is a test project description')).toBeInTheDocument();
    expect(screen.getByText('Test Team')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
  });

  it('renders error state when submission not found', async () => {
    submissionService.getPublicSubmission.mockRejectedValue(new Error('Not found'));
    
    render(
      <BrowserRouter>
        <PublicSubmissionPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Submission Not Found')).toBeInTheDocument();
    });
  });

  it('shows finalized badge when submission is finalized', async () => {
    submissionService.getPublicSubmission.mockResolvedValue(mockSubmission);
    
    render(
      <BrowserRouter>
        <PublicSubmissionPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Finalized')).toBeInTheDocument();
    });
  });

  it('renders demo and repository links when available', async () => {
    submissionService.getPublicSubmission.mockResolvedValue(mockSubmission);
    
    render(
      <BrowserRouter>
        <PublicSubmissionPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const demoLink = screen.getByRole('link', { name: /live demo/i });
      const repoLink = screen.getByRole('link', { name: /source code/i });
      
      expect(demoLink).toHaveAttribute('href', 'https://demo.example.com');
      expect(repoLink).toHaveAttribute('href', 'https://github.com/test/repo');
    });
  });
});