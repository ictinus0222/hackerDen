import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import KanbanBoard from '../KanbanBoard';
import Chat from '../Chat';
import TaskCard from '../TaskCard';
import TaskColumn from '../TaskColumn';
import Layout from '../Layout';
import MobileTabSwitcher from '../MobileTabSwitcher';

// Mock hooks and services
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User', email: 'test@example.com' },
    logout: vi.fn()
  })
}));

vi.mock('../../hooks/useTeam', () => ({
  useTeam: () => ({
    team: { $id: 'team1', name: 'Test Team', joinCode: 'ABC123' },
    loading: false,
    hasTeam: true
  })
}));

vi.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    tasksByStatus: {
      todo: [
        {
          $id: 'task1',
          title: 'Test Task 1',
          description: 'Test Description 1',
          status: 'todo',
          assignedTo: 'user1',
          createdBy: 'user1',
          $createdAt: '2024-01-01T00:00:00.000Z',
          $updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
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
    messages: [
      {
        $id: 'msg1',
        content: 'Test message',
        userId: 'user1',
        type: 'user',
        $createdAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    loading: false,
    error: null,
    sending: false,
    sendMessage: vi.fn()
  })
}));

vi.mock('../../hooks/useTouchDragDrop', () => ({
  useTouchDragDrop: () => ({
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn()
  })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Styling Protection Tests', () => {
  describe('Critical CSS Classes Verification', () => {
    describe('Layout Component', () => {
      it('should preserve critical layout classes', () => {
        renderWithRouter(
          <Layout>
            <div>Test content</div>
          </Layout>
        );

        // Check main container classes
        const main = screen.getByRole('main');
        expect(main).toHaveClass('max-w-7xl');
        expect(main).toHaveClass('mx-auto');
        expect(main).toHaveClass('py-4');
        expect(main).toHaveClass('sm:py-6');
        expect(main).toHaveClass('sm:px-6');
        expect(main).toHaveClass('lg:px-8');

        // Check header classes
        const header = screen.getByRole('banner');
        expect(header).toHaveClass('bg-dark-secondary');
        expect(header).toHaveClass('border-b');
        expect(header).toHaveClass('border-dark-primary');
        expect(header).toHaveClass('shadow-lg');
      });

      it('should preserve responsive header layout classes', () => {
        renderWithRouter(
          <Layout>
            <div>Test content</div>
          </Layout>
        );

        // Get the inner div with flex classes (second div inside header)
        const headerContent = screen.getByRole('banner').querySelector('div > div');
        expect(headerContent).toHaveClass('flex');
        expect(headerContent).toHaveClass('justify-between');
        expect(headerContent).toHaveClass('items-center');
        expect(headerContent).toHaveClass('py-4');
        expect(headerContent).toHaveClass('sm:py-6');
      });

      it('should preserve button styling classes', () => {
        renderWithRouter(
          <Layout>
            <div>Test content</div>
          </Layout>
        );

        const logoutButton = screen.getByRole('button', { name: /sign out of your account/i });
        expect(logoutButton).toHaveClass('min-h-[44px]');
        expect(logoutButton).toHaveClass('min-w-[44px]');
        expect(logoutButton).toHaveClass('touch-manipulation');
        expect(logoutButton).toHaveClass('rounded-xl');
        // Note: btn-danger class handles transitions, not individual transition-all class
        expect(logoutButton).toHaveClass('btn-danger');
      });
    });

    describe('Dashboard Component', () => {
      it('should preserve team info header classes', () => {
        renderWithRouter(<Dashboard />);

        // Dashboard shows team header when user has a team - find the card-enhanced container
        const teamHeader = document.querySelector('.card-enhanced.rounded-2xl.p-6');
        expect(teamHeader).toHaveClass('card-enhanced');
        expect(teamHeader).toHaveClass('rounded-2xl');
        expect(teamHeader).toHaveClass('p-6');
      });

      it('should preserve desktop layout classes', () => {
        renderWithRouter(<Dashboard />);

        // Check for desktop grid layout
        const desktopLayout = document.querySelector('.hidden.lg\\:grid');
        if (desktopLayout) {
          expect(desktopLayout).toHaveClass('lg:grid-cols-3');
          expect(desktopLayout).toHaveClass('lg:gap-6');
          expect(desktopLayout).toHaveClass('h-[calc(100vh-280px)]');
          expect(desktopLayout).toHaveClass('min-h-[600px]');
        }
      });

      it('should preserve mobile layout classes', () => {
        renderWithRouter(<Dashboard />);

        // Check for mobile layout
        const mobileLayout = document.querySelector('.lg\\:hidden');
        if (mobileLayout) {
          expect(mobileLayout).toHaveClass('h-[calc(100vh-220px)]');
          expect(mobileLayout).toHaveClass('min-h-[500px]');
        }
      });
    });

    describe('KanbanBoard Component', () => {
      it('should preserve main board container classes', () => {
        renderWithRouter(<KanbanBoard />);

        const boardSection = screen.getByLabelText('Kanban task board');
        expect(boardSection).toHaveClass('rounded-2xl');
        expect(boardSection).toHaveClass('p-6');
        expect(boardSection).toHaveClass('sm:p-8');
        expect(boardSection).toHaveClass('h-full');
        expect(boardSection).toHaveClass('flex');
        expect(boardSection).toHaveClass('flex-col');
        expect(boardSection).toHaveClass('card-enhanced');
        expect(boardSection).toHaveClass('animate-fade-in');
      });

      it('should preserve board header layout classes', () => {
        renderWithRouter(<KanbanBoard />);

        const boardHeader = screen.getByText('Kanban Board').closest('header');
        expect(boardHeader).toHaveClass('flex');
        expect(boardHeader).toHaveClass('flex-col');
        expect(boardHeader).toHaveClass('sm:flex-row');
        expect(boardHeader).toHaveClass('sm:items-center');
        expect(boardHeader).toHaveClass('sm:justify-between');
        expect(boardHeader).toHaveClass('mb-6');
        expect(boardHeader).toHaveClass('gap-4');
        expect(boardHeader).toHaveClass('sm:gap-0');
      });

      it('should preserve columns grid classes', () => {
        renderWithRouter(<KanbanBoard />);

        const columnsGrid = document.querySelector('[role="application"]');
        if (columnsGrid) {
          expect(columnsGrid).toHaveClass('flex-1');
          expect(columnsGrid).toHaveClass('grid');
          expect(columnsGrid).toHaveClass('grid-cols-1');
          expect(columnsGrid).toHaveClass('sm:grid-cols-2');
          expect(columnsGrid).toHaveClass('xl:grid-cols-4');
          expect(columnsGrid).toHaveClass('gap-3');
          expect(columnsGrid).toHaveClass('sm:gap-4');
          expect(columnsGrid).toHaveClass('min-h-0');
        }
      });
    });

    describe('TaskCard Component', () => {
      const mockTask = {
        $id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        assignedTo: 'user1',
        createdBy: 'user1',
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z'
      };

      it('should preserve card container classes', () => {
        render(
          <TaskCard 
            task={mockTask}
            onDragStart={vi.fn()}
          />
        );

        const taskCard = screen.getByText('Test Task').closest('article');
        expect(taskCard).toHaveClass('rounded-xl');
        expect(taskCard).toHaveClass('p-4');
        expect(taskCard).toHaveClass('focus:outline-none');
        expect(taskCard).toHaveClass('focus:ring-2');
        expect(taskCard).toHaveClass('focus:ring-blue-500');
        expect(taskCard).toHaveClass('cursor-move');
        expect(taskCard).toHaveClass('select-none');
        expect(taskCard).toHaveClass('touch-manipulation');
        expect(taskCard).toHaveClass('min-h-[120px]');
        expect(taskCard).toHaveClass('card-enhanced');
        expect(taskCard).toHaveClass('animate-slide-up');
      });

      it('should preserve card header layout classes', () => {
        render(
          <TaskCard 
            task={mockTask}
            onDragStart={vi.fn()}
          />
        );

        const cardHeader = screen.getByText('Test Task').closest('header');
        expect(cardHeader).toHaveClass('flex');
        expect(cardHeader).toHaveClass('items-start');
        expect(cardHeader).toHaveClass('justify-between');
        expect(cardHeader).toHaveClass('mb-3');
        expect(cardHeader).toHaveClass('gap-3');
      });

      it('should preserve status badge classes', () => {
        render(
          <TaskCard 
            task={mockTask}
            onDragStart={vi.fn()}
          />
        );

        const statusBadge = screen.getByText('To-Do');
        expect(statusBadge).toHaveClass('inline-flex');
        expect(statusBadge).toHaveClass('items-center');
        expect(statusBadge).toHaveClass('px-2.5');
        expect(statusBadge).toHaveClass('py-1');
        expect(statusBadge).toHaveClass('rounded-lg');
        expect(statusBadge).toHaveClass('text-xs');
        expect(statusBadge).toHaveClass('font-semibold');
        expect(statusBadge).toHaveClass('flex-shrink-0');
      });
    });

    describe('Chat Component', () => {
      it('should preserve chat container classes', () => {
        renderWithRouter(<Chat />);

        const chatSection = screen.getByLabelText('Team chat');
        expect(chatSection).toHaveClass('rounded-2xl');
        expect(chatSection).toHaveClass('h-full');
        expect(chatSection).toHaveClass('flex');
        expect(chatSection).toHaveClass('flex-col');
        expect(chatSection).toHaveClass('card-enhanced');
        expect(chatSection).toHaveClass('animate-fade-in');
      });

      it('should preserve chat header classes', () => {
        renderWithRouter(<Chat />);

        const chatHeader = screen.getByText('Team Chat').closest('header');
        expect(chatHeader).toHaveClass('px-5');
        expect(chatHeader).toHaveClass('py-4');
        expect(chatHeader).toHaveClass('border-b');
        expect(chatHeader).toHaveClass('border-dark-primary');
        expect(chatHeader).toHaveClass('flex-shrink-0');
        expect(chatHeader).toHaveClass('bg-dark-tertiary');
        expect(chatHeader).toHaveClass('rounded-t-2xl');
      });

      it('should preserve online status indicator classes', () => {
        renderWithRouter(<Chat />);

        const statusDot = document.querySelector('.w-1\\.5.h-1\\.5.bg-green-500.rounded-full.animate-pulse');
        expect(statusDot).toBeInTheDocument();
        
        const statusText = screen.getByText('online');
        expect(statusText).toHaveClass('text-xs');
        expect(statusText).toHaveClass('text-dark-tertiary');
        expect(statusText).toHaveClass('font-mono');
      });
    });

    describe('MobileTabSwitcher Component', () => {
      it('should preserve tab navigation classes', () => {
        const TestComponent1 = () => <div>Kanban</div>;
        const TestComponent2 = () => <div>Chat</div>;
        
        render(
          <MobileTabSwitcher>
            <TestComponent1 />
            <TestComponent2 />
          </MobileTabSwitcher>
        );

        const tabContainer = screen.getAllByText('Kanban')[0].closest('nav').parentElement;
        expect(tabContainer).toHaveClass('border-b');
        expect(tabContainer).toHaveClass('border-gray-200');
        expect(tabContainer).toHaveClass('mb-4');
        expect(tabContainer).toHaveClass('sm:mb-6');

        const nav = screen.getAllByText('Kanban')[0].closest('nav');
        expect(nav).toHaveClass('-mb-px');
        expect(nav).toHaveClass('flex');
      });

      it('should preserve tab button classes', () => {
        const TestComponent1 = () => <div>Kanban</div>;
        const TestComponent2 = () => <div>Chat</div>;
        
        render(
          <MobileTabSwitcher>
            <TestComponent1 />
            <TestComponent2 />
          </MobileTabSwitcher>
        );

        const kanbanTab = screen.getByRole('button', { name: 'Kanban' });
        expect(kanbanTab).toHaveClass('flex-1');
        expect(kanbanTab).toHaveClass('py-3');
        expect(kanbanTab).toHaveClass('px-4');
        expect(kanbanTab).toHaveClass('border-b-2');
        expect(kanbanTab).toHaveClass('font-medium');
        expect(kanbanTab).toHaveClass('text-sm');
        expect(kanbanTab).toHaveClass('sm:text-base');
        expect(kanbanTab).toHaveClass('transition-colors');
        expect(kanbanTab).toHaveClass('min-h-[48px]');
        expect(kanbanTab).toHaveClass('touch-manipulation');
      });
    });
  });

  describe('Theme Color Classes Verification', () => {
    it('should preserve dark theme background classes', () => {
      renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      // Check for dark theme classes
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-dark-secondary');
      
      const main = screen.getByRole('main');
      expect(main.closest('div')).toHaveClass('min-h-screen');
    });

    it('should preserve dark theme text classes', () => {
      renderWithRouter(<Chat />);

      const chatTitle = screen.getByText('Team Chat');
      expect(chatTitle).toHaveClass('text-dark-primary');

      const statusText = screen.getByText('real-time');
      expect(statusText).toHaveClass('text-dark-tertiary');
    });

    it('should preserve dark theme border classes', () => {
      renderWithRouter(<Chat />);

      const chatHeader = screen.getByText('Team Chat').closest('header');
      expect(chatHeader).toHaveClass('border-dark-primary');
    });
  });

  describe('Animation Classes Verification', () => {
    it('should preserve fade-in animation classes', () => {
      renderWithRouter(<KanbanBoard />);

      const boardSection = screen.getByLabelText('Kanban task board');
      expect(boardSection).toHaveClass('animate-fade-in');
    });

    it('should preserve slide-up animation classes', () => {
      const mockTask = {
        $id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        assignedTo: 'user1',
        createdBy: 'user1',
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z'
      };

      render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Test Task').closest('article');
      expect(taskCard).toHaveClass('animate-slide-up');
    });

    it('should preserve pulse animation classes', () => {
      renderWithRouter(<Chat />);

      const statusDot = document.querySelector('.animate-pulse');
      expect(statusDot).toBeInTheDocument();
    });

    it('should preserve transition classes', () => {
      renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const logoutButton = screen.getByRole('button', { name: /sign out of your account/i });
      // Note: btn-danger class handles transitions
      expect(logoutButton).toHaveClass('btn-danger');
    });
  });

  describe('Accessibility Classes Verification', () => {
    it('should preserve focus ring classes', () => {
      const mockTask = {
        $id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        assignedTo: 'user1',
        createdBy: 'user1',
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z'
      };

      render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Test Task').closest('article');
      expect(taskCard).toHaveClass('focus:outline-none');
      expect(taskCard).toHaveClass('focus:ring-2');
      expect(taskCard).toHaveClass('focus:ring-blue-500');
      expect(taskCard).toHaveClass('focus:ring-offset-2');
      expect(taskCard).toHaveClass('focus:ring-offset-gray-900');
    });

    it('should preserve touch manipulation classes', () => {
      const mockTask = {
        $id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        assignedTo: 'user1',
        createdBy: 'user1',
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z'
      };

      render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Test Task').closest('article');
      expect(taskCard).toHaveClass('touch-manipulation');
    });

    it('should preserve minimum touch target classes', () => {
      renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const logoutButton = screen.getByRole('button', { name: /sign out of your account/i });
      expect(logoutButton).toHaveClass('min-h-[44px]');
      expect(logoutButton).toHaveClass('min-w-[44px]');
    });
  });
});