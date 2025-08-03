// Simple test utility to verify authentication setup
// This file can be removed after testing

import { authService } from '../services/authService';

export const testAuthSetup = async () => {
  try {
    console.log('Testing authentication setup...');
    
    // Test getting current user (should return null if not logged in)
    const currentUser = await authService.getCurrentUser();
    console.log('Current user:', currentUser);
    
    // Test if user is logged in
    const isLoggedIn = await authService.isLoggedIn();
    console.log('Is logged in:', isLoggedIn);
    
    console.log('Authentication setup test completed successfully!');
    return true;
  } catch (error) {
    console.error('Authentication setup test failed:', error);
    return false;
  }
};

// Uncomment the line below to run the test when this file is imported
// testAuthSetup();