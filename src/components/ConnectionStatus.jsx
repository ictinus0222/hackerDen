import React from 'react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

const ConnectionStatus = ({ className = '' }) => {
  const { 
    isConnected, 
    isReconnecting, 
    lastDisconnect, 
    reconnectAttempts, 
    retryConnection 
  } = useConnectionStatus();

  // Don't show anything if connected
  if (isConnected && !isReconnecting) {
    return null;
  }

  const getStatusColor = () => {
    if (isReconnecting) return 'bg-yellow-500';
    if (!isConnected) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isReconnecting) {
      return `Reconnecting... (attempt ${reconnectAttempts})`;
    }
    if (!isConnected) {
      const timeSince = lastDisconnect 
        ? Math.floor((Date.now() - lastDisconnect.getTime()) / 1000)
        : 0;
      return `Offline ${timeSince > 0 ? `(${timeSince}s ago)` : ''}`;
    }
    return 'Connected';
  };

  const getStatusIcon = () => {
    if (isReconnecting) {
      return (
        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }
    
    if (!isConnected) {
      return (
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" 
          />
        </svg>
      );
    }
    
    return (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 13l4 4L19 7" 
        />
      </svg>
    );
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg text-white text-sm
        ${getStatusColor()}
        transition-all duration-300 ease-in-out
      `}>
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
        
        {!isConnected && !isReconnecting && (
          <button
            onClick={retryConnection}
            className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
            aria-label="Retry connection"
          >
            Retry
          </button>
        )}
      </div>
      
      {/* Additional info for debugging */}
      {process.env.NODE_ENV === 'development' && !isConnected && (
        <div className="mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
          <div>Last disconnect: {lastDisconnect?.toLocaleTimeString()}</div>
          <div>Attempts: {reconnectAttempts}</div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;