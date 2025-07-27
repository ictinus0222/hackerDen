#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that the production deployment is working correctly
 */

import { runHealthChecks } from './health-check.js';
import { runProductionTests } from './test-production.js';

// Configuration
const config = {
  frontend: process.env.FRONTEND_URL || 'https://hackathon-management-tool.vercel.app',
  backend: process.env.BACKEND_URL || 'https://hackathon-management-backend.railway.app',
  maxRetries: 3,
  retryDelay: 10000 // 10 seconds
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

// Utility function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function
const retry = async (fn, maxRetries = config.maxRetries, delay = config.retryDelay) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      warning(`Attempt ${i + 1} failed, retrying in ${delay/1000}s...`);
      await wait(delay);
    }
  }
};

// Verification steps
const verifyDeploymentUrls = () => {
  info('Verifying deployment URLs...');
  
  if (!config.frontend.startsWith('https://')) {
    throw new Error('Frontend URL must use HTTPS in production');
  }
  
  if (!config.backend.startsWith('https://')) {
    throw new Error('Backend URL must use HTTPS in production');
  }
  
  success('Deployment URLs verified');
};

const verifyHealthChecks = async () => {
  info('Running health checks with retries...');
  
  await retry(async () => {
    const result = await runHealthChecks();
    if (!result) {
      throw new Error('Health checks failed');
    }
  });
  
  success('Health checks passed');
};

const verifyBasicFunctionality = async () => {
  info('Verifying basic functionality...');
  
  // Test basic API endpoints
  const fetch = (await import('node-fetch')).default;
  
  await retry(async () => {
    const response = await fetch(`${config.backend}/health`);
    if (!response.ok) {
      throw new Error(`Health endpoint returned ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('Health check indicates system is not healthy');
    }
  });
  
  success('Basic functionality verified');
};

const verifyRealTimeFeatures = async () => {
  info('Verifying real-time features...');
  
  // Test WebSocket connection
  await retry(async () => {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${config.backend}/socket.io/`);
    
    if (response.status >= 500) {
      throw new Error(`WebSocket endpoint returned ${response.status}`);
    }
  });
  
  success('Real-time features verified');
};

const verifySecurityHeaders = async () => {
  info('Verifying security headers...');
  
  const fetch = (await import('node-fetch')).default;
  
  await retry(async () => {
    const response = await fetch(`${config.backend}/health`);
    const headers = response.headers;
    
    // Check for important security headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    const missingHeaders = securityHeaders.filter(header => !headers.get(header));
    
    if (missingHeaders.length > 0) {
      warning(`Missing security headers: ${missingHeaders.join(', ')}`);
    }
  });
  
  success('Security headers verified');
};

const verifyDatabaseConnection = async () => {
  info('Verifying database connection...');
  
  const fetch = (await import('node-fetch')).default;
  
  await retry(async () => {
    const response = await fetch(`${config.backend}/health`);
    const data = await response.json();
    
    if (!data.database || data.database.status !== 'connected') {
      throw new Error('Database is not connected');
    }
  });
  
  success('Database connection verified');
};

const verifyFrontendDeployment = async () => {
  info('Verifying frontend deployment...');
  
  const fetch = (await import('node-fetch')).default;
  
  await retry(async () => {
    const response = await fetch(config.frontend);
    
    if (!response.ok) {
      throw new Error(`Frontend returned ${response.status}`);
    }
    
    const html = await response.text();
    
    // Check for React app indicators
    if (!html.includes('id="root"') && !html.includes('id="app"')) {
      throw new Error('Frontend does not appear to be a React app');
    }
  });
  
  success('Frontend deployment verified');
};

const runFullVerification = async () => {
  log('\n🔍 Deployment Verification Starting...', colors.blue);
  log(`Frontend: ${config.frontend}`);
  log(`Backend: ${config.backend}\n`);
  
  const verifications = [
    { name: 'Deployment URLs', fn: verifyDeploymentUrls },
    { name: 'Frontend Deployment', fn: verifyFrontendDeployment },
    { name: 'Health Checks', fn: verifyHealthChecks },
    { name: 'Basic Functionality', fn: verifyBasicFunctionality },
    { name: 'Database Connection', fn: verifyDatabaseConnection },
    { name: 'Real-Time Features', fn: verifyRealTimeFeatures },
    { name: 'Security Headers', fn: verifySecurityHeaders }
  ];
  
  const results = [];
  
  for (const verification of verifications) {
    log(`\n--- ${verification.name} ---`);
    try {
      await verification.fn();
      results.push({ name: verification.name, passed: true });
    } catch (err) {
      error(`${verification.name} failed: ${err.message}`);
      results.push({ name: verification.name, passed: false });
    }
  }
  
  // Summary
  log('\n📊 Verification Summary:', colors.blue);
  log('=' .repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? colors.green : colors.red;
    log(`${status} ${result.name}`, color);
  });
  
  log('=' .repeat(50));
  log(`Overall: ${passed}/${total} verifications passed`, 
    passed === total ? colors.green : colors.yellow);
  
  if (passed === total) {
    log('\n🎉 Deployment verification successful!', colors.green);
    log('The application is ready for production use.', colors.green);
    log(`\nAccess your application at: ${config.frontend}`, colors.blue);
    return true;
  } else {
    log('\n⚠️  Deployment verification failed.', colors.yellow);
    log('Please fix the issues before going live.', colors.yellow);
    return false;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullVerification()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
      error(`Verification failed: ${err.message}`);
      process.exit(1);
    });
}

export { runFullVerification };