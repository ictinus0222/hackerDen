import { Link, useLocation, useParams } from 'react-router-dom';
import Logo from './Logo.jsx';
import ProgressBar from './ProgressBar.jsx';
import { ThemeToggle } from './ui/theme-toggle.jsx';
import { Button } from './ui/button';
import BreadcrumbNavigation from './BreadcrumbNavigation.jsx';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import { useHackathonTasks } from '../hooks/useHackathonTasks';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from './ui/sidebar';
import { Avatar, AvatarFallback } from './ui/avatar';

const HackathonLayout = ({ children, hackathon }) => {
  const { user, logout } = useAuth();
  const { hackathonId } = useParams();
  const { team } = useHackathonTeam(hackathonId);
  const { tasksByStatus } = useHackathonTasks();
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
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Tasks',
      href: `/hackathon/${hackathonId}/tasks`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: 'Team Vault',
      href: `/hackathon/${hackathonId}/vault`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      )
    },
    {
      name: 'Whiteboard',
      href: `/hackathon/${hackathonId}/whiteboard`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      name: 'Chat',
      href: `/hackathon/${hackathonId}/chat`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  const currentPath = location.pathname;

  // Calculate task progress
  const totalTasks = (tasksByStatus?.todo?.length || 0) + 
                    (tasksByStatus?.in_progress?.length || 0) + 
                    (tasksByStatus?.done?.length || 0);
  const completedTasks = tasksByStatus?.done?.length || 0;

  return (
    <SidebarProvider>
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* Modern Sidebar */}
      <Sidebar 
        collapsible="offcanvas" 
        className="border-gray-700"
        style={{ background: '#1A2423' }}
      >
        <SidebarHeader className="border-b border-sidebar-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/console" className="hover:opacity-80 transition-opacity">
                <Logo size="sm" showText={false} />
              </Link>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-sidebar-foreground leading-none">HackerDen</h1>
                {hackathon && (
                  <p className="text-xs text-sidebar-foreground/70 leading-none">{hackathon.hackathonName}</p>
                )}
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive = currentPath === item.href || currentPath.startsWith(item.href);
                  
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className="w-full justify-start px-4 py-3 text-sm font-medium"
                      >
                        <Link
                          to={item.href}
                          className="flex items-center space-x-3"
                        >
                          <div className="text-sidebar-foreground">
                            {item.icon}
                          </div>
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Progress Bar Section */}
          {totalTasks > 0 && (
            <>
              <SidebarSeparator className="my-4" />
              <SidebarGroup>
                <SidebarGroupContent className="px-4">
                  <ProgressBar
                    completedTasks={completedTasks}
                    totalTasks={totalTasks}
                    size="md"
                    showLabel={true}
                    showPercentage={true}
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate leading-none">
                    {user?.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 leading-none">
                    {team && team.ownerId === user?.$id ? 'Team Leader' : 'Team Member'}
                  </p>
                </div>
                <ThemeToggle 
                  variant="ghost" 
                  size="icon"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                />
              </div>
              
              <Button
                asChild
                variant="outline"
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 border-border/30 hover:border-border/50 mb-3"
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
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-destructive hover:text-destructive/80 hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Area using SidebarInset */}
      <SidebarInset>
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-border px-4 py-3 h-14 flex items-center justify-between bg-background">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-lg font-bold text-foreground">HackerDen</span>
            </div>
            
            <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        {/* Breadcrumb Navigation */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 lg:px-6 py-3">
          <BreadcrumbNavigation hackathon={hackathon} />
        </div>

        {/* Main Content */}
        <main 
          id="main-content"
          className="flex-1 overflow-hidden"
          role="main"
          tabIndex="-1"
        >
          <div className="h-full">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HackathonLayout;