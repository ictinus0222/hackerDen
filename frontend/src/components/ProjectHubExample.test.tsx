import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectHubExample } from './ProjectHubExample';

// Mock the ProjectHubContainer since we're testing the example wrapper
vi.mock('./ProjectHubContainer', () => ({
  ProjectHubContainer: ({ initialProject }: any) => (
    <div data-testid="project-hub-container">
      <h2>{initialProject.projectName}</h2>
      <p>{initialProject.oneLineIdea}</p>
    </div>
  )
}));

describe('ProjectHubExample', () => {
  it('should render the demo page with project hub', () => {
    render(<ProjectHubExample />);

    expect(screen.getByText('Project Hub Demo')).toBeInTheDocument();
    expect(screen.getByText('Features Demonstrated')).toBeInTheDocument();
    expect(screen.getByText('✅ Implemented')).toBeInTheDocument();
    expect(screen.getByText('🔄 API Operations')).toBeInTheDocument();
    
    // Check that the ProjectHubContainer is rendered with the example project
    expect(screen.getByTestId('project-hub-container')).toBeInTheDocument();
    expect(screen.getByText('HackerDen MVP')).toBeInTheDocument();
    expect(screen.getByText(/A focused hackathon management tool/)).toBeInTheDocument();
  });

  it('should display implemented features list', () => {
    render(<ProjectHubExample />);

    expect(screen.getByText('• API service functions for all project operations')).toBeInTheDocument();
    expect(screen.getByText('• Form submission handling with validation')).toBeInTheDocument();
    expect(screen.getByText('• Error handling and loading states')).toBeInTheDocument();
    expect(screen.getByText('• Success feedback for user actions')).toBeInTheDocument();
    expect(screen.getByText('• Integration tests for API interactions')).toBeInTheDocument();
  });

  it('should display API operations list', () => {
    render(<ProjectHubExample />);

    expect(screen.getByText('• Create new projects')).toBeInTheDocument();
    expect(screen.getByText('• Load project by ID')).toBeInTheDocument();
    expect(screen.getByText('• Update project information')).toBeInTheDocument();
    expect(screen.getByText('• Add team members')).toBeInTheDocument();
    expect(screen.getByText('• Remove team members')).toBeInTheDocument();
    expect(screen.getByText('• JWT token management')).toBeInTheDocument();
  });
});