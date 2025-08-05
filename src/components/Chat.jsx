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
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Team Chat</h2>
        {error && !error.includes('collection') && !error.includes('schema') && (
          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ErrorBoundary>
          <MessageList
            messages={messages}
            loading={loading}
            currentUserId={user?.$id}
          />
        </ErrorBoundary>
      </div>

      {/* Message Input */}
      <div className="px-6 py-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!user}
          sending={sending}
        />
      </div>
    </div>
  );
};

export default Chat;