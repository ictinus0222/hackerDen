const TaskCard = ({
  task,
  onDragStart,
  isDragging = false,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onDelete,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.$id);
    e.dataTransfer.effectAllowed = 'move';

    // Create a custom drag image for better visual feedback
    const dragImage = e.target.cloneNode(true);
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    // Clean up the drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);

    if (onDragStart) {
      onDragStart(task);
    }
  };

  const handleTouchStart = (e) => {
    if (onTouchStart) {
      onTouchStart(e, task);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo':
        return 'To-Do';
      case 'in_progress':
        return 'In Progress';
      case 'blocked':
        return 'Blocked';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const getAccentColor = (status) => {
    switch (status) {
      case 'todo':
        return 'border-l-gray-400/50 bg-gradient-to-r from-gray-500/5 to-transparent';
      case 'in_progress':
        return 'border-l-blue-400/50 bg-gradient-to-r from-blue-500/5 to-transparent';
      case 'blocked':
        return 'border-l-red-400/50 bg-gradient-to-r from-red-500/5 to-transparent';
      case 'done':
        return 'border-l-emerald-400/50 bg-gradient-to-r from-emerald-500/5 to-transparent';
      default:
        return 'border-l-gray-400/50 bg-gradient-to-r from-gray-500/5 to-transparent';
    }
  };

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`card card-hover group p-4 cursor-move select-none min-h-[120px] slide-up border-l-4 ${getAccentColor(task.status)} ${isDragging ? 'dragging' : ''
        }`}
      tabIndex="0"
      role="button"
      aria-label={`Task: ${task.title}. Status: ${getStatusLabel(task.status)}. ${task.description ? `Description: ${task.description}` : ''}`}
      aria-describedby={`task-${task.$id}-details`}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Could trigger task edit modal here
        }
      }}
    >
      {/* Task Header */}
      <header className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-100 text-sm leading-relaxed flex-1 pr-2">
            {task.title}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(task.$id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex-shrink-0"
            aria-label={`Delete task: ${task.title}`}
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-mono">
              #{task.$id.slice(-4)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${(task.priority === 'high') ? 'bg-red-500/20 text-red-300' :
                (task.priority === 'medium') ? 'bg-yellow-500/20 text-yellow-300' :
                  (task.priority === 'low') ? 'bg-green-500/20 text-green-300' :
                    'bg-yellow-500/20 text-yellow-300' // Default to medium if no priority
              }`}>
              {(task.priority === 'high') ? '🔴' :
                (task.priority === 'medium') ? '🟡' :
                  (task.priority === 'low') ? '🟢' : '🟡'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {task.title.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Task Description */}
      {task.description && (
        <div className="mb-4">
          <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {task.labels.slice(0, 3).map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                {label}
              </span>
            ))}
            {task.labels.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-500/20 text-gray-400">
                +{task.labels.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Professional Progress Indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-300 font-medium">
              {task.status === 'done' ? '100%' : task.status === 'in_progress' ? '50%' : '0%'}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${task.status === 'done' ? 'bg-emerald-500 w-full' :
              task.status === 'in_progress' ? 'bg-blue-500 w-1/2' :
                task.status === 'blocked' ? 'bg-red-500 w-1/4' :
                  'bg-gray-600 w-0'
              }`}
          ></div>
        </div>
      </div>

      {/* Professional Task Footer */}
      <footer
        id={`task-${task.$id}-details`}
        className="flex items-center justify-between text-xs border-t border-gray-700/50 pt-3"
      >
        <time
          dateTime={task.$createdAt}
          className="text-gray-400 text-xs"
          title={`Created on ${new Date(task.$createdAt).toLocaleString()}`}
        >
          {formatDate(task.$createdAt)}
        </time>
        <div className="flex items-center space-x-2">
          {task.$updatedAt !== task.$createdAt && (
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" title="Recently updated"></div>
          )}
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-gray-500">2</span>
          </div>
        </div>
      </footer>
    </article>
  );
};

export default TaskCard;