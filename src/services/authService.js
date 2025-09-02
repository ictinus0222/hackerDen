import { account, ID } from '../lib/appwrite';
import { clearAppStorage, hasActiveSession } from '../utils/sessionUtils';

export const authService = {
  // Register a new user
  async register(email, password, name) {
    try {
      const user = await account.create(ID.unique(), email, password, name);
      // Automatically log in after registration
      await this.login(email, password);
      return user;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login user
  async login(email, password) {
    try {
      // Only try to delete existing session if we detect one in localStorage
      if (hasActiveSession()) {
        try {
          await account.deleteSession('current');
        } catch (deleteError) {
          // Session might be expired or invalid, continue with login
          console.log('Previous session cleanup failed, continuing with new login');
        }
      }
      
      // Create new session
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Logout user
  async logout() {
    try {
      // Delete current session
      await account.deleteSession('current');
      
      // Clear any app-specific local storage (but not Appwrite session data)
      clearAppStorage();
      
      return true;
    } catch (error) {
      console.warn('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      // Only make API call if we have indication of an active session
      if (!hasActiveSession()) {
        return null;
      }
      return await account.get();
    } catch (error) {
      // Clear invalid session data on 401 errors
      if (error?.code === 401 || error?.message?.includes('Unauthorized')) {
        clearAppStorage();
      }
      return null;
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      // Quick check using localStorage first
      if (!hasActiveSession()) {
        return false;
      }
      await account.get();
      return true;
    } catch (error) {
      // Clear invalid session data on 401 errors
      if (error?.code === 401 || error?.message?.includes('Unauthorized')) {
        clearAppStorage();
      }
      return false;
    }
  },

  // Delete all sessions (for complete logout)
  async deleteAllSessions() {
    try {
      await account.deleteSessions();
    } catch (error) {
      console.warn('Failed to delete all sessions:', error);
    }
  },

  // Google OAuth login
  async loginWithGoogle() {
    try {
      // Clean up any existing session first
      if (hasActiveSession()) {
        try {
          await account.deleteSession('current');
        } catch (deleteError) {
          console.log('Previous session cleanup failed, continuing with Google login');
        }
      }
      
      // Create OAuth2 session with Google
      // This will redirect to Google's OAuth page
      await account.createOAuth2Session(
        'google',
        `${window.location.origin}/oauth/callback`, // Success redirect
        `${window.location.origin}/login?error=oauth_failed` // Failure redirect
      );
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error(error.message || 'Google authentication failed');
    }
  },

  // Handle OAuth callback and get user session
  async handleOAuthCallback() {
    try {
      console.log('authService: Starting OAuth callback...');
      
      // Log current session state
      console.log('authService: Current localStorage keys:', Object.keys(localStorage));
      console.log('authService: Appwrite keys:', Object.keys(localStorage).filter(key => key.startsWith('appwrite-')));
      
      // Give Appwrite a moment to establish the session
      console.log('authService: Waiting for session to be established...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log session state after delay
      console.log('authService: After delay - localStorage keys:', Object.keys(localStorage));
      console.log('authService: After delay - Appwrite keys:', Object.keys(localStorage).filter(key => key.startsWith('appwrite-')));
      
      // After OAuth redirect, try to get the current user directly
      // The session should be established by Appwrite at this point
      console.log('authService: Attempting to get current user...');
      
      const user = await account.get();
      console.log('authService: Successfully got user from account.get():', user);
      
      return user;
    } catch (error) {
      console.error('authService: OAuth callback error:', error);
      
      // Check if we have session data now
      if (hasActiveSession()) {
        console.log('authService: Session data found, retrying...');
        try {
          const user = await account.get();
          console.log('authService: Retry successful, user:', user);
          return user;
        } catch (retryError) {
          console.error('authService: Retry failed:', retryError);
        }
      }
      
      throw new Error('Failed to complete OAuth authentication: ' + error.message);
    }
  },

  // Check if current session is from OAuth
  async isOAuthSession() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;
      
      // Check if user has OAuth provider data
      return user.registration && user.registration !== 'email';
    } catch {
      return false;
    }
  }
};