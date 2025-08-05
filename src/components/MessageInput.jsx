import { useState } from 'react';

const MessageInput = ({ onSendMessage, disabled = false, sending = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate message content
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || sending) {
      return;
    }

    // Send message and clear input
    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Check if send button should be disabled
  const isSendDisabled = !message.trim() || disabled || sending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-2">
      <div className="flex-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || sending}
          className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          style={{ fontSize: '16px' }} // Prevents zoom on iOS
        />
      </div>
      <button
        type="submit"
        disabled={isSendDisabled}
        className="px-4 py-3 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[60px] min-h-[48px] touch-manipulation font-medium"
      >
        {sending ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <span className="text-sm sm:text-base">Send</span>
        )}
      </button>
    </form>
  );
};

export default MessageInput;