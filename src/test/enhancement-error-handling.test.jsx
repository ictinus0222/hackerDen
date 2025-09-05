import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import EnhancementErrorBoundary from '../components/EnhancementErrorBoundary';
import { useEnhancementErrorHandling, useNetworkErrorHandling, useValidationErrorHandling } from '../hooks/useEnhancementErrorHandling';
import enhancementOfflineService from '../services/EnhancementOfflineService';
import enhancementErrorReporting from '../services/EnhancementErrorReporting';
import enhancedFileService from '../services/EnhancedFileService';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

vi.mock('../services/EnhancementOfflineService', () => ({
  default: {
    online: true,
    mutateWithOfflineQueue: vi.fn(),
    fetchWithOfflineFallback: vi.fn(),
    queueForSync: vi.fn(),
    getOfflineStatus: vi.fn(() => ({
      isOnline: true,
      syncQueueSize: 0,
      syncInProgress: false,
      cacheStats: { totalItems: 0, cacheSizeKB: 0 }
    }))
  }
}));

vi.mock('../services/EnhancementErrorReporting', () => ({
  default: {
    reportError: vi.fn(),
    getErrorStats: vi.fn(() => ({
      totalErrors: 0,
      errorsByType: {},
      errorsByFeature: {},
      errorsByUser: {},
      recentErrors: []
    })),
    getHealthMetrics: vi.fn(() => ({
      errorRate: 0,
      criticalErrors: 0,
      highErrors: 0,
      networkErrors: 0,
      offlineMode: false,
      cacheHealth: true
    }))
  }
}));

// Test component that throws errors
const ErrorThrowingComponent = ({ shouldThrow, errorType }) => {
  if (shouldThrow) {
    const error = new Error(`Test ${errorType} error`);
    error.type = errorType;
    throw error;
  }
  return <div>No error</div>;
};

// Test hook component
const TestHookComponent = ({ hookType, operation }) => {
  let hookResult;
  
  switch (hookType) {
    case 'enhancement':
      hookResult = useEnhancementErrorHandling({ feature: 'Test Feature' });
      break;
    case 'network':
      hookResult = useNetworkErrorHandling({ feature: 'Network Test' });
      break;
    case 'validation':
      hookResult = useValidationErrorHandling({ feature: 'Validation Test' });
      break;
    default:
      hookResult = useEnhancementErrorHandling();
  }

  const handleOperation = async () => {
    if (operation === 'success') {
      return await hookResult.handleOperation('test_operation', async () => 'success');
    } else if (operation === 'error') {
      return await hookResult.handleOperation('test_operation', async () => {
        throw new Error('Test operation failed');
      });
    } else if (operation === 'file_upload') {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      return await hookResult.handleFileUpload(file, async () => 'uploaded');
    }
  };

  return (
    <div>
      <div data-testid="error-count">{hookResult.errors.length}</div>
      <div data-testid="retry-queue-count">{hookResult.retryQueue?.length || 0}</div>
      <button onClick={handleOperation} data-testid="trigger-operation">
        Trigger Operation
      </button>
      <button onClick={() => hookResult.clearErrors()} data-testid="clear-errors">
        Clear Errors
      </button>
    </div>
  );
};

