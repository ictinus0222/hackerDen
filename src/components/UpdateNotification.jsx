import { useState, useEffect } from 'react';

const UpdateNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsExiting(false);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Match animation duration
  };

  if (!notification || !isVisible) return null;

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
              ${getNotificationColor(notification.type)}
            `}>
              {getNotificationIcon(notification.type)}
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
                {notification.message}
              </p>
              
              {notification.details && (
                <p className="text-xs text-text-secondary mt-1 opacity-75">
                  {notification.details}
                </p>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${getNotificationColor(notification.type)} animate-shrink-width`}
              style={{ animationDuration: '3s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;