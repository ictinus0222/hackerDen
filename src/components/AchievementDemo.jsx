/**
 * @fileoverview Achievement Demo Component
 * Demonstrates the achievement system functionality for testing and development
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BadgeCollection } from './BadgeCollection';
import { useAchievements } from '../hooks/useAchievements';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { Trophy, Target, MessageCircle, FileText, Zap, ThumbsUp } from 'lucide-react';

/**
 * Achievement Demo Component for testing the achievement system
 */
export const AchievementDemo = () => {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { 
    userProgress, 
    awardPoints, 
    triggerCelebration, 
    loading, 
    error 
  } = useAchievements(currentTeam?.$id);
  
  const [awarding, setAwarding] = useState(false);

  /**
   * Award points for different actions
   */
  const handleAwardPoints = async (action, points = null) => {
    if (!currentTeam?.$id) {
      alert('Please join a team first to test achievements');
      return;
    }

    try {
      setAwarding(true);
      await awardPoints(action, points);
    } catch (err) {
      console.error('Error awarding points:', err);
      alert('Failed to award points: ' + err.message);
    } finally {
      setAwarding(false);
    }
  };

  /**
   * Trigger celebration effects
   */
  const handleCelebration = async (type) => {
    try {
      await triggerCelebration(type, { achievementType: type });
    } catch (err) {
      console.error('Error triggering celebration:', err);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Please log in to view achievements
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!currentTeam) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Please join a team to test achievements
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievement System Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {userProgress?.totalPoints || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {userProgress?.pointsBreakdown?.tasksCompleted || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {userProgress?.pointsBreakdown?.messagesPosted || 0}
              </div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {userProgress?.achievements?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
          </div>

          {/* Award Points Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium">Award Points (for testing):</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAwardPoints('task_completion')}
                disabled={awarding}
                className="flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Complete Task (+10)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAwardPoints('message_sent')}
                disabled={awarding}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Send Message (+1)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAwardPoints('file_upload')}
                disabled={awarding}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Upload File (+5)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAwardPoints('idea_submission')}
                disabled={awarding}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Submit Idea (+3)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAwardPoints('vote_given')}
                disabled={awarding}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Give Vote (+1)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAwardPoints('custom', 50)}
                disabled={awarding}
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Bonus Points (+50)
              </Button>
            </div>
          </div>

          {/* Celebration Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium">Test Celebrations:</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCelebration('task_completion')}
              >
                Task Celebration
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCelebration('achievement')}
              >
                Achievement Celebration
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCelebration('milestone')}
              >
                Milestone Celebration
              </Button>
            </div>
          </div>

          {/* Status */}
          {loading && (
            <div className="text-center">
              <Badge variant="secondary">Loading achievements...</Badge>
            </div>
          )}
          
          {error && (
            <div className="text-center">
              <Badge variant="destructive">Error: {error}</Badge>
            </div>
          )}
          
          {awarding && (
            <div className="text-center">
              <Badge variant="default">Awarding points...</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge Collection */}
      <BadgeCollection />
    </div>
  );
};

export default AchievementDemo;