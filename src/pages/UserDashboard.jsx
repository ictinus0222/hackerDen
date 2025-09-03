import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { useTeam } from '../hooks/useTeam';
import { teamService } from '../services/teamService';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import TeamSelector from '../components/TeamSelector';
import { EnhancedCard, InteractiveCard } from '../components/ui/card.jsx';

const UserDashboard = () => {
  // TODO: Authentication removed
  // // TODO: Authentication removed
  const { user } = useAuth();
  const { team: currentTeam, refreshTeam } = useTeam();
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTeamSelector, setShowTeamSelector] = useState(false);

  // Load all teams the user is part of
  useEffect(() => {
    const loadUserTeams = async () => {
      if (!user?.$id) return;

      try {
        setLoading(true);
        setError(null);
        const teams = await teamService.getUserTeams(user.$id);
        setUserTeams(teams);
      } catch (err) {
        console.error('Failed to load user teams:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserTeams();
  }, [user?.$id]);

  const handleTeamSwitch = async (teamId) => {
    try {
      // Switch to the selected team
      await teamService.switchToTeam(teamId);
      await refreshTeam();
    } catch (err) {
      console.error('Failed to switch team:', err);
      setError(err.message);
    }
  };

  const handleTeamCreatedOrJoined = () => {
    setShowTeamSelector(false);
    // Refresh teams list and current team
    refreshTeam();
    window.location.reload(); // Simple refresh to update all team data
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message="Loading your teams..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Your Teams</h1>
          <p className="text-dark-tertiary">
            Manage your team memberships and switch between teams
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Current Team */}
        {currentTeam && (
          <EnhancedCard className="p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Current Team</h3>
                  <p className="text-xl font-bold text-chart-2">{currentTeam.name}</p>
                  <p className="text-sm text-dark-tertiary">
                    Role: {currentTeam.userRole === 'owner' ? 'Team Leader' : 'Member'}
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-primary to-chart-2 text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 font-medium"
              >
                Go to Team Dashboard
              </Link>
            </div>
          </EnhancedCard>
        )}

        {/* All Teams */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">All Your Teams</h2>
            <button
              onClick={() => setShowTeamSelector(true)}
              className="px-4 py-2 bg-background-sidebar text-white rounded-xl hover:bg-sidebar-hover transition-all duration-200 font-medium border border-dark-primary/20"
            >
              Join or Create Team
            </button>
          </div>

          {userTeams.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-dark-tertiary/50">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2V18h2v-4h3v4h1v2H3v-2h1z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Teams Yet</h3>
              <p className="text-dark-tertiary mb-4">You haven't joined any teams yet.</p>
              <button
                onClick={() => setShowTeamSelector(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary to-chart-2 text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 font-medium"
              >
                Create or Join Your First Team
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTeams.map((team) => (
                <InteractiveCard
                  key={team.$id}
                  className={`p-6 ${
                    currentTeam?.$id === team.$id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                        team.userRole === 'owner' 
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {team.userRole === 'owner' ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      {currentTeam?.$id === team.$id && (
                        <div className="w-3 h-3 bg-chart-2 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      team.userRole === 'owner' 
                        ? 'bg-yellow-500/20 text-yellow-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {team.userRole === 'owner' ? 'Leader' : 'Member'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white truncate">{team.name}</h3>
                      <p className="text-sm text-dark-tertiary">
                        Join Code: <span className="font-mono text-chart-2">{team.joinCode}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-dark-primary/20">
                      <span className="text-xs text-dark-tertiary">
                        {currentTeam?.$id === team.$id ? 'Active Team' : 'Switch to this team'}
                      </span>
                      {currentTeam?.$id !== team.$id && (
                        <button
                          onClick={() => handleTeamSwitch(team.$id)}
                          className="px-3 py-1 text-sm bg-primary/20 text-chart-2 rounded-lg hover:bg-primary/30 transition-all duration-200 border border-primary/30"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          )}
        </div>

        {/* Team Selector Modal */}
        {showTeamSelector && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-background-card rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Join or Create Team</h3>
                <button
                  onClick={() => setShowTeamSelector(false)}
                  className="text-dark-tertiary hover:text-white p-2 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TeamSelector onTeamCreatedOrJoined={handleTeamCreatedOrJoined} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;