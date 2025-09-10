import client from '../lib/appwrite';

class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.baseDelay = 1000; // 1 second
  }

  // Subscribe with automatic retry logic
  subscribe(channel, callback, options = {}) {
    const subscriptionId = `${channel}-${Date.now()}-${Math.random()}`;
    const { maxRetries = this.maxReconnectAttempts, onError, onReconnect } = options;

    const subscriptionData = {
      channel,
      callback,
      options,
      unsubscribe: null,
      retryCount: 0,
      isActive: true
    };

    this.subscriptions.set(subscriptionId, subscriptionData);

    const attemptSubscription = () => {
      try {
        console.log(`Attempting to subscribe to ${channel}...`);

        const unsubscribe = client.subscribe(channel, (response) => {
          // Reset retry count on successful message
          subscriptionData.retryCount = 0;
          this.reconnectAttempts.set(subscriptionId, 0);

          // Call the original callback
          callback(response);
        });

        subscriptionData.unsubscribe = unsubscribe;
        console.log(`Successfully subscribed to ${channel}`);

        // Call onReconnect if this was a retry
        if (subscriptionData.retryCount > 0 && onReconnect) {
          onReconnect(subscriptionData.retryCount);
        }

      } catch (error) {
        console.error(`Failed to subscribe to ${channel}:`, error);

        if (onError) {
          onError(error, subscriptionData.retryCount);
        }

        // Retry with exponential backoff
        if (subscriptionData.retryCount < maxRetries && subscriptionData.isActive) {
          subscriptionData.retryCount++;
          const delay = this.baseDelay * Math.pow(2, subscriptionData.retryCount - 1);

          console.log(`Retrying subscription to ${channel} in ${delay}ms (attempt ${subscriptionData.retryCount}/${maxRetries})`);

          setTimeout(() => {
            if (subscriptionData.isActive) {
              attemptSubscription();
            }
          }, delay);
        } else {
          console.error(`Max retry attempts reached for ${channel}`);
        }
      }
    };

    // Start initial subscription
    attemptSubscription();

    // Return unsubscribe function
    return () => {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.isActive = false;
        if (subscription.unsubscribe) {
          subscription.unsubscribe();
        }
        this.subscriptions.delete(subscriptionId);
        this.reconnectAttempts.delete(subscriptionId);
      }
    };
  }

  // Subscribe to tasks with enhanced error handling
  subscribeToTasks(teamId, callback, options = {}) {
    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const channel = `databases.${databaseId}.collections.tasks.documents`;

    console.log('🔔 Subscribing to tasks channel:', channel, 'for team:', teamId);

    return this.subscribe(channel, (response) => {
      console.log('🔔 Raw task event received:', response);
      // Only process events for tasks belonging to this team
      if (response.payload.teamId === teamId) {
        console.log('🔔 Task event matches team, processing:', response);
        callback(response);
      } else {
        console.log('🔔 Task event for different team, ignoring. Expected:', teamId, 'Got:', response.payload.teamId);
      }
    }, {
      ...options,
      onError: (error, retryCount) => {
        console.error(`🔔 Task subscription error (attempt ${retryCount}):`, error);
        if (options.onError) {
          options.onError(error, retryCount);
        }
      },
      onReconnect: (retryCount) => {
        console.log(`🔔 Task subscription reconnected after ${retryCount} attempts`);
        if (options.onReconnect) {
          options.onReconnect(retryCount);
        }
      }
    });
  }

  // Subscribe to messages with enhanced error handling
  subscribeToMessages(teamId, callback, options = {}) {
    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const channel = `databases.${databaseId}.collections.messages.documents`;

    console.log('🔔 Subscribing to messages channel:', channel, 'for team:', teamId);

    return this.subscribe(channel, (response) => {
      console.log('🔔 Raw message event received:', response);
      // Only process messages for this team
      if (response.payload.teamId === teamId) {
        console.log('🔔 Message event matches team, processing:', response);
        callback(response);
      } else {
        console.log('🔔 Message event for different team, ignoring. Expected:', teamId, 'Got:', response.payload.teamId);
      }
    }, {
      ...options,
      onError: (error, retryCount) => {
        console.error(`🔔 Message subscription error (attempt ${retryCount}):`, error);
        if (options.onError) {
          options.onError(error, retryCount);
        }
      },
      onReconnect: (retryCount) => {
        console.log(`🔔 Message subscription reconnected after ${retryCount} attempts`);
        if (options.onReconnect) {
          options.onReconnect(retryCount);
        }
      }
    });
  }

  // Subscribe to documents with enhanced error handling
  subscribeToDocuments(teamId, hackathonId, callback, options = {}) {
    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const channel = `databases.${databaseId}.collections.documents.documents`;

    console.log('🔔 Subscribing to documents channel:', channel, 'for team:', teamId, 'hackathon:', hackathonId);

    return this.subscribe(channel, (response) => {
      console.log('🔔 Raw document event received:', response);
      // Only process documents for this team and hackathon
      if (response.payload.teamId === teamId && response.payload.hackathonId === hackathonId) {
        console.log('🔔 Document event matches team/hackathon, processing:', response);
        callback(response);
      } else {
        console.log('🔔 Document event for different team/hackathon, ignoring. Expected team:', teamId, 'hackathon:', hackathonId, 'Got team:', response.payload.teamId, 'hackathon:', response.payload.hackathonId);
      }
    }, {
      ...options,
      onError: (error, retryCount) => {
        console.error(`🔔 Document subscription error (attempt ${retryCount}):`, error);
        if (options.onError) {
          options.onError(error, retryCount);
        }
      },
      onReconnect: (retryCount) => {
        console.log(`🔔 Document subscription reconnected after ${retryCount} attempts`);
        if (options.onReconnect) {
          options.onReconnect(retryCount);
        }
      }
    });
  }

  // Get subscription status
  getSubscriptionStatus() {
    const active = Array.from(this.subscriptions.values()).filter(sub => sub.isActive).length;
    const total = this.subscriptions.size;
    const retrying = Array.from(this.subscriptions.values()).filter(sub => sub.retryCount > 0).length;

    return {
      active,
      total,
      retrying,
      subscriptions: Array.from(this.subscriptions.entries()).map(([id, sub]) => ({
        id,
        channel: sub.channel,
        retryCount: sub.retryCount,
        isActive: sub.isActive
      }))
    };
  }

  // Force reconnect all subscriptions
  reconnectAll() {
    console.log('Force reconnecting all subscriptions...');

    this.subscriptions.forEach((subscription, id) => {
      if (subscription.isActive && subscription.unsubscribe) {
        // Unsubscribe current connection
        subscription.unsubscribe();
        subscription.unsubscribe = null;

        // Reset retry count and attempt reconnection
        subscription.retryCount = 0;

        // Re-attempt subscription after a short delay
        setTimeout(() => {
          if (subscription.isActive) {
            this.attemptSubscription(subscription);
          }
        }, 1000);
      }
    });
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();