import { account, ID } from '../lib/appwrite';

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
      // First, try to clear any existing session
      try {
        await account.deleteSession('current');
      } catch {
        // Ignore errors if no session exists
      }
      
      // Clear local storage to ensure clean state
      localStorage.clear();
      sessionStorage.clear();
      
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
      // Delete all sessions to ensure complete logout
      await this.deleteAllSessions();
      
      // Clear any local storage or session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload to clear any cached state
      window.location.reload();
    } catch (error) {
      // Even if logout fails, clear local data and reload
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
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