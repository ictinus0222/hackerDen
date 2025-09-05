/**
 * @fileoverview Easter Egg Trigger System
 * Handles hidden commands, special effects, and discovery rewards
 */

import React, { useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';
import botService from '../services/botService';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';

// Easter egg achievement definitions
const EASTER_EGG_ACHIEVEMENTS = {
  FIRST_EASTER_EGG: {
    type: 'first_easter_egg',
    name: 'Easter Egg Hunter',
    description: 'Discovered your first easter egg!',
    pointsAwarded: 10,
    icon: '🥚'
  },
  PARTY_ANIMAL: {
    type: 'party_animal',
    name: 'Party Animal',
    description: 'Started 5 parties with /party',
    pointsAwarded: 15,
    icon: '🎉'
  },
  CELEBRATION_MASTER: {
    type: 'celebration_master',
    name: 'Celebration Master',
    description: 'Triggered 10 celebrations',
    pointsAwarded: 20,
    icon: '🎊'
  },
  COMMAND_EXPLORER: {
    type: 'command_explorer',
    name: 'Command Explorer',
    description: 'Discovered 5 different easter egg commands',
    pointsAwarded: 25,
    icon: '🔍'
  },
  SECRET_KEEPER: {
    type: 'secret_keeper',
    name: 'Secret Keeper',
    description: 'Found the ultra-secret command',
    pointsAwarded: 50,
    icon: '🤫'
  }
};

// Special date themes
const SPECIAL_DATE_THEMES = {
  halloween: {
    decorations: ['🎃', '👻', '🕷️', '🦇', '🕸️'],
    colors: ['#ff6b35', '#2d1b69', '#000000', '#ff8c00'],
    message: "🎃 Spooky coding vibes! May your bugs be as rare as unicorns! 👻",
    commands: ['/spooky', '/ghost', '/pumpkin']
  },
  christmas: {
    decorations: ['🎄', '🎅', '❄️', '⭐', '🎁'],
    colors: ['#c41e3a', '#228b22', '#ffd700', '#ffffff'],
    message: "🎄 Ho ho ho! Coding through the snow! ❄️",
    commands: ['/santa', '/snow', '/gift']
  },
  new_year: {
    decorations: ['🎊', '🎆', '🥳', '✨', '🍾'],
    colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#ffffff'],
    message: "🎊 New year, new code! Let's make it legendary! 🎆",
    commands: ['/fireworks', '/champagne', '/resolution']
  },
  april_fools: {
    decorations: ['🃏', '😄', '🎭', '🤡', '🎪'],
    colors: ['#ff6b6b', '#4ecdc4', '#feca57', '#ff9ff3'],
    message: "🃏 April Fools! But your code is no joke! 😄",
    commands: ['/joke', '/prank', '/fool']
  }
};

// Ultra-secret commands (harder to discover)
const SECRET_COMMANDS = {
  '/konami': {
    message: "🎮 KONAMI CODE ACTIVATED! 🎮 You're a true gamer!",
    effect: { type: 'matrix', duration: 5000 },
    achievement: 'SECRET_KEEPER'
  },
  '/hackerman': {
    message: "👨‍💻 HACKERMAN MODE ENGAGED! 👨‍💻 Elite hacker detected!",
    effect: { type: 'hacker', duration: 4000 },
    achievement: 'SECRET_KEEPER'
  },
  '/42': {
    message: "🌌 The Answer to Life, Universe, and Everything! 🌌 Don't panic!",
    effect: { type: 'universe', duration: 6000 },
    achievement: 'SECRET_KEEPER'
  }
};

export const EasterEggTrigger = ({ children }) => {
  const { user } = useAuth();
  const { currentTeam, currentHackathon } = useTeam();
  const [discoveredCommands, setDiscoveredCommands] = useState(new Set());
  const [commandCounts, setCommandCounts] = useState({});
  const [specialTheme, setSpecialTheme] = useState(null);

  // Check for special dates on component mount
  useEffect(() => {
    const checkSpecialDate = () => {
      const theme = botService.getSpecialDateTheme();
      if (theme) {
        setSpecialTheme(theme);
        // Show special date notification
        toast.success(theme.message, {
          duration: 5000,
          icon: theme.decorations[0]
        });
      }
    };

    checkSpecialDate();
    // Check daily for special dates
    const interval = setInterval(checkSpecialDate, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle easter egg command processing
  const processEasterEggCommand = useCallback(async (command, context = {}) => {
    if (!user || !currentTeam || !currentHackathon) return null;

    try {
      // Check if it's a special date command
      if (specialTheme && specialTheme.commands.includes(command)) {
        return await handleSpecialDateCommand(command);
      }

      // Check if it's a secret command
      if (SECRET_COMMANDS[command]) {
        return await handleSecretCommand(command);
      }

      // Process regular easter egg through bot service
      const result = await botService.triggerEasterEgg(
        command,
        currentTeam.$id,
        currentHackathon.$id,
        user.name || 'Someone'
      );

      if (result.found) {
        // Track discovered command
        setDiscoveredCommands(prev => new Set([...prev, command]));
        
        // Update command count
        setCommandCounts(prev => ({
          ...prev,
          [command]: (prev[command] || 0) + 1
        }));

        // Check for easter egg achievements
        await checkEasterEggAchievements(command);

        // Trigger visual effect
        triggerVisualEffect(result.effect);

        return result;
      }

      return null;
    } catch (error) {
      console.error('Error processing easter egg command:', error);
      return null;
    }
  }, [user, currentTeam, currentHackathon, specialTheme]);

  // Handle special date commands
  const handleSpecialDateCommand = async (command) => {
    const theme = specialTheme;
    const messages = {
      '/spooky': "👻 BOO! Did I scare you? Keep coding, mortal! 🎃",
      '/ghost': "👻 *ghostly whispers* Your code will live forever... 👻",
      '/pumpkin': "🎃 Pumpkin spice latte for the soul! ☕",
      '/santa': "🎅 Ho ho ho! Have you been coding good this year? 🎄",
      '/snow': "❄️ Let it snow, let it code! ❄️",
      '/gift': "🎁 The gift of clean code is the best present! 🎁",
      '/fireworks': "🎆 BOOM! Your code is explosive! 🎆",
      '/champagne': "🍾 Pop the champagne! Another year of amazing code! 🥂",
      '/resolution': "📝 New Year's Resolution: Write more awesome code! ✨",
      '/joke': "😄 Why do programmers prefer dark mode? Light attracts bugs! 🐛",
      '/prank': "🎭 Gotcha! But seriously, your code is no prank! 🎭",
      '/fool': "🤡 The only fool here is the one who doesn't appreciate your code! 🤡"
    };

    const message = messages[command] || `${theme.decorations[0]} Special command activated! ${theme.decorations[1]}`;
    
    // Send themed message
    await botService.sendMotivationalMessage(
      currentTeam.$id,
      currentHackathon.$id,
      `${user.name} activated ${command}! ${message}`
    );

    // Show themed toast
    toast.success(message, {
      duration: 4000,
      icon: theme.decorations[Math.floor(Math.random() * theme.decorations.length)]
    });

    return {
      found: true,
      message,
      effect: { type: 'themed', theme: theme.theme, duration: 3000 },
      special: true
    };
  };

  // Handle secret commands
  const handleSecretCommand = async (command) => {
    const secretCmd = SECRET_COMMANDS[command];
    
    // Send secret message
    await botService.sendMotivationalMessage(
      currentTeam.$id,
      currentHackathon.$id,
      `${user.name} discovered the secret command ${command}! ${secretCmd.message}`
    );

    // Show special toast
    toast.success(secretCmd.message, {
      duration: 6000,
      icon: '🤫'
    });

    // Award secret achievement
    if (secretCmd.achievement) {
      await awardEasterEggAchievement(secretCmd.achievement);
    }

    // Trigger special effect
    triggerVisualEffect(secretCmd.effect);

    return {
      found: true,
      message: secretCmd.message,
      effect: secretCmd.effect,
      secret: true
    };
  };

  // Check for easter egg achievements
  const checkEasterEggAchievements = async (command) => {
    try {
      const commandCount = discoveredCommands.size;
      const specificCount = commandCounts[command] || 0;

      // First easter egg
      if (commandCount === 1) {
        await awardEasterEggAchievement('FIRST_EASTER_EGG');
      }

      // Party animal (5 /party commands)
      if (command === '/party' && specificCount >= 5) {
        await awardEasterEggAchievement('PARTY_ANIMAL');
      }

      // Celebration master (10 total celebrations)
      const totalCelebrations = Object.values(commandCounts).reduce((sum, count) => sum + count, 0);
      if (totalCelebrations >= 10) {
        await awardEasterEggAchievement('CELEBRATION_MASTER');
      }

      // Command explorer (5 different commands)
      if (commandCount >= 5) {
        await awardEasterEggAchievement('COMMAND_EXPLORER');
      }
    } catch (error) {
      console.error('Error checking easter egg achievements:', error);
    }
  };

  // Award easter egg achievement
  const awardEasterEggAchievement = async (achievementKey) => {
    try {
      const achievement = EASTER_EGG_ACHIEVEMENTS[achievementKey];
      if (!achievement) return;

      // Create achievement manually since it's not in the standard definitions
      await gamificationService.checkAndAwardAchievements(
        user.$id,
        {}, // Empty breakdown since this is a special achievement
        0,   // Total points don't matter for this check
        true // Show notifications
      );

      // Show special easter egg achievement toast
      toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
        description: achievement.description,
        duration: 5000,
        icon: achievement.icon
      });
    } catch (error) {
      console.error('Error awarding easter egg achievement:', error);
    }
  };

  // Trigger visual effects
  const triggerVisualEffect = (effect) => {
    if (!effect || typeof window === 'undefined') return;

    // Emit custom event for effect system
    const effectEvent = new CustomEvent('easter-egg-effect', {
      detail: effect
    });
    window.dispatchEvent(effectEvent);

    // Apply CSS-based effects
    const body = document.body;
    
    switch (effect.type) {
      case 'confetti':
        body.classList.add('confetti-effect');
        setTimeout(() => body.classList.remove('confetti-effect'), effect.duration);
        break;
      
      case 'fireworks':
        body.classList.add('fireworks-effect');
        setTimeout(() => body.classList.remove('fireworks-effect'), effect.duration);
        break;
      
      case 'matrix':
        body.classList.add('matrix-effect');
        setTimeout(() => body.classList.remove('matrix-effect'), effect.duration);
        break;
      
      case 'hacker':
        body.classList.add('hacker-effect');
        setTimeout(() => body.classList.remove('hacker-effect'), effect.duration);
        break;
      
      case 'universe':
        body.classList.add('universe-effect');
        setTimeout(() => body.classList.remove('universe-effect'), effect.duration);
        break;
      
      case 'themed':
        body.classList.add(`${effect.theme}-theme`);
        setTimeout(() => body.classList.remove(`${effect.theme}-theme`), effect.duration);
        break;
      
      default:
        // Generic celebration effect
        body.classList.add('celebration-effect');
        setTimeout(() => body.classList.remove('celebration-effect'), effect.duration || 2000);
    }
  };

  // Expose the processEasterEggCommand function globally for other components
  useEffect(() => {
    window.processEasterEggCommand = processEasterEggCommand;
    return () => {
      delete window.processEasterEggCommand;
    };
  }, [processEasterEggCommand]);

  return (
    <>
      {children}
      {/* Special date decorations */}
      {specialTheme && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
          <div className="flex space-x-2 text-2xl animate-bounce">
            {specialTheme.decorations.slice(0, 3).map((decoration, index) => (
              <span key={index} className="animate-pulse" style={{ animationDelay: `${index * 0.2}s` }}>
                {decoration}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// Hook for using easter egg functionality in other components
export const useEasterEggs = () => {
  const processCommand = useCallback((command, context = {}) => {
    if (typeof window !== 'undefined' && window.processEasterEggCommand) {
      return window.processEasterEggCommand(command, context);
    }
    return null;
  }, []);

  return { processCommand };
};

export default EasterEggTrigger;