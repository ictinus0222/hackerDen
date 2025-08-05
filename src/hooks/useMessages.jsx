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

    const trimmedContent = content.trim();
    const optimisticId = `temp-${Date.now()}-${Math.random()}`;

    try {
      setSending(true);
      setError(null);
      
      // Optimistically add message to UI
      const optimisticMessage = {
        $id: optimisticId,
        teamId: team.$id,
        userId: user.$id,
        content: trimmedContent,
        type: 'user',
        $createdAt: new Date().toISOString(),
        userName: user.name, // Add user name for display
        isOptimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);

      // Send to server
      await messageService.sendMessage(team.$id, user.$id, trimmedContent);
      
      // Remove optimistic message after a short delay to ensure real message arrives
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.$id !== optimisticId));
      }, 1000);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to send message:', err);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.$id !== optimisticId));
      
      // Show error feedback to user
      setTimeout(() => {
        setError(null);
      }, 5000);
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
          // Avoid duplicates - check both real and optimistic messages
          const exists = prev.some(msg => 
            msg.$id === payload.$id || 
            (msg.isOptimistic && msg.content === payload.content && msg.userId === payload.userId)
          );
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