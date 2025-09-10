import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from '../lib/appwrite';
import { realtimeService } from './realtimeService';

class PresenceService {
  constructor() {
    this.presenceData = new Map(); // userId -> { online: boolean, lastSeen: timestamp }
    this.heartbeatInterval = null;
    this.heartbeatIntervalMs = 30000; // 30 seconds
    this.offlineThresholdMs = 60000; // 1 minute
    this.currentUser = null;
    this.currentTeamId = null;
    this.subscriptions = new Map();
  }

  // Initialize presence tracking for a user and team
  async initializePresence(user, teamId) {
    this.currentUser = user;
    this.currentTeamId = teamId;

    if (!user?.$id || !teamId) {
      console.warn('PresenceService: Missing user or teamId for initialization');
      return;
    }

    // Start heartbeat
    this.startHeartbeat();

    // Subscribe to team presence updates
    await this.subscribeToTeamPresence(teamId);

    // Mark current user as online
    await this.updateUserPresence(user.$id, true);
  }

  // Start heartbeat to maintain online status
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.currentUser?.$id && this.currentTeamId) {
        await this.updateUserPresence(this.currentUser.$id, true);
      }
    }, this.heartbeatIntervalMs);
  }

  // Stop heartbeat and mark user as offline
  async stopPresence() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.currentUser?.$id) {
      await this.updateUserPresence(this.currentUser.$id, false);
    }

    // Unsubscribe from all presence updates
    this.subscriptions.forEach((subscription) => {
      realtimeService.unsubscribe(subscription);
    });
    this.subscriptions.clear();

    this.currentUser = null;
    this.currentTeamId = null;
  }

  // Update user presence in database
  async updateUserPresence(userId, isOnline) {
    try {
      const now = new Date().toISOString();
      
      // Update local cache
      this.presenceData.set(userId, {
        online: isOnline,
        lastSeen: now
      });

      // Update in database (USER_PRESENCE collection)
      const presenceKey = `team_${this.currentTeamId}_${userId}`;
      
      try {
        // Try to update existing presence record
        const existingPresence = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USER_PRESENCE,
          [
            Query.equal('documentId', presenceKey),
            Query.equal('userId', userId)
          ]
        );

        if (existingPresence.documents.length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USER_PRESENCE,
            existingPresence.documents[0].$id,
            {
              lastSeen: now,
              isOnline
            }
          );
        } else {
          // Create new presence record
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USER_PRESENCE,
            ID.unique(),
            {
              documentId: presenceKey,
              userId,
              userName: this.currentUser?.name || 'Unknown',
              lastSeen: now,
              isOnline
            }
          );
        }
      } catch (dbError) {
        console.warn('PresenceService: Could not update database presence:', dbError);
        // Continue with local cache even if DB fails
      }

      // Notify listeners
      this.notifyPresenceChange(userId, isOnline);
    } catch (error) {
      console.error('PresenceService: Error updating user presence:', error);
    }
  }

  // Subscribe to team presence updates
  async subscribeToTeamPresence(teamId) {
    try {
      const subscription = realtimeService.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.USER_PRESENCE}.documents`,
        (response) => {
          if (response.events.includes('databases.*.collections.*.documents.*.create') ||
              response.events.includes('databases.*.collections.*.documents.*.update')) {
            
            const presence = response.payload;
            const presenceKey = `team_${teamId}_`;
            
            if (presence.documentId?.startsWith(presenceKey)) {
              const userId = presence.userId;
              const isOnline = presence.isOnline;
              
              this.presenceData.set(userId, {
                online: isOnline,
                lastSeen: presence.lastSeen
              });
              
              this.notifyPresenceChange(userId, isOnline);
            }
          }
        }
      );

      this.subscriptions.set(`team_${teamId}`, subscription);
    } catch (error) {
      console.warn('PresenceService: Could not subscribe to presence updates:', error);
    }
  }

  // Get current presence data for a user
  getUserPresence(userId) {
    return this.presenceData.get(userId) || { online: false, lastSeen: null };
  }

  // Get all team member presence data
  getTeamPresence(teamMemberIds) {
    const presence = {};
    teamMemberIds.forEach(userId => {
      presence[userId] = this.getUserPresence(userId);
    });
    return presence;
  }

  // Check if user should be considered online based on last seen
  isUserOnline(userId) {
    const presence = this.getUserPresence(userId);
    if (!presence.lastSeen) return false;
    
    const lastSeen = new Date(presence.lastSeen);
    const now = new Date();
    const timeDiff = now - lastSeen;
    
    return presence.online && timeDiff < this.offlineThresholdMs;
  }

  // Notify listeners of presence changes
  notifyPresenceChange(userId, isOnline) {
    // This will be used by the presence hook
    if (this.onPresenceChange) {
      this.onPresenceChange(userId, isOnline);
    }
  }

  // Set callback for presence changes
  setPresenceChangeCallback(callback) {
    this.onPresenceChange = callback;
  }
}

// Export singleton instance
export const presenceService = new PresenceService();
