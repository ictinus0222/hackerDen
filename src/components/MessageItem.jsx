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
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          <span className="font-medium">
            {isOwnMessage ? 'You' : (message.userName || 'Team Member')}
          </span>
          <span className="ml-2">{formatTime(message.$createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;