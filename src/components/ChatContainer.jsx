import { useEffect, useState, useCallback } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatKeyboardShortcuts from './ChatKeyboardShortcuts';
import ChatErrorBoundary, { NetworkFallback } from './ChatErrorBoundary';
import { 
  ChatLoadingSkeleton, 
  ChatInitializationSkeleton
} from './ChatLoadingStates';
import { 
  FailedOperationAlert, 
  RetryQueueManager, 
  ConnectionStatusWithRetry,
  AutoRetryManager 
} from './ChatRetryMechanisms';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useChatKeyboardNavigation, useChatFocusManagement } from '../hooks/useChatKeyboardNavigation';
import { cn } from '../lib/utils';

const ChatContainer = ({ hackathon, team, hackathonId, className }) => {
  const { user } = useAuth();
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [retryQueue, setRetryQueue] = useState([]);
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);
  
  const {
    messages,
    loading,
    error,
    sending,
    hasMore,
    loadingMore,
    typingUsers,
    connectionStatus,
    sendMessage,
    loadMoreMessages,
    retryFailedMessage,
    sendTypingIndicator,
    stopTypingIndicator,
    refreshMessages
  } = useMessages(team?.$id, hackathonId);

  const {
    isOnline,
    connectionQuality,
    lastDisconnect,
    retryConnection,
    testConnectionQuality
  } = useNetworkStatus();

  // COMPLETELY REMOVED: useNotifications hook and all notification logic

  // Focus management for accessibility
  const { 
    focusMessageInput, 
    focusScrollToBottom, 
    focusFirstMessage, 
    focusLastMessage 
  } = useChatFocusManagement();

  // Enhanced error handling with retry logic
  const handleChatError = useCallback((error, errorInfo) => {
    console.error('Chat error:', error, errorInfo);
    
    // Add to retry queue if it's a recoverable error
    if (error.message?.includes('network') || error.message?.includes('timeout')) {
      const retryItem = {
        id: Date.now(),
        description: 'Chat connection failed',
        error: error.message,
        retryCount: 0,
        maxRetries: 3,
        action: () => refreshMessages()
      };
      
      setRetryQueue(prev => [...prev, retryItem]);
    }
  }, [refreshMessages]);

  // Enhanced connection retry with exponential backoff
  const handleConnectionRetry = useCallback(async () => {
    try {
      setConnectionRetryCount(prev => prev + 1);
      
      // Test network connectivity first
      const networkOk = await retryConnection();
      if (!networkOk) {
        throw new Error('Network connectivity test failed');
      }
      
      // Refresh chat messages
      await refreshMessages();
      
      // Reset retry count on success
      setConnectionRetryCount(0);
      
    } catch (error) {
      console.error('Connection retry failed:', error);
      
      // Exponential backoff for next retry
      if (autoRetryEnabled && connectionRetryCount < 3) {
        const delay = Math.pow(2, connectionRetryCount) * 1000;
        setTimeout(handleConnectionRetry, delay);
      }
    }
  }, [retryConnection, refreshMessages, autoRetryEnabled, connectionRetryCount]);

  // Handle retry queue items
  const handleRetryQueueItem = useCallback(async (item) => {
    try {
      await item.action();
      
      // Remove from queue on success
      setRetryQueue(prev => prev.filter(i => i.id !== item.id));
      
    } catch (error) {
      console.error('Retry failed:', error);
      
      // Update retry count
      setRetryQueue(prev => prev.map(i => 
        i.id === item.id 
          ? { ...i, retryCount: i.retryCount + 1 }
          : i
      ));
    }
  }, []);

  // Clear retry queue
  const handleClearRetryQueue = useCallback(() => {
    setRetryQueue([]);
  }, []);

  // Keyboard navigation support
  const { shortcuts } = useChatKeyboardNavigation({
    onFocusInput: focusMessageInput,
    onScrollToBottom: () => {
      const scrollElement = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    },
    onScrollToTop: () => {
      const scrollElement = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    },
    onMarkAsRead: () => {}, // No-op since we removed all notifications
    disabled: connectionStatus === 'disconnected'
  });

  // COMPLETELY REMOVED: All notification handling useEffect

  // Show comprehensive loading state during initialization
  if (loading) {
    return (
      <div className={cn("flex-1 flex flex-col", className)}>
        <ChatInitializationSkeleton />
      </div>
    );
  }

  // Show network fallback if offline or poor connection
  if (!isOnline || connectionQuality === 'offline') {
    return (
      <div className={cn("flex-1 flex flex-col", className)}>
        <NetworkFallback
          isOnline={isOnline}
          connectionQuality={connectionQuality}
          onRetry={testConnectionQuality}
          retrying={false}
        />
      </div>
    );
  }

  // Show enhanced error state if there's a persistent error
  if (error && !messages.length) {
    return (
      <div className={cn("flex-1 flex flex-col", className)}>
        <FailedOperationAlert
          error={error}
          onRetry={handleConnectionRetry}
          retryCount={connectionRetryCount}
          operation="connect to chat"
          className="m-6"
        />
      </div>
    );
  }

  return (
    <ChatErrorBoundary
      onError={handleChatError}
      onReset={refreshMessages}
    >
      <div className={cn("flex-1 flex flex-col min-h-0", className)}>
        {/* Skip link for keyboard navigation */}
        <a 
          href="#message-input"
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            focusMessageInput();
          }}
        >
          Skip to message input
        </a>
        
        {/* Chat Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur-optimized px-3 sm:px-4 lg:px-6 py-3 sm:py-4 shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  Team Chat
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {team?.teamName} • {hackathon?.title}
                </p>
              </div>
            </div>
            
            {/* Enhanced connection status indicator with retry functionality */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 text-xs sm:text-sm text-muted-foreground shrink-0">
              {/* Keyboard shortcuts help */}
              <ChatKeyboardShortcuts 
                shortcuts={shortcuts}
                className="hidden sm:flex"
              />
              
              {/* Enhanced connection status with retry */}
              <ConnectionStatusWithRetry
                status={connectionStatus}
                onRetry={handleConnectionRetry}
                lastError={error}
                retryCount={connectionRetryCount}
                className="flex items-center space-x-1 sm:space-x-2"
              />
              
              {typingUsers.size > 0 && (
                <span 
                  className="text-xs text-muted-foreground/75 hidden lg:inline"
                  aria-live="polite"
                  aria-label={`${typingUsers.size} ${typingUsers.size === 1 ? 'person is' : 'people are'} typing`}
                >
                  • {typingUsers.size} typing
                </span>
              )}
            </div>
          </div>

          {/* Error banner (if there's an error but messages are still available) */}
          {error && messages.length > 0 && (
            <Alert variant="destructive" className="mt-3" role="alert" aria-live="assertive">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm">{error}</span>
                <Button 
                  onClick={refreshMessages}
                  variant="outline"
                  size="sm"
                  className="touch-target self-start sm:self-auto"
                  aria-label="Reconnect to chat"
                >
                  Reconnect
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Messages Area */}
        <MessageList
          messages={messages}
          loading={false}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMoreMessages}
          currentUserId={user?.$id}
          typingUsers={typingUsers}
          onRetryMessage={retryFailedMessage}
          className="flex-1 min-h-0"
        />

        {/* Message Input */}
        <MessageInput
          onSendMessage={sendMessage}
          onTyping={sendTypingIndicator}
          onStopTyping={stopTypingIndicator}
          disabled={connectionStatus === 'disconnected'}
          sending={sending}
          className="shrink-0"
        />

        {/* COMPLETELY REMOVED: All notification components */}
        
        {/* Retry queue manager */}
        {retryQueue.length > 0 && (
          <RetryQueueManager
            retryQueue={retryQueue}
            onRetryItem={handleRetryQueueItem}
            onClearQueue={handleClearRetryQueue}
          />
        )}

        {/* Auto-retry manager */}
        {(autoRetryEnabled || connectionRetryCount > 0) && (
          <AutoRetryManager
            enabled={autoRetryEnabled}
            onToggle={() => setAutoRetryEnabled(!autoRetryEnabled)}
            currentAttempt={connectionRetryCount}
            maxAttempts={3}
            className="fixed bottom-4 right-4"
          />
        )}
      </div>
    </ChatErrorBoundary>
  );
};

export default ChatContainer;