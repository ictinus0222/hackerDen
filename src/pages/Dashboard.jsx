import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTeam } from '../hooks/useTeam.jsx';
import { useTasks } from '../hooks/useTasks.jsx';
import { useTeamMembers } from '../hooks/useTeamMembers.jsx';
import Layout from '../components/Layout.jsx';
import TeamSelector from '../components/TeamSelector.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import RealtimeDebugPanel from '../components/RealtimeDebugPanel.jsx';


const Dashboard = () => {
  const { user } = useAuth();
  const { team, loading: teamLoading, hasTeam } = useTeam();
  const { tasks, tasksByStatus, loading: tasksLoading } = useTasks();
  const { members: teamMembers, loading: membersLoading } = useTeamMembers();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Get user's tasks
  const myTasks = (tasks || []).filter(task => task.assigned_to === user?.name || task.assignedTo === user?.$id);
  const myTopTasks = myTasks.slice(0, 5);

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

  // Team members are now fetched via useTeamMembers hook

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Layout>
      <ConnectionStatus />
      <ErrorBoundary>
        {teamLoading ? (
          <LoadingSpinner message="Loading your team..." />
        ) : hasTeam ? (
          // User has a team - show dashboard as per UX requirements
          <div className="h-full flex flex-col space-y-6">
            {/* Page Title */}
            <div className="text-center flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-dark-primary mb-1">
                {team.name}'s HQ
              </h1>
              <p className="text-sm text-dark-tertiary">
                Your team's central command center
              </p>
            </div>

            {/* Large Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto flex-shrink-0">
              {/* Manage Tasks Card */}
              <Link
                to="/tasks"
                className="card-enhanced rounded-2xl p-6 lg:p-8 hover:scale-105 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-dark-primary mb-2 group-hover:text-blue-400 transition-colors">
                    Manage Tasks
                  </h2>
                  <p className="text-dark-tertiary">
                    Organize your team's work with our Kanban board
                  </p>
                  <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-dark-secondary">
                    <span>{(tasks || []).length} total tasks</span>
                    <span>•</span>
                    <span>{tasksByStatus?.done?.length || 0} completed</span>
                  </div>
                </div>
              </Link>

              {/* Open Team Chat Card */}
              <Link
                to="/chat"
                className="card-enhanced rounded-2xl p-6 lg:p-8 hover:scale-105 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-dark-primary mb-2 group-hover:text-green-400 transition-colors">
                    Open Team Chat
                  </h2>
                  <p className="text-dark-tertiary">
                    Communicate with your team in real-time
                  </p>
                  <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-dark-secondary">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Connected</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Summary Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 flex-1 min-h-0">
              {/* My Tasks Widget */}
              <div className="card-enhanced rounded-xl p-4 lg:p-6 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark-primary">My Tasks</h3>
                  <Link to="/tasks" className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                    <span>View all</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="space-y-2 flex-1 overflow-hidden">
                  {myTopTasks.length > 0 ? (
                    myTopTasks.map((task, index) => {
                      const getStatusInfo = (status) => {
                        switch (status) {
                          case 'done':
                            return { color: 'bg-green-400', label: 'Completed', textColor: 'text-green-400' };
                          case 'in_progress':
                            return { color: 'bg-blue-400', label: 'In Progress', textColor: 'text-blue-400' };
                          case 'blocked':
                            return { color: 'bg-red-400', label: 'Blocked', textColor: 'text-red-400' };
                          default:
                            return { color: 'bg-gray-400', label: 'To Do', textColor: 'text-gray-400' };
                        }
                      };

                      const statusInfo = getStatusInfo(task.status);

                      return (
                        <Link 
                          key={task.$id || index} 
                          to="/tasks"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-elevated/30 transition-colors group cursor-pointer border border-transparent hover:border-dark-primary/20"
                        >
                          <div className={`w-3 h-3 rounded-full ${statusInfo.color} flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-primary truncate group-hover:text-blue-400 transition-colors">
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs ${statusInfo.textColor}`}>
                                {statusInfo.label}
                              </span>
                              {task.priority && (
                                <>
                                  <span className="text-xs text-dark-tertiary">•</span>
                                  <span className={`text-xs ${
                                    task.priority === 'high' ? 'text-red-400' :
                                    task.priority === 'medium' ? 'text-yellow-400' :
                                    'text-green-400'
                                  }`}>
                                    {task.priority} priority
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-dark-tertiary group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <svg className="w-10 h-10 text-dark-tertiary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm text-dark-tertiary mb-2">No tasks assigned</p>
                      <Link to="/tasks" className="text-xs text-blue-400 hover:text-blue-300">
                        Create your first task →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Activity Widget */}
              <div className="card-enhanced rounded-xl p-4 lg:p-6 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark-primary">Team Activity</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-dark-tertiary">Live</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1 overflow-hidden">
                  {teamActivity.length > 0 ? (
                    teamActivity.map((activity) => {
                      // Get status color
                      const getStatusColor = (status) => {
                        switch (status) {
                          case 'done': return 'from-green-500 to-emerald-600';
                          case 'in_progress': return 'from-blue-500 to-blue-600';
                          case 'blocked': return 'from-red-500 to-red-600';
                          default: return 'from-gray-500 to-gray-600';
                        }
                      };

                      // Get action icon
                      const getActionIcon = (action) => {
                        if (action === 'completed') {
                          return (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          );
                        } else if (action === 'created') {
                          return (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          );
                        } else {
                          return (
                            <span className="text-xs font-bold text-white">
                              {activity.user.charAt(0).toUpperCase()}
                            </span>
                          );
                        }
                      };

                      return (
                        <div key={activity.id} className="flex items-start space-x-3 text-sm p-2 rounded-lg hover:bg-dark-elevated/20 transition-colors">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getStatusColor(activity.status)} flex items-center justify-center flex-shrink-0`}>
                            {getActionIcon(activity.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-dark-secondary">
                              <span className="font-medium text-dark-primary">{activity.user}</span>
                              {' '}{activity.action}{' '}
                              <span className="font-medium text-dark-primary">"{activity.task}"</span>
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-xs text-dark-tertiary">
                                {formatTimeAgo(activity.timestamp)}
                              </p>
                              {activity.priority && (
                                <>
                                  <span className="text-xs text-dark-tertiary">•</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    activity.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                    activity.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {activity.priority}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <svg className="w-8 h-8 text-dark-tertiary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-sm text-dark-tertiary">No recent activity</p>
                      <p className="text-xs text-dark-muted">Activity will appear here as your team works</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members Widget */}
              <div className="card-enhanced rounded-xl p-4 lg:p-6 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark-primary">Team Members</h3>
                  {membersLoading ? (
                    <div className="w-4 h-4 border-2 border-dark-tertiary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-sm text-dark-tertiary">
                      {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
                    </span>
                  )}
                </div>
                <div className="space-y-2 flex-1 overflow-hidden">
                  {membersLoading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-dark-tertiary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-dark-tertiary">Loading team members...</p>
                    </div>
                  ) : teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-elevated/20 transition-colors">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                            member.isCurrentUser 
                              ? 'from-blue-500 to-blue-600' 
                              : 'from-green-500 to-emerald-600'
                          } flex items-center justify-center`}>
                            <span className="text-sm font-bold text-white">
                              {member.avatar}
                            </span>
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-elevated ${
                            member.online ? 'bg-green-400' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark-primary truncate">
                            {member.name} {member.isCurrentUser ? '(You)' : ''}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-dark-tertiary">
                              {member.online ? 'Online' : 'Offline'}
                            </p>
                            {member.role === 'owner' && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                Team Leader
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <svg className="w-10 h-10 text-dark-tertiary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm text-dark-tertiary mb-2">No team members found</p>
                      <p className="text-xs text-dark-muted">
                        Invite team members using your join code
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Development Debug Panel Button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-center flex-shrink-0">
                <button
                  onClick={() => setShowDebugPanel(true)}
                  className="btn-secondary text-xs px-3 py-2"
                  title="Open Real-time Debug Panel"
                >
                  🔧 Debug
                </button>
              </div>
            )}
          </div>
        ) : (
          // User doesn't have a team - show team selection options
          <TeamSelector />
        )}
      </ErrorBoundary>
      
      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <RealtimeDebugPanel 
          isOpen={showDebugPanel} 
          onClose={() => setShowDebugPanel(false)} 
        />
      )}
      
    </Layout>
  );
};

export default Dashboard;