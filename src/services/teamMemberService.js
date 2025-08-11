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

      // Get user names from team membership data
      const members = memberships.documents.map((membership) => {
        // Use the userName from the membership, or fall back to current user name, or simple fallback
        let userName = membership.userName;
        
        if (!userName || userName === 'Team Member' || userName === 'Team Owner') {
          // If this is the current user, use their real name
          if (currentUser && membership.userId === currentUser.$id && currentUser.name) {
            userName = currentUser.name;
          } else {
            // For other users without stored names, just show "Team Member"
            userName = 'Team Member';
          }
        }

        // Cache the name for future use
        userNameService.setUserName(membership.userId, userName);

        return {
          id: membership.userId,
          name: userName,
          avatar: userName.charAt(0).toUpperCase(),
          role: membership.role,
          joinedAt: membership.joinedAt,
          online: Math.random() > 0.3, // Random online status for now - would be real in production
          isCurrentUser: false
        };
      });

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