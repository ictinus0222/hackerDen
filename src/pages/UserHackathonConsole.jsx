import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hackathonService } from '../services/hackathonService';
import ConsoleLayout from '../components/ConsoleLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import TeamSelector from '../components/TeamSelector';
import { ShadcnTest } from '../components/ShadcnTest';

const UserHackathonConsole = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);

  // Load user hackathons from database
  useEffect(() => {
    const loadUserHackathons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userHackathons = await hackathonService.getUserHackathons(user.$id);
        setHackathons(userHackathons);
      } catch (err) {
        console.error('Failed to load hackathons:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserHackathons();
  }, [user?.$id]);

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      ongoing: 'bg-green-500/20 text-green-300 border-green-500/30',
      completed: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return badges[status] || badges.upcoming;
  };

  const getRoleBadge = (role) => {
    return role === 'leader' 
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  };

  const handleJoinCreateTeam = (hackathon) => {
    setSelectedHackathon(hackathon);
    setShowTeamSelector(true);
  };

  const handleTeamAction = () => {
    setShowTeamSelector(false);
    setSelectedHackathon(null);
    // Refresh hackathons data
    window.location.reload();
  };

  const handleJoinTeamByCode = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setJoinLoading(true);
      setJoinError(null);
      
      // Join team by code - this will find the hackathon and join the team
      await hackathonService.joinTeamByCode(user.$id, joinCode.trim().toUpperCase());
      
      // Close modal and refresh
      setShowJoinTeamModal(false);
      setJoinCode('');
      window.location.reload();
    } catch (err) {
      console.error('Failed to join team:', err);
      setJoinError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const groupedHackathons = {
    ongoing: hackathons.filter(h => h.status === 'ongoing'),
    upcoming: hackathons.filter(h => h.status === 'upcoming'),
    completed: hackathons.filter(h => h.status === 'completed')
  };

  if (loading) {
    return (
      <ConsoleLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message="Loading your hackathons..." />
        </div>
      </ConsoleLayout>
    );
  }

  return (
    <ConsoleLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Shadcn Test Component */}
        <ShadcnTest />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Hackathons</h1>
            <p className="text-dark-tertiary mt-2">
              Your hackathon journey - past, present, and future
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowJoinTeamModal(true)}
              className="px-6 py-3 bg-background-sidebar text-white rounded-xl hover:bg-sidebar-hover transition-all duration-200 font-medium flex items-center space-x-2 border border-dark-primary/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Join Team</span>
            </button>
            <Link
              to="/create-hackathon"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Hackathon</span>
            </Link>
          </div>
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

        {/* Empty State */}
        {hackathons.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 text-dark-tertiary/50">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Hackathons Yet</h3>
            <p className="text-dark-tertiary mb-6 max-w-md mx-auto">
              You haven't joined any hackathons yet. Create your first hackathon and start your innovation journey!
            </p>
            <Link
              to="/create-hackathon"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
            >
              Create Your First Hackathon
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Ongoing Hackathons */}
            {groupedHackathons.ongoing.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3"></div>
                  Ongoing Hackathons
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedHackathons.ongoing.map((hackathon) => (
                    <HackathonCard 
                      key={hackathon.hackathonId} 
                      hackathon={hackathon} 
                      onJoinCreateTeam={handleJoinCreateTeam}
                      getStatusBadge={getStatusBadge}
                      getRoleBadge={getRoleBadge}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Hackathons */}
            {groupedHackathons.upcoming.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                  Upcoming Hackathons
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedHackathons.upcoming.map((hackathon) => (
                    <HackathonCard 
                      key={hackathon.hackathonId} 
                      hackathon={hackathon} 
                      onJoinCreateTeam={handleJoinCreateTeam}
                      getStatusBadge={getStatusBadge}
                      getRoleBadge={getRoleBadge}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Hackathons */}
            {groupedHackathons.completed.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                  Completed Hackathons
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedHackathons.completed.map((hackathon) => (
                    <HackathonCard 
                      key={hackathon.hackathonId} 
                      hackathon={hackathon} 
                      onJoinCreateTeam={handleJoinCreateTeam}
                      getStatusBadge={getStatusBadge}
                      getRoleBadge={getRoleBadge}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Team Selector Modal */}
        {showTeamSelector && selectedHackathon && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-background-card rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Join Team</h3>
                  <p className="text-sm text-dark-tertiary">{selectedHackathon.hackathonName}</p>
                </div>
                <button
                  onClick={() => setShowTeamSelector(false)}
                  className="text-dark-tertiary hover:text-white p-2 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TeamSelector onTeamCreatedOrJoined={handleTeamAction} />
            </div>
          </div>
        )}

        {/* Join Team by Code Modal */}
        {showJoinTeamModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-background-card rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Join Team</h3>
                  <p className="text-sm text-dark-tertiary">Enter your team code to join</p>
                </div>
                <button
                  onClick={() => {
                    setShowJoinTeamModal(false);
                    setJoinCode('');
                    setJoinError(null);
                  }}
                  className="text-dark-tertiary hover:text-white p-2 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {joinError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 mb-4">
                  {joinError}
                </div>
              )}

              <form onSubmit={handleJoinTeamByCode} className="space-y-4">
                <div>
                  <label htmlFor="joinCode" className="block text-sm font-medium text-white mb-2">
                    Team Code
                  </label>
                  <input
                    type="text"
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-background-sidebar border border-dark-primary/20 rounded-lg text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center tracking-wider"
                    placeholder="ABC123"
                    maxLength={6}
                    required
                    disabled={joinLoading}
                  />
                  <p className="text-xs text-dark-tertiary mt-1">
                    Enter the 6-character code shared by your team leader
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={joinLoading || !joinCode.trim()}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joinLoading ? 'Joining...' : 'Join Team'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
};

// Hackathon Card Component
const HackathonCard = ({ hackathon, onJoinCreateTeam, getStatusBadge, getRoleBadge }) => {
  return (
    <div className="card-enhanced p-6 transition-all duration-200 hover:shadow-xl hover:bg-background-sidebar">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
              {hackathon.hackathonName}
            </h3>
            <p className="text-sm text-dark-tertiary">{hackathon.dates}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusBadge(hackathon.status)}`}>
            {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
          </span>
        </div>

        {/* Team Info */}
        {hackathon.team ? (
          <div className="flex items-center space-x-3 p-3 bg-background-sidebar rounded-xl border border-dark-primary/20">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              hackathon.team.role === 'leader' 
                ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                : 'bg-gradient-to-br from-purple-500 to-pink-600'
            }`}>
              {hackathon.team.role === 'leader' ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{hackathon.team.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getRoleBadge(hackathon.team.role)}`}>
                {hackathon.team.role === 'leader' ? 'Team Leader' : 'Member'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-dark-primary/10 rounded-xl border border-dashed border-dark-primary/30 text-center">
            <p className="text-sm text-dark-tertiary">No team assigned</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link
            to={`/hackathon/${hackathon.hackathonId}/dashboard`}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium text-center text-sm"
          >
            View Dashboard
          </Link>
          
          {hackathon.status === 'upcoming' && (
            <>
              {hackathon.team ? (
                <button className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-all duration-200 font-medium text-sm border border-red-500/30">
                  Leave Team
                </button>
              ) : (
                <button
                  onClick={() => onJoinCreateTeam(hackathon)}
                  className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-all duration-200 font-medium text-sm border border-blue-500/30"
                >
                  Join Team
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHackathonConsole;