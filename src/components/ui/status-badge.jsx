import { Badge } from './badge';

/**
 * Status Badge Component for Task Status Display
 * Provides consistent status visualization across the application
 */
export function StatusBadge({ status, className, ...props }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'todo':
        return {
          variant: 'todo',
          label: 'To-Do',
          icon: '📋'
        };
      case 'in_progress':
        return {
          variant: 'in-progress',
          label: 'In Progress',
          icon: '⚡'
        };
      case 'blocked':
        return {
          variant: 'blocked',
          label: 'Blocked',
          icon: '🚫'
        };
      case 'done':
        return {
          variant: 'done',
          label: 'Done',
          icon: '✅'
        };
      default:
        return {
          variant: 'todo',
          label: status || 'Unknown',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={className}
      aria-label={`Status: ${config.label}`}
      {...props}
    >
      <span className="mr-1" aria-hidden="true">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

/**
 * Priority Badge Component for Task Priority Display
 * Provides consistent priority visualization across the application
 */
export function PriorityBadge({ priority, className, showLabel = false, ...props }) {
  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'high':
        return {
          variant: 'priority-high',
          label: 'High',
          icon: '🔴',
          ariaLabel: 'High Priority'
        };
      case 'medium':
        return {
          variant: 'priority-medium',
          label: 'Medium',
          icon: '🟡',
          ariaLabel: 'Medium Priority'
        };
      case 'low':
        return {
          variant: 'priority-low',
          label: 'Low',
          icon: '🟢',
          ariaLabel: 'Low Priority'
        };
      default:
        return {
          variant: 'priority-medium',
          label: 'Medium',
          icon: '🟡',
          ariaLabel: 'Medium Priority (Default)'
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge
      variant={config.variant}
      className={className}
      aria-label={config.ariaLabel}
      title={config.ariaLabel}
      {...props}
    >
      <span aria-hidden="true">{config.icon}</span>
      {showLabel && <span className="ml-1">{config.label}</span>}
    </Badge>
  );
}

/**
 * Task ID Badge Component for displaying task identifiers
 */
export function TaskIdBadge({ taskId, className, ...props }) {
  const shortId = taskId?.slice(-4) || '????';
  
  return (
    <Badge
      variant="outline"
      className={`font-mono ${className}`}
      aria-label={`Task ID: ${shortId}`}
      title={`Task ID: ${taskId}`}
      {...props}
    >
      #{shortId}
    </Badge>
  );
}

/**
 * Label Badge Component for task labels/tags
 */
export function LabelBadge({ label, className, ...props }) {
  return (
    <Badge
      variant="secondary"
      className={className}
      aria-label={`Label: ${label}`}
      {...props}
    >
      {label}
    </Badge>
  );
}