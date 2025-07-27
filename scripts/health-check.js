#!/usr/bin/env node

/**
 * Production Health Check Script
 * Tests all critical endpoints and functionality
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

// Configuration
const config = {
  frontend: {
    url: process.env.FRONTEND_URL || 'https://hackathon-management-tool.vercel.app',
    timeout: 10000
  },
  backend: {
    url: process.env.BACKEND_URL || 'https://hackathon-management-backend.railway.app',
    timeout: 10000
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Utility functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const success = (message) => log(`✓ ${message}`, colors.green);
const error = (message) => log(`✗ ${message}`, colors.red);
const warning = (message) => log(`⚠ ${message}`, colors.yellow);
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

// Health check functions
const checkBackendHealth = async () => {
  info('Checking backend health...');
  
  try {
    const response = await makeRequest(`${config.backend.url}/health`, {
      timeout: config.backend.timeout
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.success) {
        success(`Backend health check passed (${data.uptime}s uptime)`);
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

const checkFrontendHealth = async () => {
  info('Checking frontend health...');
  
  try {
    const response = await makeRequest(config.frontend.url, {
      timeout: config.frontend.timeout
    });
    
    if (response.statusCode === 200) {
      success('Frontend is accessible');
      return true;
    }
    
    error(`Frontend check failed: ${response.statusCode}`);
    return false;
  } catch (err) {
    error(`Frontend check error: ${err.message}`);
    return false;
  }
};

const checkAPIEndpoints = async () => {
  info('Checking API endpoints...');
  
  const endpoints = [
    { path: '/api/projects', method: 'GET' },
    { path: '/api/health', method: 'GET' }
  ];
  
  let passed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${config.backend.url}${endpoint.path}`, {
        method: endpoint.method,
        timeout: 5000
      });
      
      // Accept 200, 401 (auth required), or 404 (no data) as valid responses
      if ([200, 401, 404].includes(response.statusCode)) {
        success(`API ${endpoint.method} ${endpoint.path}: ${response.statusCode}`);
        passed++;
      } else {
        warning(`API ${endpoint.method} ${endpoint.path}: ${response.statusCode}`);
      }
    } catch (err) {
      error(`API ${endpoint.method} ${endpoint.path}: ${err.message}`);
    }
  }
  
  return passed > 0;
};

const checkWebSocketConnection = async () => {
  info('Checking WebSocket connection...');
  
  // This is a basic check - in a real scenario you'd use socket.io-client
  try {
    const response = await makeRequest(`${config.backend.url}/socket.io/`, {
      timeout: 5000
    });
    
    // Socket.io should return some response even for HTTP requests
    if (response.statusCode < 500) {
      success('WebSocket endpoint is accessible');
      return true;
    }
    
    warning(`WebSocket endpoint returned: ${response.statusCode}`);
    return false;
  } catch (err) {
    error(`WebSocket check error: ${err.message}`);
    return false;
  }
};

const checkCORS = async () => {
  info('Checking CORS configuration...');
  
  try {
    const response = await makeRequest(`${config.backend.url}/health`, {
      headers: {
        'Origin': config.frontend.url,
        'Access-Control-Request-Method': 'GET'
      },
      timeout: 5000
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      success(`CORS configured: ${corsHeader}`);
      return true;
    }
    
    warning('CORS headers not found');
    return false;
  } catch (err) {
    error(`CORS check error: ${err.message}`);
    return false;
  }
};

const checkDatabaseConnection = async () => {
  info('Checking database connection...');
  
  try {
    const response = await makeRequest(`${config.backend.url}/health`, {
      timeout: 10000
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.database && data.database.status === 'connected') {
        success('Database connection verified');
        return true;
      }
    }
    
    warning('Database status not available in health check');
    return false;
  } catch (err) {
    error(`Database check error: ${err.message}`);
    return false;
  }
};

// Main health check function
const runHealthChecks = async () => {
  log('\n🏥 Production Health Check Starting...', colors.blue);
  log(`Frontend: ${config.frontend.url}`);
  log(`Backend: ${config.backend.url}\n`);
  
  const checks = [
    { name: 'Backend Health', fn: checkBackendHealth },
    { name: 'Frontend Health', fn: checkFrontendHealth },
    { name: 'API Endpoints', fn: checkAPIEndpoints },
    { name: 'WebSocket Connection', fn: checkWebSocketConnection },
    { name: 'CORS Configuration', fn: checkCORS },
    { name: 'Database Connection', fn: checkDatabaseConnection }
  ];
  
  const results = [];
  
  for (const check of checks) {
    log(`\n--- ${check.name} ---`);
    try {
      const result = await check.fn();
      results.push({ name: check.name, passed: result });
    } catch (err) {
      error(`${check.name} failed: ${err.message}`);
      results.push({ name: check.name, passed: false });
    }
  }
  
  // Summary
  log('\n📊 Health Check Summary:', colors.blue);
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? colors.green : colors.red;
    log(`${status} ${result.name}`, color);
  });
  
  log(`\nOverall: ${passed}/${total} checks passed`, 
    passed === total ? colors.green : colors.yellow);
  
  if (passed === total) {
    log('\n🎉 All health checks passed! System is healthy.', colors.green);
    process.exit(0);
  } else {
    log('\n⚠️  Some health checks failed. Please investigate.', colors.yellow);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthChecks().catch(err => {
    error(`Health check failed: ${err.message}`);
    process.exit(1);
  });
}

export { runHealthChecks };