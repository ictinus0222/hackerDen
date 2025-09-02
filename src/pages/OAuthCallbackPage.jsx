import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, CheckCircle, AlertCircle, Construction, MessageSquare, Users } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import ContactForm from '../components/ContactForm';

const OAuthCallbackPage = () => {
  const { handleOAuthCallback, isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error, testing-phase
  const [error, setError] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const navigate = useNavigate();
  const isProcessing = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent multiple processing attempts
      if (isProcessing.current || hasProcessed) {
        return;
      }
      
      isProcessing.current = true;
      setHasProcessed(true);
      
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
        
        // Check if this is the testing phase error (missing scopes)
        // This happens when users reach the callback but don't have proper permissions
        if (callbackError.message.includes('missing scopes') || 
            callbackError.message.includes('User (role: guests)') ||
            callbackError.message.includes('testing phase')) {
          setStatus('testing-phase');
          // Don't redirect for testing phase - let user stay on this page
        } else {
          setStatus('error');
          
          // Only redirect for non-testing phase errors, and add a longer delay
          setTimeout(() => {
            console.log('Redirecting to /login due to error...');
            navigate('/login?error=oauth_callback_failed', { replace: true });
          }, 5000); // Increased delay to prevent rapid redirects
        }
      } finally {
        isProcessing.current = false;
      }
    };

    // Check if user is already authenticated
    if (isAuthenticated && user) {
      console.log('User already authenticated, redirecting to /console...');
      navigate('/console', { replace: true });
      return;
    }

    // Process the callback only once
    if (!hasProcessed) {
      processCallback();
    }
  }, [handleOAuthCallback, isAuthenticated, user, navigate, hasProcessed]);

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

      case 'testing-phase':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Construction className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-amber-700 dark:text-amber-300">
                HackerDen is in Testing Phase
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We're currently testing our authentication system with a limited group of 100 pre-approved users. 
                Your account has been rejected due to testing restrictions. 
                If you'd like to try HackerDen, please contact the developer to get added to the approved users list.
              </p>
            </div>
            
            {!showContactForm ? (
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowContactForm(true)}
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Developer for Access
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <ContactForm onClose={() => setShowContactForm(false)} />
            )}
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
