import { useCallback } from 'react';
import { useToastHelpers } from './useToast';
import { ApiError } from '../services/api';
import { classifyError } from '../utils/apiHelpers';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: Error, context?: any) => void;
  customMessage?: string;
  retryAction?: () => void;
}

export const useErrorHandler = () => {
  const { showError, showWarning } = useToastHelpers();

  const handleError = useCallback((
    error: Error,
    context?: any,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      onError,
      customMessage,
      retryAction
    } = options;

    // Log error for debugging
    if (logError) {
      console.error('Error handled:', error, context);
    }

    // Classify the error
    const classification = classifyError(error);
    const message = customMessage || classification.userMessage;

    // Show toast notification
    if (showToast) {
      const toastOptions = retryAction ? {
        action: {
          label: 'Retry',
          onClick: retryAction
        }
      } : undefined;

      if (classification.type === 'network' || classification.isRetryable) {
        showWarning('Connection Issue', message, toastOptions);
      } else {
        showError('Error', message, toastOptions);
      }
    }

    // Call custom error handler
    onError?.(error, context);

    // In production, you might want to send errors to a monitoring service
    if (import.meta.env.PROD && classification.type !== 'validation') {
      // Example: Send to error monitoring service
      // errorMonitoringService.captureException(error, { extra: context });
    }

    return classification;
  }, [showError, showWarning]);

  // Specialized handlers for common scenarios
  const handleApiError = useCallback((
    error: Error,
    operation: string,
    retryAction?: () => void
  ) => {
    return handleError(error, { operation }, {
      customMessage: `Failed to ${operation}. Please try again.`,
      retryAction
    });
  }, [handleError]);

  const handleNetworkError = useCallback((
    error: Error,
    retryAction?: () => void
  ) => {
    return handleError(error, { type: 'network' }, {
      customMessage: 'Network connection issue. Please check your internet connection.',
      retryAction
    });
  }, [handleError]);

  const handleValidationError = useCallback((
    error: Error,
    field?: string
  ) => {
    return handleError(error, { field, type: 'validation' }, {
      showToast: true,
      customMessage: field ? `Invalid ${field}: ${error.message}` : error.message
    });
  }, [handleError]);

  const handleAuthError = useCallback((error: Error) => {
    return handleError(error, { type: 'auth' }, {
      customMessage: 'Authentication required. Please log in again.',
      onError: () => {
        // Clear auth token and redirect to login
        localStorage.removeItem('hackerden_token');
        // You might want to redirect to login page here
      }
    });
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleAuthError
  };
};

// Hook for handling async operations with error handling
export const useAsyncOperation = () => {
  const { handleError } = useErrorHandler();

  const executeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions & {
      loadingMessage?: string;
      successMessage?: string;
    } = {}
  ): Promise<T | null> => {
    try {
      const result = await operation();
      
      if (options.successMessage) {
        // You could show a success toast here if needed
      }
      
      return result;
    } catch (error) {
      handleError(error as Error, { operation: operation.name }, options);
      return null;
    }
  }, [handleError]);

  return { executeAsync };
};

// Hook for handling form submissions with error handling
export const useFormErrorHandler = () => {
  const { handleValidationError, handleApiError } = useErrorHandler();

  const handleFormError = useCallback((
    error: Error,
    formData?: any
  ) => {
    if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
      return handleValidationError(error);
    }
    
    return handleApiError(error, 'submit form');
  }, [handleValidationError, handleApiError]);

  return { handleFormError };
};