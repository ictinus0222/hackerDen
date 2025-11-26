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
  
  // Halloween theme configuration
  halloween: {
    fonts: {
      primary: "'Creepster', 'Nosifer', cursive",
      heading: "'Creepster', 'Nosifer', 'Georgia', 'Times New Roman', serif",
      fallback: "'Georgia', 'Times New Roman', serif",
      display: 'swap' // font-display value for optimal loading
    },
    colors: {
      light: {
        '--halloween-primary': 'oklch(0.65 0.19 45)',           // Pumpkin orange
        '--halloween-primary-hover': 'oklch(0.70 0.22 45)',     // Brighter orange
        '--halloween-primary-active': 'oklch(0.60 0.17 45)',    // Darker orange
        '--halloween-secondary': 'oklch(0.45 0.15 300)',        // Deep purple
        '--halloween-secondary-hover': 'oklch(0.50 0.18 300)',  // Brighter purple
        '--halloween-secondary-active': 'oklch(0.40 0.13 300)', // Darker purple
        '--halloween-accent': 'oklch(0.35 0.08 150)',           // Dark green
        '--halloween-accent-hover': 'oklch(0.40 0.10 150)',     // Brighter green
        '--halloween-accent-active': 'oklch(0.30 0.06 150)',    // Darker green
        '--halloween-background': 'oklch(0.95 0.02 45)',        // Light cream
        '--halloween-foreground': 'oklch(0.15 0.05 30)',        // Dark brown
        '--halloween-border': 'oklch(0.30 0.10 45)',            // Dark orange border
        '--halloween-card': 'oklch(0.97 0.01 45)',              // Off-white card
        '--halloween-card-foreground': 'oklch(0.15 0.05 30)',   // Dark text
        '--halloween-muted': 'oklch(0.85 0.03 45)',             // Muted background
        '--halloween-muted-foreground': 'oklch(0.40 0.08 45)',  // Muted text
        '--halloween-glow': 'oklch(0.70 0.22 45)',              // Bright orange glow
      },
      dark: {
        '--halloween-primary': 'oklch(0.70 0.22 45)',           // Bright orange
        '--halloween-primary-hover': 'oklch(0.75 0.25 45)',     // Brighter orange
        '--halloween-primary-active': 'oklch(0.65 0.19 45)',    // Darker orange
        '--halloween-secondary': 'oklch(0.55 0.18 300)',        // Purple
        '--halloween-secondary-hover': 'oklch(0.60 0.21 300)',  // Brighter purple
        '--halloween-secondary-active': 'oklch(0.50 0.15 300)', // Darker purple
        '--halloween-accent': 'oklch(0.45 0.10 150)',           // Green
        '--halloween-accent-hover': 'oklch(0.50 0.12 150)',     // Brighter green
        '--halloween-accent-active': 'oklch(0.40 0.08 150)',    // Darker green
        '--halloween-background': 'oklch(0.12 0.02 300)',       // Very dark purple
        '--halloween-foreground': 'oklch(0.85 0.05 45)',        // Light orange-white
        '--halloween-border': 'oklch(0.40 0.15 45)',            // Medium orange border
        '--halloween-card': 'oklch(0.15 0.03 300)',             // Dark purple card
        '--halloween-card-foreground': 'oklch(0.85 0.05 45)',   // Light text
        '--halloween-muted': 'oklch(0.20 0.04 300)',            // Muted background
        '--halloween-muted-foreground': 'oklch(0.60 0.10 45)',  // Muted text
        '--halloween-glow': 'oklch(0.75 0.25 45)',              // Intense orange glow
      }
    },
    effects: {
      '--halloween-shadow': '0 0 20px var(--halloween-glow)',
      '--halloween-text-shadow': '0 0 10px var(--halloween-glow)',
      '--halloween-border-width': '2px',
      '--halloween-border-style': 'solid',
    }
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

/**
 * Apply Halloween theme CSS variables to the document root
 * @param {string} baseTheme - 'light' or 'dark'
 * @param {boolean} enabled - Whether Halloween mode is enabled
 */
export function applyHalloweenTheme(baseTheme, enabled) {
  const root = document.documentElement;
  
  if (!enabled) {
    // Remove Halloween theme class
    root.classList.remove('theme-halloween');
    return;
  }
  
  // Add Halloween theme class
  root.classList.add('theme-halloween');
  
  // Apply Halloween CSS variables
  const variables = THEME_CONFIG.halloween.colors[baseTheme];
  const effects = THEME_CONFIG.halloween.effects;
  
  if (variables) {
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
  
  if (effects) {
    Object.entries(effects).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
}

/**
 * Get Halloween theme colors for programmatic use
 * @param {string} baseTheme - 'light' or 'dark'
 * @returns {object} Halloween color values
 */
export function getHalloweenColors(baseTheme) {
  const colors = THEME_CONFIG.halloween.colors[baseTheme];
  if (!colors) return {};
  
  return {
    primary: colors['--halloween-primary'],
    secondary: colors['--halloween-secondary'],
    accent: colors['--halloween-accent'],
    background: colors['--halloween-background'],
    foreground: colors['--halloween-foreground'],
    border: colors['--halloween-border'],
    glow: colors['--halloween-glow'],
  };
}

/**
 * Check if Halloween theme is currently active
 * @returns {boolean} Whether Halloween theme is active
 */
export function isHalloweenThemeActive() {
  return document.documentElement.classList.contains('theme-halloween');
}

/**
 * Preload Halloween fonts for better performance
 * @returns {Promise<void>} Resolves when fonts are loaded or fails
 */
export function preloadHalloweenFonts() {
  if (!('fonts' in document)) {
    console.warn('Font Loading API not supported');
    return Promise.resolve();
  }
  
  const fonts = [
    new FontFace('Creepster', 'url(https://fonts.gstatic.com/s/creepster/v13/AlZy_zVUqJz4yMrniH4hdXf4XB0Tow.woff2)', {
      style: 'normal',
      weight: '400',
      display: 'swap'
    }),
    new FontFace('Nosifer', 'url(https://fonts.gstatic.com/s/nosifer/v22/ZGjXol5JTp0g5bxZaC1RVDNdGDs.woff2)', {
      style: 'normal',
      weight: '400',
      display: 'swap'
    })
  ];
  
  return Promise.all(
    fonts.map(font => 
      font.load()
        .then(loadedFont => {
          document.fonts.add(loadedFont);
          return loadedFont;
        })
        .catch(error => {
          console.warn(`Failed to load Halloween font: ${font.family}`, error);
          return null;
        })
    )
  );
}

/**
 * Validate Halloween theme configuration
 * @returns {boolean} Whether configuration is valid
 */
export function validateHalloweenConfig() {
  const config = THEME_CONFIG.halloween;
  
  if (!config) {
    console.error('Halloween theme configuration not found');
    return false;
  }
  
  if (!config.colors || !config.colors.light || !config.colors.dark) {
    console.error('Halloween theme colors not properly configured');
    return false;
  }
  
  if (!config.fonts || !config.fonts.heading) {
    console.error('Halloween theme fonts not properly configured');
    return false;
  }
  
  return true;
}