import React from 'react';
import { useDrop } from 'react-dnd';
import { TaskCard } from './TaskCard';
import type { Task, TaskColumn as TaskColumnType, TeamMember } from '../types';

interface TaskColumnProps {
  column: TaskColumnType;
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask: (columnId: string) => void;
}

interface DragItem {
  type: string;
  id: string;
  columnId: string;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  tasks,
  teamMembers,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  onAddTask,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: 'task',
    drop: (item) => {
      if (item.columnId !== column.id) {
        onTaskMove(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const columnTasks = tasks
    .filter(task => task.columnId === column.id)
    .sort((a, b) => a.order - b.order);

  const getColumnColor = (columnName: string) => {
    switch (columnName) {
      case 'todo':
        return 'bg-gray-50 border-gray-200';
      case 'inprogress':
        return 'bg-blue-50 border-blue-200';
      case 'done':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getHeaderColor = (columnName: string) => {
    switch (columnName) {
      case 'todo':
        return 'text-gray-700';
      case 'inprogress':
        return 'text-blue-700';
      case 'done':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-80 ${getColumnColor(column.name)} border rounded-lg p-4 ${
        isOver && canDrop ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
      }`}
      data-testid={`task-column-${column.id}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className={`font-semibold text-sm ${getHeaderColor(column.name)}`}>
            {column.displayName}
          </h3>
          <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        
        <button
          onClick={() => onAddTask(column.id)}
          className="text-gray-400 hover:text-gray-600 p-1"
          data-testid={`add-task-${column.id}`}
          title="Add task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2 min-h-32">
        {columnTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            teamMembers={teamMembers}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
          />
        ))}
        
        {columnTasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            {isOver && canDrop ? 'Drop task here' : 'No tasks'}
          </div>
        )}
      </div>
    </div>
  );
};