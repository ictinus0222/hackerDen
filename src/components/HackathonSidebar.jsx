import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import ProgressBar from './ProgressBar.jsx';
import { ThemeToggle } from './ui/theme-toggle.jsx';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { useAuth } from '../hooks/useAuth';

const HackathonSidebar = ({ isOpen, onToggle, hackathon, team, tasksByStatus, hackathonId }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/hackathon/${hackathonId}/dashboard`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Tasks',
      href: `/hackathon/${hackathonId}/tasks`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: 'Team Vault',
      href: `/hackathon/${hackathonId}/vault`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      )
    },
    {
      name: 'Whiteboard',
      href: `/hackathon/${hackathonId}/whiteboard`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      name: 'Chat',
      href: `/hackathon/${hackathonId}/chat`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  const currentPath = location.pathname;

  // Calculate task progress (excluding blocked tasks)
  const totalTasks = (tasksByStatus?.todo?.length || 0) + 
                    (tasksByStatus?.in_progress?.length || 0) + 
                    (tasksByStatus?.done?.length || 0);
  const completedTasks = tasksByStatus?.done?.length || 0;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Floating Hackathon Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-80 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full p-3">
          <Card className="h-full w-full bg-card/95 backdrop-blur-sm border-border/30 shadow-2xl overflow-hidden">
            <CardHeader className="p-4 pb-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
                    <Logo size="sm" showText={false} />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-lg font-bold text-foreground leading-none">HackerDen</h1>
                    <p className="text-xs text-muted-foreground leading-none">Hackathon</p>
                    {hackathon && (
                      <Badge variant="secondary" className="text-xs">
                        {hackathon.hackathonName}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Close button for mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-full">
              <Separator className="mx-4 mb-3" />

              {/* Navigation */}
              <nav className="flex-1 px-4 py-2 space-y-1 overflow-hidden">
                {navigationItems.map((item) => {
                  const isActive = currentPath === item.href || currentPath.startsWith(item.href);
                   
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                      onClick={onToggle} // Close sidebar on mobile when navigating
                    >
                      <div className={`transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      }`}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Progress Bar Section */}
              {totalTasks > 0 && (
                <>
                  <Separator className="mx-4 my-3" />
                  <div className="px-4 py-3 flex-shrink-0">
                    <div className="space-y-3 p-3 rounded-xl bg-muted/20 border border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Progress</span>
                        <Badge variant="outline" className="text-xs">
                          {completedTasks}/{totalTasks}
                        </Badge>
                      </div>
                      <ProgressBar
                        completedTasks={completedTasks}
                        totalTasks={totalTasks}
                        size="md"
                        showLabel={false}
                        showPercentage={false}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* User Profile Section */}
              <div className="p-4 flex-shrink-0">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground truncate leading-none">
                      {user?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none">
                      {team && team.ownerId === user?.$id ? 'Team Leader' : 'Team Member'}
                    </p>
                  </div>
                  <ThemeToggle 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors duration-200"
                  />
                </div>
                
                {/* Return to Console Button */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 border-border/30 hover:border-border/50 rounded-xl transition-colors duration-200 mb-3"
                >
                  <Link to="/console">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Return to Console</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium text-destructive hover:text-destructive/80 hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50 rounded-xl transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default HackathonSidebar;
