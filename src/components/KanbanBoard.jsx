import { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import { useTouchDragDrop } from '../hooks/useTouchDragDrop';
import { taskService } from '../services/taskService';
import TaskColumn from './TaskColumn';
import TaskModal from './TaskModal';
import LoadingSpinner from './LoadingSpinner';
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
      await taskService.updateTaskStatus(taskId, newStatus);
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
      <div className="bg-white rounded-lg shadow p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kanban Board</h2>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner message="Loading tasks..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kanban Board</h2>
        <div className="h-96 overflow-y-auto">
          <AppwriteSetupGuide error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Kanban Board</h2>
        
        <div className="flex items-center space-x-2">
          {/* Create Task Button */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Create Task
          </button>
          
          {/* Temporary test button - will be removed in later tasks */}
          <button
            onClick={handleCreateTestTasks}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Add Test Tasks
          </button>
        </div>
      </div>
      
      {/* Kanban Columns */}
      <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-0 ${
        isUpdatingTask ? 'pointer-events-none opacity-75' : ''
      }`}>
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

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default KanbanBoard;