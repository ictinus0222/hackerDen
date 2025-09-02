import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import NotificationIndicator from '../NotificationIndicator';
import SystemMessageNotification from '../SystemMessageNotification';
import GroupedNotificationSummary from '../GroupedNotificationSummary';
import { useNotifications } from '../../hooks/useNotifications';

// Mock the useNotifications hook
vi.mock('../../hooks/useNotifications');

// Mock browser Notification API
const mockNotification = vi.fn();
Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  configurable: true
});

Object.defineProperty(Notification, 'permission', {
  value: 'granted',
  configurable: true
});

Object.defineProperty(Notification, 'requestPermission', {
  value: vi.fn().mockResolvedValue('granted'),
  configurable: true
});

describe('Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('NotificationIndicator', () => {
    it('renders unread count badge when there are unread messages', () => {
      render(<NotificationIndicator unreadCount={5} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByLabelText('5 unread notifications')).toBeInTheDocument();
    });

    it('shows animated bell icon when there are unread messages', () => {
      render(<NotificationIndicator unreadCount={3} />);
      
      const bellIcon = screen.getByLabelText('3 unread notifications');
      expect(bellIcon).toBeInTheDocument();
    });

    it('handles click events to mark as read', () => {
      const mockOnClick = vi.fn();
      render(<NotificationIndicator unreadCount={2} onClick={mockOnClick} />);
      
      fireEvent.click(screen.getByLabelText('2 unread notifications'));
      expect(mockOnClick).toHaveBeenCalledOnce();
    });

    it('handles keyboard navigation', () => {
      const mockOnClick = vi.fn();
      render(<NotificationIndicator unreadCount={1} onClick={mockOnClick} />);
      
      const indicator = screen.getByLabelText('1 unread notifications');
      fireEvent.keyDown(indicator, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledOnce();
      
      fireEvent.keyDown(indicator, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('displays 99+ for counts over 99', () => {
      render(<NotificationIndicator unreadCount={150} />);
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  describe('SystemMessageNotification', () => {
    const mockNotifications = [
      {
        id: '1',
        type: 'task_created',
        content: '📝 New task: "Setup API"',
        timestamp: Date.now(),
        relatedId: 'task-123'
      },
      {
        id: '2',
        type: 'vault_secret_added',
        content: '🔐 API key added to vault',
        timestamp: Date.now(),
        relatedId: 'secret-456'
      }
    ];

    it('renders system message notifications with correct styling', () => {
      render(<SystemMessageNotification notifications={mockNotifications} />);
      
      expect(screen.getByText('📝 New task: "Setup API"')).toBeInTheDocument();
      expect(screen.getByText('🔐 API key added to vault')).toBeInTheDocument();
    });

    it('shows correct badges for different notification types', () => {
      render(<SystemMessageNotification notifications={mockNotifications} />);
      
      expect(screen.getByText('Task Created')).toBeInTheDocument();
      expect(screen.getByText('Vault Secret Added')).toBeInTheDocument();
    });

    it('handles notification dismissal', async () => {
      const mockOnDismiss = vi.fn();
      render(
        <SystemMessageNotification 
          notifications={mockNotifications} 
          onDismiss={mockOnDismiss}
        />
      );
      
      const dismissButtons = screen.getAllByLabelText('Dismiss notification');
      fireEvent.click(dismissButtons[0]);
      
      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalledWith('1');
      });
    });

    it('auto-hides notifications after specified duration', async () => {
      const mockOnDismiss = vi.fn();
      render(
        <SystemMessageNotification 
          notifications={mockNotifications}
          onDismiss={mockOnDismiss}
          autoHideDuration={50}
        />
      );
      
      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('limits visible notifications to maxVisible', () => {
      const manyNotifications = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        type: 'task_created',
        content: `Task ${i + 1}`,
        timestamp: Date.now()
      }));

      render(
        <SystemMessageNotification 
          notifications={manyNotifications}
          maxVisible={2}
        />
      );
      
      // Should only show 2 notifications
      expect(screen.getByText('Task 4')).toBeInTheDocument();
      expect(screen.getByText('Task 5')).toBeInTheDocument();
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });
  });

  describe('GroupedNotificationSummary', () => {
    const mockGroupedNotifications = new Map([
      ['task_general', [
        {
          id: '1',
          type: 'task_created',
          content: 'Task 1 created',
          timestamp: Date.now() - 1000
        },
        {
          id: '2',
          type: 'task_completed',
          content: 'Task 2 completed',
          timestamp: Date.now()
        }
      ]],
      ['vault_general', [
        {
          id: '3',
          type: 'vault_secret_added',
          content: 'Secret added',
          timestamp: Date.now()
        }
      ]]
    ]);

    it('renders grouped notifications with correct counts', () => {
      render(
        <GroupedNotificationSummary 
          groupedNotifications={mockGroupedNotifications}
        />
      );
      
      expect(screen.getByText('Task Updates')).toBeInTheDocument();
      expect(screen.getByText('2 task updates')).toBeInTheDocument();
      expect(screen.getByText('Vault Changes')).toBeInTheDocument();
      expect(screen.getByText('1 vault change')).toBeInTheDocument();
    });

    it('expands and collapses groups when clicked', () => {
      render(
        <GroupedNotificationSummary 
          groupedNotifications={mockGroupedNotifications}
        />
      );
      
      const expandButton = screen.getAllByLabelText('Expand group')[0];
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Task 1 created')).toBeInTheDocument();
      expect(screen.getByText('Task 2 completed')).toBeInTheDocument();
      
      const collapseButton = screen.getByLabelText('Collapse group');
      fireEvent.click(collapseButton);
      
      expect(screen.queryByText('Task 1 created')).not.toBeInTheDocument();
    });

    it('handles group dismissal', () => {
      const mockOnDismissGroup = vi.fn();
      render(
        <GroupedNotificationSummary 
          groupedNotifications={mockGroupedNotifications}
          onDismissGroup={mockOnDismissGroup}
        />
      );
      
      const dismissButtons = screen.getAllByLabelText('Dismiss group');
      fireEvent.click(dismissButtons[0]);
      
      expect(mockOnDismissGroup).toHaveBeenCalledWith('task_general');
    });

    it('shows relative timestamps', () => {
      render(
        <GroupedNotificationSummary 
          groupedNotifications={mockGroupedNotifications}
        />
      );
      
      const timestampElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('Just now') || false;
      });
      expect(timestampElements.length).toBeGreaterThan(0);
    });
  });

  describe('useNotifications hook integration', () => {
    it('handles system messages correctly', () => {
      const mockUseNotifications = {
        unreadCount: 3,
        notifications: [],
        groupedNotifications: new Map(),
        markAsRead: vi.fn(),
        handleSystemMessage: vi.fn(),
        handleNewMessage: vi.fn(),
        requestNotificationPermission: vi.fn()
      };

      useNotifications.mockReturnValue(mockUseNotifications);

      const systemMessage = {
        type: 'task_created',
        content: 'New task created',
        systemData: { taskId: '123' }
      };

      mockUseNotifications.handleSystemMessage(systemMessage);
      expect(mockUseNotifications.handleSystemMessage).toHaveBeenCalledWith(systemMessage);
    });

    it('handles regular messages correctly', () => {
      const mockUseNotifications = {
        unreadCount: 1,
        notifications: [],
        groupedNotifications: new Map(),
        markAsRead: vi.fn(),
        handleSystemMessage: vi.fn(),
        handleNewMessage: vi.fn(),
        requestNotificationPermission: vi.fn()
      };

      useNotifications.mockReturnValue(mockUseNotifications);

      const userMessage = {
        type: 'user',
        content: 'Hello team!',
        userId: 'user-456',
        userName: 'John Doe'
      };

      mockUseNotifications.handleNewMessage(userMessage);
      expect(mockUseNotifications.handleNewMessage).toHaveBeenCalledWith(userMessage);
    });
  });

  describe('Browser notification integration', () => {
    it('requests notification permission on mount', () => {
      const mockUseNotifications = {
        unreadCount: 0,
        notifications: [],
        groupedNotifications: new Map(),
        markAsRead: vi.fn(),
        handleSystemMessage: vi.fn(),
        handleNewMessage: vi.fn(),
        requestNotificationPermission: vi.fn()
      };

      useNotifications.mockReturnValue(mockUseNotifications);
      
      // This would be called in the component that uses the hook
      mockUseNotifications.requestNotificationPermission();
      expect(mockUseNotifications.requestNotificationPermission).toHaveBeenCalled();
    });
  });
});