import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '../lib/utils';

const GroupedNotificationSummary = ({ 
  groupedNotifications, 
  onDismissGroup,
  className 
}) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const getGroupSummary = (groupKey, notifications) => {
    const [type] = groupKey.split('_');
    const count = notifications.length;
    
    const summaryMap = {
      'task': {
        title: 'Task Updates',
        description: `${count} task ${count === 1 ? 'update' : 'updates'}`,
        emoji: '📝',
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      },
      'vault': {
        title: 'Vault Changes',
        description: `${count} vault ${count === 1 ? 'change' : 'changes'}`,
        emoji: '🔐',
        color: 'text-purple-600 bg-purple-50 border-purple-200'
      },
      'system': {
        title: 'System Updates',
        description: `${count} system ${count === 1 ? 'update' : 'updates'}`,
        emoji: 'ℹ️',
        color: 'text-gray-600 bg-gray-50 border-gray-200'
      }
    };

    return summaryMap[type] || summaryMap.system;
  };

  const formatTimestamp = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (!groupedNotifications || groupedNotifications.size === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from(groupedNotifications.entries()).map(([groupKey, notifications]) => {
        if (notifications.length === 0) return null;
        
        const summary = getGroupSummary(groupKey, notifications);
        const isExpanded = expandedGroups.has(groupKey);
        const latestNotification = notifications[notifications.length - 1];

        return (
          <Alert 
            key={groupKey}
            className={cn(
              "border-l-4 shadow-sm transition-all duration-200",
              summary.color,
              isExpanded && "shadow-md"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-lg flex-shrink-0 mt-0.5" role="img">
                  {summary.emoji}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <AlertTitle className="text-sm font-medium">
                      {summary.title}
                    </AlertTitle>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {notifications.length}
                      </Badge>
                      
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors"
                        aria-label={isExpanded ? 'Collapse group' : 'Expand group'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <AlertDescription className="text-sm">
                    {summary.description}
                    <span className="text-xs opacity-75 ml-2">
                      • {formatTimestamp(latestNotification.timestamp)}
                    </span>
                  </AlertDescription>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t border-current/20 pt-2">
                      {notifications.slice(-5).map((notification, index) => (
                        <div 
                          key={`${notification.id || index}`}
                          className="text-xs p-2 rounded bg-white/50 border border-current/10"
                        >
                          <div className="font-medium mb-1">
                            {notification.content}
                          </div>
                          <div className="text-xs opacity-75">
                            {formatTimestamp(notification.timestamp)}
                            {notification.relatedId && (
                              <span className="ml-2">• ID: {notification.relatedId}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {notifications.length > 5 && (
                        <div className="text-xs text-center opacity-75 py-1">
                          ... and {notifications.length - 5} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onDismissGroup?.(groupKey)}
                className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Dismiss group"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Alert>
        );
      })}
    </div>
  );
};

export default GroupedNotificationSummary;