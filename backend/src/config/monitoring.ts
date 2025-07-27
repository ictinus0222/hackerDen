/**
 * Production Monitoring Configuration
 * Handles error tracking, logging, and performance monitoring
 */

import { logger } from '../utils/logger.js';

export interface MonitoringConfig {
  errorTracking: {
    enabled: boolean;
    dsn?: string;
    environment: string;
    sampleRate: number;
  };
  performance: {
    enabled: boolean;
    sampleRate: number;
  };
  logging: {
    level: string;
    structured: boolean;
  };
}

export const monitoringConfig: MonitoringConfig = {
  errorTracking: {
    enabled: process.env.NODE_ENV === 'production',
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    sampleRate: 0.1
  },
  performance: {
    enabled: process.env.NODE_ENV === 'production',
    sampleRate: 0.1
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    structured: process.env.NODE_ENV === 'production'
  }
};

/**
 * Initialize monitoring services
 */
export const initializeMonitoring = () => {
  if (monitoringConfig.errorTracking.enabled) {
    logger.info('Monitoring initialized for production');
    
    // In a real implementation, you would initialize Sentry or similar service here
    // Example:
    // import * as Sentry from '@sentry/node';
    // Sentry.init({
    //   dsn: monitoringConfig.errorTracking.dsn,
    //   environment: monitoringConfig.errorTracking.environment,
    //   sampleRate: monitoringConfig.errorTracking.sampleRate
    // });
  }
};

/**
 * Track custom events and metrics
 */
export const trackEvent = (event: string, data?: any) => {
  if (monitoringConfig.errorTracking.enabled) {
    logger.info(`Event: ${event}`, data);
    
    // In a real implementation, you would send to monitoring service
    // Example:
    // Sentry.addBreadcrumb({
    //   message: event,
    //   data,
    //   level: 'info'
    // });
  }
};

/**
 * Track performance metrics
 */
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  if (monitoringConfig.performance.enabled) {
    logger.info(`Performance: ${metric} = ${value}${unit}`);
    
    // In a real implementation, you would send to monitoring service
    // Example:
    // Sentry.setMeasurement(metric, value, unit);
  }
};

/**
 * Track errors with context
 */
export const trackError = (error: Error, context?: any) => {
  logger.error('Error tracked:', { error: error.message, stack: error.stack, context });
  
  if (monitoringConfig.errorTracking.enabled) {
    // In a real implementation, you would send to error tracking service
    // Example:
    // Sentry.captureException(error, { extra: context });
  }
};

/**
 * Middleware for tracking API performance
 */
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const route = req.route?.path || req.path;
    
    trackPerformance(`api.${req.method}.${route}`, duration);
    
    // Track slow requests
    if (duration > 1000) {
      trackEvent('slow_request', {
        method: req.method,
        path: req.path,
        duration,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

export default {
  config: monitoringConfig,
  initialize: initializeMonitoring,
  trackEvent,
  trackPerformance,
  trackError,
  performanceMiddleware
};