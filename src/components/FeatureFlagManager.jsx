/**
 * @fileoverview Feature Flag Management UI
 * Administrative interface for managing feature flags and gradual rollouts
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { useAuth } from '../hooks/useAuth';
import { Settings, Users, Percent, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Feature flag descriptions for UI
 */
const FEATURE_DESCRIPTIONS = {
  fileSharing: {
    name: 'File Sharing System',
    description: 'Upload, share, and annotate files within teams',
    category: 'collaboration'
  },
  ideaBoard: {
    name: 'Idea Management Board',
    description: 'Submit, vote on, and manage project ideas',
    category: 'collaboration'
  },
  gamification: {
    name: 'Gamification & Achievements',
    description: 'Points, badges, leaderboards, and celebrations',
    category: 'engagement'
  },
  judgeSubmissions: {
    name: 'Judge Submission Pages',
    description: 'Create public submission pages for hackathon judging',
    category: 'presentation'
  },
  polling: {
    name: 'In-App Polling System',
    description: 'Create and vote on polls within team chat',
    category: 'collaboration'
  },
  botEnhancements: {
    name: 'System Bot & UX Enhancements',
    description: 'Friendly bot interactions and enhanced tooltips',
    category: 'engagement'
  },
  customEmoji: {
    name: 'Custom Emoji & Reactions',
    description: 'Upload custom emoji and react to messages/tasks',
    category: 'engagement'
  },
  easterEggs: {
    name: 'Easter Eggs & Discovery',
    description: 'Hidden features and fun interactions',
    category: 'engagement'
  },
  reactions: {
    name: 'Message & Task Reactions',
    description: 'React to messages and tasks with emoji',
    category: 'engagement'
  }
};

/**
 * Feature Flag Manager Component
 */
