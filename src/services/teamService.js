import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../lib/appwrite';

export const teamService = {
  // Generate a unique 6-character join code
  generateJoinCode() {
    // Use uppercase letters and numbers, excluding confusing characters (0, O, I, 1)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Create a new team with the current user as owner
  async createTeam(name, userId, hackathonId, userName = null) {
    try {
      // Generate unique join code
      let joinCode;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      // Ensure join code is unique
      while (!isUnique && attempts < maxAttempts) {
        joinCode = this.generateJoinCode();
        try {
          // Check if join code already exists
          const existingTeams = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TEAMS,
            [
              Query.equal('joinCode', joinCode)
            ]
          );
          
          // If no teams found with this code, it's unique
          isUnique = existingTeams.documents.length === 0;
        } catch {
          // If query fails, assume code is unique and continue
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique join code. Please try again.');
      }

      // Create the team
      const team = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        ID.unique(),
        {
          name: name.trim(),
          joinCode,
          ownerId: userId,
          hackathonId: hackathonId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      // Create team member entry for the owner
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        ID.unique(),
        {
          teamId: team.$id,
          hackathonId: hackathonId,
          userId,
          userName: userName || 'Team Owner', // Store user name
          role: 'owner',
          joinedAt: new Date().toISOString()
        }
      );

      return { team, joinCode };
    } catch (error) {
      throw new Error(error.message || 'Failed to create team');
    }
  },

  // Get user's team (if any)
  async getUserTeam(userId) {
    try {
      // First, find team membership
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', userId)
        ]
      );

      const userMembership = memberships.documents[0];
      
      if (!userMembership) {
        return null;
      }

      // Get the team details
      const team = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        userMembership.teamId
      );

      return {
        ...team,
        userRole: userMembership.role
      };
    } catch (error) {
      console.error('Error getting user team:', error);
      return null;
    }
  },

  // Get user's team for a specific hackathon
  async getUserTeamForHackathon(userId, hackathonId) {
    try {
      // First, find team membership
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', userId)
        ]
      );

      if (memberships.documents.length === 0) {
        return null;
      }

      // Get all teams the user is a member of for this hackathon
      const teamPromises = memberships.documents.map(membership => 
        databases.getDocument(DATABASE_ID, COLLECTIONS.TEAMS, membership.teamId)
          .then(team => team.hackathonId === hackathonId ? team : null)
          .catch(() => null)
      );
      
      const teamResults = await Promise.all(teamPromises);
      const teams = { documents: teamResults.filter(team => team !== null) };

      if (teams.documents.length === 0) {
        return null;
      }

      const team = teams.documents[0];
      const userMembership = memberships.documents.find(membership => membership.teamId === team.$id);

      return {
        ...team,
        userRole: userMembership.role
      };
    } catch (error) {
      console.error('Error getting user team for hackathon:', error);
      
      // Handle specific error types
      if (error.message?.includes('Failed to fetch') || error.message?.includes('CORS')) {
        console.error('❌ CORS or Network Error - Check your Appwrite configuration and network connection');
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      if (error.code === 401) {
        console.error('❌ Unauthorized - Check your Appwrite API keys and permissions');
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.code === 404) {
        console.error('❌ Resource not found - Check your database and collection IDs');
        throw new Error('Team not found. Please check your configuration.');
      }
      
      return null;
    }
  },

  // Join a team using join code
  async joinTeam(joinCode, userId, userName = null) {
    try {
      // Find team by join code
      const teams = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [
          Query.equal('joinCode', joinCode.toUpperCase())
        ]
      );

      const team = teams.documents[0];
      
      if (!team) {
        throw new Error('Invalid join code. Please check and try again.');
      }

      // Check if user is already a member
      const existingMemberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', team.$id),
          Query.equal('userId', userId)
        ]
      );

      const existingMembership = existingMemberships.documents[0];

      if (existingMembership) {
        throw new Error('You are already a member of this team.');
      }

      // Create team member entry
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        ID.unique(),
        {
          teamId: team.$id,
          hackathonId: team.hackathonId,
          userId,
          userName: userName || 'Team Member', // Store user name
          role: 'member',
          joinedAt: new Date().toISOString()
        }
      );

      return team;
    } catch (error) {
      throw new Error(error.message || 'Failed to join team');
    }
  },

  // Get all teams a user is part of
  async getUserTeams(userId) {
    try {
      // Get all team memberships for the user
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('joinedAt')
        ]
      );

      // Get team details for each membership
      const teams = await Promise.all(
        memberships.documents.map(async (membership) => {
          try {
            const team = await databases.getDocument(
              DATABASE_ID,
              COLLECTIONS.TEAMS,
              membership.teamId
            );
            return {
              ...team,
              userRole: membership.role,
              joinedAt: membership.joinedAt
            };
          } catch (error) {
            console.warn(`Failed to get team ${membership.teamId}:`, error);
            return null;
          }
        })
      );

      // Filter out any null teams (in case some teams were deleted)
      return teams.filter(team => team !== null);
    } catch (error) {
      console.error('Error getting user teams:', error);
      throw new Error('Failed to load your teams');
    }
  },

  // Get all team members for a specific team and hackathon
  async getTeamMembers(teamId, hackathonId) {
    // Backward compatibility: if hackathonId is not provided, use legacy method
    if (arguments.length === 1) {
      return this.getLegacyTeamMembers(teamId);
    }

    try {
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId),
          Query.orderAsc('joinedAt')
        ]
      );

      return memberships.documents.map(member => ({
        id: member.$id,
        userId: member.userId,
        userName: member.userName,
        role: member.role,
        joinedAt: member.joinedAt
      }));
    } catch (error) {
      console.error('Error getting team members:', error);
      throw new Error('Failed to load team members');
    }
  },

  // Legacy method for backward compatibility (without hackathon scoping)
  async getLegacyTeamMembers(teamId) {
    try {
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', teamId),
          Query.orderAsc('joinedAt')
        ]
      );

      return memberships.documents.map(member => ({
        id: member.$id,
        userId: member.userId,
        userName: member.userName,
        role: member.role,
        joinedAt: member.joinedAt
      }));
    } catch (error) {
      console.error('Error getting legacy team members:', error);
      throw new Error('Failed to load team members');
    }
  },

  // Update team member role
  async updateMemberRole(memberId, newRole, updatedBy) {
    try {
      // Validate role
      const validRoles = ['owner', 'leader', 'member'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role. Must be owner, leader, or member.');
      }

      const updatedMember = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        memberId,
        {
          role: newRole,
          updatedAt: new Date().toISOString(),
          updatedBy: updatedBy
        }
      );

      return updatedMember;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw new Error('Failed to update member role');
    }
  },

  // Remove team member
  async removeMember(memberId, teamId, hackathonId, removedBy) {
    try {
      // Get member details before removing
      const member = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        memberId
      );

      // Verify the member belongs to the correct team and hackathon
      if (member.teamId !== teamId || member.hackathonId !== hackathonId) {
        throw new Error('Member does not belong to this team or hackathon');
      }

      // Don't allow removing the owner
      if (member.role === 'owner') {
        throw new Error('Cannot remove team owner');
      }

      // Remove the member
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        memberId
      );

      return { success: true, removedMember: member };
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error(error.message || 'Failed to remove team member');
    }
  },

  // Leave team (for non-owners)
  async leaveTeam(userId, teamId, hackathonId) {
    try {
      // Find user's membership
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', userId),
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId)
        ]
      );

      const membership = memberships.documents[0];
      
      if (!membership) {
        throw new Error('You are not a member of this team');
      }

      if (membership.role === 'owner') {
        throw new Error('Team owner cannot leave the team. Transfer ownership first.');
      }

      // Remove the membership
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        membership.$id
      );

      return { success: true };
    } catch (error) {
      console.error('Error leaving team:', error);
      throw new Error(error.message || 'Failed to leave team');
    }
  },

  // Transfer team ownership
  async transferOwnership(teamId, hackathonId, currentOwnerId, newOwnerId) {
    try {
      // Get current owner membership
      const currentOwnerMemberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', currentOwnerId),
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId),
          Query.equal('role', 'owner')
        ]
      );

      const currentOwnerMembership = currentOwnerMemberships.documents[0];
      
      if (!currentOwnerMembership) {
        throw new Error('You are not the owner of this team');
      }

      // Get new owner membership
      const newOwnerMemberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', newOwnerId),
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId)
        ]
      );

      const newOwnerMembership = newOwnerMemberships.documents[0];
      
      if (!newOwnerMembership) {
        throw new Error('New owner is not a member of this team');
      }

      // Update current owner to leader
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        currentOwnerMembership.$id,
        {
          role: 'leader',
          updatedAt: new Date().toISOString()
        }
      );

      // Update new owner
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        newOwnerMembership.$id,
        {
          role: 'owner',
          updatedAt: new Date().toISOString()
        }
      );

      // Update team owner
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        teamId,
        {
          ownerId: newOwnerId,
          updatedAt: new Date().toISOString()
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error transferring ownership:', error);
      throw new Error(error.message || 'Failed to transfer ownership');
    }
  },

  // Switch to a specific team (for multi-team support)
  async switchToTeam(teamId) {
    try {
      // This is a placeholder for team switching logic
      // In a real app, you might store the current team in local storage
      // or update user preferences in the database
      localStorage.setItem('currentTeamId', teamId);
      return true;
    } catch (error) {
      throw new Error('Failed to switch team');
    }
  }
};