/**
 * @fileoverview Feature Flag System Demo
 * Demonstrates the feature flag system functionality
 */

import { featureFlagService } from '../services/featureFlagService';
import { 
  batchUpdateFeatureFlags, 
  createGradualRollout, 
  isUserInRolloutGroup,
  getFeatureFlagDebugInfo 
} from './featureFlagUtils.jsx';

/**
 * Demo script to showcase feature flag functionality
 */
export const runFeatureFlagDemo = () => {
  console.log('🚀 Feature Flag System Demo');
  console.log('============================');

  // 1. Show current feature status
  console.log('\n1. Current Feature Status:');
  const status = featureFlagService.getFeatureStatus();
  Object.entries(status).forEach(([feature, info]) => {
    console.log(`   ${feature}: ${info.enabled ? '✅' : '❌'} (${info.source})`);
  });

  // 2. Demonstrate runtime flag override
  console.log('\n2. Runtime Flag Override:');
  console.log('   Before: fileSharing =', featureFlagService.isFeatureEnabled('fileSharing'));
  
  batchUpdateFeatureFlags({ fileSharing: false });
  console.log('   After override: fileSharing =', featureFlagService.isFeatureEnabled('fileSharing'));

  // 3. Demonstrate gradual rollout
  console.log('\n3. Gradual Rollout Demo:');
  createGradualRollout('gamification', 50); // 50% rollout
  
  const testUsers = ['user1', 'user2', 'user3', 'user4', 'user5'];
  testUsers.forEach(userId => {
    const inRollout = isUserInRolloutGroup('gamification', userId);
    console.log(`   ${userId}: ${inRollout ? '✅ In rollout' : '❌ Not in rollout'}`);
  });

  // 4. Service wrapping demo
  console.log('\n4. Service Wrapping Demo:');
  const mockService = {
    getData: () => 'original data',
    processData: (input) => `processed: ${input}`
  };

  const wrappedService = featureFlagService.createFeatureFlaggedService(
    'fileSharing', // Currently disabled from step 2
    mockService,
    { 
      getData: () => 'fallback data',
      processData: (input) => `fallback: ${input}`
    }
  );

  console.log('   Service available:', wrappedService.isAvailable());
  console.log('   getData result:', wrappedService.getData());
  console.log('   processData result:', wrappedService.processData('test'));

  // 5. Debug information
  console.log('\n5. Debug Information:');
  const debugInfo = getFeatureFlagDebugInfo();
  console.log('   Runtime flags:', debugInfo.runtimeFlags);
  console.log('   Cache size:', debugInfo.cacheInfo.size);
  console.log('   Validation issues:', debugInfo.validation.issues.length);
  console.log('   Validation warnings:', debugInfo.validation.warnings.length);

  // 6. Reset demonstration
  console.log('\n6. Reset Demo:');
  console.log('   Before reset: fileSharing =', featureFlagService.isFeatureEnabled('fileSharing'));
  
  localStorage.removeItem('hackerden_feature_flags');
  localStorage.removeItem('hackerden_rollout_config');
  featureFlagService.clearCache();
  
  console.log('   After reset: fileSharing =', featureFlagService.isFeatureEnabled('fileSharing'));

  console.log('\n✅ Feature Flag Demo Complete!');
  console.log('\nTo test in browser console:');
  console.log('- window.featureFlagDemo.runFeatureFlagDemo()');
  console.log('- window.featureFlagService.isFeatureEnabled("fileSharing")');
  console.log('- window.featureFlagUtils.batchUpdateFeatureFlags({fileSharing: false})');
};

// Make available globally for browser testing
if (typeof window !== 'undefined') {
  window.featureFlagDemo = { runFeatureFlagDemo };
  window.featureFlagService = featureFlagService;
  window.featureFlagUtils = {
    batchUpdateFeatureFlags,
    createGradualRollout,
    isUserInRolloutGroup,
    getFeatureFlagDebugInfo
  };
}

export default { runFeatureFlagDemo };