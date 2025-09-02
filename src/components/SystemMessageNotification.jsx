import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { X, CheckCircle, AlertCircle, Info, Trash2, Plus, Edit } from 'lucide-react';
import { cn } from '../lib/utils';

const SystemMessageNotification = ({ 
  notifications = [], 
  onDismiss,
  className,
  maxVisible = 3,
  autoHideDuration = 5000
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [dismissingIds, setDismissingIds] = useState(new Set());

  // Update visible notifications when new ones arrive
  useEffect(() => {
    if (notifications.length > 0) {
      // Show only the most recent notifications
      const recent = notifications
        .slice(-maxVisible)
        .map(notification => ({
          ...notification,
          id: notification.id || `${notification.type}_${Date.now()}_${Math.random()}`,
          showTime: Date.now()
        }));
      
      setVisibleNotifications(recent);
    }
  }, [notifications, maxVisible]);

  // Auto-hide notifications
  useEffect(() => {
    if (autoHideDuration <= 0) return;

    const timers = visibleNotifications.map(notification => {
      return setTimeout(() => {
        handleDismiss(notification.id);
      }, autoHideDuration);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleNotifications, autoHideDuration]);

  const handleDismiss = (notificationId) => {
    setDismissingIds(prev => new Set([...prev, notificationId]));
    
    setTimeout(() => {
      setVisibleNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      setDismissingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      
      if (onDismiss) {
        onDismiss(notificationId);
      }
    }, 300); // Match animation duration
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'task_created': Plus,
      'task_status_changed': Edit,
      'task_completed': CheckCircle,
      'vault_secret_added': Plus,
      'vault_secret_updated': Edit,
      'vault_secret_deleted': Trash2,
      'system': Info
    };
    
    return iconMap[type] || Info;
  };

  const getNotificationVariant = (type) => {
    const variantMap = {
      'task_completed': 'default', // Success-like
      'vault_secret_deleted': 'destructive',
      'task_created': 'default',
      'task_status_changed': 'default',
      'vault_secret_added': 'default',
      'vault_secret_updated': 'default',
      'system': 'default'
    };
    
    return variantMap[type] || 'default';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'task_created': 'text-blue-600 bg-blue-50 border-blue-200',
      'task_status_changed': 'text-orange-600 bg-orange-50 border-orange-200',
      'task_completed': 'text-green-600 bg-green-50 border-green-200',
      'vault_secret_added': 'text-purple-600 bg-purple-50 border-purple-200',
      'vault_secret_updated': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'vault_secret_deleted': 'text-red-600 bg-red-50 border-red-200',
      'system': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    
    return colorMap[type] || colorMap.system;
  };

  const getNotificationEmoji = (type) => {
    const emojiMap = {
      'task_created': '📝',
      'task_status_changed': '🔄',
      'task_completed': '✅',
      'vault_secret_added': '🔐',
      'vault_secret_updated': '🔄',
      'vault_secret_deleted': '🗑️',
      'system': 'ℹ️'
    };
    
    return emojiMap[type] || emojiMap.system;
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50 space-y-2", className)}>
      {visibleNotifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type);
        const variant = getNotificationVariant(notification.type);
        const colorClasses = getNotificationColor(notification.type);
        const emoji = getNotificationEmoji(notification.type);
        const isDismissing = dismissingIds.has(notification.id);

        return (
          <div
            key={notification.id}
            className={cn(
              "transform transition-all duration-300 ease-in-out",
              isDismissing 
                ? "translate-x-full opacity-0 scale-95" 
                : "translate-x-0 opacity-100 scale-100"
            )}
          >
            <Alert 
              variant={variant}
              className={cn(
                "min-w-80 max-w-md shadow-lg border-l-4",
                colorClasses,
                "animate-slide-in-right"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-lg" role="img" aria-label={`${notification.type} notification`}>
                      {emoji}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <Badge variant="secondary" className="text-xs">
                        {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    
                    <AlertDescription className="text-sm font-medium">
                      {notification.content}
                    </AlertDescription>
                    
                    {notification.relatedId && (
                      <div className="mt-1 text-xs opacity-75">
                        ID: {notification.relatedId}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Progress bar for auto-hide */}
              {autoHideDuration > 0 && (
                <div className="mt-2 w-full bg-black/10 rounded-full h-1">
                  <div 
                    className="h-1 bg-current rounded-full animate-shrink-width"
                    style={{ animationDuration: `${autoHideDuration}ms` }}
                  />
                </div>
              )}
            </Alert>
          </div>
        );
      })}
    </div>
  );
};

export default SystemMessageNotification;