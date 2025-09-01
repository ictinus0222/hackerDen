
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { ThemeToggle } from './ui/theme-toggle.jsx';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();

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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Create Hackathon',
      href: '/create-hackathon',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    }
  ];

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Floating Sidebar */}
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
                    <p className="text-xs text-muted-foreground leading-none">Console</p>
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
                    <p className="text-xs text-muted-foreground leading-none">Personal Console</p>
                  </div>
                  <ThemeToggle 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors duration-200"
                  />
                </div>
                
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

export default Sidebar;