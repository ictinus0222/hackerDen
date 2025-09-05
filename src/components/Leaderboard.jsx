/**
 * @fileoverview Leaderboard Component
 * Displays team rankings with user avatars and progress tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, Medal, Award, Star, TrendingUp, Users } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../hooks/useAuth';
import { userNameService } from '../services/userNameService';

export const Leaderboard = ({ 
  teamId, 
  showIndividual = true, 
  showTeam = false, 
  compact = false,
  limit = 10 
}) => {
  const { user } = useAuth();
  const { leaderboard, loading, error, fetchLeaderboard } = useGamification();
  const [userNames, setUserNames] = useState({});
  const [view, setView] = useState('individual');

  // Fetch user names for leaderboard entries
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!leaderboard || leaderboard.length === 0) return;

      const names = {};
      for (const entry of leaderboard) {
        if (!entry?.userId) continue;
        
        try {
          const name = await userNameService.getUserName(entry.userId);
          names[entry.userId] = name;
        } catch (error) {
          console.warn(`Failed to fetch name for user ${entry.userId}:`, error);
          names[entry.userId] = 'Unknown User';
        }
      }
      setUserNames(names);
    };

    fetchUserNames();
  }, [leaderboard]);

  // Get rank icon based on position
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (userId) => {
    const name = userNames[userId] || 'Unknown User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Calculate progress percentage for visual representation
  const getProgressPercentage = (points, maxPoints) => {
    if (maxPoints === 0) return 0;
    return Math.min((points / maxPoints) * 100, 100);
  };

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-2xl"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-2xl"}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Failed to load leaderboard</p>
            <button 
              onClick={fetchLeaderboard}
              className="text-primary hover:underline text-sm mt-1"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxPoints = leaderboard.length > 0 ? leaderboard[0].totalPoints : 0;
  const displayedLeaderboard = leaderboard.slice(0, limit);

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayedLeaderboard.slice(0, 3).map((entry) => (
            <div 
              key={entry.userId} 
              className={`flex items-center gap-2 p-2 rounded-lg ${
                entry.userId === user?.$id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getRankIcon(entry.rank)}
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(entry.userId)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {userNames[entry.userId] || 'Loading...'}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {entry.totalPoints}
              </Badge>
            </div>
          ))}
          {leaderboard.length > 3 && (
            <div className="text-xs text-muted-foreground text-center pt-1">
              +{leaderboard.length - 3} more
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Team Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showIndividual && showTeam ? (
          <Tabs value={view} onValueChange={setView} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Team Progress
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual" className="mt-4">
              <IndividualLeaderboard 
                leaderboard={displayedLeaderboard}
                userNames={userNames}
                currentUserId={user?.$id}
                maxPoints={maxPoints}
                getRankIcon={getRankIcon}
                getUserInitials={getUserInitials}
                getProgressPercentage={getProgressPercentage}
              />
            </TabsContent>
            
            <TabsContent value="team" className="mt-4">
              <TeamProgressView 
                leaderboard={displayedLeaderboard}
                userNames={userNames}
                maxPoints={maxPoints}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <IndividualLeaderboard 
            leaderboard={displayedLeaderboard}
            userNames={userNames}
            currentUserId={user?.$id}
            maxPoints={maxPoints}
            getRankIcon={getRankIcon}
            getUserInitials={getUserInitials}
            getProgressPercentage={getProgressPercentage}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Individual leaderboard component
const IndividualLeaderboard = ({ 
  leaderboard, 
  userNames, 
  currentUserId, 
  maxPoints,
  getRankIcon,
  getUserInitials,
  getProgressPercentage
}) => {
  if (leaderboard.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No rankings available yet</p>
        <p className="text-sm">Complete tasks to appear on the leaderboard!</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Points</TableHead>
          <TableHead className="w-32">Progress</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.map((entry) => (
          <TableRow 
            key={entry.userId}
            className={entry.userId === currentUserId ? 'bg-primary/5 border-primary/20' : ''}
          >
            <TableCell className="font-medium">
              {getRankIcon(entry.rank)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getUserInitials(entry.userId)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {userNames[entry.userId] || 'Loading...'}
                  </span>
                  {entry.userId === currentUserId && (
                    <Badge variant="outline" className="text-xs w-fit">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex flex-col items-end">
                <span className="font-bold text-lg">{entry.totalPoints}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  <span>points</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <Progress 
                  value={getProgressPercentage(entry.totalPoints, maxPoints)} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  {Math.round(getProgressPercentage(entry.totalPoints, maxPoints))}%
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Team progress view component
const TeamProgressView = ({ leaderboard, userNames, maxPoints }) => {
  const totalTeamPoints = leaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0);
  const averagePoints = leaderboard.length > 0 ? Math.round(totalTeamPoints / leaderboard.length) : 0;
  
  return (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalTeamPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{averagePoints}</div>
            <div className="text-sm text-muted-foreground">Average Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{leaderboard.length}</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Team Progress</span>
              <span>{totalTeamPoints} points</span>
            </div>
            <Progress value={Math.min((totalTeamPoints / 1000) * 100, 100)} className="h-3" />
            <div className="text-xs text-muted-foreground">
              Next milestone: 1000 points
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Contributions */}
      <div className="space-y-3">
        <h4 className="font-semibold">Individual Contributions</h4>
        {leaderboard.map((entry) => (
          <div key={entry.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {userNames[entry.userId]?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{userNames[entry.userId] || 'Loading...'}</div>
              <Progress 
                value={(entry.totalPoints / totalTeamPoints) * 100} 
                className="h-2 mt-1"
              />
            </div>
            <div className="text-right">
              <div className="font-bold">{entry.totalPoints}</div>
              <div className="text-xs text-muted-foreground">
                {Math.round((entry.totalPoints / totalTeamPoints) * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;