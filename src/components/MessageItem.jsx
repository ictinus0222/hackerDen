import { useState, useEffect } from 'react';
import { cn } from '../lib/utils.ts';
import { userNameService } from '../services/userNameService';
import { useAuth } from '../hooks/useAuth';
import { Badge } from './ui/badge';
import PollDisplay from './PollDisplay';
import ReactionButton from './ReactionButton';
import { useHackathonTeam } from '../hooks/useHackathonTeam';

const MessageItem = ({ message, isCurrentUser = false, className, onRetry, onPollVoteUpdate, onTaskCreated }) => {
  const { user } = useAuth();
  const { team } = useHackathonTeam(message.hackathonId);
  const [userName, setUserName] = useState('');
  const [pollData, setPollData] = useState(null);
  const isSystemMessage = message.type !== 'user';
  const isPollMessage = message.type === 'poll_created' && message.systemData?.type === 'poll';

  // Resolve user name from userId
  useEffect(() => {
    if (isSystemMessage || isCurrentUser) {
      setUserName(isCurrentUser ? 'You' : '');
      return;
    }

    if (message.userId) {
      userNameService.getUserName(message.userId, user)
        .then(name => setUserName(name))
        .catch(() => setUserName('Team Member'));
    } else {
      setUserName('Team Member');
    }
  }, [message.userId, user, isCurrentUser, isSystemMessage]);

  // Load poll data for poll messages
  useEffect(() => {
    if (isPollMessage && message.systemData?.pollId) {
      const loadPollData = async () => {
        try {
          const pollService = (await import('../services/pollService')).default;
          const poll = await pollService.getPollResults(message.systemData.pollId);
          setPollData(poll);
        } catch (error) {
          console.error('Error loading poll data for message:', error);
        }
      };

      loadPollData();
    }
  }, [isPollMessage, message.systemData?.pollId]);
  
  // System message styling based on type - updated to match your dark theme
  const getSystemMessageStyle = (type) => {
    const baseStyle = "bg-card/50 border-border/50 text-card-foreground/80";
    
    const styles = {
      // Task-related system messages
      'task_created': `${baseStyle} border-l-4 border-l-blue-500/60`,
      'task_status_changed': `${baseStyle} border-l-4 border-l-yellow-500/60`, 
      'task_completed': `${baseStyle} border-l-4 border-l-green-500/60`,
      
      // Vault-related system messages
      'vault_secret_added': `${baseStyle} border-l-4 border-l-purple-500/60`,
      'vault_secret_updated': `${baseStyle} border-l-4 border-l-orange-500/60`,
      'vault_secret_deleted': `${baseStyle} border-l-4 border-l-red-500/60`,
      
      // Poll-related system messages
      'poll_created': `${baseStyle} border-l-4 border-l-purple-500/60`,
      'poll_voted': `${baseStyle} border-l-4 border-l-indigo-500/60`,
      'poll_ended': `${baseStyle} border-l-4 border-l-green-500/60`,
      'poll_converted_to_task': `${baseStyle} border-l-4 border-l-blue-500/60`,
      
      // Bot-related system messages
      'bot_message': `${baseStyle} border-l-4 border-l-emerald-500/60 bg-emerald-50/5`,
      'bot_tip': `${baseStyle} border-l-4 border-l-blue-500/60 bg-blue-50/5`,
      'bot_easter_egg': `${baseStyle} border-l-4 border-l-pink-500/60 bg-pink-50/5`,
      'bot_contextual': `${baseStyle} border-l-4 border-l-amber-500/60 bg-amber-50/5`,
      'bot_help': `${baseStyle} border-l-4 border-l-cyan-500/60 bg-cyan-50/5`,
      'bot_reminder_scheduled': `${baseStyle} border-l-4 border-l-violet-500/60 bg-violet-50/5`,
      
      // Default system message
      'system': `${baseStyle} border-l-4 border-l-muted-foreground/40`
    };
    
    return styles[type] || styles.system;
  };

  // Get appropriate icon for system message type
  const getSystemMessageIcon = (type) => {
    const icons = {
      'task_created': '📝',
      'task_status_changed': '🔄',
      'task_completed': '✅',
      'vault_secret_added': '🔐',
      'vault_secret_updated': '🔄',
      'vault_secret_deleted': '🗑️',
      'poll_created': '📊',
      'poll_voted': '🗳️',
      'poll_ended': '📊',
      'poll_converted_to_task': '📊➡️📝',
      'bot_message': '🤖',
      'bot_tip': '💡',
      'bot_easter_egg': '🎉',
      'bot_contextual': '🌟',
      'bot_help': '❓',
      'bot_reminder_scheduled': '📅',
      'system': '💬'
    };
    
    return icons[type] || icons.system;
  };

  // Get accessibility label for system message type
  const getSystemMessageLabel = (type) => {
    const labels = {
      'task_created': 'Task created notification',
      'task_status_changed': 'Task status changed notification',
      'task_completed': 'Task completed notification',
      'vault_secret_added': 'Vault secret added notification',
      'vault_secret_updated': 'Vault secret updated notification',
      'vault_secret_deleted': 'Vault secret deleted notification',
      'poll_created': 'Poll created notification',
      'poll_voted': 'Poll vote notification',
      'poll_ended': 'Poll ended notification',
      'poll_converted_to_task': 'Poll converted to task notification',
      'bot_message': 'Bot message',
      'bot_tip': 'Bot tip',
      'bot_easter_egg': 'Bot easter egg',
      'bot_contextual': 'Bot contextual message',
      'bot_help': 'Bot help message',
      'bot_reminder_scheduled': 'Bot reminder scheduled',
      'system': 'System notification'
    };
    
    return labels[type] || labels.system;
  };

  if (isSystemMessage) {
    const messageIcon = getSystemMessageIcon(message.type);
    const accessibilityLabel = getSystemMessageLabel(message.type);
    
    return (
      <div 
        className={cn(
          "mx-2 sm:mx-4 my-2 p-3 sm:p-4 rounded-lg text-sm transition-all duration-200 hover:bg-card/70",
          getSystemMessageStyle(message.type),
          className
        )}
        aria-live="polite"
        role="status"
        aria-label={accessibilityLabel}
        tabIndex={0}
      >
        <div className="flex items-start space-x-2 sm:space-x-3">
          <span 
            className="text-base sm:text-lg leading-none flex-shrink-0 mt-0.5"
            aria-hidden="true"
            role="img"
            aria-label={`${accessibilityLabel} icon`}
          >
            {messageIcon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
            
            {/* Interactive poll display for poll creation messages */}
            {isPollMessage && pollData && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <PollDisplay
                  poll={pollData.poll}
                  onVoteUpdate={onPollVoteUpdate}
                  onTaskCreated={onTaskCreated}
                  showResults={pollData.isExpired}
                  showExport={false}
                  showTaskConversion={true}
                  compact={true}
                />
              </div>
            )}
            
            {/* System message metadata */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
              <div className="flex items-center space-x-2">
                {message.type?.startsWith('bot_') ? (
                  <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    🤖 Bot
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    System
                  </span>
                )}
              </div>
              <time 
                className="text-xs text-muted-foreground"
                dateTime={message.$createdAt}
              >
                {new Date(message.$createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </time>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular user message - restored to original compact bubble style
  const messageTime = new Date(message.$createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div 
      className={cn(
        "flex mb-3 sm:mb-4 px-2 sm:px-4",
        isCurrentUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div className={cn(
        "flex items-end space-x-2 max-w-xs sm:max-w-sm",
        isCurrentUser && "flex-row-reverse space-x-reverse"
      )}>
        {/* User Avatar */}
        <div className={cn(
          "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0",
          isCurrentUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {(userName || 'U').charAt(0).toUpperCase()}
        </div>
        
        {/* Message Bubble */}
        <div className="flex flex-col">
          {/* User Name and Time (only show for other users) */}
          {!isCurrentUser && (
            <div className="mb-1 px-1">
              <span className="text-xs text-muted-foreground">
                {userName || 'Team Member'}
              </span>
            </div>
          )}
          
          {/* Message Content */}
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm break-words",
            isCurrentUser 
              ? "bg-primary text-primary-foreground rounded-br-sm" 
              : "bg-muted text-muted-foreground rounded-bl-sm"
          )}>
            {message.content}
          </div>
          
          {/* Reactions */}
          <div className="mt-1 px-1">
            <ReactionButton
              targetId={message.$id}
              targetType="message"
              teamId={team?.$id}
              compact={true}
              className="justify-start"
            />
          </div>
          
          {/* Time and Status */}
          <div className={cn(
            "mt-1 px-1 flex items-center space-x-2",
            isCurrentUser ? "justify-end" : "justify-start"
          )}>
            <time className="text-xs text-muted-foreground/75">
              {messageTime}
            </time>
            
            {/* Message Status */}
            {message.isFailed && (
              <>
                <span className="text-xs text-destructive">Failed</span>
                {onRetry && (
                  <button
                    onClick={() => onRetry(message.$id)}
                    className="text-xs text-primary hover:text-primary/80 underline"
                  >
                    Retry
                  </button>
                )}
              </>
            )}
            
            {message.isOptimistic && (
              <span className="text-xs text-muted-foreground/75">
                Sending...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;