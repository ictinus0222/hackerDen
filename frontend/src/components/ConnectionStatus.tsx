import React from 'react';
import { useConnectionStatus } from '../hooks/useSocket';
import { socketService } from '../services/socket';

export interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showDetails = false,
}) => {
  const { connected, reconnecting, reconnectAttempts, maxReconnectAttempts, showReconnectButton } = useConnectionStatus();

  const handleReconnect = () => {
    socketService.reconnect();
  };

  if (connected) {
    return (
      <div className={`flex items-center space-x-2 text-green-600 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Connected</span>
        {showDetails && (
          <span className="text-xs text-gray-500">Real-time updates active</span>
        )}
      </div>
    );
  }

  if (reconnecting) {
    return (
      <div className={`flex items-center space-x-2 text-yellow-600 ${className}`}>
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Reconnecting...</span>
        {showDetails && (
          <span className="text-xs text-gray-500">
            Attempt {reconnectAttempts}/{maxReconnectAttempts}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span className="text-sm font-medium">Disconnected</span>
      {showDetails && (
        <span className="text-xs text-gray-500">Real-time updates unavailable</span>
      )}
      {showReconnectButton && (
        <button
          onClick={handleReconnect}
          className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;