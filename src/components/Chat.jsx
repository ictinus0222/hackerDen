import { useHackathonMessages } from '../hooks/useHackathonMessages';
import { useAuth } from '../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ErrorBoundary from './ErrorBoundary';
import MessagesSetupGuide from './MessagesSetupGuide';
import { Card, EnhancedCard } from './ui/card';
import { Badge } from './ui/badge';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import SystemAlert, { SystemAlerts } from './SystemAlert';
import { notificationService } from '../services/notificationService';
import { useEffect, useState } from 'react';

const Chat = () => {
  const { messages, loading, error, sending, sendMessage, team } = useHackathonMessages();
  const { user } = useAuth();
  const { isConnected, isReconnecting, reconnectAttempts } = useConnectionStatus();
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  // Monitor connection status and show notifications
  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      setShowConnectionAlert(true);
      notificationService.connection.lost();
    } else if (isConnected && showConnectionAlert) {
      setShowConnectionAlert(false);
      notificationService.connection.restored();
    } else if (isReconnecting) {
      notificationService.connection.reconnecting(reconnectAttempts);
    }
  }, [isConnected, isReconnecting, reconnectAttempts, showConnectionAlert]);

  // Handle message send with notifications
  const handleSendMessageWithNotification = (content) => {
    try {
      handleSendMessage(content);
      // Don't show success notification for every message - too noisy
    } catch (error) {
      notificationService.message.failed();
    }
  };

  const getConnectionBadge = () => {
    if (isConnected && !isReconnecting) {
      return (
        <Badge variant="default" className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs">Online</span>
        </Badge>
      );
    }
    
    if (isReconnecting) {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-xs">Reconnecting ({reconnectAttempts})</span>
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs">Offline</span>
      </Badge>
    );
  };

  // Show setup guide if there's a collection error
  if (error && (error.includes('collection') || error.includes('schema'))) {
    return (
      <Card className="p-6 h-full">
        <MessagesSetupGuide error={error} />
      </Card>
    );
  }

  return (
    <EnhancedCard 
      className="h-full flex flex-col fade-in"
      aria-label="Team chat"
      role="complementary"
    >
      {/* Chat Header */}
      <header className="px-6 py-5 border-b border-dark-primary/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg">
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
            {getConnectionBadge()}
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

      {/* System Alerts */}
      {showConnectionAlert && (
        <div className="px-6 py-2">
          <SystemAlerts.ConnectionLost
            dismissible
            onDismiss={() => setShowConnectionAlert(false)}
          />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0" role="log" aria-live="polite" aria-label="Chat messages">
        <ErrorBoundary>
          <MessageList
            messages={messages}
            loading={loading}
            currentUserId={user?.$id}
            typingUsers={typingUsers}
          />
        </ErrorBoundary>
      </div>

      {/* Message Input */}
      <footer className="px-6 py-4 border-t border-dark-primary/20 flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessageWithNotification}
          disabled={!user}
          sending={sending}
        />
      </footer>
    </EnhancedCard>
  );
};

export default Chat;