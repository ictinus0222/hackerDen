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
  async createTeam(name, userId, userName = null) {
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
  }
};