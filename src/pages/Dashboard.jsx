import { useTeam } from '../hooks/useTeam.jsx';
import Layout from '../components/Layout.jsx';
import TeamSelector from '../components/TeamSelector.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import Chat from '../components/Chat.jsx';
import MobileTabSwitcher from '../components/MobileTabSwitcher.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Dashboard = () => {
  const { team, loading: teamLoading, hasTeam } = useTeam();

  return (
    <Layout>
      <ErrorBoundary>
        {teamLoading ? (
          <LoadingSpinner message="Loading your team..." />
        ) : hasTeam ? (
          // User has a team - show team dashboard with responsive layout
          <div className="space-y-4 sm:space-y-6">
            {/* Team Info Header */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 truncate">
                    Team: {team.name}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Join Code: <span className="font-mono font-bold text-blue-600 select-all">{team.joinCode}</span>
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active Team
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Side by Side */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 h-[calc(100vh-280px)] min-h-[600px]">
              <div className="h-full">
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
    </Layout>
  );
};

export default Dashboard;