/**
 * Styling Protection Utilities
 * 
 * This module provides utilities to verify that critical CSS classes
 * and styling patterns remain intact after code modifications.
 */

// Critical CSS classes that should never be removed
export const CRITICAL_CLASSES = {
  // Layout classes - essential for structure
  layout: [
    'h-full', 'min-h-0', 'flex-1', 'flex', 'flex-col', 'flex-row',
    'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    'gap-3', 'gap-4', 'gap-6', 'space-x-2', 'space-x-3', 'space-y-3', 'space-y-4',
    'p-4', 'p-6', 'px-4', 'px-5', 'px-6', 'py-3', 'py-4', 'py-6',
    'm-4', 'mb-3', 'mb-4', 'mb-6', 'max-w-7xl', 'mx-auto'
  ],

  // Responsive classes - critical for mobile/desktop layouts
  responsive: [
    'sm:p-6', 'sm:p-8', 'sm:py-6', 'sm:px-6', 'sm:px-0', 'sm:gap-4', 'sm:gap-0',
    'sm:flex-row', 'sm:items-center', 'sm:justify-between', 'sm:grid-cols-2',
    'sm:text-base', 'sm:mb-6', 'lg:px-8', 'lg:grid', 'lg:grid-cols-3', 'lg:gap-6',
    'lg:col-span-2', 'lg:hidden', 'xl:grid-cols-4', 'hidden'
  ],

  // Theme classes - essential for dark theme
  theme: [
    'bg-dark-primary', 'bg-dark-secondary', 'bg-dark-tertiary', 'bg-dark-elevated',
    'text-dark-primary', 'text-dark-secondary', 'text-dark-tertiary', 'text-dark-muted',
    'border-dark-primary', 'border-dark-secondary'
  ],

  // Component styling classes - visual identity
  components: [
    'card-enhanced', 'rounded-xl', 'rounded-2xl', 'rounded-t-2xl', 'rounded-b-2xl',
    'border', 'border-b', 'border-t', 'border-l', 'border-r', 'border-b-2',
    'shadow-lg', 'shadow-xl'
  ],

  // Animation classes - user experience
  animations: [
    'animate-fade-in', 'animate-slide-up', 'animate-pulse', 'animate-pulse-slow',
    'transition-all', 'transition-colors', 'duration-200', 'duration-300'
  ],

  // Interactive classes - user interaction
  interactive: [
    'hover:scale-102', 'hover:bg-red-800', 'hover:text-gray-700', 'hover:border-gray-300',
    'active:bg-gray-50', 'active:bg-red-800', 'cursor-move', 'cursor-pointer',
    'select-none', 'touch-manipulation'
  ],

  // Accessibility classes - critical for a11y
  accessibility: [
    'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2',
    'focus:ring-offset-gray-900', 'sr-only', 'min-h-[44px]', 'min-w-[44px]',
    'min-h-[48px]', 'min-h-[80px]', 'min-h-[120px]'
  ],

  // Status classes - task status indicators
  status: [
    'status-todo', 'status-progress', 'status-blocked', 'status-done'
  ],

  // Height and scrolling classes - critical for layout
  heights: [
    'h-[calc(100vh-280px)]', 'h-[calc(100vh-220px)]', 'min-h-[600px]', 'min-h-[500px]',
    'min-h-screen', 'overflow-y-auto', 'max-h-[90vh]'
  ]
};

