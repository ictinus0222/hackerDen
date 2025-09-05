import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import GoogleSignInButton from './GoogleSignInButton';
import GitHubSignInButton from './GitHubSignInButton';
import { User, LogOut, Github, Mail } from 'lucide-react';

const AuthDemo = () => {
  const { user, logout, loginWithGoogle, loginWithGitHub, isAuthenticated, loading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true);
    try {
      await loginWithGitHub();
    } catch (error) {
      console.error('GitHub sign-in failed:', error);
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getProviderInfo = (user) => {
    if (!user) return null;
    
    const registration = user.registration || 'email';
    
    switch (registration) {
      case 'google':
        return {
          provider: 'Google',
          icon: <Mail className="w-4 h-4" />,
          color: 'bg-blue-500'
        };
      case 'github':
        return {
          provider: 'GitHub',
          icon: <Github className="w-4 h-4" />,
          color: 'bg-gray-800'
        };
      default:
        return {
          provider: 'Email',
          icon: <Mail className="w-4 h-4" />,
          color: 'bg-green-500'
        };
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Authentication Demo
        </CardTitle>
        <CardDescription>
          Test GitHub and Google OAuth integration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Signed in successfully!
                </span>
                {getProviderInfo(user) && (
                  <Badge variant="secondary" className={`${getProviderInfo(user).color} text-white`}>
                    {getProviderInfo(user).icon}
                    {getProviderInfo(user).provider}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                <div><strong>Name:</strong> {user?.name || 'Not provided'}</div>
                <div><strong>Email:</strong> {user?.email || 'Not provided'}</div>
                <div><strong>User ID:</strong> {user?.$id}</div>
                <div><strong>Registration:</strong> {user?.registration || 'email'}</div>
              </div>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-4">
              Choose your preferred sign-in method:
            </div>
            
            <div className="space-y-3">
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
            
            <div className="text-xs text-center text-muted-foreground">
              Both methods will redirect you to the respective OAuth provider
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDemo;