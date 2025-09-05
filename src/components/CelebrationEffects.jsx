/**
 * @fileoverview Celebration Effects Component
 * Provides confetti animations and celebration triggers using CSS and Tailwind
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Confetti particle component
const ConfettiParticle = ({ delay = 0, duration = 3000, color = 'bg-primary' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, delay + duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [delay, duration]);

  if (!isVisible) return null;

  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const randomScale = 0.5 + Math.random() * 0.5;

  return (
    <div
      className={cn(
        "absolute w-2 h-2 rounded-sm pointer-events-none z-50",
        color,
        "animate-bounce"
      )}
      style={{
        left: `${randomX}%`,
        top: '-10px',
        transform: `rotate(${randomRotation}deg) scale(${randomScale})`,
        animation: `confetti-fall ${duration}ms ease-out forwards`,
      }}
    />
  );
};

// Default colors to prevent infinite re-renders
const DEFAULT_COLORS = ['bg-primary', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

// Main confetti effect component - Mobile Optimized
export const ConfettiEffect = ({ 
  isActive = false, 
  particleCount = 50, 
  duration = 3000,
  colors = DEFAULT_COLORS,
  onComplete = null
}) => {
  const [particles, setParticles] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isActive) {
      // Reduce particle count on mobile for better performance
      const mobileParticleCount = isMobile ? Math.min(particleCount, 25) : particleCount;
      
      const newParticles = Array.from({ length: mobileParticleCount }, (_, i) => ({
        id: i,
        delay: Math.random() * 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);

      if (onComplete) {
        const timer = setTimeout(onComplete, duration + 1000);
        return () => clearTimeout(timer);
      }
    } else {
      setParticles([]);
    }
  }, [isActive, particleCount, duration, onComplete, isMobile]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          delay={particle.delay}
          duration={duration}
          color={particle.color}
        />
      ))}
    </div>
  );
};

// Celebration trigger component for task completion - Mobile Optimized
export const TaskCompletionCelebration = ({ isTriggered, onComplete }) => {
  return (
    <ConfettiEffect
      isActive={isTriggered}
      particleCount={20} // Reduced for mobile performance
      duration={1500} // Shorter duration on mobile
      onComplete={onComplete}
    />
  );
};

// Achievement unlock celebration - Mobile Optimized
export const AchievementCelebration = ({ isTriggered, onComplete }) => {
  return (
    <ConfettiEffect
      isActive={isTriggered}
      particleCount={60} // Reduced for mobile performance
      duration={3000} // Shorter duration on mobile
      colors={['bg-yellow-500', 'bg-orange-500', 'bg-amber-500']}
      onComplete={onComplete}
    />
  );
};

// Milestone celebration - Mobile Optimized
export const MilestoneCelebration = ({ isTriggered, onComplete }) => {
  return (
    <ConfettiEffect
      isActive={isTriggered}
      particleCount={80} // Reduced for mobile performance
      duration={4000} // Shorter duration on mobile
      colors={['bg-primary', 'bg-secondary', 'bg-accent', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500']}
      onComplete={onComplete}
    />
  );
};

// Pulsing celebration effect for achievements
export const PulseEffect = ({ isActive, children, intensity = 'normal' }) => {
  const intensityClasses = {
    subtle: 'animate-pulse',
    normal: 'animate-bounce',
    strong: 'animate-ping'
  };

  return (
    <div className={cn(
      "transition-all duration-300",
      isActive && intensityClasses[intensity]
    )}>
      {children}
    </div>
  );
};

// Glow effect for special moments
export const GlowEffect = ({ isActive, children, color = 'primary' }) => {
  const glowClasses = {
    primary: 'shadow-lg shadow-primary/50',
    success: 'shadow-lg shadow-green-500/50',
    warning: 'shadow-lg shadow-yellow-500/50',
    error: 'shadow-lg shadow-red-500/50'
  };

  return (
    <div className={cn(
      "transition-all duration-500",
      isActive && glowClasses[color],
      isActive && "scale-105"
    )}>
      {children}
    </div>
  );
};

// Celebration manager hook
export const useCelebration = () => {
  const [activeEffects, setActiveEffects] = useState({
    confetti: false,
    pulse: false,
    glow: false
  });

  const triggerTaskCompletion = () => {
    setActiveEffects(prev => ({ ...prev, confetti: true, pulse: true }));
    setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, confetti: false, pulse: false }));
    }, 2000);
  };

  const triggerAchievement = () => {
    setActiveEffects(prev => ({ ...prev, confetti: true, glow: true }));
    setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, confetti: false, glow: false }));
    }, 4000);
  };

  const triggerMilestone = () => {
    setActiveEffects({ confetti: true, pulse: true, glow: true });
    setTimeout(() => {
      setActiveEffects({ confetti: false, pulse: false, glow: false });
    }, 5000);
  };

  const clearEffects = () => {
    setActiveEffects({ confetti: false, pulse: false, glow: false });
  };

  return {
    activeEffects,
    triggerTaskCompletion,
    triggerAchievement,
    triggerMilestone,
    clearEffects
  };
};

// CSS keyframes for confetti animation (to be added to global CSS)
export const confettiStyles = `
@keyframes confetti-fall {
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
`;

export default ConfettiEffect;