// Component-specific critical class patterns
export const COMPONENT_PATTERNS = {
  Layout: {
    header: ['bg-dark-secondary', 'border-b', 'border-dark-primary', 'shadow-lg'],
    main: ['max-w-7xl', 'mx-auto', 'py-4', 'sm:py-6', 'sm:px-6', 'lg:px-8'],
    button: ['min-h-[44px]', 'min-w-[44px]', 'touch-manipulation', 'rounded-xl', 'transition-all', 'duration-200']
  },

  Dashboard: {
    teamHeader: ['card-enhanced', 'rounded-2xl', 'p-6'],
    desktopLayout: ['hidden', 'lg:grid', 'lg:grid-cols-3', 'lg:gap-6', 'h-[calc(100vh-280px)]', 'min-h-[600px]'],
    mobileLayout: ['lg:hidden', 'h-[calc(100vh-220px)]', 'min-h-[500px]']
  },

  KanbanBoard: {
    container: ['rounded-2xl', 'p-6', 'sm:p-8', 'h-full', 'flex', 'flex-col', 'card-enhanced', 'animate-fade-in'],
    header: ['flex', 'flex-col', 'sm:flex-row', 'sm:items-center', 'sm:justify-between', 'mb-6', 'gap-4', 'sm:gap-0'],
    grid: ['flex-1', 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-4', 'gap-3', 'sm:gap-4', 'min-h-0']
  },

  TaskColumn: {
    container: ['flex', 'flex-col', 'h-full', 'animate-fade-in'],
    header: ['px-4', 'py-4', 'rounded-t-2xl'],
    content: ['flex-1', 'p-4', 'bg-dark-secondary', 'rounded-b-2xl', 'border-l', 'border-r', 'border-b', 'border-dark-primary', 'min-h-0', 'transition-all', 'duration-300']
  },

  TaskCard: {
    container: ['rounded-xl', 'p-4', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'cursor-move', 'select-none', 'touch-manipulation', 'min-h-[120px]', 'card-enhanced', 'animate-slide-up'],
    header: ['flex', 'items-start', 'justify-between', 'mb-3', 'gap-3'],
    statusBadge: ['inline-flex', 'items-center', 'px-2.5', 'py-1', 'rounded-lg', 'text-xs', 'font-semibold', 'flex-shrink-0']
  },

  Chat: {
    container: ['rounded-2xl', 'h-full', 'flex', 'flex-col', 'card-enhanced', 'animate-fade-in'],
    header: ['px-5', 'py-4', 'border-b', 'border-dark-primary', 'flex-shrink-0', 'bg-dark-tertiary', 'rounded-t-2xl'],
    footer: ['px-4', 'sm:px-6', 'py-3', 'sm:py-4', 'flex-shrink-0']
  },

  MobileTabSwitcher: {
    container: ['border-b', 'border-gray-200', 'mb-4', 'sm:mb-6'],
    nav: ['-mb-px', 'flex'],
    tab: ['flex-1', 'py-3', 'px-4', 'border-b-2', 'font-medium', 'text-sm', 'sm:text-base', 'transition-colors', 'min-h-[48px]', 'touch-manipulation']
  }
};

/**
 * Verify that an element has all required critical classes
 * @param {HTMLElement} element - The DOM element to check
 * @param {string[]} requiredClasses - Array of required class names
 * @returns {Object} - Verification result with missing classes
 */
export const verifyCriticalClasses = (element, requiredClasses) => {
  if (!element) {
    return {
      success: false,
      error: 'Element not found',
      missingClasses: requiredClasses
    };
  }

  const elementClasses = Array.from(element.classList);
  const missingClasses = requiredClasses.filter(className => {
    // Handle escaped class names (e.g., 'min-h-[44px]')
    const escapedClassName = className.replace(/[[\]]/g, '\\$&');
    return !elementClasses.some(cls => 
      cls === className || 
      cls === escapedClassName ||
      element.classList.contains(className)
    );
  });

  return {
    success: missingClasses.length === 0,
    missingClasses,
    presentClasses: elementClasses.filter(cls => requiredClasses.includes(cls))
  };
};

/**
 * Verify component-specific styling patterns
 * @param {HTMLElement} container - The container element
 * @param {string} componentName - Name of the component to verify
 * @returns {Object} - Verification results for all component elements
 */
export const verifyComponentPattern = (container, componentName) => {
  const pattern = COMPONENT_PATTERNS[componentName];
  if (!pattern) {
    return {
      success: false,
      error: `No pattern defined for component: ${componentName}`
    };
  }

  const results = {};
  let overallSuccess = true;

  Object.entries(pattern).forEach(([elementName, requiredClasses]) => {
    // Try to find the element using various strategies
    let element = null;
    
    switch (elementName) {
      case 'header':
        element = container.querySelector('header');
        break;
      case 'main':
        element = container.querySelector('main');
        break;
      case 'button':
        element = container.querySelector('button');
        break;
      case 'container':
        element = container.firstElementChild || container;
        break;
      case 'grid':
        element = container.querySelector('[role="application"]') || 
                 container.querySelector('.grid');
        break;
      case 'nav':
        element = container.querySelector('nav');
        break;
      case 'tab':
        element = container.querySelector('button[role="tab"]') ||
                 container.querySelector('nav button');
        break;
      default:
        // Try to find by class or data attribute
        element = container.querySelector(`.${elementName}`) ||
                 container.querySelector(`[data-testid="${elementName}"]`);
    }

    const verification = verifyCriticalClasses(element, requiredClasses);
    results[elementName] = verification;
    
    if (!verification.success) {
      overallSuccess = false;
    }
  });

  return {
    success: overallSuccess,
    componentName,
    results
  };
};

/**
 * Generate a styling protection report
 * @param {HTMLElement} container - The container to analyze
 * @param {string[]} components - List of component names to verify
 * @returns {Object} - Comprehensive styling report
 */
export const generateStylingReport = (container, components = []) => {
  const report = {
    timestamp: new Date().toISOString(),
    overallSuccess: true,
    components: {},
    criticalClassesFound: {},
    recommendations: []
  };

  // Verify component patterns
  components.forEach(componentName => {
    const verification = verifyComponentPattern(container, componentName);
    report.components[componentName] = verification;
    
    if (!verification.success) {
      report.overallSuccess = false;
    }
  });

  // Check for presence of critical classes across all categories
  Object.entries(CRITICAL_CLASSES).forEach(([category, classes]) => {
    const foundClasses = classes.filter(className => {
      const escapedClassName = className.replace(/[[\]]/g, '\\$&');
      return container.querySelector(`.${escapedClassName}`) !== null;
    });
    
    report.criticalClassesFound[category] = {
      total: classes.length,
      found: foundClasses.length,
      missing: classes.filter(cls => !foundClasses.includes(cls)),
      foundClasses
    };
  });

  // Generate recommendations
  if (!report.overallSuccess) {
    report.recommendations.push('Some components are missing critical styling classes');
  }

  Object.entries(report.criticalClassesFound).forEach(([category, data]) => {
    if (data.missing.length > 0) {
      report.recommendations.push(
        `Missing ${data.missing.length} critical ${category} classes: ${data.missing.slice(0, 3).join(', ')}${data.missing.length > 3 ? '...' : ''}`
      );
    }
  });

  return report;
};

/**
 * Utility to check if responsive classes are properly maintained
 * @param {HTMLElement} container - The container to check
 * @returns {Object} - Responsive classes verification result
 */
export const verifyResponsiveClasses = (container) => {
  const responsiveBreakpoints = ['sm:', 'md:', 'lg:', 'xl:'];
  const responsiveClasses = [];
  
  // Find all elements with responsive classes
  const allElements = container.querySelectorAll('*');
  allElements.forEach(element => {
    Array.from(element.classList).forEach(className => {
      if (responsiveBreakpoints.some(bp => className.startsWith(bp))) {
        responsiveClasses.push(className);
      }
    });
  });

  const uniqueResponsiveClasses = [...new Set(responsiveClasses)];
  
  return {
    success: uniqueResponsiveClasses.length > 0,
    totalResponsiveClasses: uniqueResponsiveClasses.length,
    responsiveClasses: uniqueResponsiveClasses,
    breakpointCoverage: {
      sm: uniqueResponsiveClasses.filter(cls => cls.startsWith('sm:')).length,
      md: uniqueResponsiveClasses.filter(cls => cls.startsWith('md:')).length,
      lg: uniqueResponsiveClasses.filter(cls => cls.startsWith('lg:')).length,
      xl: uniqueResponsiveClasses.filter(cls => cls.startsWith('xl:')).length
    }
  };
};

/**
 * Utility to verify animation classes are present
 * @param {HTMLElement} container - The container to check
 * @returns {Object} - Animation classes verification result
 */
export const verifyAnimationClasses = (container) => {
  const animationClasses = CRITICAL_CLASSES.animations;
  const foundAnimations = [];
  
  animationClasses.forEach(animClass => {
    const elements = container.querySelectorAll(`.${animClass}`);
    if (elements.length > 0) {
      foundAnimations.push({
        className: animClass,
        count: elements.length
      });
    }
  });

  return {
    success: foundAnimations.length > 0,
    foundAnimations,
    totalAnimatedElements: foundAnimations.reduce((sum, anim) => sum + anim.count, 0)
  };
};

/**
 * Export all utilities for easy testing
 */
export default {
  CRITICAL_CLASSES,
  COMPONENT_PATTERNS,
  verifyCriticalClasses,
  verifyComponentPattern,
  generateStylingReport,
  verifyResponsiveClasses,
  verifyAnimationClasses
};