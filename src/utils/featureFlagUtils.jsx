/**
 * @fileoverview Feature Flag Utilities
 * Utility functions for feature flag integration and testing
 */

import { featureFlagService } from '../services/featureFlagService';

/**
 * Create a feature-flagged version of a component
 * @param {React.Component} Component - Component to wrap
 * @param {string} featureName - Feature flag name
 * @param {React.Component|null} FallbackComponent - Component to render when feature is disabled
 * @returns {React.Component} Feature-flagged component
 */
export const withFeatureFlag = (Component, featureName, FallbackComponent = null) => {
  const FeatureFlaggedComponent = (props) => {
    const isEnabled = featureFlagService.isFeatureEnabled(featureName);
    
    if (!isEnabled) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
  
  FeatureFlaggedComponent.displayName = `withFeatureFlag(${Component.displayName || Component.name})`;
  return FeatureFlaggedComponent;
};

/**
 * Create a conditional render function based on feature flags
 * @param {string} featureName - Feature flag name
 * @returns {Function} Conditional render function
 */
export const createFeatureRenderer = (featureName) => {
  return (enabledContent, disabledContent = null) => {
    const isEnabled = featureFlagService.isFeatureEnabled(featureName);
    return isEnabled ? enabledContent : disabledContent;
  };
};

/**
 * Check multiple feature flags at once
 * @param {string[]} features - Array of feature names
 * @param {string} operator - 'AND' or 'OR' logic
 * @returns {boolean} Combined result
 */
export const checkMultipleFeatures = (features, operator = 'AND') => {
  const results = features.map(feature => featureFlagService.isFeatureEnabled(feature));
  
  if (operator === 'OR') {
    return results.some(result => result);
  }
  
  return results.every(result => result);
};

/**
 * Get feature-specific CSS classes
 * @param {string} featureName - Feature flag name
 * @param {string} enabledClasses - Classes when feature is enabled
 * @param {string} disabledClasses - Classes when feature is disabled
 * @returns {string} CSS classes
 */
export const getFeatureClasses = (featureName, enabledClasses = '', disabledClasses = '') => {
  const isEnabled = featureFlagService.isFeatureEnabled(featureName);
  return isEnabled ? enabledClasses : disabledClasses;
};

/**
 * Create a feature flag hook for React components
 * @param {string} featureName - Feature flag name
 * @returns {Object} Hook result with feature status and utilities
 */
export const createFeatureHook = (featureName) => {
  return () => {
    const isEnabled = featureFlagService.isFeatureEnabled(featureName);
    
    return {
      isEnabled,
      isDisabled: !isEnabled,
      renderWhenEnabled: (content) => isEnabled ? content : null,
      renderWhenDisabled: (content) => !isEnabled ? content : null,
      getClasses: (enabledClasses, disabledClasses) => 
        getFeatureClasses(featureName, enabledClasses, disabledClasses)
    };
  };
};

/**
 * Batch update multiple feature flags (for testing)
 * @param {Object} flags - Object with feature names as keys and boolean values
 */
export const batchUpdateFeatureFlags = (flags) => {
  try {
    const currentFlags = JSON.parse(localStorage.getItem('hackerden_feature_flags') || '{}');
    const updatedFlags = { ...currentFlags, ...flags };
    localStorage.setItem('hackerden_feature_flags', JSON.stringify(updatedFlags));
    featureFlagService.clearCache();
    
    // Trigger a custom event for components to react to flag changes
    window.dispatchEvent(new CustomEvent('featureFlagsUpdated', { detail: updatedFlags }));
    
    return true;
  } catch (error) {
    console.error('Error batch updating feature flags:', error);
    return false;
  }
};

/**
 * Reset feature flags to environment defaults
 */
export const resetToEnvironmentDefaults = () => {
  try {
    localStorage.removeItem('hackerden_feature_flags');
    localStorage.removeItem('hackerden_rollout_config');
    featureFlagService.clearCache();
    
    window.dispatchEvent(new CustomEvent('featureFlagsReset'));
    return true;
  } catch (error) {
    console.error('Error resetting feature flags:', error);
    return false;
  }
};

/**
 * Get feature flag debug information
 * @returns {Object} Debug information
 */
export const getFeatureFlagDebugInfo = () => {
  const status = featureFlagService.getFeatureStatus();
  const validation = featureFlagService.validateConfiguration();
  
  return {
    status,
    validation,
    runtimeFlags: featureFlagService.getRuntimeFlags(),
    environmentFlags: Object.fromEntries(
      Object.entries(status).map(([feature, info]) => [
        feature,
        info.source === 'environment' ? info.enabled : 'not set'
      ])
    ),
    cacheInfo: {
      size: featureFlagService.cache.size,
      entries: Array.from(featureFlagService.cache.keys())
    }
  };
};

/**
 * Create a feature flag test helper
 * @param {string} featureName - Feature flag name
 * @returns {Object} Test helper functions
 */
export const createFeatureTestHelper = (featureName) => {
  return {
    enable: () => batchUpdateFeatureFlags({ [featureName]: true }),
    disable: () => batchUpdateFeatureFlags({ [featureName]: false }),
    toggle: () => {
      const current = featureFlagService.isFeatureEnabled(featureName);
      return batchUpdateFeatureFlags({ [featureName]: !current });
    },
    isEnabled: () => featureFlagService.isFeatureEnabled(featureName),
    reset: () => {
      const flags = featureFlagService.getRuntimeFlags();
      delete flags[featureName];
      localStorage.setItem('hackerden_feature_flags', JSON.stringify(flags));
      featureFlagService.clearCache();
    }
  };
};

/**
 * Monitor feature flag changes
 * @param {Function} callback - Callback function to call when flags change
 * @returns {Function} Cleanup function
 */
export const monitorFeatureFlagChanges = (callback) => {
  const handleFlagUpdate = (event) => {
    callback(event.detail);
  };
  
  const handleFlagReset = () => {
    callback({});
  };
  
  window.addEventListener('featureFlagsUpdated', handleFlagUpdate);
  window.addEventListener('featureFlagsReset', handleFlagReset);
  
  return () => {
    window.removeEventListener('featureFlagsUpdated', handleFlagUpdate);
    window.removeEventListener('featureFlagsReset', handleFlagReset);
  };
};

/**
 * Create a gradual rollout configuration
 * @param {string} featureName - Feature flag name
 * @param {number} percentage - Rollout percentage (0-100)
 * @param {Object} options - Additional rollout options
 * @returns {boolean} Success status
 */
export const createGradualRollout = (featureName, percentage, options = {}) => {
  try {
    const rolloutConfig = JSON.parse(
      localStorage.getItem('hackerden_rollout_config') || '{}'
    );
    
    rolloutConfig[featureName] = {
      rolloutPercentage: Math.max(0, Math.min(100, percentage)),
      enabled: true,
      ...options
    };
    
    localStorage.setItem('hackerden_rollout_config', JSON.stringify(rolloutConfig));
    featureFlagService.clearCache();
    
    return true;
  } catch (error) {
    console.error('Error creating gradual rollout:', error);
    return false;
  }
};

/**
 * Check if user is in rollout group for a feature
 * @param {string} featureName - Feature flag name
 * @param {string} userId - User ID
 * @returns {boolean} Whether user is in rollout group
 */
export const isUserInRolloutGroup = (featureName, userId) => {
  try {
    const rolloutConfig = JSON.parse(
      localStorage.getItem('hackerden_rollout_config') || '{}'
    );
    
    const config = rolloutConfig[featureName];
    if (!config || config.rolloutPercentage === undefined) {
      return true; // Default to enabled if no rollout config
    }
    
    // Check user-specific overrides first
    if (config.userOverrides && config.userOverrides[userId] !== undefined) {
      return config.userOverrides[userId];
    }
    
    // Use consistent hash-based assignment
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const userPercentile = Math.abs(hash) % 100;
    return userPercentile < config.rolloutPercentage;
  } catch (error) {
    console.warn('Error checking rollout group:', error);
    return true; // Default to enabled on error
  }
};

export default {
  withFeatureFlag,
  createFeatureRenderer,
  checkMultipleFeatures,
  getFeatureClasses,
  createFeatureHook,
  batchUpdateFeatureFlags,
  resetToEnvironmentDefaults,
  getFeatureFlagDebugInfo,
  createFeatureTestHelper,
  monitorFeatureFlagChanges,
  createGradualRollout,
  isUserInRolloutGroup
};