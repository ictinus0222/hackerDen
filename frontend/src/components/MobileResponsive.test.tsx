import { render, screen } from '@testing-library/react';
import { ProjectHub } from './ProjectHub';
import { TaskBoard } from './TaskBoard';
import { TaskModal } from './TaskModal';
import type { ProjectHub as ProjectHubType, TeamMember } from '../types';

// Mock data
const mockProject: ProjectHubType = {
  id: 'test-project',
  projectName: 'Test Project',
  oneLineIdea: 'A test project for mobile responsiveness',
  teamMembers: [
    { id: '1', name: 'John Doe', joinedAt: new Date() }
  ],
  deadlines: {
    hackingEnds: new Date(),
    submissionDeadline: new Date(),
    presentationTime: new Date()
  },
  judgingCriteria: [],
  pivotLog: []
};

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', joinedAt: new Date() }
];

describe('Mobile Responsiveness', () => {
  it('ProjectHub has mobile-responsive classes', () => {
    render(<ProjectHub project={mockProject} />);
    
    // Check for mobile-responsive padding
    const container = screen.getByText('Project Hub').closest('div')?.parentElement;
    expect(container).toHaveClass('p-4', 'sm:p-6');
    
    // Check for responsive text sizing
    const heading = screen.getByText('Project Hub');
    expect(heading).toHaveClass('text-2xl', 'sm:text-3xl');
  });

  it('TaskBoard has mobile-responsive layout', () => {
    render(<TaskBoard projectId="test" teamMembers={mockTeamMembers} />);
    
    // Check for responsive header layout
    const header = screen.getByText('Task Board').closest('div');
    expect(header).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    
    // Check for responsive text sizing
    const heading = screen.getByText('Task Board');
    expect(heading).toHaveClass('text-lg', 'sm:text-xl');
  });

  it('TaskModal has mobile-responsive layout', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        teamMembers={mockTeamMembers}
      />
    );
    
    // Check for responsive modal container
    const modal = screen.getByTestId('task-modal');
    expect(modal).toHaveClass('p-4');
    
    // Check for responsive modal content
    const modalContent = modal.firstChild as HTMLElement;
    expect(modalContent).toHaveClass('p-4', 'sm:p-6');
  });

  it('Components have touch-friendly interactions', () => {
    render(<TaskBoard projectId="test" teamMembers={mockTeamMembers} />);
    
    // Check for touch-manipulation class on interactive elements
    const addButton = screen.getByTestId('add-task-button');
    expect(addButton).toHaveClass('touch-manipulation');
  });
});