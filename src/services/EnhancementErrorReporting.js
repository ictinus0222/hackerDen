/**
 * @fileoverview Enhancement Error Reporting Service
 * Centralized error reporting, monitoring, and analytics for enhancement features
 */

/**
 * Error reporting and monitoring service for enhancement features
 */
class EnhancementErrorReporting {
  constructor() {
    this.errorQueue = [];
    this.errorStats = {
      totalErrors: 0,
      errorsByType: {},
      errorsByFeature: {},
      errorsByUser: {},
      recentErrors: []
    };
    this.reportingEnabled = true;
    this.maxQueueSize = 100;
    this.maxRecentErrors = 50;
    
    // Initialize from localStorage
    this.loadErrorStats();
    
    // Set up periodic reporting
    this.setupPeriodicReporting();
    
    // Listen for unhandled errors
    this.setupGlobalErrorHandling();
  }

  /**
   * Report an error with context and metadata
   */
  reportError(error, context = {}) {
    if (!this.reportingEnabled) return;

    const errorReport = this.createErrorReport(error, context);
    
    // Add to queue and stats
    this.addToQueue(errorReport);
    this.updateStats(errorReport);
    
    // Store in localStorage
    this.saveErrorStats();
    
    // Log for debugging
    console.error('Enhancement Error Reported:', errorReport);
    
    return errorReport.id;
  }

  /**
   * Create standardized error report
   */
  createErrorReport(error, context = {}) {
    const report = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      
      // Error details
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      name: error.name || 'Error',
      type: error.type || this.categorizeError(error),
      
      // Context information
      feature: context.feature || 'unknown',
      operation: context.operation || 'unknown',
      userId: context.userId || 'anonymous',
      teamId: context.teamId || 'unknown',
      hackathonId: context.hackathonId || 'unknown',
      
      // Technical context
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      online: navigator.onLine,
      
      // Enhancement-specific context
      enhancementContext: {
        offlineMode: !navigator.onLine,
        cacheAvailable: this.checkCacheAvailability(),
        retryCount: context.retryCount || 0,
        operationData: context.operationData || {}
      },
      
      // Additional metadata
      severity: this.determineSeverity(error, context),
      category: this.categorizeError(error),
      tags: this.generateTags(error, context),
      
      // User impact assessment
      userImpact: this.assessUserImpact(error, context),
      
      // Recovery suggestions
      recoverySuggestions: this.generateRecoverySuggestions(error, context)
    };

