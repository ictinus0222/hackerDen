import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils.ts';
import MessageItem from './MessageItem';

// Simple virtualization for message lists to improve performance
const VirtualizedMessageList = ({ 
  messages = [], 
  currentUserId,
  onRetryMessage,
  className,
  itemHeight = 80, // Estimated height per message
  overscan = 5 // Number of items to render outside visible area
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!containerHeight || messages.length === 0) {
      return { start: 0, end: messages.length };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(messages.length, start + visibleCount + overscan * 2);

    return { start, end };
  }, [scrollTop, containerHeight, itemHeight, overscan, messages.length]);

  // Get visible messages
  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.start, visibleRange.end);
  }, [messages, visibleRange]);

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Update container height on resize and mount
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight || containerRef.current.getBoundingClientRect().height;
        setContainerHeight(height);
      }
    };

    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(updateHeight, 0);
    
    window.addEventListener('resize', updateHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Total height of all messages
  const totalHeight = messages.length * itemHeight;

  // Offset for visible messages
  const offsetY = visibleRange.start * itemHeight;

  // Only use virtualization for large message lists (>100 messages)
  if (messages.length <= 100) {
    return (
      <div className={cn("space-y-2", className)}>
        {messages.map((message) => (
          <MessageItem
            key={message.$id}
            message={message}
            isCurrentUser={message.userId === currentUserId}
            onRetry={onRetryMessage}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible messages container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div className="space-y-2">
            {visibleMessages.map((message, index) => (
              <MessageItem
                key={message.$id}
                message={message}
                isCurrentUser={message.userId === currentUserId}
                onRetry={onRetryMessage}
                style={{ minHeight: itemHeight }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedMessageList;