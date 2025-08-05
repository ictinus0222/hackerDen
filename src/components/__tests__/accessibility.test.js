import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { TeamProvider } from '../../contexts/TeamContext';

// Components to test
import Layout from '../Layout';
import KanbanBoard from '../KanbanBoard';
import TaskCard from '../TaskCard';
import TaskModal from '../TaskModal';
import Chat from '../Chat';
import MessageInput from '../MessageInput';
import MessageItem from '../MessageItem';
import LoadingSpinner from '../LoadingSpinner';
import SkeletonLoader, { TaskCardSkeleton, MessageSkeleton } from '../SkeletonLoader';
import LoginPage from '../../pages/LoginPage';

// Mock hooks and services
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User', email: 'test@example.com' },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    error: null
  })
}));

vi.mock('../../hooks/useTeam', () => ({
  useTeam: () => ({
    team: { $id: 'team1', name: 'Test Team' }
  })
}));

vi.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    tasksByStatus: {
      todo: [],
      in_progress: [],
      blocked: [],
      done: []
    },
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}));

vi.mock('../../hooks/useMessages', () => ({
  useMessages: () => ({
    messages: [],
    loading: false,
    error: null,
    sending: false,
    sendMessage: vi.fn()
  })
}));

vi.mock('../../hooks/useTouchDragDrop', () => ({
  useTouchDragDrop: () => ({
    draggedItem: null,
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn()
  })
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <TeamProvider>
        {children}
      </TeamProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Accessibility Tests', () => {
  describe('Layout Component', () => {
    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <Layout>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'User navigation' })).toBeInTheDocument();
    });

    it('should have skip link for screen readers', () => {
      render(
        <TestWrapper>
          <Layout>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('skip-link');
    });

    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Layout>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const logoutButton = screen.getByRole('button', { name: /sign out/i });
      expect(logoutButton).toHaveAttribute('aria-label', 'Sign out of your account');
    });
  });

  describe('KanbanBoard Component', () => {
    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <KanbanBoard />
        </TestWrapper>
      );

      expect(screen.getByRole('region', { name: /kanban task board/i })).toBeInTheDocument();
      expect(screen.getByRole('toolbar', { name: 'Board actions' })).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(
        <TestWrapper>
          <KanbanBoard />
        </TestWrapper>
      );

      const createButton = screen.getByRole('button', { name: 'Create a new task' });
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveAttribute('type', 'button');
    });
  });

  describe('TaskCard Component', () => {
    const mockTask = {
      $id: 'task1',
      title: 'Test Task',
      description: 'Test description',
      status: 'todo',
      $createdAt: '2024-01-01T00:00:00.000Z',
      $updatedAt: '2024-01-01T00:00:00.000Z'
    };

    it('should have proper ARIA attributes', () => {
      render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
          aria-posinset={1}
          aria-setsize={3}
        />
      );

      const taskCard = screen.getByRole('button');
      expect(taskCard).toHaveAttribute('aria-posinset', '1');
      expect(taskCard).toHaveAttribute('aria-setsize', '3');
      expect(taskCard).toHaveAttribute('tabIndex', '0');
    });

    it('should have descriptive aria-label', () => {
      render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
        />
      );

      const taskCard = screen.getByRole('button');
      expect(taskCard).toHaveAttribute('aria-label', expect.stringContaining('Test Task'));
      expect(taskCard).toHaveAttribute('aria-label', expect.stringContaining('Status: To-Do'));
    });

    it('should have proper time elements', () => {
      render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
        />
      );

      const timeElements = screen.getAllByRole('time');
      expect(timeElements).toHaveLength(1);
      expect(timeElements[0]).toHaveAttribute('dateTime', mockTask.$createdAt);
    });
  });

  describe('TaskModal Component', () => {
    it('should have proper dialog attributes', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true}
            onClose={vi.fn()}
            onTaskCreated={vi.fn()}
          />
        </TestWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have proper form validation', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true}
            onClose={vi.fn()}
            onTaskCreated={vi.fn()}
          />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/task title/i);
      const descriptionInput = screen.getByLabelText(/task description/i);

      expect(titleInput).toHaveAttribute('required');
      expect(titleInput).toHaveAttribute('aria-invalid', 'false');
      expect(descriptionInput).toHaveAttribute('required');
      expect(descriptionInput).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Chat Component', () => {
    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <Chat />
        </TestWrapper>
      );

      expect(screen.getByRole('complementary', { name: 'Team chat' })).toBeInTheDocument();
      expect(screen.getByRole('log', { name: 'Chat messages' })).toBeInTheDocument();
    });
  });

  describe('MessageInput Component', () => {
    it('should have proper form structure', () => {
      render(
        <MessageInput 
          onSendMessage={vi.fn()}
          disabled={false}
          sending={false}
        />
      );

      const input = screen.getByLabelText('Type your message');
      const button = screen.getByRole('button', { name: 'Send message' });

      expect(input).toHaveAttribute('id', 'message-input');
      expect(input).toHaveAttribute('maxLength', '1000');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should show loading state properly', () => {
      render(
        <MessageInput 
          onSendMessage={vi.fn()}
          disabled={false}
          sending={true}
        />
      );

      const button = screen.getByRole('button', { name: 'Sending message...' });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Sending message...')).toHaveClass('sr-only');
    });
  });

  describe('MessageItem Component', () => {
    const mockMessage = {
      $id: 'msg1',
      content: 'Test message',
      type: 'user',
      userId: 'user1',
      userName: 'Test User',
      $createdAt: '2024-01-01T00:00:00.000Z'
    };

    it('should have proper article structure', () => {
      render(
        <MessageItem 
          message={mockMessage}
          currentUserId="user1"
        />
      );

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', expect.stringContaining('Message from you'));
    });

    it('should have proper time element', () => {
      render(
        <MessageItem 
          message={mockMessage}
          currentUserId="user1"
        />
      );

      const timeElement = screen.getByRole('time');
      expect(timeElement).toHaveAttribute('dateTime', mockMessage.$createdAt);
    });

    it('should handle system messages properly', () => {
      const systemMessage = {
        ...mockMessage,
        type: 'system',
        userId: null
      };

      render(
        <MessageItem 
          message={systemMessage}
          currentUserId="user1"
        />
      );

      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should have proper accessibility attributes', () => {
      render(<LoadingSpinner message="Loading test..." />);

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Loading test...')).toHaveClass('sr-only');
    });

    it('should support different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(document.querySelector('.spinner')).toBeInTheDocument();

      rerender(<LoadingSpinner size="lg" />);
      expect(document.querySelector('.spinner-lg')).toBeInTheDocument();
    });
  });

  describe('SkeletonLoader Components', () => {
    it('should have proper accessibility attributes', () => {
      render(<SkeletonLoader />);
      
      const skeleton = document.querySelector('.loading-skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render TaskCardSkeleton properly', () => {
      render(<TaskCardSkeleton />);
      
      const skeletons = document.querySelectorAll('.loading-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render MessageSkeleton properly', () => {
      render(<MessageSkeleton />);
      
      const skeletons = document.querySelectorAll('.loading-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('LoginPage Component', () => {
    beforeEach(() => {
      // Mock useAuth to return unauthenticated state for login page
      vi.doMock('../../hooks/useAuth', () => ({
        useAuth: () => ({
          user: null,
          login: vi.fn(),
          logout: vi.fn(),
          isAuthenticated: false,
          error: null
        })
      }));
    });

    it('should have proper form structure', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should have proper validation attributes', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation on TaskCard', async () => {
      const user = userEvent.setup();
      const mockOnDragStart = vi.fn();

      render(
        <TaskCard 
          task={{
            $id: 'task1',
            title: 'Test Task',
            description: 'Test description',
            status: 'todo',
            $createdAt: '2024-01-01T00:00:00.000Z',
            $updatedAt: '2024-01-01T00:00:00.000Z'
          }}
          onDragStart={mockOnDragStart}
        />
      );

      const taskCard = screen.getByRole('button');
      await user.tab();
      expect(taskCard).toHaveFocus();

      await user.keyboard('{Enter}');
      // Should handle Enter key (functionality can be extended)
    });

    it('should support keyboard navigation in forms', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true}
            onClose={vi.fn()}
            onTaskCreated={vi.fn()}
          />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/task title/i);
      const descriptionInput = screen.getByLabelText(/task description/i);
      const submitButton = screen.getByRole('button', { name: /create task/i });

      await user.tab();
      expect(titleInput).toHaveFocus();

      await user.tab();
      expect(descriptionInput).toHaveFocus();

      await user.tab();
      await user.tab(); // Skip cancel button
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should apply proper focus styles', () => {
      render(
        <TestWrapper>
          <Layout>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const logoutButton = screen.getByRole('button', { name: /sign out/i });
      expect(logoutButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-red-500');
    });

    it('should have proper error styling', () => {
      render(
        <TestWrapper>
          <TaskModal 
            isOpen={true}
            onClose={vi.fn()}
            onTaskCreated={vi.fn()}
          />
        </TestWrapper>
      );

      // Trigger validation error
      const form = screen.getByRole('form');
      fireEvent.submit(form);

      waitFor(() => {
        const errorElements = screen.getAllByRole('alert');
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });
  });
});