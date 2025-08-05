import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import LoadingSpinner from './LoadingSpinner';
import { MessageSkeleton } from './SkeletonLoader';

const MessageList = ({ messages, loading, currentUserId }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 px-3 sm:px-4 py-2 space-y-2">
        <MessageSkeleton />
        <MessageSkeleton isOwn={true} />
        <MessageSkeleton />
        <MessageSkeleton isOwn={true} />
        <MessageSkeleton />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" role="status">
        <div className="text-center text-gray-500 p-4">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300" aria-hidden="true">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <p className="text-lg mb-2 font-medium">No messages yet</p>
          <p className="text-sm">Start the conversation with your team!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 space-y-2 overscroll-behavior-y-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      {messages.map((message) => (
        <MessageItem
          key={message.$id}
          message={message}
          currentUserId={currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;