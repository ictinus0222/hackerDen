import { useCallback } from 'react';

// COMPLETELY DISABLED NOTIFICATION SYSTEM
export const useNotifications = (teamId) => {
  // All functions are no-ops - notifications completely disabled
  const showNotification = useCallback(() => {
    // Notifications disabled
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    // Notifications disabled
    return false;
  }, []);

  const addNotification = useCallback(() => {
    // Notifications disabled
  }, []);

  const handleSystemMessage = useCallback(() => {
    // Notifications disabled
  }, []);

  const handleNewMessage = useCallback(() => {
    // Notifications disabled
  }, []);

  const markAsRead = useCallback(() => {
    // Notifications disabled
  }, []);

  return {
    unreadCount: 0, // Always 0
    notifications: [], // Always empty
    groupedNotifications: new Map(), // Always empty
    markAsRead,
    handleSystemMessage,
    handleNewMessage,
    addNotification,
    requestNotificationPermission,
    isVisible: true
  };
};