describe('Enhancement Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('EnhancementErrorBoundary', () => {
    it('should catch and display network errors', () => {
      const onError = vi.fn();
      
      render(
        <EnhancementErrorBoundary onError={onError}>
          <ErrorThrowingComponent shouldThrow={true} errorType="network" />
        </EnhancementErrorBoundary>
      );

      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      expect(screen.getByText(/Unable to connect/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/ })).toBeInTheDocument();
      expect(onError).toHaveBeenCalled();
    });

    it('should catch and display permission errors', () => {
      render(
        <EnhancementErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} errorType="permission" />
        </EnhancementErrorBoundary>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/don't have permission/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Try Again/ })).not.toBeInTheDocument();
    });

    it('should catch and display storage errors', () => {
      render(
        <EnhancementErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} errorType="storage" />
        </EnhancementErrorBoundary>
      );

      expect(screen.getByText('Storage Error')).toBeInTheDocument();
      expect(screen.getByText(/storage is temporarily unavailable/)).toBeInTheDocument();
    });

    it('should allow retry for retryable errors', async () => {
      const onReset = vi.fn();
      
      render(
        <EnhancementErrorBoundary onReset={onReset}>
          <ErrorThrowingComponent shouldThrow={true} errorType="network" />
        </EnhancementErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /Try Again/ });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(onReset).toHaveBeenCalled();
      });
    });

    it('should enable fallback mode', async () => {
      const onFallbackMode = vi.fn();
      
      render(
        <EnhancementErrorBoundary onFallbackMode={onFallbackMode}>
          <ErrorThrowingComponent shouldThrow={true} errorType="network" />
        </EnhancementErrorBoundary>
      );

      const fallbackButton = screen.getByRole('button', { name: /Use Basic Mode/ });
      fireEvent.click(fallbackButton);

      expect(onFallbackMode).toHaveBeenCalledWith('Connection', 'network');
    });

    it('should not throw when no error occurs', () => {
      render(
        <EnhancementErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </EnhancementErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('useEnhancementErrorHandling', () => {
    it('should handle successful operations', async () => {
      render(<TestHookComponent hookType="enhancement" operation="success" />);

      const triggerButton = screen.getByTestId('trigger-operation');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-count')).toHaveTextContent('0');
      });
    });

    it('should handle failed operations and add to error list', async () => {
      render(<TestHookComponent hookType="enhancement" operation="error" />);

      const triggerButton = screen.getByTestId('trigger-operation');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-count')).toHaveTextContent('1');
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Test Feature Error',
        expect.objectContaining({
          description: 'Test operation failed'
        })
      );
    });

    it('should clear errors when requested', async () => {
      render(<TestHookComponent hookType="enhancement" operation="error" />);

      // Trigger error
      const triggerButton = screen.getByTestId('trigger-operation');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-count')).toHaveTextContent('1');
      });

      // Clear errors
      const clearButton = screen.getByTestId('clear-errors');
      fireEvent.click(clearButton);

      expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    });

    it('should handle file upload validation', async () => {
      render(<TestHookComponent hookType="enhancement" operation="file_upload" />);

      const triggerButton = screen.getByTestId('trigger-operation');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-count')).toHaveTextContent('0');
      });

      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('useNetworkErrorHandling', () => {
    it('should test connection status', async () => {
      // Mock fetch to succeed
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200
      });

      render(<TestHookComponent hookType="network" operation="success" />);

      const triggerButton = screen.getByTestId('trigger-operation');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/vite.svg', expect.any(Object));
      });
    });

    it('should handle offline operations', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<TestHookComponent hookType="network" operation="error" />);

      const triggerButton = screen.getByTestId('trigger-operation');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-count')).toHaveTextContent('1');
      });
    });
  });

  describe('useValidationErrorHandling', () => {
    it('should validate data according to rules', () => {
      const TestValidationComponent = () => {
        const { validateData, validationErrors } = useValidationErrorHandling();

        const handleValidate = () => {
          const data = { email: 'invalid-email', name: '' };
          const rules = {
            email: { 
              required: true, 
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format'
            },
            name: { 
              required: true, 
              message: 'Name is required' 
            }
          };
          validateData(data, rules);
        };

        return (
          <div>
            <button onClick={handleValidate} data-testid="validate">
              Validate
            </button>
            <div data-testid="validation-errors">
              {JSON.stringify(validationErrors)}
            </div>
          </div>
        );
      };

      render(<TestValidationComponent />);

      const validateButton = screen.getByTestId('validate');
      fireEvent.click(validateButton);

      const errorsDiv = screen.getByTestId('validation-errors');
      expect(errorsDiv.textContent).toContain('Invalid email format');
      expect(errorsDiv.textContent).toContain('Name is required');
    });
  });

  describe('Enhanced File Service', () => {
    it('should validate file size before upload', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { 
        type: 'text/plain' 
      });

      const result = await enhancedFileService.uploadFile(
        'team1', 
        largeFile, 
        'user1'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('File size exceeds');
      expect(toast.error).toHaveBeenCalledWith(
        'Upload Failed',
        expect.objectContaining({
          description: expect.stringContaining('File size exceeds')
        })
      );
    });

    it('should validate file type before upload', async () => {
      const invalidFile = new File(['test'], 'test.exe', { 
        type: 'application/x-executable' 
      });

      const result = await enhancedFileService.uploadFile(
        'team1', 
        invalidFile, 
        'user1'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('not supported');
    });

    it('should handle offline file operations', async () => {
      enhancementOfflineService.online = false;

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await enhancedFileService.uploadFile('team1', file, 'user1');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('internet connection');
    });

    it('should use cached data when offline', async () => {
      enhancementOfflineService.fetchWithOfflineFallback.mockResolvedValue({
        data: [{ id: '1', name: 'cached-file.txt' }],
        source: 'cache',
        cached: true
      });

      const result = await enhancedFileService.getTeamFiles('team1');

      expect(result.success).toBe(true);
      expect(result.source).toBe('cache');
      expect(toast.info).toHaveBeenCalledWith(
        'Using Cached Data',
        expect.objectContaining({
          description: 'Showing cached files (offline mode)'
        })
      );
    });
  });

  describe('Enhancement Offline Service', () => {
    it('should cache data with metadata', () => {
      const testData = { id: '1', name: 'test' };
      const result = enhancementOfflineService.cacheData('files', 'team1', testData);

      expect(result).toBe(true);
      
      const cached = enhancementOfflineService.getCachedData('files', 'team1');
      expect(cached.data).toEqual(testData);
      expect(cached.metadata.type).toBe('files');
    });

    it('should queue operations for sync when offline', () => {
      const operation = {
        type: 'file_upload',
        data: { fileName: 'test.txt' }
      };

      const queueId = enhancementOfflineService.queueForSync(operation);
      expect(queueId).toBeDefined();
      expect(enhancementOfflineService.syncQueue).toHaveLength(1);
    });

    it('should provide cache statistics', () => {
      enhancementOfflineService.cacheData('files', 'team1', { test: 'data' });
      enhancementOfflineService.cacheData('ideas', 'team1', { test: 'data' });

      const stats = enhancementOfflineService.getCacheStats();
      expect(stats.totalItems).toBeGreaterThan(0);
      expect(stats.types).toHaveProperty('files');
      expect(stats.types).toHaveProperty('ideas');
    });
  });

  describe('Enhancement Error Reporting', () => {
    it('should create detailed error reports', () => {
      const error = new Error('Test error');
      error.type = 'network';

      const context = {
        feature: 'file_sharing',
        operation: 'upload',
        userId: 'user1',
        teamId: 'team1'
      };

      const reportId = enhancementErrorReporting.reportError(error, context);
      expect(reportId).toBeDefined();

      const stats = enhancementErrorReporting.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByType.network).toBe(1);
      expect(stats.errorsByFeature.file_sharing).toBe(1);
    });

    it('should categorize errors correctly', () => {
      const networkError = new Error('Network connection failed');
      const permissionError = new Error('Unauthorized access');
      const validationError = new Error('Invalid input data');

      enhancementErrorReporting.reportError(networkError);
      enhancementErrorReporting.reportError(permissionError);
      enhancementErrorReporting.reportError(validationError);

      const stats = enhancementErrorReporting.getErrorStats();
      expect(stats.errorsByType.network).toBe(1);
      expect(stats.errorsByType.permission).toBe(1);
      expect(stats.errorsByType.validation).toBe(1);
    });

    it('should provide health metrics', () => {
      const error = new Error('Critical system failure');
      enhancementErrorReporting.reportError(error, { severity: 'critical' });

      const health = enhancementErrorReporting.getHealthMetrics();
      expect(health.criticalErrors).toBe(1);
      expect(health.errorRate).toBeGreaterThan(0);
    });

    it('should export error data in different formats', () => {
      const error = new Error('Test error');
      enhancementErrorReporting.reportError(error, { feature: 'test' });

      const jsonExport = enhancementErrorReporting.exportErrorData('json');
      expect(jsonExport).toContain('"totalErrors"');

      const csvExport = enhancementErrorReporting.exportErrorData('csv');
      expect(csvExport).toContain('ID,Timestamp,Type');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete error flow from boundary to reporting', async () => {
      const onError = vi.fn();
      
      render(
        <EnhancementErrorBoundary onError={onError} userId="user1" teamId="team1">
          <ErrorThrowingComponent shouldThrow={true} errorType="network" />
        </EnhancementErrorBoundary>
      );

      // Error should be caught by boundary
      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      expect(onError).toHaveBeenCalled();

      // Error should be reported
      const errorCall = onError.mock.calls[0];
      expect(errorCall[0]).toBeInstanceOf(Error);
      expect(errorCall[2]).toBe('network'); // error type
    });

    it('should handle offline-to-online sync flow', async () => {
      // Start offline
      enhancementOfflineService.online = false;
      
      const operation = {
        type: 'idea_create',
        data: { title: 'Test Idea' }
      };

      // Queue operation
      const queueId = enhancementOfflineService.queueForSync(operation);
      expect(queueId).toBeDefined();

      // Go back online
      enhancementOfflineService.online = true;
      enhancementOfflineService.handleOnline();

      // Sync should be triggered (mocked)
      expect(enhancementOfflineService.syncQueue).toHaveLength(1);
    });

    it('should maintain error statistics across page reloads', () => {
      // Add some errors
      enhancementErrorReporting.reportError(new Error('Error 1'), { feature: 'files' });
      enhancementErrorReporting.reportError(new Error('Error 2'), { feature: 'ideas' });

      // Simulate page reload by creating new instance
      const newReporting = new (enhancementErrorReporting.constructor)();
      
      // Stats should be loaded from localStorage
      const stats = newReporting.getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
    });
  });

  describe('Performance and Memory', () => {
    it('should limit error queue size', () => {
      // Add more errors than the limit
      for (let i = 0; i < 150; i++) {
        enhancementErrorReporting.reportError(new Error(`Error ${i}`));
      }

      const stats = enhancementErrorReporting.getErrorStats();
      expect(stats.totalErrors).toBe(150);
      
      // Queue should be limited
      expect(enhancementErrorReporting.errorQueue.length).toBeLessThanOrEqual(100);
    });

    it('should clean up expired cache entries', () => {
      // Mock old timestamp
      const oldTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      
      localStorage.setItem(
        'hackerden_enhancement_files_team1',
        JSON.stringify({
          data: { test: 'data' },
          metadata: { cachedAt: oldTimestamp }
        })
      );

      const cached = enhancementOfflineService.getCachedData('files', 'team1');
      expect(cached).toBeNull(); // Should be expired and removed
    });
  });
});

describe('Error Handling Edge Cases', () => {
  it('should handle malformed error objects', () => {
    const malformedError = { message: 'Not a real Error object' };
    
    expect(() => {
      enhancementErrorReporting.reportError(malformedError);
    }).not.toThrow();

    const stats = enhancementErrorReporting.getErrorStats();
    expect(stats.totalErrors).toBeGreaterThan(0);
  });

  it('should handle localStorage quota exceeded', () => {
    // Mock localStorage to throw quota exceeded error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const result = enhancementOfflineService.cacheData('test', 'data', { large: 'data' });
    expect(result).toBe(false);

    // Restore original
    localStorage.setItem = originalSetItem;
  });

  it('should handle network timeouts gracefully', async () => {
    // Mock fetch to timeout
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const result = await enhancedFileService.uploadFile('team1', file, 'user1');

    expect(result.success).toBe(false);
    expect(result.error.message).toContain('Timeout');
  });
});