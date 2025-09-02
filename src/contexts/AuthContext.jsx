import { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await authService.loginWithGoogle();
      // This will redirect to Google, so we won't reach this point
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const handleOAuthCallback = async () => {
    try {
      setLoading(true);
      const user = await authService.handleOAuthCallback();
      setUser(user);
      return user;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.warn('Logout error:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };