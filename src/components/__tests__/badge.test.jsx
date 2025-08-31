import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../ui/badge';
import { StatusBadge, PriorityBadge, TaskIdBadge, LabelBadge } from '../ui/status-badge';

describe('Badge Components', () => {
  describe('Base Badge Component', () => {
    it('should render with default variant', () => {
      render(<Badge>Default Badge</Badge>);
      
      const badge = screen.getByText('Default Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('should render with different variants', () => {
      const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText('Secondary')).toBeInTheDocument();

      rerender(<Badge variant="destructive">Destructive</Badge>);
      expect(screen.getByText('Destructive')).toBeInTheDocument();

      rerender(<Badge variant="outline">Outline</Badge>);
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(<Badge className="custom-class">Custom Badge</Badge>);
      
      const badge = screen.getByText('Custom Badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('should render as different element when asChild is true', () => {
      render(
        <Badge asChild>
          <button>Button Badge</button>
        </Badge>
      );
      
      const badge = screen.getByRole('button');
      expect(badge).toHaveTextContent('Button Badge');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });
  });

  describe('StatusBadge Component', () => {
    it('should render todo status correctly', () => {
      render(<StatusBadge status="todo" />);
      
      const badge = screen.getByText('To-Do');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Status: To-Do');
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('should render in_progress status correctly', () => {
      render(<StatusBadge status="in_progress" />);
      
      const badge = screen.getByText('In Progress');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Status: In Progress');
      expect(screen.getByText('⚡')).toBeInTheDocument();
    });

    it('should render blocked status correctly', () => {
      render(<StatusBadge status="blocked" />);
      
      const badge = screen.getByText('Blocked');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Status: Blocked');
      expect(screen.getByText('🚫')).toBeInTheDocument();
    });

    it('should render done status correctly', () => {
      render(<StatusBadge status="done" />);
      
      const badge = screen.getByText('Done');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Status: Done');
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('should handle unknown status gracefully', () => {
      render(<StatusBadge status="unknown" />);
      
      const badge = screen.getByText('unknown');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Status: unknown');
      expect(screen.getByText('❓')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(<StatusBadge status="todo" className="custom-status" />);
      
      const badge = screen.getByText('To-Do');
      expect(badge).toHaveClass('custom-status');
    });
  });

  describe('PriorityBadge Component', () => {
    it('should render high priority correctly', () => {
      render(<PriorityBadge priority="high" />);
      
      const badge = screen.getByLabelText('High Priority');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('title', 'High Priority');
      expect(screen.getByText('🔴')).toBeInTheDocument();
    });

    it('should render medium priority correctly', () => {
      render(<PriorityBadge priority="medium" />);
      
      const badge = screen.getByLabelText('Medium Priority');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('title', 'Medium Priority');
      expect(screen.getByText('🟡')).toBeInTheDocument();
    });

    it('should render low priority correctly', () => {
      render(<PriorityBadge priority="low" />);
      
      const badge = screen.getByLabelText('Low Priority');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('title', 'Low Priority');
      expect(screen.getByText('🟢')).toBeInTheDocument();
    });

    it('should show label when showLabel is true', () => {
      render(<PriorityBadge priority="high" showLabel={true} />);
      
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('🔴')).toBeInTheDocument();
    });

    it('should handle unknown priority gracefully', () => {
      render(<PriorityBadge priority="unknown" />);
      
      const badge = screen.getByLabelText('Medium Priority (Default)');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('🟡')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(<PriorityBadge priority="high" className="custom-priority" />);
      
      const badge = screen.getByLabelText('High Priority');
      expect(badge).toHaveClass('custom-priority');
    });
  });

  describe('TaskIdBadge Component', () => {
    it('should render task ID correctly', () => {
      render(<TaskIdBadge taskId="123456789abcdef" />);
      
      const badge = screen.getByText('#cdef');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Task ID: cdef');
      expect(badge).toHaveAttribute('title', 'Task ID: 123456789abcdef');
    });

    it('should handle short task IDs', () => {
      render(<TaskIdBadge taskId="abc" />);
      
      const badge = screen.getByText('#abc');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Task ID: abc');
    });

    it('should handle null/undefined task ID', () => {
      render(<TaskIdBadge taskId={null} />);
      
      const badge = screen.getByText('#????');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Task ID: ????');
    });

    it('should have font-mono class', () => {
      render(<TaskIdBadge taskId="123456789abcdef" />);
      
      const badge = screen.getByText('#cdef');
      expect(badge).toHaveClass('font-mono');
    });

    it('should accept custom className', () => {
      render(<TaskIdBadge taskId="123456789abcdef" className="custom-id" />);
      
      const badge = screen.getByText('#cdef');
      expect(badge).toHaveClass('custom-id');
    });
  });

  describe('LabelBadge Component', () => {
    it('should render label correctly', () => {
      render(<LabelBadge label="Frontend" />);
      
      const badge = screen.getByText('Frontend');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Label: Frontend');
    });

    it('should accept custom className', () => {
      render(<LabelBadge label="Backend" className="custom-label" />);
      
      const badge = screen.getByText('Backend');
      expect(badge).toHaveClass('custom-label');
    });

    it('should handle special characters in labels', () => {
      render(<LabelBadge label="Bug Fix #123" />);
      
      const badge = screen.getByText('Bug Fix #123');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Label: Bug Fix #123');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes for screen readers', () => {
      render(
        <div>
          <StatusBadge status="in_progress" />
          <PriorityBadge priority="high" />
          <TaskIdBadge taskId="123456789abcdef" />
          <LabelBadge label="Frontend" />
        </div>
      );

      // Check that all badges have proper aria-label attributes
      expect(screen.getByLabelText('Status: In Progress')).toBeInTheDocument();
      expect(screen.getByLabelText('High Priority')).toBeInTheDocument();
      expect(screen.getByLabelText('Task ID: cdef')).toBeInTheDocument();
      expect(screen.getByLabelText('Label: Frontend')).toBeInTheDocument();
    });

    it('should have proper semantic markup', () => {
      render(<StatusBadge status="done" />);
      
      const badge = screen.getByText('Done');
      expect(badge.tagName).toBe('SPAN');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('should support keyboard focus when interactive', () => {
      render(
        <Badge asChild>
          <button>Interactive Badge</button>
        </Badge>
      );
      
      const badge = screen.getByRole('button');
      expect(badge).toBeInTheDocument();
      badge.focus();
      expect(badge).toHaveFocus();
    });
  });

  describe('Visual Variants', () => {
    it('should apply correct CSS classes for status variants', () => {
      const { rerender } = render(<StatusBadge status="todo" />);
      let badge = screen.getByText('To-Do');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');

      rerender(<StatusBadge status="in_progress" />);
      badge = screen.getByText('In Progress');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');

      rerender(<StatusBadge status="blocked" />);
      badge = screen.getByText('Blocked');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');

      rerender(<StatusBadge status="done" />);
      badge = screen.getByText('Done');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('should apply correct CSS classes for priority variants', () => {
      const { rerender } = render(<PriorityBadge priority="high" />);
      let badge = screen.getByLabelText('High Priority');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');

      rerender(<PriorityBadge priority="medium" />);
      badge = screen.getByLabelText('Medium Priority');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');

      rerender(<PriorityBadge priority="low" />);
      badge = screen.getByLabelText('Low Priority');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });
  });

  describe('Integration with Theme System', () => {
    it('should use CSS custom properties for theming', () => {
      render(<Badge variant="default">Themed Badge</Badge>);
      
      const badge = screen.getByText('Themed Badge');
      // The badge should have classes that reference CSS custom properties
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should support dark mode variants', () => {
      render(<Badge variant="destructive">Destructive Badge</Badge>);
      
      const badge = screen.getByText('Destructive Badge');
      // Should have dark mode specific classes
      expect(badge).toHaveClass('bg-destructive');
    });
  });
});