import { useState } from 'react';
import { useTeam } from '../hooks/useTeam.jsx';
import Layout from '../components/Layout.jsx';
import TeamSelector from '../components/TeamSelector.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import Chat from '../components/Chat.jsx';
import MobileTabSwitcher from '../components/MobileTabSwitcher.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import RealtimeDebugPanel from '../components/RealtimeDebugPanel.jsx';

const Dashboard = () => {
  const { team, loading: teamLoading, hasTeam } = useTeam();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <Layout>
      <ConnectionStatus />
      <ErrorBoundary>
        {teamLoading ? (
          <LoadingSpinner message="Loading your team..." />
        ) : hasTeam ? (
          // User has a team - show team dashboard with responsive layout
          <div className="space-y-4 sm:space-y-6">
            {/* Team Info Header */}
            <div className="card-enhanced rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-dark-primary truncate">
                      {team.name}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-dark-secondary">Join Code:</span>
                    <code className="font-mono font-bold text-accent px-2 py-1 bg-dark-tertiary rounded-lg select-all">
                      {team.joinCode}
                    </code>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                    Active
                  </span>
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={() => setShowDebugPanel(true)}
                      className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                      title="Open Real-time Debug Panel"
                    >
                      🔧 Debug
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Two-Panel Layout */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 h-[calc(100vh-280px)] min-h-[600px]">
              <div className="lg:col-span-2 h-full">
                <KanbanBoard />
              </div>
              <div className="h-full">
                <Chat />
              </div>
            </div>

            {/* Mobile Layout - Tab Switcher */}
            <div className="lg:hidden h-[calc(100vh-220px)] min-h-[500px]">
              <MobileTabSwitcher>
                <KanbanBoard />
                <Chat />
              </MobileTabSwitcher>
            </div>
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