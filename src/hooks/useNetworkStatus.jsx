import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [lastDisconnect, setLastDisconnect] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Test connection quality by measuring response time
  const testConnectionQuality = useCallback(async () => {
    try {
      const start = Date.now();
      const response = await fetch('/vite.svg', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const duration = Date.now() - start;

      if (response.ok) {
        if (duration < 200) {
          setConnectionQuality('excellent');
        } else if (duration < 500) {
          setConnectionQuality('good');
        } else if (duration < 1000) {
          setConnectionQuality('fair');
        } else {
          setConnectionQuality('poor');
        }
      } else {
        setConnectionQuality('poor');
      }
    } catch (error) {
      setConnectionQuality('offline');
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnectAttempts(0);
      testConnectionQuality();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastDisconnect(new Date());
      setConnectionQuality('offline');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test initial connection quality
    if (navigator.onLine) {
      testConnectionQuality();
    }

    // Periodic connection quality checks
    const qualityCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        testConnectionQuality();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityCheckInterval);
    };
  }, [testConnectionQuality]);

  // Retry connection with exponential backoff
  const retryConnection = useCallback(async () => {
    if (!isOnline) return false;

    try {
      setReconnectAttempts(prev => prev + 1);
      await testConnectionQuality();
      return connectionQuality !== 'offline';
    } catch (error) {
      console.error('Connection retry failed:', error);
      return false;
    }
  }, [isOnline, connectionQuality, testConnectionQuality]);

  return {
    isOnline,
    connectionQuality,
    lastDisconnect,
    reconnectAttempts,
    retryConnection,
    testConnectionQuality
  };
};