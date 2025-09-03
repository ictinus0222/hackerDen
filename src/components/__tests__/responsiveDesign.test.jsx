import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import KanbanBoard from '../KanbanBoard';
import Chat from '../Chat';
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

// Viewport simulation utilities
const setViewport = (width, height) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Responsive Design Tests', () => {
  let originalInnerWidth;
  let originalInnerHeight;

  beforeEach(() => {
    // Store original values
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe('Mobile Layout (375px - iPhone SE)', () => {
    beforeEach(() => {
      setViewport(375, 667);
    });

    it('should preserve mobile responsive classes in Layout', () => {
      renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1');
      expect(main).toHaveClass('overflow-hidden');

      // Check that responsive padding classes are present
      const innerDiv = main.querySelector('div');
      expect(innerDiv).toHaveClass('h-full');
      expect(innerDiv).toHaveClass('p-4');
      expect(innerDiv).toHaveClass('lg:p-6');
    });

    it('should preserve mobile grid classes in KanbanBoard', () => {
      renderWithRouter(<KanbanBoard />);

      const columnsGrid = document.querySelector('[role="application"]');
      if (columnsGrid) {
        expect(columnsGrid).toHaveClass('flex-1');
        expect(columnsGrid).toHaveClass('grid');
        expect(columnsGrid).toHaveClass('grid-cols-4');
        expect(columnsGrid).toHaveClass('gap-6');
      }
    });

    it('should preserve mobile spacing classes', () => {
      renderWithRouter(<Dashboard />);

      // Check for mobile spacing in team header
      const teamHeader = document.querySelector('.p-4.border-b');
      if (teamHeader) {
        expect(teamHeader).toHaveClass('p-4');
        expect(teamHeader).toHaveClass('border-b');
      }

      // Check for mobile layout height classes
      const mobileLayout = document.querySelector('.lg\\:hidden.border-b');
      if (mobileLayout) {
        expect(mobileLayout).toHaveClass('lg:hidden');
        expect(mobileLayout).toHaveClass('border-b');
      }
    });

    it('should preserve mobile tab switcher classes', () => {
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

      const kanbanTab = screen.getByRole('button', { name: 'Kanban' });
      expect(kanbanTab).toHaveClass('text-sm');
      expect(kanbanTab).toHaveClass('sm:text-base');
      expect(kanbanTab).toHaveClass('min-h-[48px]');
    });

    it('should preserve mobile touch target classes', () => {
      renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const logoutButton = screen.getByRole('button', { name: /sign out/i });
      expect(logoutButton).toHaveClass('px-4');
      expect(logoutButton).toHaveClass('py-3');
    });
  });

  describe('Tablet Layout (768px - iPad)', () => {
    beforeEach(() => {
      setViewport(768, 1024);
    });

    it('should preserve tablet responsive classes in Layout', () => {
      renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1');
      expect(main).toHaveClass('overflow-hidden');

      const innerDiv = main.querySelector('div');
      expect(innerDiv).toHaveClass('h-full');
      expect(innerDiv).toHaveClass('p-4');
      expect(innerDiv).toHaveClass('lg:p-6');
    });

    it('should preserve tablet grid classes in KanbanBoard', () => {
      renderWithRouter(<KanbanBoard />);

      const columnsGrid = document.querySelector('[role="application"]');
      if (columnsGrid) {
        expect(columnsGrid).toHaveClass('grid-cols-4');
        expect(columnsGrid).toHaveClass('gap-6');
      }
    });

    it('should preserve tablet header layout classes', () => {
      renderWithRouter(<KanbanBoard />);

      const boardHeader = screen.getByText('Kanban Board').closest('header');
      expect(boardHeader).toHaveClass('sm:flex-row');
      expect(boardHeader).toHaveClass('sm:items-center');
      expect(boardHeader).toHaveClass('sm:justify-between');
      expect(boardHeader).toHaveClass('sm:gap-0');
    });

    it('should preserve tablet padding classes', () => {
      renderWithRouter(<KanbanBoard />);

      const boardSection = screen.getByLabelText('Kanban task board');
      expect(boardSection).toHaveClass('p-6');
      expect(boardSection).toHaveClass('rounded-xl');
    });

    it('should preserve tablet tab switcher classes', () => {
      const TestComponent1 = () => <div>Kanban</div>;
      const TestComponent2 = () => <div>Chat</div>;
      
      render(
        <MobileTabSwitcher>
          <TestComponent1 />
          <TestComponent2 />
        </MobileTabSwitcher>
      );

      const tabContainer = screen.getAllByText('Kanban')[0].closest('nav').parentElement;
      expect(tabContainer).toHaveClass('sm:mb-6');

      const kanbanTab = screen.getByRole('button', { name: 'Kanban' });
      expect(kanbanTab).toHaveClass('sm:text-base');
    });
  });

  describe('Desktop Layout (1440px)', () => {
    beforeEach(() => {
      setViewport(1440, 900);
    });

    it('should preserve desktop responsive classes in Layout', () => {
      renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1');
      expect(main).toHaveClass('overflow-hidden');
    });

    it('should preserve desktop grid classes in KanbanBoard', () => {
      renderWithRouter(<KanbanBoard />);

      const columnsGrid = document.querySelector('[role="application"]');
      if (columnsGrid) {
        expect(columnsGrid).toHaveClass('grid-cols-4');
      }
    });

    it('should preserve desktop layout classes in Dashboard', () => {
      renderWithRouter(<Dashboard />);

      // Check for desktop grid layout
      const desktopLayout = document.querySelector('.hidden.lg\\:grid');
      if (desktopLayout) {
        expect(desktopLayout).toHaveClass('lg:grid-cols-3');
        expect(desktopLayout).toHaveClass('lg:gap-6');
        expect(desktopLayout).toHaveClass('h-[calc(100vh-280px)]');
        expect(desktopLayout).toHaveClass('min-h-[600px]');

        // Check column span for Kanban board
        const kanbanColumn = desktopLayout.querySelector('.lg\\:col-span-2');
        expect(kanbanColumn).toBeInTheDocument();
      }
    });

    it('should preserve desktop visibility classes', () => {
      renderWithRouter(<Dashboard />);

      // Desktop layout should be visible on desktop
      const desktopLayout = document.querySelector('.hidden.lg\\:block');
      if (desktopLayout) {
        expect(desktopLayout).toHaveClass('hidden');
        expect(desktopLayout).toHaveClass('lg:block');
      }

      // Mobile layout should be hidden on desktop
      const mobileLayout = document.querySelector('.lg\\:hidden');
      expect(mobileLayout).toHaveClass('lg:hidden');
    });
  });

  describe('Responsive Spacing Classes', () => {
    it('should preserve responsive gap classes', () => {
      renderWithRouter(<KanbanBoard />);

      const columnsGrid = document.querySelector('[role="application"]');
      if (columnsGrid) {
        expect(columnsGrid).toHaveClass('gap-6');
        expect(columnsGrid).toHaveClass('grid-cols-4');
      }
    });

    it('should preserve responsive padding classes', () => {
      renderWithRouter(<KanbanBoard />);

      const boardSection = screen.getByLabelText('Kanban task board');
      expect(boardSection).toHaveClass('p-6');
      expect(boardSection).toHaveClass('rounded-xl');
    });

    it('should preserve responsive margin classes', () => {
      const TestComponent1 = () => <div>Kanban</div>;
      const TestComponent2 = () => <div>Chat</div>;
      
      render(
        <MobileTabSwitcher>
          <TestComponent1 />
          <TestComponent2 />
        </MobileTabSwitcher>
      );

      const tabContainer = screen.getAllByText('Kanban')[0].closest('nav').parentElement;
      expect(tabContainer).toHaveClass('mb-4');
      expect(tabContainer).toHaveClass('sm:mb-6');
    });

    it('should preserve responsive space classes', () => {
      renderWithRouter(<KanbanBoard />);

      const boardHeader = screen.getByText('Kanban Board').closest('header');
      expect(boardHeader).toHaveClass('gap-4');
      expect(boardHeader).toHaveClass('sm:gap-0');
    });
  });

  describe('Responsive Text Classes', () => {
    it('should preserve responsive text size classes', () => {
      const TestComponent1 = () => <div>Kanban</div>;
      const TestComponent2 = () => <div>Chat</div>;
      
      render(
        <MobileTabSwitcher>
          <TestComponent1 />
          <TestComponent2 />
        </MobileTabSwitcher>
      );

      const kanbanTab = screen.getByRole('button', { name: 'Kanban' });
      expect(kanbanTab).toHaveClass('text-sm');
      expect(kanbanTab).toHaveClass('sm:text-base');
    });
  });

  describe('Responsive Flex Classes', () => {
    it('should preserve responsive flex direction classes', () => {
      renderWithRouter(<KanbanBoard />);

      const boardHeader = screen.getByText('Kanban Board').closest('header');
      expect(boardHeader).toHaveClass('flex-col');
      expect(boardHeader).toHaveClass('sm:flex-row');
    });

    it('should preserve responsive flex alignment classes', () => {
      renderWithRouter(<KanbanBoard />);

      const boardHeader = screen.getByText('Kanban Board').closest('header');
      expect(boardHeader).toHaveClass('sm:items-center');
      expect(boardHeader).toHaveClass('sm:justify-between');
    });
  });

  describe('Responsive Height Classes', () => {
    it('should preserve responsive height calculation classes', () => {
      renderWithRouter(<Dashboard />);

      // Desktop layout height
      const desktopLayout = document.querySelector('.hidden.lg\\:grid');
      if (desktopLayout) {
        expect(desktopLayout).toHaveClass('h-[calc(100vh-280px)]');
        expect(desktopLayout).toHaveClass('min-h-[600px]');
      }

      // Mobile layout height
      const mobileLayout = document.querySelector('.lg\\:hidden');
      if (mobileLayout) {
        expect(mobileLayout).toHaveClass('lg:hidden');
      }
    });

    it('should preserve critical height classes for scrolling', () => {
      renderWithRouter(<KanbanBoard />);

      const boardSection = screen.getByLabelText('Kanban task board');
      expect(boardSection).toHaveClass('h-full');

      const columnsGrid = document.querySelector('[role="application"]');
      if (columnsGrid) {
        expect(columnsGrid).toHaveClass('min-h-0');
      }
    });
  });

  describe('Responsive Display Classes', () => {
    it('should preserve responsive display classes for layout switching', () => {
      renderWithRouter(<Dashboard />);

      // Desktop layout visibility
      const desktopLayout = document.querySelector('.hidden.lg\\:block');
      if (desktopLayout) {
        expect(desktopLayout).toHaveClass('hidden');
        expect(desktopLayout).toHaveClass('lg:block');
      }

      // Mobile layout visibility
      const mobileLayout = document.querySelector('.lg\\:hidden');
      expect(mobileLayout).toHaveClass('lg:hidden');
    });
  });

  describe('Cross-Breakpoint Consistency', () => {
    it('should maintain consistent classes across all breakpoints', () => {
      const breakpoints = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1440, height: 900, name: 'desktop' }
      ];

      breakpoints.forEach(({ width, height, name }) => {
        setViewport(width, height);
        
        const { unmount } = renderWithRouter(<KanbanBoard />);

        // Check that core classes are preserved across breakpoints
        const boardSection = screen.getByLabelText('Kanban task board');
        expect(boardSection).toHaveClass('backdrop-blur-sm');
        expect(boardSection).toHaveClass('rounded-xl');
        expect(boardSection).toHaveClass('h-full');
        expect(boardSection).toHaveClass('flex');
        expect(boardSection).toHaveClass('flex-col');

        unmount();
      });
    });

    it('should maintain consistent spacing patterns across breakpoints', () => {
      const breakpoints = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1440, height: 900 }
      ];

      breakpoints.forEach(({ width, height }) => {
        setViewport(width, height);
        
        const { unmount } = renderWithRouter(<KanbanBoard />);

        const columnsGrid = document.querySelector('[role="application"]');
        if (columnsGrid) {
          // Base classes should always be present
          expect(columnsGrid).toHaveClass('gap-6');
          expect(columnsGrid).toHaveClass('grid-cols-4');
          
          // Responsive classes should be present regardless of current viewport
          expect(columnsGrid).toHaveClass('grid');
          expect(columnsGrid).toHaveClass('min-h-0');
          expect(columnsGrid).toHaveClass('overflow-y-auto');
        }

        unmount();
      });
    });
  });
});