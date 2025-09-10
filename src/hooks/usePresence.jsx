import { useState, useEffect, useCallback } from 'react';
import { presenceService } from '../services/presenceService';
import { useAuth } from './useAuth';

export const usePresence = (teamId, teamMemberIds = []) => {
  const { user } = useAuth();
  const [presenceData, setPresenceData] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Update presence data when it changes
  const handlePresenceChange = useCallback((userId, isOnline) => {
    setPresenceData(prev => ({
      ...prev,
      [userId]: {
        online: isOnline,
        lastSeen: new Date().toISOString()
      }
    }));
  }, []);

  // Initialize presence tracking
  useEffect(() => {
    if (!user?.$id || !teamId || isInitialized) return;

    const initializePresence = async () => {
      try {
        // Set up presence change callback
        presenceService.setPresenceChangeCallback(handlePresenceChange);
        
        // Initialize presence service
        await presenceService.initializePresence(user, teamId);
        
        // Load initial presence data for team members
        const initialPresence = presenceService.getTeamPresence(teamMemberIds);
        setPresenceData(initialPresence);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize presence:', error);
      }
    };

    initializePresence();

    // Cleanup on unmount
    return () => {
      presenceService.stopPresence();
      setIsInitialized(false);
    };
  }, [user?.$id, teamId, teamMemberIds, handlePresenceChange, isInitialized]);

  // Update presence data when team members change
  useEffect(() => {
    if (!isInitialized || teamMemberIds.length === 0) return;

    const currentPresence = presenceService.getTeamPresence(teamMemberIds);
    setPresenceData(currentPresence);
  }, [teamMemberIds, isInitialized]);

  // Get online status for a specific user
  const isUserOnline = useCallback((userId) => {
    if (!userId) return false;
    
    const presence = presenceData[userId];
    if (!presence) return false;
    
    return presenceService.isUserOnline(userId);
  }, [presenceData]);

  // Get online count for team
  const getOnlineCount = useCallback(() => {
    return teamMemberIds.filter(userId => isUserOnline(userId)).length;
  }, [teamMemberIds, isUserOnline]);

  // Get all online user IDs
  const getOnlineUserIds = useCallback(() => {
    return teamMemberIds.filter(userId => isUserOnline(userId));
  }, [teamMemberIds, isUserOnline]);

  return {
    presenceData,
    isUserOnline,
    getOnlineCount,
    getOnlineUserIds,
    isInitialized
  };
};
