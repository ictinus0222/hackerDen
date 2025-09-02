/**
 * Theme Integration Utilities
 * Enhanced integration between HackerDen's existing theme system and Shadcn UI
 */

import { THEME_CONFIG } from './theme-config';

/**
 * Enhanced theme toggle functionality with smooth transitions
 * @param {Function} setTheme - Theme setter function from useTheme
 * @param {string} currentTheme - Current theme value
 * @param {Array} availableThemes - Available theme options
 * @returns {Function} Toggle function
 */
export function createThemeToggle(setTheme, currentTheme, availableThemes = ['light', 'dark']) {
  return () => {
    const currentIndex = availableThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    const nextTheme = availableThemes[nextIndex];
    
    // Add transition class before switching
    document.documentElement.classList.add('theme-transitioning');
    
    setTheme(nextTheme);
    
    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  };
}

/**
 * Validate and fix theme inconsistencies
 * @param {string} expectedTheme - The theme that should be active
 * @returns {boolean} Whether fixes were applied
 */
export function validateAndFixTheme(expectedTheme) {
  const root = document.documentElement;
  let fixesApplied = false;
  
  // Check class consistency
  const hasCorrectClass = root.classList.contains(expectedTheme);
  if (!hasCorrectClass) {
    root.classList.remove('light', 'dark');
    root.classList.add(expectedTheme);
    fixesApplied = true;
  }
  
  // Check data attribute
  const dataTheme = root.getAttribute('data-theme');
  if (dataTheme !== expectedTheme) {
    root.setAttribute('data-theme', expectedTheme);
    fixesApplied = true;
  }
  
  // Check CSS variables
  const expectedVars = THEME_CONFIG.cssVariables[expectedTheme];
  if (expectedVars) {
    Object.entries(expectedVars).forEach(([property, value]) => {
      const currentValue = getComputedStyle(root).getPropertyValue(property).trim();
      if (currentValue !== value) {
        root.style.setProperty(property, value);
        fixesApplied = true;
      }
    });
  }
  
  return fixesApplied;
}

/**
 * Create theme-aware CSS classes for components
 * @param {Object} config - Configuration object
 * @param {string} config.base - Base classes
 * @param {string} config.light - Light theme specific classes
 * @param {string} config.dark - Dark theme specific classes
 * @returns {string} Combined class string
 */
export function createThemeClasses({ base = '', light = '', dark = '' }) {
  const classes = [base];
  
  if (light) {
    classes.push(`light:${light}`);
  }
  
  if (dark) {
    classes.push(`dark:${dark}`);
  }
  
  return classes.filter(Boolean).join(' ');
}

/**
 * Get theme-aware color values for programmatic use
 * @param {string} colorName - Name of the color (e.g., 'primary', 'background')
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {string} Color value
 */
export function getThemeColor(colorName, theme) {
  const themeVars = THEME_CONFIG.cssVariables[theme];
  if (!themeVars) return null;
  
  const colorVar = `--${colorName}`;
  return themeVars[colorVar] || null;
}

/**
 * Create responsive theme-aware styles
 * @param {Object} styles - Style configuration
 * @returns {Object} Responsive style object
 */
export function createResponsiveThemeStyles(styles) {
  const breakpoints = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
  };
  
  const mediaQueries = {};
  
  Object.entries(styles).forEach(([key, value]) => {
    if (breakpoints[key]) {
      mediaQueries[`@media ${breakpoints[key]}`] = value;
    } else {
      mediaQueries[key] = value;
    }
  });
  
  return mediaQueries;
}

/**
 * Enhanced theme persistence with validation
 * @param {string} theme - Theme to persist
 * @param {string} storageKey - Storage key
 */
export function persistTheme(theme, storageKey = 'hackerden-theme') {
  try {
    localStorage.setItem(storageKey, theme);
    
    // Validate persistence
    const stored = localStorage.getItem(storageKey);
    if (stored !== theme) {
      console.warn('Theme persistence failed, falling back to sessionStorage');
      sessionStorage.setItem(storageKey, theme);
    }
  } catch (error) {
    console.warn('Storage not available, theme will not persist:', error);
  }
}

/**
 * Load persisted theme with fallback
 * @param {string} defaultTheme - Default theme if none persisted
 * @param {string} storageKey - Storage key
 * @returns {string} Loaded theme
 */
export function loadPersistedTheme(defaultTheme = 'dark', storageKey = 'hackerden-theme') {
  try {
    // Try localStorage first
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
    
    // Fallback to sessionStorage
    const sessionStored = sessionStorage.getItem(storageKey);
    if (sessionStored) return sessionStored;
    
    // Fallback to system preference
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
  } catch (error) {
    console.warn('Could not load persisted theme:', error);
  }
  
  return defaultTheme;
}

/**
 * Monitor system theme changes
 * @param {Function} callback - Callback function when system theme changes
 * @returns {Function} Cleanup function
 */
export function monitorSystemTheme(callback) {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

/**
 * Create theme transition CSS
 * @returns {string} CSS for smooth theme transitions
 */
export function createThemeTransitionCSS() {
  return `
    .theme-transitioning,
    .theme-transitioning *,
    .theme-transitioning *:before,
    .theme-transitioning *:after {
      transition: background-color 0.3s ease, 
                  color 0.3s ease, 
                  border-color 0.3s ease,
                  box-shadow 0.3s ease !important;
      transition-delay: 0s !important;
    }
  `;
}

/**
 * Apply theme transition styles to document
 */
export function enableThemeTransitions() {
  const styleId = 'theme-transitions';
  
  // Remove existing style if present
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create and append new style
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = createThemeTransitionCSS();
  document.head.appendChild(style);
}

/**
 * Disable theme transitions (useful during initial load)
 */
export function disableThemeTransitions() {
  const styleId = 'theme-transitions';
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
}

/**
 * Get comprehensive theme status for debugging
 * @returns {Object} Theme status information
 */
export function getThemeDebugInfo() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return {
    classes: Array.from(root.classList),
    dataTheme: root.getAttribute('data-theme'),
    cssVariables: {
      background: computedStyle.getPropertyValue('--background'),
      foreground: computedStyle.getPropertyValue('--foreground'),
      primary: computedStyle.getPropertyValue('--primary'),
      secondary: computedStyle.getPropertyValue('--secondary'),
      muted: computedStyle.getPropertyValue('--muted'),
      accent: computedStyle.getPropertyValue('--accent'),
      border: computedStyle.getPropertyValue('--border'),
      ring: computedStyle.getPropertyValue('--ring'),
    },
    systemPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    localStorage: localStorage.getItem('hackerden-theme'),
    sessionStorage: sessionStorage.getItem('hackerden-theme'),
  };
}