import { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import { useTouchDragDrop } from '../hooks/useTouchDragDrop';
import { taskService } from '../services/taskService';
import TaskColumn from './TaskColumn';
import TaskModal from './TaskModal';
import LoadingSpinner from './LoadingSpinner';
import { KanbanColumnSkeleton } from './SkeletonLoader';
import AppwriteSetupGuide from './AppwriteSetupGuide';
import { createTestTasks } from '../utils/testData';

const KanbanBoard = () => {
  const { tasksByStatus, loading, error, refetch } = useTasks();
  const { team } = useTeam();
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [draggingTask, setDraggingTask] = useState(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  
  const touchDragDrop = useTouchDragDrop();

  const handleCreateTestTasks = async () => {
    if (!team?.$id || !user?.$id) return;
    
    try {
      await createTestTasks(team.$id, user.$id);
      refetch(); // Refresh the tasks
    } catch (error) {
      console.error('Failed to create test tasks:', error);
    }
  };

  const handleTaskCreated = (newTask) => {
    // The real-time subscription in useTasks will handle adding the new task
    // This callback can be used for additional actions if needed
    console.log('New task created:', newTask);
  };

  const handleTaskDrop = async (taskId, newStatus) => {
    console.log('Dropping task:', taskId, 'to status:', newStatus);
    
    // Find the task being moved
    const allTasks = [
      ...tasksByStatus.todo,
      ...tasksByStatus.in_progress,
      ...tasksByStatus.blocked,
      ...tasksByStatus.done
    ];
    const task = allTasks.find(t => t.$id === taskId);
    
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }
    
    if (task.status === newStatus) {
      console.log('Task already in target status, no change needed');
      return; // No change needed
    }

    try {
      setIsUpdatingTask(true);
      console.log('Updating task status from', task.status, 'to', newStatus);
      await taskService.updateTaskStatus(taskId, newStatus, task.title, team.$id);
      console.log('Task status updated successfully');
      // The real-time subscription will handle updating the UI
    } catch (error) {
      console.error('Failed to update task status:', error);
      // You could add a toast notification here for better UX
    } finally {
      setIsUpdatingTask(false);
      setDraggingTask(null);
    }
  };

  const handleDragStart = (task) => {
    console.log('Starting drag for task:', task.title);
    setDraggingTask(task);
  };

  // Add CSS for touch drag feedback
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .touch-drag-over {
        background-color: rgb(219 234 254) !important;
        border-color: rgb(59 130 246) !important;
        border-width: 2px !important;
        border-style: dashed !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const columns = [
    { title: 'To-Do', status: 'todo', tasks: tasksByStatus.todo },
    { title: 'In Progress', status: 'in_progress', tasks: tasksByStatus.in_progress },
    { title: 'Blocked', status: 'blocked', tasks: tasksByStatus.blocked },
    { title: 'Done', status: 'done', tasks: tasksByStatus.done }
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 sm:p-8 h-full flex flex-col card-enhanced animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 sm:gap-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg loading-skeleton"></div>
            <div className="h-8 w-48 loading-skeleton rounded-lg"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-32 loading-skeleton rounded-xl"></div>
            <div className="h-10 w-24 loading-skeleton rounded-xl"></div>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 min-h-0">
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kanban Board</h2>
        <div className="h-96 overflow-y-auto">
          <AppwriteSetupGuide error={error} />
        </div>
      </div>
    );
  }

  return (
    <section 
      className="rounded-2xl p-6 sm:p-8 h-full flex flex-col card-enhanced animate-fade-in"
      aria-label="Kanban task board"
    >
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 sm:gap-0">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold gradient-text">Kanban Board</h2>
        </div>
        
        <div className="flex items-center space-x-3" role="toolbar" aria-label="Board actions">
          {/* Professional Stats */}
          <div className="hidden sm:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-dark-secondary font-mono text-xs">
                {tasksByStatus.in_progress?.length || 0} <span className="text-dark-tertiary">active</span>
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-dark-secondary font-mono text-xs">
                {tasksByStatus.done?.length || 0} <span className="text-dark-tertiary">done</span>
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
              <span className="text-dark-secondary font-mono text-xs">
                {(tasksByStatus.todo?.length || 0) + (tasksByStatus.blocked?.length || 0)} <span className="text-dark-tertiary">pending</span>
              </span>
            </div>
          </div>
          
          {/* Professional Create Task Button */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] touch-manipulation btn-primary"
            aria-label="Create a new task"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline font-mono">New Task</span>
            <span className="sm:hidden font-mono">+</span>
          </button>
          
          {/* Developer Tools Button */}
          <button
            onClick={handleCreateTestTasks}
            className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 min-h-[44px] touch-manipulation btn-secondary"
            aria-label="Add sample test tasks"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline font-mono text-xs">DEV</span>
          </button>
        </div>
      </header>
      
      {/* Kanban Columns */}
      <div 
        className={`flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 min-h-0 ${
          isUpdatingTask ? 'pointer-events-none opacity-75' : ''
        }`}
        role="application"
        aria-label="Task columns"
        aria-live="polite"
        aria-atomic="false"
      >
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={column.tasks}
            className="min-h-0"
            onTaskDrop={handleTaskDrop}
            draggingTask={draggingTask || touchDragDrop.draggedItem}
            onDragStart={handleDragStart}
            touchHandlers={touchDragDrop}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {isUpdatingTask && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40"
          aria-live="assertive"
          role="status"
        >
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <LoadingSpinner message="Updating task..." size="sm" />
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => setIsTaskModalOpen(true)}
        className="fab flex items-center justify-center"
        aria-label="Quick create task"
        title="Create new task"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </section>
  );
};

export default KanbanBoard;