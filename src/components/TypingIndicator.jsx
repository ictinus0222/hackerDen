import { Badge } from './ui/badge';
import { cn } from '../lib/utils.ts';

const TypingIndicator = ({ typingUsers = [], currentUserId, className }) => {
  // Filter out current user from typing users
  const otherTypingUsers = Array.from(typingUsers).filter(userId => userId !== currentUserId);
  
  if (otherTypingUsers.length === 0) {
    return null;
  }

  // Create display text based on number of typing users
  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return 'Someone is typing...';
    } else if (otherTypingUsers.length === 2) {
      return '2 people are typing...';
    } else {
      return `${otherTypingUsers.length} people are typing...`;
    }
  };

  return (
    <div className={cn("px-4 py-2", className)}>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="text-xs">
          <div className="flex items-center space-x-2">
            {/* Animated typing dots */}
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>{getTypingText()}</span>
          </div>
        </Badge>
      </div>
    </div>
  );
};

export default TypingIndicator;