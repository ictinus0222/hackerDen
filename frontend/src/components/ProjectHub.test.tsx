import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectHub } from './ProjectHub';
import type { ProjectHub as ProjectHubType } from '../types';

const mockProject: ProjectHubType = {
  projectId: 'project-1',
  projectName: 'AI-Powered Task Manager',
  oneLineIdea: 'A smart task management app that uses AI to prioritize and organize your daily tasks.',
  teamMembers: [
    {
      id: 'member-1',
      name: 'John Doe',
      role: 'Frontend Developer',
      joinedAt: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: 'member-2',
      name: 'Jane Smith',
      role: 'Backend Developer',
      joinedAt: new Date('2024-01-16T10:00:00Z')
    }
  ],
  deadlines: {
    hackingEnds: new Date('2024-02-15T18:00:00Z'),
    submissionDeadline: new Date('2024-02-15T20:00:00Z'),
    presentationTime: new Date('2024-02-16T10:00:00Z')
  },
  judgingCriteria: [
    {
      id: 'criterion-1',
      name: 'Business Potential',
      description: 'How viable is this as a business?',
      completed: true
    },
    {
      id: 'criterion-2',
      name: 'Technical Innovation',
      completed: false
    }
  ],
  pivotLog: [
    {
      id: 'pivot-1',
      description: 'Changed from mobile app to web app',
      reason: 'Better cross-platform compatibility',
      timestamp: new Date('2024-01-17T14:00:00Z')
    }
  ]
};

