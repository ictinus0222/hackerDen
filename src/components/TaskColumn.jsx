import { useState } from 'react';
import TaskCard from './TaskCard';

const TaskColumn = ({ title, status, tasks, className = '', onTaskDrop, draggingTask, onDragStart, touchHandlers, onTaskDelete, onTaskEdit, wipLimit }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const getColumnColor = (status) => {
    switch (status) {
      case 'todo':
        return 'border-gray-300';
      case 'in_progress':
        return 'border-blue-300';
      case 'blocked':
        return 'border-red-300';
      case 'done':
        return 'border-green-300';
      default:
        return 'border-gray-300';
    }
  };

  const getHeaderColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-dark-tertiary text-dark-secondary border-b border-gray-600/20';
      case 'in_progress':
        return 'bg-dark-tertiary text-blue-400 border-b border-blue-500/20';
      case 'blocked':
        return 'bg-dark-tertiary text-red-400 border-b border-red-500/20';
      case 'done':
        return 'bg-dark-tertiary text-green-400 border-b border-green-500/20';
      default:
        return 'bg-dark-tertiary text-dark-secondary border-b border-gray-600/20';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-500 animate-pulse-slow';
      case 'blocked':
        return 'bg-red-500 animate-pulse';
      case 'done':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only set isDragOver to false if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData('text/plain');
    console.log('Drop event in column:', title, 'for task:', taskId);
    
    if (taskId && onTaskDrop) {
      onTaskDrop(taskId, status);
    }
  };

  return (
    <div className={`kanban-column flex flex-col h-full ${className} animate-fade-in`} role="region" aria-label={`${title} tasks`}>
      {/* Modern Column Header */}
      <header className={`kanban-column-header px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${getStatusDot(status)}`}></div>
            <h3 className="font-medium text-gray-200 text-sm truncate" id={`column-${status}`}>
              {title}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span 
              className={`text-xs font-medium px-2 py-1 rounded-md flex-shrink-0 min-w-[24px] text-center ${
                wipLimit && tasks.length >= wipLimit 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                  : 'bg-gray-700/50 text-gray-300'
              }`}
              aria-label={`${tasks.length} tasks in ${title}${wipLimit ? ` (limit: ${wipLimit})` : ''}`}
            >
              {wipLimit ? `${tasks.length}/${wipLimit}` : tasks.length}
            </span>
          </div>
        </div>
      </header>

      {/* Column Content */}
      <div 
        className={`flex-1 p-3 backdrop-blur-sm rounded-b-xl min-h-0 transition-all duration-300 ${
          isDragOver ? 'bg-blue-500/10 border-blue-500/50 border-2 border-dashed shadow-xl' : ''
        }`}
        style={{ background: 'transparent' }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-drop-zone={status}
        role="list"
        aria-labelledby={`column-${status}`}
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="space-y-4 h-full overflow-y-auto hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {tasks.length === 0 ? (
            <div 
              className={`flex flex-col items-center justify-center h-32 sm:h-40 text-gray-500 text-sm text-center transition-all duration-300 rounded-xl border-2 border-dashed border-gray-700/50 ${
                isDragOver ? 'text-blue-400 font-medium border-blue-500/50 bg-blue-500/5' : ''
              }`}
              role="status"
              aria-live="polite"
            >
              {isDragOver ? (
                <>
                  <svg className="w-8 h-8 mb-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="font-medium">Drop task here</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span className="font-mono text-xs opacity-75">No tasks</span>
                </>
              )}
            </div>
          ) : (
            tasks.map((task, index) => (
              <div key={task.$id} role="listitem" style={{ animationDelay: `${index * 0.1}s` }}>
                <TaskCard 
                  task={task} 
                  isDragging={draggingTask?.$id === task.$id}
                  onDragStart={onDragStart}
                  onTouchStart={touchHandlers?.handleTouchStart}
                  onTouchMove={touchHandlers?.handleTouchMove}
                  onTouchEnd={(e) => touchHandlers?.handleTouchEnd(e, onTaskDrop)}
                  onDelete={onTaskDelete}
                  onEdit={onTaskEdit}
                  aria-posinset={index + 1}
                  aria-setsize={tasks.length}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskColumn;