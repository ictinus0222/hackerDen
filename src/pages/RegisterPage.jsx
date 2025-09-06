import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Logo from '../components/Logo.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import GitHubSignInButton from '../components/GitHubSignInButton';

const RegisterPage = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const { loginWithGoogle, loginWithGitHub, isAuthenticated, error } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }


  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Note: This will redirect to Google, so we won't reach this point
    } catch {
      // Error is handled by useAuth hook
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true);
    try {
      await loginWithGitHub();
      // Note: This will redirect to GitHub, so we won't reach this point
    } catch {
      // Error is handled by useAuth hook
    } finally {
      setIsGitHubLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background/95 dark:to-primary/10" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 dark:bg-card/90">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primary/20">
                <Logo size="lg" showText={false} />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Join HackerDen
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in with your preferred account
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/20 dark:border-destructive/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                isLoading={isGoogleLoading}
                disabled={isGitHubLoading}
              />
              <GitHubSignInButton
                onClick={handleGitHubSignIn}
                isLoading={isGitHubLoading}
                disabled={isGoogleLoading}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Secure authentication powered by OAuth
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;