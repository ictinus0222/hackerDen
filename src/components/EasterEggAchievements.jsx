/**
 * @fileoverview Easter Egg Achievements Component
 * Handles discovery rewards and special achievements for easter eggs
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';

// Extended easter egg achievements with discovery mechanics
const EASTER_EGG_ACHIEVEMENTS = {
  FIRST_EASTER_EGG: {
    id: 'first_easter_egg',
    name: 'Easter Egg Hunter',
    description: 'Discovered your first easter egg!',
    pointsAwarded: 10,
    icon: '🥚',
    rarity: 'common',
    hint: 'Try typing special commands in chat...',
    unlockCondition: (stats) => stats.easterEggsFound >= 1
  },
  
  PARTY_ANIMAL: {
    id: 'party_animal',
    name: 'Party Animal',
    description: 'Started 5 parties with /party',
    pointsAwarded: 15,
    icon: '🎉',
    rarity: 'uncommon',
    hint: 'Some people just love to party!',
    unlockCondition: (stats) => stats.commandCounts['/party'] >= 5
  },
  
  CELEBRATION_MASTER: {
    id: 'celebration_master',
    name: 'Celebration Master',
    description: 'Triggered 10 different celebrations',
    pointsAwarded: 20,
    icon: '🎊',
    rarity: 'rare',
    hint: 'Celebrate everything!',
    unlockCondition: (stats) => stats.totalCelebrations >= 10
  },
  
  COMMAND_EXPLORER: {
    id: 'command_explorer',
    name: 'Command Explorer',
    description: 'Discovered 5 different easter egg commands',
    pointsAwarded: 25,
    icon: '🔍',
    rarity: 'rare',
    hint: 'There are many hidden commands to discover...',
    unlockCondition: (stats) => stats.uniqueCommands >= 5
  },
  
  SECRET_KEEPER: {
    id: 'secret_keeper',
    name: 'Secret Keeper',
    description: 'Found the ultra-secret commands',
    pointsAwarded: 50,
    icon: '🤫',
    rarity: 'legendary',
    hint: 'Some secrets are harder to find than others...',
    unlockCondition: (stats) => stats.secretCommandsFound >= 1
  },
  
  THEME_COLLECTOR: {
    id: 'theme_collector',
    name: 'Theme Collector',
    description: 'Experienced special date themes',
    pointsAwarded: 30,
    icon: '🎭',
    rarity: 'epic',
    hint: 'Special days bring special surprises...',
    unlockCondition: (stats) => stats.specialThemesExperienced >= 1
  },
  
  TOOLTIP_CONNOISSEUR: {
    id: 'tooltip_connoisseur',
    name: 'Tooltip Connoisseur',
    description: 'Discovered 20 witty tooltips',
    pointsAwarded: 15,
    icon: '💬',
    rarity: 'uncommon',
    hint: 'Hover over things to discover hidden wisdom...',
    unlockCondition: (stats) => stats.tooltipsDiscovered >= 20
  },
  
  EASTER_EGG_MASTER: {
    id: 'easter_egg_master',
    name: 'Easter Egg Master',
    description: 'Unlocked all easter egg achievements',
    pointsAwarded: 100,
    icon: '👑',
    rarity: 'mythical',
    hint: 'The ultimate easter egg hunter!',
    unlockCondition: (stats) => stats.achievementsUnlocked >= 6
  }
};

// Rarity colors and styles
const RARITY_STYLES = {
  common: {
    color: 'bg-gray-500',
    textColor: 'text-gray-100',
    glow: 'shadow-gray-500/20'
  },
  uncommon: {
    color: 'bg-green-500',
    textColor: 'text-green-100',
    glow: 'shadow-green-500/20'
  },
  rare: {
    color: 'bg-blue-500',
    textColor: 'text-blue-100',
    glow: 'shadow-blue-500/20'
  },
  epic: {
    color: 'bg-purple-500',
    textColor: 'text-purple-100',
    glow: 'shadow-purple-500/20'
  },
  legendary: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-900',
    glow: 'shadow-yellow-500/20'
  },
  mythical: {
    color: 'bg-gradient-to-r from-pink-500 to-purple-500',
    textColor: 'text-white',
    glow: 'shadow-pink-500/30'
  }
};

export const EasterEggAchievements = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    easterEggsFound: 0,
    commandCounts: {},
    totalCelebrations: 0,
    uniqueCommands: 0,
    secretCommandsFound: 0,
    specialThemesExperienced: 0,
    tooltipsDiscovered: 0,
    achievementsUnlocked: 0
  });
  const [loading, setLoading] = useState(true);

  // Load easter egg achievements and stats
  useEffect(() => {
    if (isOpen && user) {
      loadEasterEggData();
    }
  }, [isOpen, user]);

  const loadEasterEggData = async () => {
    try {
      setLoading(true);
      
      // Load user's easter egg stats from localStorage (in a real app, this would be from a database)
      const savedStats = localStorage.getItem(`easterEggStats_${user.$id}`);
      const userStats = savedStats ? JSON.parse(savedStats) : {
        easterEggsFound: 0,
        commandCounts: {},
        totalCelebrations: 0,
        uniqueCommands: 0,
        secretCommandsFound: 0,
        specialThemesExperienced: 0,
        tooltipsDiscovered: 0,
        achievementsUnlocked: 0
      };
      
      setStats(userStats);
      
      // Check which achievements are unlocked
      const unlockedAchievements = [];
      const lockedAchievements = [];
      
      Object.values(EASTER_EGG_ACHIEVEMENTS).forEach(achievement => {
        const isUnlocked = achievement.unlockCondition(userStats);
        
        if (isUnlocked) {
          unlockedAchievements.push({
            ...achievement,
            unlocked: true,
            unlockedAt: new Date().toISOString() // In a real app, this would be stored
          });
        } else {
          lockedAchievements.push({
            ...achievement,
            unlocked: false
          });
        }
      });
      
      // Sort by rarity and unlock status
      const sortedAchievements = [
        ...unlockedAchievements.sort((a, b) => getRarityOrder(b.rarity) - getRarityOrder(a.rarity)),
        ...lockedAchievements.sort((a, b) => getRarityOrder(b.rarity) - getRarityOrder(a.rarity))
      ];
      
      setAchievements(sortedAchievements);
    } catch (error) {
      console.error('Error loading easter egg data:', error);
      toast.error('Failed to load easter egg achievements');
    } finally {
      setLoading(false);
    }
  };

  // Get rarity order for sorting
  const getRarityOrder = (rarity) => {
    const order = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythical: 6 };
    return order[rarity] || 0;
  };

  // Update easter egg stats (called from other components)
  const updateStats = (newStats) => {
    const updatedStats = { ...stats, ...newStats };
    setStats(updatedStats);
    
    // Save to localStorage (in a real app, this would be saved to database)
    localStorage.setItem(`easterEggStats_${user.$id}`, JSON.stringify(updatedStats));
    
    // Check for newly unlocked achievements
    checkForNewAchievements(updatedStats);
  };

  // Check for newly unlocked achievements
  const checkForNewAchievements = (currentStats) => {
    Object.values(EASTER_EGG_ACHIEVEMENTS).forEach(achievement => {
      const wasUnlocked = achievements.find(a => a.id === achievement.id)?.unlocked;
      const isNowUnlocked = achievement.unlockCondition(currentStats);
      
      if (!wasUnlocked && isNowUnlocked) {
        // New achievement unlocked!
        showAchievementUnlocked(achievement);
        
        // Award points through gamification service
        if (currentTeam) {
          gamificationService.awardPoints(
            user.$id,
            currentTeam.$id,
            'easter_egg_achievement',
            achievement.pointsAwarded
          );
        }
      }
    });
  };

  // Show achievement unlocked notification
  const showAchievementUnlocked = (achievement) => {
    const rarityStyle = RARITY_STYLES[achievement.rarity];
    
    toast.success(
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <div className="font-bold">Achievement Unlocked!</div>
          <div className={`text-sm ${rarityStyle.textColor}`}>
            {achievement.name}
          </div>
          <div className="text-xs text-muted-foreground">
            +{achievement.pointsAwarded} points
          </div>
        </div>
      </div>,
      {
        duration: 5000,
        className: `${rarityStyle.glow} border-l-4 border-l-current`
      }
    );
    
    // Trigger celebration effect
    if (typeof window !== 'undefined') {
      const celebrationEvent = new CustomEvent('easter-egg-achievement-unlocked', {
        detail: { achievement, rarity: achievement.rarity }
      });
      window.dispatchEvent(celebrationEvent);
    }
  };

  // Expose updateStats function globally for other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.updateEasterEggStats = updateStats;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.updateEasterEggStats;
      }
    };
  }, [updateStats]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">🥚</span>
            <span>Easter Egg Achievements</span>
          </DialogTitle>
          <DialogDescription>
            Discover hidden features and unlock special rewards! 
            Progress: {unlockedCount}/{totalCount} ({completionPercentage}%)
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Discovery Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.easterEggsFound}</div>
                      <div className="text-muted-foreground">Easter Eggs Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.uniqueCommands}</div>
                      <div className="text-muted-foreground">Commands Discovered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.totalCelebrations}</div>
                      <div className="text-muted-foreground">Celebrations Triggered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.secretCommandsFound}</div>
                      <div className="text-muted-foreground">Secret Commands</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Separator />
              
              {/* Achievements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const rarityStyle = RARITY_STYLES[achievement.rarity];
                  
                  return (
                    <Card 
                      key={achievement.id}
                      className={`transition-all duration-200 ${
                        achievement.unlocked 
                          ? `${rarityStyle.glow} shadow-lg border-2` 
                          : 'opacity-60 grayscale'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                              {achievement.unlocked ? achievement.icon : '🔒'}
                            </span>
                            <div>
                              <CardTitle className="text-lg">
                                {achievement.unlocked ? achievement.name : '???'}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  className={`${rarityStyle.color} ${rarityStyle.textColor} text-xs`}
                                >
                                  {achievement.rarity.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  +{achievement.pointsAwarded} pts
                                </span>
                              </div>
                            </div>
                          </div>
                          {achievement.unlocked && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ Unlocked
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {achievement.unlocked ? achievement.description : achievement.hint}
                        </CardDescription>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Hints Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Discovery Hints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>💡 Try typing commands starting with "/" in the chat</p>
                    <p>🎭 Special themes appear on certain dates throughout the year</p>
                    <p>💬 Hover over UI elements to discover witty tooltips</p>
                    <p>🤫 Some commands are harder to find than others...</p>
                    <p>🎉 Celebrate often to unlock party-related achievements</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for updating easter egg stats from other components
export const useEasterEggStats = () => {
  const updateStats = (newStats) => {
    if (typeof window !== 'undefined' && window.updateEasterEggStats) {
      window.updateEasterEggStats(newStats);
    }
  };

  return { updateStats };
};

export default EasterEggAchievements;