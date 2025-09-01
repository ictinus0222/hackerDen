import { useState, useEffect } from 'react';
import { cn } from '../lib/utils.ts';
import { userNameService } from '../services/userNameService';
import { useAuth } from '../hooks/useAuth';

const MessageItem = ({ message, isCurrentUser = false, className, onRetry }) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const isSystemMessage = message.type !== 'user';

  // Resolve user name from userId
  useEffect(() => {
    if (isSystemMessage || isCurrentUser) {
      setUserName(isCurrentUser ? 'You' : '');
      return;
    }

    if (message.userId) {
      userNameService.getUserName(message.userId, user)
        .then(name => setUserName(name))
        .catch(() => setUserName('Team Member'));
    } else {
      setUserName('Team Member');
    }
  }, [message.userId, user, isCurrentUser, isSystemMessage]);
  
  // System message styling based on type with enhanced themes and accessibility
  const getSystemMessageStyle = (type) => {
    const styles = {
      // Task-related system messages (enhanced contrast)
      'task_created': 'system-message-task system-message',
      'task_status_changed': 'system-message-task system-message', 
      'task_completed': 'system-message-task system-message',
      
      // Vault-related system messages (enhanced contrast)
      'vault_secret_added': 'system-message-vault-add system-message',
      'vault_secret_updated': 'system-message-vault-update system-message',
      'vault_secret_deleted': 'system-message-vault-delete system-message',
      
      // Default system message
      'system': 'text-muted-foreground bg-muted border-border shadow-sm system-message'
    };
    
    return styles[type] || styles.system;
  };

  // Get appropriate icon for system message type
  const getSystemMessageIcon = (type) => {
    const icons = {
      // Task-related icons
      'task_created': '📝',
      'task_status_changed': '🔄',
      'task_completed': '✅',
      
      // Vault-related icons
      'vault_secret_added': '🔐',
      'vault_secret_updated': '🔄',
      'vault_secret_deleted': '🗑️',
      
      // Default system icon
      'system': 'ℹ️'
    };
    
    return icons[type] || icons.system;
  };

  // Get accessibility label for system message type
  const getSystemMessageLabel = (type) => {
    const labels = {
      'task_created': 'Task creation notification',
      'task_status_changed': 'Task status update notification',
      'task_completed': 'Task completion notification',
      'vault_secret_added': 'Vault secret addition notification',
      'vault_secret_updated': 'Vault secret update notification',
      'vault_secret_deleted': 'Vault secret deletion notification',
      'system': 'System notification'
    };
    
    return labels[type] || labels.system;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isSystemMessage) {
    const messageIcon = getSystemMessageIcon(message.type);
    const accessibilityLabel = getSystemMessageLabel(message.type);
    
    return (
      <div 
        className={cn(
          "mx-2 sm:mx-4 my-2 p-3 sm:p-4 rounded-lg border text-sm chat-transition hover:shadow-md focus-within:shadow-md",
          getSystemMessageStyle(message.type),
          className
        )}
        aria-live="polite"
        role="status"
        aria-label={accessibilityLabel}
        tabIndex={0}
      >
        <div className="flex items-start space-x-2 sm:space-x-3">
          <span 
            className="text-base sm:text-lg leading-none flex-shrink-0 mt-0.5"
            aria-hidden="true"
            role="img"
            aria-label={`${accessibilityLabel} icon`}
          >
            {messageIcon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium leading-relaxed break-words text-sm sm:text-base">
              {message.content}
            </p>
            {message.systemData && (
              <div className="mt-2 text-xs opacity-80 flex flex-wrap gap-1 sm:gap-2">
                {message.systemData.taskTitle && (
                  <span className="inline-block bg-white/50 px-2 py-1 rounded text-xs">
                    Task: {message.systemData.taskTitle}
                  </span>
                )}
                {message.systemData.secretName && (
                  <span className="inline-block bg-white/50 px-2 py-1 rounded text-xs">
                    Secret: {message.systemData.secretName}
                  </span>
                )}
                {message.systemData.assignedTo && (
                  <span className="inline-block bg-white/50 px-2 py-1 rounded text-xs">
                    Assigned: {message.systemData.assignedTo}
                  </span>
                )}
              </div>
            )}
            <p className="text-xs opacity-75 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span>{formatTimestamp(message.$createdAt)}</span>
              {message.systemData?.modifiedBy && (
                <span className="text-xs">by {message.systemData.modifiedBy}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex mb-3 sm:mb-4 px-2 sm:px-4",
        isCurrentUser ? "justify-end" : "justify-start",
        className
      )}
      role="article"
      aria-label={`Message from ${isCurrentUser ? 'you' : userName || 'team member'} at ${formatTimestamp(message.$createdAt)}`}
    >
      <div className={cn(
        "message-max-width px-3 sm:px-4 py-2 sm:py-3 rounded-lg break-words chat-transition",
        isCurrentUser 
          ? "bg-primary text-primary-foreground rounded-br-sm" 
          : "bg-muted text-foreground rounded-bl-sm"
      )}>
        {!isCurrentUser && (
          <p className="text-xs font-medium mb-1 opacity-75" aria-label="Message sender">
            {userName || 'Team Member'}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap" aria-label="Message content">
          {message.content}
        </p>
        <div className={cn(
          "text-xs mt-1 opacity-75 flex items-center gap-1 sm:gap-2",
          isCurrentUser ? "justify-end" : "justify-start"
        )} aria-label="Message timestamp">
          <span>{formatTimestamp(message.$createdAt)}</span>
          {message.isOptimistic && (
            <span className="flex items-center gap-1" aria-label="Message sending">
              <div 
                className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              <span className="text-xs hidden sm:inline">Sending...</span>
              <span className="text-xs sm:hidden">...</span>
            </span>
          )}
          {message.isFailed && (
            <button
              onClick={() => onRetry?.(message.$id)}
              className="touch-target flex items-center gap-1 text-red-500 hover:text-red-600 focus:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-1 rounded transition-colors p-1 -m-1"
              aria-label="Retry sending message"
              title="Click to retry sending this message"
            >
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs underline hidden sm:inline">Retry</span>
              <span className="sr-only sm:hidden">Retry sending message</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;