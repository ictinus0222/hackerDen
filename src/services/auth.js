import { account } from '../lib/appwrite';

// Simple session cache to prevent redundant API calls
let userCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

export const auth = {
  // Simple Google OAuth login
  async loginWithGoogle() {
    try {
      await account.createOAuth2Session(
        'google',
        `${window.location.origin}/oauth/callback`, // Success redirect to callback handler
        `${window.location.origin}/login`           // Failure redirect to login
      );
    } catch (error) {
      console.error('Google login failed:', error);
      throw new Error('Failed to sign in with Google');
    }
  },

  // Get current user with caching
  async getUser() {
    const now = Date.now();
    
    // Return cached user if still valid
    if (userCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return userCache;
    }
    
    try {
      const user = await account.get();
      userCache = user;
      cacheTimestamp = now;
      return user;
    } catch (error) {
      // Clear cache on error
      userCache = null;
      cacheTimestamp = 0;
      return null;
    }
  },

  // Clear user cache
  clearCache() {
    userCache = null;
    cacheTimestamp = 0;
  },

  // Simple logout
  async logout() {
    try {
      await account.deleteSession('current');
      this.clearCache(); // Clear cache on logout
    } catch (error) {
      console.error('Logout failed:', error);
      this.clearCache(); // Clear cache even on error
      throw new Error('Failed to logout');
    }
  }
};
