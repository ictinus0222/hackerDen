import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { validateThemeConsistency, getThemeColors } from '../lib/theme-config';

export function useThemeTest() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [testResults, setTestResults] = useState({
    consistency: null,
    colors: {},
    breakpoints: {},
    accessibility: {},
  });

  // Test theme consistency
  useEffect(() => {
    const runTests = () => {
      const consistency = validateThemeConsistency(resolvedTheme);
      const colors = getThemeColors(resolvedTheme);
      
      // Test breakpoint behavior
      const breakpoints = testBreakpoints();
      
      // Test accessibility
      const accessibility = testAccessibility();

      setTestResults({
        consistency,
        colors,
        breakpoints,
        accessibility,
      });
    };

    // Run tests after a brief delay to allow theme to apply
    const timer = setTimeout(runTests, 100);
    return () => clearTimeout(timer);
  }, [resolvedTheme]);

  // Test responsive behavior at different breakpoints
  const testBreakpoints = () => {
    const breakpoints = {
      sm: window.matchMedia('(min-width: 640px)').matches,
      md: window.matchMedia('(min-width: 768px)').matches,
      lg: window.matchMedia('(min-width: 1024px)').matches,
      xl: window.matchMedia('(min-width: 1280px)').matches,
    };

    return breakpoints;
  };

  // Test accessibility features
  const testAccessibility = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Get color values for contrast testing
    const background = computedStyle.getPropertyValue('--background').trim();
    const foreground = computedStyle.getPropertyValue('--foreground').trim();
    const primary = computedStyle.getPropertyValue('--primary').trim();
    
    // Simple contrast ratio calculation (simplified)
    const hasGoodContrast = background !== foreground && primary !== background;
    
    // Check if focus indicators are properly configured
    const hasFocusRing = computedStyle.getPropertyValue('--ring').trim() !== '';
    
    return {
      hasGoodContrast,
      hasFocusRing,
      supportsReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      supportsHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    };
  };

  // Cycle through all available themes for testing
  const cycleThemes = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Test theme switching performance
  const testThemeSwitchingPerformance = () => {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const originalTheme = theme;
      const testTheme = theme === 'dark' ? 'light' : 'dark';
      
      setTheme(testTheme);
      
      // Wait for theme to apply and measure
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const switchTime = endTime - startTime;
        
        // Switch back to original theme
        setTheme(originalTheme);
        
        resolve({
          switchTime,
          isPerformant: switchTime < 100, // Less than 100ms is good
        });
      });
    });
  };

  // Get current theme status for debugging
  const getThemeStatus = () => {
    const root = document.documentElement;
    return {
      currentTheme: theme,
      resolvedTheme,
      hasLightClass: root.classList.contains('light'),
      hasDarkClass: root.classList.contains('dark'),
      dataTheme: root.getAttribute('data-theme'),
      cssVariables: {
        background: getComputedStyle(root).getPropertyValue('--background'),
        foreground: getComputedStyle(root).getPropertyValue('--foreground'),
        primary: getComputedStyle(root).getPropertyValue('--primary'),
      },
    };
  };

  return {
    testResults,
    cycleThemes,
    testThemeSwitchingPerformance,
    getThemeStatus,
    isTestingComplete: testResults.consistency !== null,
  };
}