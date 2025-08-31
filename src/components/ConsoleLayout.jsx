import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { ThemeToggle } from './ui/theme-toggle.jsx';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
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
  SidebarTrigger,
} from './ui/sidebar';
import { Avatar, AvatarFallback } from './ui/avatar';

const ConsoleLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

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
      name: 'Create Hackathon',
      href: '/create-hackathon',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      name: 'Whiteboard',
      href: '/whiteboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    }
  ];

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
              <Logo size="sm" showText={false} />
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-sidebar-foreground leading-none">HackerDen</h1>
                <p className="text-xs text-sidebar-foreground/70 leading-none">Console</p>
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
                    (item.href === '/console' && currentPath === '/');
                  
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
                  <p className="text-xs text-sidebar-foreground/70 leading-none">User</p>
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

        {/* Main Content */}
        <main 
          id="main-content"
          className="flex-1 overflow-hidden"
          role="main"
          tabIndex="-1"
        >
          <div className="h-full p-4 lg:p-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ConsoleLayout;