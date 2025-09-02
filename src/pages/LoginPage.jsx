import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Logo from '../components/Logo.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <Logo className="h-12 w-auto" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome to HackerDen
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-lg">
                Sign in to access your workspace
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white dark:border-slate-600 dark:hover:border-slate-500"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
            
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              By continuing, you agree to our terms of service and privacy policy
            </p>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Secure authentication powered by Google OAuth
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;