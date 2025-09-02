import { createContext, useContext, useEffect, useState } from 'react';
import { applyThemeVariables, validateThemeConsistency } from '../lib/theme-config';
import { enableThemeTransitions, persistTheme, loadPersistedTheme } from '../lib/theme-integration';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => null,
  systemTheme: 'dark',
  resolvedTheme: 'dark',
  isThemeReady: false,
  themeConsistency: null,
});

export function ThemeProvider({ 
  children, 
  defaultTheme = 'dark', 
  storageKey = 'hackerden-theme',
  enableSystem = true,
  disableTransitionOnChange = true,
}) {
  const [theme, setTheme] = useState(() => {
    return loadPersistedTheme(defaultTheme, storageKey);
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [isThemeReady, setIsThemeReady] = useState(false);
  const [themeConsistency, setThemeConsistency] = useState(null);

  // Resolved theme is the actual theme being applied (handles 'system' theme)
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Enable theme transitions on mount
  useEffect(() => {
    enableThemeTransitions();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Disable transitions during theme change if requested
    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
      );
      document.head.appendChild(css);
      
      // Force reflow
      (() => window.getComputedStyle(document.body))();
      
      // Re-enable transitions after a brief delay
      setTimeout(() => {
        document.head.removeChild(css);
      }, 1);
    }
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Apply the resolved theme
    root.classList.add(resolvedTheme);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', resolvedTheme);
    
    // Apply CSS custom properties for Shadcn integration
    applyThemeVariables(resolvedTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        resolvedTheme === 'dark' ? '#121C1B' : '#ffffff'
      );
    }

    // Validate theme consistency and update state
    setTimeout(() => {
      const consistency = validateThemeConsistency(resolvedTheme);
      setThemeConsistency(consistency);
      setIsThemeReady(true);
    }, 50);
  }, [resolvedTheme, disableTransitionOnChange]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      setIsThemeReady(false);
      persistTheme(newTheme, storageKey);
      setTheme(newTheme);
    },
    systemTheme,
    resolvedTheme,
    isThemeReady,
    themeConsistency,
    themes: enableSystem ? ['light', 'dark', 'system'] : ['light', 'dark'],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};