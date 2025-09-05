/**
 * @fileoverview Enhanced Message Input with Easter Egg Command Processing
 * Integrates with existing chat system to detect and process easter egg commands
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send } from 'lucide-react';
import { CustomTooltip, ChatTooltip } from './CustomTooltip';
import { useEasterEggs } from './EasterEggTrigger';
import { useEasterEggStats } from './EasterEggAchievements';
import botService from '../services/botService';

/**
 * Enhanced Message Input Component
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Function to send regular messages
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.placeholder - Input placeholder text
 * @param {Object} props.inputProps - Additional props for input element
 */
export const EasterEggMessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message... or try /party, /celebrate, /coffee",
  inputProps = {},
  ...props
}) => {
  const [message, setMessage] = useState('');
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [showCommandHints, setShowCommandHints] = useState(false);
  const inputRef = useRef(null);
  
  const { processCommand } = useEasterEggs();
  const { updateStats } = useEasterEggStats();

  // Known easter egg commands for hints
  const KNOWN_COMMANDS = [
    '/party', '/celebrate', '/coffee', '/pizza', '/rocket', '/magic',
    '/ninja', '/unicorn', '/spooky', '/ghost', '/santa', '/fireworks',
    '/joke', '/love', '/lucky', '/konami', '/hackerman', '/42'
  ];

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isProcessingCommand) {
      return;
    }

    const trimmedMessage = message.trim();
    
    // Check if it's an easter egg command
    if (trimmedMessage.startsWith('/')) {
      await handleEasterEggCommand(trimmedMessage);
    } else {
      // Send regular message
      if (onSendMessage) {
        await onSendMessage(trimmedMessage);
      }
    }
    
    setMessage('');
    setShowCommandHints(false);
  };

  // Handle easter egg command processing
  const handleEasterEggCommand = async (command) => {
    setIsProcessingCommand(true);
    
    try {
      // Add to command history
      setCommandHistory(prev => {
        const newHistory = [command, ...prev.filter(cmd => cmd !== command)].slice(0, 10);
        return newHistory;
      });

      // Check if it's a special date command first
      let handled = false;
      if (typeof window !== 'undefined' && window.handleSpecialDateCommand) {
        handled = await window.handleSpecialDateCommand(command);
      }

      // If not handled by special date, try regular easter egg processing
      if (!handled) {
        const result = await processCommand(command);
        
        if (result && result.found) {
          // Update easter egg stats
          const currentStats = JSON.parse(localStorage.getItem(`easterEggStats_${Date.now()}`) || '{}');
          const commandCounts = currentStats.commandCounts || {};
          const uniqueCommands = new Set([...Object.keys(commandCounts), command]).size;
          
          updateStats({
            easterEggsFound: (currentStats.easterEggsFound || 0) + 1,
            commandCounts: {
              ...commandCounts,
              [command]: (commandCounts[command] || 0) + 1
            },
            totalCelebrations: (currentStats.totalCelebrations || 0) + 1,
            uniqueCommands,
            secretCommandsFound: result.secret ? (currentStats.secretCommandsFound || 0) + 1 : (currentStats.secretCommandsFound || 0)
          });
          
          handled = true;
        }
      }

      // If command wasn't recognized, show helpful message
      if (!handled) {
        // Check if it's close to a known command
        const suggestion = findSimilarCommand(command);
        
        if (suggestion) {
          // Show suggestion through bot service
          await botService.sendMotivationalMessage(
            'system',
            'system',
            `🤔 Hmm, I don't recognize "${command}". Did you mean "${suggestion}"? Try it!`
          );
        } else {
          // Show general help
          await botService.sendMotivationalMessage(
            'system',
            'system',
            `🤖 Unknown command "${command}". Try /party, /celebrate, /coffee, or /pizza for some fun!`
          );
        }
      }
    } catch (error) {
      console.error('Error processing easter egg command:', error);
    } finally {
      setIsProcessingCommand(false);
    }
  };

  // Find similar command using simple string similarity
  const findSimilarCommand = (input) => {
    const inputLower = input.toLowerCase();
    
    // Direct partial matches
    const partialMatch = KNOWN_COMMANDS.find(cmd => 
      cmd.includes(inputLower.slice(1)) || inputLower.includes(cmd.slice(1))
    );
    
    if (partialMatch) return partialMatch;

    // Levenshtein distance for typos
    let bestMatch = null;
    let bestDistance = Infinity;
    
    KNOWN_COMMANDS.forEach(cmd => {
      const distance = levenshteinDistance(inputLower, cmd);
      if (distance < bestDistance && distance <= 2) {
        bestDistance = distance;
        bestMatch = cmd;
      }
    });
    
    return bestMatch;
  };

  // Simple Levenshtein distance calculation
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Handle input changes and show command hints
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Show command hints when typing commands
    if (value.startsWith('/') && value.length > 1) {
      setShowCommandHints(true);
    } else {
      setShowCommandHints(false);
    }
  };

  // Handle key presses for command history and shortcuts
  const handleKeyDown = (e) => {
    // Tab completion for commands
    if (e.key === 'Tab' && message.startsWith('/')) {
      e.preventDefault();
      
      const partial = message.toLowerCase();
      const match = KNOWN_COMMANDS.find(cmd => cmd.startsWith(partial));
      
      if (match) {
        setMessage(match);
      }
    }
    
    // Arrow up for command history
    if (e.key === 'ArrowUp' && message === '' && commandHistory.length > 0) {
      e.preventDefault();
      setMessage(commandHistory[0]);
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
      setMessage('');
      setShowCommandHints(false);
    }
  };

  // Get filtered command suggestions
  const getCommandSuggestions = () => {
    if (!message.startsWith('/') || message.length <= 1) {
      return [];
    }
    
    const partial = message.toLowerCase();
    return KNOWN_COMMANDS
      .filter(cmd => cmd.startsWith(partial))
      .slice(0, 5);
  };

  const suggestions = getCommandSuggestions();

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex space-x-2" {...props}>
        <div className="flex-1 relative">
          <ChatTooltip content="Type messages or try easter egg commands like /party!">
            <Input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isProcessingCommand}
              className={`pr-4 ${message.startsWith('/') ? 'border-primary/50 bg-primary/5' : ''}`}
              {...inputProps}
            />
          </ChatTooltip>
          
          {/* Command suggestions dropdown */}
          {showCommandHints && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50">
              <div className="p-2 text-xs text-muted-foreground border-b">
                Easter Egg Commands:
              </div>
              {suggestions.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    setMessage(cmd);
                    setShowCommandHints(false);
                    inputRef.current?.focus();
                  }}
                >
                  <span className="font-mono text-primary">{cmd}</span>
                  <span className="ml-2 text-muted-foreground">
                    {getCommandDescription(cmd)}
                  </span>
                </button>
              ))}
              <div className="p-2 text-xs text-muted-foreground border-t">
                Press Tab to autocomplete, ↑ for history
              </div>
            </div>
          )}
        </div>
        
        <CustomTooltip 
          content={isProcessingCommand ? "Processing command..." : "Send message"}
          type="send_button"
        >
          <Button 
            type="submit" 
            disabled={disabled || !message.trim() || isProcessingCommand}
            className="shrink-0"
          >
            {isProcessingCommand ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </CustomTooltip>
      </form>
      
      {/* Command history indicator */}
      {commandHistory.length > 0 && (
        <div className="absolute -top-6 right-0 text-xs text-muted-foreground">
          {commandHistory.length} command{commandHistory.length !== 1 ? 's' : ''} in history
        </div>
      )}
    </div>
  );
};

// Get description for command
const getCommandDescription = (command) => {
  const descriptions = {
    '/party': 'Start a party!',
    '/celebrate': 'Celebrate with fireworks!',
    '/coffee': 'Coffee break time!',
    '/pizza': 'Pizza party!',
    '/rocket': 'Launch to the moon!',
    '/magic': 'Cast a spell!',
    '/ninja': 'Ninja mode!',
    '/unicorn': 'Unicorn power!',
    '/spooky': 'Spooky vibes!',
    '/ghost': 'Ghostly whispers!',
    '/santa': 'Ho ho ho!',
    '/fireworks': 'Fireworks show!',
    '/joke': 'Tell a joke!',
    '/love': 'Spread the love!',
    '/lucky': 'Feel lucky!',
    '/konami': 'Secret code!',
    '/hackerman': 'Elite hacker!',
    '/42': 'Answer to everything!'
  };
  
  return descriptions[command] || 'Try it and see!';
};

export default EasterEggMessageInput;