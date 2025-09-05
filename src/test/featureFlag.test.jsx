/**
 * @fileoverview Feature Flag System Tests
 * Comprehensive tests for feature flag functionality and gradual rollout
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import feature flag system
import { featureFlagService } from '../services/featureFlagService';
import { 
  withFeatureFlag, 
  checkMultipleFeatures,
  batchUpdateFeatureFlags,
  resetToEnvironmentDefaults,
  getFeatureFlagDebugInfo,
  createFeatureTestHelper,
  isUserInRolloutGroup
} from '../utils/featureFlagUtils.jsx';
import { FeatureFlagsProvider, useFeatureFlags, FeatureFlag } from '../hooks/useFeatureFlags';

// Mock components for testing
const TestComponent = ({ message = 'Feature enabled' }) => (
  <div data-testid="test-component">{message}</div>
);

const FallbackComponent = () => (
  <div data-testid="fallback-component">Feature disabled</div>
);

// Mock auth context
const mockUser = { $id: 'user123', email: 'test@example.com' };

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    isAuthenticated: true
  })
}));

// Mock config
vi.mock('../lib/config', () => ({
  config: {
    isFeatureEnabled: vi.fn((feature) => {
      const defaults = {
        fileSharing: true,
        gamification: true,
        polling: false,
        botEnhancements: true
      };
      return defaults[feature] ?? false;
    }),
    features: {
      fileSharing: true,
      gamification: true,
      polling: false,
      botEnhancements: true
    }
  }
}));

describe('Feature Flag Service', () => {
  beforeEach(() => {
    localStorage.clear();
    featureFlagService.clearCache();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Basic Feature Flag Functionality', () => {
    it('should return environment default when no runtime flags exist', () => {
      expect(featureFlagService.isFeatureEnabled('fileSharing')).toBe(true);
      expect(featureFlagService.isFeatureEnabled('polling')).toBe(false);
    });

    it('should prioritize runtime flags over environment flags', () => {
      localStorage.setItem('hackerden_feature_flags', JSON.stringify({
        fileSharing: false,
        polling: true
      }));

      expect(featureFlagService.isFeatureEnabled('fileSharing')).toBe(false);
      expect(featureFlagService.isFeatureEnabled('polling')).toBe(true);
    });

    it('should cache feature flag results', () => {
      const spy = vi.spyOn(localStorage, 'getItem');
      
      // First call should hit localStorage
      featureFlagService.isFeatureEnabled('fileSharing');
      expect(spy).toHaveBeenCalled();
      
      spy.mockClear();
      
      // Second call should use cache
      featureFlagService.isFeatureEnabled('fileSharing');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should clear cache when requested', () => {
      featureFlagService.isFeatureEnabled('fileSharing');
      expect(featureFlagService.cache.size).toBeGreaterThan(0);
      
      featureFlagService.clearCache();
      expect(featureFlagService.cache.size).toBe(0);
    });
  });

  describe('Service Method Wrapping', () => {
    it('should wrap service methods with feature flag checking', async () => {
      const mockService = {
        getData: vi.fn().mockResolvedValue('data'),
        processData: vi.fn().mockResolvedValue('processed')
      };

      const wrappedService = featureFlagService.createFeatureFlaggedService(
        'fileSharing',
        mockService,
        { getData: () => 'fallback' }
      );

      // Feature is enabled, should call original method
      const result = await wrappedService.getData();
      expect(result).toBe('data');
      expect(mockService.getData).toHaveBeenCalled();
    });

    it('should return fallback when feature is disabled', async () => {
      const mockService = {
        getData: vi.fn().mockResolvedValue('data')
      };

      const wrappedService = featureFlagService.createFeatureFlaggedService(
        'polling', // This feature is disabled
        mockService,
        { getData: () => 'fallback' }
      );

      const result = await wrappedService.getData();
      expect(result).toBe('fallback');
      expect(mockService.getData).not.toHaveBeenCalled();
    });

    it('should handle service method errors gracefully for non-critical features', async () => {
      const mockService = {
        getData: vi.fn().mockRejectedValue(new Error('Service error'))
      };

      const wrappedService = featureFlagService.createFeatureFlaggedService(
        'gamification', // Non-critical feature
        mockService,
        { getData: () => 'fallback' }
      );

      const result = await wrappedService.getData();
      expect(result).toBe('fallback');
    });
  });

  describe('Feature Status and Validation', () => {
    it('should provide comprehensive feature status', () => {
      localStorage.setItem('hackerden_feature_flags', JSON.stringify({
        fileSharing: false
      }));

      const status = featureFlagService.getFeatureStatus();
      
      expect(status.fileSharing).toEqual({
        enabled: false,
        source: 'runtime'
      });
      
      expect(status.gamification).toEqual({
        enabled: true,
        source: 'environment'
      });
    });

    it('should validate configuration and detect issues', () => {
      localStorage.setItem('hackerden_feature_flags', JSON.stringify({
        unknownFeature: true,
        fileSharing: false
      }));

      const validation = featureFlagService.validateConfiguration();
      
      expect(validation.warnings).toContain('Unknown feature flag: unknownFeature');
      expect(validation.warnings).toContain('Runtime flag for fileSharing overrides environment setting');
    });
  });
});

describe('Gradual Rollout System', () => {
  beforeEach(() => {
    localStorage.clear();
    featureFlagService.clearCache();
  });

  describe('User Assignment', () => {
    it('should consistently assign users to rollout groups', () => {
      // Set up 50% rollout
      localStorage.setItem('hackerden_rollout_config', JSON.stringify({
        testFeature: {
          rolloutPercentage: 50,
          enabled: true
        }
      }));

      // Same user should always get same assignment
      const assignment1 = isUserInRolloutGroup('testFeature', 'user123');
      const assignment2 = isUserInRolloutGroup('testFeature', 'user123');
      
      expect(assignment1).toBe(assignment2);
    });

    it('should respect user-specific overrides', () => {
      localStorage.setItem('hackerden_rollout_config', JSON.stringify({
        testFeature: {
          rolloutPercentage: 0, // 0% rollout
          enabled: true,
          userOverrides: {
            'user123': true // But this user is explicitly enabled
          }
        }
      }));

      expect(isUserInRolloutGroup('testFeature', 'user123')).toBe(true);
      expect(isUserInRolloutGroup('testFeature', 'user456')).toBe(false);
    });

    it('should handle rollout percentage boundaries correctly', () => {
      // Test 0% rollout
      localStorage.setItem('hackerden_rollout_config', JSON.stringify({
        testFeature: { rolloutPercentage: 0, enabled: true }
      }));
      
      // Should be false for any user (unless overridden)
      expect(isUserInRolloutGroup('testFeature', 'anyuser')).toBe(false);

      // Test 100% rollout
      localStorage.setItem('hackerden_rollout_config', JSON.stringify({
        testFeature: { rolloutPercentage: 100, enabled: true }
      }));
      
      expect(isUserInRolloutGroup('testFeature', 'anyuser')).toBe(true);
    });
  });
});

describe('Backward Compatibility', () => {
  beforeEach(() => {
    localStorage.clear();
    featureFlagService.clearCache();
  });

  describe('Missing Enhancement Data Handling', () => {
    it('should handle missing feature flag data gracefully', () => {
      // Clear all localStorage to simulate missing data
      localStorage.clear();
      
      // Should fall back to environment defaults
      expect(featureFlagService.isFeatureEnabled('fileSharing')).toBe(true);
      expect(featureFlagService.isFeatureEnabled('unknownFeature')).toBe(false);
    });

    it('should handle corrupted localStorage data', () => {
      // Set invalid JSON
      localStorage.setItem('hackerden_feature_flags', 'invalid json');
      
      // Should fall back to environment defaults without crashing
      expect(() => featureFlagService.isFeatureEnabled('fileSharing')).not.toThrow();
      expect(featureFlagService.isFeatureEnabled('fileSharing')).toBe(true);
    });

    it('should handle missing rollout configuration', () => {
      // No rollout config should default to 100% rollout
      expect(isUserInRolloutGroup('fileSharing', 'user123')).toBe(true);
    });
  });

  describe('Service Integration', () => {
    it('should provide isAvailable method for all wrapped services', () => {
      const mockService = {
        getData: vi.fn()
      };

      const wrappedService = featureFlagService.createFeatureFlaggedService(
        'fileSharing',
        mockService
      );

      expect(wrappedService.isAvailable).toBeDefined();
      expect(typeof wrappedService.isAvailable).toBe('function');
      expect(wrappedService.isAvailable()).toBe(true);
    });

    it('should maintain service method signatures', async () => {
      const mockService = {
        getData: vi.fn().mockResolvedValue('data'),
        processData: vi.fn((input) => `processed: ${input}`)
      };

      const wrappedService = featureFlagService.createFeatureFlaggedService(
        'fileSharing',
        mockService
      );

      // Should maintain async behavior
      const result1 = await wrappedService.getData();
      expect(result1).toBe('data');

      // Should maintain parameter passing
      const result2 = await wrappedService.processData('test');
      expect(result2).toBe('processed: test');
    });
  });
});

describe('React Integration', () => {
  const TestWrapper = ({ children }) => (
    <FeatureFlagsProvider>
      {children}
    </FeatureFlagsProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  describe('FeatureFlag Component', () => {
    it('should render children when feature is enabled', () => {
      render(
        <TestWrapper>
          <FeatureFlag feature="fileSharing">
            <TestComponent />
          </FeatureFlag>
        </TestWrapper>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should render fallback when feature is disabled', () => {
      render(
        <TestWrapper>
          <FeatureFlag feature="polling" fallback={<FallbackComponent />}>
            <TestComponent />
          </FeatureFlag>
        </TestWrapper>
      );

      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback-component')).toBeInTheDocument();
    });

    it('should render nothing when feature is disabled and no fallback provided', () => {
      render(
        <TestWrapper>
          <FeatureFlag feature="polling">
            <TestComponent />
          </FeatureFlag>
        </TestWrapper>
      );

      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fallback-component')).not.toBeInTheDocument();
    });
  });

  describe('useFeatureFlags Hook', () => {
    const HookTestComponent = () => {
      const { isFeatureEnabled, featureFlags, loading } = useFeatureFlags();
      
      if (loading) return <div data-testid="loading">Loading...</div>;
      
      return (
        <div>
          <div data-testid="file-sharing">
            {isFeatureEnabled('fileSharing') ? 'enabled' : 'disabled'}
          </div>
          <div data-testid="polling">
            {isFeatureEnabled('polling') ? 'enabled' : 'disabled'}
          </div>
          <div data-testid="flags-count">
            {Object.keys(featureFlags).length}
          </div>
        </div>
      );
    };

    it('should provide feature flag status through hook', async () => {
      render(
        <TestWrapper>
          <HookTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('file-sharing')).toHaveTextContent('enabled');
      expect(screen.getByTestId('polling')).toHaveTextContent('disabled');
      expect(screen.getByTestId('flags-count')).toHaveTextContent('9'); // All feature flags
    });
  });
});