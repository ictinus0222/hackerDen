const TaskCard = ({ 
  task, 
  onDragStart, 
  isDragging = false, 
  onTouchStart, 
  onTouchMove, 
  onTouchEnd,
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'status-todo';
      case 'in_progress':
        return 'status-progress';
      case 'blocked':
        return 'status-blocked';
      case 'done':
        return 'status-done';
      default:
        return 'status-todo';
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

  return (
    <article 
      draggable
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-move select-none touch-manipulation min-h-[120px] card-enhanced animate-slide-up ${
        isDragging ? 'dragging opacity-60' : ''
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
      {/* Professional Task Header */}
      <header className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-dark-primary text-sm line-clamp-2 mb-2 leading-tight">
            {task.title}
          </h4>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {task.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-dark-tertiary font-mono">
              #{task.$id.slice(-4)}
            </span>
          </div>
        </div>
        <span 
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${getStatusColor(task.status)}`}
          aria-label={`Status: ${getStatusLabel(task.status)}`}
        >
          {getStatusLabel(task.status)}
        </span>
      </header>

      {/* Task Description */}
      {task.description && (
        <div className="mb-4">
          <p className="text-dark-secondary text-xs leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>
      )}

      {/* Professional Progress Indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-dark-tertiary font-mono">progress</span>
          <span className="text-dark-secondary font-mono">
            {task.status === 'done' ? '100%' : task.status === 'in_progress' ? '50%' : '0%'}
          </span>
        </div>
        <div className="w-full bg-dark-tertiary rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-500 ${
              task.status === 'done' ? 'bg-green-500 w-full' : 
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
        className="flex items-center justify-between text-xs border-t border-dark-primary pt-3"
      >
        <time 
          dateTime={task.$createdAt}
          className="text-dark-muted font-mono"
          title={`Created on ${new Date(task.$createdAt).toLocaleString()}`}
        >
          {formatDate(task.$createdAt)}
        </time>
        <div className="flex items-center space-x-2">
          {task.$updatedAt !== task.$createdAt && (
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" title="Recently updated"></div>
          )}
          <svg className="w-3 h-3 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
      </footer>
    </article>
  );
};

export default TaskCard;