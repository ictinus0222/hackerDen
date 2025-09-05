/**
 * @fileoverview Feature Flag Service
 * Provides service-level feature flag integration and graceful degradation
 */

import { config } from '../lib/config';

/**
 * Service wrapper that provides feature flag checking and graceful degradation
 */
class FeatureFlagService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Check if a feature is enabled with caching
   * @param {string} feature - Feature name
   * @returns {boolean} Whether feature is enabled
   */
  isFeatureEnabled(feature) {
    const cacheKey = `feature_${feature}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }

    // Check runtime flags first (localStorage)
    const runtimeFlags = this.getRuntimeFlags();
    if (runtimeFlags[feature] !== undefined) {
      this.cache.set(cacheKey, { value: runtimeFlags[feature], timestamp: Date.now() });
      return runtimeFlags[feature];
    }

    // Fall back to environment config
    const envValue = config.isFeatureEnabled(feature);
    this.cache.set(cacheKey, { value: envValue, timestamp: Date.now() });
    return envValue;
  }

  /**
   * Get runtime feature flags from localStorage
   * @returns {Object} Runtime feature flags
   */
  getRuntimeFlags() {
    try {
      const stored = localStorage.getItem('hackerden_feature_flags');
      return stored ? JSON.parse(stored) : {};
    } catch (err) {
      console.warn('Error loading runtime feature flags:', err);
      return {};
    }
  }

  /**
   * Wrap a service method with feature flag checking
   * @param {string} feature - Feature name
   * @param {Function} serviceMethod - Service method to wrap
   * @param {*} fallbackValue - Value to return if feature is disabled
   * @returns {Function} Wrapped service method
   */
  wrapServiceMethod(feature, serviceMethod, fallbackValue = null) {
    return async (...args) => {
      if (!this.isFeatureEnabled(feature)) {
        console.info(`Feature ${feature} is disabled, returning fallback value`);
        return fallbackValue;
      }

      try {
        return await serviceMethod(...args);
      } catch (error) {
        console.error(`Error in ${feature} service method:`, error);
        
        // For non-critical features, return fallback instead of throwing
        if (this.isNonCriticalFeature(feature)) {
          return fallbackValue;
        }
        
        throw error;
      }
    };
  }

  /**
   * Check if a feature is non-critical (can fail gracefully)
   * @param {string} feature - Feature name
   * @returns {boolean} Whether feature is non-critical
   */
  isNonCriticalFeature(feature) {
    const nonCriticalFeatures = [
      'gamification',
      'reactions',
      'easterEggs',
      'botEnhancements',
      'customEmoji'
    ];
    return nonCriticalFeatures.includes(feature);
  }

  /**
   * Create a feature-flagged service wrapper
   * @param {string} feature - Feature name
   * @param {Object} service - Service object to wrap
   * @param {Object} fallbacks - Fallback methods/values
   * @returns {Object} Wrapped service
   */
  createFeatureFlaggedService(feature, service, fallbacks = {}) {
    if (!this.isFeatureEnabled(feature)) {
      return this.createFallbackService(fallbacks);
    }

    // Wrap all service methods with error handling
    const wrappedService = {};
    
    for (const [methodName, method] of Object.entries(service)) {
      if (typeof method === 'function') {
        wrappedService[methodName] = this.wrapServiceMethod(
          feature,
          method.bind(service),
          fallbacks[methodName]
        );
      } else {
        wrappedService[methodName] = method;
      }
    }

    // Add availability check method
    wrappedService.isAvailable = () => this.isFeatureEnabled(feature);
    
    return wrappedService;
  }

  /**
   * Create a fallback service that returns safe defaults
   * @param {Object} fallbacks - Fallback methods/values
   * @returns {Object} Fallback service
   */
  createFallbackService(fallbacks = {}) {
    const fallbackService = {
      isAvailable: () => false,
      ...fallbacks
    };

    // Ensure all methods return promises for consistency
    for (const [key, value] of Object.entries(fallbackService)) {
      if (typeof value === 'function' && key !== 'isAvailable') {
        fallbackService[key] = async (...args) => {
          const result = value(...args);
          return result instanceof Promise ? result : Promise.resolve(result);
        };
      }
    }

    return fallbackService;
  }

  /**
   * Clear feature flag cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get feature flag status summary
   * @returns {Object} Feature flag status
   */
  getFeatureStatus() {
    const features = [
      'fileSharing',
      'ideaBoard',
      'gamification',
      'judgeSubmissions',
      'polling',
      'botEnhancements',
      'customEmoji',
      'easterEggs',
      'reactions'
    ];

    const status = {};
    features.forEach(feature => {
      status[feature] = {
        enabled: this.isFeatureEnabled(feature),
        source: this.getFeatureSource(feature)
      };
    });

    return status;
  }

  /**
   * Get the source of a feature flag value
   * @param {string} feature - Feature name
   * @returns {string} Source of the feature flag
   */
  getFeatureSource(feature) {
    const runtimeFlags = this.getRuntimeFlags();
    if (runtimeFlags[feature] !== undefined) {
      return 'runtime';
    }
    
    if (config.features[feature] !== undefined) {
      return 'environment';
    }
    
    return 'default';
  }

  /**
   * Validate feature flag configuration
   * @returns {Object} Validation results
   */
  validateConfiguration() {
    const issues = [];
    const warnings = [];

    try {
      // Check for conflicting configurations
      const runtimeFlags = this.getRuntimeFlags();
      const envFlags = config.features;

      for (const feature in runtimeFlags) {
        if (envFlags[feature] !== undefined && envFlags[feature] !== runtimeFlags[feature]) {
          warnings.push(`Runtime flag for ${feature} overrides environment setting`);
        }
      }

      // Check for unknown features
      const knownFeatures = [
        'fileSharing', 'ideaBoard', 'gamification', 'judgeSubmissions',
        'polling', 'botEnhancements', 'customEmoji', 'easterEggs', 'reactions'
      ];

      for (const feature in runtimeFlags) {
        if (!knownFeatures.includes(feature)) {
          warnings.push(`Unknown feature flag: ${feature}`);
        }
      }

    } catch (error) {
      issues.push(`Configuration validation error: ${error.message}`);
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();
export default featureFlagService;