import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import enhancementOfflineService from '../services/EnhancementOfflineService';

/**
 * Enhanced error handling hook for enhancement features
 * Provides retry mechanisms, offline handling, and user feedback
 */
export const useEnhancementErrorHandling = (options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableOfflineQueue = true,
    showToasts = true,
    feature = 'Enhancement Feature'
  } = options;

  const [errors, setErrors] = useState([]);
  const [retryQueue, setRetryQueue] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeouts = useRef(new Map());

  /**
   * Add error to the error list
   */
  const addError = useCallback((error, context = {}) => {
    const errorEntry = {
      id: Date.now() + Math.random(),
      error,
      context,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
      feature
    };

    setErrors(prev => [...prev, errorEntry]);

    // Show toast notification if enabled
    if (showToasts) {
      toast.error(`${feature} Error`, {
        description: error.message || 'An unexpected error occurred',
        action: context.canRetry ? {
          label: 'Retry',
          onClick: () => retryOperation(errorEntry.id)
        } : undefined
      });
    }

    return errorEntry.id;
  }, [maxRetries, showToasts, feature]);

  /**
   * Remove error from the list
   */
  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    setRetryQueue(prev => prev.filter(r => r.errorId !== errorId));
    
    // Clear any pending retry timeout
    if (retryTimeouts.current.has(errorId)) {
      clearTimeout(retryTimeouts.current.get(errorId));
      retryTimeouts.current.delete(errorId);
    }
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryQueue([]);
    
    // Clear all retry timeouts
    retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    retryTimeouts.current.clear();
  }, []);

  /**
   * Retry a specific operation
   */
  const retryOperation = useCallback(async (errorId) => {
    const error = errors.find(e => e.id === errorId);
    if (!error || error.retryCount >= error.maxRetries) return;

    setIsRetrying(true);

    try {
      // Calculate exponential backoff delay
      const delay = retryDelay * Math.pow(2, error.retryCount);
      
      // Add to retry queue
      setRetryQueue(prev => [...prev, {
        errorId,
        retryCount: error.retryCount + 1,
        nextRetryIn: delay / 1000,
        operation: error.context.operation || 'operation'
      }]);

      // Wait for delay
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, delay);
        retryTimeouts.current.set(errorId, timeout);
      });

      // Execute retry function if provided
      if (error.context.retryFunction) {
        await error.context.retryFunction();
        
        // Success - remove error
        removeError(errorId);
        
        if (showToasts) {
          toast.success('Operation Successful', {
            description: `${error.context.operation || 'Operation'} completed successfully`
          });
        }
      }
    } catch (retryError) {
      // Update error with new retry count
      setErrors(prev => prev.map(e => 
        e.id === errorId 
          ? { ...e, retryCount: e.retryCount + 1, error: retryError }
          : e
      ));

      // Remove from retry queue
      setRetryQueue(prev => prev.filter(r => r.errorId !== errorId));

      if (showToasts) {
        toast.error('Retry Failed', {
          description: retryError.message || 'Retry attempt failed'
        });
      }
    } finally {
      setIsRetrying(false);
      retryTimeouts.current.delete(errorId);
    }
  }, [errors, retryDelay, removeError, showToasts]);

  /**
   * Handle operation with automatic error handling and retry
   */
  const handleOperation = useCallback(async (
    operation,
    operationFunction,
    options = {}
  ) => {
    const {
      retryable = true,
      offlineQueueable = enableOfflineQueue,
      successMessage,
      errorMessage,
      context = {}
    } = options;

    try {
      const result = await operationFunction();
      
      if (successMessage && showToasts) {
        toast.success(successMessage);
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error(`${feature} operation failed:`, error);

      // Check if we should queue for offline sync
      if (offlineQueueable && !enhancementOfflineService.online) {
        try {
          const queueResult = await enhancementOfflineService.mutateWithOfflineQueue(
            {
              type: operation,
              data: context.operationData || {}
            },
            operationFunction
          );

          if (queueResult.queued) {
            if (showToasts) {
              toast.info('Queued for Sync', {
                description: 'Operation will be completed when back online'
              });
            }
            return { success: true, queued: true, queueId: queueResult.queueId };
          }
        } catch (queueError) {
          console.error('Failed to queue operation:', queueError);
        }
      }

      // Add error with retry capability
      const errorId = addError(error, {
        operation,
        canRetry: retryable,
        retryFunction: retryable ? operationFunction : null,
        operationData: context.operationData,
        ...context
      });

      return { 
        success: false, 
        error, 
        errorId,
        message: errorMessage || error.message 
      };
    }
  }, [feature, enableOfflineQueue, showToasts, addError]);

  /**
   * Handle file upload with progress and error handling
   */
  const handleFileUpload = useCallback(async (
    file,
    uploadFunction,
    options = {}
  ) => {
    const {
      onProgress,
      maxFileSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/*', 'application/pdf', 'text/*']
    } = options;

    // Validate file size
    if (file.size > maxFileSize) {
      const error = new Error(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
      const errorId = addError(error, {
        operation: 'file_upload',
        canRetry: false,
        file: { name: file.name, size: file.size, type: file.type }
      });
      return { success: false, error, errorId };
    }

    // Validate file type
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      const error = new Error(`File type ${file.type} is not supported`);
      const errorId = addError(error, {
        operation: 'file_upload',
        canRetry: false,
        file: { name: file.name, size: file.size, type: file.type }
      });
      return { success: false, error, errorId };
    }

    // Handle upload with progress
    return await handleOperation(
      'file_upload',
      () => uploadFunction(file, onProgress),
      {
        retryable: true,
        offlineQueueable: false, // File uploads can't be queued
        successMessage: `File "${file.name}" uploaded successfully`,
        errorMessage: `Failed to upload "${file.name}"`,
        context: {
          operationData: { fileName: file.name, fileSize: file.size, fileType: file.type }
        }
      }
    );
  }, [handleOperation, addError]);

  /**
   * Handle batch operations with individual error tracking
   */
  const handleBatchOperation = useCallback(async (
    operations,
    batchFunction,
    options = {}
  ) => {
    const {
      continueOnError = true,
      successMessage,
      partialSuccessMessage = 'Some operations completed successfully'
    } = options;

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      
      try {
        const result = await batchFunction(operation, i);
        results.push({ success: true, data: result, operation });
        successCount++;
      } catch (error) {
        const errorId = addError(error, {
          operation: `batch_operation_${i}`,
          canRetry: true,
          retryFunction: () => batchFunction(operation, i),
          operationData: operation
        });
        
        results.push({ success: false, error, errorId, operation });
        errorCount++;

        if (!continueOnError) {
          break;
        }
      }
    }

    // Show appropriate toast message
    if (showToasts) {
      if (errorCount === 0) {
        toast.success(successMessage || `All ${operations.length} operations completed successfully`);
      } else if (successCount > 0) {
        toast.warning(partialSuccessMessage, {
          description: `${successCount} succeeded, ${errorCount} failed`
        });
      } else {
        toast.error('Batch Operation Failed', {
          description: `All ${operations.length} operations failed`
        });
      }
    }

    return {
      success: errorCount === 0,
      results,
      successCount,
      errorCount,
      total: operations.length
    };
  }, [addError, showToasts]);

  /**
   * Get error statistics
   */
  const getErrorStats = useCallback(() => {
    const stats = {
      totalErrors: errors.length,
      activeRetries: retryQueue.length,
      errorsByFeature: {},
      recentErrors: errors.slice(-5)
    };

    errors.forEach(error => {
      const feature = error.feature || 'Unknown';
      stats.errorsByFeature[feature] = (stats.errorsByFeature[feature] || 0) + 1;
    });

    return stats;
  }, [errors, retryQueue]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  }, []);

  return {
    // Error state
    errors,
    retryQueue,
    isRetrying,
    
    // Error management
    addError,
    removeError,
    clearErrors,
    retryOperation,
    
    // Operation handlers
    handleOperation,
    handleFileUpload,
    handleBatchOperation,
    
    // Utilities
    getErrorStats
  };
};

/**
 * Hook for handling network-related errors specifically
 */
export const useNetworkErrorHandling = (options = {}) => {
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [lastError, setLastError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const errorHandling = useEnhancementErrorHandling({
    ...options,
    feature: 'Network Connection'
  });

  /**
   * Test network connectivity
   */
  const testConnection = useCallback(async () => {
    try {
      setConnectionStatus('testing');
      
      // Test with a small request
      const response = await fetch('/vite.svg', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setConnectionStatus('online');
        setLastError(null);
        setRetryCount(0);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus('offline');
      setLastError(error.message);
      return false;
    }
  }, []);

  /**
   * Retry connection with exponential backoff
   */
  const retryConnection = useCallback(async () => {
    const success = await testConnection();
    
    if (!success) {
      setRetryCount(prev => prev + 1);
    }
    
    return success;
  }, [testConnection]);

  /**
   * Handle network-dependent operation
   */
  const handleNetworkOperation = useCallback(async (
    operation,
    operationFunction,
    options = {}
  ) => {
    // Test connection first
    const isOnline = await testConnection();
    
    if (!isOnline && !options.allowOffline) {
      const error = new Error('No internet connection available');
      const errorId = errorHandling.addError(error, {
        operation,
        canRetry: true,
        retryFunction: () => handleNetworkOperation(operation, operationFunction, options)
      });
      return { success: false, error, errorId, offline: true };
    }

    return await errorHandling.handleOperation(operation, operationFunction, options);
  }, [testConnection, errorHandling]);

  // Monitor online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online');
      setLastError(null);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
      setLastError('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection test
    testConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [testConnection]);

  return {
    ...errorHandling,
    connectionStatus,
    lastError,
    retryCount,
    testConnection,
    retryConnection,
    handleNetworkOperation
  };
};

/**
 * Hook for handling validation errors
 */
export const useValidationErrorHandling = (options = {}) => {
  const [validationErrors, setValidationErrors] = useState({});
  
  const errorHandling = useEnhancementErrorHandling({
    ...options,
    feature: 'Data Validation'
  });

  /**
   * Add validation error for a specific field
   */
  const addValidationError = useCallback((field, message) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  /**
   * Remove validation error for a specific field
   */
  const removeValidationError = useCallback((field) => {
    setValidationErrors(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Clear all validation errors
   */
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  /**
   * Validate data with custom rules
   */
  const validateData = useCallback((data, rules) => {
    const errors = {};
    
    Object.entries(rules).forEach(([field, rule]) => {
      const value = data[field];
      
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = rule.message || `${field} is required`;
      } else if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field} format is invalid`;
      } else if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
      } else if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = rule.message || `${field} must be no more than ${rule.maxLength} characters`;
      } else if (value && rule.custom && !rule.custom(value)) {
        errors[field] = rule.message || `${field} is invalid`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  /**
   * Handle form submission with validation
   */
  const handleValidatedSubmission = useCallback(async (
    data,
    rules,
    submitFunction,
    options = {}
  ) => {
    // Clear previous validation errors
    clearValidationErrors();
    
    // Validate data
    const isValid = validateData(data, rules);
    
    if (!isValid) {
      return { 
        success: false, 
        validationErrors: validationErrors,
        message: 'Please fix validation errors'
      };
    }

    // Submit if validation passes
    return await errorHandling.handleOperation(
      'form_submission',
      () => submitFunction(data),
      options
    );
  }, [validationErrors, validateData, clearValidationErrors, errorHandling]);

  return {
    ...errorHandling,
    validationErrors,
    addValidationError,
    removeValidationError,
    clearValidationErrors,
    validateData,
    handleValidatedSubmission
  };
};

export default useEnhancementErrorHandling;