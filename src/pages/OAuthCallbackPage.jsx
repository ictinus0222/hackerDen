import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/auth';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const OAuthCallbackPage = () => {
  const { refreshAuth, isAuthenticated } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      console.log('🔄 OAuth callback started');
      
      try {
        setStatus('processing');
        
        console.log('🔄 OAuth callback processing started');
        
        // Use the robust session waiting method
        const user = await auth.waitForSession(10, 1500);
        
        // Update auth context with the authenticated user
        console.log('🔄 Updating auth context...');
        await refreshAuth();
        
        console.log('✅ Authentication successful!', user.name || user.email);
        setStatus('success');
        
        // Redirect to console after success
        setTimeout(() => {
          console.log('🚀 Redirecting to console...');
          navigate('/console', { replace: true });
        }, 1000);
      } catch (callbackError) {
        console.error('❌ OAuth callback error:', callbackError);
        setError(callbackError.message || 'Authentication failed. Please try again.');
        setStatus('error');
        
        // Redirect to login after error
        setTimeout(() => {
          console.log('🔄 Redirecting back to login...');
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    // Check if user is already authenticated
    if (isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to console');
      navigate('/console', { replace: true });
      return;
    }

    processCallback();
  }, [refreshAuth, isAuthenticated, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10 dark:bg-primary/20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Completing sign in...</h3>
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
              <div className="p-4 rounded-full bg-green-500/10 dark:bg-green-500/20">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
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
              <div className="p-4 rounded-full bg-destructive/10 dark:bg-destructive/20">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">
                Sign in failed
              </h3>
              <p className="text-muted-foreground text-sm">
                {error || 'Something went wrong during authentication'}
              </p>
              <p className="text-xs text-muted-foreground/70">
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
      {/* Background gradient - matching LoginPage */}
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
