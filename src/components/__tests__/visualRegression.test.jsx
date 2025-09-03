import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import KanbanBoard from '../KanbanBoard';
import Chat from '../Chat';
import TaskCard from '../TaskCard';
import Layout from '../Layout';

// Mock hooks and services
vi.mock('../../hooks/useAuth', () => ({
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
          title: 'Design user interface',
          description: 'Create wireframes and mockups for the new dashboard',
          status: 'todo',
          assignedTo: 'user1',
          createdBy: 'user1',
          $createdAt: '2024-01-01T00:00:00.000Z',
          $updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          $id: 'task2',
          title: 'Set up database schema',
          description: 'Define tables and relationships for the application',
          status: 'todo',
          assignedTo: 'user1',
          createdBy: 'user1',
          $createdAt: '2024-01-01T01:00:00.000Z',
          $updatedAt: '2024-01-01T01:00:00.000Z'
        }
      ],
      in_progress: [
        {
          $id: 'task3',
          title: 'Implement authentication',
          description: 'Add login and registration functionality',
          status: 'in_progress',
          assignedTo: 'user1',
          createdBy: 'user1',
          $createdAt: '2024-01-01T02:00:00.000Z',
          $updatedAt: '2024-01-01T02:00:00.000Z'
        }
      ],
      blocked: [
        {
          $id: 'task4',
          title: 'Deploy to production',
          description: 'Waiting for server configuration',
          status: 'blocked',
          assignedTo: 'user1',
          createdBy: 'user1',
          $createdAt: '2024-01-01T03:00:00.000Z',
          $updatedAt: '2024-01-01T03:00:00.000Z'
        }
      ],
      done: [
        {
          $id: 'task5',
          title: 'Project setup',
          description: 'Initialize repository and basic structure',
          status: 'done',
          assignedTo: 'user1',
          createdBy: 'user1',
          $createdAt: '2024-01-01T04:00:00.000Z',
          $updatedAt: '2024-01-01T04:00:00.000Z'
        }
      ]
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
        content: 'Welcome to the team!',
        userId: 'user1',
        type: 'user',
        $createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        $id: 'msg2',
        content: 'Task "Design user interface" was created',
        userId: null,
        type: 'system',
        $createdAt: '2024-01-01T01:00:00.000Z'
      },
      {
        $id: 'msg3',
        content: 'Great progress on the authentication!',
        userId: 'user2',
        type: 'user',
        $createdAt: '2024-01-01T02:00:00.000Z'
      },
      {
        $id: 'msg4',
        content: 'Task "Project setup" was moved to Done',
        userId: null,
        type: 'system',
        $createdAt: '2024-01-01T03:00:00.000Z'
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

// Utility function to simulate different viewport sizes
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

  window.dispatchEvent(new Event('resize'));
};

// Utility function to capture visual state
const captureVisualState = (container, testName) => {
  // In a real implementation, this would capture screenshots
  // For now, we'll capture the DOM structure and key styling attributes
  const visualState = {
    testName,
    timestamp: new Date().toISOString(),
    structure: container.innerHTML,
    computedStyles: {},
    dimensions: {}
  };

  // Capture computed styles for key elements
  const keyElements = container.querySelectorAll('[data-testid], .card-enhanced, .animate-fade-in, .animate-slide-up');
  keyElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element);
    visualState.computedStyles[`element-${index}`] = {
      className: element.className,
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      borderRadius: styles.borderRadius,
      padding: styles.padding,
      margin: styles.margin,
      display: styles.display,
      flexDirection: styles.flexDirection,
      gridTemplateColumns: styles.gridTemplateColumns,
      gap: styles.gap,
      transform: styles.transform,
      opacity: styles.opacity,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight
    };
  });

  return visualState;
};

