import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { realtimeService } from '../services/realtimeService';
import { teamService } from '../services/teamService';
import { taskService } from '../services/taskService';
import { messageService } from '../services/messageService';
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
    console.log('🔔 Showing notification:', { type, message, details });
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

  const notifyTaskStarted = useCallback((taskTitle) => {
    showNotification(
      'task_started',
      `🚀 Someone started working on a task`,
      `"${taskTitle}" is now in progress`
    );
  }, [showNotification]);

  const notifyTaskUpdated = useCallback((taskTitle, newStatus, oldStatus = null) => {
    const statusLabels = {
      todo: 'To-Do',
      in_progress: 'In Progress',
      blocked: 'Blocked',
      done: 'Done'
    };
    
    // Special handling for different status changes
    if (newStatus === 'in_progress' && oldStatus !== 'in_progress') {
      // Someone started working on the task
      notifyTaskStarted(taskTitle);
      return;
    }
    
    if (newStatus === 'done') {
      showNotification(
        'task_completed',
        `✅ Task completed!`,
        `"${taskTitle}" is now done`
      );
      return;
    }
    
    if (newStatus === 'blocked') {
      showNotification(
        'task_blocked',
        `🚫 Task blocked`,
        `"${taskTitle}" needs attention`
      );
      return;
    }
    
    // Generic task update
    const emoji = '🔄';
    showNotification(
      'task_updated',
      `${emoji} Task moved to ${statusLabels[newStatus]}`,
      `"${taskTitle}"`
    );
  }, [showNotification, notifyTaskStarted]);

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
      console.log('🔔 Setting up notification subscriptions for hackathon:', hackathonId, 'user:', user?.$id);
      const userTeam = await fetchTeam();
      if (!userTeam?.$id) {
        console.log('🔔 No team found, skipping notification subscriptions');
        return;
      }
      console.log('🔔 Found team for notifications:', userTeam.$id);

      // Subscribe to task updates using the same method as taskService
      taskUnsubscribe = taskService.subscribeToTasks(
        userTeam.$id,
        hackathonId,
        (response) => {
          const { events, payload } = response;
          console.log('🔔 Task notification received:', { events, payload, teamId: userTeam.$id, hackathonId });
          
          // Check for create events (more flexible pattern matching)
          const isCreateEvent = events.some(event => event.includes('.create'));
          const isUpdateEvent = events.some(event => event.includes('.update'));
          
          if (isCreateEvent) {
            // New task created
            console.log('🔔 Showing task created notification for:', payload.title);
            notifyTaskCreated(payload.title, 'Team Member');
          } else if (isUpdateEvent) {
            // Task updated - we need to check if status changed
            console.log('🔔 Showing task updated notification for:', payload.title, 'status:', payload.status);
            
            // For updates, we'll show notification for any status change
            // The notifyTaskUpdated function will handle the specific logic
            notifyTaskUpdated(payload.title, payload.status);
          }
        }
      );

      // Subscribe to message updates using the same method as messageService
      messageUnsubscribe = messageService.subscribeToMessages(
        userTeam.$id,
        hackathonId,
        (response) => {
          const { events, payload } = response;
          console.log('🔔 Message notification received:', { events, payload, teamId: userTeam.$id, hackathonId });
          
          // Check for create events (more flexible pattern matching)
          const isCreateEvent = events.some(event => event.includes('.create'));
          
          if (isCreateEvent) {
            // New message created
            if (payload.type === 'user') {
              console.log('🔔 Showing message notification');
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
    notifyTaskStarted,
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