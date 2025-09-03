import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const checkingRef = useRef(false);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Prevent concurrent auth checks
    if (checkingRef.current) {
      console.log('🔄 Auth check already in progress, skipping...');
      return;
    }
    
    console.log('🔍 Starting auth check...');
    checkingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const currentUser = await auth.getUser();
      if (currentUser) {
        console.log('✅ User authenticated:', currentUser.name || currentUser.email);
        setUser(currentUser);
      } else {
        console.log('❌ No authenticated user found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
      // Only throw error if it's not a simple 401 (unauthenticated)
      if (error.code !== 401) {
        throw error;
      }
    } finally {
      setLoading(false);
      checkingRef.current = false;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await auth.loginWithGoogle();
      // Note: This will redirect to Google, so code below won't execute
    } catch (error) {
      setLoading(false);
      setError('Failed to sign in with Google. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Clear user state even if logout fails
    }
  };

  // Force refresh authentication (for after OAuth)
  const refreshAuth = async () => {
    console.log('🔄 Refreshing authentication...');
    auth.clearCache(); // Clear cache to force fresh check
    checkingRef.current = false; // Reset checking flag
    
    try {
      await checkAuth();
      
      // Double-check by getting user directly from auth service
      const currentUser = await auth.getUser();
      if (currentUser) {
        console.log('✅ Auth refresh completed successfully - user authenticated:', currentUser.name || currentUser.email);
      } else {
        console.log('❌ Auth refresh completed but no user found');
        throw new Error('Authentication refresh failed - no user session');
      }
    } catch (error) {
      console.error('❌ Auth refresh failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
    checkAuth,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};