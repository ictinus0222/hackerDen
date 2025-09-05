import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

/**
 * Component for rendering easter egg visual effects
 * Handles confetti, fireworks, and other celebration animations
 */
const EasterEggEffects = ({ effect, onComplete, className }) => {
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!effect) return;

    setIsActive(true);
    generateParticles(effect);

    const timer = setTimeout(() => {
      setIsActive(false);
      setParticles([]);
      onComplete?.();
    }, effect.duration || 3000);

    return () => clearTimeout(timer);
  }, [effect, onComplete]);

  const generateParticles = (effectConfig) => {
    const particleCount = getParticleCount(effectConfig.type);
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 1000,
        color: effectConfig.colors?.[Math.floor(Math.random() * effectConfig.colors.length)] || '#ff6b6b'
      });
    }

    setParticles(newParticles);
  };

  const getParticleCount = (type) => {
    const counts = {
      confetti: 50,
      fireworks: 30,
      sparkle: 25,
      bounce: 10,
      steam: 15,
      launch: 20,
      stealth: 8,
      rainbow: 40
    };
    return counts[type] || 20;
  };

  const getParticleElement = (particle, effectType) => {
    switch (effectType) {
      case 'confetti':
        return (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-sm animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '2s'
            }}
          />
        );

      case 'fireworks':
        return (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '1.5s'
            }}
          />
        );

      case 'sparkle':
        return (
          <div
            key={particle.id}
            className="absolute text-yellow-400 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              fontSize: `${particle.scale}rem`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '1s'
            }}
          >
            ✨
          </div>
        );

      case 'bounce':
        return (
          <div
            key={particle.id}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '1s'
            }}
          >
            {effect.icon}
          </div>
        );

      case 'steam':
        return (
          <div
            key={particle.id}
            className="absolute text-gray-400 opacity-70 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              fontSize: `${particle.scale * 0.8}rem`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '2s',
              transform: `translateY(-${particle.y * 0.5}px)`
            }}
          >
            💨
          </div>
        );

      case 'launch':
        return (
          <div
            key={particle.id}
            className="absolute text-2xl"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `launch-${particle.id} 2s ease-out ${particle.delay}ms forwards`
            }}
          >
            {effect.icon}
            <style jsx>{`
              @keyframes launch-${particle.id} {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                50% { transform: translateY(-100px) scale(1.2); opacity: 0.8; }
                100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
              }
            `}</style>
          </div>
        );

      case 'stealth':
        return (
          <div
            key={particle.id}
            className="absolute text-xl opacity-50"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `stealth-${particle.id} 2s ease-in-out ${particle.delay}ms infinite`
            }}
          >
            {effect.icon}
            <style jsx>{`
              @keyframes stealth-${particle.id} {
                0%, 100% { opacity: 0.1; transform: scale(0.8); }
                50% { opacity: 0.8; transform: scale(1.2); }
              }
            `}</style>
          </div>
        );

      case 'rainbow':
        return (
          <div
            key={particle.id}
            className="absolute w-4 h-1 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: `linear-gradient(90deg, ${particle.color}, #ff9ff3, #54a0ff)`,
              transform: `rotate(${particle.rotation}deg)`,
              animation: `rainbow-${particle.id} 3s ease-in-out ${particle.delay}ms forwards`
            }}
          >
            <style jsx>{`
              @keyframes rainbow-${particle.id} {
                0% { transform: rotate(${particle.rotation}deg) scale(0); opacity: 0; }
                50% { transform: rotate(${particle.rotation + 180}deg) scale(1); opacity: 1; }
                100% { transform: rotate(${particle.rotation + 360}deg) scale(0); opacity: 0; }
              }
            `}</style>
          </div>
        );

      default:
        return (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}ms`
            }}
          />
        );
    }
  };

  if (!isActive || !effect) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 pointer-events-none z-50 overflow-hidden",
        className
      )}
      role="presentation"
      aria-hidden="true"
    >
      {/* Background overlay for some effects */}
      {(effect.type === 'fireworks' || effect.type === 'launch') && (
        <div className="absolute inset-0 bg-black/10 animate-pulse" />
      )}

      {/* Particles */}
      {particles.map(particle => getParticleElement(particle, effect.type))}

      {/* Central effect element */}
      {effect.icon && effect.type !== 'bounce' && effect.type !== 'launch' && effect.type !== 'stealth' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className="text-6xl animate-pulse"
            style={{ animationDuration: '0.5s' }}
          >
            {effect.icon}
          </div>
        </div>
      )}

      {/* Screen flash for dramatic effects */}
      {(effect.type === 'fireworks' || effect.type === 'celebrate') && (
        <div 
          className="absolute inset-0 bg-white animate-ping opacity-20"
          style={{ animationDuration: '0.3s', animationIterationCount: '3' }}
        />
      )}
    </div>
  );
};

/**
 * Hook for triggering easter egg effects
 */
export const useEasterEggEffects = () => {
  const [currentEffect, setCurrentEffect] = useState(null);

  const triggerEffect = (effectConfig) => {
    setCurrentEffect(effectConfig);
  };

  const clearEffect = () => {
    setCurrentEffect(null);
  };

  return {
    currentEffect,
    triggerEffect,
    clearEffect
  };
};

export default EasterEggEffects;