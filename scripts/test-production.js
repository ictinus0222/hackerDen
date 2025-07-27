#!/usr/bin/env node

/**
 * Production Testing Script
 * Comprehensive testing of deployed application
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  frontend: process.env.FRONTEND_URL || 'https://hackathon-management-tool.vercel.app',
  backend: process.env.BACKEND_URL || 'https://hackathon-management-backend.railway.app',
  timeout: 30000
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const success = (message) => log(`✓ ${message}`, colors.green);
const error = (message) => log(`✗ ${message}`, colors.red);
const warning = (message) => log(`⚠ ${message}`, colors.yellow);
const info = (message) => log(`ℹ ${message}`, colors.blue);

// Run command helper
const runCommand = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (options.silent) {
      child.stdout?.on('data', (data) => stdout += data);
      child.stderr?.on('data', (data) => stderr += data);
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', reject);
  });
};

// Test functions
const testHealthChecks = async () => {
  info('Running health checks...');
  
  try {
    await runCommand('node', ['scripts/health-check.js'], {
      env: {
        ...process.env,
        FRONTEND_URL: config.frontend,
        BACKEND_URL: config.backend
      }
    });
    success('Health checks passed');
    return true;
  } catch (err) {
    error(`Health checks failed: ${err.message}`);
    return false;
  }
};

const testE2EScenarios = async () => {
  info('Running E2E tests against production...');
  
  try {
    // Update playwright config for production
    const playwrightConfig = {
      use: {
        baseURL: config.frontend,
        timeout: config.timeout
      },
      projects: [
        {
          name: 'production-chrome',
          use: { browserName: 'chromium' }
        }
      ]
    };

    // Run smoke tests first
    await runCommand('npx', ['playwright', 'test', 'e2e/smoke-test.spec.ts'], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: config.frontend,
        API_BASE_URL: config.backend
      }
    });
    
    success('Smoke tests passed');

    // Run complete workflow test
    await runCommand('npx', ['playwright', 'test', 'e2e/complete-workflow.spec.ts'], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: config.frontend,
        API_BASE_URL: config.backend
      }
    });
    
    success('Complete workflow test passed');

    // Run multi-user collaboration test
    await runCommand('npx', ['playwright', 'test', 'e2e/multi-user-collaboration.spec.ts'], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: config.frontend,
        API_BASE_URL: config.backend
      }
    });
    
    success('Multi-user collaboration test passed');

    return true;
  } catch (err) {
    error(`E2E tests failed: ${err.message}`);
    return false;
  }
};

const testMobileFunctionality = async () => {
  info('Testing mobile functionality...');
  
  try {
    await runCommand('npx', ['playwright', 'test', 'e2e/mobile-functionality.spec.ts'], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: config.frontend,
        API_BASE_URL: config.backend
      }
    });
    
    success('Mobile functionality tests passed');
    return true;
  } catch (err) {
    error(`Mobile tests failed: ${err.message}`);
    return false;
  }
};

const testCrossBrowser = async () => {
  info('Testing cross-browser compatibility...');
  
  try {
    await runCommand('npx', ['playwright', 'test', 'e2e/cross-browser.spec.ts'], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: config.frontend,
        API_BASE_URL: config.backend
      }
    });
    
    success('Cross-browser tests passed');
    return true;
  } catch (err) {
    error(`Cross-browser tests failed: ${err.message}`);
    return false;
  }
};

const testPerformanceAndAccessibility = async () => {
  info('Testing performance and accessibility...');
  
  try {
    await runCommand('npx', ['playwright', 'test', 'e2e/performance-accessibility.spec.ts'], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: config.frontend,
        API_BASE_URL: config.backend
      }
    });
    
    success('Performance and accessibility tests passed');
    return true;
  } catch (err) {
    error(`Performance/accessibility tests failed: ${err.message}`);
    return false;
  }
};

const testRealTimeCollaboration = async () => {
  info('Testing real-time collaboration across networks...');
  
  try {
    // This test simulates multiple users from different networks
    await runCommand('npx', ['playwright', 'test', 'e2e/multi-user-collaboration.spec.ts', '--workers=2'], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: config.frontend,
        API_BASE_URL: config.backend,
        TEST_MULTI_NETWORK: 'true'
      }
    });
    
    success('Real-time collaboration tests passed');
    return true;
  } catch (err) {
    error(`Real-time collaboration tests failed: ${err.message}`);
    return false;
  }
};

const generateTestReport = (results) => {
  log('\n📊 Production Test Report:', colors.blue);
  log('=' .repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? colors.green : colors.red;
    log(`${status} ${result.name}`, color);
  });
  
  log('=' .repeat(50));
  log(`Overall: ${passed}/${total} test suites passed`, 
    passed === total ? colors.green : colors.yellow);
  
  if (passed === total) {
    log('\n🎉 All production tests passed! Deployment is successful.', colors.green);
    log(`Frontend: ${config.frontend}`, colors.blue);
    log(`Backend: ${config.backend}`, colors.blue);
  } else {
    log('\n⚠️  Some tests failed. Please investigate before going live.', colors.yellow);
  }
  
  return passed === total;
};

// Main test function
const runProductionTests = async () => {
  log('\n🧪 Production Testing Starting...', colors.blue);
  log(`Frontend: ${config.frontend}`);
  log(`Backend: ${config.backend}\n`);
  
  const tests = [
    { name: 'Health Checks', fn: testHealthChecks },
    { name: 'E2E Scenarios', fn: testE2EScenarios },
    { name: 'Mobile Functionality', fn: testMobileFunctionality },
    { name: 'Cross-Browser Compatibility', fn: testCrossBrowser },
    { name: 'Performance & Accessibility', fn: testPerformanceAndAccessibility },
    { name: 'Real-Time Collaboration', fn: testRealTimeCollaboration }
  ];
  
  const results = [];
  
  for (const test of tests) {
    log(`\n--- ${test.name} ---`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (err) {
      error(`${test.name} failed: ${err.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  const allPassed = generateTestReport(results);
  process.exit(allPassed ? 0 : 1);
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runProductionTests().catch(err => {
    error(`Production testing failed: ${err.message}`);
    process.exit(1);
  });
}

export { runProductionTests };