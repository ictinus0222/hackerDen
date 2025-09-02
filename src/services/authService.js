import { account } from '../lib/appwrite';

export const authService = {
  // Google OAuth login
  async loginWithGoogle() {
    try {
      await account.createOAuth2Session(
        'google',
        `${window.location.origin}/oauth/callback`,
        `${window.location.origin}/login?error=oauth_failed`
      );
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Google authentication failed');
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      return null;
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      await account.get();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.warn('Logout error:', error);
      throw new Error('Logout failed');
    }
  },

  // Handle OAuth callback
  async handleOAuthCallback() {
    try {
      // Give Appwrite a moment to establish the session
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the authenticated user
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error('Authentication failed');
    }
  }
};
