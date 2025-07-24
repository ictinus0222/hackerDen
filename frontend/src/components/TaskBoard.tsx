import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TaskColumn } from './TaskColumn';
import { TaskModal } from './TaskModal';
import { taskApi } from '../services/api';
import type { Task, TaskColumn as TaskColumnType, TeamMember } from '../types';

interface TaskBoardProps {
  projectId: string;
  teamMembers: TeamMember[];
}

const DEFAULT_COLUMNS: TaskColumnType[] = [
  { id: 'todo', name: 'todo', displayName: 'To Do', order: 1 },
  { id: 'inprogress', name: 'inprogress', displayName: 'In Progress', order: 2 },
  { id: 'done', name: 'done', displayName: 'Done', order: 3 },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
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

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskApi.getByProject(projectId);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newColumnId: string) => {
    // Optimistic update
    const taskToMove = tasks.find(task => task.id === taskId);
    if (!taskToMove) return;

    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, columnId: newColumnId } : task
    );
    setTasks(updatedTasks);

    try {
      await taskApi.update(taskId, { columnId: newColumnId });
    } catch (err) {
      // Revert on error
      setTasks(tasks);
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
  }) => {
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await taskApi.update(editingTask.id, taskData);
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ));
      } else {
        // Create new task
        const newTask = await taskApi.create(projectId, taskData);
        setTasks([...tasks, newTask]);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
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
    <DndProvider backend={HTML5Backend}>
      <div className="h-full" data-testid="task-board">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Task Board</h2>
          <button
            onClick={() => handleAddTask('todo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            data-testid="add-task-button"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4" data-testid="error-message">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-6 overflow-x-auto pb-4">
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
};