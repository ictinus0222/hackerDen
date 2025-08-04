import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from './useAuth';
import { useTeam } from './useTeam';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  
  const { user } = useAuth();
  const { team } = useTeam();

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!team?.$id) return;

    try {
      setLoading(true);
      setError(null);
      const teamMessages = await messageService.getTeamMessages(team.$id);
      setMessages(teamMessages);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [team?.$id]);

  // Send a message
  const sendMessage = useCallback(async (content) => {
    if (!content?.trim() || !team?.$id || !user?.$id || sending) {
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      // Optimistically add message to UI
      const optimisticMessage = {
        $id: `temp-${Date.now()}`,
        teamId: team.$id,
        userId: user.$id,
        content: content.trim(),
        type: 'user',
        $createdAt: new Date().toISOString(),
        userName: user.name, // Add user name for display
        isOptimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);

      // Send to server
      await messageService.sendMessage(team.$id, user.$id, content);
      
      // Remove optimistic message - real message will come via subscription
      setMessages(prev => prev.filter(msg => msg.$id !== optimisticMessage.$id));
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to send message:', err);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
    } finally {
      setSending(false);
    }
  }, [team?.$id, user?.$id, user?.name, sending]);

  // Set up real-time subscription
  useEffect(() => {
    if (!team?.$id) return;

    const unsubscribe = messageService.subscribeToMessages(team.$id, (response) => {
      const { events, payload } = response;
      
      if (events.includes('databases.*.collections.*.documents.*.create')) {
        // New message created
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(msg => msg.$id === payload.$id);
          if (exists) return prev;
          
          // Add user name for display (this should come from user lookup in real app)
          const messageWithUser = {
            ...payload,
            userName: payload.userId ? 'Team Member' : null // Simplified for MVP
          };
          
          return [...prev, messageWithUser];
        });
      } else if (events.includes('databases.*.collections.*.documents.*.update')) {
        // Message updated
        setMessages(prev => 
          prev.map(msg => 
            msg.$id === payload.$id ? { ...msg, ...payload } : msg
          )
        );
      } else if (events.includes('databases.*.collections.*.documents.*.delete')) {
        // Message deleted
        setMessages(prev => prev.filter(msg => msg.$id !== payload.$id));
      }
    });

    return unsubscribe;
  }, [team?.$id]);

  // Load messages when team changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    refetch: loadMessages
  };
};