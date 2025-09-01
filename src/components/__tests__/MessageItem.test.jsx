import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MessageItem from '../MessageItem';

describe('MessageItem Component', () => {
  describe('System Messages', () => {
    it('should render task creation system message with correct styling', () => {
      const taskMessage = {
        $id: 'msg1',
        type: 'task_created',
        content: '📝 John created a new task: "Setup API"',
        $createdAt: new Date().toISOString(),
        systemData: {
          taskId: '123',
          taskTitle: 'Setup API',
          createdBy: 'John'
        }
      };

      render(<MessageItem message={taskMessage} />);
      
      // Check for task creation notification
      expect(screen.getByLabelText('Task creation notification')).toBeInTheDocument();
      
      // Check for correct icon
      expect(screen.getByText('📝')).toBeInTheDocument();
      
      // Check for message content
      expect(screen.getByText('📝 John created a new task: "Setup API"')).toBeInTheDocument();
      
      // Check for system data display
      expect(screen.getByText('Task: Setup API')).toBeInTheDocument();
    });

    it('should render vault secret addition system message with correct styling', () => {
      const vaultMessage = {
        $id: 'msg2',
        type: 'vault_secret_added',
        content: '🔐 API key added to vault',
        $createdAt: new Date().toISOString(),
        systemData: {
          secretId: '456',
          secretName: 'API_KEY',
          action: 'added',
          modifiedBy: 'Jane'
        }
      };

      render(<MessageItem message={vaultMessage} />);
      
      // Check for vault secret notification
      expect(screen.getByLabelText('Vault secret addition notification')).toBeInTheDocument();
      
      // Check for correct icon
      expect(screen.getByText('🔐')).toBeInTheDocument();
      
      // Check for message content
      expect(screen.getByText(/API key added to vault/)).toBeInTheDocument();
      
      // Check for system data display
      expect(screen.getByText('Secret: API_KEY')).toBeInTheDocument();
      expect(screen.getByText('by Jane')).toBeInTheDocument();
    });

    it('should render vault secret deletion system message with correct styling', () => {
      const vaultMessage = {
        $id: 'msg3',
        type: 'vault_secret_deleted',
        content: '🗑️ Old API key removed from vault',
        $createdAt: new Date().toISOString(),
        systemData: {
          secretId: '789',
          secretName: 'OLD_API_KEY',
          action: 'deleted',
          modifiedBy: 'Admin'
        }
      };

      render(<MessageItem message={vaultMessage} />);
      
      // Check for vault secret deletion notification
      expect(screen.getByLabelText('Vault secret deletion notification')).toBeInTheDocument();
      
      // Check for correct icon
      expect(screen.getByText('🗑️')).toBeInTheDocument();
      
      // Check for message content
      expect(screen.getByText(/Old API key removed from vault/)).toBeInTheDocument();
    });

    it('should have proper accessibility attributes for system messages', () => {
      const systemMessage = {
        $id: 'msg4',
        type: 'task_completed',
        content: '✅ Task completed successfully',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={systemMessage} />);
      
      // Check for proper ARIA attributes
      const messageElement = screen.getByRole('status');
      expect(messageElement).toHaveAttribute('aria-live', 'polite');
      expect(messageElement).toHaveAttribute('aria-label', 'Task completion notification');
      
      // Check for icon accessibility (using query selector since aria-hidden elements are not accessible)
      const container = screen.getByLabelText('Task completion notification');
      const iconElement = container.querySelector('[role="img"]');
      expect(iconElement).toHaveAttribute('aria-hidden', 'true');
      expect(iconElement).toHaveAttribute('aria-label', 'Task completion notification icon');
    });
  });

  describe('User Messages', () => {
    it('should render user message with proper accessibility', () => {
      const userMessage = {
        $id: 'msg5',
        type: 'user',
        content: 'Hello team!',
        userName: 'John Doe',
        userId: 'user123',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={userMessage} isCurrentUser={false} />);
      
      // Check for proper article structure
      const messageElement = screen.getByRole('article');
      expect(messageElement).toHaveAttribute('aria-label');
      
      // Check for message content
      expect(screen.getByText('Hello team!')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render current user message correctly', () => {
      const userMessage = {
        $id: 'msg6',
        type: 'user',
        content: 'This is my message',
        userName: 'Current User',
        userId: 'current123',
        $createdAt: new Date().toISOString()
      };

      render(<MessageItem message={userMessage} isCurrentUser={true} />);
      
      // Check for proper article structure
      const messageElement = screen.getByRole('article');
      expect(messageElement).toHaveAttribute('aria-label');
      expect(messageElement.getAttribute('aria-label')).toContain('you');
      
      // Check that username is not displayed for current user
      expect(screen.queryByText('Current User')).not.toBeInTheDocument();
      expect(screen.getByText('This is my message')).toBeInTheDocument();
    });
  });
});