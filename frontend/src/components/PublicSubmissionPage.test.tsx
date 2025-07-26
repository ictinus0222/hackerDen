import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicSubmissionPage } from './PublicSubmissionPage';
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

const mockTeamMembers = [
  { name: 'Alice Johnson', role: 'Frontend Developer' },
  { name: 'Bob Smith', role: 'Backend Developer' },
  { name: 'Carol Davis' }, // No role
];

describe('PublicSubmissionPage', () => {
  it('renders project information correctly', () => {
    render(
      <PublicSubmissionPage
        projectName="Awesome Hackathon Project"
        oneLineIdea="A revolutionary app that changes everything"
        teamMembers={mockTeamMembers}
        submission={mockSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByText('Awesome Hackathon Project')).toBeInTheDocument();
    expect(screen.getByText('A revolutionary app that changes everything')).toBeInTheDocument();
  });

  it('displays team members with roles', () => {
    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={mockSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('(Frontend Developer)')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('(Backend Developer)')).toBeInTheDocument();
    expect(screen.getByText('Carol Davis')).toBeInTheDocument();
    expect(screen.queryByText('(undefined)')).not.toBeInTheDocument();
  });

  it('renders GitHub repository link when provided', () => {
    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={mockSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    const githubLink = screen.getByRole('link', { name: /view on github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/test/repo');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders presentation link when provided', () => {
    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={mockSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    const presentationLink = screen.getByRole('link', { name: /view slides/i });
    expect(presentationLink).toBeInTheDocument();
    expect(presentationLink).toHaveAttribute('href', 'https://docs.google.com/presentation/d/test');
    expect(presentationLink).toHaveAttribute('target', '_blank');
  });

  it('renders demo video link when provided', () => {
    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={mockSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    const videoLink = screen.getByRole('link', { name: /watch on youtube/i });
    expect(videoLink).toBeInTheDocument();
    expect(videoLink).toHaveAttribute('href', 'https://youtube.com/watch?v=test');
    expect(videoLink).toHaveAttribute('target', '_blank');
  });

  it('does not render links when URLs are not provided', () => {
    const incompleteSubmission: SubmissionPackage = {
      ...mockSubmission,
      githubUrl: undefined,
      presentationUrl: undefined,
      demoVideoUrl: undefined,
      isComplete: false,
    };

    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={incompleteSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.queryByRole('link', { name: /view on github/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /view slides/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /watch on youtube/i })).not.toBeInTheDocument();
  });

  it('shows completion status for complete submission', () => {
    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={mockSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByText('Submission Complete')).toBeInTheDocument();
  });

  it('shows in-progress status for incomplete submission', () => {
    const incompleteSubmission: SubmissionPackage = {
      ...mockSubmission,
      isComplete: false,
    };

    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={incompleteSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByText('Submission In Progress')).toBeInTheDocument();
  });

  it('displays formatted generation date', () => {
    const generatedAt = new Date('2024-01-15T14:30:00Z');
    
    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={mockSubmission}
        generatedAt={generatedAt}
      />
    );

    expect(screen.getByText(/generated on/i)).toBeInTheDocument();
    expect(screen.getByText(/hackerden/i)).toBeInTheDocument();
  });

  it('handles different URL types with appropriate icons and labels', () => {
    const submissionWithDifferentUrls: SubmissionPackage = {
      ...mockSubmission,
      githubUrl: 'https://github.com/test/repo',
      presentationUrl: 'https://slides.google.com/presentation/d/test',
      demoVideoUrl: 'https://vimeo.com/123456789',
    };

    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={submissionWithDifferentUrls}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByRole('link', { name: /view on github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view slides/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /watch on vimeo/i })).toBeInTheDocument();
  });

  it('handles YouTube short URLs correctly', () => {
    const submissionWithYouTubeShort: SubmissionPackage = {
      ...mockSubmission,
      demoVideoUrl: 'https://youtu.be/abc123',
    };

    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={submissionWithYouTubeShort}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByRole('link', { name: /watch on youtube/i })).toBeInTheDocument();
  });

  it('handles empty team members array', () => {
    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={[]}
        submission={mockSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test idea')).toBeInTheDocument();
  });

  it('uses generic link label for unknown URL types', () => {
    const submissionWithGenericUrl: SubmissionPackage = {
      ...mockSubmission,
      presentationUrl: 'https://example.com/presentation',
    };

    render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={submissionWithGenericUrl}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByRole('link', { name: /open link/i })).toBeInTheDocument();
  });

  it('renders responsive layout classes', () => {
    const { container } = render(
      <PublicSubmissionPage
        projectName="Test Project"
        oneLineIdea="Test idea"
        teamMembers={mockTeamMembers}
        submission={mockSubmission}
        generatedAt={new Date('2024-01-01T12:00:00Z')}
      />
    );

    // Check for responsive grid classes
    expect(container.querySelector('.grid')).toBeInTheDocument();
    expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
  });
});