import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { TaskColumn } from './TaskColumn';
import { TaskModal } from './TaskModal';
import { ConnectionStatus } from './ConnectionStatus';
import { taskApi } from '../services/api';
import { useTaskRealtime } from '../hooks/useSocket';
import type { Task, TaskColumn as TaskColumnType, TeamMember } from '../types';

// Multi-backend configuration for both desktop and mobile
const getBackend = () => {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return isTouchDevice ? TouchBackend : HTML5Backend;
};

const getBackendOptions = () => {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return isTouchDevice ? {
    enableMouseEvents: true,
    delayTouchStart: 200,
    delayMouseStart: 0,
  } : {};
};

interface TaskBoardProps {
  projectId: string;
  teamMembers: TeamMember[];
}

const DEFAULT_COLUMNS: TaskColumnType[] = [
  { id: 'todo', name: 'todo', displayName: 'To Do', order: 1 },
  { id: 'inprogress', name: 'inprogress', displayName: 'In Progress', order: 2 },
  { id: 'done', name: 'done', displayName: 'Done', order: 3 },
];

const TaskBoard: React.FC<TaskBoardProps> = ({
  projectId,
  teamMembers,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskColumnId, setNewTaskColumnId] = useState<string>('');

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [projectId]);

  // Real-time task updates
  const handleTaskCreated = useCallback((task: Task) => {
    setTasks(prevTasks => {
      // Avoid duplicates
      if (prevTasks.some(t => t.id === task.id)) {
        return prevTasks;
      }
      return [...prevTasks, task];
    });
  }, []);

  const handleTaskUpdated = useCallback((task: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(t => t.id === task.id ? task : t)
    );
  }, []);

  const handleTaskMoved = useCallback((task: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(t => t.id === task.id ? task : t)
    );
  }, []);

  const handleTaskDeleted = useCallback(({ taskId }: { taskId: string }) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  }, []);

  useTaskRealtime(
    projectId,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskMoved,
    handleTaskDeleted
  );

  const loadTasks = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff

    try {
      if (retryCount === 0) {
        setLoading(true);
        setError(null);
      }
      const fetchedTasks = await taskApi.getByProject(projectId);
      setTasks(fetchedTasks);
      setError(null);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      
      if (retryCount < maxRetries && errorMessage.includes('Network')) {
        // Retry on network errors
        setError(`${errorMessage} (Retrying in ${retryDelay / 1000}s...)`);
        setTimeout(() => {
          loadTasks(retryCount + 1);
        }, retryDelay);
      } else {
        setError(errorMessage);
        setLoading(false);
      }
    }
  };

  const handleTaskMove = async (taskId: string, newColumnId: string) => {
    // Optimistic update
    const taskToMove = tasks.find(task => task.id === taskId);
    if (!taskToMove || taskToMove.columnId === newColumnId) return;

    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, columnId: newColumnId, updatedAt: new Date() } : task
    );
    setTasks(updatedTasks);

    try {
      const updatedTask = await taskApi.update(taskId, { columnId: newColumnId });
      // Update with server response to ensure consistency
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? updatedTask : task)
      );
      setError(null);
    } catch (err) {
      // Revert on error
      setTasks(originalTasks);
      setError(err instanceof Error ? err.message : 'Failed to move task');
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    // Optimistic update
    const originalTasks = tasks;
    setTasks(tasks.filter(task => task.id !== taskId));

    try {
      await taskApi.delete(taskId);
    } catch (err) {
      // Revert on error
      setTasks(originalTasks);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleAddTask = (columnId: string) => {
    setNewTaskColumnId(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleTaskSave = async (taskData: {
    title: string;
    description?: string;
    assignedTo?: string;
    columnId: string;
  }): Promise<void> => {
    // Validate required fields
    if (!taskData.title.trim()) {
      setError('Task title is required');
      throw new Error('Task title is required');
    }

    const originalTasks = [...tasks];

    try {
      if (editingTask) {
        // Optimistic update for editing
        const optimisticTask = { ...editingTask, ...taskData, updatedAt: new Date() };
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? optimisticTask : task
        ));

        // Update existing task
        const updatedTask = await taskApi.update(editingTask.id, taskData);
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ));
      } else {
        // Create new task
        const newTask = await taskApi.create(projectId, taskData);
        setTasks(prevTasks => [...prevTasks, newTask]);
      }
      setError(null);
    } catch (err) {
      // Revert optimistic update on error
      setTasks(originalTasks);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save task';
      setError(errorMessage);
      throw err; // Re-throw to prevent modal from closing
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setNewTaskColumnId('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="task-board-loading">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={getBackend()} options={getBackendOptions()}>
      <div className="h-full" data-testid="task-board">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Task Board</h2>
          <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
            <ConnectionStatus />
            <button
              onClick={() => handleAddTask('todo')}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 flex items-center text-sm sm:text-base"
              data-testid="add-task-button"
            >
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden xs:inline">Add Task</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4" data-testid="error-message">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex items-center space-x-2">
                {(error.includes('Failed to load') || error.includes('Network unavailable') || error.includes('Persistent error')) && (
                  <button
                    onClick={() => loadTasks()}
                    className="text-red-600 hover:text-red-800 underline text-sm"
                    data-testid="retry-button"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 text-lg leading-none"
                  data-testid="dismiss-error"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {DEFAULT_COLUMNS.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasks}
              teamMembers={teamMembers}
              onTaskMove={handleTaskMove}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <TaskModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleTaskSave}
          task={editingTask}
          columnId={newTaskColumnId}
          teamMembers={teamMembers}
        />
      </div>
    </DndProvider>
  );
};export
 default TaskBoard;