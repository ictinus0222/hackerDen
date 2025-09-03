import { account } from '../lib/appwrite';

export const auth = {
  // Simple Google OAuth login
  async loginWithGoogle() {
    try {
      await account.createOAuth2Session(
        'google',
        `${window.location.origin}/dashboard`, // Direct redirect to dashboard
        `${window.location.origin}/login`      // Failure redirect to login
      );
    } catch (error) {
      console.error('Google login failed:', error);
      throw new Error('Failed to sign in with Google');
    }
  },

  // Get current user
  async getUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },

  // Simple logout
  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Failed to logout');
    }
  }
};
