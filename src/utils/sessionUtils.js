/**
 * Session utilities for handling authentication state and recovery
 */

/**
 * Clear only app-specific localStorage items, preserving Appwrite session data
 */
export const clearAppStorage = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !key.startsWith('appwrite-')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Clean up invalid or corrupted Appwrite session data
 */
export const cleanupInvalidSessions = () => {
  try {
    const keys = Object.keys(localStorage);
    const appwriteKeys = keys.filter(key => key.startsWith('appwrite-'));
    
    appwriteKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (!value || value === 'null' || value === 'undefined' || value === '') {
        localStorage.removeItem(key);
        console.log(`Removed invalid session key: ${key}`);
      } else if (value.startsWith('{') || value.startsWith('[')) {
        try {
          JSON.parse(value);
        } catch {
          localStorage.removeItem(key);
          console.log(`Removed corrupted session key: ${key}`);
        }
      }
    });
  } catch (error) {
    console.warn('Error cleaning up sessions:', error);
  }
};

/**
 * Check if there's a valid Appwrite session in localStorage
 */
export const hasAppwriteSession = () => {
  try {
    const keys = Object.keys(localStorage);
    return keys.some(key => key.startsWith('appwrite-') && localStorage.getItem(key));
  } catch (error) {
    console.warn('Error checking Appwrite session:', error);
    return false;
  }
};

/**
 * Log session information for debugging
 */
export const logSessionInfo = () => {
  try {
    const appwriteKeys = Object.keys(localStorage).filter(key => key.startsWith('appwrite-'));
    console.log('Appwrite session keys:', appwriteKeys.length > 0 ? appwriteKeys : 'None found');
    console.log('Has active session:', hasActiveSession());
    
    // Log key values for debugging (but redact sensitive data)
    appwriteKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value && value.length > 10) {
        console.log(`${key}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
  } catch (error) {
    console.warn('Error logging session info:', error);
  }
};

/**
 * Handle authentication errors consistently across the app
 */
export const handleAuthError = (error) => {
  console.warn('Authentication error:', error);
  
  if (error?.code === 401 || error?.message?.includes('Unauthorized')) {
    console.log('Clearing invalid session data due to 401 error');
    clearAppStorage();
    return {
      shouldRedirect: true,
      message: 'Your session has expired. Please log in again.'
    };
  }
  
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return {
      shouldRedirect: false,
      message: 'Network error. Please check your connection and try again.'
    };
  }
  
  return {
    shouldRedirect: false,
    message: error?.message || 'An authentication error occurred.'
  };
};

/**
 * Check if user has an active session without making API calls
 */
export const hasActiveSession = () => {
  try {
    // Check if there are any Appwrite session keys in localStorage
    const keys = Object.keys(localStorage);
    const sessionKeys = keys.filter(key => 
      key.startsWith('appwrite-') && 
      (key.includes('session') || key.includes('cookieFallback') || key.includes('user'))
    );
    
    // Check if we have valid session data
    const hasValidSession = sessionKeys.length > 0 && sessionKeys.some(key => {
      const value = localStorage.getItem(key);
      if (!value || value === 'null' || value === 'undefined' || value === '') {
        return false;
      }
      
      // Try to parse JSON values to check validity
      try {
        if (value.startsWith('{') || value.startsWith('[')) {
          const parsed = JSON.parse(value);
          return parsed && typeof parsed === 'object';
        }
        return true; // Non-JSON values are considered valid if not empty
      } catch {
        return false; // Invalid JSON
      }
    });
    
    return hasValidSession;
  } catch (error) {
    console.warn('Error checking active session:', error);
    return false;
  }
};