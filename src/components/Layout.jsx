import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import ProgressBar from './ProgressBar.jsx';
import { ThemeToggle } from './ui/theme-toggle.jsx';
import { Button } from './ui/button';
import BreadcrumbNavigation from './BreadcrumbNavigation.jsx';

import { useTeam } from '../hooks/useTeam';
import { useTasks } from '../hooks/useTasks';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

const Layout = ({ children }) => {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  // TODO: Authentication removed
  // // TODO: Authentication removed
  // const { user, ... } = useAuth();
  const { team } = useTeam();
  const { tasksByStatus } = useTasks();

  // Swipe gesture support for mobile navigation
  const { elementRef: swipeRef } = useSwipeGesture({
    onSwipeRight: () => {
      // Only open on swipe right from left edge on mobile
      if (window.innerWidth < 1024) {
        setMobileSheetOpen(true);
      }
    },
    threshold: 50,
    restraint: 100
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    {
      name: 'My Hackathons',
      href: '/console',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Team Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )

  ];

  const location = useLocation();
  const currentPath = location.pathname;

  // Calculate task progress (excluding blocked tasks)
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

      {/* Modern Sidebar - Hidden on mobile, uses Sheet instead */}
      <Sidebar 
        collapsible="icon" 
        className="border-sidebar-border hidden lg:flex"
        style={{ background: 'var(--sidebar)' }}
      >
        <SidebarHeader className="border-b border-sidebar-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="sm" showText={false} />
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-sidebar-foreground leading-none">HackerDen</h1>
                {team && (
                  <p className="text-xs text-sidebar-foreground/70 leading-none">{team.name}</p>
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
                  const isActive = currentPath === item.href || 
                    (item.href === '/console' && currentPath === '/') ||
                    (item.href === '/console' && currentPath.startsWith('/console')) ||
                    (item.href === '/dashboard' && currentPath === '/dashboard') ||
                    (item.href === '/tasks' && currentPath.startsWith('/project')) ||
                    (item.href === '/user-dashboard' && currentPath === '/user-dashboard');
                  
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
                  <p className="text-xs text-sidebar-foreground/70 leading-none">Team Member</p>
                </div>
                <ThemeToggle 
                  variant="ghost" 
                  size="icon"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                />
              </div>
              
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
        {/* Swipe Detection Area for Mobile Navigation */}
        <div 
          ref={swipeRef}
          className="lg:hidden fixed left-0 top-0 w-6 h-full z-30 pointer-events-auto"
          aria-hidden="true"
        />

        {/* Enhanced Mobile Header with Sheet Navigation */}
        <header className="lg:hidden border-b border-border px-4 py-3 h-16 flex items-center justify-between bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          {/* Mobile Navigation Sheet */}
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent touch-manipulation min-h-[44px] min-w-[44px]"
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="left" 
              className="w-80 p-0 bg-sidebar border-sidebar-border"
              style={{ background: 'var(--sidebar)' }}
            >
              <SheetHeader className="border-b border-sidebar-border p-6">
                <div className="flex items-center space-x-4">
                  <Logo size="sm" showText={false} />
                  <div className="space-y-1">
                    <SheetTitle className="text-lg font-bold text-sidebar-foreground leading-none">
                      HackerDen
                    </SheetTitle>
                    {team && (
                      <p className="text-xs text-sidebar-foreground/70 leading-none">{team.name}</p>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Mobile Navigation Content */}
              <div className="flex flex-col h-full">
                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const isActive = currentPath === item.href || 
                      (item.href === '/console' && currentPath === '/') ||
                      (item.href === '/console' && currentPath.startsWith('/console')) ||
                      (item.href === '/dashboard' && currentPath === '/dashboard') ||
                      (item.href === '/tasks' && currentPath.startsWith('/project')) ||
                      (item.href === '/user-dashboard' && currentPath === '/user-dashboard');
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileSheetOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-4 rounded-lg transition-all duration-200 touch-manipulation min-h-[48px] ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                      >
                        <div className="text-current">
                          {item.icon}
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Progress Bar Section */}
                {totalTasks > 0 && (
                  <div className="border-t border-sidebar-border px-4 py-4">
                    <ProgressBar
                      completedTasks={completedTasks}
                      totalTasks={totalTasks}
                      size="md"
                      showLabel={true}
                      showPercentage={true}
                    />
                  </div>
                )}

                {/* Mobile User Profile Section */}
                <div className="border-t border-sidebar-border p-4">
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
                      <p className="text-xs text-sidebar-foreground/70 leading-none">Team Member</p>
                    </div>
                    <ThemeToggle 
                      variant="ghost" 
                      size="icon"
                      className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent min-h-[44px] min-w-[44px] touch-manipulation"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-destructive hover:text-destructive/80 hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50 touch-manipulation min-h-[48px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
            
          {/* Centered Logo and Title */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-lg font-bold text-foreground">HackerDen</span>
          </div>
          
          {/* Right side spacer for centering */}
          <div className="w-10"></div>
        </header>

        {/* Breadcrumb Navigation */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 lg:px-6 py-3">
          <BreadcrumbNavigation />
        </div>

        {/* Main Content with Enhanced Mobile Scrolling */}
        <main 
          id="main-content"
          className="flex-1 overflow-hidden"
          role="main"
          tabIndex="-1"
        >
          <div className="h-full p-4 lg:p-6 overflow-y-auto overscroll-y-contain">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;