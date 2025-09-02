import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Logo from '../components/Logo.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginPage = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { loginWithGoogle, isAuthenticated, error } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/console';
    return <Navigate to={from} replace />;
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    try {
      await loginWithGoogle();
      // Note: This will redirect to Google, so we won't reach this point
    } catch (error) {
      // Let the useAuth hook handle errors
      console.error('OAuth error:', error);
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
    </div>
  );
};

export default LoginPage;