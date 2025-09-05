/**
 * @fileoverview Gamification Display Component
 * Shows user points, achievements, and leaderboard in a compact format
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Trophy, Star, Target, MessageSquare, Upload, Lightbulb, ThumbsUp } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';

export const GamificationDisplay = ({ compact = false }) => {
  const {
    totalPoints,
    pointsBreakdown,
    achievements,
    userRank,
    leaderboard,
    loading,
    error
  } = useGamification();

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardContent className="p-4">
          <p className="text-sm text-red-500">Failed to load gamification data</p>
        </CardContent>
      </Card>
    );
  }

  const pointIcons = {
    tasksCompleted: Target,
    messagesPosted: MessageSquare,
    filesUploaded: Upload,
    ideasSubmitted: Lightbulb,
    votesGiven: ThumbsUp
  };

  const pointLabels = {
    tasksCompleted: 'Tasks',
    messagesPosted: 'Messages',
    filesUploaded: 'Files',
    ideasSubmitted: 'Ideas',
    votesGiven: 'Votes'
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {/* Points Display */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{totalPoints}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Points</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Rank Display */}
        {userRank && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">#{userRank}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Team Rank</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="text-xs">
                  {achievements.length} achievements
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-semibold mb-1">Recent Achievements:</p>
                  {achievements.slice(0, 3).map((achievement) => (
                    <p key={achievement.$id} className="text-xs">
                      🏆 {achievement.achievementName}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Progress & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Points */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{totalPoints}</div>
          <div className="text-sm text-muted-foreground">Total Points</div>
          {userRank && (
            <Badge variant="outline" className="mt-1">
              <Trophy className="h-3 w-3 mr-1" />
              Rank #{userRank}
            </Badge>
          )}
        </div>

        {/* Points Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Points Breakdown</h4>
          {Object.entries(pointsBreakdown).map(([key, value]) => {
            const Icon = pointIcons[key];
            const label = pointLabels[key];
            
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </div>
                <span className="font-medium">{value}</span>
              </div>
            );
          })}
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Recent Achievements</h4>
            <div className="space-y-1">
              {achievements.slice(0, 3).map((achievement) => (
                <TooltipProvider key={achievement.$id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer">
                        <div className="text-lg">🏆</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {achievement.achievementName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            +{achievement.pointsAwarded} points
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{achievement.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            {achievements.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{achievements.length - 3} more achievements
              </div>
            )}
          </div>
        )}

        {/* Progress to Next Milestone */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Next Milestone</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>100 Points Club</span>
              <span>{Math.min(totalPoints, 100)}/100</span>
            </div>
            <Progress value={(totalPoints / 100) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};