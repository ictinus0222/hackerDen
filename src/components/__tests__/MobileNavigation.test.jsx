import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Layout from '../Layout';
import { AuthContext } from '../../contexts/AuthContext';
import { TeamContext } from '../../contexts/TeamContext';

// Mock the hooks
vi.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    tasksByStatus: {
      todo: [{ id: '1' }],
      in_progress: [{ id: '2' }],
      done: [{ id: '3' }]
    }
  })
}));

vi.mock('../../hooks/useSwipeGesture', () => ({
  useSwipeGesture: () => ({
    elementRef: { current: null }
  })
}));

const mockAuthContext = {
  user: { name: 'Test User' },
  logout: vi.fn()
};

const mockTeamContext = {
  team: { name: 'Test Team' }
};

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContext}>
      <TeamContext.Provider value={mockTeamContext}>
        {children}
      </TeamContext.Provider>
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Mobile Navigation', () => {
  beforeEach(() => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('renders mobile header with navigation trigger', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    // Check for mobile header elements
    expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    expect(screen.getByText('HackerDen')).toBeInTheDocument();
  });

  it('opens mobile navigation sheet when trigger is clicked', async () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    const trigger = screen.getByLabelText('Open navigation menu');
    fireEvent.click(trigger);

    // Wait for sheet to open and check for navigation items
    await waitFor(() => {
      expect(screen.getByText('My Hackathons')).toBeInTheDocument();
      expect(screen.getByText('Team Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });
  });

  it('displays user profile in mobile navigation', async () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    const trigger = screen.getByLabelText('Open navigation menu');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Team Member')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('displays progress bar when tasks are available', async () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    const trigger = screen.getByLabelText('Open navigation menu');
    fireEvent.click(trigger);

    await waitFor(() => {
      // Progress bar should be visible with task completion info
      expect(screen.getByText(/1 of 3/)).toBeInTheDocument();
    });
  });

  it('has proper touch target sizes for mobile interactions', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    const trigger = screen.getByLabelText('Open navigation menu');
    
    // Check that the trigger has minimum touch target size
    expect(trigger).toHaveClass('min-h-[44px]');
    expect(trigger).toHaveClass('min-w-[44px]');
    expect(trigger).toHaveClass('touch-manipulation');
  });
});