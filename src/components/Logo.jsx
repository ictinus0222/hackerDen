import React from 'react';

const Logo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  textClassName = '',
  variant = 'default' 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  const logoClass = `${sizeClasses[size]} ${className}`;
  const textClass = `font-bold ${textSizeClasses[size]} ${textClassName}`;

  return (
    <div className="flex items-center space-x-2">
      {/* Logo SVG */}
      <div className={logoClass}>
        <svg viewBox="0 0 1024 1024" className="w-full h-full">
          <defs>
            <linearGradient id={`greenGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#4ade80', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#22c55e', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#16a34a', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          
          {/* Dynamic curved lines forming the HackerDen logo */}
          <g fill={`url(#greenGradient-${size})`}>
            {/* Outer curves */}
            <path d="M50 200 Q200 50 400 200 Q600 350 800 200 Q900 150 950 200 L950 250 Q900 200 800 250 Q600 400 400 250 Q200 100 50 250 Z" opacity="0.9"/>
            
            {/* Middle curves */}
            <path d="M100 300 Q250 150 450 300 Q650 450 850 300 Q900 250 950 300 L950 350 Q900 300 850 350 Q650 500 450 350 Q250 200 100 350 Z" opacity="0.8"/>
            
            {/* Inner curves */}
            <path d="M150 400 Q300 250 500 400 Q700 550 900 400 Q950 350 1000 400 L1000 450 Q950 400 900 450 Q700 600 500 450 Q300 300 150 450 Z" opacity="0.7"/>
            
            {/* Core dynamic elements */}
            <path d="M200 500 Q350 350 550 500 Q750 650 950 500 Q1000 450 1050 500 L1050 550 Q1000 500 950 550 Q750 700 550 550 Q350 400 200 550 Z" opacity="0.6"/>
            
            {/* Bottom flowing lines */}
            <path d="M250 600 Q400 450 600 600 Q800 750 1000 600 L1000 650 Q800 800 600 650 Q400 500 250 650 Z" opacity="0.5"/>
            
            {/* Final accent curves */}
            <path d="M300 700 Q450 550 650 700 Q850 850 1050 700 L1050 750 Q850 900 650 750 Q450 600 300 750 Z" opacity="0.4"/>
          </g>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={`${textClass} ${
          variant === 'light' ? 'text-white' : 
          variant === 'dark' ? 'text-gray-900' : 
          'text-dark-primary'
        }`}>
          HackerDen
        </span>
      )}
    </div>
  );
};

export default Logo;