    return report;
  }

  /**
   * Categorize error type
   */
  categorizeError(error) {
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('permission') || message.includes('unauthorized') || message.includes('403')) {
      return 'permission';
    }
    if (message.includes('storage') || message.includes('file') || message.includes('upload')) {
      return 'storage';
    }
    if (message.includes('database') || message.includes('document') || message.includes('collection')) {
      return 'database';
    }
    if (message.includes('timeout') || message.includes('slow')) {
      return 'timeout';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (stack.includes('fileservice') || message.includes('file')) {
      return 'file_sharing';
    }
    if (stack.includes('ideaservice') || message.includes('idea')) {
      return 'idea_management';
    }
    if (stack.includes('gamificationservice') || message.includes('achievement')) {
      return 'gamification';
    }
    if (stack.includes('pollservice') || message.includes('poll')) {
      return 'polling';
    }
    if (stack.includes('submissionservice') || message.includes('submission')) {
      return 'submissions';
    }
    
    return 'unknown';
  }

  /**
   * Determine error severity
   */
  determineSeverity(error, context) {
    // Critical: Data loss, security issues, complete feature failure
    if (error.message?.includes('data loss') || 
        error.message?.includes('security') ||
        context.feature === 'submissions' && error.type === 'storage') {
      return 'critical';
    }
    
    // High: Major functionality broken, user can't complete tasks
    if (error.type === 'permission' || 
        error.type === 'database' ||
        (context.retryCount || 0) >= 3) {
      return 'high';
    }
    
    // Medium: Feature partially working, workarounds available
    if (error.type === 'network' || 
        error.type === 'timeout' ||
        error.type === 'storage') {
      return 'medium';
    }
    
    // Low: Minor issues, doesn't block core functionality
    if (error.type === 'validation' || 
        error.type === 'gamification') {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Generate relevant tags for error
   */
  generateTags(error, context) {
    const tags = [];
    
    // Add error type tag
    if (error.type) tags.push(`type:${error.type}`);
    
    // Add feature tag
    if (context.feature) tags.push(`feature:${context.feature}`);
    
    // Add operation tag
    if (context.operation) tags.push(`operation:${context.operation}`);
    
    // Add platform tags
    if (window.innerWidth < 768) tags.push('mobile');
    if (!navigator.onLine) tags.push('offline');
    
    // Add retry tag if applicable
    if (context.retryCount > 0) tags.push(`retry:${context.retryCount}`);
    
    // Add browser tag
    const browser = this.detectBrowser();
    if (browser) tags.push(`browser:${browser}`);
    
    return tags;
  }

  /**
   * Assess user impact
   */
  assessUserImpact(error, context) {
    const impact = {
      level: 'medium',
      description: 'Feature temporarily unavailable',
      workaround: null,
      dataLoss: false,
      blockingTask: false
    };

    switch (error.type) {
      case 'network':
        impact.level = 'high';
        impact.description = 'Cannot sync data with server';
        impact.workaround = 'Operations will be queued for when back online';
        impact.blockingTask = false;
        break;
        
      case 'permission':
        impact.level = 'high';
        impact.description = 'Access denied to feature';
        impact.workaround = 'Contact team administrator';
        impact.blockingTask = true;
        break;
        
      case 'storage':
        impact.level = 'high';
        impact.description = 'Cannot save or retrieve files';
        impact.workaround = 'Try again later or use different file';
        impact.blockingTask = context.feature === 'file_sharing';
        break;
        
      case 'validation':
        impact.level = 'low';
        impact.description = 'Invalid input provided';
        impact.workaround = 'Check input format and try again';
        impact.blockingTask = false;
        break;
        
      case 'gamification':
        impact.level = 'low';
        impact.description = 'Achievement tracking unavailable';
        impact.workaround = 'Progress is still being recorded';
        impact.blockingTask = false;
        break;
    }

    return impact;
  }

  /**
   * Generate recovery suggestions
   */
  generateRecoverySuggestions(error, context) {
    const suggestions = [];

    switch (error.type) {
      case 'network':
        suggestions.push('Check internet connection');
        suggestions.push('Try again in a few moments');
        suggestions.push('Operations will sync when back online');
        break;
        
      case 'permission':
        suggestions.push('Contact your team administrator');
        suggestions.push('Verify you have the correct permissions');
        suggestions.push('Try logging out and back in');
        break;
        
      case 'storage':
        suggestions.push('Check file size and format');
        suggestions.push('Try uploading a different file');
        suggestions.push('Clear browser cache and try again');
        break;
        
      case 'timeout':
        suggestions.push('Try again with a smaller operation');
        suggestions.push('Check internet connection speed');
        suggestions.push('Try during off-peak hours');
        break;
        
      case 'validation':
        suggestions.push('Check input format requirements');
        suggestions.push('Ensure all required fields are filled');
        suggestions.push('Remove special characters if present');
        break;
        
      default:
        suggestions.push('Refresh the page and try again');
        suggestions.push('Clear browser cache');
        suggestions.push('Contact support if problem persists');
    }

    return suggestions;
  }

  /**
   * Add error to queue
   */
  addToQueue(errorReport) {
    this.errorQueue.push(errorReport);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Update error statistics
   */
  updateStats(errorReport) {
    this.errorStats.totalErrors++;
    
    // Update by type
    const type = errorReport.type || 'unknown';
    this.errorStats.errorsByType[type] = (this.errorStats.errorsByType[type] || 0) + 1;
    
    // Update by feature
    const feature = errorReport.feature || 'unknown';
    this.errorStats.errorsByFeature[feature] = (this.errorStats.errorsByFeature[feature] || 0) + 1;
    
    // Update by user
    const userId = errorReport.userId || 'anonymous';
    this.errorStats.errorsByUser[userId] = (this.errorStats.errorsByUser[userId] || 0) + 1;
    
    // Update recent errors
    this.errorStats.recentErrors.push({
      id: errorReport.id,
      timestamp: errorReport.timestamp,
      type: errorReport.type,
      feature: errorReport.feature,
      message: errorReport.message,
      severity: errorReport.severity
    });
    
    // Limit recent errors
    if (this.errorStats.recentErrors.length > this.maxRecentErrors) {
      this.errorStats.recentErrors.shift();
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return {
      ...this.errorStats,
      queueSize: this.errorQueue.length,
      reportingEnabled: this.reportingEnabled
    };
  }

  /**
   * Get detailed error report
   */
  getErrorReport(errorId) {
    return this.errorQueue.find(error => error.id === errorId);
  }

  /**
   * Get errors by criteria
   */
  getErrorsByCriteria(criteria = {}) {
    return this.errorQueue.filter(error => {
      if (criteria.type && error.type !== criteria.type) return false;
      if (criteria.feature && error.feature !== criteria.feature) return false;
      if (criteria.severity && error.severity !== criteria.severity) return false;
      if (criteria.userId && error.userId !== criteria.userId) return false;
      if (criteria.since && new Date(error.timestamp) < new Date(criteria.since)) return false;
      return true;
    });
  }

  /**
   * Export error data for analysis
   */
  exportErrorData(format = 'json') {
    const data = {
      stats: this.errorStats,
      errors: this.errorQueue,
      exportedAt: new Date().toISOString()
    };

    switch (format) {
      case 'csv':
        return this.convertToCSV(this.errorQueue);
      case 'json':
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convert errors to CSV format
   */
  convertToCSV(errors) {
    if (errors.length === 0) return '';

    const headers = [
      'ID', 'Timestamp', 'Type', 'Feature', 'Message', 'Severity', 
      'User ID', 'Team ID', 'Operation', 'Online', 'Retry Count'
    ];

    const rows = errors.map(error => [
      error.id,
      error.timestamp,
      error.type,
      error.feature,
      error.message.replace(/,/g, ';'), // Escape commas
      error.severity,
      error.userId,
      error.teamId,
      error.operation,
      error.online,
      error.enhancementContext?.retryCount || 0
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Clear error data
   */
  clearErrorData() {
    this.errorQueue = [];
    this.errorStats = {
      totalErrors: 0,
      errorsByType: {},
      errorsByFeature: {},
      errorsByUser: {},
      recentErrors: []
    };
    this.saveErrorStats();
  }

  /**
   * Save error stats to localStorage
   */
  saveErrorStats() {
    try {
      localStorage.setItem('enhancement_error_stats', JSON.stringify(this.errorStats));
      localStorage.setItem('enhancement_error_queue', JSON.stringify(this.errorQueue.slice(-50))); // Keep last 50
    } catch (error) {
      console.error('Failed to save error stats:', error);
    }
  }

  /**
   * Load error stats from localStorage
   */
  loadErrorStats() {
    try {
      const savedStats = localStorage.getItem('enhancement_error_stats');
      if (savedStats) {
        this.errorStats = { ...this.errorStats, ...JSON.parse(savedStats) };
      }

      const savedQueue = localStorage.getItem('enhancement_error_queue');
      if (savedQueue) {
        this.errorQueue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error('Failed to load error stats:', error);
    }
  }

  /**
   * Setup periodic error reporting
   */
  setupPeriodicReporting() {
    // Report errors every 5 minutes if there are any
    setInterval(() => {
      if (this.errorQueue.length > 0) {
        console.log('Enhancement Error Summary:', {
          totalErrors: this.errorStats.totalErrors,
          recentErrors: this.errorStats.recentErrors.slice(-5),
          topErrorTypes: this.getTopErrorTypes(),
          topFeatures: this.getTopFeatures()
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(event.reason, {
        feature: 'global',
        operation: 'unhandled_promise_rejection',
        severity: 'high'
      });
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error || new Error(event.message), {
        feature: 'global',
        operation: 'global_error',
        severity: 'high',
        operationData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });
  }

  /**
   * Get top error types
   */
  getTopErrorTypes(limit = 5) {
    return Object.entries(this.errorStats.errorsByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Get top error features
   */
  getTopFeatures(limit = 5) {
    return Object.entries(this.errorStats.errorsByFeature)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([feature, count]) => ({ feature, count }));
  }

  /**
   * Check cache availability
   */
  checkCacheAvailability() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect browser
   */
  detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'unknown';
  }

  /**
   * Enable/disable error reporting
   */
  setReportingEnabled(enabled) {
    this.reportingEnabled = enabled;
  }

  /**
   * Get health metrics
   */
  getHealthMetrics() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentErrors = this.errorQueue.filter(
      error => now - new Date(error.timestamp).getTime() < oneHour
    );

    return {
      errorRate: recentErrors.length, // Errors per hour
      criticalErrors: recentErrors.filter(e => e.severity === 'critical').length,
      highErrors: recentErrors.filter(e => e.severity === 'high').length,
      networkErrors: recentErrors.filter(e => e.type === 'network').length,
      offlineMode: !navigator.onLine,
      cacheHealth: this.checkCacheAvailability()
    };
  }
}

// Create singleton instance
const enhancementErrorReporting = new EnhancementErrorReporting();

export default enhancementErrorReporting;