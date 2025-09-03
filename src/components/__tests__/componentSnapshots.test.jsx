import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import KanbanBoard from '../KanbanBoard';
import Chat from '../Chat';
import TaskCard from '../TaskCard';
import TaskColumn from '../TaskColumn';
import Layout from '../Layout';
import MobileTabSwitcher from '../MobileTabSwitcher';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';
import MessageItem from '../MessageItem';

// Mock hooks and services
vi.mock('../../hooks/useAuth', () => ({
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
        },
        {
          $id: 'task2',
          title: 'Test Task 2',
          description: 'Test Description 2',
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
          title: 'In Progress Task',
          description: 'Task in progress',
          status: 'in_progress',
          assignedTo: 'user1',
          createdBy: 'user1',
          $createdAt: '2024-01-01T02:00:00.000Z',
          $updatedAt: '2024-01-01T02:00:00.000Z'
        }
      ],
      blocked: [],
      done: [
        {
          $id: 'task4',
          title: 'Completed Task',
          description: 'Task completed',
          status: 'done',
          assignedTo: 'user1',
          createdBy: 'user1',
          $createdAt: '2024-01-01T03:00:00.000Z',
          $updatedAt: '2024-01-01T03:00:00.000Z'
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
        content: 'Hello team!',
        userId: 'user1',
        type: 'user',
        $createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        $id: 'msg2',
        content: 'Task "Test Task 1" was created',
        userId: null,
        type: 'system',
        $createdAt: '2024-01-01T01:00:00.000Z'
      },
      {
        $id: 'msg3',
        content: 'How is everyone doing?',
        userId: 'user2',
        type: 'user',
        $createdAt: '2024-01-01T02:00:00.000Z'
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

describe('Component Snapshot Tests', () => {
  describe('Layout Component Snapshots', () => {
    it('should match Layout component snapshot', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Test content</div>
        </Layout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match Layout component with different content snapshot', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div className="test-content">
            <h1>Different Content</h1>
            <p>This is different content to test layout consistency</p>
          </div>
        </Layout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Dashboard Component Snapshots', () => {
    it('should match Dashboard component snapshot', () => {
      const { container } = renderWithRouter(<Dashboard />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('KanbanBoard Component Snapshots', () => {
    it('should match KanbanBoard component snapshot', () => {
      const { container } = renderWithRouter(<KanbanBoard />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match KanbanBoard with loading state snapshot', () => {
      // Mock loading state
      vi.mocked(vi.importActual('../../hooks/useTasks')).useTasks = () => ({
        tasksByStatus: { todo: [], in_progress: [], blocked: [], done: [] },
        loading: true,
        error: null,
        refetch: vi.fn()
      });

      const { container } = renderWithRouter(<KanbanBoard />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('TaskColumn Component Snapshots', () => {
    const mockTasks = [
      {
        $id: 'task1',
        title: 'Test Task 1',
        description: 'Test Description 1',
        status: 'todo',
        assignedTo: 'user1',
        createdBy: 'user1',
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        $id: 'task2',
        title: 'Test Task 2',
        description: 'Test Description 2',
        status: 'todo',
        assignedTo: 'user1',
        createdBy: 'user1',
        $createdAt: '2024-01-01T01:00:00.000Z',
        $updatedAt: '2024-01-01T01:00:00.000Z'
      }
    ];

    it('should match TaskColumn with todo tasks snapshot', () => {
      const { container } = render(
        <TaskColumn
          title="To-Do"
          status="todo"
          tasks={mockTasks}
          onTaskDrop={vi.fn()}
          draggingTask={null}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match TaskColumn with in_progress tasks snapshot', () => {
      const inProgressTasks = mockTasks.map(task => ({ ...task, status: 'in_progress' }));
      const { container } = render(
        <TaskColumn
          title="In Progress"
          status="in_progress"
          tasks={inProgressTasks}
          onTaskDrop={vi.fn()}
          draggingTask={null}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match TaskColumn with blocked tasks snapshot', () => {
      const blockedTasks = mockTasks.map(task => ({ ...task, status: 'blocked' }));
      const { container } = render(
        <TaskColumn
          title="Blocked"
          status="blocked"
          tasks={blockedTasks}
          onTaskDrop={vi.fn()}
          draggingTask={null}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match TaskColumn with done tasks snapshot', () => {
      const doneTasks = mockTasks.map(task => ({ ...task, status: 'done' }));
      const { container } = render(
        <TaskColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          onTaskDrop={vi.fn()}
          draggingTask={null}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match empty TaskColumn snapshot', () => {
      const { container } = render(
        <TaskColumn
          title="Empty Column"
          status="todo"
          tasks={[]}
          onTaskDrop={vi.fn()}
          draggingTask={null}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('TaskCard Component Snapshots', () => {
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

    it('should match TaskCard with todo status snapshot', () => {
      const { container } = render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
          isDragging={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match TaskCard with in_progress status snapshot', () => {
      const inProgressTask = { ...mockTask, status: 'in_progress' };
      const { container } = render(
        <TaskCard 
          task={inProgressTask}
          onDragStart={vi.fn()}
          isDragging={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match TaskCard with blocked status snapshot', () => {
      const blockedTask = { ...mockTask, status: 'blocked' };
      const { container } = render(
        <TaskCard 
          task={blockedTask}
          onDragStart={vi.fn()}
          isDragging={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match TaskCard with done status snapshot', () => {
      const doneTask = { ...mockTask, status: 'done' };
      const { container } = render(
        <TaskCard 
          task={doneTask}
          onDragStart={vi.fn()}
          isDragging={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match TaskCard in dragging state snapshot', () => {
      const { container } = render(
        <TaskCard 
          task={mockTask}
          onDragStart={vi.fn()}
          isDragging={true}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match TaskCard with long title and description snapshot', () => {
      const longContentTask = {
        ...mockTask,
        title: 'This is a very long task title that should test text truncation and wrapping behavior',
        description: 'This is a very long task description that should test how the component handles longer content and whether it maintains proper styling and layout when dealing with extensive text content that might wrap to multiple lines'
      };
      const { container } = render(
        <TaskCard 
          task={longContentTask}
          onDragStart={vi.fn()}
          isDragging={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Chat Component Snapshots', () => {
    it('should match Chat component snapshot', () => {
      const { container } = renderWithRouter(<Chat />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('MessageList Component Snapshots', () => {
    const mockMessages = [
      {
        $id: 'msg1',
        content: 'Hello team!',
        userId: 'user1',
        type: 'user',
        $createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        $id: 'msg2',
        content: 'Task "Test Task 1" was created',
        userId: null,
        type: 'system',
        $createdAt: '2024-01-01T01:00:00.000Z'
      },
      {
        $id: 'msg3',
        content: 'How is everyone doing?',
        userId: 'user2',
        type: 'user',
        $createdAt: '2024-01-01T02:00:00.000Z'
      }
    ];

    it('should match MessageList with messages snapshot', () => {
      const { container } = render(
        <MessageList
          messages={mockMessages}
          loading={false}
          currentUserId="user1"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match MessageList with loading state snapshot', () => {
      const { container } = render(
        <MessageList
          messages={[]}
          loading={true}
          currentUserId="user1"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match MessageList with empty state snapshot', () => {
      const { container } = render(
        <MessageList
          messages={[]}
          loading={false}
          currentUserId="user1"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('MessageItem Component Snapshots', () => {
    it('should match user message snapshot', () => {
      const userMessage = {
        $id: 'msg1',
        content: 'Hello team!',
        userId: 'user1',
        type: 'user',
        $createdAt: '2024-01-01T00:00:00.000Z'
      };

      const { container } = render(
        <MessageItem
          message={userMessage}
          isCurrentUser={true}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match other user message snapshot', () => {
      const otherUserMessage = {
        $id: 'msg2',
        content: 'How is everyone doing?',
        userId: 'user2',
        type: 'user',
        $createdAt: '2024-01-01T01:00:00.000Z'
      };

      const { container } = render(
        <MessageItem
          message={otherUserMessage}
          isCurrentUser={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match system message snapshot', () => {
      const systemMessage = {
        $id: 'msg3',
        content: 'Task "Test Task 1" was created',
        userId: null,
        type: 'system',
        $createdAt: '2024-01-01T02:00:00.000Z'
      };

      const { container } = render(
        <MessageItem
          message={systemMessage}
          isCurrentUser={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match long message content snapshot', () => {
      const longMessage = {
        $id: 'msg4',
        content: 'This is a very long message that should test how the message component handles longer content and whether it maintains proper styling and layout when dealing with extensive text content that might wrap to multiple lines and test the overall message bubble appearance',
        userId: 'user1',
        type: 'user',
        $createdAt: '2024-01-01T03:00:00.000Z'
      };

      const { container } = render(
        <MessageItem
          message={longMessage}
          isCurrentUser={true}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('MessageInput Component Snapshots', () => {
    it('should match MessageInput default state snapshot', () => {
      const { container } = render(
        <MessageInput
          onSendMessage={vi.fn()}
          disabled={false}
          sending={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match MessageInput disabled state snapshot', () => {
      const { container } = render(
        <MessageInput
          onSendMessage={vi.fn()}
          disabled={true}
          sending={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match MessageInput sending state snapshot', () => {
      const { container } = render(
        <MessageInput
          onSendMessage={vi.fn()}
          disabled={false}
          sending={true}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('MobileTabSwitcher Component Snapshots', () => {
    it('should match MobileTabSwitcher with Kanban active snapshot', () => {
      const TestComponent1 = () => <div>Kanban Content</div>;
      const TestComponent2 = () => <div>Chat Content</div>;
      
      const { container } = render(
        <MobileTabSwitcher>
          <TestComponent1 />
          <TestComponent2 />
        </MobileTabSwitcher>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Responsive Snapshots', () => {
    beforeEach(() => {
      // Mock different viewport sizes for responsive snapshots
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });
    });

    it('should match mobile Layout snapshot', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Mobile content</div>
        </Layout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match mobile KanbanBoard snapshot', () => {
      const { container } = renderWithRouter(<KanbanBoard />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match mobile Chat snapshot', () => {
      const { container } = renderWithRouter(<Chat />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('State Variation Snapshots', () => {
    it('should match components with different loading states', () => {
      // Test various loading states to ensure styling consistency
      const loadingStates = [
        { loading: true, error: null },
        { loading: false, error: 'Network error' },
        { loading: false, error: null }
      ];

      loadingStates.forEach((state, index) => {
        // Mock the state for this iteration
        vi.mocked(vi.importActual('../../hooks/useTasks')).useTasks = () => ({
          tasksByStatus: { todo: [], in_progress: [], blocked: [], done: [] },
          loading: state.loading,
          error: state.error,
          refetch: vi.fn()
        });

        const { container } = renderWithRouter(<KanbanBoard />);
        expect(container.firstChild).toMatchSnapshot(`kanban-board-state-${index}`);
      });
    });
  });

  describe('Theme Consistency Snapshots', () => {
    it('should match components with consistent dark theme styling', () => {
      // Test that all components maintain consistent dark theme styling
      const components = [
        { name: 'layout', component: <Layout><div>Content</div></Layout> },
        { name: 'kanban', component: <KanbanBoard /> },
        { name: 'chat', component: <Chat /> }
      ];

      components.forEach(({ name, component }) => {
        const { container } = renderWithRouter(component);
        expect(container.firstChild).toMatchSnapshot(`${name}-dark-theme`);
      });
    });
  });
});