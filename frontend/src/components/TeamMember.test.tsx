import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamMember, TeamMemberList } from './TeamMember';
import type { TeamMember as TeamMemberType } from '../types';

const mockTeamMember: TeamMemberType = {
  id: 'member-1',
  name: 'John Doe',
  role: 'Frontend Developer',
  joinedAt: new Date('2024-01-15T10:00:00Z')
};

describe('TeamMember', () => {
  it('renders team member information correctly', () => {
    render(<TeamMember member={mockTeamMember} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText(/Joined/)).toBeInTheDocument();
  });

  it('renders without role when role is not provided', () => {
    const memberWithoutRole = { ...mockTeamMember, role: undefined };
    render(<TeamMember member={memberWithoutRole} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
  });

  it('shows remove button when canRemove is true and onRemove is provided', () => {
    const onRemove = vi.fn();
    render(<TeamMember member={mockTeamMember} onRemove={onRemove} canRemove={true} />);
    
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('does not show remove button when canRemove is false', () => {
    const onRemove = vi.fn();
    render(<TeamMember member={mockTeamMember} onRemove={onRemove} canRemove={false} />);
    
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    
    render(<TeamMember member={mockTeamMember} onRemove={onRemove} canRemove={true} />);
    
    await user.click(screen.getByText('Remove'));
    expect(onRemove).toHaveBeenCalledWith('member-1');
  });

  it('has proper accessibility attributes', () => {
    const onRemove = vi.fn();
    render(<TeamMember member={mockTeamMember} onRemove={onRemove} canRemove={true} />);
    
    const removeButton = screen.getByText('Remove');
    expect(removeButton).toHaveAttribute('aria-label', 'Remove John Doe');
  });
});

describe('TeamMemberList', () => {
  const mockMembers: TeamMemberType[] = [
    mockTeamMember,
    {
      id: 'member-2',
      name: 'Jane Smith',
      role: 'Backend Developer',
      joinedAt: new Date('2024-01-16T10:00:00Z')
    }
  ];

  it('renders list of team members', () => {
    render(<TeamMemberList members={mockMembers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  it('shows add member button when canManageMembers is true', () => {
    render(<TeamMemberList members={mockMembers} canManageMembers={true} />);
    
    expect(screen.getByText('Add Member')).toBeInTheDocument();
  });

  it('does not show add member button when canManageMembers is false', () => {
    render(<TeamMemberList members={mockMembers} canManageMembers={false} />);
    
    expect(screen.queryByText('Add Member')).not.toBeInTheDocument();
  });

  it('opens add member form when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<TeamMemberList members={mockMembers} canManageMembers={true} />);
    
    await user.click(screen.getByText('Add Member'));
    
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('adds new member when form is submitted', async () => {
    const onAddMember = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TeamMemberList 
        members={mockMembers} 
        onAddMember={onAddMember}
        canManageMembers={true} 
      />
    );
    
    await user.click(screen.getByText('Add Member'));
    
    const nameInput = screen.getByLabelText(/Name/);
    const roleInput = screen.getByLabelText(/Role/);
    
    await user.type(nameInput, 'Bob Wilson');
    await user.type(roleInput, 'Designer');
    
    const submitButtons = screen.getAllByRole('button', { name: /add member/i });
    await user.click(submitButtons[1]); // Click the submit button (second one)
    
    expect(onAddMember).toHaveBeenCalledWith('Bob Wilson', 'Designer');
  });

  it('adds member without role when role is empty', async () => {
    const onAddMember = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TeamMemberList 
        members={mockMembers} 
        onAddMember={onAddMember}
        canManageMembers={true} 
      />
    );
    
    await user.click(screen.getByText('Add Member'));
    
    const nameInput = screen.getByLabelText(/Name/);
    await user.type(nameInput, 'Alice Brown');
    
    const submitButtons = screen.getAllByRole('button', { name: /add member/i });
    await user.click(submitButtons[1]); // Click the submit button (second one)
    
    expect(onAddMember).toHaveBeenCalledWith('Alice Brown', undefined);
  });

  it('does not add member when name is empty', async () => {
    const onAddMember = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TeamMemberList 
        members={mockMembers} 
        onAddMember={onAddMember}
        canManageMembers={true} 
      />
    );
    
    await user.click(screen.getByText('Add Member'));
    const submitButtons = screen.getAllByRole('button', { name: /add member/i });
    await user.click(submitButtons[1]); // Click the submit button (second one)
    
    expect(onAddMember).not.toHaveBeenCalled();
  });

  it('cancels add member form', async () => {
    const user = userEvent.setup();
    render(<TeamMemberList members={mockMembers} canManageMembers={true} />);
    
    await user.click(screen.getByText('Add Member'));
    
    const nameInput = screen.getByLabelText(/Name/);
    await user.type(nameInput, 'Test Name');
    
    await user.click(screen.getByText('Cancel'));
    
    expect(screen.queryByLabelText(/Name/)).not.toBeInTheDocument();
  });

  it('calls onRemoveMember when member is removed', async () => {
    const onRemoveMember = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TeamMemberList 
        members={mockMembers} 
        onRemoveMember={onRemoveMember}
        canManageMembers={true} 
      />
    );
    
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);
    
    expect(onRemoveMember).toHaveBeenCalledWith('member-1');
  });

  it('clears form after successful submission', async () => {
    const onAddMember = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TeamMemberList 
        members={mockMembers} 
        onAddMember={onAddMember}
        canManageMembers={true} 
      />
    );
    
    await user.click(screen.getByText('Add Member'));
    
    const nameInput = screen.getByLabelText(/Name/);
    const roleInput = screen.getByLabelText(/Role/);
    
    await user.type(nameInput, 'Test User');
    await user.type(roleInput, 'Test Role');
    
    const submitButtons = screen.getAllByRole('button', { name: /add member/i });
    await user.click(submitButtons[1]); // Click the submit button (second one)
    
    // Form should be closed after submission
    expect(screen.queryByLabelText(/Name/)).not.toBeInTheDocument();
  });
});