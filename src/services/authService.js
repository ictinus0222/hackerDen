import { account } from '../lib/appwrite';
import { clearAppStorage, hasActiveSession } from '../utils/sessionUtils';

export const authService = {
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
      // Always try to get the user from Appwrite first
      // OAuth sessions might not be stored in localStorage the same way as email/password sessions
      const user = await account.get();
      return user;
    } catch (error) {
      // Only clear storage on 401 errors, not on other errors
      if (error?.code === 401 || error?.message?.includes('Unauthorized')) {
        clearAppStorage();
      }
      return null;
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      // Always try to get the user from Appwrite first
      await account.get();
      return true;
    } catch (error) {
      // Only clear storage on 401 errors, not on other errors
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
      
      // Log session info after successful authentication
      console.log('authService: Session established successfully');
      console.log('authService: Final localStorage keys:', Object.keys(localStorage));
      console.log('authService: Final Appwrite keys:', Object.keys(localStorage).filter(key => key.startsWith('appwrite-')));
      
      return user;
    } catch (error) {
      console.error('authService: OAuth callback error:', error);
      
      // Check if this is the testing phase error (missing scopes)
      if (error?.message?.includes('missing scopes') || 
          error?.message?.includes('User (role: guests)')) {
        // Clear any invalid session data to prevent loops
        clearAppStorage();
        throw new Error('HackerDen is currently in testing phase. Your account has been rejected due to testing restrictions. Please contact the developer for access.');
      }
      
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
      
      // Clear storage for other errors to prevent loops
      clearAppStorage();
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
