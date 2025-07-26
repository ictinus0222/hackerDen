import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmissionPackage } from './SubmissionPackage';
import { submissionApi } from '../services/api';
import type { SubmissionPackage as SubmissionPackageType } from '../types';

// Mock the API
vi.mock('../services/api', () => ({
  submissionApi: {
    getByProject: vi.fn(),
    createOrUpdate: vi.fn(),
  },
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock submission data
const mockSubmission: SubmissionPackageType = {
  projectId: 'test-project-1',
  githubUrl: 'https://github.com/test/repo',
  presentationUrl: 'https://docs.google.com/presentation/d/test',
  demoVideoUrl: 'https://youtube.com/watch?v=test',
  generatedPageUrl: 'https://example.com/api/submission/test-project-1/public',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  isComplete: true,
};

describe('SubmissionPackage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(submissionApi.getByProject).mockResolvedValue(null);
    vi.mocked(submissionApi.createOrUpdate).mockResolvedValue(mockSubmission);
  });

  it('renders loading state initially', () => {
    render(<SubmissionPackage projectId="test-project-1" />);
    
    expect(screen.getByText('Loading submission data...')).toBeInTheDocument();
  });

  it('loads existing submission data on mount', async () => {
    vi.mocked(submissionApi.getByProject).mockResolvedValue(mockSubmission);
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(submissionApi.getByProject).toHaveBeenCalledWith('test-project-1');
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading submission data...')).not.toBeInTheDocument();
    });
  });

  it('handles loading error gracefully', async () => {
    vi.mocked(submissionApi.getByProject).mockRejectedValue(new Error('Network error'));
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load submission data')).toBeInTheDocument();
    });
  });

  it('renders submission form when loaded', async () => {
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/github repository url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/presentation slides url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/demo video url/i)).toBeInTheDocument();
    });
  });

  it('submits form data successfully', async () => {
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/github repository url/i)).toBeInTheDocument();
    });

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    await user.type(githubInput, 'https://github.com/test/repo');
    await user.type(presentationInput, 'https://docs.google.com/presentation/d/test');
    await user.click(submitButton);

    await waitFor(() => {
      expect(submissionApi.createOrUpdate).toHaveBeenCalledWith('test-project-1', {
        githubUrl: 'https://github.com/test/repo',
        presentationUrl: 'https://docs.google.com/presentation/d/test',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Submission package saved successfully!')).toBeInTheDocument();
    });
  });

  it('handles submission error', async () => {
    vi.mocked(submissionApi.createOrUpdate).mockRejectedValue(new Error('Submission failed'));
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/github repository url/i)).toBeInTheDocument();
    });

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    await user.type(githubInput, 'https://github.com/test/repo');
    await user.type(presentationInput, 'https://docs.google.com/presentation/d/test');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
  });

  it('shows public submission section when submission exists', async () => {
    vi.mocked(submissionApi.getByProject).mockResolvedValue(mockSubmission);
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Public Submission Page')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/api/submission/test-project-1/public')).toBeInTheDocument();
    });
  });



  it('shows preview link for public submission', async () => {
    vi.mocked(submissionApi.getByProject).mockResolvedValue(mockSubmission);
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Public Submission Page')).toBeInTheDocument();
    });

    const previewLink = screen.getByRole('link', { name: /preview/i });
    expect(previewLink).toHaveAttribute('href', 'https://example.com/api/submission/test-project-1/public');
    expect(previewLink).toHaveAttribute('target', '_blank');
    expect(previewLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows completion status for complete submission', async () => {
    vi.mocked(submissionApi.getByProject).mockResolvedValue(mockSubmission);
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Ready for submission')).toBeInTheDocument();
    });
  });

  it('shows incomplete status for incomplete submission', async () => {
    const incompleteSubmission: SubmissionPackageType = {
      ...mockSubmission,
      isComplete: false,
    };
    vi.mocked(submissionApi.getByProject).mockResolvedValue(incompleteSubmission);
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Incomplete - add required links above')).toBeInTheDocument();
    });
  });

  it('does not show public URL section when no submission exists', async () => {
    vi.mocked(submissionApi.getByProject).mockResolvedValue(null);
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.queryByText('Public Submission Page')).not.toBeInTheDocument();
    });
  });

  it('shows message when no public URL is generated yet', async () => {
    const submissionWithoutUrl: SubmissionPackageType = {
      ...mockSubmission,
      generatedPageUrl: undefined,
    };
    vi.mocked(submissionApi.getByProject).mockResolvedValue(submissionWithoutUrl);
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Save your submission package to generate a public URL')).toBeInTheDocument();
    });
  });



  it('updates form with new submission data after successful save', async () => {
    const updatedSubmission: SubmissionPackageType = {
      ...mockSubmission,
      demoVideoUrl: 'https://youtube.com/watch?v=updated',
    };
    vi.mocked(submissionApi.createOrUpdate).mockResolvedValue(updatedSubmission);
    
    render(<SubmissionPackage projectId="test-project-1" />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/github repository url/i)).toBeInTheDocument();
    });

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const demoInput = screen.getByLabelText(/demo video url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    await user.type(githubInput, 'https://github.com/test/repo');
    await user.type(presentationInput, 'https://docs.google.com/presentation/d/test');
    await user.type(demoInput, 'https://youtube.com/watch?v=updated');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submission package saved successfully!')).toBeInTheDocument();
    });
  });
});