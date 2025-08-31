
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import ProgressBar from './ProgressBar.jsx';
import { ThemeToggle } from './ui/theme-toggle.jsx';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { useTasks } from '../hooks/useTasks';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const { team } = useTeam();
  const { tasksByStatus } = useTasks();

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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Team Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  const location = useLocation();
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-screen w-sidebar border-r border-gray-700 overflow-hidden" style={{ background: '#1A2423' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <Logo size="sm" showText={false} />
              <div className="space-y-1">
                <h1 className="text-h1 font-bold text-text-primary leading-none">HackerDen</h1>
                {team && (
                  <p className="text-xs text-text-secondary leading-none">{team.name}</p>
                )}
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={onToggle}
              className="lg:hidden text-text-secondary hover:text-text-primary p-3 -m-3 rounded-lg transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-2 overflow-hidden">
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
                  className={`flex items-center space-x-4 px-5 py-4 rounded-button transition-all duration-200 group ${
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#22312F' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = '#1E2B29';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={onToggle} // Close sidebar on mobile when navigating
                >
                  <div className={`${isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-body">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Progress Bar Section */}
          {totalTasks > 0 && (
            <div className="px-6 py-4 border-t border-gray-700/50 flex-shrink-0">
              <ProgressBar
                completedTasks={completedTasks}
                totalTasks={totalTasks}
                size="md"
                showLabel={true}
                showPercentage={true}
              />
            </div>
          )}

          {/* User Profile Section */}
          <div className="p-6 border-t border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-body font-semibold text-text-primary truncate leading-none">
                  {user?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-text-secondary leading-none">Team Member</p>
              </div>
              <ThemeToggle 
                variant="ghost" 
                size="icon"
                className="text-text-secondary hover:text-text-primary hover:bg-sidebar-hover"
              />
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-5 py-4 text-body font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-button transition-all duration-200 border border-red-800/30 hover:border-red-700/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;