import { useState, useEffect } from 'react';
import { teamMemberService } from '../services/teamMemberService';
import { userNameService } from '../services/userNameService';
import { useTeam } from './useTeam';


export const useTeamMembers = () => {
  const { team } = useTeam();
  // TODO: Authentication removed
  // // TODO: Authentication removed
  // const { user, ... } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeamMembers = async () => {
    if (!team?.$id) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Cache current user's name for better resolution
      if (user?.$id && user?.name) {
        userNameService.setUserName(user.$id, user.name);
      }

      // Auto-update existing tasks with current user's name (once per session)
      const sessionKey = `tasks_updated_${team.$id}_${user?.$id}`;
      if (user && !sessionStorage.getItem(sessionKey)) {
        try {
          const { taskNameUpdater } = await import('../utils/taskNameUpdater.js');
          const result = await taskNameUpdater.updateTasksWithCurrentUserName(team.$id, user);
          if (result.updated > 0) {
            console.log(`Auto-updated ${result.updated} tasks with your name`);
          }
          sessionStorage.setItem(sessionKey, 'true');
        } catch (error) {
          console.warn('Failed to auto-update task names:', error);
        }
      }

      // Auto-update current user's team membership with real name (once per session)
      const membershipSessionKey = `membership_updated_${team.$id}_${user?.$id}`;
      if (user && !sessionStorage.getItem(membershipSessionKey)) {
        try {
          const { teamMemberUpdater } = await import('../utils/teamMemberUpdater.js');
          const updated = await teamMemberUpdater.updateCurrentUserMembership(team.$id, user);
          if (updated) {
            console.log(`Auto-updated team membership with your name`);
          }
          sessionStorage.setItem(membershipSessionKey, 'true');
        } catch (error) {
          console.warn('Failed to auto-update membership:', error);
        }
      }
      
      const teamMembers = await teamMemberService.getTeamMembers(team.$id, user);
      
      // Add current user info and mark as current user
      const membersWithCurrentUser = teamMembers.map(member => {
        if (member.id === user?.$id) {
          return {
            ...member,
            name: user.name,
            avatar: user.name.charAt(0).toUpperCase(),
            online: true,
            isCurrentUser: true
          };
        }
        return member;
      });

      // If current user is not in the list, add them
      const currentUserExists = membersWithCurrentUser.some(member => member.isCurrentUser);
      if (!currentUserExists && user) {
        membersWithCurrentUser.unshift({
          id: user.$id,
          name: user.name,
          avatar: user.name.charAt(0).toUpperCase(),
          role: team.userRole || 'member',
          online: true,
          isCurrentUser: true,
          joinedAt: new Date().toISOString()
        });
      }

      setMembers(membersWithCurrentUser);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [team?.$id, user?.$id]);

  return {
    members,
    loading,
    error,
    refetch: fetchTeamMembers
  };
};