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
        <label htmlFor="message-input" className="sr-only">
          Type your message
        </label>
        <input
          id="message-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || sending}
          className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm rounded-xl bg-background-sidebar text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ring-1 ring-white/10 hover:ring-green-500/30 focus:ring-green-500 transition-all duration-200"
          style={{ fontSize: '16px' }} // Prevents zoom on iOS
          aria-describedby={sending ? "sending-status" : undefined}
          maxLength={1000}
        />
      </div>
      <button
        type="submit"
        disabled={isSendDisabled}
        className="px-5 py-3 sm:py-2 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background-card disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] min-h-[48px] touch-manipulation font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
        aria-label={sending ? "Sending message..." : "Send message"}
      >
        {sending ? (
          <>
            <div className="flex items-center justify-center" aria-hidden="true">
              <div className="spinner w-4 h-4 text-white"></div>
            </div>
            <span id="sending-status" className="sr-only">Sending message...</span>
          </>
        ) : (
          <span className="text-sm sm:text-base">Send</span>
        )}
      </button>
    </form>
  );
};

export default MessageInput;