/**
 * Utility to fix team member names in the database
 * This helps backfill missing or generic names for existing team members
 */

import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { userNameService } from '../services/userNameService';

export const teamMemberNameFixer = {
  /**
   * Fix team member names for a specific team
   * @param {string} teamId - Team ID to fix
   * @param {Object} currentUser - Current user object with $id and name
   * @returns {Promise<Object>} Results of the fix operation
   */
  async fixTeamMemberNames(teamId, currentUser) {
    try {
      console.log('Starting team member name fix for team:', teamId);
      
      // Get all memberships for this team
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', teamId)
        ]
      );

      let fixed = 0;
      let skipped = 0;
      let failed = 0;

      // Process each membership
      for (const membership of memberships.documents) {
        try {
          const currentName = membership.userName;
          
          // Check if name needs fixing
          const needsFix = !currentName || 
                          currentName === 'Team Member' || 
                          currentName === 'Team Owner' || 
                          currentName === membership.userId ||
                          currentName.trim() === '';

          if (!needsFix) {
            console.log(`Skipping ${membership.userId} - already has valid name: ${currentName}`);
            skipped++;
            continue;
          }

          // Try to resolve the name
          let resolvedName = null;

          // If it's the current user, use their name
          if (currentUser && membership.userId === currentUser.$id && currentUser.name) {
            resolvedName = currentUser.name;
          } else {
            // Try to get from userNameService
            try {
              resolvedName = await userNameService.getUserName(membership.userId, currentUser);
              if (resolvedName === 'Team Member' || resolvedName === 'Team Owner') {
                resolvedName = null; // Don't use generic names
              }
            } catch (err) {
              console.warn('Could not resolve name for user:', membership.userId);
            }
          }

          // If we found a valid name, update the membership
          if (resolvedName && resolvedName.trim() !== '') {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.TEAM_MEMBERS,
              membership.$id,
              {
                userName: resolvedName
              }
            );
            
            console.log(`✓ Fixed name for ${membership.userId}: ${currentName} → ${resolvedName}`);
            fixed++;
          } else {
            console.log(`✗ Could not resolve name for ${membership.userId}`);
            failed++;
          }
        } catch (err) {
          console.error(`Error fixing name for membership ${membership.$id}:`, err);
          failed++;
        }
      }

      const results = {
        total: memberships.documents.length,
        fixed,
        skipped,
        failed
      };

      console.log('Team member name fix complete:', results);
      return results;
    } catch (error) {
      console.error('Error fixing team member names:', error);
      throw new Error('Failed to fix team member names: ' + error.message);
    }
  },

  /**
   * Fix team member names for all teams a user is part of
   * @param {Object} currentUser - Current user object with $id and name
   * @returns {Promise<Object>} Results of the fix operation
   */
  async fixAllUserTeamNames(currentUser) {
    try {
      if (!currentUser || !currentUser.$id) {
        throw new Error('Current user is required');
      }

      console.log('Starting team member name fix for all user teams');

      // Get all teams the user is part of
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('userId', currentUser.$id)
        ]
      );

      const teamIds = [...new Set(memberships.documents.map(m => m.teamId))];
      console.log(`Found ${teamIds.length} teams to process`);

      const results = {
        teamsProcessed: 0,
        totalFixed: 0,
        totalSkipped: 0,
        totalFailed: 0
      };

      // Fix names for each team
      for (const teamId of teamIds) {
        try {
          const teamResults = await this.fixTeamMemberNames(teamId, currentUser);
          results.teamsProcessed++;
          results.totalFixed += teamResults.fixed;
          results.totalSkipped += teamResults.skipped;
          results.totalFailed += teamResults.failed;
        } catch (err) {
          console.error(`Failed to fix team ${teamId}:`, err);
          results.totalFailed++;
        }
      }

      console.log('All teams processed:', results);
      return results;
    } catch (error) {
      console.error('Error fixing all team names:', error);
      throw new Error('Failed to fix team names: ' + error.message);
    }
  }
};
