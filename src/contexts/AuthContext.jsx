import { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { clearAppStorage, handleAuthError } from '../utils/sessionUtils';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (authError) {
      const errorInfo = handleAuthError(authError);
      setUser(null);
      if (errorInfo.shouldRedirect) {
        setError(errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      await authService.login(email, password);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (loginError) {
      setError(loginError.message);
      throw loginError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setError(null);
      setLoading(true);
      await authService.register(email, password, name);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (registerError) {
      setError(registerError.message);
      throw registerError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (logoutError) {
      console.warn('Logout error:', logoutError);
      setError(logoutError.message);
      // Even if logout fails, clear the user state
      setUser(null);
      throw logoutError;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
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