const FeatureFlagManager = ({ isAdmin = false }) => {
  const { user } = useAuth();
  const {
    featureFlags,
    loading,
    error,
    updateFeatureFlag,
    updateRolloutConfig,
    resetFeatureFlags,
    reloadFlags,
    isInRolloutGroup
  } = useFeatureFlags();

  const [rolloutConfigs, setRolloutConfigs] = useState({});
  const [activeTab, setActiveTab] = useState('flags');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadRolloutConfigs();
  }, []);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      setTimeout(() => setLocalError(null), 5000);
    }
  }, [error]);

  /**
   * Load current rollout configurations
   */
  const loadRolloutConfigs = () => {
    try {
      const stored = localStorage.getItem('hackerden_rollout_config');
      if (stored) {
        setRolloutConfigs(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Error loading rollout configs:', err);
    }
  };

  /**
   * Handle feature flag toggle
   */
  const handleFeatureToggle = async (feature, enabled) => {
    const success = updateFeatureFlag(feature, enabled);
    if (success) {
      setSuccessMessage(`${FEATURE_DESCRIPTIONS[feature]?.name} ${enabled ? 'enabled' : 'disabled'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  /**
   * Handle rollout percentage change
   */
  const handleRolloutChange = (feature, percentage) => {
    const config = rolloutConfigs[feature] || {};
    const newConfig = {
      ...config,
      rolloutPercentage: percentage,
      enabled: true
    };

    const success = updateRolloutConfig(feature, newConfig);
    if (success) {
      setRolloutConfigs(prev => ({
        ...prev,
        [feature]: newConfig
      }));
      setSuccessMessage(`${FEATURE_DESCRIPTIONS[feature]?.name} rollout set to ${percentage}%`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  /**
   * Handle user-specific override
   */
  const handleUserOverride = (feature, userId, enabled) => {
    const config = rolloutConfigs[feature] || {};
    const userOverrides = config.userOverrides || {};
    
    if (enabled === null) {
      delete userOverrides[userId];
    } else {
      userOverrides[userId] = enabled;
    }

    const newConfig = {
      ...config,
      userOverrides
    };

    const success = updateRolloutConfig(feature, newConfig);
    if (success) {
      setRolloutConfigs(prev => ({
        ...prev,
        [feature]: newConfig
      }));
    }
  };

  /**
   * Handle reset confirmation
   */
  const handleReset = () => {
    const success = resetFeatureFlags();
    if (success) {
      setRolloutConfigs({});
      setShowResetDialog(false);
      setSuccessMessage('All feature flags reset to defaults');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  /**
   * Get feature status badge
   */
  const getFeatureStatusBadge = (feature) => {
    const isEnabled = featureFlags[feature];
    const config = rolloutConfigs[feature];
    const rolloutPercentage = config?.rolloutPercentage ?? 100;
    
    if (!isEnabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    
    if (rolloutPercentage === 100) {
      return <Badge variant="default">Enabled</Badge>;
    }
    
    return <Badge variant="outline">{rolloutPercentage}% Rollout</Badge>;
  };

  /**
   * Group features by category
   */
  const groupedFeatures = Object.entries(FEATURE_DESCRIPTIONS).reduce((acc, [key, desc]) => {
    const category = desc.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, ...desc });
    return acc;
  }, {});

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading feature flags...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feature Flag Management</h2>
          <p className="text-muted-foreground">
            Manage enhancement features and gradual rollouts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reloadFlags}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
          {isAdmin && (
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset All Feature Flags</DialogTitle>
                  <DialogDescription>
                    This will reset all feature flags and rollout configurations to their default values.
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReset}>
                    Reset All
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {localError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="flags">
            <Settings className="h-4 w-4 mr-2" />
            Feature Flags
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="rollout">
              <Percent className="h-4 w-4 mr-2" />
              Gradual Rollout
            </TabsTrigger>
          )}
          <TabsTrigger value="status">
            <Users className="h-4 w-4 mr-2" />
            User Status
          </TabsTrigger>
        </TabsList>

        {/* Feature Flags Tab */}
        <TabsContent value="flags" className="space-y-6">
          {Object.entries(groupedFeatures).map(([category, features]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category} Features</CardTitle>
                <CardDescription>
                  Manage {category}-related enhancement features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Label className="font-medium">{feature.name}</Label>
                          {getFeatureStatusBadge(feature.key)}
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {isAdmin && (
                          <Switch
                            checked={featureFlags[feature.key]}
                            onCheckedChange={(enabled) => handleFeatureToggle(feature.key, enabled)}
                          />
                        )}
                        {!isAdmin && (
                          <Badge variant={featureFlags[feature.key] ? "default" : "secondary"}>
                            {featureFlags[feature.key] ? "Enabled" : "Disabled"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Gradual Rollout Tab */}
        {isAdmin && (
          <TabsContent value="rollout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gradual Rollout Configuration</CardTitle>
                <CardDescription>
                  Configure percentage-based rollouts for testing features with subsets of users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {Object.entries(FEATURE_DESCRIPTIONS).map(([feature, desc]) => {
                      const config = rolloutConfigs[feature] || {};
                      const rolloutPercentage = config.rolloutPercentage ?? 100;
                      
                      return (
                        <div key={feature} className="space-y-3 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="font-medium">{desc.name}</Label>
                              <p className="text-sm text-muted-foreground">{desc.description}</p>
                            </div>
                            <Badge variant="outline">{rolloutPercentage}%</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Rollout Percentage</Label>
                            <div className="flex items-center gap-4">
                              <Slider
                                value={[rolloutPercentage]}
                                onValueChange={([value]) => handleRolloutChange(feature, value)}
                                max={100}
                                step={5}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                value={rolloutPercentage}
                                onChange={(e) => handleRolloutChange(feature, parseInt(e.target.value) || 0)}
                                min={0}
                                max={100}
                                className="w-20"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* User Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Feature Status</CardTitle>
              <CardDescription>
                View which features are enabled for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(FEATURE_DESCRIPTIONS).map(([feature, desc]) => {
                  const isEnabled = featureFlags[feature];
                  const inRollout = isInRolloutGroup(feature);
                  const config = rolloutConfigs[feature] || {};
                  
                  return (
                    <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label className="font-medium">{desc.name}</Label>
                          {isEnabled ? (
                            <Badge variant="default">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{desc.description}</p>
                        {config.rolloutPercentage && config.rolloutPercentage < 100 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {inRollout ? 'You are in the rollout group' : 'You are not in the rollout group'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureFlagManager;