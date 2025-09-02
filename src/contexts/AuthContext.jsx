import { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { clearAppStorage, handleAuthError, cleanupInvalidSessions, hasActiveSession } from '../utils/sessionUtils';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clean up any invalid sessions first
    cleanupInvalidSessions();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Quick check - if no session data exists, don't make API call
      if (!hasActiveSession()) {
        setUser(null);
        setLoading(false);
        return;
      }
      
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

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await authService.loginWithGoogle();
      // Note: This will redirect to Google, so we won't reach this point
      // The user will be redirected back to our app after authentication
    } catch (googleError) {
      setError(googleError.message);
      setLoading(false);
      throw googleError;
    }
  };

  const handleOAuthCallback = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('AuthContext: Starting OAuth callback...');
      
      const user = await authService.handleOAuthCallback();
      console.log('AuthContext: OAuth callback successful, user:', user);
      
      setUser(user);
      console.log('AuthContext: User state set, isAuthenticated should be:', !!user);
      
      return user;
    } catch (callbackError) {
      console.error('AuthContext: OAuth callback error:', callbackError);
      setError(callbackError.message);
      setUser(null);
      throw callbackError;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    handleOAuthCallback,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };