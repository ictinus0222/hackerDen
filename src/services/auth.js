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
      console.log('💾 Using cached user:', userCache.name || userCache.email);
      return userCache;
    }
    
    try {
      console.log('🔍 Making account.get() request...');
      const user = await account.get();
      if (user) {
        console.log('✅ User session found:', user.name || user.email);
        userCache = user;
        cacheTimestamp = now;
        return user;
      } else {
        console.log('❌ account.get() returned null/undefined');
        userCache = null;
        cacheTimestamp = 0;
        return null;
      }
    } catch (error) {
      console.log('❌ account.get() failed:', error.message);
      // Clear cache on error
      userCache = null;
      cacheTimestamp = 0;
      return null;
    }
  },

  // Wait for session with retry logic (for OAuth callbacks)
  async waitForSession(maxAttempts = 10, delay = 1000) {
    console.log('⏳ Waiting for OAuth session to be established...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔍 Session check attempt ${attempt}/${maxAttempts}`);
      
      try {
        // Clear cache to force fresh check
        this.clearCache();
        
        const user = await account.get();
        if (user) {
          console.log('✅ OAuth session established!', user.name || user.email);
          userCache = user;
          cacheTimestamp = Date.now();
          return user;
        }
      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed:`, error.message);
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('OAuth session not established after multiple attempts');
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
