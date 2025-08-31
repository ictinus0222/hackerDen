import React from 'react';
import { Skeleton } from './ui/skeleton';

const TypingIndicator = ({ users = [], className = '' }) => {
  if (!users || users.length === 0) {
    return null;
  }

  const getUsersText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else if (users.length === 3) {
      return `${users[0]}, ${users[1]}, and ${users[2]} are typing...`;
    } else {
      return `${users[0]}, ${users[1]}, and ${users.length - 2} others are typing...`;
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 sm:px-4 py-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        </div>
      </div>
      <span className="text-sm text-dark-tertiary italic">
        {getUsersText()}
      </span>
    </div>
  );
};

/**
 * Enhanced message loading skeleton with proper spacing
 */
export const MessageSkeleton = ({ isOwn = false, showAvatar = true, className = '' }) => {
  return (
    <div
      className={`flex mb-3 sm:mb-4 ${isOwn ? 'justify-end' : 'justify-start'} ${className}`}
    >
      <div className={`flex items-end space-x-2 max-w-[320px] sm:max-w-sm lg:max-w-lg ${
        isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      }`}>
        {/* Avatar Skeleton */}
        {showAvatar && (
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        )}

        {/* Message Content Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="p-3 rounded-lg">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className={`mt-1 px-1 flex items-center space-x-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading skeleton for task cards
 */
export const TaskSkeleton = ({ className = '' }) => {
  return (
    <div className={`p-4 border rounded-lg space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
};

/**
 * Loading skeleton for chat list
 */
export const ChatLoadingSkeleton = ({ count = 5, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <MessageSkeleton 
          key={index} 
          isOwn={index % 2 === 0} 
          showAvatar={true}
        />
      ))}
    </div>
  );
};

/**
 * Loading skeleton for kanban board
 */
export const KanbanLoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
      {['To Do', 'In Progress', 'Blocked', 'Done'].map((status, columnIndex) => (
        <div key={status} className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, taskIndex) => (
                <TaskSkeleton key={taskIndex} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TypingIndicator;
