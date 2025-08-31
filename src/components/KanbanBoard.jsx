import { useState, useEffect, useCallback, useMemo } from 'react';
import { useHackathonTasks } from '../hooks/useHackathonTasks';
import { useAuth } from '../hooks/useAuth';
import { useTouchDragDrop } from '../hooks/useTouchDragDrop';
import { taskService } from '../services/taskService';
import TaskColumn from './TaskColumn';
import TaskModal from './TaskModal';
import LoadingSpinner from './LoadingSpinner';
import { KanbanColumnSkeleton } from './SkeletonLoader';
import AppwriteSetupGuide from './AppwriteSetupGuide';
import { createTestTasks } from '../utils/testData';
import { Button } from './ui/button';

const KanbanBoard = () => {
  const { tasksByStatus, loading, error, refetch, team, hackathonId } = useHackathonTasks();
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);

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
      await taskService.deleteTask(taskId);
      refetch(); // Refresh the tasks after deletion
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
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

  const handleTaskDrop = useCallback(async (taskId, newStatus) => {
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

    // Clear dragging state immediately for smooth UX
    setDraggingTask(null);

    try {
      console.log('Updating task status from', task.status, 'to', newStatus);
      
      // Make API call and refresh silently in background
      await taskService.updateTaskStatus(taskId, newStatus, task.title, team.$id, hackathonId, user?.$id);
      console.log('Task status updated successfully');
      
      // Silent refresh without loading state
      refetch();
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
      // Refetch to restore correct state
      refetch();
    }
  }, [tasksByStatus, team?.$id, hackathonId, user?.$id, refetch]);

  const handleDragStart = useCallback((task) => {
    console.log('Starting drag for task:', task.title);
    setDraggingTask(task);
  }, []);

  // Add CSS for touch drag feedback and performance optimizations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .touch-drag-over {
        background-color: rgb(219 234 254) !important;
        border-color: rgb(59 130 246) !important;
        border-width: 2px !important;
        border-style: dashed !important;
        transform: translateZ(0); /* Force hardware acceleration */
      }
      
      .kanban-column {
        contain: layout style paint; /* CSS containment for better performance */
        will-change: auto;
      }
      
      .dragging {
        will-change: transform;
        transform: translateZ(0); /* Force hardware acceleration */
      }
      
      /* Optimize scrolling performance */
      .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
        -webkit-overflow-scrolling: touch;
      }
      
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Memoized filter function for better performance
  const filterTasks = useCallback((tasks) => {
    return tasks.filter(task => {
      const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
      const labelMatch = filters.label === 'all' || (task.labels && Array.isArray(task.labels) && task.labels.includes(filters.label));
      const searchMatch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());
      return priorityMatch && labelMatch && searchMatch;
    });
  }, [filters]);

  // Memoized labels calculation
  const allLabels = useMemo(() => {
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
  }, [tasksByStatus]);

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(() => [
    { title: 'To-Do', status: 'todo', tasks: filterTasks(tasksByStatus.todo) },
    { title: 'In Progress', status: 'in_progress', tasks: filterTasks(tasksByStatus.in_progress) },
    { title: 'Blocked', status: 'blocked', tasks: filterTasks(tasksByStatus.blocked) },
    { title: 'Done', status: 'done', tasks: filterTasks(tasksByStatus.done) }
  ], [tasksByStatus, filterTasks]);

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
              {allLabels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
          




        </div>
      </header>
      
      {/* Kanban Columns */}
      <div 
        className="flex-1 grid grid-cols-4 gap-6 min-h-0 overflow-y-auto hide-scrollbar"
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



      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleModalClose}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        editTask={editingTask}
      />

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsTaskModalOpen(true)}
        className="fab flex items-center justify-center fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        aria-label="Quick create task"
        title="Create new task"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    </section>
  );
};

export default KanbanBoard;