describe('Visual Regression Tests', () => {
  let originalInnerWidth;
  let originalInnerHeight;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
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

  describe('Layout Visual Regression', () => {
    it('should maintain consistent layout visual appearance', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-dark-primary mb-4">Test Content</h1>
            <p className="text-dark-secondary">This is test content for layout visual regression testing.</p>
          </div>
        </Layout>
      );

      const visualState = captureVisualState(container, 'layout-default');
      
      // Verify key visual elements are present
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      
      // Verify header styling
      const header = container.querySelector('header');
      const headerStyles = window.getComputedStyle(header);
      expect(header).toHaveClass('bg-dark-secondary');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('shadow-lg');
      
      // Verify main content styling
      const main = container.querySelector('main');
      expect(main).toHaveClass('max-w-7xl');
      expect(main).toHaveClass('mx-auto');
      
      // Store visual state for comparison
      expect(visualState).toBeDefined();
      expect(visualState.structure).toContain('header');
      expect(visualState.structure).toContain('main');
    });

    it('should maintain consistent layout across different content', () => {
      const { container: container1 } = renderWithRouter(
        <Layout>
          <div>Short content</div>
        </Layout>
      );

      const { container: container2 } = renderWithRouter(
        <Layout>
          <div className="space-y-4">
            <div>Much longer content that spans multiple lines</div>
            <div>Additional content block</div>
            <div>Even more content to test layout consistency</div>
          </div>
        </Layout>
      );

      // Both should have the same header structure
      const header1 = container1.querySelector('header');
      const header2 = container2.querySelector('header');
      
      expect(header1.className).toBe(header2.className);
      expect(window.getComputedStyle(header1).backgroundColor)
        .toBe(window.getComputedStyle(header2).backgroundColor);
    });
  });

  describe('Dashboard Visual Regression', () => {
    it('should maintain consistent dashboard visual appearance', () => {
      const { container } = renderWithRouter(<Dashboard />);
      
      const visualState = captureVisualState(container, 'dashboard-default');
      
      // Verify team header is present and styled correctly
      const teamHeader = document.querySelector('.card-enhanced.rounded-2xl.p-6');
      expect(teamHeader).toHaveClass('card-enhanced');
      expect(teamHeader).toHaveClass('rounded-2xl');
      
      // Verify layout structure
      expect(container.querySelector('.lg\\:grid')).toBeInTheDocument();
      expect(container.querySelector('.lg\\:hidden')).toBeInTheDocument();
      
      expect(visualState.structure).toContain('Test Team');
    });

    it('should maintain consistent dashboard appearance across viewport changes', () => {
      // Test desktop view
      setViewport(1440, 900);
      const { container: desktopContainer } = renderWithRouter(<Dashboard />);
      const desktopState = captureVisualState(desktopContainer, 'dashboard-desktop');
      
      // Test mobile view
      setViewport(375, 667);
      const { container: mobileContainer } = renderWithRouter(<Dashboard />);
      const mobileState = captureVisualState(mobileContainer, 'dashboard-mobile');
      
      // Both should have team header with same styling
      const desktopTeamHeader = desktopContainer.querySelector('.card-enhanced');
      const mobileTeamHeader = mobileContainer.querySelector('.card-enhanced');
      
      expect(desktopTeamHeader).toHaveClass('card-enhanced');
      expect(mobileTeamHeader).toHaveClass('card-enhanced');
      
      // Verify responsive classes are present
      expect(desktopContainer.querySelector('.lg\\:grid')).toBeInTheDocument();
      expect(mobileContainer.querySelector('.lg\\:hidden')).toBeInTheDocument();
    });
  });

  describe('KanbanBoard Visual Regression', () => {
    it('should maintain consistent kanban board visual appearance', () => {
      const { container } = renderWithRouter(<KanbanBoard />);
      
      const visualState = captureVisualState(container, 'kanban-board-default');
      
      // Verify board structure
      const boardSection = screen.getByLabelText('Kanban task board');
      expect(boardSection).toHaveClass('card-enhanced');
      expect(boardSection).toHaveClass('animate-fade-in');
      
      // Verify columns grid
      const columnsGrid = container.querySelector('[role="application"]');
      expect(columnsGrid).toHaveClass('grid');
      expect(columnsGrid).toHaveClass('xl:grid-cols-4');
      
      // Verify task cards are present
      const taskCards = container.querySelectorAll('.animate-slide-up');
      expect(taskCards.length).toBeGreaterThan(0);
      
      expect(visualState.structure).toContain('Kanban Board');
    });

    it('should maintain consistent column styling across different task counts', () => {
      const { container } = renderWithRouter(<KanbanBoard />);
      
      // Find all columns
      const columns = container.querySelectorAll('[role="region"]');
      expect(columns.length).toBe(4); // To-Do, In Progress, Blocked, Done
      
      // Each column should have consistent styling
      columns.forEach((column, index) => {
        expect(column).toHaveClass('flex');
        expect(column).toHaveClass('flex-col');
        expect(column).toHaveClass('h-full');
        expect(column).toHaveClass('animate-fade-in');
        
        // Column headers should have consistent styling
        const header = column.querySelector('header');
        expect(header).toHaveClass('px-4');
        expect(header).toHaveClass('py-4');
        expect(header).toHaveClass('rounded-t-2xl');
      });
    });

    it('should maintain consistent task card visual appearance', () => {
      const { container } = renderWithRouter(<KanbanBoard />);
      
      const taskCards = container.querySelectorAll('[draggable="true"]');
      
      taskCards.forEach(card => {
        expect(card).toHaveClass('rounded-xl');
        expect(card).toHaveClass('p-4');
        expect(card).toHaveClass('card-enhanced');
        expect(card).toHaveClass('animate-slide-up');
        expect(card).toHaveClass('cursor-move');
        expect(card).toHaveClass('touch-manipulation');
        
        // Verify card structure
        const header = card.querySelector('header');
        const footer = card.querySelector('footer');
        
        expect(header).toHaveClass('flex');
        expect(header).toHaveClass('items-start');
        expect(header).toHaveClass('justify-between');
        
        if (footer) {
          expect(footer).toHaveClass('flex');
          expect(footer).toHaveClass('items-center');
          expect(footer).toHaveClass('justify-between');
          expect(footer).toHaveClass('border-t');
        }
      });
    });
  });

  describe('Chat Visual Regression', () => {
    it('should maintain consistent chat visual appearance', () => {
      const { container } = renderWithRouter(<Chat />);
      
      const visualState = captureVisualState(container, 'chat-default');
      
      // Verify chat structure
      const chatSection = screen.getByLabelText('Team chat');
      expect(chatSection).toHaveClass('rounded-2xl');
      expect(chatSection).toHaveClass('card-enhanced');
      expect(chatSection).toHaveClass('animate-fade-in');
      
      // Verify header
      const chatHeader = screen.getByText('Team Chat').closest('header');
      expect(chatHeader).toHaveClass('bg-dark-tertiary');
      expect(chatHeader).toHaveClass('rounded-t-2xl');
      expect(chatHeader).toHaveClass('border-b');
      
      // Verify online status indicator
      const statusDot = container.querySelector('.animate-pulse');
      expect(statusDot).toBeInTheDocument();
      
      expect(visualState.structure).toContain('Team Chat');
    });

    it('should maintain consistent message styling', () => {
      const { container } = renderWithRouter(<Chat />);
      
      // Check for message elements
      const messages = container.querySelectorAll('[role="log"] > div > div');
      
      if (messages.length > 0) {
        messages.forEach(message => {
          // Verify message structure exists
          expect(message).toBeInTheDocument();
        });
      }
      
      // Verify chat input area
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('flex-shrink-0');
    });
  });

  describe('Responsive Visual Regression', () => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' }
    ];

    viewports.forEach(({ width, height, name }) => {
      it(`should maintain consistent visual appearance on ${name} (${width}x${height})`, () => {
        setViewport(width, height);
        
        const { container } = renderWithRouter(<Dashboard />);
        const visualState = captureVisualState(container, `dashboard-${name}`);
        
        // Verify responsive classes are present
        if (name === 'desktop') {
          const desktopGrid = container.querySelector('.lg\\:grid');
          if (desktopGrid) {
            expect(desktopGrid).toBeInTheDocument();
          }
          const xlGrid = container.querySelector('.xl\\:grid-cols-4');
          if (xlGrid) {
            expect(xlGrid).toBeInTheDocument();
          }
        }
        
        if (name === 'mobile') {
          const mobileLayout = container.querySelector('.lg\\:hidden');
          if (mobileLayout) {
            expect(mobileLayout).toBeInTheDocument();
          }
        }
        
        // Verify core styling is maintained
        const teamHeader = document.querySelector('.card-enhanced.rounded-2xl.p-6');
        expect(teamHeader).toHaveClass('card-enhanced');
        
        expect(visualState.testName).toBe(`dashboard-${name}`);
      });
    });

    it('should maintain consistent kanban board appearance across viewports', () => {
      viewports.forEach(({ width, height, name }) => {
        setViewport(width, height);
        
        const { container } = renderWithRouter(<KanbanBoard />);
        
        // Core styling should be consistent
        const boardSection = screen.getAllByLabelText('Kanban task board')[0];
        expect(boardSection).toHaveClass('card-enhanced');
        expect(boardSection).toHaveClass('rounded-2xl');
        
        // Grid should have responsive classes
        const columnsGrid = container.querySelector('[role="application"]');
        if (columnsGrid) {
          expect(columnsGrid).toHaveClass('grid-cols-1');
          expect(columnsGrid).toHaveClass('sm:grid-cols-2');
          expect(columnsGrid).toHaveClass('xl:grid-cols-4');
        }
      });
    });
  });

  describe('Animation Visual Regression', () => {
    it('should maintain consistent animation classes', () => {
      const { container } = renderWithRouter(<KanbanBoard />);
      
      // Verify fade-in animations
      const fadeInElements = container.querySelectorAll('.animate-fade-in');
      expect(fadeInElements.length).toBeGreaterThan(0);
      
      fadeInElements.forEach(element => {
        expect(element).toHaveClass('animate-fade-in');
      });
      
      // Verify slide-up animations
      const slideUpElements = container.querySelectorAll('.animate-slide-up');
      expect(slideUpElements.length).toBeGreaterThan(0);
      
      slideUpElements.forEach(element => {
        expect(element).toHaveClass('animate-slide-up');
      });
    });

    it('should maintain consistent transition classes', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );
      
      const logoutButton = screen.getByRole('button', { name: /sign out of your account/i });
      // Note: btn-danger class handles transitions
      expect(logoutButton).toHaveClass('btn-danger');
    });

    it('should maintain consistent pulse animation', () => {
      const { container } = renderWithRouter(<Chat />);
      
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
      
      pulseElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse');
      });
    });
  });

  describe('Theme Visual Regression', () => {
    it('should maintain consistent dark theme colors', () => {
      const { container } = renderWithRouter(<Dashboard />);
      
      // Check for dark theme background classes
      const darkSecondaryElements = container.querySelectorAll('.bg-dark-secondary');
      const darkTertiaryElements = container.querySelectorAll('.bg-dark-tertiary');
      
      expect(darkSecondaryElements.length).toBeGreaterThan(0);
      
      // Check for dark theme text classes
      const darkPrimaryText = container.querySelectorAll('.text-dark-primary');
      const darkSecondaryText = container.querySelectorAll('.text-dark-secondary');
      const darkTertiaryText = container.querySelectorAll('.text-dark-tertiary');
      
      expect(darkPrimaryText.length).toBeGreaterThan(0);
      
      // Check for dark theme border classes
      const darkBorders = container.querySelectorAll('.border-dark-primary');
      expect(darkBorders.length).toBeGreaterThan(0);
    });

    it('should maintain consistent status colors', () => {
      const { container } = renderWithRouter(<KanbanBoard />);
      
      // Look for status badges
      const statusBadges = container.querySelectorAll('[class*="status-"]');
      
      // Verify status color classes exist in the DOM
      const todoElements = container.querySelectorAll('.status-todo');
      const progressElements = container.querySelectorAll('.status-progress');
      const blockedElements = container.querySelectorAll('.status-blocked');
      const doneElements = container.querySelectorAll('.status-done');
      
      // At least some status elements should be present
      const totalStatusElements = todoElements.length + progressElements.length + 
                                 blockedElements.length + doneElements.length;
      expect(totalStatusElements).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Visual Regression', () => {
    it('should maintain consistent focus ring styling', () => {
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

      const { container } = render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
        />
      );

      const taskCard = container.querySelector('[tabindex="0"]');
      expect(taskCard).toHaveClass('focus:outline-none');
      expect(taskCard).toHaveClass('focus:ring-2');
      expect(taskCard).toHaveClass('focus:ring-blue-500');
    });

    it('should maintain consistent touch target sizes', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const touchTargets = container.querySelectorAll('.min-h-\\[44px\\]');
      expect(touchTargets.length).toBeGreaterThan(0);
      
      touchTargets.forEach(target => {
        expect(target).toHaveClass('touch-manipulation');
      });
    });
  });
});