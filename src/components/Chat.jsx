import { useHackathonMessages } from '../hooks/useHackathonMessages';
import { useAuth } from '../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ErrorBoundary from './ErrorBoundary';
import MessagesSetupGuide from './MessagesSetupGuide';

const Chat = () => {
  const { messages, loading, error, sending, sendMessage, team } = useHackathonMessages();
  const { user } = useAuth();

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  // Show setup guide if there's a collection error
  if (error && (error.includes('collection') || error.includes('schema'))) {
    return (
      <div className="card p-6 h-full">
        <MessagesSetupGuide error={error} />
      </div>
    );
  }

  return (
    <section 
      className="card-enhanced h-full flex flex-col fade-in"
      aria-label="Team chat"
      role="complementary"
    >
      {/* Chat Header */}
      <header className="px-6 py-5 border-b border-dark-primary/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Team Chat</h2>
              <p className="text-sm text-dark-tertiary">Real-time messaging</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-dark-tertiary">Online</span>
          </div>
        </div>
        {error && !error.includes('collection') && !error.includes('schema') && (
          <div 
            className="text-sm text-red-300 mt-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20"
            role="alert"
            aria-live="polite"
          >
            <span className="sr-only">Error: </span>
            {error}
          </div>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0" role="log" aria-live="polite" aria-label="Chat messages">
        <ErrorBoundary>
          <MessageList
            messages={messages}
            loading={loading}
            currentUserId={user?.$id}
          />
        </ErrorBoundary>
      </div>

      {/* Message Input */}
      <footer className="px-6 py-4 border-t border-dark-primary/20 flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!user}
          sending={sending}
        />
      </footer>
    </section>
  );
};

export default Chat;