import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const OAuthCallbackPage = () => {
  const { checkAuth, isAuthenticated } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus('processing');
        
        // Wait a moment for Appwrite session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check authentication status
        await checkAuth();
        
        setStatus('success');
        
        // Redirect to console after success
        setTimeout(() => {
          navigate('/console', { replace: true });
        }, 1500);
      } catch (callbackError) {
        console.error('OAuth callback error:', callbackError);
        setError('Authentication failed. Please try again.');
        setStatus('error');
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/console', { replace: true });
      return;
    }

    processCallback();
  }, [checkAuth, isAuthenticated, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Completing sign in...</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Please wait while we set up your account
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                Sign in successful!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Redirecting you to your console...
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                Sign in failed
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {error || 'Something went wrong during authentication'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redirecting you back to login...
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
