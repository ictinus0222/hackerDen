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
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
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
  }
};