import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils.ts';

const MessageInput = ({ onSendMessage, onTyping, onStopTyping, disabled = false, sending = false, className }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !sending && !disabled) {
      // Stop typing indicator before sending
      onStopTyping?.();
      
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Send typing indicator when user starts typing
    if (newValue.trim() && !sending && !disabled) {
      onTyping?.();
    } else if (!newValue.trim()) {
      onStopTyping?.();
    }
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className={cn("border-t border-border bg-background p-3 sm:p-4", className)}>
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row gap-2 sm:gap-2"
        role="form"
        aria-label="Send message form"
      >
        <div className="flex-1">
          <Textarea
            id="message-input"
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Chat is disabled" : "Type your message..."}
            disabled={disabled || sending}
            className="min-h-[44px] max-h-[120px] resize-none touch-target keyboard-focus"
            rows={1}
            aria-label="Message input"
            aria-describedby="message-help"
            aria-invalid={false}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || sending || disabled}
          className="sm:self-end h-[44px] px-4 sm:px-6 touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 chat-transition"
          aria-label={sending ? "Sending message" : "Send message"}
        >
          {sending ? (
            <>
              <div 
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Sending...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-4 h-4 mr-1 sm:mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="hidden sm:inline">Send</span>
              <span className="sm:hidden sr-only">Send message</span>
            </>
          )}
        </Button>
      </form>
      
      {/* Helper text */}
      <p 
        id="message-help"
        className="text-xs text-muted-foreground mt-2 px-1 hidden sm:block"
        aria-live="polite"
      >
        Press Enter to send, Shift+Enter for new line
      </p>
      
      {/* Mobile helper text */}
      <p 
        className="text-xs text-muted-foreground mt-2 px-1 sm:hidden"
        aria-live="polite"
      >
        Tap Send to send message
      </p>
    </div>
  );
};

export default MessageInput;