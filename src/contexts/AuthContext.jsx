import { createContext, useContext, useEffect, useState } from 'react';
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

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await auth.getUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
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

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};