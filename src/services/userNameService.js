import { account } from '../lib/appwrite';

// Cache for user names to avoid repeated API calls
const userNameCache = new Map();

export const userNameService = {
  // Get user name from user ID with caching
  async getUserName(userId, currentUser = null) {
    // Check cache first
    if (userNameCache.has(userId)) {
      return userNameCache.get(userId);
    }

    // If this is the current user, use their name
    if (currentUser && currentUser.$id === userId && currentUser.name) {
      userNameCache.set(userId, currentUser.name);
      return currentUser.name;
    }

    try {
      // Try to get from Appwrite Users API (this only works for the current user)
      const userDoc = await account.get();
      if (userDoc && userDoc.$id === userId && userDoc.name) {
        userNameCache.set(userId, userDoc.name);
        return userDoc.name;
      }
    } catch (error) {
      // Users API not accessible or user not found
    }

    // Generate a simple fallback name
    const fallbackName = this.getSimpleFallback(userId);

    // Cache the fallback name
    userNameCache.set(userId, fallbackName);
    return fallbackName;
  },

  // Set a known user name in cache
  setUserName(userId, userName) {
    userNameCache.set(userId, userName);
  },

  // Clear cache
  clearCache() {
    userNameCache.clear();
  },

  // Get all cached names
  getCachedNames() {
    return Object.fromEntries(userNameCache);
  },

  // Get a simple fallback for unknown users
  getSimpleFallback(userId) {
    if (userId.includes('@')) {
      const username = userId.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    
    // Just return "Team Member" for unknown users
    return 'Team Member';
  }
};