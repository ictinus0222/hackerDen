import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import VirtualizedMessageList from './VirtualizedMessageList';
import { useScrollOptimization } from '../hooks/useScrollOptimization';
import { cn } from '../lib/utils.ts';

const MessageList = ({ 
  messages = [], 
  loading = false, 
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  currentUserId,
  typingUsers = new Set(),
  onRetryMessage,
  className,
  enableVirtualization = true // New prop to enable/disable virtualization
}) => {
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const loadMoreThreshold = 100; // pixels from top to trigger load more

  // Enhanced scroll position management during real-time updates
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // If new messages were added and user should auto-scroll
    if (messages.length > previousMessageCount && shouldAutoScroll) {
      // Smooth scroll to bottom for new messages
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (messages.length > previousMessageCount && !shouldAutoScroll) {
      // Maintain scroll position when loading older messages
      const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement && scrollPosition > 0) {
        // Calculate new scroll position to maintain visual position
        const newScrollTop = scrollElement.scrollHeight - scrollPosition;
        scrollElement.scrollTop = Math.max(0, newScrollTop);
      }
    }

    setPreviousMessageCount(messages.length);
  }, [messages, shouldAutoScroll, scrollPosition, previousMessageCount]);

  // Enhanced scroll handling with performance optimization
  const handleScrollInternal = useCallback((e) => {
    const scrollElement = e.target;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    
    // Store current scroll position for position management
    setScrollPosition(scrollHeight - scrollTop);
    
    // Determine if user is near bottom (within 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShouldAutoScroll(isNearBottom);
    setShowScrollToBottom(!isNearBottom && messages.length > 0);

    // Enhanced load more logic - trigger when near top and not already loading
    const isNearTop = scrollTop < loadMoreThreshold;
    if (isNearTop && hasMore && !loadingMore && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true);
      
      // Store current scroll position before loading more messages
      const currentScrollHeight = scrollHeight;
      
      onLoadMore().then(() => {
        // After loading, maintain scroll position
        setTimeout(() => {
          const newScrollHeight = scrollElement.scrollHeight;
          const scrollDiff = newScrollHeight - currentScrollHeight;
          if (scrollDiff > 0) {
            scrollElement.scrollTop = scrollTop + scrollDiff;
          }
          setIsLoadingMore(false);
        }, 100);
      }).catch(() => {
        setIsLoadingMore(false);
      });
    }
  }, [hasMore, loadingMore, isLoadingMore, onLoadMore, messages.length, loadMoreThreshold]);

  // Optimized scroll handler using throttling
  const handleScroll = useScrollOptimization(handleScrollInternal, 16);

  const scrollToBottom = useCallback(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
      setShouldAutoScroll(true);
      setShowScrollToBottom(false);
    }
  }, []);

  // Memoized unread message count for performance
  const unreadCount = useMemo(() => {
    if (shouldAutoScroll) return 0;
    
    // Count messages that are below current scroll position
    // This is a simplified approach - in a real app you'd track read status
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollElement) return 0;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    return isAtBottom ? 0 : Math.min(messages.length - previousMessageCount, 99);
  }, [shouldAutoScroll, messages.length, previousMessageCount]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="px-4 py-2 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-3 px-4">
        <div className="w-16 h-16 mx-auto text-muted-foreground/50">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground">Start the conversation</h3>
        <p className="text-muted-foreground max-w-sm">
          Send your first message to get the team chat started!
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cn("flex-1 flex flex-col", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!loading && messages.length === 0) {
    return (
      <div className={cn("flex-1 flex flex-col", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col relative", className)}>
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 messages-scroll-area"
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="flex flex-col">
          {/* Enhanced load more indicator */}
          {(loadingMore || isLoadingMore) && (
            <div 
              className="flex justify-center py-4 animate-in fade-in-0 duration-200"
              role="status"
              aria-live="polite"
              aria-label="Loading earlier messages"
            >
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground bg-background/80 backdrop-blur-optimized px-3 py-2 rounded-full border shadow-sm">
                <div 
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span>Loading earlier messages...</span>
              </div>
            </div>
          )}

          {/* Enhanced beginning of conversation indicator */}
          {!hasMore && messages.length > 0 && !(loadingMore || isLoadingMore) && (
            <div className="flex justify-center py-6 animate-in fade-in-0 duration-300">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border">
                  This is the beginning of your team conversation
                </div>
                <p className="text-xs text-muted-foreground/75 max-w-xs">
                  All messages from this point forward will be visible to your team members
                </p>
              </div>
            </div>
          )}

          {/* No more messages indicator when scrolled to top */}
          {!hasMore && messages.length === 0 && !loading && (
            <div className="flex justify-center py-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">No messages yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Start the conversation with your team members
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages with optional virtualization */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 px-2 sm:px-3 lg:px-4 py-2 overscroll-behavior-y-contain"
          >
            {enableVirtualization && messages.length > 100 ? (
              <VirtualizedMessageList
                messages={messages}
                currentUserId={currentUserId}
                onRetryMessage={onRetryMessage}
                className="space-y-2"
              />
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageItem
                    key={message.$id}
                    message={message}
                    isCurrentUser={message.userId === currentUserId}
                    onRetry={onRetryMessage}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Typing Indicator */}
          <TypingIndicator 
            typingUsers={typingUsers}
            currentUserId={currentUserId}
            className="px-2 sm:px-3 lg:px-4"
            aria-live="polite"
            aria-label="Typing indicators"
          />

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Enhanced scroll to bottom button with unread count */}
      {showScrollToBottom && (
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 animate-in slide-in-from-bottom-2 duration-200">
          <Button
            onClick={scrollToBottom}
            size="sm"
            variant="outline"
            className="touch-target rounded-full shadow-lg bg-background/95 backdrop-blur-optimized border-border/50 hover:bg-accent/50 focus:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative chat-transition"
            aria-label={`Scroll to bottom${unreadCount > 0 ? `. ${unreadCount} unread messages` : ''}`}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {unreadCount > 0 && (
              <div 
                className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1 font-medium"
                aria-hidden="true"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageList;