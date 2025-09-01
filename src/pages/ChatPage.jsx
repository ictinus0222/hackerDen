import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import { ChatInitializationSkeleton } from '../components/ChatLoadingStates';
import ChatContainer from '../components/ChatContainer';
import ChatErrorBoundary from '../components/ChatErrorBoundary';

const ChatPage = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const { team, loading: teamLoading, hasTeam } = useHackathonTeam(hackathonId);

  // Show enhanced loading state while team data is being fetched
  if (teamLoading) {
    return (
      <div className="h-full flex flex-col">
        <ChatInitializationSkeleton />
      </div>
    );
  }

  // Redirect to team selection if user is not part of a team
  if (!hasTeam || !team) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8 sm:py-16 px-4 sm:px-6">
        <div 
          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-muted-foreground"
          aria-hidden="true"
        >
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
          Join a Team First
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          You need to be part of a hackathon team to access the chat.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="touch-target px-4 sm:px-6 py-3 bg-gradient-to-r from-primary to-chart-2 text-primary-foreground rounded-xl hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 font-medium text-sm sm:text-base"
          aria-label="Go back to previous page"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <ChatErrorBoundary>
      <div className="h-full flex flex-col chat-container">
        <ChatContainer 
          hackathon={{ title: 'Current Hackathon' }} // TODO: Get actual hackathon data
          team={team}
          hackathonId={hackathonId}
          className="flex-1 min-h-0"
        />
      </div>
    </ChatErrorBoundary>
  );
};

export default ChatPage;