describe('ProjectHub', () => {
  it('renders project hub with all sections', () => {
    render(<ProjectHub project={mockProject} />);
    
    expect(screen.getByText('Project Hub')).toBeInTheDocument();
    expect(screen.getByText('Your team\'s central command center')).toBeInTheDocument();
    expect(screen.getByText('Project Vitals')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Team Members' })).toBeInTheDocument();
    expect(screen.getByText('Key Deadlines')).toBeInTheDocument();
    expect(screen.getByText('Judging Criteria')).toBeInTheDocument();
    expect(screen.getByText('Project Overview')).toBeInTheDocument();
  });

  it('displays project name and idea correctly', () => {
    render(<ProjectHub project={mockProject} />);
    
    expect(screen.getByText('AI-Powered Task Manager')).toBeInTheDocument();
    expect(screen.getByText('A smart task management app that uses AI to prioritize and organize your daily tasks.')).toBeInTheDocument();
  });

  it('shows edit button for project vitals when canEdit is true', () => {
    render(<ProjectHub project={mockProject} canEdit={true} />);
    
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('does not show edit buttons when canEdit is false', () => {
    render(<ProjectHub project={mockProject} canEdit={false} />);
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('enters edit mode for project vitals when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectHub project={mockProject} canEdit={true} />);
    
    const editButton = screen.getAllByText('Edit')[0]; // First edit button (project vitals)
    await user.click(editButton);
    
    expect(screen.getByLabelText(/Project Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/One-Sentence Idea/)).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('updates project vitals when form is submitted', async () => {
    const onUpdateProject = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ProjectHub 
        project={mockProject} 
        onUpdateProject={onUpdateProject}
        canEdit={true} 
      />
    );
    
    const editButton = screen.getAllByText('Edit')[0];
    await user.click(editButton);
    
    const nameInput = screen.getByDisplayValue('AI-Powered Task Manager');
    await user.clear(nameInput);
    await user.type(nameInput, 'Smart Task Organizer');
    
    await user.click(screen.getByText('Save Changes'));
    
    expect(onUpdateProject).toHaveBeenCalledWith({
      projectName: 'Smart Task Organizer',
      oneLineIdea: mockProject.oneLineIdea
    });
  });

  it('cancels project vitals edit without saving', async () => {
    const onUpdateProject = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ProjectHub 
        project={mockProject} 
        onUpdateProject={onUpdateProject}
        canEdit={true} 
      />
    );
    
    const editButton = screen.getAllByText('Edit')[0];
    await user.click(editButton);
    
    const nameInput = screen.getByDisplayValue('AI-Powered Task Manager');
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');
    
    await user.click(screen.getByText('Cancel'));
    
    expect(onUpdateProject).not.toHaveBeenCalled();
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  it('disables save button when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<ProjectHub project={mockProject} canEdit={true} />);
    
    const editButton = screen.getAllByText('Edit')[0];
    await user.click(editButton);
    
    const nameInput = screen.getByDisplayValue('AI-Powered Task Manager');
    await user.clear(nameInput);
    
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeDisabled();
  });

  it('displays project statistics correctly', () => {
    render(<ProjectHub project={mockProject} />);
    
    // Check for specific statistics in the Project Overview section
    const overviewSection = screen.getByText('Project Overview').closest('div');
    expect(overviewSection).toHaveTextContent('2'); // Team members count
    expect(overviewSection).toHaveTextContent('1'); // Criteria addressed count
    expect(overviewSection).toHaveTextContent('1'); // Pivots logged count
  });

  it('updates team members when member is added', async () => {
    const onUpdateProject = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ProjectHub 
        project={mockProject} 
        onUpdateProject={onUpdateProject}
        canEdit={true} 
      />
    );
    
    await user.click(screen.getByText('Add Member'));
    
    const nameInput = screen.getByLabelText(/Name/);
    await user.type(nameInput, 'Bob Wilson');
    
    const addButtons = screen.getAllByText('Add Member');
    await user.click(addButtons[1]); // Click the submit button
    
    expect(onUpdateProject).toHaveBeenCalledWith({
      teamMembers: [
        ...mockProject.teamMembers,
        expect.objectContaining({
          name: 'Bob Wilson',
          joinedAt: expect.any(Date)
        })
      ]
    });
  });

  it('updates team members when member is removed', async () => {
    const onUpdateProject = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ProjectHub 
        project={mockProject} 
        onUpdateProject={onUpdateProject}
        canEdit={true} 
      />
    );
    
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);
    
    expect(onUpdateProject).toHaveBeenCalledWith({
      teamMembers: [mockProject.teamMembers[1]]
    });
  });

  it('updates deadlines when deadline manager saves changes', async () => {
    const onUpdateProject = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ProjectHub 
        project={mockProject} 
        onUpdateProject={onUpdateProject}
        canEdit={true} 
      />
    );
    
    await user.click(screen.getByText('Edit Deadlines'));
    
    const hackingEndsInput = screen.getByLabelText('Hacking Ends');
    await user.clear(hackingEndsInput);
    await user.type(hackingEndsInput, '2024-02-15T19:00');
    
    await user.click(screen.getByText('Save Changes'));
    
    expect(onUpdateProject).toHaveBeenCalledWith({
      deadlines: expect.objectContaining({
        hackingEnds: expect.any(Date),
        submissionDeadline: mockProject.deadlines.submissionDeadline,
        presentationTime: mockProject.deadlines.presentationTime
      })
    });
  });

  it('updates judging criteria when criteria are modified', async () => {
    const onUpdateProject = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ProjectHub 
        project={mockProject} 
        onUpdateProject={onUpdateProject}
        canEdit={true} 
      />
    );
    
    // Click on incomplete criterion to mark as complete
    await user.click(screen.getByText('Technical Innovation'));
    
    expect(onUpdateProject).toHaveBeenCalledWith({
      judgingCriteria: [
        mockProject.judgingCriteria[0],
        { ...mockProject.judgingCriteria[1], completed: true }
      ]
    });
  });

  it('updates project vitals when props change', () => {
    const { rerender } = render(<ProjectHub project={mockProject} />);
    
    const updatedProject = {
      ...mockProject,
      projectName: 'Updated Project Name'
    };
    
    rerender(<ProjectHub project={updatedProject} />);
    
    expect(screen.getByText('Updated Project Name')).toBeInTheDocument();
  });

  it('renders responsive layout with proper styling', () => {
    render(<ProjectHub project={mockProject} />);
    
    const container = screen.getByText('Project Hub').closest('div')?.parentElement;
    expect(container).toHaveClass('max-w-4xl', 'mx-auto', 'p-6', 'space-y-8');
  });

  it('shows proper section styling', () => {
    render(<ProjectHub project={mockProject} />);
    
    const projectVitalsSection = screen.getByText('Project Vitals').closest('div')?.parentElement;
    expect(projectVitalsSection).toHaveClass('bg-white', 'rounded-lg', 'border', 'p-6');
  });

  it('displays all team members in the list', () => {
    render(<ProjectHub project={mockProject} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
  });

  it('displays all judging criteria', () => {
    render(<ProjectHub project={mockProject} />);
    
    expect(screen.getByText('Business Potential')).toBeInTheDocument();
    expect(screen.getByText('Technical Innovation')).toBeInTheDocument();
    expect(screen.getByText('How viable is this as a business?')).toBeInTheDocument();
  });

  it('shows correct completion percentage for criteria', () => {
    render(<ProjectHub project={mockProject} />);
    
    expect(screen.getByText('1 of 2 criteria addressed (50%)')).toBeInTheDocument();
  });
});