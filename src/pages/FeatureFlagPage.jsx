/**
 * @fileoverview Feature Flag Management Page
 * Administrative page for managing feature flags and gradual rollouts
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FeatureFlagManager from '../components/FeatureFlagManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

/**
 * Feature Flag Management Page Component
 */
const FeatureFlagPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  /**
   * Check if user has admin access
   * In a real implementation, this would check user roles/permissions
   */
  const checkAdminAccess = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, check if user email contains 'admin' or if they're the first user
      // In production, this should check proper role-based permissions
      const hasAdminAccess = user?.email?.includes('admin') || 
                           user?.email?.includes('owner') ||
                           localStorage.getItem('hackerden_admin_override') === 'true';
      
      setIsAdmin(hasAdminAccess);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enable admin override for development/testing
   */
  const enableAdminOverride = () => {
    localStorage.setItem('hackerden_admin_override', 'true');
    setIsAdmin(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Checking permissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Feature Management</h1>
            {isAdmin && <Badge variant="default">Admin</Badge>}
          </div>
        </div>

        {/* Admin Access Check */}
        {!isAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Limited Access
              </CardTitle>
              <CardDescription>
                You have read-only access to feature flags. Administrative functions are disabled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  To enable admin features for development/testing, you can use the override button below.
                  In production, this would be controlled by proper role-based permissions.
                </AlertDescription>
              </Alert>
              <Button 
                variant="outline" 
                onClick={enableAdminOverride}
                className="mt-4"
              >
                Enable Admin Override (Dev Only)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feature Flag Manager */}
        <FeatureFlagManager isAdmin={isAdmin} />

        {/* Development Information */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Development Information</CardTitle>
              <CardDescription>
                Information for developers and testers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Environment Variables</h4>
                <p className="text-sm text-muted-foreground">
                  Feature flags can be controlled via environment variables:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• VITE_FEATURE_FILE_SHARING</li>
                  <li>• VITE_FEATURE_IDEA_BOARD</li>
                  <li>• VITE_FEATURE_GAMIFICATION</li>
                  <li>• VITE_FEATURE_JUDGE_SUBMISSIONS</li>
                  <li>• VITE_FEATURE_POLLING</li>
                  <li>• VITE_FEATURE_BOT</li>
                  <li>• VITE_FEATURE_CUSTOM_EMOJI</li>
                  <li>• VITE_FEATURE_EASTER_EGGS</li>
                  <li>• VITE_FEATURE_REACTIONS</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Testing</h4>
                <p className="text-sm text-muted-foreground">
                  Use the browser console to test feature flags programmatically:
                </p>
                <code className="text-xs bg-muted p-2 rounded block mt-2">
                  {`// Enable a feature
localStorage.setItem('hackerden_feature_flags', JSON.stringify({fileSharing: true}));

// Check feature status
console.log(window.featureFlagService?.getFeatureStatus());`}
                </code>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FeatureFlagPage;