import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { userNameService } from './userNameService';

export const teamMemberService = {
  // Get all members of a team with their user details
  async getTeamMembers(teamId, currentUser = null) {
    try {
      // Get team memberships
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', teamId)
        ]
      );

      // Cache the current user's name if available
      if (currentUser && currentUser.$id && currentUser.name) {
        userNameService.setUserName(currentUser.$id, currentUser.name);
      }

      // Pre-cache user names from tasks (now that we have the database fields)
      try {
        const allTasks = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TASKS,
          [
            Query.equal('teamId', teamId),
            Query.limit(100) // Get recent tasks for name caching
          ]
        );
        
        // Cache names from task data
        allTasks.documents.forEach(task => {
          if (task.assignedTo && task.assigned_to && task.assigned_to !== task.assignedTo) {
            userNameService.setUserName(task.assignedTo, task.assigned_to);
          }
          if (task.createdBy && task.created_by && task.created_by !== task.createdBy) {
            userNameService.setUserName(task.createdBy, task.created_by);
          }
        });
      } catch (taskError) {
        console.warn('Could not pre-cache user names from tasks:', taskError);
      }

      // Get user names from team membership data (with resolution service)
      const members = await Promise.all(memberships.documents.map(async (membership) => {
        // Prefer current user's name; otherwise resolve via userNameService; fallback to membership.userName
        let resolvedName = membership.userName;

        const isGeneric = !resolvedName || resolvedName === 'Team Member' || resolvedName === 'Team Owner' || resolvedName === membership.userId;
        if (currentUser && membership.userId === currentUser.$id && currentUser.name) {
          resolvedName = currentUser.name;
        } else if (isGeneric) {
          try {
            const lookedUp = await userNameService.getUserName(membership.userId, currentUser);
            if (lookedUp) {
              resolvedName = lookedUp;
            }
          } catch {}
        }

        if (!resolvedName) {
          resolvedName = 'Team Member';
        }

        // Cache the name for future use
        userNameService.setUserName(membership.userId, resolvedName);

        return {
          id: membership.userId,
          name: resolvedName,
          avatar: resolvedName.charAt(0).toUpperCase(),
          role: membership.role,
          joinedAt: membership.joinedAt,
          online: false, // default offline; hooks can mark current user online
          isCurrentUser: false
        };
      }));

      return members;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  },

  // Get team member count
  async getTeamMemberCount(teamId) {
    try {
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', teamId)
        ]
      );
      return memberships.documents.length;
    } catch (error) {
      console.error('Error getting team member count:', error);
      return 0;
    }
  },

  // Check if user is member of team
  async isTeamMember(teamId, userId) {
    try {
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', teamId),
          Query.equal('userId', userId)
        ]
      );
      return memberships.documents.length > 0;
    } catch (error) {
      console.error('Error checking team membership:', error);
      return false;
    }
  }
};