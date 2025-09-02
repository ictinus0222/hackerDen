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
      return await account.get();
    } catch {
      return null;
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      await account.get();
      return true;
    } catch {
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
  }
};