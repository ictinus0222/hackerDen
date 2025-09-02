import { useState, useEffect, useRef } from 'react';

const UpdateNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const autoHideTimeout = useRef(null);
  const exitTimeout = useRef(null);

  useEffect(() => {
    if (notification && notification.id !== currentNotification?.id) {
      // Clear any existing timeouts
      if (autoHideTimeout.current) {
        clearTimeout(autoHideTimeout.current);
      }
      if (exitTimeout.current) {
        clearTimeout(exitTimeout.current);
      }

      // If there's already a notification showing, quickly hide it first
      if (currentNotification && isVisible) {
        setIsExiting(true);
        setTimeout(() => {
          setCurrentNotification(notification);
          setIsVisible(true);
          setIsExiting(false);
          scheduleAutoHide();
        }, 150); // Quick transition
      } else {
        // No current notification, show the new one immediately
        setCurrentNotification(notification);
        setIsVisible(true);
        setIsExiting(false);
        scheduleAutoHide();
      }
    }
  }, [notification, currentNotification, isVisible]);

  const scheduleAutoHide = () => {
    // Auto-hide after 4 seconds
    autoHideTimeout.current = setTimeout(() => {
      handleClose();
    }, 4000);
  };

  const handleClose = () => {
    if (autoHideTimeout.current) {
      clearTimeout(autoHideTimeout.current);
    }
    
    setIsExiting(true);
    
    exitTimeout.current = setTimeout(() => {
      setIsVisible(false);
      setCurrentNotification(null);
      onClose();
    }, 300); // Match animation duration
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimeout.current) {
        clearTimeout(autoHideTimeout.current);
      }
      if (exitTimeout.current) {
        clearTimeout(exitTimeout.current);
      }
    };
  }, []);

  if (!currentNotification || !isVisible) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_created':
        return '📝';
      case 'task_started':
        return '🚀';
      case 'task_updated':
        return '🔄';
      case 'task_completed':
        return '✅';
      case 'task_blocked':
        return '🚫';
      case 'message_sent':
        return '💬';
      case 'member_joined':
        return '👋';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_created':
        return 'bg-blue-500';
      case 'task_started':
        return 'bg-orange-500';
      case 'task_updated':
        return 'bg-yellow-500';
      case 'task_completed':
        return 'bg-green-500';
      case 'task_blocked':
        return 'bg-red-500';
      case 'message_sent':
        return 'bg-purple-500';
      case 'member_joined':
        return 'bg-primary';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${isExiting 
            ? 'translate-y-full opacity-0 scale-95' 
            : 'translate-y-0 opacity-100 scale-100'
          }
        `}
      >
        <div className="border border-gray-700 rounded-lg shadow-lg p-4 min-w-80 max-w-md mx-4 sm:mx-0" style={{ backgroundColor: '#1e2b29' }}>
          <div className="flex items-start space-x-3">
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
              ${getNotificationColor(currentNotification.type)}
            `}>
              {getNotificationIcon(currentNotification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">
                  Team Update
                </p>
                <button
                  onClick={handleClose}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-text-secondary mt-1">
                {currentNotification.message}
              </p>
              
              {currentNotification.details && (
                <p className="text-xs text-text-secondary mt-1 opacity-75">
                  {currentNotification.details}
                </p>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${getNotificationColor(currentNotification.type)} animate-shrink-width`}
              style={{ animationDuration: '4s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;