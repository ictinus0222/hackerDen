import { useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from './useAuth';

export const useMessages = (teamId, hackathonId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [retryQueue, setRetryQueue] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  const { user } = useAuth();
  const unsubscribeRef = useRef(null);
  const offsetRef = useRef(0);
  const typingTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Load initial messages
  const loadMessages = useCallback(async (reset = false) => {
    if (!teamId || !hackathonId) return;

    try {
      setError(null);
      if (reset) {
        setLoading(true);
        offsetRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      const { messages: newMessages, total } = await messageService.getMessages(
        teamId,
        hackathonId,
        50, 
        reset ? 0 : offsetRef.current
      );

      if (reset) {
        setMessages(newMessages);
      } else {
        // Prepend older messages (they come in reverse chronological order)
        setMessages(prev => [...newMessages, ...prev]);
      }

      offsetRef.current += newMessages.length;
      setHasMore(offsetRef.current < total);

    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [teamId, hackathonId]);

  // Enhanced message sending with retry mechanism
  const sendMessage = useCallback(async (content, retryAttempt = 0) => {
    if (!teamId || !hackathonId || !user || !content.trim()) return;

    setSending(true);
    setError(null);

    const messageId = `temp-${Date.now()}-${retryAttempt}`;
    const optimisticMessage = {
      $id: messageId,
      content: content.trim(),
      type: 'user',
      userId: user.$id,
      teamId,
      $createdAt: new Date().toISOString(),
      isOptimistic: true,
      retryAttempt
    };

    try {
      // Add optimistic message
      setMessages(prev => [...prev, optimisticMessage]);

      // Send to server
      const sentMessage = await messageService.sendMessage(
        teamId,
        hackathonId,
        user.$id,
        content.trim()
      );

      // Remove optimistic message and let real-time update handle the real message
      setMessages(prev => prev.filter(msg => msg.$id !== messageId));

      // Remove from retry queue if it was there
      setRetryQueue(prev => prev.filter(item => item.messageId !== messageId));

    } catch (err) {
      console.error('Error sending message:', err);
      
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.$id === messageId 
          ? { ...msg, isFailed: true, error: err.message }
          : msg
      ));

      // Add to retry queue if not too many attempts
      if (retryAttempt < 3) {
        const retryItem = {
          messageId,
          content: content.trim(),
          retryAttempt: retryAttempt + 1,
          timestamp: Date.now()
        };
        
        setRetryQueue(prev => [...prev, retryItem]);
        
        // Schedule retry
        setTimeout(() => {
          retryMessage(retryItem);
        }, Math.pow(2, retryAttempt) * 1000); // Exponential backoff
      } else {
        setError('Failed to send message after multiple attempts');
      }
    } finally {
      setSending(false);
    }
  }, [teamId, hackathonId, user]);

  // Retry failed message
  const retryMessage = useCallback(async (retryItem) => {
    if (!retryItem) return;

    // Remove from retry queue
    setRetryQueue(prev => prev.filter(item => item.messageId !== retryItem.messageId));
    
    // Remove failed message from display
    setMessages(prev => prev.filter(msg => msg.$id !== retryItem.messageId));
    
    // Retry sending
    await sendMessage(retryItem.content, retryItem.retryAttempt);
  }, [sendMessage]);

  // Manual retry for failed messages
  const retryFailedMessage = useCallback((messageId) => {
    const failedMessage = messages.find(msg => msg.$id === messageId && msg.isFailed);
    if (failedMessage) {
      setMessages(prev => prev.filter(msg => msg.$id !== messageId));
      sendMessage(failedMessage.content, 0);
    }
  }, [messages, sendMessage]);

  // Enhanced load more messages with better error handling and performance
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore || !teamId || !hackathonId) {
      return Promise.resolve();
    }

    try {
      await loadMessages(false);
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading more messages:', error);
      return Promise.reject(error);
    }
  }, [loadMessages, loadingMore, hasMore, teamId, hackathonId]);

  // Typing indicator functionality
  const sendTypingIndicator = useCallback(() => {
    if (!teamId || !hackathonId || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing event (this would be implemented in messageService)
    messageService.sendTypingIndicator?.(teamId, user.$id, user.name || 'Anonymous');

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      messageService.stopTypingIndicator?.(teamId, user.$id);
    }, 3000);
  }, [teamId, hackathonId, user]);

  const stopTypingIndicator = useCallback(() => {
    if (!teamId || !hackathonId || !user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    messageService.stopTypingIndicator?.(teamId, user.$id);
  }, [teamId, hackathonId, user]);

  // Enhanced real-time subscription with message type filtering and typing indicators
  useEffect(() => {
    if (!teamId || !hackathonId) return;

    // Load initial messages
    loadMessages(true);

    // Set up real-time subscription
    try {
      setConnectionStatus('connecting');
      
      unsubscribeRef.current = messageService.subscribeToMessages(teamId, hackathonId, (response) => {
        const { events, payload } = response;
        
        setConnectionStatus('connected');
        setError(null);

        // Handle different event types
        if (events.includes('databases.*.collections.*.documents.*.create')) {
          // New message created - filter by message type
          const messageTypes = ['user', 'system', 'task_created', 'task_status_changed', 'task_completed', 
                               'vault_secret_added', 'vault_secret_updated', 'vault_secret_deleted'];
          
          if (messageTypes.includes(payload.type)) {
            setMessages(prev => {
              // Avoid duplicates (in case of optimistic updates)
              const exists = prev.some(msg => msg.$id === payload.$id);
              if (exists) return prev;
              
              // Sort messages by creation time to maintain order
              const newMessages = [...prev, payload];
              return newMessages.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
            });
          }
        } else if (events.includes('databases.*.collections.*.documents.*.update')) {
          // Message updated
          setMessages(prev => 
            prev.map(msg => msg.$id === payload.$id ? payload : msg)
          );
        } else if (events.includes('databases.*.collections.*.documents.*.delete')) {
          // Message deleted
          setMessages(prev => prev.filter(msg => msg.$id !== payload.$id));
        }

        // Handle typing indicators (if implemented in messageService)
        if (events.includes('typing.start')) {
          setTypingUsers(prev => new Set([...prev, payload.userId]));
        } else if (events.includes('typing.stop')) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(payload.userId);
            return newSet;
          });
        }
      });

      // Set up connection status monitoring
      const connectionCheckInterval = setInterval(() => {
        if (unsubscribeRef.current) {
          // Connection is active
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
          setError('Connection lost. Attempting to reconnect...');
        }
      }, 5000);

      return () => {
        clearInterval(connectionCheckInterval);
      };

    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
      setConnectionStatus('disconnected');
      setError('Failed to connect to real-time updates');
    }

    // Cleanup subscription on unmount or teamId change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      setConnectionStatus('disconnected');
    };
  }, [teamId, hackathonId, loadMessages]);

  return {
    messages,
    loading,
    error,
    sending,
    hasMore,
    loadingMore,
    typingUsers,
    retryQueue,
    connectionStatus,
    sendMessage,
    loadMoreMessages,
    retryFailedMessage,
    sendTypingIndicator,
    stopTypingIndicator,
    refreshMessages: () => loadMessages(true)
  };
};