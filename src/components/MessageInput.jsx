import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

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
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <label htmlFor="message-input" className="sr-only">
            Type your message
          </label>
          <Textarea
            id="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || sending}
            className="w-full min-h-[48px] max-h-32 resize-none rounded-xl bg-background-sidebar text-white placeholder-dark-tertiary shadow-md ring-1 ring-white/10 hover:ring-green-500/30 focus:ring-green-500 transition-all duration-200 pr-12"
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
            aria-describedby={sending ? "sending-status" : undefined}
            maxLength={1000}
            rows={1}
          />
          <Button
            type="submit"
            disabled={isSendDisabled}
            size="sm"
            className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
            aria-label={sending ? "Sending message..." : "Send message"}
          >
            {sending ? (
              <div className="flex items-center justify-center" aria-hidden="true">
                <div className="spinner w-3 h-3 text-white"></div>
              </div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            {sending && <span id="sending-status" className="sr-only">Sending message...</span>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;