import { account } from '../lib/appwrite';

// Simple session cache to prevent redundant API calls
let userCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

export const auth = {
  // Simple Google OAuth login
  async loginWithGoogle() {
    try {
      console.log('🚀 Initiating Google OAuth with redirect URLs:');
      console.log('Success URL:', `${window.location.origin}/oauth/callback`);
      console.log('Failure URL:', `${window.location.origin}/login`);
      
      // Use Appwrite's OAuth2 session creation
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

  // Test simple OAuth (for debugging)
  async testSimpleOAuth() {
    try {
      console.log('🧪 Testing simple OAuth redirect to home page');
      
      // Try redirecting directly to home page instead of callback
      await account.createOAuth2Session(
        'google',
        `${window.location.origin}/`,     // Direct to home page
        `${window.location.origin}/login` // Failure to login
      );
    } catch (error) {
      console.error('Simple OAuth test failed:', error);
      throw error;
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

  // Process OAuth callback URL parameters
  async processOAuthCallback() {
    console.log('🔄 Processing OAuth callback URL...');
    
    try {
      // Let Appwrite handle the OAuth callback automatically
      // by just waiting for the session to be available
      console.log('⏳ Waiting for Appwrite to process OAuth callback...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Clear any cached session data
      this.clearCache();
      
      // Try to get the user session
      const user = await account.get();
      if (user) {
        console.log('✅ OAuth session established via callback!', user.name || user.email);
        userCache = user;
        cacheTimestamp = Date.now();
        return user;
      } else {
        throw new Error('No user session found after OAuth callback');
      }
    } catch (error) {
      console.error('❌ OAuth callback processing failed:', error);
      throw new Error(`OAuth callback failed: ${error.message}`);
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
        
        // If we get a specific "guests" role error, it means OAuth didn't work
        if (error.message.includes('role: guests')) {
          console.log('❌ OAuth session not properly established - user still in guest role');
        }
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
