import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Layout from '../Layout';
import MobileTabSwitcher from '../MobileTabSwitcher';
import MessageInput from '../MessageInput';
import TaskCard from '../TaskCard';
import TaskModal from '../TaskModal';

// Mock hooks
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User' },
    logout: vi.fn()
  })
}));

vi.mock('../../hooks/useTeam', () => ({
  useTeam: () => ({
    team: { $id: 'team1', name: 'Test Team' }
  })
}));

describe('Mobile Optimization Tests', () => {
  beforeEach(() => {
    // Reset viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone SE width
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667, // iPhone SE height
    });
  });

  describe('Touch Targets', () => {
    it('should have proper touch target sizes for buttons', () => {
      render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const logoutButton = screen.getByRole('button', { name: /exit|logout/i });
      const styles = window.getComputedStyle(logoutButton);
      
      // Check minimum touch target size (44px)
      expect(logoutButton).toHaveClass('min-h-[44px]');
      expect(logoutButton).toHaveClass('min-w-[44px]');
      expect(logoutButton).toHaveClass('touch-manipulation');
    });

    it('should have proper touch targets in MobileTabSwitcher', () => {
      const TestComponent1 = () => <div>Kanban</div>;
      const TestComponent2 = () => <div>Chat</div>;
      
      render(
        <MobileTabSwitcher>
          <TestComponent1 />
          <TestComponent2 />
        </MobileTabSwitcher>
      );

      const kanbanTab = screen.getByRole('button', { name: 'Kanban' });
      const chatTab = screen.getByRole('button', { name: 'Chat' });

      expect(kanbanTab).toHaveClass('min-h-[48px]');
      expect(kanbanTab).toHaveClass('touch-manipulation');
      expect(chatTab).toHaveClass('min-h-[48px]');
      expect(chatTab).toHaveClass('touch-manipulation');
    });
  });

  describe('Mobile Input Optimization', () => {
    it('should prevent zoom on iOS for message input', () => {
      const mockSendMessage = vi.fn();
      
      render(
        <MessageInput onSendMessage={mockSendMessage} />
      );

      const input = screen.getByPlaceholderText('Type a message...');
      
      // Check for iOS zoom prevention
      expect(input).toHaveStyle({ fontSize: '16px' });
      expect(input).toHaveClass('text-base');
    });

    it('should have proper mobile layout for message input', () => {
      const mockSendMessage = vi.fn();
      
      render(
        <MessageInput onSendMessage={mockSendMessage} />
      );

      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      expect(sendButton).toHaveClass('min-h-[48px]');
      expect(sendButton).toHaveClass('touch-manipulation');
    });
  });

  describe('Task Card Touch Interactions', () => {
    it('should have proper touch manipulation classes', () => {
      const mockTask = {
        $id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };

      render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
        />
      );

      const taskCard = screen.getByText('Test Task').closest('div');
      
      expect(taskCard).toHaveClass('touch-manipulation');
      expect(taskCard).toHaveClass('select-none');
      expect(taskCard).toHaveClass('min-h-[80px]');
    });

    it('should handle touch events properly', () => {
      const mockTask = {
        $id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };

      const mockTouchStart = vi.fn();
      const mockTouchMove = vi.fn();
      const mockTouchEnd = vi.fn();

      render(
        <TaskCard 
          task={mockTask}
          onTouchStart={mockTouchStart}
          onTouchMove={mockTouchMove}
          onTouchEnd={mockTouchEnd}
        />
      );

      const taskCard = screen.getByText('Test Task').closest('div');
      
      // Simulate touch events
      fireEvent.touchStart(taskCard, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      expect(mockTouchStart).toHaveBeenCalled();
    });
  });

  describe('Modal Mobile Optimization', () => {
    it('should have proper mobile styling for TaskModal', () => {
      render(
        <TaskModal 
          isOpen={true}
          onClose={vi.fn()}
          onTaskCreated={vi.fn()}
        />
      );

      const modal = screen.getByRole('dialog', { hidden: true }) || 
                   screen.getByText('Create New Task').closest('div').closest('div');
      
      expect(modal).toHaveClass('max-h-[90vh]');
      expect(modal).toHaveClass('overflow-y-auto');

      const closeButton = screen.getByRole('button', { name: '' }); // Close button with X
      expect(closeButton).toHaveClass('min-h-[44px]');
      expect(closeButton).toHaveClass('min-w-[44px]');
      expect(closeButton).toHaveClass('touch-manipulation');
    });

    it('should prevent zoom on iOS for modal inputs', () => {
      render(
        <TaskModal 
          isOpen={true}
          onClose={vi.fn()}
          onTaskCreated={vi.fn()}
        />
      );

      const titleInput = screen.getByLabelText(/task title/i);
      const descriptionInput = screen.getByLabelText(/task description/i);
      
      expect(titleInput).toHaveStyle({ fontSize: '16px' });
      expect(descriptionInput).toHaveStyle({ fontSize: '16px' });
    });
  });

  describe('Responsive Layout', () => {
    it('should use proper responsive classes', () => {
      render(
        <Layout>
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6">Test content</div>
          </div>
        </Layout>
      );

      // Check that responsive classes are applied
      const content = screen.getByText('Test content').closest('div');
      expect(content).toHaveClass('p-4');
      expect(content).toHaveClass('sm:p-6');
    });
  });

  describe('Touch Feedback', () => {
    it('should have active states for touch interactions', () => {
      render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const logoutButton = screen.getByRole('button', { name: /exit|logout/i });
      
      expect(logoutButton).toHaveClass('active:bg-red-800');
    });
  });
});