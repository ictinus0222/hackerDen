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
  const [editingTask, setEditingTask] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    label: 'all',
    search: ''
  });
  
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

  const handleTaskDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setIsUpdatingTask(true);
      await taskService.deleteTask(taskId);
      refetch(); // Refresh the tasks after deletion
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsUpdatingTask(false);
    }
  };



  const handleTaskCreated = (newTask) => {
    // The real-time subscription in useTasks will handle adding the new task
    // This callback can be used for additional actions if needed
    console.log('New task created:', newTask);
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    // The real-time subscription in useTasks will handle updating the task
    // This callback can be used for additional actions if needed
    console.log('Task updated:', updatedTask);
    setEditingTask(null);
  };

  const handleModalClose = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  // WIP Limits configuration
  const WIP_LIMITS = {
    todo: null, // No limit for backlog
    in_progress: 3,
    blocked: 2,
    done: null // No limit for completed tasks
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

    // Check WIP limits before moving
    const wipLimit = WIP_LIMITS[newStatus];
    if (wipLimit && tasksByStatus[newStatus].length >= wipLimit) {
      alert(`Cannot move task: ${newStatus.replace('_', ' ')} column has reached its WIP limit of ${wipLimit} tasks.`);
      return;
    }

    try {
      setIsUpdatingTask(true);
      console.log('Updating task status from', task.status, 'to', newStatus);
      await taskService.updateTaskStatus(taskId, newStatus, task.title, team.$id, user?.$id);
      console.log('Task status updated successfully');
      // The real-time subscription will handle updating the UI
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
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

  // Filter tasks based on current filters
  const filterTasks = (tasks) => {
    return tasks.filter(task => {
      const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
      const labelMatch = filters.label === 'all' || (task.labels && Array.isArray(task.labels) && task.labels.includes(filters.label));
      const searchMatch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());
      return priorityMatch && labelMatch && searchMatch;
    });
  };

  // Get all unique labels for filter dropdown
  const getAllLabels = () => {
    const allTasks = [
      ...tasksByStatus.todo,
      ...tasksByStatus.in_progress,
      ...tasksByStatus.blocked,
      ...tasksByStatus.done
    ];
    const labels = new Set();
    allTasks.forEach(task => {
      if (task.labels && Array.isArray(task.labels)) {
        task.labels.forEach(label => labels.add(label));
      }
    });
    return Array.from(labels);
  };

  const columns = [
    { title: 'To-Do', status: 'todo', tasks: filterTasks(tasksByStatus.todo) },
    { title: 'In Progress', status: 'in_progress', tasks: filterTasks(tasksByStatus.in_progress) },
    { title: 'Blocked', status: 'blocked', tasks: filterTasks(tasksByStatus.blocked) },
    { title: 'Done', status: 'done', tasks: filterTasks(tasksByStatus.done) }
  ];

  if (loading) {
    return (
      <div className="card p-6 h-full flex flex-col fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 sm:gap-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-4 gap-6 min-h-0 overflow-y-auto">
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
      <div className="card p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kanban Board</h2>
        <div className="h-96 overflow-y-auto">
          <AppwriteSetupGuide error={error} />
        </div>
      </div>
    );
  }

  return (
    <section 
      className="backdrop-blur-sm rounded-xl shadow-2xl p-6 h-full flex flex-col fade-in"
      style={{ background: 'transparent' }}
      aria-label="Kanban task board"
    >
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 sm:gap-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-2 ring-green-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Kanban Board</h2>
        </div>
        
        <div className="flex items-center space-x-3" role="toolbar" aria-label="Board actions">
          {/* Professional Stats */}
          <div className="hidden sm:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-slate-300 font-mono text-xs">
                {tasksByStatus.in_progress?.length || 0} <span className="text-slate-400">active</span>
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-slate-300 font-mono text-xs">
                {tasksByStatus.done?.length || 0} <span className="text-slate-400">done</span>
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
              <span className="text-slate-300 font-mono text-xs">
                {(tasksByStatus.todo?.length || 0) + (tasksByStatus.blocked?.length || 0)} <span className="text-slate-400">pending</span>
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="px-3 py-1.5 text-xs bg-slate-800/60 text-slate-300 rounded-md border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 w-32 placeholder-slate-400"
            />
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-1.5 text-xs bg-slate-800/60 text-slate-300 rounded-md border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            
            <select
              value={filters.label}
              onChange={(e) => setFilters(prev => ({ ...prev, label: e.target.value }))}
              className="px-3 py-1.5 text-xs bg-slate-800/60 text-slate-300 rounded-md border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Labels</option>
              {getAllLabels().map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
          


          {/* Professional Create Task Button */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 min-h-[44px] touch-manipulation bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
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
            className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 min-h-[44px] touch-manipulation bg-slate-700/60 text-slate-300 hover:bg-slate-600/60 transition-all duration-200"
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
        className={`flex-1 grid grid-cols-4 gap-6 min-h-0 overflow-y-auto ${
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
            onTaskDelete={handleTaskDelete}
            onTaskEdit={handleTaskEdit}
            wipLimit={WIP_LIMITS[column.status]}
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
        onClose={handleModalClose}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        editTask={editingTask}
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