import React from 'react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

/**
 * System alert component for displaying various types of system messages
 * Uses Shadcn Alert with proper semantic styling
 */
const SystemAlert = ({ 
  type = 'info', 
  title, 
  description, 
  timestamp,
  actions,
  dismissible = false,
  onDismiss,
  className = '',
  ...props 
}) => {
  const getAlertVariant = () => {
    switch (type) {
      case 'error':
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'success':
      case 'info':
      default:
        return 'default';
    }
  };

  const getAlertIcon = () => {
    switch (type) {
      case 'error':
      case 'critical':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeBadge = () => {
    const badgeVariants = {
      error: 'destructive',
      critical: 'destructive',
      warning: 'secondary',
      success: 'default',
      info: 'outline'
    };

    const badgeLabels = {
      error: 'Error',
      critical: 'Critical',
      warning: 'Warning',
      success: 'Success',
      info: 'Info'
    };

    return (
      <Badge variant={badgeVariants[type]} className="text-xs">
        {badgeLabels[type]}
      </Badge>
    );
  };

  return (
    <Alert variant={getAlertVariant()} className={`relative ${className}`} {...props}>
      {getAlertIcon()}
      
      <div className="flex items-start justify-between w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <AlertTitle className="text-sm font-medium">
              {title}
            </AlertTitle>
            {getTypeBadge()}
          </div>
          
          {description && (
            <AlertDescription className="text-sm">
              {description}
            </AlertDescription>
          )}
          
          {timestamp && (
            <div className="text-xs text-muted-foreground mt-2">
              {new Date(timestamp).toLocaleString()}
            </div>
          )}
          
          {actions && (
            <div className="flex items-center space-x-2 mt-3">
              {actions}
            </div>
          )}
        </div>
        
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Dismiss alert"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </Alert>
  );
};

/**
 * Predefined system alert types for common scenarios
 */
export const SystemAlerts = {
  /**
   * Connection-related alerts
   */
  ConnectionLost: (props) => (
    <SystemAlert
      type="error"
      title="Connection Lost"
      description="Your connection to the server has been interrupted. Attempting to reconnect..."
      {...props}
    />
  ),

  ConnectionRestored: (props) => (
    <SystemAlert
      type="success"
      title="Connection Restored"
      description="You are back online. All pending changes have been synchronized."
      {...props}
    />
  ),

  /**
   * Task-related alerts
   */
  TaskSyncError: ({ taskTitle, ...props }) => (
    <SystemAlert
      type="warning"
      title="Task Sync Failed"
      description={`Unable to sync changes for "${taskTitle}". Your changes are saved locally and will sync when connection is restored.`}
      {...props}
    />
  ),

  TaskConflict: ({ taskTitle, ...props }) => (
    <SystemAlert
      type="warning"
      title="Task Conflict Detected"
      description={`"${taskTitle}" was modified by another team member. Please review the changes.`}
      {...props}
    />
  ),

  /**
   * Message-related alerts
   */
  MessageFailed: (props) => (
    <SystemAlert
      type="error"
      title="Message Send Failed"
      description="Your message could not be delivered. Please check your connection and try again."
      {...props}
    />
  ),

  /**
   * System maintenance alerts
   */
  MaintenanceMode: ({ scheduledTime, ...props }) => (
    <SystemAlert
      type="warning"
      title="Scheduled Maintenance"
      description={`System maintenance is scheduled for ${scheduledTime}. Please save your work regularly.`}
      {...props}
    />
  ),

  /**
   * Version update alerts
   */
  UpdateAvailable: ({ onUpdate, ...props }) => (
    <SystemAlert
      type="info"
      title="Update Available"
      description="A new version is available with improved features and bug fixes."
      actions={
        <button
          onClick={onUpdate}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors"
        >
          Update Now
        </button>
      }
      {...props}
    />
  ),

  /**
   * Permission-related alerts
   */
  PermissionDenied: ({ action, ...props }) => (
    <SystemAlert
      type="error"
      title="Permission Denied"
      description={`You don't have permission to ${action}. Please contact your team administrator.`}
      {...props}
    />
  ),

  /**
   * Data validation alerts
   */
  ValidationError: ({ field, message, ...props }) => (
    <SystemAlert
      type="error"
      title="Validation Error"
      description={`${field}: ${message}`}
      {...props}
    />
  )
};

export default SystemAlert;
