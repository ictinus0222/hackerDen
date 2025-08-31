import { toast } from 'sonner';

/**
 * Enhanced notification service using Sonner toast notifications
 * Provides real-time feedback for various application events
 */
export const notificationService = {
  /**
   * Show a success notification
   * @param {string} title - The notification title
   * @param {string} description - Optional description
   * @param {object} options - Additional toast options
   */
  success: (title, description, options = {}) => {
    toast.success(title, {
      description,
      duration: 4000,
      ...options
    });
  },

  /**
   * Show an error notification
   * @param {string} title - The notification title
   * @param {string} description - Optional description
   * @param {object} options - Additional toast options
   */
  error: (title, description, options = {}) => {
    toast.error(title, {
      description,
      duration: 6000,
      ...options
    });
  },

  /**
   * Show a warning notification
   * @param {string} title - The notification title
   * @param {string} description - Optional description
   * @param {object} options - Additional toast options
   */
  warning: (title, description, options = {}) => {
    toast.warning(title, {
      description,
      duration: 5000,
      ...options
    });
  },

  /**
   * Show an info notification
   * @param {string} title - The notification title
   * @param {string} description - Optional description
   * @param {object} options - Additional toast options
   */
  info: (title, description, options = {}) => {
    toast.info(title, {
      description,
      duration: 4000,
      ...options
    });
  },

  /**
   * Show a loading notification
   * @param {string} title - The notification title
   * @param {string} description - Optional description
   * @param {object} options - Additional toast options
   * @returns {string} Toast ID that can be used to dismiss or update
   */
  loading: (title, description, options = {}) => {
    return toast.loading(title, {
      description,
      ...options
    });
  },

  /**
   * Dismiss a specific toast
   * @param {string} toastId - The toast ID to dismiss
   */
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Task-specific notifications
   */
  task: {
    created: (taskTitle) => {
      toast.success('Task Created', {
        description: `"${taskTitle}" has been added to the board`,
        duration: 3000,
      });
    },

    updated: (taskTitle) => {
      toast.info('Task Updated', {
        description: `"${taskTitle}" has been modified`,
        duration: 3000,
      });
    },

    statusChanged: (taskTitle, newStatus) => {
      const statusEmoji = {
        todo: '📝',
        in_progress: '🔄',
        blocked: '🚫',
        done: '✅'
      };

      const statusLabels = {
        todo: 'To Do',
        in_progress: 'In Progress',
        blocked: 'Blocked',
        done: 'Done'
      };

      toast.success('Task Status Changed', {
        description: `${statusEmoji[newStatus]} "${taskTitle}" moved to ${statusLabels[newStatus]}`,
        duration: 4000,
      });
    },

    deleted: (taskTitle) => {
      toast.warning('Task Deleted', {
        description: `"${taskTitle}" has been removed`,
        duration: 4000,
      });
    }
  },

  /**
   * Connection-specific notifications
   */
  connection: {
    lost: () => {
      toast.error('Connection Lost', {
        description: 'Attempting to reconnect...',
        duration: Infinity, // Keep until connection restored
        id: 'connection-lost'
      });
    },

    restored: () => {
      toast.dismiss('connection-lost');
      toast.success('Connection Restored', {
        description: 'You are back online',
        duration: 3000,
      });
    },

    reconnecting: (attempts) => {
      toast.loading('Reconnecting...', {
        description: `Attempt ${attempts}`,
        id: 'reconnecting'
      });
    },

    failed: () => {
      toast.dismiss('reconnecting');
      toast.error('Connection Failed', {
        description: 'Please check your internet connection',
        duration: 8000,
      });
    }
  },

  /**
   * Message-specific notifications
   */
  message: {
    sent: () => {
      toast.success('Message Sent', {
        duration: 2000,
      });
    },

    failed: () => {
      toast.error('Message Failed', {
        description: 'Could not send message, please try again',
        duration: 5000,
      });
    },

    received: (userName, preview) => {
      toast.info(`Message from ${userName}`, {
        description: preview.length > 50 ? `${preview.substring(0, 50)}...` : preview,
        duration: 4000,
      });
    }
  },

  /**
   * System notifications
   */
  system: {
    updateAvailable: () => {
      toast.info('Update Available', {
        description: 'A new version is available. Refresh to update.',
        duration: 10000,
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      });
    },

    maintenance: (message) => {
      toast.warning('Maintenance Notice', {
        description: message,
        duration: 15000,
      });
    }
  }
};

export default notificationService;
