import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import KanbanBoard from '../KanbanBoard';
import Chat from '../Chat';
import TaskCard from '../TaskCard';
import Layout from '../Layout';
import MobileTabSwitcher from '../MobileTabSwitcher';
import {
  CRITICAL_CLASSES,
  COMPONENT_PATTERNS,
  verifyCriticalClasses,
  verifyComponentPattern,
  generateStylingReport,
  verifyResponsiveClasses,
  verifyAnimationClasses
} from '../../utils/stylingProtection';

// Mock hooks and services
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User', email: 'test@example.com' },
    logout: vi.fn()
  })
}));

vi.mock('../../hooks/useTeam', () => ({
  useTeam: () => ({
    team: { $id: 'team1', name: 'Test Team', joinCode: 'ABC123' }
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

describe('Styling Protection Utility Tests', () => {
  describe('Critical Classes Constants', () => {
    it('should have all required critical class categories', () => {
      expect(CRITICAL_CLASSES).toHaveProperty('layout');
      expect(CRITICAL_CLASSES).toHaveProperty('responsive');
      expect(CRITICAL_CLASSES).toHaveProperty('theme');
      expect(CRITICAL_CLASSES).toHaveProperty('components');
      expect(CRITICAL_CLASSES).toHaveProperty('animations');
      expect(CRITICAL_CLASSES).toHaveProperty('interactive');
      expect(CRITICAL_CLASSES).toHaveProperty('accessibility');
      expect(CRITICAL_CLASSES).toHaveProperty('status');
      expect(CRITICAL_CLASSES).toHaveProperty('heights');
    });

    it('should have component patterns for all major components', () => {
      expect(COMPONENT_PATTERNS).toHaveProperty('Layout');
      expect(COMPONENT_PATTERNS).toHaveProperty('Dashboard');
      expect(COMPONENT_PATTERNS).toHaveProperty('KanbanBoard');
      expect(COMPONENT_PATTERNS).toHaveProperty('TaskColumn');
      expect(COMPONENT_PATTERNS).toHaveProperty('TaskCard');
      expect(COMPONENT_PATTERNS).toHaveProperty('Chat');
      expect(COMPONENT_PATTERNS).toHaveProperty('MobileTabSwitcher');
    });

    it('should have non-empty class arrays', () => {
      Object.values(CRITICAL_CLASSES).forEach(classArray => {
        expect(Array.isArray(classArray)).toBe(true);
        expect(classArray.length).toBeGreaterThan(0);
      });
    });
  });

  describe('verifyCriticalClasses Function', () => {
    it('should return success when all classes are present', () => {
      const div = document.createElement('div');
      div.className = 'flex flex-col h-full p-4';
      
      const result = verifyCriticalClasses(div, ['flex', 'flex-col', 'h-full']);
      
      expect(result.success).toBe(true);
      expect(result.missingClasses).toHaveLength(0);
      expect(result.presentClasses).toContain('flex');
      expect(result.presentClasses).toContain('flex-col');
      expect(result.presentClasses).toContain('h-full');
    });

    it('should return failure when classes are missing', () => {
      const div = document.createElement('div');
      div.className = 'flex p-4';
      
      const result = verifyCriticalClasses(div, ['flex', 'flex-col', 'h-full']);
      
      expect(result.success).toBe(false);
      expect(result.missingClasses).toContain('flex-col');
      expect(result.missingClasses).toContain('h-full');
      expect(result.presentClasses).toContain('flex');
    });

    it('should handle null element gracefully', () => {
      const result = verifyCriticalClasses(null, ['flex', 'flex-col']);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Element not found');
      expect(result.missingClasses).toEqual(['flex', 'flex-col']);
    });

    it('should handle escaped class names', () => {
      const div = document.createElement('div');
      div.className = 'min-h-[44px] min-w-[44px]';
      
      const result = verifyCriticalClasses(div, ['min-h-[44px]', 'min-w-[44px]']);
      
      expect(result.success).toBe(true);
      expect(result.missingClasses).toHaveLength(0);
    });
  });

  describe('verifyComponentPattern Function', () => {
    it('should verify Layout component pattern', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const result = verifyComponentPattern(container, 'Layout');
      
      expect(result.componentName).toBe('Layout');
      expect(result.results).toHaveProperty('header');
      expect(result.results).toHaveProperty('main');
      expect(result.results).toHaveProperty('button');
      
      // Header should have required classes
      expect(result.results.header.success).toBe(true);
      expect(result.results.header.missingClasses).toHaveLength(0);
      
      // Main should have required classes
      expect(result.results.main.success).toBe(true);
      expect(result.results.main.missingClasses).toHaveLength(0);
    });

    it('should verify KanbanBoard component pattern', () => {
      const { container } = renderWithRouter(<KanbanBoard />);

      const result = verifyComponentPattern(container, 'KanbanBoard');
      
      expect(result.componentName).toBe('KanbanBoard');
      expect(result.results).toHaveProperty('container');
      expect(result.results).toHaveProperty('header');
      expect(result.results).toHaveProperty('grid');
      
      // Container should have required classes
      expect(result.results.container.success).toBe(true);
      expect(result.results.container.missingClasses).toHaveLength(0);
    });

    it('should verify TaskCard component pattern', () => {
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

      const result = verifyComponentPattern(container, 'TaskCard');
      
      expect(result.componentName).toBe('TaskCard');
      expect(result.results).toHaveProperty('container');
      expect(result.results).toHaveProperty('header');
      expect(result.results).toHaveProperty('statusBadge');
      
      // Container should have required classes
      expect(result.results.container.success).toBe(true);
      expect(result.results.container.missingClasses).toHaveLength(0);
    });

    it('should handle unknown component gracefully', () => {
      const { container } = renderWithRouter(<div>Test</div>);

      const result = verifyComponentPattern(container, 'UnknownComponent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No pattern defined for component');
    });
  });

  describe('generateStylingReport Function', () => {
    it('should generate comprehensive styling report for Dashboard', () => {
      const { container } = renderWithRouter(<Dashboard />);

      const report = generateStylingReport(container, ['Dashboard', 'Layout']);
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('overallSuccess');
      expect(report).toHaveProperty('components');
      expect(report).toHaveProperty('criticalClassesFound');
      expect(report).toHaveProperty('recommendations');
      
      // Should have component verification results
      expect(report.components).toHaveProperty('Dashboard');
      expect(report.components).toHaveProperty('Layout');
      
      // Should have critical classes analysis
      expect(report.criticalClassesFound).toHaveProperty('layout');
      expect(report.criticalClassesFound).toHaveProperty('responsive');
      expect(report.criticalClassesFound).toHaveProperty('theme');
      
      // Each category should have proper structure
      Object.values(report.criticalClassesFound).forEach(category => {
        expect(category).toHaveProperty('total');
        expect(category).toHaveProperty('found');
        expect(category).toHaveProperty('missing');
        expect(category).toHaveProperty('foundClasses');
      });
    });

    it('should identify missing critical classes', () => {
      // Create a minimal component missing many classes
      const { container } = render(<div className="p-4">Minimal content</div>);

      const report = generateStylingReport(container, []);
      
      // Should find some missing classes
      Object.values(report.criticalClassesFound).forEach(category => {
        expect(category.missing).toBeDefined();
        expect(Array.isArray(category.missing)).toBe(true);
      });
      
      // Should have recommendations if classes are missing
      if (!report.overallSuccess) {
        expect(report.recommendations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('verifyResponsiveClasses Function', () => {
    it('should detect responsive classes in Dashboard', () => {
      const { container } = renderWithRouter(<Dashboard />);

      const result = verifyResponsiveClasses(container);
      
      expect(result.success).toBe(true);
      expect(result.totalResponsiveClasses).toBeGreaterThan(0);
      expect(result.responsiveClasses).toBeDefined();
      expect(Array.isArray(result.responsiveClasses)).toBe(true);
      
      // Should have coverage for multiple breakpoints
      expect(result.breakpointCoverage).toHaveProperty('sm');
      expect(result.breakpointCoverage).toHaveProperty('lg');
      
      // Should find some sm: and lg: classes
      expect(result.breakpointCoverage.sm).toBeGreaterThan(0);
      expect(result.breakpointCoverage.lg).toBeGreaterThan(0);
    });

    it('should detect responsive classes in KanbanBoard', () => {
      const { container } = renderWithRouter(<KanbanBoard />);

      const result = verifyResponsiveClasses(container);
      
      expect(result.success).toBe(true);
      expect(result.totalResponsiveClasses).toBeGreaterThan(0);
      
      // Should find xl: classes for grid columns
      expect(result.breakpointCoverage.xl).toBeGreaterThan(0);
      
      // Should contain specific responsive classes
      expect(result.responsiveClasses.some(cls => cls.includes('grid-cols'))).toBe(true);
    });

    it('should handle components with no responsive classes', () => {
      const { container } = render(<div className="p-4 bg-white">No responsive classes</div>);

      const result = verifyResponsiveClasses(container);
      
      expect(result.success).toBe(false);
      expect(result.totalResponsiveClasses).toBe(0);
      expect(result.responsiveClasses).toHaveLength(0);
    });
  });

  describe('verifyAnimationClasses Function', () => {
    it('should detect animation classes in KanbanBoard', () => {
      const { container } = renderWithRouter(<KanbanBoard />);

      const result = verifyAnimationClasses(container);
      
      expect(result.success).toBe(true);
      expect(result.foundAnimations).toBeDefined();
      expect(Array.isArray(result.foundAnimations)).toBe(true);
      expect(result.totalAnimatedElements).toBeGreaterThan(0);
      
      // Should find fade-in animations
      const fadeInAnimation = result.foundAnimations.find(anim => 
        anim.className === 'animate-fade-in'
      );
      expect(fadeInAnimation).toBeDefined();
      expect(fadeInAnimation.count).toBeGreaterThan(0);
    });

    it('should detect animation classes in TaskCard', () => {
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

      const result = verifyAnimationClasses(container);
      
      expect(result.success).toBe(true);
      
      // Should find slide-up animation
      const slideUpAnimation = result.foundAnimations.find(anim => 
        anim.className === 'animate-slide-up'
      );
      expect(slideUpAnimation).toBeDefined();
      expect(slideUpAnimation.count).toBeGreaterThan(0);
    });

    it('should detect transition classes in Layout', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const result = verifyAnimationClasses(container);
      
      expect(result.success).toBe(true);
      
      // Should find transition classes
      const transitionAnimation = result.foundAnimations.find(anim => 
        anim.className.includes('transition')
      );
      expect(transitionAnimation).toBeDefined();
    });

    it('should handle components with no animations', () => {
      const { container } = render(<div className="p-4 bg-white">No animations</div>);

      const result = verifyAnimationClasses(container);
      
      expect(result.success).toBe(false);
      expect(result.foundAnimations).toHaveLength(0);
      expect(result.totalAnimatedElements).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should verify all major components maintain their styling patterns', () => {
      const components = [
        { name: 'Layout', component: <Layout><div>Content</div></Layout> },
        { name: 'KanbanBoard', component: <KanbanBoard /> },
        { name: 'Chat', component: <Chat /> }
      ];

      components.forEach(({ name, component }) => {
        const { container } = renderWithRouter(component);
        
        // Generate comprehensive report
        const report = generateStylingReport(container, [name]);
        
        // Verify responsive classes
        const responsiveResult = verifyResponsiveClasses(container);
        
        // Verify animations
        const animationResult = verifyAnimationClasses(container);
        
        // All components should have some styling
        expect(report.criticalClassesFound.layout.found).toBeGreaterThan(0);
        expect(report.criticalClassesFound.components.found).toBeGreaterThan(0);
        
        // Most components should have responsive classes
        if (name !== 'Chat') { // Chat might have fewer responsive classes
          expect(responsiveResult.success).toBe(true);
        }
        
        // All components should have animations
        expect(animationResult.success).toBe(true);
      });
    });

    it('should detect styling regressions when classes are removed', () => {
      // Create a component that's missing critical classes
      const BrokenComponent = () => (
        <div className="p-4"> {/* Missing many critical classes */}
          <div>Broken content</div>
        </div>
      );

      const { container } = render(<BrokenComponent />);
      
      const report = generateStylingReport(container, []);
      
      // Should detect missing classes
      expect(report.criticalClassesFound.layout.missing.length).toBeGreaterThan(0);
      expect(report.criticalClassesFound.responsive.missing.length).toBeGreaterThan(0);
      expect(report.criticalClassesFound.theme.missing.length).toBeGreaterThan(0);
      
      // Should have recommendations
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });
});