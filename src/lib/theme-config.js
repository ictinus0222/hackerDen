/**
 * Theme Configuration Utility
 * Manages the integration between HackerDen's existing CSS custom properties
 * and Shadcn UI component theming system
 */

export const THEME_CONFIG = {
  // Updated brand colors using Shadcn theme system
  brand: {
    primary: 'oklch(0.6716 0.1368 48.5130)', // Shadcn primary
    primaryHover: 'oklch(0.6216 0.1268 48.5130)', // Slightly darker primary
    accent: 'oklch(0.7214 0.1337 49.9802)', // Shadcn chart-2 (golden accent)
  },
  
  // CSS custom property mappings using Shadcn color system
  cssVariables: {
    light: {
      '--background': 'oklch(1.0000 0 0)',
      '--foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--card': 'oklch(1.0000 0 0)',
      '--card-foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--popover': 'oklch(1.0000 0 0)',
      '--popover-foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--primary': 'oklch(0.6716 0.1368 48.5130)',
      '--primary-foreground': 'oklch(1.0000 0 0)',
      '--secondary': 'oklch(0.5360 0.0398 196.0280)',
      '--secondary-foreground': 'oklch(1.0000 0 0)',
      '--muted': 'oklch(0.9670 0.0029 264.5419)',
      '--muted-foreground': 'oklch(0.5510 0.0234 264.3637)',
      '--accent': 'oklch(0.9491 0 0)',
      '--accent-foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--destructive': 'oklch(0.6368 0.2078 25.3313)',
      '--destructive-foreground': 'oklch(0.9851 0 0)',
      '--border': 'oklch(0.9276 0.0058 264.5313)',
      '--input': 'oklch(0.9276 0.0058 264.5313)',
      '--ring': 'oklch(0.6716 0.1368 48.5130)',
      '--sidebar': 'oklch(0.9670 0.0029 264.5419)',
      '--sidebar-foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--sidebar-primary': 'oklch(0.6716 0.1368 48.5130)',
      '--sidebar-primary-foreground': 'oklch(1.0000 0 0)',
      '--sidebar-accent': 'oklch(1.0000 0 0)',
      '--sidebar-accent-foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--sidebar-border': 'oklch(0.9276 0.0058 264.5313)',
      '--sidebar-ring': 'oklch(0.6716 0.1368 48.5130)',
    },
    dark: {
      '--background': 'oklch(0.1797 0.0043 308.1928)',
      '--foreground': 'oklch(0.8109 0 0)',
      '--card': 'oklch(0.1822 0 0)',
      '--card-foreground': 'oklch(0.8109 0 0)',
      '--popover': 'oklch(0.1797 0.0043 308.1928)',
      '--popover-foreground': 'oklch(0.8109 0 0)',
      '--primary': 'oklch(0.7214 0.1337 49.9802)',
      '--primary-foreground': 'oklch(0.1797 0.0043 308.1928)',
      '--secondary': 'oklch(0.5940 0.0443 196.0233)',
      '--secondary-foreground': 'oklch(0.1797 0.0043 308.1928)',
      '--muted': 'oklch(0.2520 0 0)',
      '--muted-foreground': 'oklch(0.6268 0 0)',
      '--accent': 'oklch(0.3211 0 0)',
      '--accent-foreground': 'oklch(0.8109 0 0)',
      '--destructive': 'oklch(0.5940 0.0443 196.0233)',
      '--destructive-foreground': 'oklch(0.1797 0.0043 308.1928)',
      '--border': 'oklch(0.2520 0 0)',
      '--input': 'oklch(0.2520 0 0)',
      '--ring': 'oklch(0.7214 0.1337 49.9802)',
      '--sidebar': 'oklch(0.1822 0 0)',
      '--sidebar-foreground': 'oklch(0.8109 0 0)',
      '--sidebar-primary': 'oklch(0.7214 0.1337 49.9802)',
      '--sidebar-primary-foreground': 'oklch(0.1797 0.0043 308.1928)',
      '--sidebar-accent': 'oklch(0.3211 0 0)',
      '--sidebar-accent-foreground': 'oklch(0.8109 0 0)',
      '--sidebar-border': 'oklch(0.2520 0 0)',
      '--sidebar-ring': 'oklch(0.7214 0.1337 49.9802)',
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