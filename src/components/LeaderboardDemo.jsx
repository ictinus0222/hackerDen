/**
 * @fileoverview Leaderboard Demo Component
 * Demonstrates the leaderboard and celebration effects functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Leaderboard } from './Leaderboard';
import ProgressBar, { PointsProgressBar, AchievementProgressBar, TeamProgressBar } from './ProgressBar';
import { ConfettiEffect, TaskCompletionCelebration, AchievementCelebration, MilestoneCelebration } from './CelebrationEffects';
import { useCelebrationTriggers } from './CelebrationTrigger';
import { Trophy, Star, Target, Zap, Gift, Sparkles } from 'lucide-react';

export const LeaderboardDemo = () => {
  const {
    celebrationState,
    triggerTaskCompletion,
    triggerAchievement,
    triggerMilestone,
    clearAllCelebrations
  } = useCelebrationTriggers();

  const [demoData, setDemoData] = useState({
    userPoints: 150,
    maxPoints: 500,
    tasksCompleted: 8,
    totalTasks: 12,
    teamPoints: 1250,
    targetPoints: 2000
  });

  // Mock leaderboard data for demo
  const mockLeaderboard = [
    { userId: 'user1', totalPoints: 250, rank: 1, pointsBreakdown: { tasksCompleted: 15, messagesPosted: 45, filesUploaded: 8, ideasSubmitted: 5, votesGiven: 12 } },
    { userId: 'user2', totalPoints: 180, rank: 2, pointsBreakdown: { tasksCompleted: 12, messagesPosted: 32, filesUploaded: 6, ideasSubmitted: 3, votesGiven: 8 } },
    { userId: 'user3', totalPoints: 150, rank: 3, pointsBreakdown: { tasksCompleted: 8, messagesPosted: 28, filesUploaded: 4, ideasSubmitted: 7, votesGiven: 15 } },
    { userId: 'user4', totalPoints: 120, rank: 4, pointsBreakdown: { tasksCompleted: 6, messagesPosted: 25, filesUploaded: 3, ideasSubmitted: 2, votesGiven: 6 } },
    { userId: 'user5', totalPoints: 95, rank: 5, pointsBreakdown: { tasksCompleted: 4, messagesPosted: 18, filesUploaded: 2, ideasSubmitted: 1, votesGiven: 4 } }
  ];

  const incrementPoints = (amount) => {
    setDemoData(prev => ({
      ...prev,
      userPoints: prev.userPoints + amount
    }));
  };

  const completeTask = () => {
    setDemoData(prev => ({
      ...prev,
      tasksCompleted: Math.min(prev.tasksCompleted + 1, prev.totalTasks),
      userPoints: prev.userPoints + 10
    }));
    triggerTaskCompletion();
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard & Celebration Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={completeTask} className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Complete Task
            </Button>
            <Button onClick={triggerAchievement} variant="secondary" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Unlock Achievement
            </Button>
            <Button onClick={triggerMilestone} variant="outline" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Reach Milestone
            </Button>
            <Button onClick={clearAllCelebrations} variant="destructive" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Clear Effects
            </Button>
          </div>

          <Separator />

          {/* Progress Bars Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Progress Bars</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Task Progress</h4>
                  <ProgressBar
                    completedTasks={demoData.tasksCompleted}
                    totalTasks={demoData.totalTasks}
                    showBadge={true}
                    size="md"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Points Progress</h4>
                  <PointsProgressBar
                    points={demoData.userPoints}
                    maxPoints={demoData.maxPoints}
                    showBadge={true}
                    size="md"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Achievement Progress</h4>
                  <AchievementProgressBar
                    current={8}
                    target={10}
                    label="Task Master Achievement"
                    size="md"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Team Progress</h4>
                  <TeamProgressBar
                    teamPoints={demoData.teamPoints}
                    targetPoints={demoData.targetPoints}
                    size="lg"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Current Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{demoData.userPoints}</div>
                <div className="text-sm text-muted-foreground">Your Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{demoData.tasksCompleted}</div>
                <div className="text-sm text-muted-foreground">Tasks Done</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Your Rank</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{demoData.teamPoints}</div>
                <div className="text-sm text-muted-foreground">Team Points</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Celebration Status */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Active Celebrations</h3>
            <div className="flex flex-wrap gap-2">
              {celebrationState.taskCompletion && (
                <Badge variant="default" className="animate-bounce">
                  <Gift className="h-3 w-3 mr-1" />
                  Task Celebration
                </Badge>
              )}
              {celebrationState.achievement && (
                <Badge variant="secondary" className="animate-pulse">
                  <Star className="h-3 w-3 mr-1" />
                  Achievement Celebration
                </Badge>
              )}
              {celebrationState.milestone && (
                <Badge variant="outline" className="animate-bounce">
                  <Zap className="h-3 w-3 mr-1" />
                  Milestone Celebration
                </Badge>
              )}
              {!celebrationState.taskCompletion && !celebrationState.achievement && !celebrationState.milestone && (
                <Badge variant="outline" className="text-muted-foreground">
                  No active celebrations
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compact Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLeaderboard.slice(0, 3).map((entry) => (
                <div key={entry.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {entry.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    {entry.rank === 2 && <div className="h-5 w-5 rounded-full bg-gray-400"></div>}
                    {entry.rank === 3 && <div className="h-5 w-5 rounded-full bg-amber-600"></div>}
                    {entry.rank > 3 && <span className="text-sm font-bold">#{entry.rank}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">User {entry.userId.slice(-1)}</div>
                    <div className="text-sm text-muted-foreground">{entry.totalPoints} points</div>
                  </div>
                  <Badge variant="secondary">{entry.totalPoints}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockLeaderboard.slice(0, 3).map((entry) => (
                <div key={entry.userId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User {entry.userId.slice(-1)}</span>
                    <span>{entry.totalPoints} pts</span>
                  </div>
                  <ProgressBar
                    points={entry.totalPoints}
                    maxPoints={mockLeaderboard[0].totalPoints}
                    showPoints={true}
                    showLabel={false}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Celebration Effects */}
      <TaskCompletionCelebration 
        isTriggered={celebrationState.taskCompletion}
        onComplete={() => console.log('Task celebration complete')}
      />
      
      <AchievementCelebration 
        isTriggered={celebrationState.achievement}
        onComplete={() => console.log('Achievement celebration complete')}
      />
      
      <MilestoneCelebration 
        isTriggered={celebrationState.milestone}
        onComplete={() => console.log('Milestone celebration complete')}
      />
    </div>
  );
};

export default LeaderboardDemo;