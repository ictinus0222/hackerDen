import React from 'react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const ConnectionStatus = ({ className = '' }) => {
  const { 
    isConnected, 
    isReconnecting, 
    lastDisconnect, 
    reconnectAttempts, 
    retryConnection 
  } = useConnectionStatus();

  const getBadgeVariant = () => {
    if (isConnected && !isReconnecting) return 'default';
    if (isReconnecting) return 'secondary';
    if (!isConnected) return 'destructive';
    return 'default';
  };

  const getStatusText = () => {
    if (isConnected && !isReconnecting) {
      return 'Connected';
    }
    if (isReconnecting) {
      return `Reconnecting... (${reconnectAttempts})`;
    }
    if (!isConnected) {
      const timeSince = lastDisconnect 
        ? Math.floor((Date.now() - lastDisconnect.getTime()) / 1000)
        : 0;
      return `Offline${timeSince > 0 ? ` (${timeSince}s)` : ''}`;
    }
    return 'Unknown';
  };

  const getStatusIcon = () => {
    if (isReconnecting) {
      return (
        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
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
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="flex items-center space-x-2">
        <Badge variant={getBadgeVariant()} className="flex items-center space-x-1 px-2 py-1">
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </Badge>
        
        {!isConnected && !isReconnecting && (
          <Button
            onClick={retryConnection}
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            aria-label="Retry connection"
          >
            Retry
          </Button>
        )}
      </div>
      
      {/* Additional info for debugging */}
      {process.env.NODE_ENV === 'development' && (isReconnecting || !isConnected) && (
        <div className="mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
          <div>Last disconnect: {lastDisconnect?.toLocaleTimeString()}</div>
          <div>Attempts: {reconnectAttempts}</div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;