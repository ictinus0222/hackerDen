import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import type { Task, TeamMember } from '../types';

interface TaskCardProps {
  task: Task;
  teamMembers: TeamMember[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

interface DragItem {
  type: string;
  id: string;
  columnId: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  teamMembers,
  onEdit,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'task',
    item: { type: 'task', id: task.id, columnId: task.columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const assignedMember = teamMembers.find(member => member.id === task.assignedTo);

  const handleEdit = () => {
    setIsMenuOpen(false);
    onEdit(task);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    onDelete(task.id);
  };

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg border border-gray-200 p-3 mb-2 cursor-move shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
      data-testid={`task-card-${task.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="relative ml-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-gray-600 p-1"
            data-testid={`task-menu-${task.id}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-24">
              <button
                onClick={handleEdit}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                data-testid={`edit-task-${task.id}`}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                data-testid={`delete-task-${task.id}`}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {assignedMember && (
        <div className="mt-2 flex items-center">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              {assignedMember.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="ml-2 text-xs text-gray-600">
            {assignedMember.name}
          </span>
        </div>
      )}
    </div>
  );
};