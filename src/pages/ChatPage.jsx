import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { useAuth } from '../hooks/useAuth';
import { teamService } from '../services/teamService';

const ChatPage = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user's team for this hackathon
  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.$id || !hackathonId) {
        setTeam(null);
        setLoading(false);
        return;
      }

      try {
        const userTeam = await teamService.getUserTeamForHackathon(user.$id, hackathonId);
        setTeam(userTeam);
      } catch (err) {
        console.error('Error fetching team:', err);
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user?.$id, hackathonId]);

  const hasTeam = !!team;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-dark-tertiary">Loading team information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasTeam) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg className="w-16 h-16 text-dark-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-semibold text-dark-primary mb-2">No Team Found</h3>
            <p className="text-dark-tertiary mb-4">You need to join or create a team to access team chat.</p>
            <div className="space-x-3">
              <a href="/create-team" className="btn-primary">
                Create Team
              </a>
              <a href="/join-team" className="btn-secondary">
                Join Team
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <ErrorBoundary>
        <div className="flex flex-col chat-container">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-dark-primary">Team Chat</h1>
              <p className="text-dark-tertiary">
                Communicate with your team in real-time
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-dark-tertiary">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Connected</span>
            </div>
          </div>

          {/* Full-Screen Chat */}
          <div className="flex-1 min-h-0">
            <Chat />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default ChatPage;