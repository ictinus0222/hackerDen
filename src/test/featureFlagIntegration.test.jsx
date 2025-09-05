/**
 * @fileoverview Feature Flag Integration Tests
 * Tests to verify feature flag system integrates properly with existing components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FeatureFlagsProvider, FeatureFlag } from '../hooks/useFeatureFlags';
import { featureFlagService } from '../services/featureFlagService';

// Simple test components
const TestComponent = () => <div data-testid="test-component">Feature enabled</div>;
const FallbackComponent = () => <div data-testid="fallback-component">Feature disabled</div>;

// Mock auth context
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user123', email: 'test@example.com' },
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
        gamification: false,
        polling: true
      };
      return defaults[feature] ?? false;
    }),
    features: {
      fileSharing: true,
      gamification: false,
      polling: true
    }
  }
}));

describe('Feature Flag Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    featureFlagService.clearCache();
  });

  describe('Basic Integration', () => {
    it('should integrate with React components using FeatureFlag wrapper', () => {
      render(
        <FeatureFlagsProvider>
          <FeatureFlag feature="fileSharing">
            <TestComponent />
          </FeatureFlag>
        </FeatureFlagsProvider>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should show fallback when feature is disabled', () => {
      render(
        <FeatureFlagsProvider>
          <FeatureFlag feature="gamification" fallback={<FallbackComponent />}>
            <TestComponent />
          </FeatureFlag>
        </FeatureFlagsProvider>
      );

      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback-component')).toBeInTheDocument();
    });

    it('should respect runtime flag overrides', () => {
      // Override environment setting
      localStorage.setItem('hackerden_feature_flags', JSON.stringify({
        gamification: true // Override disabled environment setting
      }));

      render(
        <FeatureFlagsProvider>
          <FeatureFlag feature="gamification">
            <TestComponent />
          </FeatureFlag>
        </FeatureFlagsProvider>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('Service Integration', () => {
    it('should wrap services with feature flag checking', async () => {
      const mockService = {
        getData: vi.fn().mockResolvedValue('test data')
      };

      const wrappedService = featureFlagService.createFeatureFlaggedService(
        'fileSharing',
        mockService,
        { getData: () => 'fallback data' }
      );

      const result = await wrappedService.getData();
      expect(result).toBe('test data');
      expect(mockService.getData).toHaveBeenCalled();
    });

    it('should return fallback when service feature is disabled', async () => {
      const mockService = {
        getData: vi.fn().mockResolvedValue('test data')
      };

      const wrappedService = featureFlagService.createFeatureFlaggedService(
        'gamification', // This is disabled
        mockService,
        { getData: () => 'fallback data' }
      );

      const result = await wrappedService.getData();
      expect(result).toBe('fallback data');
      expect(mockService.getData).not.toHaveBeenCalled();
    });

    it('should provide isAvailable method', () => {
      const mockService = { getData: vi.fn() };
      
      const wrappedService = featureFlagService.createFeatureFlaggedService(
        'fileSharing',
        mockService
      );

      expect(wrappedService.isAvailable()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not crash
      expect(() => {
        featureFlagService.isFeatureEnabled('fileSharing');
      }).not.toThrow();

      // Should fall back to environment default
      expect(featureFlagService.isFeatureEnabled('fileSharing')).toBe(true);

      // Restore localStorage
      localStorage.getItem = originalGetItem;
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('hackerden_feature_flags', 'invalid json');

      // Should not crash and fall back to environment defaults
      expect(() => {
        featureFlagService.isFeatureEnabled('fileSharing');
      }).not.toThrow();

      expect(featureFlagService.isFeatureEnabled('fileSharing')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should cache feature flag results', () => {
      const spy = vi.spyOn(localStorage, 'getItem');
      
      // First call
      featureFlagService.isFeatureEnabled('fileSharing');
      const firstCallCount = spy.mock.calls.length;
      
      // Second call should use cache
      featureFlagService.isFeatureEnabled('fileSharing');
      const secondCallCount = spy.mock.calls.length;
      
      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should clear cache when requested', () => {
      featureFlagService.isFeatureEnabled('fileSharing');
      expect(featureFlagService.cache.size).toBeGreaterThan(0);
      
      featureFlagService.clearCache();
      expect(featureFlagService.cache.size).toBe(0);
    });
  });

  describe('Validation', () => {
    it('should validate feature flag configuration', () => {
      localStorage.setItem('hackerden_feature_flags', JSON.stringify({
        unknownFeature: true,
        fileSharing: false
      }));

      const validation = featureFlagService.validateConfiguration();
      
      expect(validation.warnings).toContain('Unknown feature flag: unknownFeature');
      expect(validation.warnings.some(w => w.includes('fileSharing'))).toBe(true);
    });

    it('should provide feature status information', () => {
      localStorage.setItem('hackerden_feature_flags', JSON.stringify({
        fileSharing: false
      }));

      const status = featureFlagService.getFeatureStatus();
      
      expect(status.fileSharing).toEqual({
        enabled: false,
        source: 'runtime'
      });
      
      expect(status.polling).toEqual({
        enabled: true,
        source: 'environment'
      });
    });
  });
});