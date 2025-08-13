import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { messageService } from '../services/messageService';
import { realtimeService } from '../services/realtimeService';
import { teamService } from '../services/teamService';
import { useAuth } from './useAuth';

export const useHackathonMessages = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [team, setTeam] = useState(null);

  // Get user's team for this hackathon
  const fetchTeam = useCallback(async () => {
    if (!user?.$id || !hackathonId) {
      setTeam(null);
      return null;
    }

    try {
      const userTeam = await teamService.getUserTeamForHackathon(user.$id, hackathonId);
      setTeam(userTeam);
      return userTeam;
    } catch (err) {
      console.error('Error fetching team:', err);
      setTeam(null);
      return null;
    }
  }, [user?.$id, hackathonId]);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!hackathonId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get team first
      const userTeam = await fetchTeam();
      
      if (!userTeam?.$id) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const teamMessages = await messageService.getTeamMessages(userTeam.$id, hackathonId);
      setMessages(teamMessages);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, fetchTeam]);

  // Send a message
  const sendMessage = useCallback(async (content) => {
    if (!content?.trim() || !team?.$id || !user?.$id || !hackathonId || sending) {
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
        hackathonId: hackathonId,
        userId: user.$id,
        content: trimmedContent,
        type: 'user',
        $createdAt: new Date().toISOString(),
        userName: user.name, // Add user name for display
        isOptimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);

      // Send to server
      await messageService.sendMessage(team.$id, hackathonId, user.$id, trimmedContent);
      
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
  }, [team?.$id, hackathonId, user?.$id, user?.name, sending]);

  // Set up real-time subscription with enhanced error handling
  useEffect(() => {
    if (!team?.$id || !hackathonId) return;

    const unsubscribe = messageService.subscribeToMessages(
      team.$id,
      hackathonId,
      (response) => {
        const { events, payload } = response;
        
        // Update last sync time for monitoring
        setLastSyncTime(new Date());
        
        // Clear any subscription errors on successful update
        setSubscriptionError(null);
        
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
      }
    );

    return unsubscribe;
  }, [team?.$id, hackathonId]);

  // Load messages when hackathon changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    error,
    sending,
    subscriptionError,
    lastSyncTime,
    team,
    hackathonId,
    sendMessage,
    refetch: loadMessages
  };
};