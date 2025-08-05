import { formatDistanceToNow } from 'date-fns';

const MessageItem = ({ message, currentUserId }) => {
  const isSystemMessage = message.type === 'system';
  const isOwnMessage = message.userId === currentUserId;
  
  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  if (isSystemMessage) {
    // Different styling based on system message type
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-600';
    let borderColor = 'border-gray-200';
    let icon = '🔔';
    
    if (message.type === 'task_created') {
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-200';
      icon = '✨';
    } else if (message.type === 'task_status_changed') {
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-200';
      icon = '✅';
    }
    
    return (
      <div className="flex justify-center my-3" role="status" aria-live="polite">
        <div className={`${bgColor} ${textColor} text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full max-w-xs sm:max-w-md text-center border border-opacity-20 ${borderColor} flex items-center gap-2`}>
          <span aria-hidden="true">{icon}</span>
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex mb-3 sm:mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      role="article"
      aria-label={`Message from ${isOwnMessage ? 'you' : (message.userName || 'team member')}`}
    >
      <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-3 sm:px-4 py-2 rounded-lg break-words shadow-sm ${
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className={`text-xs text-gray-500 mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          <span className="font-medium">
            {isOwnMessage ? 'You' : (message.userName || 'Team Member')}
          </span>
          <time 
            dateTime={message.$createdAt}
            className="ml-2"
            title={new Date(message.$createdAt).toLocaleString()}
          >
            {formatTime(message.$createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;