import { useAuth } from '../hooks/useAuth.jsx';
import { useTeam } from '../hooks/useTeam.jsx';
import TeamSelector from '../components/TeamSelector.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { team, loading: teamLoading, hasTeam } = useTeam();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">HackerDen</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {teamLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : hasTeam ? (
            // User has a team - show team dashboard
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Team: {team.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  Join Code: <span className="font-mono font-bold text-blue-600">{team.joinCode}</span>
                </p>
                <p className="text-gray-600">
                  Kanban board and chat features will be implemented in the next tasks.
                </p>
              </div>
            </div>
          ) : (
            // User doesn't have a team - show team selection options
            <TeamSelector />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;