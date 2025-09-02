import { useAuth } from '../hooks/useAuth';
import { hasActiveSession } from '../utils/sessionUtils';

const SessionDebug = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  const logSessionInfo = () => {
    console.log('=== SESSION DEBUG INFO ===');
    console.log('User:', user);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Loading:', loading);
    console.log('hasActiveSession():', hasActiveSession());
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('Appwrite keys:', Object.keys(localStorage).filter(key => key.startsWith('appwrite-')));
    
    // Try to get user directly from Appwrite to see what's happening
    console.log('=== TRYING DIRECT APPWRITE CALL ===');
    import('../services/authService').then(({ authService }) => {
      authService.getCurrentUser().then(user => {
        console.log('Direct Appwrite call result:', user);
      }).catch(error => {
        console.log('Direct Appwrite call error:', error);
      });
    });
    
    console.log('========================');
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Session Debug</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">Not authenticated</p>
        <button 
          onClick={logSessionInfo}
          className="mt-2 px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm"
        >
          Log Session Info
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
      <h3 className="font-semibold text-green-800 dark:text-green-200">Session Debug</h3>
      <p className="text-sm text-green-700 dark:text-green-300">
        Authenticated as: {user?.name || user?.email || 'Unknown'}
      </p>
      <button 
        onClick={logSessionInfo}
        className="mt-2 px-3 py-1 bg-green-200 dark:bg-yellow-800 text-green-800 dark:text-yellow-200 rounded text-sm"
      >
        Log Session Info
      </button>
    </div>
  );
};

export default SessionDebug;
