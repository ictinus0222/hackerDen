import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ErrorBoundary from './ErrorBoundary';
import MessagesSetupGuide from './MessagesSetupGuide';

const Chat = () => {
  const { messages, loading, error, sending, sendMessage } = useMessages();
  const { user } = useAuth();

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  // Show setup guide if there's a collection error
  if (error && (error.includes('collection') || error.includes('schema'))) {
    return (
      <div className="bg-white rounded-lg shadow h-full p-6">
        <MessagesSetupGuide error={error} />
      </div>
    );
  }

  return (
    <section 
      className="rounded-2xl h-full flex flex-col card-enhanced animate-fade-in"
      aria-label="Team chat"
      role="complementary"
    >
      {/* Professional Chat Header */}
      <header className="px-5 py-4 border-b border-dark-primary flex-shrink-0 bg-dark-tertiary rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-dark-primary">Team Chat</h2>
              <p className="text-xs text-dark-tertiary font-mono">real-time</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-dark-tertiary font-mono">online</span>
          </div>
        </div>
        {error && !error.includes('collection') && !error.includes('schema') && (
          <div 
            className="text-sm text-red-600 mt-1 p-2 bg-red-50 rounded-md border border-red-200"
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
      <footer className="px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
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