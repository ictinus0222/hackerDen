/**
 * @fileoverview Special Date Decorator Component
 * Handles themed decorations and temporary features for special dates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import botService from '../services/botService';
import { useEasterEggStats } from './EasterEggAchievements';

// Special date configurations with enhanced theming
const SPECIAL_DATES = {
  halloween: {
    name: 'Halloween',
    dates: [{ month: 10, day: 31 }],
    decorations: ['🎃', '👻', '🕷️', '🦇', '🕸️', '🍭', '🧙‍♀️', '⚰️'],
    colors: ['#ff6b35', '#2d1b69', '#000000', '#ff8c00', '#8b0000'],
    message: "🎃 Spooky coding vibes! May your bugs be as rare as unicorns! 👻",
    commands: ['/spooky', '/ghost', '/pumpkin', '/boo', '/witch'],
    features: {
      cursorTrail: '👻',
      backgroundPattern: 'spooky-web',
      soundEffects: ['spooky-laugh', 'ghost-boo'],
      specialTooltips: true
    }
  },
  
  christmas: {
    name: 'Christmas',
    dates: [
      { month: 12, day: 24 }, // Christmas Eve
      { month: 12, day: 25 }  // Christmas Day
    ],
    decorations: ['🎄', '🎅', '❄️', '⭐', '🎁', '🔔', '🕯️', '🦌'],
    colors: ['#c41e3a', '#228b22', '#ffd700', '#ffffff', '#b22222'],
    message: "🎄 Ho ho ho! Coding through the snow! ❄️",
    commands: ['/santa', '/snow', '/gift', '/jingle', '/sleigh'],
    features: {
      cursorTrail: '❄️',
      backgroundPattern: 'snowflakes',
      soundEffects: ['jingle-bells', 'ho-ho-ho'],
      specialTooltips: true
    }
  },
  
  new_year: {
    name: 'New Year',
    dates: [
      { month: 12, day: 31 }, // New Year's Eve
      { month: 1, day: 1 }    // New Year's Day
    ],
    decorations: ['🎊', '🎆', '🥳', '✨', '🍾', '🎉', '🌟', '🎭'],
    colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#ffffff', '#ff1493'],
    message: "🎊 New year, new code! Let's make it legendary! 🎆",
    commands: ['/fireworks', '/champagne', '/resolution', '/countdown', '/party'],
    features: {
      cursorTrail: '✨',
      backgroundPattern: 'fireworks',
      soundEffects: ['fireworks-pop', 'champagne-pop'],
      specialTooltips: true
    }
  },
  
  april_fools: {
    name: 'April Fools',
    dates: [{ month: 4, day: 1 }],
    decorations: ['🃏', '😄', '🎭', '🤡', '🎪', '🎨', '🎲', '🎯'],
    colors: ['#ff6b6b', '#4ecdc4', '#feca57', '#ff9ff3', '#54a0ff'],
    message: "🃏 April Fools! But your code is no joke! 😄",
    commands: ['/joke', '/prank', '/fool', '/trick', '/laugh'],
    features: {
      cursorTrail: '🃏',
      backgroundPattern: 'confetti',
      soundEffects: ['laugh-track', 'honk-honk'],
      specialTooltips: true,
      prankMode: true
    }
  },
  
  valentines: {
    name: "Valentine's Day",
    dates: [{ month: 2, day: 14 }],
    decorations: ['💖', '💕', '💘', '🌹', '💝', '💌', '🍫', '💐'],
    colors: ['#ff69b4', '#ff1493', '#dc143c', '#ffffff', '#ffb6c1'],
    message: "💖 Code with love! Your commits are poetry! 💕",
    commands: ['/love', '/heart', '/kiss', '/romance', '/valentine'],
    features: {
      cursorTrail: '💖',
      backgroundPattern: 'hearts',
      soundEffects: ['kiss-sound', 'romantic-music'],
      specialTooltips: true
    }
  },
  
  st_patricks: {
    name: "St. Patrick's Day",
    dates: [{ month: 3, day: 17 }],
    decorations: ['🍀', '🌈', '🎩', '💚', '🍺', '🧙‍♂️', '🪙', '🌿'],
    colors: ['#228b22', '#32cd32', '#ffd700', '#ffffff', '#006400'],
    message: "🍀 May the luck of the Irish be with your code! 🌈",
    commands: ['/lucky', '/rainbow', '/shamrock', '/leprechaun', '/gold'],
    features: {
      cursorTrail: '🍀',
      backgroundPattern: 'shamrocks',
      soundEffects: ['irish-music', 'coin-drop'],
      specialTooltips: true
    }
  }
};

export const SpecialDateDecorator = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(null);
  const [decorationPositions, setDecorationPositions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [showThemeCard, setShowThemeCard] = useState(false);
  const { updateStats } = useEasterEggStats();

  // Check for special dates
  useEffect(() => {
    checkForSpecialDate();
    
    // Check every hour for date changes
    const interval = setInterval(checkForSpecialDate, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate random decoration positions
  useEffect(() => {
    if (currentTheme && isActive) {
      generateDecorationPositions();
      
      // Update easter egg stats
      updateStats({
        specialThemesExperienced: 1
      });
    }
  }, [currentTheme, isActive]);

  const checkForSpecialDate = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();

    // Check each special date
    for (const [themeKey, theme] of Object.entries(SPECIAL_DATES)) {
      const isSpecialDate = theme.dates.some(date => 
        date.month === currentMonth && date.day === currentDay
      );

      if (isSpecialDate) {
        setCurrentTheme({ key: themeKey, ...theme });
        setIsActive(true);
        setShowThemeCard(true);
        
        // Show welcome message
        toast.success(theme.message, {
          duration: 8000,
          icon: theme.decorations[0],
          action: {
            label: 'Explore',
            onClick: () => setShowThemeCard(true)
          }
        });
        
        return;
      }
    }

    // No special date found
    if (currentTheme) {
      setCurrentTheme(null);
      setIsActive(false);
      setShowThemeCard(false);
    }
  };

  const generateDecorationPositions = () => {
    const positions = [];
    const decorationCount = 12; // Number of floating decorations

    for (let i = 0; i < decorationCount; i++) {
      positions.push({
        id: i,
        decoration: currentTheme.decorations[Math.floor(Math.random() * currentTheme.decorations.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 5,
        animationDuration: 3 + Math.random() * 4
      });
    }

    setDecorationPositions(positions);
  };

  const handleSpecialCommand = async (command) => {
    if (!currentTheme || !currentTheme.commands.includes(command)) {
      return false;
    }

    // Process special date command
    const responses = {
      // Halloween
      '/spooky': "👻 BOO! Did I scare you? Keep coding, mortal! 🎃",
      '/ghost': "👻 *ghostly whispers* Your code will live forever... 👻",
      '/pumpkin': "🎃 Pumpkin spice latte for the soul! Perfect for coding! ☕",
      '/boo': "👻 BOO! Gotcha! Now back to coding! 💻",
      '/witch': "🧙‍♀️ Brewing some magical code, are we? ✨",
      
      // Christmas
      '/santa': "🎅 Ho ho ho! Have you been coding good this year? 🎄",
      '/snow': "❄️ Let it snow, let it code! ❄️",
      '/gift': "🎁 The gift of clean code is the best present! 🎁",
      '/jingle': "🔔 Jingle bells, jingle bells, jingle all the way! 🛷",
      '/sleigh': "🛷 Dashing through the code, in a one-horse open sleigh! 🦌",
      
      // New Year
      '/fireworks': "🎆 BOOM! Your code is explosive! 🎆",
      '/champagne': "🍾 Pop the champagne! Another year of amazing code! 🥂",
      '/resolution': "📝 New Year's Resolution: Write more awesome code! ✨",
      '/countdown': "🕛 10... 9... 8... 7... 6... 5... 4... 3... 2... 1... HAPPY CODING! 🎊",
      
      // April Fools
      '/joke': "😄 Why do programmers prefer dark mode? Light attracts bugs! 🐛",
      '/prank': "🎭 Gotcha! But seriously, your code is no prank! 🎭",
      '/fool': "🤡 The only fool here is the one who doesn't appreciate your code! 🤡",
      '/trick': "🎪 Trick or treat? How about a coding feat! 🍭",
      '/laugh': "😂 Laughter is the best debugging tool! 😂",
      
      // Valentine's Day
      '/love': "💖 I love your code more than pizza! And that's saying something! 🍕",
      '/heart': "💕 You put your heart into every line of code! 💕",
      '/kiss': "💋 *chef's kiss* to that beautiful code! 👨‍🍳",
      '/romance': "🌹 A romantic evening with your IDE! 💻",
      '/valentine': "💌 Be my coding valentine? 💖",
      
      // St. Patrick's Day
      '/lucky': "🍀 Feeling lucky? Your code sure is! 🍀",
      '/rainbow': "🌈 There's a pot of gold at the end of this rainbow... it's your code! 🪙",
      '/shamrock': "🍀 Four-leaf clover found! It's your coding skills! 🍀",
      '/leprechaun': "🧙‍♂️ A leprechaun told me your code is magical! ✨",
      '/gold': "🪙 Strike gold with every commit! 🪙"
    };

    const message = responses[command] || `${currentTheme.decorations[0]} Special command activated! ${currentTheme.decorations[1]}`;
    
    // Show themed toast
    toast.success(message, {
      duration: 4000,
      icon: currentTheme.decorations[Math.floor(Math.random() * currentTheme.decorations.length)]
    });

    // Trigger special effect
    triggerSpecialEffect(command);

    return true;
  };

  const triggerSpecialEffect = (command) => {
    if (!currentTheme) return;

    // Apply theme-specific effects
    const body = document.body;
    body.classList.add(`${currentTheme.key}-special-effect`);
    
    setTimeout(() => {
      body.classList.remove(`${currentTheme.key}-special-effect`);
    }, 3000);

    // Emit custom event for other components
    const effectEvent = new CustomEvent('special-date-effect', {
      detail: { theme: currentTheme.key, command, decorations: currentTheme.decorations }
    });
    window.dispatchEvent(effectEvent);
  };

  // Expose special command handler globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.handleSpecialDateCommand = handleSpecialCommand;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.handleSpecialDateCommand;
      }
    };
  }, [handleSpecialCommand]);

  if (!currentTheme || !isActive) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      
      {/* Floating Decorations */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {decorationPositions.map((pos) => (
          <div
            key={pos.id}
            className="absolute text-2xl animate-bounce opacity-70"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${pos.animationDelay}s`,
              animationDuration: `${pos.animationDuration}s`
            }}
          >
            {pos.decoration}
          </div>
        ))}
      </div>

      {/* Theme Information Card */}
      {showThemeCard && (
        <Card className="fixed top-4 right-4 z-50 w-80 shadow-lg border-2" 
              style={{ borderColor: currentTheme.colors[0] }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{currentTheme.decorations[0]}</span>
                <div>
                  <h3 className="font-bold text-lg">{currentTheme.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Special Theme Active
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThemeCard(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {currentTheme.message}
            </p>
            
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-semibold mb-1">Special Commands:</h4>
                <div className="flex flex-wrap gap-1">
                  {currentTheme.commands.slice(0, 3).map((command) => (
                    <Badge key={command} variant="outline" className="text-xs">
                      {command}
                    </Badge>
                  ))}
                  {currentTheme.commands.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{currentTheme.commands.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Try typing commands in chat!
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsActive(!isActive)}
                  className="text-xs h-6"
                >
                  {isActive ? 'Disable' : 'Enable'} Theme
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Styles */}
      <style jsx>{`
        .${currentTheme.key}-special-effect {
          filter: hue-rotate(${Math.random() * 360}deg) saturate(1.2);
          transition: filter 0.3s ease;
        }
        
        .${currentTheme.key}-special-effect::before {
          content: '${currentTheme.decorations.join(' ')}';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3rem;
          pointer-events: none;
          z-index: 9999;
          animation: special-theme-pulse 3s ease-out;
        }
        
        @keyframes special-theme-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SpecialDateDecorator;