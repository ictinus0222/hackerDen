import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { userNameService } from '../services/userNameService';
import { useAuth } from '../hooks/useAuth';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const MessageItem = ({ message, currentUserId }) => {
  const { user } = useAuth();
  const { members } = useTeamMembers();
  const isSystemMessage = message.type === 'system';
  const isOwnMessage = message.userId === currentUserId;
  const [senderName, setSenderName] = useState(message.userName || 'Team Member');

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  // Get the actual user name
  useEffect(() => {
    const getUserName = async () => {
      if (isOwnMessage) {
        setSenderName('You');
        return;
      }

      if (message.userId && message.userId !== 'system') {
        // First try to find the user in the team members list
        const teamMember = members.find(member => member.id === message.userId);
        if (teamMember && teamMember.name && teamMember.name !== 'Team Member') {
          setSenderName(teamMember.name);
          return;
        }

        // If not found in team members, try the user name service
        try {
          const name = await userNameService.getUserName(message.userId, user);
          if (name && name !== 'Team Member') {
            setSenderName(name);
          } else {
            // Last resort: use a more descriptive fallback
            setSenderName(`User ${message.userId.slice(-4)}`);
          }
        } catch (error) {
          console.warn('Could not get user name:', error);
          setSenderName(`User ${message.userId.slice(-4)}`);
        }
      }
    };

    getUserName();
  }, [message.userId, message.userName, isOwnMessage, user, members]);

  if (isSystemMessage) {
    // Different styling based on system message type
    let cardVariant = 'default';
    let textColor = 'text-muted-foreground';
    let icon = '🔔';

    if (message.type === 'task_created') {
      cardVariant = 'outline';
      textColor = 'text-blue-300';
      icon = '📝';
    } else if (message.type === 'task_status_changed') {
      cardVariant = 'outline';
      textColor = 'text-green-300';
      icon = '🔄';
    }

    return (
      <div className="flex justify-center my-3" role="status" aria-live="polite">
        <Card variant={cardVariant} className="max-w-xs sm:max-w-md">
          <CardContent className={`${textColor} text-xs sm:text-sm p-3 text-center flex items-center gap-2 justify-center`}>
            <span aria-hidden="true">{icon}</span>
            <span>{message.content}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`flex mb-3 sm:mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      role="article"
      aria-label={`Message from ${isOwnMessage ? 'you' : (message.userName || 'team member')}`}
    >
      <div className={`flex items-end space-x-2 max-w-[320px] sm:max-w-sm lg:max-w-lg ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <Avatar className={`w-8 h-8 flex-shrink-0 ${isOwnMessage
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
          <AvatarFallback className={`text-xs font-bold text-white ${isOwnMessage
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
            {isOwnMessage
              ? 'You'[0]
              : senderName[0].toUpperCase()
            }
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <Card className={`${isOwnMessage
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500/20'
            : 'bg-background-sidebar border-white/10'
            } shadow-md`}>
            <CardContent className="px-3 sm:px-4 py-2">
              <p className="text-sm leading-relaxed text-white">{message.content}</p>
            </CardContent>
          </Card>
          <div className={`text-xs text-dark-tertiary mt-1 px-1 flex items-center ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="font-medium">
              {isOwnMessage ? 'You' : senderName}
            </span>
            <span className="mx-1">•</span>
            <time
              dateTime={message.$createdAt}
              title={new Date(message.$createdAt).toLocaleString()}
            >
              {formatTime(message.$createdAt)}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;