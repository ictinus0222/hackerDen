import { memo, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { StatusBadge, PriorityBadge, TaskIdBadge, LabelBadge } from './ui/status-badge';
import { useHackathonTeam } from '../hooks/useHackathonTeam';

const TaskCard = memo(({
  task,
  onDragStart,
  isDragging = false,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onDelete,
  onEdit,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize
}) => {
  const { team } = useHackathonTeam(task.hackathonId);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('text/plain', task.$id);
    e.dataTransfer.effectAllowed = 'move';

    // Simplified drag image creation for better performance
    const dragImage = document.createElement('div');
    dragImage.textContent = task.title;
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    // Clean up immediately
    requestAnimationFrame(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    });

    if (onDragStart) {
      onDragStart(task);
    }
  }, [task, onDragStart]);

  const handleTouchStart = useCallback((e) => {
    if (onTouchStart) {
      onTouchStart(e, task);
    }
  }, [onTouchStart, task]);

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
        return 'border-l-muted-foreground/60 bg-gradient-to-r from-muted/50 to-transparent';
      case 'in_progress':
        return 'border-l-primary/80 bg-gradient-to-r from-primary/15 to-transparent';
      case 'blocked':
        return 'border-l-destructive/70 bg-gradient-to-r from-destructive/12 to-transparent';
      case 'done':
        return 'border-l-green-500/80 bg-gradient-to-r from-green-500/15 to-transparent';
      default:
        return 'border-l-muted-foreground/60 bg-gradient-to-r from-muted/50 to-transparent';
    }
  };

  return (
    <Card
      variant="enhanced"
      draggable
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`group cursor-move select-none min-h-[120px] border-l-4 ${getAccentColor(task.status)} ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-xl'
        } transition-all duration-300`}
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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-foreground text-sm leading-relaxed flex-1 pr-2">
            {task.title}
          </h4>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) {
                  onEdit(task);
                }
              }}
              className="h-8 w-8 p-1 hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400 hover:scale-110"
              aria-label={`Edit task: ${task.title}`}
              title="Edit task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) {
                  onDelete(task.$id);
                }
              }}
              className="h-8 w-8 p-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive hover:scale-110"
              aria-label={`Delete task: ${task.title}`}
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TaskIdBadge taskId={task.$id} />
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/20">
              <span className="text-xs font-bold text-primary-foreground">
                {task.title.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task Description */}
        {task.description && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && Array.isArray(task.labels) && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.slice(0, 3).map((label, index) => (
              <LabelBadge key={index} label={label} />
            ))}
            {task.labels.length > 3 && (
              <LabelBadge label={`+${task.labels.length - 3}`} variant="outline" />
            )}
          </div>
        )}

        {/* Professional Progress Indicator */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium font-mono">
                {task.status === 'done' ? '100%' : task.status === 'in_progress' ? '50%' : '0%'}
              </span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${task.status === 'done' ? 'bg-gradient-to-r from-primary to-primary/80 w-full' :
                task.status === 'in_progress' ? 'bg-gradient-to-r from-primary to-primary/60 w-1/2' :
                  task.status === 'blocked' ? 'bg-gradient-to-r from-destructive to-destructive/80 w-1/4' :
                    'bg-muted-foreground w-0'
                }`}
            ></div>
          </div>
        </div>

      </CardContent>

      <CardFooter
        id={`task-${task.$id}-details`}
        className="flex items-center justify-between text-xs pt-3"
      >
        <time
          dateTime={task.$createdAt}
          className="text-muted-foreground text-xs font-mono"
          title={`Created on ${new Date(task.$createdAt).toLocaleString()}`}
        >
          {formatDate(task.$createdAt)}
        </time>
        <div className="flex items-center space-x-2">
          {task.$updatedAt !== task.$createdAt && (
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" title="Recently updated"></div>
          )}
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-muted-foreground font-mono">2</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
});

export default TaskCard;