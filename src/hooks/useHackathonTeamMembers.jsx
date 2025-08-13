import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { userNameService } from '../services/userNameService';
import { useAuth } from './useAuth';

export const useHackathonTeamMembers = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const fetchTeamMembers = useCallback(async () => {
    if (!hackathonId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get team first
      const userTeam = await fetchTeam();
      
      if (!userTeam?.$id) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Cache current user's name for better resolution
      if (user?.$id && user?.name) {
        userNameService.setUserName(user.$id, user.name);
      }

      // Get team members for this specific hackathon
      const teamMembers = await teamService.getTeamMembers(userTeam.$id, hackathonId);
      
      // Add current user info and mark as current user
      const membersWithCurrentUser = teamMembers.map(member => {
        const isCurrentUser = member.userId === user?.$id;
        return {
          id: member.userId,
          userId: member.userId,
          name: isCurrentUser ? (user.name || member.userName) : member.userName,
          userName: isCurrentUser ? (user.name || member.userName) : member.userName,
          avatar: (isCurrentUser ? (user.name || member.userName) : member.userName).charAt(0).toUpperCase(),
          role: member.role,
          joinedAt: member.joinedAt,
          online: true, // Simplified for now
          isCurrentUser
        };
      });

      setMembers(membersWithCurrentUser);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, fetchTeam, user?.$id, user?.name]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return {
    members,
    loading,
    error,
    team,
    hackathonId,
    refetch: fetchTeamMembers
  };
};