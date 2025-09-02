import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ChatContainer from '../ChatContainer';

// Mock the hooks and services
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      $id: 'user123',
      name: 'Test User'
    }
  })
}));

vi.mock('../../hooks/useMessages', () => ({
  useMessages: vi.fn(() => ({
    messages: [],
    loading: false,
    error: null,
    sending: false,
    hasMore: false,
    loadingMore: false,
    typingUsers: new Set(),
    retryQueue: [],
    connectionStatus: 'connected',
    sendMessage: vi.fn(),
    loadMoreMessages: vi.fn(),
    retryFailedMessage: vi.fn(),
    sendTypingIndicator: vi.fn(),
    stopTypingIndicator: vi.fn(),
    refreshMessages: vi.fn()
  }))
}));

// Mock react-error-boundary
vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }) => children
}));

const mockTeam = {
  $id: 'team123',
  teamName: 'Test Team'
};

const mockHackathon = {
  title: 'Test Hackathon'
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ChatContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat header with team and hackathon info', () => {
    renderWithRouter(
      <ChatContainer 
        hackathon={mockHackathon}
        team={mockTeam}
      />
    );

    expect(screen.getByText('Team Chat')).toBeInTheDocument();
    expect(screen.getByText('Test Team • Test Hackathon')).toBeInTheDocument();
  });

  it('shows connected status when no error', () => {
    renderWithRouter(
      <ChatContainer 
        hackathon={mockHackathon}
        team={mockTeam}
      />
    );

    expect(screen.getByText('connected')).toBeInTheDocument();
  });

  it('renders empty state when no messages', () => {
    renderWithRouter(
      <ChatContainer 
        hackathon={mockHackathon}
        team={mockTeam}
      />
    );

    expect(screen.getByText('Start the conversation')).toBeInTheDocument();
    expect(screen.getByText('Send your first message to get the team chat started!')).toBeInTheDocument();
  });

  it('renders message input', () => {
    renderWithRouter(
      <ChatContainer 
        hackathon={mockHackathon}
        team={mockTeam}
      />
    );

    expect(screen.getByPlaceholderText(/Type your message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/ })).toBeInTheDocument();
  });
});