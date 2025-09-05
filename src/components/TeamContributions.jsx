import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Lightbulb,
  Trophy,
  Star
} from 'lucide-react';

const TeamContributions = ({ teamData, submissionId }) => {
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateContributions = async () => {
      if (!teamData?.members) {
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, this would fetch actual contribution data
        // For now, we'll generate mock data based on team members
        const mockContributions = teamData.members.map((member, index) => {
          // Generate realistic contribution metrics
          const tasksCompleted = Math.floor(Math.random() * 8) + 2;
          const messagesPosted = Math.floor(Math.random() * 50) + 10;
          const filesShared = Math.floor(Math.random() * 5) + 1;
          const ideasContributed = Math.floor(Math.random() * 3) + 1;
          
          // Calculate total contribution score
          const totalScore = (tasksCompleted * 10) + messagesPosted + (filesShared * 5) + (ideasContributed * 3);
          
          return {
            ...member,
            metrics: {
              tasksCompleted,
              messagesPosted,
              filesShared,
              ideasContributed,
              totalScore
            },
            role: member.role || (index === 0 ? 'owner' : 'member'),
            joinedAt: member.joinedAt || new Date().toISOString()
          };
        });

        // Sort by contribution score
        mockContributions.sort((a, b) => b.metrics.totalScore - a.metrics.totalScore);
        
        setContributions(mockContributions);
      } catch (error) {
        console.error('Error calculating contributions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateContributions();
  }, [teamData, submissionId]);

  const getInitials = (name) => {
    if (!name) return 'TM';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'leader':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Trophy className="h-3 w-3" />;
      case 'leader':
        return <Star className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading team data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contributions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No team member data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxScore = Math.max(...contributions.map(c => c.metrics.totalScore));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Team Contributions
        </CardTitle>
        <CardDescription>
          Individual member contributions and activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributions.map((member, index) => (
          <div key={member.userId || member.id || index} className="space-y-3">
            {/* Member Header */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar} alt={member.userName || member.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.userName || member.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium truncate">
                    {member.userName || member.name || 'Team Member'}
                  </h4>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getRoleColor(member.role)}`}
                  >
                    {getRoleIcon(member.role)}
                    <span className="ml-1">{formatRole(member.role)}</span>
                  </Badge>
                </div>
                
                {/* Contribution Score */}
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-xs text-muted-foreground">
                    {member.metrics.totalScore} points
                  </div>
                  <Progress 
                    value={(member.metrics.totalScore / maxScore) * 100} 
                    className="h-1 flex-1" 
                  />
                </div>
              </div>
            </div>

            {/* Contribution Metrics */}
            <div className="grid grid-cols-2 gap-3 ml-13">
              <div className="flex items-center space-x-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">Tasks:</span>
                <span className="font-medium">{member.metrics.tasksCompleted}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <MessageSquare className="h-3 w-3 text-blue-500" />
                <span className="text-muted-foreground">Messages:</span>
                <span className="font-medium">{member.metrics.messagesPosted}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <FileText className="h-3 w-3 text-purple-500" />
                <span className="text-muted-foreground">Files:</span>
                <span className="font-medium">{member.metrics.filesShared}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <Lightbulb className="h-3 w-3 text-yellow-500" />
                <span className="text-muted-foreground">Ideas:</span>
                <span className="font-medium">{member.metrics.ideasContributed}</span>
              </div>
            </div>

            {index < contributions.length - 1 && <Separator />}
          </div>
        ))}

        {/* Team Summary */}
        <Separator />
        <div className="pt-2">
          <div className="text-xs text-muted-foreground text-center">
            {contributions.length} team member{contributions.length !== 1 ? 's' : ''} • 
            Total {contributions.reduce((sum, member) => sum + member.metrics.totalScore, 0)} points
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamContributions;