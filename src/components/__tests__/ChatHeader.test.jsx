import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ChatHeader from '../ChatHeader';

// Create a mock that can be controlled per test
const mockUseHackathonTeamMembers = vi.fn();

// Mock the hooks
vi.mock('../../hooks/useHackathonTeamMembers', () => ({
  useHackathonTeamMembers: () => mockUseHackathonTeamMembers()
}));

// Mock utils
vi.mock('../../lib/utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

const mockHackathon = {
  $id: 'hackathon-123',
  title: 'Test Hackathon 2024'
};

const mockTeam = {
  $id: 'team-123',
  teamName: 'Awesome Team'
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ChatHeader', () => {
  beforeEach(() => {
    // Default mock return value
    mockUseHackathonTeamMembers.mockReturnValue({
      members: [
        { id: '1', name: 'John Doe', online: true },
        { id: '2', name: 'Jane Smith', online: true }
      ]
    });
  });

  it('renders team name and hackathon title', () => {
    renderWithRouter(
      <ChatHeader hackathon={mockHackathon} team={mockTeam} />
    );

    expect(screen.getByText('Awesome Team')).toBeInTheDocument();
    expect(screen.getAllByText('Test Hackathon 2024')).toHaveLength(2); // Appears in breadcrumb and header
  });

  it('displays online member count badge', () => {
    renderWithRouter(
      <ChatHeader hackathon={mockHackathon} team={mockTeam} />
    );

    expect(screen.getByText('2 online')).toBeInTheDocument();
  });

  it('renders breadcrumb navigation', () => {
    renderWithRouter(
      <ChatHeader hackathon={mockHackathon} team={mockTeam} />
    );

    expect(screen.getByText('Console')).toBeInTheDocument();
    expect(screen.getAllByText('Test Hackathon 2024')).toHaveLength(2); // Appears in breadcrumb and header
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('handles missing hackathon and team data gracefully', () => {
    // Mock empty members for this test
    mockUseHackathonTeamMembers.mockReturnValue({
      members: []
    });

    renderWithRouter(
      <ChatHeader hackathon={null} team={null} />
    );

    expect(screen.getByText('Team Chat')).toBeInTheDocument();
    expect(screen.getByText('Hackathon Event')).toBeInTheDocument();
    expect(screen.getByText('0 online')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = renderWithRouter(
      <ChatHeader 
        hackathon={mockHackathon} 
        team={mockTeam} 
        className="custom-class" 
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});