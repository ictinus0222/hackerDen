/**
 * @fileoverview Feature Flags Hook
 * Provides runtime feature flag management with gradual rollout capabilities
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../lib/config';
import { useAuth } from './useAuth';

// Feature flag context
const FeatureFlagsContext = createContext();

/**
 * Feature flags configuration interface
 */
const DEFAULT_FEATURE_FLAGS = {
  fileSharing: true,
  ideaBoard: true,
  gamification: true,
  judgeSubmissions: true,
  polling: true,
  botEnhancements: true,
  customEmoji: true,
  easterEggs: true,
  reactions: true
};

/**
 * Feature Flags Provider Component
 */
export const FeatureFlagsProvider = ({ children }) => {
  const { user } = useAuth();
  const [featureFlags, setFeatureFlags] = useState(DEFAULT_FEATURE_FLAGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeatureFlags();
  }, [user]);

  /**
   * Load feature flags from multiple sources with priority order:
   * 1. Runtime configuration (admin overrides)
   * 2. User-specific rollout settings
   * 3. Environment variables
   * 4. Default values
   */
  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start with environment-based flags
      const envFlags = {
        fileSharing: config.isFeatureEnabled('fileSharing'),
        ideaBoard: config.isFeatureEnabled('ideaBoard') ?? true,
        gamification: config.isFeatureEnabled('gamification'),
        judgeSubmissions: config.isFeatureEnabled('judgeSubmissions') ?? true,
        polling: config.isFeatureEnabled('polling'),
        botEnhancements: config.isFeatureEnabled('botEnhancements'),
        customEmoji: config.isFeatureEnabled('customEmoji') ?? true,
        easterEggs: config.isFeatureEnabled('easterEggs') ?? true,
        reactions: config.isFeatureEnabled('reactions') ?? true
      };

      // Load runtime configuration from localStorage (admin settings)
      const runtimeFlags = loadRuntimeFlags();

      // Apply user-specific rollout rules
      const userFlags = await applyUserRolloutRules(user, envFlags);

      // Merge flags with priority: runtime > user-specific > environment > defaults
      const finalFlags = {
        ...DEFAULT_FEATURE_FLAGS,
        ...envFlags,
        ...userFlags,
        ...runtimeFlags
      };

      setFeatureFlags(finalFlags);
    } catch (err) {
      console.error('Error loading feature flags:', err);
      setError(err.message);
      // Fallback to environment flags on error
      setFeatureFlags({
        ...DEFAULT_FEATURE_FLAGS,
        fileSharing: config.isFeatureEnabled('fileSharing'),
        gamification: config.isFeatureEnabled('gamification'),
        polling: config.isFeatureEnabled('polling'),
        botEnhancements: config.isFeatureEnabled('botEnhancements')
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load runtime feature flags from localStorage (admin overrides)
   */
  const loadRuntimeFlags = () => {
    try {
      const stored = localStorage.getItem('hackerden_feature_flags');
      return stored ? JSON.parse(stored) : {};
    } catch (err) {
      console.warn('Error loading runtime feature flags:', err);
      return {};
    }
  };

  /**
   * Apply user-specific rollout rules for gradual feature deployment
   */
  const applyUserRolloutRules = async (user, baseFlags) => {
    if (!user) return baseFlags;

    try {
      // Load rollout configuration
      const rolloutConfig = await loadRolloutConfiguration();
      const userFlags = { ...baseFlags };

      // Apply percentage-based rollouts
      for (const [feature, config] of Object.entries(rolloutConfig)) {
        if (config.rolloutPercentage !== undefined) {
          const userHash = hashUserId(user.$id);
          const userPercentile = userHash % 100;
          
          if (userPercentile < config.rolloutPercentage) {
            userFlags[feature] = config.enabled;
          }
        }

        // Apply user-specific overrides
        if (config.userOverrides && config.userOverrides[user.$id] !== undefined) {
          userFlags[feature] = config.userOverrides[user.$id];
        }

        // Apply role-based rules
        if (config.roleRules && user.role) {
          const roleRule = config.roleRules[user.role];
          if (roleRule !== undefined) {
            userFlags[feature] = roleRule;
          }
        }
      }

      return userFlags;
    } catch (err) {
      console.warn('Error applying user rollout rules:', err);
      return baseFlags;
    }
  };

  /**
   * Load rollout configuration from localStorage or API
   */
  const loadRolloutConfiguration = async () => {
    try {
      // Try localStorage first (for admin-configured rollouts)
      const stored = localStorage.getItem('hackerden_rollout_config');
      if (stored) {
        return JSON.parse(stored);
      }

      // Default rollout configuration
      return {
        fileSharing: { rolloutPercentage: 100, enabled: true },
        ideaBoard: { rolloutPercentage: 100, enabled: true },
        gamification: { rolloutPercentage: 90, enabled: true }, // 90% rollout
        judgeSubmissions: { rolloutPercentage: 100, enabled: true },
        polling: { rolloutPercentage: 80, enabled: true }, // 80% rollout
        botEnhancements: { rolloutPercentage: 70, enabled: true }, // 70% rollout
        customEmoji: { rolloutPercentage: 100, enabled: true },
        easterEggs: { rolloutPercentage: 50, enabled: true }, // 50% rollout
        reactions: { rolloutPercentage: 100, enabled: true }
      };
    } catch (err) {
      console.warn('Error loading rollout configuration:', err);
      return {};
    }
  };

  /**
   * Simple hash function for consistent user assignment to rollout groups
   */
  const hashUserId = (userId) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  /**
   * Update feature flag at runtime (admin function)
   */
  const updateFeatureFlag = (feature, enabled) => {
    try {
      const runtimeFlags = loadRuntimeFlags();
      runtimeFlags[feature] = enabled;
      
      localStorage.setItem('hackerden_feature_flags', JSON.stringify(runtimeFlags));
      
      setFeatureFlags(prev => ({
        ...prev,
        [feature]: enabled
      }));

      return true;
    } catch (err) {
      console.error('Error updating feature flag:', err);
      setError(`Failed to update ${feature}: ${err.message}`);
      return false;
    }
  };

  /**
   * Update rollout configuration (admin function)
   */
  const updateRolloutConfig = (feature, config) => {
    try {
      const rolloutConfig = JSON.parse(
        localStorage.getItem('hackerden_rollout_config') || '{}'
      );
      
      rolloutConfig[feature] = config;
      
      localStorage.setItem('hackerden_rollout_config', JSON.stringify(rolloutConfig));
      
      // Reload feature flags to apply new rollout rules
      loadFeatureFlags();
      
      return true;
    } catch (err) {
      console.error('Error updating rollout config:', err);
      setError(`Failed to update rollout for ${feature}: ${err.message}`);
      return false;
    }
  };

  /**
   * Reset all feature flags to defaults
   */
  const resetFeatureFlags = () => {
    try {
      localStorage.removeItem('hackerden_feature_flags');
      localStorage.removeItem('hackerden_rollout_config');
      setFeatureFlags(DEFAULT_FEATURE_FLAGS);
      return true;
    } catch (err) {
      console.error('Error resetting feature flags:', err);
      setError(`Failed to reset feature flags: ${err.message}`);
      return false;
    }
  };

  /**
   * Get feature flag status with fallback
   */
  const isFeatureEnabled = (feature) => {
    return featureFlags[feature] ?? DEFAULT_FEATURE_FLAGS[feature] ?? false;
  };

  /**
   * Check if user is in rollout group for a feature
   */
  const isInRolloutGroup = (feature) => {
    if (!user) return false;
    
    try {
      const rolloutConfig = JSON.parse(
        localStorage.getItem('hackerden_rollout_config') || '{}'
      );
      
      const config = rolloutConfig[feature];
      if (!config || config.rolloutPercentage === undefined) return true;
      
      const userHash = hashUserId(user.$id);
      const userPercentile = userHash % 100;
      
      return userPercentile < config.rolloutPercentage;
    } catch (err) {
      console.warn('Error checking rollout group:', err);
      return true; // Default to enabled on error
    }
  };

  const value = {
    featureFlags,
    loading,
    error,
    isFeatureEnabled,
    isInRolloutGroup,
    updateFeatureFlag,
    updateRolloutConfig,
    resetFeatureFlags,
    reloadFlags: loadFeatureFlags
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

/**
 * Hook to access feature flags
 */
export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  
  return context;
};

/**
 * Higher-order component for feature flag conditional rendering
 */
export const withFeatureFlag = (WrappedComponent, featureName) => {
  return function FeatureFlaggedComponent(props) {
    const { isFeatureEnabled } = useFeatureFlags();
    
    if (!isFeatureEnabled(featureName)) {
      return null;
    }
    
    return <WrappedComponent {...props} />;
  };
};

/**
 * Component for conditional feature rendering
 */
export const FeatureFlag = ({ feature, children, fallback = null }) => {
  const { isFeatureEnabled } = useFeatureFlags();
  
  return isFeatureEnabled(feature) ? children : fallback;
};

export default useFeatureFlags;