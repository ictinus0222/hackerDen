import { useState } from 'react';
import { useHackathonTeam } from '../hooks/useHackathonTeam';

const HackathonTeamSelector = ({ hackathonId, onTeamCreatedOrJoined }) => {
  const { createTeam, joinTeam } = useHackathonTeam(hackathonId);
  const [mode, setMode] = useState('select'); // 'select', 'create', 'join'
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await createTeam(teamName.trim());
      onTeamCreatedOrJoined?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await joinTeam(joinCode.trim().toUpperCase());
      onTeamCreatedOrJoined?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'create') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setMode('select')}
            className="text-dark-tertiary hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-white">Create New Team</h3>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-white mb-2">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 bg-background-sidebar border border-dark-primary/20 rounded-lg text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter team name"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !teamName.trim()}
            className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setMode('select')}
            className="text-dark-tertiary hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-white">Join Existing Team</h3>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleJoinTeam} className="space-y-4">
          <div>
            <label htmlFor="joinCode" className="block text-sm font-medium text-white mb-2">
              Join Code
            </label>
            <input
              type="text"
              id="joinCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-background-sidebar border border-dark-primary/20 rounded-lg text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-center tracking-wider"
              placeholder="ABC123"
              maxLength={6}
              required
              disabled={loading}
            />
            <p className="text-xs text-dark-tertiary mt-1">
              Enter the 6-character code shared by your team leader
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading || !joinCode.trim()}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Team'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Join a Team</h3>
        <p className="text-sm text-dark-tertiary">
          Create a new team or join an existing one for this hackathon
        </p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => setMode('create')}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create New Team</span>
        </button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-primary/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background-card text-dark-tertiary">or</span>
          </div>
        </div>
        
        <button
          onClick={() => setMode('join')}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-background-sidebar text-white rounded-lg hover:bg-sidebar-hover transition-all duration-200 font-medium border border-dark-primary/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Join Existing Team</span>
        </button>
      </div>
    </div>
  );
};

export default HackathonTeamSelector;