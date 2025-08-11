import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';

export const teamMemberUpdater = {
  // Update current user's team membership with their real name
  async updateCurrentUserMembership(teamId, currentUser) {
    if (!currentUser || !currentUser.$id || !currentUser.name) {
      console.warn('No current user provided for membership update');
      return false;
    }

    try {
      // Find current user's membership in this team
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', teamId),
          Query.equal('userId', currentUser.$id)
        ]
      );

      if (memberships.documents.length === 0) {
        console.warn('Current user is not a member of this team');
        return false;
      }

      const membership = memberships.documents[0];

      // Update with real name if it's missing or generic
      if (!membership.userName || 
          membership.userName === 'Team Member' || 
          membership.userName === 'Team Owner' ||
          membership.userName === currentUser.$id) {
        
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TEAM_MEMBERS,
          membership.$id,
          {
            userName: currentUser.name
          }
        );

        console.log(`✅ Updated team membership with real name: ${currentUser.name}`);
        return true;
      }

      return false; // No update needed
    } catch (error) {
      console.error('Error updating team membership:', error);
      return false;
    }
  },

  // Manually update a team member's name (for admin use)
  async updateMemberName(teamId, userId, userName) {
    try {
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        [
          Query.equal('teamId', teamId),
          Query.equal('userId', userId)
        ]
      );

      if (memberships.documents.length === 0) {
        console.warn('User is not a member of this team');
        return false;
      }

      const membership = memberships.documents[0];

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        membership.$id,
        {
          userName: userName
        }
      );

      console.log(`✅ Updated member name: ${userName}`);
      return true;
    } catch (error) {
      console.error('Error updating member name:', error);
      return false;
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.teamMemberUpdater = teamMemberUpdater;
}