import { useEffect, useCallback } from 'react';

/**
 * Custom hook for chat keyboard navigation and accessibility
 * Provides keyboard shortcuts and navigation for chat functionality
 */
export const useChatKeyboardNavigation = ({
  onSendMessage,
  onScrollToBottom,
  onScrollToTop,
  onFocusInput,
  onMarkAsRead,
  disabled = false
}) => {
  const handleKeyDown = useCallback((event) => {
    if (disabled) return;

    // Don't interfere with input fields or when modifiers are pressed
    if (
      event.target.tagName === 'INPUT' || 
      event.target.tagName === 'TEXTAREA' ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    switch (event.key) {
      case '/':
        // Focus message input
        event.preventDefault();
        onFocusInput?.();
        break;
        
      case 'j':
      case 'ArrowDown':
        // Scroll down
        event.preventDefault();
        onScrollToBottom?.();
        break;
        
      case 'k':
      case 'ArrowUp':
        // Scroll up
        event.preventDefault();
        onScrollToTop?.();
        break;
        
      case 'g':
        // Go to bottom (like Gmail)
        event.preventDefault();
        onScrollToBottom?.();
        break;
        
      case 'r':
        // Mark as read
        event.preventDefault();
        onMarkAsRead?.();
        break;
        
      case '?':
        // Toggle keyboard shortcuts help
        event.preventDefault();
        const shortcutsButton = document.querySelector('[aria-label="Show keyboard shortcuts"]');
        if (shortcutsButton) {
          shortcutsButton.click();
        }
        break;
        
      case 'Escape':
        // Clear focus from any focused element
        event.preventDefault();
        document.activeElement?.blur();
        break;
        
      default:
        break;
    }
  }, [disabled, onSendMessage, onScrollToBottom, onScrollToTop, onFocusInput, onMarkAsRead]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return keyboard shortcut info for help/accessibility
  const shortcuts = {
    '/': 'Focus message input',
    'j or ↓': 'Scroll down',
    'k or ↑': 'Scroll up', 
    'g': 'Go to bottom',
    'r': 'Mark messages as read',
    'Escape': 'Clear focus'
  };

  return { shortcuts };
};

/**
 * Hook for managing focus within chat components
 * Ensures proper focus management for accessibility
 */
export const useChatFocusManagement = () => {
  const focusMessageInput = useCallback(() => {
    const messageInput = document.querySelector('[aria-label="Message input"]');
    if (messageInput) {
      messageInput.focus();
    }
  }, []);

  const focusScrollToBottom = useCallback(() => {
    const scrollButton = document.querySelector('[aria-label*="Scroll to bottom"]');
    if (scrollButton) {
      scrollButton.focus();
    }
  }, []);

  const focusFirstMessage = useCallback(() => {
    const firstMessage = document.querySelector('[role="log"] [role="article"]:first-child');
    if (firstMessage) {
      firstMessage.focus();
    }
  }, []);

  const focusLastMessage = useCallback(() => {
    const lastMessage = document.querySelector('[role="log"] [role="article"]:last-child');
    if (lastMessage) {
      lastMessage.focus();
    }
  }, []);

  return {
    focusMessageInput,
    focusScrollToBottom,
    focusFirstMessage,
    focusLastMessage
  };
};