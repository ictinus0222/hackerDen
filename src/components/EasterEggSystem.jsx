/**
 * @fileoverview Easter Egg System Integration Component
 * Main component that integrates all easter egg features and manages the discovery system
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Settings, Trophy, Sparkles, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import EasterEggTrigger from './EasterEggTrigger';
import SpecialDateDecorator from './SpecialDateDecorator';
import EasterEggAchievements from './EasterEggAchievements';
import { CustomTooltip, PopCultureTooltip, GreetingTooltip } from './CustomTooltip';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import botService from '../services/botService';

/**
 * Easter Egg System Component
 * Provides the main interface for easter egg features and discovery
 */
export const EasterEggSystem = ({ children }) => {
  const { user } = useAuth();
  const { currentTeam, currentHackathon } = useTeam();
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [easterEggSettings, setEasterEggSettings] = useState({
    enabled: true,
    showHints: true,
    celebrationEffects: true,
    soundEffects: false,
    tooltipPersonality: true,
    specialDateThemes: true,
    commandSuggestions: true
  });
  const [discoveryStats, setDiscoveryStats] = useState({
    totalDiscovered: 0,
    recentDiscoveries: [],
    favoriteCommands: [],
    streakDays: 0
  });

  // Load settings and stats on mount
  useEffect(() => {
    if (user) {
      loadEasterEggSettings();
      loadDiscoveryStats();
    }
  }, [user]);

  // Set up global event listeners for easter egg events
  useEffect(() => {
    const handleEasterEggEffect = (event) => {
      if (!easterEggSettings.celebrationEffects) return;
      
      // Handle visual effects
      console.log('Easter egg effect triggered:', event.detail);
    };

    const handleAchievementUnlocked = (event) => {
      if (!easterEggSettings.enabled) return;
      
      // Handle achievement celebrations
      console.log('Easter egg achievement unlocked:', event.detail);
      
      // Update discovery stats
      setDiscoveryStats(prev => ({
        ...prev,
        totalDiscovered: prev.totalDiscovered + 1,
        recentDiscoveries: [
          {
            type: 'achievement',
            name: event.detail.achievement.name,
            timestamp: new Date().toISOString()
          },
          ...prev.recentDiscoveries.slice(0, 9)
        ]
      }));
    };

    const handleSpecialDateEffect = (event) => {
      if (!easterEggSettings.specialDateThemes) return;
      
      // Handle special date effects
      console.log('Special date effect triggered:', event.detail);
    };

    // Add event listeners
    window.addEventListener('easter-egg-effect', handleEasterEggEffect);
    window.addEventListener('easter-egg-achievement-unlocked', handleAchievementUnlocked);
    window.addEventListener('special-date-effect', handleSpecialDateEffect);

    return () => {
      window.removeEventListener('easter-egg-effect', handleEasterEggEffect);
      window.removeEventListener('easter-egg-achievement-unlocked', handleAchievementUnlocked);
      window.removeEventListener('special-date-effect', handleSpecialDateEffect);
    };
  }, [easterEggSettings]);

  const loadEasterEggSettings = () => {
    try {
      const saved = localStorage.getItem(`easterEggSettings_${user.$id}`);
      if (saved) {
        setEasterEggSettings({ ...easterEggSettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading easter egg settings:', error);
    }
  };

  const saveEasterEggSettings = (newSettings) => {
    try {
      setEasterEggSettings(newSettings);
      localStorage.setItem(`easterEggSettings_${user.$id}`, JSON.stringify(newSettings));
      
      toast.success('Easter egg settings saved!', {
        icon: '⚙️',
        duration: 2000
      });
    } catch (error) {
      console.error('Error saving easter egg settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const loadDiscoveryStats = () => {
    try {
      const saved = localStorage.getItem(`discoveryStats_${user.$id}`);
      if (saved) {
        setDiscoveryStats({ ...discoveryStats, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading discovery stats:', error);
    }
  };

  const triggerRandomEasterEgg = async () => {
    const randomCommands = ['/party', '/celebrate', '/coffee', '/pizza', '/rocket', '/magic'];
    const randomCommand = randomCommands[Math.floor(Math.random() * randomCommands.length)];
    
    if (typeof window !== 'undefined' && window.processEasterEggCommand) {
      await window.processEasterEggCommand(randomCommand);
    }
  };

  const showDiscoveryHint = () => {
    const hints = [
      "💡 Try typing /party in the chat for a surprise!",
      "🎭 Hover over buttons to discover witty tooltips!",
      "🎪 Special commands appear on holidays and special dates!",
      "🔍 Some commands are harder to find than others...",
      "🎨 Each easter egg has its own unique effect!",
      "🏆 Unlock achievements by discovering more features!"
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    toast.info(randomHint, {
      duration: 5000,
      icon: '💡'
    });
  };

  if (!easterEggSettings.enabled) {
    return <>{children}</>;
  }

  return (
    <EasterEggTrigger>
      <SpecialDateDecorator>
        {children}
        
        {/* Easter Egg Control Panel */}
        <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-2">
          {/* Quick Discovery Button */}
          <PopCultureTooltip content="Feeling lucky? Try a random easter egg!">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerRandomEasterEgg}
              className="h-10 w-10 p-0 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white hover:from-purple-600 hover:to-pink-600"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </PopCultureTooltip>
          
          {/* Achievements Button */}
          <CustomTooltip content="View your easter egg achievements and progress!">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAchievements(true)}
              className="h-10 w-10 p-0 rounded-full shadow-lg"
            >
              <Trophy className="h-4 w-4" />
            </Button>
          </CustomTooltip>
          
          {/* Settings Button */}
          <CustomTooltip content="Configure easter egg settings and preferences">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-10 w-10 p-0 rounded-full shadow-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CustomTooltip>
          
          {/* Hint Button */}
          {easterEggSettings.showHints && (
            <GreetingTooltip content="Need a hint? Click for discovery tips!">
              <Button
                variant="ghost"
                size="sm"
                onClick={showDiscoveryHint}
                className="h-8 w-8 p-0 rounded-full opacity-60 hover:opacity-100"
              >
                💡
              </Button>
            </GreetingTooltip>
          )}
        </div>

        {/* Easter Egg Achievements Dialog */}
        <EasterEggAchievements 
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
        />

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Easter Egg Settings</span>
              </DialogTitle>
              <DialogDescription>
                Customize your easter egg experience and discovery preferences
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* General Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">General Settings</CardTitle>
                    <CardDescription>
                      Control overall easter egg functionality
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Enable Easter Eggs</div>
                        <div className="text-sm text-muted-foreground">
                          Turn on/off all easter egg features
                        </div>
                      </div>
                      <Button
                        variant={easterEggSettings.enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => saveEasterEggSettings({
                          ...easterEggSettings,
                          enabled: !easterEggSettings.enabled
                        })}
                      >
                        {easterEggSettings.enabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Show Discovery Hints</div>
                        <div className="text-sm text-muted-foreground">
                          Display helpful hints for finding easter eggs
                        </div>
                      </div>
                      <Button
                        variant={easterEggSettings.showHints ? "default" : "outline"}
                        size="sm"
                        onClick={() => saveEasterEggSettings({
                          ...easterEggSettings,
                          showHints: !easterEggSettings.showHints
                        })}
                      >
                        {easterEggSettings.showHints ? "On" : "Off"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Effects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Visual Effects</CardTitle>
                    <CardDescription>
                      Control animations and visual celebrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Celebration Effects</div>
                        <div className="text-sm text-muted-foreground">
                          Show confetti, fireworks, and other visual effects
                        </div>
                      </div>
                      <Button
                        variant={easterEggSettings.celebrationEffects ? "default" : "outline"}
                        size="sm"
                        onClick={() => saveEasterEggSettings({
                          ...easterEggSettings,
                          celebrationEffects: !easterEggSettings.celebrationEffects
                        })}
                      >
                        {easterEggSettings.celebrationEffects ? "On" : "Off"}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Special Date Themes</div>
                        <div className="text-sm text-muted-foreground">
                          Show themed decorations on holidays
                        </div>
                      </div>
                      <Button
                        variant={easterEggSettings.specialDateThemes ? "default" : "outline"}
                        size="sm"
                        onClick={() => saveEasterEggSettings({
                          ...easterEggSettings,
                          specialDateThemes: !easterEggSettings.specialDateThemes
                        })}
                      >
                        {easterEggSettings.specialDateThemes ? "On" : "Off"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Interaction Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Interaction Settings</CardTitle>
                    <CardDescription>
                      Customize tooltips and command suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Witty Tooltips</div>
                        <div className="text-sm text-muted-foreground">
                          Show personality-filled tooltips with pop culture references
                        </div>
                      </div>
                      <Button
                        variant={easterEggSettings.tooltipPersonality ? "default" : "outline"}
                        size="sm"
                        onClick={() => saveEasterEggSettings({
                          ...easterEggSettings,
                          tooltipPersonality: !easterEggSettings.tooltipPersonality
                        })}
                      >
                        {easterEggSettings.tooltipPersonality ? "On" : "Off"}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Command Suggestions</div>
                        <div className="text-sm text-muted-foreground">
                          Show easter egg command hints while typing
                        </div>
                      </div>
                      <Button
                        variant={easterEggSettings.commandSuggestions ? "default" : "outline"}
                        size="sm"
                        onClick={() => saveEasterEggSettings({
                          ...easterEggSettings,
                          commandSuggestions: !easterEggSettings.commandSuggestions
                        })}
                      >
                        {easterEggSettings.commandSuggestions ? "On" : "Off"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Discovery Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Discovery Progress</CardTitle>
                    <CardDescription>
                      Your easter egg discovery statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {discoveryStats.totalDiscovered}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Discovered
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {discoveryStats.streakDays}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Discovery Streak
                        </div>
                      </div>
                    </div>
                    
                    {discoveryStats.recentDiscoveries.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <div className="font-medium mb-2">Recent Discoveries</div>
                          <div className="space-y-1">
                            {discoveryStats.recentDiscoveries.slice(0, 3).map((discovery, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{discovery.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {discovery.type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Close
              </Button>
              <Button onClick={showDiscoveryHint}>
                Show Hint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SpecialDateDecorator>
    </EasterEggTrigger>
  );
};

export default EasterEggSystem;