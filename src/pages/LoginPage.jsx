import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Logo from '../components/Logo.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Construction, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import GoogleSignInButton from '../components/GoogleSignInButton';
import ContactForm from '../components/ContactForm';

const LoginPage = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const { loginWithGoogle, isAuthenticated, error } = useAuth();
  const location = useLocation();

  // Check for OAuth callback errors in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get('error');
    
    if (errorParam === 'oauth_failed') {
      setOauthError('OAuth authentication failed. Please try again or contact the developer for access.');
    } else if (errorParam === 'oauth_callback_failed') {
      setOauthError('OAuth callback failed. This might be due to testing phase restrictions. Please contact the developer for access.');
    }
  }, [location]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/console';
    return <Navigate to={from} replace />;
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setOauthError(null); // Clear any previous OAuth errors
    try {
      await loginWithGoogle();
      // Note: This will redirect to Google, so we won't reach this point
    } catch {
      // Error is handled by useAuth hook
    } finally {
      setIsGoogleLoading(false);
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
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <Logo className="h-12 w-auto" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Welcome to HackerDen
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to access your hackathon workspace
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OAuth Error Alert - Only shown when there are OAuth issues */}
            {oauthError && (
              <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                <Construction className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Testing Phase:</span> HackerDen is currently in limited testing. 
                  If you encounter authentication issues, please contact the developer for access.
                </AlertDescription>
              </Alert>
            )}

            {/* General Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <div className="space-y-4">
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                isLoading={isGoogleLoading}
                disabled={isGoogleLoading}
                className="w-full"
              >
                Continue with Google
              </GoogleSignInButton>
              
              {/* Show contact developer button only when there are OAuth errors */}
              {oauthError && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowContactForm(true)}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Developer for Access
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Or email directly: <a href="mailto:sharmakhil1704@gmail.com" className="text-primary hover:underline">sharmakhil1704@gmail.com</a>
                  </p>
                </div>
              )}
              
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our terms of service and privacy policy
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Secure authentication powered by Google OAuth
          </p>
        </div>
      </div>

      {/* Contact Form Modal - Only shown when needed */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-2xl max-w-md w-full">
            <ContactForm onClose={() => setShowContactForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;