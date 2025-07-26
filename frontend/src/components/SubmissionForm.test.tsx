import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmissionForm } from './SubmissionForm';
import type { SubmissionPackage } from '../types';

// Mock submission data
const mockSubmission: SubmissionPackage = {
  projectId: 'test-project-1',
  githubUrl: 'https://github.com/test/repo',
  presentationUrl: 'https://docs.google.com/presentation/d/test',
  demoVideoUrl: 'https://youtube.com/watch?v=test',
  generatedPageUrl: 'https://example.com/submission/test-project-1/public',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  isComplete: true,
};

describe('SubmissionForm', () => {
  const mockOnSubmit = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/github repository url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/presentation slides url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/demo video url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save submission package/i })).toBeInTheDocument();
  });

  it('shows completion status with empty form', () => {
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('0/2 required fields')).toBeInTheDocument();
    expect(screen.getByText('Completion Status')).toBeInTheDocument();
  });

  it('updates completion status when required fields are filled', async () => {
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={mockOnSubmit}
      />
    );

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);

    await user.type(githubInput, 'https://github.com/test/repo');
    await user.type(presentationInput, 'https://docs.google.com/presentation/d/test');

    expect(screen.getByText('2/2 required fields')).toBeInTheDocument();
    expect(screen.getByText('Ready for submission!')).toBeInTheDocument();
  });

  it('populates form with initial data', () => {
    render(
      <SubmissionForm
        projectId="test-project-1"
        initialData={mockSubmission}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByDisplayValue('https://github.com/test/repo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://docs.google.com/presentation/d/test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://youtube.com/watch?v=test')).toBeInTheDocument();
  });

  it('allows empty optional fields', async () => {
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={mockOnSubmit}
      />
    );

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    await user.type(githubInput, 'https://github.com/test/repo');
    await user.type(presentationInput, 'https://docs.google.com/presentation/d/test');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        githubUrl: 'https://github.com/test/repo',
        presentationUrl: 'https://docs.google.com/presentation/d/test',
      });
    });
  });

  it('includes demo video URL when provided', async () => {
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={mockOnSubmit}
      />
    );

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const demoInput = screen.getByLabelText(/demo video url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    await user.type(githubInput, 'https://github.com/test/repo');
    await user.type(presentationInput, 'https://docs.google.com/presentation/d/test');
    await user.type(demoInput, 'https://youtube.com/watch?v=test');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        githubUrl: 'https://github.com/test/repo',
        presentationUrl: 'https://docs.google.com/presentation/d/test',
        demoVideoUrl: 'https://youtube.com/watch?v=test',
      });
    });
  });

  it('trims whitespace from URLs', async () => {
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={mockOnSubmit}
      />
    );

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    await user.type(githubInput, '  https://github.com/test/repo  ');
    await user.type(presentationInput, '  https://docs.google.com/presentation/d/test  ');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        githubUrl: 'https://github.com/test/repo',
        presentationUrl: 'https://docs.google.com/presentation/d/test',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const slowOnSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={slowOnSubmit}
      />
    );

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    await user.type(githubInput, 'https://github.com/test/repo');
    await user.type(presentationInput, 'https://docs.google.com/presentation/d/test');
    await user.click(submitButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Save Submission Package')).toBeInTheDocument();
    });
  });

  it('disables form when loading prop is true', () => {
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const demoInput = screen.getByLabelText(/demo video url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    expect(githubInput).toBeDisabled();
    expect(presentationInput).toBeDisabled();
    expect(demoInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('handles submission errors gracefully', async () => {
    const errorOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    
    render(
      <SubmissionForm
        projectId="test-project-1"
        onSubmit={errorOnSubmit}
      />
    );

    const githubInput = screen.getByLabelText(/github repository url/i);
    const presentationInput = screen.getByLabelText(/presentation slides url/i);
    const submitButton = screen.getByRole('button', { name: /save submission package/i });

    await user.type(githubInput, 'https://github.com/test/repo');
    await user.type(presentationInput, 'https://docs.google.com/presentation/d/test');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Save Submission Package')).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('accepts various valid URL formats', async () => {
    const testCases = [
      'https://github.com/user/repo',
      'http://example.com',
      'https://docs.google.com/presentation/d/abc123/edit',
      'https://youtube.com/watch?v=abc123',
      'https://vimeo.com/123456789',
    ];

    for (const url of testCases) {
      const { unmount } = render(
        <SubmissionForm
          projectId="test-project-1"
          onSubmit={mockOnSubmit}
        />
      );

      const githubInput = screen.getByLabelText(/github repository url/i);
      const submitButton = screen.getByRole('button', { name: /save submission package/i });

      await user.type(githubInput, url);
      await user.click(submitButton);

      expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
      
      // Clean up for next iteration
      unmount();
      vi.clearAllMocks();
    }
  });
});