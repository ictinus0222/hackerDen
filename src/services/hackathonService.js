import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../lib/appwrite';
import { teamService } from './teamService';

export const hackathonService = {
  // Create a new hackathon
  async createHackathon(hackathonData, userId, userName = null) {
    try {
      // Create the hackathon document
      const hackathon = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.HACKATHONS,
        ID.unique(),
        {
          name: hackathonData.name,
          description: hackathonData.description,
          startDate: hackathonData.startDate,
          endDate: hackathonData.endDate,
          status: 'upcoming', // upcoming, ongoing, completed
          rules: hackathonData.rules || [],
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return hackathon;
    } catch (error) {
      console.error('Error creating hackathon:', error);
      throw new Error('Failed to create hackathon: ' + error.message);
    }
  },

  // Get all hackathons for a user (where they have teams)
  async getUserHackathons(userId) {
    try {
      // First get all teams the user is part of
      const userTeams = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', userId)
        ]
      );

      if (userTeams.documents.length === 0) {
        return [];
      }

      // Get team details for each team membership
      const teamIds = userTeams.documents.map(membership => membership.teamId).filter(id => id);
      
      if (teamIds.length === 0) {
        return [];
      }

      // Query teams using individual queries for each team ID to avoid array issues
      const teamPromises = teamIds.map(teamId => 
        databases.getDocument(DATABASE_ID, COLLECTIONS.TEAMS, teamId).catch(() => null)
      );
      
      const teams = await Promise.all(teamPromises);
      const validTeams = teams.filter(team => team && team.hackathonId); // Only teams with hackathon IDs

      if (validTeams.length === 0) {
        return [];
      }

      // Get hackathon details for each team
      const hackathonIds = [...new Set(validTeams.map(team => team.hackathonId))].filter(id => id);
      
      if (hackathonIds.length === 0) {
        return [];
      }

      // Query hackathons using individual queries
      const hackathonPromises = hackathonIds.map(hackathonId => 
        databases.getDocument(DATABASE_ID, COLLECTIONS.HACKATHONS, hackathonId).catch(() => null)
      );
      
      const hackathons = await Promise.all(hackathonPromises);
      const validHackathons = hackathons.filter(hackathon => hackathon);

      // Helpers for formatting and status
      const formatDDMMYYYY = (iso) => {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      };

      const computeStatus = (startIso, endIso, explicitStatus) => {
        try {
          const now = new Date();
          const start = new Date(startIso);
          const end = new Date(endIso);
          
          // Validate dates
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn('Invalid date format:', { startIso, endIso });
            return explicitStatus || 'upcoming';
          }
          
          // Add 1 minute buffer to prevent flickering at boundaries
          const nowWithBuffer = new Date(now.getTime() + 60000); // +1 minute
          
          // Use >= for inclusive end time
          if (nowWithBuffer < start) return 'upcoming';
          if (now >= end) return 'completed';
          return 'ongoing';
        } catch (error) {
          console.error('Error computing hackathon status:', error);
          return explicitStatus || 'upcoming';
        }
      };

      // Combine hackathon data with team data
      const result = validHackathons.map(hackathon => {
        const userTeam = validTeams.find(team => team.hackathonId === hackathon.$id);
        const userMembership = userTeams.documents.find(membership => membership.teamId === userTeam?.$id);
        const status = computeStatus(hackathon.startDate, hackathon.endDate, hackathon.status);
        
        return {
          hackathonId: hackathon.$id,
          hackathonName: hackathon.name,
          description: hackathon.description,
          dates: `${formatDDMMYYYY(hackathon.startDate)} - ${formatDDMMYYYY(hackathon.endDate)}`,
          status: status,
          team: userTeam ? {
            id: userTeam.$id,
            name: userTeam.name,
            role: (userMembership?.role === 'owner' ? 'leader' : (userMembership?.role || 'member'))
          } : null
        };
      });

      return result;
    } catch (error) {
      console.error('Error fetching user hackathons:', error);
      
      // If the hackathons collection doesn't exist yet, return mock data for testing
      if (error.message.includes('Collection with the requested ID could not be found') || 
          error.message.includes('Invalid query') ||
          error.code === 404) {
        console.warn('Hackathons collection not found, returning mock data for testing');
        return [
          {
            hackathonId: "temp-code-with-kiro",
            hackathonName: "Code with Kiro",
            description: "Build innovative AI-powered solutions with Kiro IDE",
            dates: "December 15-17, 2024",
            status: "ongoing",
            team: {
              id: "temp-null-pointers",
              name: "null pointers",
              role: "member"
            }
          }
        ];
      }
      
      throw new Error('Failed to fetch hackathons: ' + error.message);
    }
  },

  // Get hackathon details by ID
  async getHackathonById(hackathonId) {
    try {
      const hackathon = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.HACKATHONS,
        hackathonId
      );

      return {
        hackathonId: hackathon.$id,
        hackathonName: hackathon.name,
        description: hackathon.description,
        dates: `${new Date(hackathon.startDate).toLocaleDateString()} - ${new Date(hackathon.endDate).toLocaleDateString()}`,
        status: hackathon.status,
        rules: hackathon.rules || [],
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        createdBy: hackathon.createdBy
      };
    } catch (error) {
      console.error('Error fetching hackathon:', error);
      
      // If the hackathons collection doesn't exist yet, return mock data for testing
      if (error.message.includes('Collection with the requested ID could not be found') || 
          error.code === 404) {
        console.warn('Hackathons collection not found, returning mock data for testing');
        return {
          hackathonId: hackathonId,
          hackathonName: "Code with Kiro",
          description: "Build innovative AI-powered solutions with Kiro IDE",
          dates: "December 15-17, 2024",
          status: "ongoing",
          rules: [
            "Teams must have 2-5 members",
            "All code must be original", 
            "Submissions due by end date"
          ],
          startDate: "2024-12-15T09:00:00.000Z",
          endDate: "2024-12-17T18:00:00.000Z",
          createdBy: "temp-user"
        };
      }
      
      throw new Error('Failed to fetch hackathon: ' + error.message);
    }
  },

  // Update hackathon status
  async updateHackathonStatus(hackathonId, status) {
    try {
      const hackathon = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.HACKATHONS,
        hackathonId,
        {
          status: status,
          updatedAt: new Date().toISOString()
        }
      );

      return hackathon;
    } catch (error) {
      console.error('Error updating hackathon status:', error);
      throw new Error('Failed to update hackathon status: ' + error.message);
    }
  },

  // Join a team by code (finds hackathon automatically)
  async joinTeamByCode(userId, joinCode, userName = null) {
    try {
      // Use teamService to join the team
      const team = await teamService.joinTeam(joinCode, userId, userName);
      
      // Return the team and hackathon info
      return {
        team,
        hackathonId: team.hackathonId
      };
    } catch (error) {
      console.error('Error joining team by code:', error);
      throw new Error(error.message || 'Failed to join team');
    }
  }
};