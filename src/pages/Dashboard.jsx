import { useState } from 'react';
import { useTeam } from '../hooks/useTeam.jsx';
import Layout from '../components/Layout.jsx';
import TeamSelector from '../components/TeamSelector.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import Chat from '../components/Chat.jsx';
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
          <div className="space-y-6">
            {/* Team Info Header */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {team.name}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Join Code:</span>
                    <code className="font-mono font-semibold text-blue-600 px-2 py-1 bg-blue-50 rounded-md select-all">
                      {team.joinCode}
                    </code>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex items-center space-x-3">
                  <a 
                    href="/project"
                    className="btn btn-secondary text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Project View
                  </a>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Active
                  </span>
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={() => setShowDebugPanel(true)}
                      className="btn btn-secondary text-xs"
                      title="Open Real-time Debug Panel"
                    >
                      🔧 Debug
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Kanban + Chat Layout */}
            <div className="grid grid-cols-5 gap-6 h-[calc(100vh-240px)] min-h-[700px]">
              <div className="col-span-4 h-full">
                <KanbanBoard />
              </div>
              <div className="col-span-1 h-full">
                <Chat />
              </div>
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