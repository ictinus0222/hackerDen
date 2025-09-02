import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const OAuthCallbackPage = () => {
  const { handleOAuthCallback, isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus('processing');
        console.log('Processing OAuth callback...');
        
        // Give Appwrite a moment to establish the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Handle the OAuth callback
        const user = await handleOAuthCallback();
        console.log('OAuth callback successful, user:', user);
        
        setStatus('success');
        
        // Redirect to console after a short delay
        setTimeout(() => {
          console.log('Redirecting to /console...');
          navigate('/console', { replace: true });
        }, 1500);
      } catch (callbackError) {
        console.error('OAuth callback error:', callbackError);
        setError(callbackError.message);
        setStatus('error');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          console.log('Redirecting to /login due to error...');
          navigate('/login?error=oauth_callback_failed', { replace: true });
        }, 3000);
      }
    };

    // Check if user is already authenticated
    if (isAuthenticated && user) {
      console.log('User already authenticated, redirecting to /console...');
      navigate('/console', { replace: true });
      return;
    }

    // Process the callback
    processCallback();
  }, [handleOAuthCallback, isAuthenticated, user, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Completing sign in...</h3>
              <p className="text-muted-foreground text-sm">
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
              <p className="text-muted-foreground text-sm">
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
              <p className="text-muted-foreground text-sm">
                {error || 'Something went wrong during authentication'}
              </p>
              <p className="text-xs text-muted-foreground">
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background/95 dark:to-primary/10" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 dark:bg-card/90">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
