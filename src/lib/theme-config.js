/**
 * Theme Configuration Utility
 * Manages the integration between HackerDen's existing CSS custom properties
 * and Shadcn UI component theming system
 */

export const THEME_CONFIG = {
  // HackerDen brand colors that should be preserved
  brand: {
    primary: '#00C853',
    primaryHover: '#00B24A',
    accent: '#00C853',
  },
  
  // CSS custom property mappings for light and dark themes
  cssVariables: {
    light: {
      '--background': '#ffffff',
      '--foreground': '#121C1B',
      '--card': '#ffffff',
      '--card-foreground': '#121C1B',
      '--popover': '#ffffff',
      '--popover-foreground': '#121C1B',
      '--primary': '#00C853',
      '--primary-foreground': '#ffffff',
      '--secondary': '#f1f5f9',
      '--secondary-foreground': '#0f172a',
      '--muted': '#f1f5f9',
      '--muted-foreground': '#64748b',
      '--accent': '#f1f5f9',
      '--accent-foreground': '#0f172a',
      '--destructive': '#ef4444',
      '--destructive-foreground': '#ffffff',
      '--border': '#e2e8f0',
      '--input': '#e2e8f0',
      '--ring': '#00C853',
      '--sidebar': '#f8fafc',
      '--sidebar-foreground': '#121C1B',
      '--sidebar-primary': '#00C853',
      '--sidebar-primary-foreground': '#ffffff',
      '--sidebar-accent': '#f1f5f9',
      '--sidebar-accent-foreground': '#0f172a',
      '--sidebar-border': '#e2e8f0',
      '--sidebar-ring': '#00C853',
    },
    dark: {
      '--background': '#121C1B',
      '--foreground': '#B0B8B6',
      '--card': '#1E2B29',
      '--card-foreground': '#FFFFFF',
      '--popover': '#1E2B29',
      '--popover-foreground': '#FFFFFF',
      '--primary': '#00C853',
      '--primary-foreground': '#121C1B',
      '--secondary': '#1A2423',
      '--secondary-foreground': '#B0B8B6',
      '--muted': '#22312F',
      '--muted-foreground': '#9ca3af',
      '--accent': '#22312F',
      '--accent-foreground': '#FFFFFF',
      '--destructive': '#ef4444',
      '--destructive-foreground': '#121C1B',
      '--border': '#2a3a37',
      '--input': '#2a3a37',
      '--ring': '#00C853',
      '--sidebar': '#1A2423',
      '--sidebar-foreground': '#B0B8B6',
      '--sidebar-primary': '#00C853',
      '--sidebar-primary-foreground': '#121C1B',
      '--sidebar-accent': '#22312F',
      '--sidebar-accent-foreground': '#FFFFFF',
      '--sidebar-border': '#2a3a37',
      '--sidebar-ring': '#00C853',
    }
  }
};

/**
 * Apply theme CSS variables to the document root
 * @param {string} theme - 'light' or 'dark'
 */
export function applyThemeVariables(theme) {
  const root = document.documentElement;
  const variables = THEME_CONFIG.cssVariables[theme];
  
  if (!variables) {
    console.warn(`Theme "${theme}" not found in configuration`);
    return;
  }
  
  // Apply all CSS custom properties
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Get the current theme from CSS custom properties
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getCurrentTheme() {
  const root = document.documentElement;
  return root.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Validate theme consistency across CSS variables and Tailwind classes
 * @param {string} theme - Theme to validate
 * @returns {boolean} Whether theme is properly applied
 */
export function validateThemeConsistency(theme) {
  const root = document.documentElement;
  const hasCorrectClass = root.classList.contains(theme);
  const backgroundVar = getComputedStyle(root).getPropertyValue('--background').trim();
  const expectedBackground = THEME_CONFIG.cssVariables[theme]['--background'];
  
  return hasCorrectClass && backgroundVar === expectedBackground;
}

/**
 * Get theme-aware color values for programmatic use
 * @param {string} theme - Current theme
 * @returns {object} Color values for the theme
 */
export function getThemeColors(theme) {
  const variables = THEME_CONFIG.cssVariables[theme];
  if (!variables) return {};
  
  return {
    background: variables['--background'],
    foreground: variables['--foreground'],
    primary: variables['--primary'],
    secondary: variables['--secondary'],
    muted: variables['--muted'],
    accent: variables['--accent'],
    destructive: variables['--destructive'],
    border: variables['--border'],
    card: variables['--card'],
  };
}

/**
 * Create CSS custom property fallbacks for better browser compatibility
 * @param {string} property - CSS custom property name
 * @param {string} fallback - Fallback value
 * @returns {string} CSS value with fallback
 */
export function createCSSVariableWithFallback(property, fallback) {
  return `var(${property}, ${fallback})`;
}

/**
 * Generate theme-aware Tailwind classes
 * @param {string} baseClass - Base Tailwind class
 * @param {object} themeVariants - Theme-specific class variants
 * @returns {string} Complete class string
 */
export function createThemeAwareClass(baseClass, themeVariants = {}) {
  const lightClass = themeVariants.light || '';
  const darkClass = themeVariants.dark || '';
  
  return [
    baseClass,
    lightClass && `light:${lightClass}`,
    darkClass && `dark:${darkClass}`
  ].filter(Boolean).join(' ');
}