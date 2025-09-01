import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import { useHackathonTasks } from '../hooks/useHackathonTasks';
import { useHackathonTeamMembers } from '../hooks/useHackathonTeamMembers';
import { useHackathonNotifications } from '../contexts/HackathonNotificationContext';
import LoadingSpinner from './LoadingSpinner';
import HackathonTeamSelector from './HackathonTeamSelector';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Copy, Clock, Users, Activity, FileText, CheckSquare, User } from 'lucide-react';

const HackathonDashboardContent = ({ hackathon }) => {
  const { user } = useAuth();
  const { team, loading: teamLoading, hasTeam } = useHackathonTeam(hackathon?.hackathonId);
  const { tasks, tasksByStatus, loading: tasksLoading } = useHackathonTasks();
  const { members: teamMembers, loading: membersLoading } = useHackathonTeamMembers();
  const { notifyTaskCreated, notifyTaskUpdated } = useHackathonNotifications();
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Get user's tasks
  const myTasks = (tasks || []).filter(task => task.assigned_to === user?.name || task.assignedTo === user?.$id);
  const myTopTasks = myTasks.slice(0, 5);

  // Calculate task progress
  const totalTasks = (tasksByStatus?.todo?.length || 0) + 
                    (tasksByStatus?.in_progress?.length || 0) + 
                    (tasksByStatus?.done?.length || 0);
  const completedTasks = tasksByStatus?.done?.length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Generate real-time team activity from tasks
  const generateTeamActivity = () => {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Sort tasks by update time (most recent first)
    const sortedTasks = [...tasks].sort((a, b) => {
      const timeA = new Date(a.$updatedAt || a.createdAt || Date.now());
      const timeB = new Date(b.$updatedAt || b.createdAt || Date.now());
      return timeB - timeA;
    });

    // Generate activity entries from recent tasks
    const activities = [];
    
    sortedTasks.slice(0, 4).forEach((task, index) => {
      const userName = task.assigned_to || task.createdBy || 'Team Member';
      const updateTime = new Date(task.$updatedAt || task.createdAt || Date.now() - index * 60 * 60 * 1000);
      
      let action = 'updated';
      if (task.status === 'done') {
        action = 'completed';
      } else if (task.status === 'in_progress') {
        action = 'started working on';
      } else if (task.status === 'blocked') {
        action = 'blocked';
      } else if (task.status === 'todo') {
        // Check if this is a recently created task (within last hour)
        const hourAgo = Date.now() - 60 * 60 * 1000;
        if (updateTime.getTime() > hourAgo) {
          action = 'created';
        } else {
          action = 'moved to todo';
        }
      }

      activities.push({
        id: task.$id || `activity-${index}`,
        user: userName,
        action: action,
        task: task.title,
        timestamp: updateTime,
        status: task.status,
        priority: task.priority
      });
    });

    return activities;
  };

  const teamActivity = generateTeamActivity();

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleTeamCreatedOrJoined = () => {
    setShowTeamSelector(false);
    window.location.reload();
  };

  if (teamLoading || tasksLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner message="Loading hackathon dashboard..." />
      </div>
    );
  }

  return (
    <div className="h-full p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Header Card */}
      <Card className="bg-card text-card-foreground rounded-xl border shadow-sm">
        <CardHeader className="p-6">
          {/* Action Buttons Row */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-2 rounded-xl"
            >
              <FileText className="w-4 h-4" />
              <span>View Rules</span>
            </Button>

            {/* Team Join Code */}
            {team && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">Team Join Code:</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                    {team.joinCode}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(team.joinCode)}
                    title="Copy join code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Title Section */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <h1 className="text-3xl font-bold text-foreground">
                {team ? `${team.name}'s HQ` : 'Team HQ'}
              </h1>
              <Badge 
                variant={
                  hackathon.status === 'ongoing' ? 'default' :
                  hackathon.status === 'upcoming' ? 'secondary' : 'outline'
                }
              >
                {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium text-foreground">
                {hackathon.hackathonName}
              </p>
              <p className="text-muted-foreground">{hackathon.dates}</p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {hackathon.description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {hasTeam ? (
        <>
          {/* Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Activity Widget */}
            <Card className="bg-card text-card-foreground rounded-xl border shadow-sm">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Team Activity</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {teamActivity.length > 0 ? (
                    teamActivity.map((activity) => {
                      const getStatusVariant = (status) => {
                        switch (status) {
                          case 'done': return 'default';
                          case 'in_progress': return 'secondary';
                          case 'blocked': return 'destructive';
                          default: return 'outline';
                        }
                      };

                      return (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                              {activity.user.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm text-foreground">
                              <span className="font-medium">{activity.user}</span>
                              {' '}{activity.action}{' '}
                              <span className="font-medium">"{activity.task}"</span>
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                              {activity.priority && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    activity.priority === 'high' ? 'border-red-200 text-red-600' :
                                    activity.priority === 'medium' ? 'border-yellow-200 text-yellow-600' :
                                    'border-green-200 text-green-600'
                                  }`}
                                >
                                  {activity.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                      <p className="text-xs text-muted-foreground">Activity will appear here as your team works</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Tasks Widget */}
            <Card className="bg-card text-card-foreground rounded-xl border shadow-sm">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">My Tasks</h3>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/hackathon/${hackathon.hackathonId}/tasks`}>
                      View all
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {myTopTasks.length > 0 ? (
                    myTopTasks.map((task, index) => {
                      const getStatusVariant = (status) => {
                        switch (status) {
                          case 'done': return 'default';
                          case 'in_progress': return 'secondary';
                          case 'blocked': return 'destructive';
                          default: return 'outline';
                        }
                      };

                      return (
                        <Link 
                          key={task.$id || index} 
                          to={`/hackathon/${hackathon.hackathonId}/tasks`}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group border border-transparent hover:border-border"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusVariant(task.status)} className="text-xs">
                                {task.status === 'done' ? 'Completed' :
                                 task.status === 'in_progress' ? 'In Progress' :
                                 task.status === 'blocked' ? 'Blocked' : 'To Do'}
                              </Badge>
                              {task.priority && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    task.priority === 'high' ? 'border-red-200 text-red-600' :
                                    task.priority === 'medium' ? 'border-yellow-200 text-yellow-600' :
                                    'border-green-200 text-green-600'
                                  }`}
                                >
                                  {task.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <CheckSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">No tasks assigned</p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/hackathon/${hackathon.hackathonId}/tasks`}>
                          Create your first task
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Members Widget */}
            <Card className="bg-card text-card-foreground rounded-xl border shadow-sm">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
                  </div>
                  <Badge variant="secondary">
                    {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {teamMembers.map((member, index) => {
                    const isCurrentUser = (member.userId === user?.$id) || (member.id === user?.$id) || (member.role === 'owner' && team?.ownerId === user?.$id);
                    return (
                      <div key={member.$id || member.userId || index} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                              {member.userName?.[0]?.toUpperCase() || 'M'}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online status indicator */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background bg-green-500"></div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {isCurrentUser ? (user?.name || user?.email || 'You') : (member.name || member.userName || 'Team Member')}
                            {isCurrentUser && ' (You)'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-muted-foreground">Online</span>
                            </div>
                            <Badge 
                              variant={member.role === 'owner' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {member.role === 'owner' ? 'Team Leader' : 'Member'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>


          </div>
        </>
      ) : (
        // No team state
        <Card className="bg-card text-card-foreground rounded-xl border shadow-sm">
          <CardContent className="p-16 text-center">
            <Users className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-3">Join a Team</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You need to be part of a team to participate in this hackathon. Create a new team or join an existing one.
            </p>
            <Button
              onClick={() => setShowTeamSelector(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Join or Create Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rules Modal */}
      <Dialog open={showRulesModal} onOpenChange={setShowRulesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Hackathon Rules</span>
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{hackathon.hackathonName}</p>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-auto">
            {hackathon.rules && hackathon.rules.length > 0 ? (
              hackathon.rules.map((rule, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-muted/30 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{rule}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No rules have been set for this hackathon yet.</p>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={() => setShowRulesModal(false)}
              className="w-full"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Selector Modal */}
      <Dialog open={showTeamSelector} onOpenChange={setShowTeamSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Join or Create Team</span>
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{hackathon.hackathonName}</p>
          </DialogHeader>
          <HackathonTeamSelector hackathonId={hackathon.hackathonId} onTeamCreatedOrJoined={handleTeamCreatedOrJoined} />
        </DialogContent>
      </Dialog>
      
      {/* Development Test Buttons */}
      {process.env.NODE_ENV === 'development' && hasTeam && (
        <div className="fixed bottom-20 right-4 space-y-2">
          <button
            onClick={() => notifyTaskCreated('Test Task', 'Test User')}
            className="btn-secondary text-xs px-3 py-2 block"
            title="Test Task Notification"
          >
            📝 Test Task
          </button>
          <button
            onClick={() => notifyTaskUpdated('Test Task', 'done')}
            className="btn-secondary text-xs px-3 py-2 block"
            title="Test Task Complete"
          >
            ✅ Test Complete
          </button>

        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default HackathonDashboardContent;