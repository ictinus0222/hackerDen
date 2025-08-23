import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import { useHackathonTasks } from '../hooks/useHackathonTasks';
import ProgressBar from './ProgressBar';

const HackathonLayout = ({ children, hackathon }) => {
  const { user, logout } = useAuth();
  const { hackathonId } = useParams();
  const { team } = useHackathonTeam(hackathonId);
  const { tasksByStatus } = useHackathonTasks();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Tasks',
      href: `/hackathon/${hackathonId}/tasks`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: 'Team Vault',
      href: `/hackathon/${hackathonId}/vault`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      )
    },
    {
      name: 'Whiteboard',
      href: `/hackathon/${hackathonId}/whiteboard`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      name: 'Chat',
      href: `/hackathon/${hackathonId}/chat`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="min-h-screen bg-background-primary flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contextual Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-screen w-sidebar border-r border-gray-700 overflow-hidden" style={{ background: '#1A2423' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <Link to="/console" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 1024 1024" className="w-full h-full">
                    <defs>
                      <linearGradient id="greenGradient-hackathon" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'rgb(74, 222, 128)', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'rgb(22, 163, 74)', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <g fill="url(#greenGradient-hackathon)">
                      <path d="M50 200 Q200 50 400 200 Q600 350 800 200 Q900 150 950 200 L950 250 Q900 200 800 250 Q600 400 400 250 Q200 100 50 250 Z" opacity="0.9" />
                      <path d="M100 300 Q250 150 450 300 Q650 450 850 300 Q900 250 950 300 L950 350 Q900 300 850 350 Q650 500 450 350 Q250 200 100 350 Z" opacity="0.8" />
                      <path d="M150 400 Q300 250 500 400 Q700 550 900 400 Q950 350 1000 400 L1000 450 Q950 400 900 450 Q700 600 500 450 Q300 300 150 450 Z" opacity="0.7" />
                      <path d="M200 500 Q350 350 550 500 Q750 650 950 500 Q1000 450 1050 500 L1050 550 Q1000 500 950 550 Q750 700 550 550 Q350 400 200 550 Z" opacity="0.6" />
                      <path d="M250 600 Q400 450 600 600 Q800 750 1000 600 L1000 650 Q800 800 600 650 Q400 500 250 650 Z" opacity="0.5" />
                      <path d="M300 700 Q450 550 650 700 Q850 850 1050 700 L1050 750 Q850 900 650 750 Q450 600 300 750 Z" opacity="0.4" />
                    </g>
                  </svg>
                </div>
              </Link>
              <div className="space-y-1">
                <h1 className="text-h1 font-bold text-text-primary leading-none">HackerDen</h1>
                {hackathon && (
                  <p className="text-xs text-text-secondary leading-none">{hackathon.hackathonName}</p>
                )}
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
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
              const isActive = currentPath === item.href || currentPath.startsWith(item.href);
              
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
                  onClick={() => setSidebarOpen(false)}
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
                <p className="text-xs text-text-secondary leading-none">
                  {team && team.ownerId === user?.$id ? 'Team Leader' : 'Team Member'}
                </p>
              </div>
            </div>
            
            <Link
              to="/console"
              className="w-full flex items-center space-x-4 px-5 py-4 text-body font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-900/20 rounded-button transition-all duration-200 border border-gray-800/30 hover:border-gray-700/50 mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Return to Console</span>
            </Link>
            
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar for Mobile */}
        <div className="lg:hidden bg-background-card border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-primary p-2 rounded-lg hover:bg-background-sidebar transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6">
              <svg viewBox="0 0 1024 1024" className="w-full h-full">
                <defs>
                  <linearGradient id="greenGradient-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgb(74, 222, 128)', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgb(22, 163, 74)', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <g fill="url(#greenGradient-mobile)">
                  <path d="M50 200 Q200 50 400 200 Q600 350 800 200 Q900 150 950 200 L950 250 Q900 200 800 250 Q600 400 400 250 Q200 100 50 250 Z" opacity="0.9" />
                  <path d="M100 300 Q250 150 450 300 Q650 450 850 300 Q900 250 950 300 L950 350 Q900 300 850 350 Q650 500 450 350 Q250 200 100 350 Z" opacity="0.8" />
                </g>
              </svg>
            </div>
            <span className="text-text-primary font-medium">HackerDen</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default HackathonLayout;