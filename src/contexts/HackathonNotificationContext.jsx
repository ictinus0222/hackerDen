import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { realtimeService } from '../services/realtimeService';
import { teamService } from '../services/teamService';
import UpdateNotification from '../components/UpdateNotification';

const HackathonNotificationContext = createContext();

export const useHackathonNotifications = () => {
  const context = useContext(HackathonNotificationContext);
  if (!context) {
    throw new Error('useHackathonNotifications must be used within a HackathonNotificationProvider');
  }
  return context;
};

export const HackathonNotificationProvider = ({ children }) => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [team, setTeam] = useState(null);

  const showNotification = useCallback((type, message, details = null) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      details,
      timestamp: new Date()
    };
    
    setNotification(newNotification);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Helper methods for common notification types
  const notifyTaskCreated = useCallback((taskTitle, creatorName) => {
    showNotification(
      'task_created',
      `📝 New task: "${taskTitle}"`,
      `Team activity update`
    );
  }, [showNotification]);

  const notifyTaskUpdated = useCallback((taskTitle, newStatus) => {
    const statusLabels = {
      todo: 'To-Do',
      in_progress: 'In Progress',
      blocked: 'Blocked',
      done: 'Done'
    };
    
    const emoji = newStatus === 'done' ? '✅' : '🔄';
    
    showNotification(
      newStatus === 'done' ? 'task_completed' : 'task_updated',
      `${emoji} Task moved to ${statusLabels[newStatus]}`,
      `"${taskTitle}"`
    );
  }, [showNotification]);

  const notifyMessageSent = useCallback((senderName) => {
    showNotification(
      'message_sent',
      `💬 New team message`,
      'Check the chat for details'
    );
  }, [showNotification]);

  const notifyMemberJoined = useCallback((memberName) => {
    showNotification(
      'member_joined',
      `👋 New team member joined`,
      'Welcome to the team!'
    );
  }, [showNotification]);

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

  // Set up real-time subscriptions for notifications
  useEffect(() => {
    if (!hackathonId || !user?.$id) return;

    let taskUnsubscribe = null;
    let messageUnsubscribe = null;

    const setupSubscriptions = async () => {
      const userTeam = await fetchTeam();
      if (!userTeam?.$id) return;

      // Subscribe to task updates
      taskUnsubscribe = realtimeService.subscribeToTasks(
        userTeam.$id,
        (response) => {
          const { events, payload } = response;
          console.log('Task notification received:', { events, payload });
          
          if (events.includes('databases.*.collections.*.documents.*.create')) {
            // New task created
            console.log('Showing task created notification');
            notifyTaskCreated(payload.title, 'Team Member');
          } else if (events.includes('databases.*.collections.*.documents.*.update')) {
            // Task updated - we need to check if status changed
            // For now, we'll show notification for any update
            console.log('Showing task updated notification');
            if (payload.status === 'done') {
              notifyTaskUpdated(payload.title, 'done');
            } else {
              notifyTaskUpdated(payload.title, payload.status);
            }
          }
        }
      );

      // Subscribe to message updates
      messageUnsubscribe = realtimeService.subscribeToMessages(
        userTeam.$id,
        (response) => {
          const { events, payload } = response;
          console.log('Message notification received:', { events, payload });
          
          if (events.includes('databases.*.collections.*.documents.*.create')) {
            // New message created
            if (payload.type === 'user') {
              console.log('Showing message notification');
              notifyMessageSent('Team Member');
            }
          }
        }
      );
    };

    setupSubscriptions();

    return () => {
      if (taskUnsubscribe) taskUnsubscribe();
      if (messageUnsubscribe) messageUnsubscribe();
    };
  }, [hackathonId, user?.$id, fetchTeam, notifyTaskCreated, notifyTaskUpdated, notifyMessageSent]);

  const contextValue = {
    notification,
    showNotification,
    clearNotification,
    notifyTaskCreated,
    notifyTaskUpdated,
    notifyMessageSent,
    notifyMemberJoined,
    team,
    hackathonId
  };

  return (
    <HackathonNotificationContext.Provider value={contextValue}>
      {children}
      {/* Global notification popup that appears on all hackathon screens */}
      <UpdateNotification 
        notification={notification}
        onClose={clearNotification}
      />
    </HackathonNotificationContext.Provider>
  );
};