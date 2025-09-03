import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/teamService';

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
  const [team, setTeam] = useState(null);

  // Disabled notification functions - no-ops
  const showNotification = useCallback(() => {
    // Notifications disabled
  }, []);

  const clearNotification = useCallback(() => {
    // Notifications disabled
  }, []);

  const notifyTaskCreated = useCallback(() => {
    // Notifications disabled
  }, []);

  const notifyTaskStarted = useCallback(() => {
    // Notifications disabled
  }, []);

  const notifyTaskUpdated = useCallback(() => {
    // Notifications disabled
  }, []);

  const notifyMemberJoined = useCallback(() => {
    // Notifications disabled
  }, []);

  // Get user's team for this hackathon (keep this for other functionality)
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

  // Load team info but no subscriptions
  useEffect(() => {
    if (hackathonId && user?.$id) {
      fetchTeam();
    }
  }, [hackathonId, user?.$id, fetchTeam]);

  const contextValue = {
    notification: null, // Always null - no notifications
    showNotification,
    clearNotification,
    notifyTaskCreated,
    notifyTaskStarted,
    notifyTaskUpdated,
    notifyMemberJoined,
    team,
    hackathonId
  };

  return (
    <HackathonNotificationContext.Provider value={contextValue}>
      {children}
      {/* No UpdateNotification component - completely removed */}
    </HackathonNotificationContext.Provider>
  );
};