#!/usr/bin/env node

/**
 * Simple Health Test for Production Deployment
 * Tests basic functionality without complex routing
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

// Configuration
const config = {
  frontend: process.env.FRONTEND_URL || 'https://hackathon-management-tool.vercel.app',
  backend: process.env.BACKEND_URL || 'https://hackathon-management-backend.railway.app',
  timeout: 10000
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
const info = (message) => log(`ℹ ${message}`, colors.blue);

// HTTP request helper
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.data) {
      req.write(options.data);
    }
    
    req.end();
  });
};

// Test functions
const testBackendHealth = async () => {
  info('Testing backend health endpoint...');
  
  try {
    const response = await makeRequest(`${config.backend}/health`, {
      timeout: config.timeout
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.success) {
        success(`Backend health check passed - Status: ${data.status}, Uptime: ${data.uptime}s`);
        return true;
      }
    }
    
    error(`Backend health check failed: ${response.statusCode}`);
    return false;
  } catch (err) {
    error(`Backend health check error: ${err.message}`);
    return false;
  }
};

const testFrontendAccess = async () => {
  info('Testing frontend accessibility...');
  
  try {
    const response = await makeRequest(config.frontend, {
      timeout: config.timeout
    });
    
    if (response.statusCode === 200) {
      success('Frontend is accessible');
      return true;
    }
    
    error(`Frontend access failed: ${response.statusCode}`);
    return false;
  } catch (err) {
    error(`Frontend access error: ${err.message}`);
    return false;
  }
};

const testCORS = async () => {
  info('Testing CORS configuration...');
  
  try {
    const response = await makeRequest(`${config.backend}/health`, {
      headers: {
        'Origin': config.frontend,
        'Access-Control-Request-Method': 'GET'
      },
      timeout: 5000
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      success(`CORS configured: ${corsHeader}`);
      return true;
    }
    
    error('CORS headers not found');
    return false;
  } catch (err) {
    error(`CORS test error: ${err.message}`);
    return false;
  }
};

// Main test function
const runSimpleHealthTest = async () => {
  log('\n🏥 Simple Production Health Test', colors.blue);
  log(`Frontend: ${config.frontend}`);
  log(`Backend: ${config.backend}\n`);
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Frontend Access', fn: testFrontendAccess },
    { name: 'CORS Configuration', fn: testCORS }
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
  
  // Summary
  log('\n📊 Test Summary:', colors.blue);
  log('=' .repeat(40));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? colors.green : colors.red;
    log(`${status} ${result.name}`, color);
  });
  
  log('=' .repeat(40));
  log(`Overall: ${passed}/${total} tests passed`, 
    passed === total ? colors.green : colors.yellow);
  
  if (passed === total) {
    log('\n🎉 All tests passed! Deployment looks good.', colors.green);
    return true;
  } else {
    log('\n⚠️  Some tests failed. Check the deployment.', colors.yellow);
    return false;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleHealthTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
      error(`Test failed: ${err.message}`);
      process.exit(1);
    });
}

export { runSimpleHealthTest };