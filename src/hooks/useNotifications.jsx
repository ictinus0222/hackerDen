import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

export const useNotifications = (teamId) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(true); // Track if page is visible
  const [lastReadTimestamp, setLastReadTimestamp] = useState(Date.now());
  const [groupedNotifications, setGroupedNotifications] = useState(new Map());
  
  const { user } = useAuth();
  const notificationTimeoutRef = useRef(new Map());
  const groupingTimeoutRef = useRef(new Map());

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.warn('Failed to request notification permission:', error);
        return false;
      }
    }
    return Notification.permission === 'granted';
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title, body, icon = '🔔') => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || isVisible) {
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/hackerden-logo.svg',
        badge: '/hackerden-logo.svg',
        tag: `team-${teamId}`, // Prevent duplicate notifications
        requireInteraction: false,
        silent: false
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.warn('Failed to show browser notification:', error);
    }
  }, [teamId, isVisible]);

  // Add notification with grouping logic
  const addNotification = useCallback((notification) => {
    const now = Date.now();
    const groupKey = `${notification.type}_${notification.relatedId || 'general'}`;
    
    setNotifications(prev => {
      const newNotifications = [...prev, { ...notification, id: now, timestamp: now }];
      
      // Keep only last 50 notifications to prevent memory issues
      return newNotifications.slice(-50);
    });

    // Handle notification grouping to prevent spam
    if (groupingTimeoutRef.current.has(groupKey)) {
      clearTimeout(groupingTimeoutRef.current.get(groupKey));
    }

    // Group similar notifications within 5 seconds
    groupingTimeoutRef.current.set(groupKey, setTimeout(() => {
      setGroupedNotifications(prev => {
        const newGrouped = new Map(prev);
        const existingGroup = newGrouped.get(groupKey) || [];
        newGrouped.set(groupKey, [...existingGroup, notification]);
        
        // Clean up old groups (older than 30 seconds)
        const cutoff = now - 30000;
        for (const [key, group] of newGrouped.entries()) {
          const filteredGroup = group.filter(n => n.timestamp > cutoff);
          if (filteredGroup.length === 0) {
            newGrouped.delete(key);
          } else {
            newGrouped.set(key, filteredGroup);
          }
        }
        
        return newGrouped;
      });
      
      groupingTimeoutRef.current.delete(groupKey);
    }, 5000));

    // Show browser notification for important updates when page is not visible
    if (!isVisible && notification.priority === 'high') {
      const title = getNotificationTitle(notification.type);
      showBrowserNotification(title, notification.content);
    }
  }, [isVisible, showBrowserNotification]);

  // Get notification title based on type
  const getNotificationTitle = useCallback((type) => {
    const titles = {
      'task_created': 'New Task Created',
      'task_status_changed': 'Task Status Updated',
      'task_completed': 'Task Completed',
      'vault_secret_added': 'Vault Secret Added',
      'vault_secret_updated': 'Vault Secret Updated',
      'vault_secret_deleted': 'Vault Secret Deleted',
      'system': 'System Update'
    };
    return titles[type] || 'Team Update';
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(() => {
    setUnreadCount(0);
    setLastReadTimestamp(Date.now());
    
    // Store in localStorage for persistence
    if (teamId) {
      localStorage.setItem(`lastRead_${teamId}`, Date.now().toString());
    }
  }, [teamId]);

  // Handle system message notifications
  const handleSystemMessage = useCallback((message) => {
    const isImportant = ['task_completed', 'vault_secret_deleted'].includes(message.type);
    
    addNotification({
      type: message.type,
      content: message.content,
      relatedId: message.systemData?.taskId || message.systemData?.secretId,
      priority: isImportant ? 'high' : 'normal',
      timestamp: Date.now()
    });

    // Increment unread count if page is not visible or user hasn't read recent messages
    if (!isVisible || Date.now() - lastReadTimestamp > 30000) {
      setUnreadCount(prev => prev + 1);
    }
  }, [addNotification, isVisible, lastReadTimestamp]);

  // Handle regular message notifications
  const handleNewMessage = useCallback((message) => {
    // Don't count own messages
    if (message.userId === user?.$id) return;

    // Only count as unread if page is not visible
    if (!isVisible) {
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification for new messages
      showBrowserNotification(
        `New message from ${message.userName}`,
        message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content
      );
    }
  }, [user?.$id, isVisible, showBrowserNotification]);

  // Track page visibility for notification behavior
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      
      // Mark as read when page becomes visible
      if (!document.hidden) {
        markAsRead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also track window focus/blur
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [markAsRead]);

  // Load persisted last read timestamp
  useEffect(() => {
    if (teamId) {
      const stored = localStorage.getItem(`lastRead_${teamId}`);
      if (stored) {
        setLastReadTimestamp(parseInt(stored, 10));
      }
    }
  }, [teamId]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      groupingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    unreadCount,
    notifications,
    groupedNotifications,
    markAsRead,
    handleSystemMessage,
    handleNewMessage,
    addNotification,
    requestNotificationPermission,
    isVisible
  };
};