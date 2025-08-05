import { useState, useEffect, useCallback } from 'react';
import client from '../lib/appwrite';

export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastDisconnect, setLastDisconnect] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Test connection by making a simple API call
  const testConnection = useCallback(async () => {
    try {
      // Simple health check - try to get account info
      await client.call('get', '/health');
      return true;
    } catch (error) {
      console.warn('Connection test failed:', error);
      return false;
    }
  }, []);

  // Handle connection status changes
  const handleConnectionChange = useCallback(async () => {
    const connected = await testConnection();
    
    if (connected && !isConnected) {
      // Connection restored
      setIsConnected(true);
      setIsReconnecting(false);
      setReconnectAttempts(0);
      console.log('Connection restored');
    } else if (!connected && isConnected) {
      // Connection lost
      setIsConnected(false);
      setLastDisconnect(new Date());
      console.log('Connection lost');
    }
  }, [isConnected, testConnection]);

  // Retry connection with exponential backoff
  const retryConnection = useCallback(async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    const attempt = reconnectAttempts + 1;
    setReconnectAttempts(attempt);
    
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
    
    console.log(`Attempting to reconnect (attempt ${attempt}) in ${delay}ms...`);
    
    setTimeout(async () => {
      const connected = await testConnection();
      
      if (connected) {
        setIsConnected(true);
        setIsReconnecting(false);
        setReconnectAttempts(0);
        console.log('Reconnection successful');
      } else {
        setIsReconnecting(false);
        // Will trigger another retry attempt
      }
    }, delay);
  }, [isReconnecting, reconnectAttempts, testConnection]);

  // Monitor online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Browser online event detected');
      handleConnectionChange();
    };

    const handleOffline = () => {
      console.log('Browser offline event detected');
      setIsConnected(false);
      setLastDisconnect(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleConnectionChange]);

  // Periodic connection check
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected && !isReconnecting) {
        retryConnection();
      }
    }, 5000); // Check every 5 seconds when disconnected

    return () => clearInterval(interval);
  }, [isConnected, isReconnecting, retryConnection]);

  // Initial connection test
  useEffect(() => {
    handleConnectionChange();
  }, [handleConnectionChange]);

  return {
    isConnected,
    isReconnecting,
    lastDisconnect,
    reconnectAttempts,
    retryConnection: () => {
      if (!isReconnecting) {
        retryConnection();
      }
    }
  };
};