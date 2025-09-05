/**
 * @fileoverview Badge Collection Component
 * Displays user achievements in a grid layout with tooltips and descriptions
 */

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';
import { Trophy, Star, Zap, Target, Users, FileText, MessageCircle, ThumbsUp, Lock } from 'lucide-react';
import { gamificationService } from '../services/gamificationService';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

// Achievement type to icon and color mapping
const ACHIEVEMENT_CONFIG = {
  first_task: {
    icon: Target,
    color: 'bg-green-500',
    gradient: 'from-green-400 to-green-600'
  },
  task_master: {
    icon: Trophy,
    color: 'bg-yellow-500',
    gradient: 'from-yellow-400 to-orange-500'
  },
  communicator: {
    icon: MessageCircle,
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600'
  },
  file_sharer: {
    icon: FileText,
    color: 'bg-purple-500',
    gradient: 'from-purple-400 to-purple-600'
  },
  idea_generator: {
    icon: Zap,
    color: 'bg-pink-500',
    gradient: 'from-pink-400 to-pink-600'
  },
  team_player: {
    icon: ThumbsUp,
    color: 'bg-indigo-500',
    gradient: 'from-indigo-400 to-indigo-600'
  },
  hundred_club: {
    icon: Star,
    color: 'bg-amber-500',
    gradient: 'from-amber-400 to-amber-600'
  },
  five_hundred_club: {
    icon: Trophy,
    color: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500',
    gradient: 'from-yellow-400 via-orange-500 to-red-500'
  }
};

/**
 * Individual Achievement Badge Component
 */
const AchievementBadge = ({ achievement, isUnlocked = false, progress = null }) => {
  const config = ACHIEVEMENT_CONFIG[achievement.achievementType] || ACHIEVEMENT_CONFIG.first_task;
  const IconComponent = config.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`
            relative p-4 rounded-lg border transition-all duration-300 cursor-pointer
            ${isUnlocked 
              ? 'bg-card border-border hover:border-primary/50 hover:shadow-md' 
              : 'bg-muted/30 border-muted opacity-60'
            }
          `}>
            {/* Achievement Icon */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto
              ${isUnlocked 
                ? `bg-gradient-to-br ${config.gradient} shadow-lg` 
                : 'bg-muted border-2 border-dashed border-muted-foreground/30'
              }
            `}>
              {isUnlocked ? (
                <IconComponent className="w-6 h-6 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            
            {/* Achievement Name */}
            <h4 className={`
              text-sm font-medium text-center mb-1
              ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}
            `}>
              {achievement.achievementName || achievement.name}
            </h4>
            
            {/* Points Badge */}
            <div className="flex justify-center">
              <Badge 
                variant={isUnlocked ? "default" : "secondary"}
                className="text-xs"
              >
                {achievement.pointsAwarded} pts
              </Badge>
            </div>
            
            {/* Progress Bar for Locked Achievements */}
            {!isUnlocked && progress && (
              <div className="mt-2">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {progress.current}/{progress.required}
                </p>
              </div>
            )}
            
            {/* Unlock Date for Unlocked Achievements */}
            {isUnlocked && achievement.unlockedAt && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{achievement.achievementName || achievement.name}</p>
            <p className="text-sm text-muted-foreground">
              {achievement.description}
            </p>
            {!isUnlocked && progress && (
              <p className="text-xs text-primary">
                Progress: {progress.current}/{progress.required} ({progress.percentage.toFixed(0)}%)
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Badge Collection Component
 */
export const BadgeCollection = ({ userId, teamId, className = "" }) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use current user if no userId provided
  const targetUserId = userId || user?.$id;
  
  useEffect(() => {
    if (!targetUserId) return;
    
    const loadAchievements = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user progress and achievements
        const progress = await gamificationService.getUserProgress(targetUserId, teamId);
        setUserProgress(progress);
        
        // Get all achievement definitions
        const definitions = gamificationService.getAchievementDefinitions();
        
        // Create achievement list with unlock status and progress
        const achievementList = Object.values(definitions).map(definition => {
          const unlockedAchievement = progress.achievements.find(
            a => a.achievementType === definition.type
          );
          
          let progressData = null;
          if (!unlockedAchievement) {
            // Calculate progress for locked achievements
            progressData = calculateAchievementProgress(definition, progress.pointsBreakdown, progress.totalPoints);
          }
          
          return {
            ...definition,
            ...unlockedAchievement,
            isUnlocked: !!unlockedAchievement,
            progress: progressData
          };
        });
        
        // Sort by unlock status (unlocked first) then by points
        achievementList.sort((a, b) => {
          if (a.isUnlocked && !b.isUnlocked) return -1;
          if (!a.isUnlocked && b.isUnlocked) return 1;
          return b.pointsAwarded - a.pointsAwarded;
        });
        
        setAchievements(achievementList);
      } catch (err) {
        console.error('Error loading achievements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadAchievements();
    
    // Subscribe to real-time achievement updates
    const unsubscribe = gamificationService.subscribeToAchievements(
      targetUserId,
      () => {
        loadAchievements();
      }
    );
    
    return unsubscribe;
  }, [targetUserId, teamId]);
  
  /**
   * Calculate progress towards an achievement
   */
  const calculateAchievementProgress = (definition, breakdown, totalPoints) => {
    // This is a simplified progress calculation
    // In a real implementation, you might want more sophisticated progress tracking
    
    let current = 0;
    let required = 0;
    
    switch (definition.type) {
      case 'first_task':
        current = breakdown.tasksCompleted;
        required = 1;
        break;
      case 'task_master':
        current = breakdown.tasksCompleted;
        required = 10;
        break;
      case 'communicator':
        current = breakdown.messagesPosted;
        required = 50;
        break;
      case 'file_sharer':
        current = breakdown.filesUploaded;
        required = 5;
        break;
      case 'idea_generator':
        current = breakdown.ideasSubmitted;
        required = 5;
        break;
      case 'team_player':
        current = breakdown.votesGiven;
        required = 20;
        break;
      case 'hundred_club':
        current = totalPoints;
        required = 100;
        break;
      case 'five_hundred_club':
        current = totalPoints;
        required = 500;
        break;
      default:
        return null;
    }
    
    return {
      current: Math.min(current, required),
      required,
      percentage: (current / required) * 100
    };
  };
  
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border bg-muted/30 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load achievements</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = userProgress?.totalPoints || 0;
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{unlockedCount}/{achievements.length} unlocked</span>
            <Badge variant="outline">{totalPoints} points</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.type}
                achievement={achievement}
                isUnlocked={achievement.isUnlocked}
                progress={achievement.progress}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BadgeCollection;