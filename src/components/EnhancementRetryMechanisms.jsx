import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Wifi, WifiOff, Upload, Download } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Enhanced retry button with exponential backoff and visual feedback
 */
export const EnhancementRetryButton = ({ 
  onRetry, 
  retryCount = 0, 
  maxRetries = 3, 
  isRetrying = false,
  disabled = false,
  operation = "operation",
  className,
  size = "sm",
  variant = "outline",
  showProgress = true
}) => {
  const [nextRetryIn, setNextRetryIn] = useState(0);
  const [retryProgress, setRetryProgress] = useState(0);

  // Calculate exponential backoff delay
  const getRetryDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000);

  useEffect(() => {
    if (isRetrying && retryCount > 0) {
      const delay = getRetryDelay(retryCount - 1);
      const totalSeconds = delay / 1000;
      setNextRetryIn(totalSeconds);
      setRetryProgress(0);
      
      const interval = setInterval(() => {
        setNextRetryIn(prev => {
          const newValue = Math.max(0, prev - 0.1);
          setRetryProgress(((totalSeconds - newValue) / totalSeconds) * 100);
          
          if (newValue <= 0) {
            clearInterval(interval);
            setRetryProgress(100);
          }
          return newValue;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRetrying, retryCount]);

  const canRetry = retryCount < maxRetries && !disabled;
  const delaySeconds = Math.ceil(nextRetryIn);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Button
        onClick={onRetry}
        disabled={!canRetry || isRetrying}
        variant={variant}
        size={size}
        className="flex items-center gap-2"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            {delaySeconds > 0 ? `Retrying in ${delaySeconds}s` : 'Retrying...'}
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3" />
            {retryCount > 0 ? `Retry ${operation} (${retryCount}/${maxRetries})` : `Retry ${operation}`}
          </>
        )}
      </Button>
      
      {showProgress && isRetrying && delaySeconds > 0 && (
        <Progress value={retryProgress} className="h-1" />
      )}
    </div>
  );
};

/**
 * Failed operation alert with detailed error information and retry options
 */
export const EnhancementFailedOperationAlert = ({ 
  error, 
  onRetry, 
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  operation = "operation",
  feature = "feature",
  severity = "medium",
  className,
  showTechnicalDetails = true,
  autoRetry = false,
  autoRetryDelay = 5000
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(0);
  const autoRetryRef = useRef(null);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  // Auto-retry mechanism
  useEffect(() => {
    if (autoRetry && retryCount < maxRetries && !isRetrying) {
      const countdown = autoRetryDelay / 1000;
      setAutoRetryCountdown(countdown);
      
      const countdownInterval = setInterval(() => {
        setAutoRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      autoRetryRef.current = setTimeout(() => {
        handleRetry();
      }, autoRetryDelay);

      return () => {
        clearInterval(countdownInterval);
        if (autoRetryRef.current) {
          clearTimeout(autoRetryRef.current);
        }
      };
    }
  }, [autoRetry, retryCount, maxRetries, isRetrying, autoRetryDelay, handleRetry]);

  const canRetry = retryCount < maxRetries;
  const errorType = error?.type || 'unknown';
  
  const severityConfig = {
    low: { variant: 'default', icon: AlertTriangle, color: 'text-yellow-600' },
    medium: { variant: 'destructive', icon: AlertTriangle, color: 'text-orange-600' },
    high: { variant: 'destructive', icon: XCircle, color: 'text-red-600' }
  };

  const config = severityConfig[severity] || severityConfig.medium;
  const IconComponent = config.icon;

  return (
    <Alert variant={config.variant} className={cn("mb-4", className)}>
      <IconComponent className={cn("h-4 w-4", config.color)} />
      <AlertDescription className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Failed to {operation}</p>
            <Badge variant="outline" className="text-xs">
              {feature}
            </Badge>
          </div>
          <p className="text-sm mt-1">{error?.message || 'An unexpected error occurred'}</p>
          
          {showTechnicalDetails && error?.details && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer hover:underline">
                Technical Details
              </summary>
              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-20">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            {canRetry && (
              <EnhancementRetryButton
                onRetry={handleRetry}
                retryCount={retryCount}
                maxRetries={maxRetries}
                isRetrying={isRetrying}
                operation={operation}
                size="sm"
                showProgress={false}
              />
            )}
            
            {autoRetry && autoRetryCountdown > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Auto-retry in {autoRetryCountdown}s
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!canRetry && (
              <Badge variant="destructive" className="text-xs">
                Max retries reached
              </Badge>
            )}
            
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Retry queue manager for handling multiple failed operations
 */
export const EnhancementRetryQueue = ({ 
  retryQueue = [], 
  onRetryItem, 
  onClearQueue,
  onRetryAll,
  className,
  maxVisible = 5
}) => {
  const [isRetryingAll, setIsRetryingAll] = useState(false);

  const handleRetryAll = useCallback(async () => {
    setIsRetryingAll(true);
    try {
      await onRetryAll();
    } finally {
      setIsRetryingAll(false);
    }
  }, [onRetryAll]);

  if (retryQueue.length === 0) return null;

  const visibleQueue = retryQueue.slice(0, maxVisible);
  const hiddenCount = retryQueue.length - maxVisible;

  return (
    <Card className={cn("border-orange-200 bg-orange-50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <CardTitle className="text-sm">
              Failed Operations ({retryQueue.length})
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {retryQueue.length > 1 && (
              <Button
                onClick={handleRetryAll}
                disabled={isRetryingAll}
                variant="outline"
                size="sm"
                className="text-xs h-7"
              >
                {isRetryingAll ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    Retrying All...
                  </>
                ) : (
                  'Retry All'
                )}
              </Button>
            )}
            <Button
              onClick={onClearQueue}
              variant="ghost"
              size="sm"
              className="text-xs h-7"
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {visibleQueue.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center justify-between p-3 bg-background rounded border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">
                    {item.operation || 'Unknown operation'}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {item.feature || 'Unknown'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {item.error?.message || 'No error details'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Attempt {item.retryCount || 0}/{item.maxRetries || 3}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <EnhancementRetryButton
                onRetry={() => onRetryItem(item)}
                retryCount={item.retryCount || 0}
                maxRetries={item.maxRetries || 3}
                operation={item.operation || 'operation'}
                size="sm"
                className="ml-3"
                showProgress={false}
              />
            </div>
          ))}
          
          {hiddenCount > 0 && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground text-center py-2">
                {hiddenCount} more failed operations...
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Connection status indicator with retry functionality
 */
export const EnhancementConnectionStatus = ({ 
  status, 
  onRetry, 
  lastError,
  retryCount = 0,
  feature = "Enhancement Features",
  className,
  showDetails = true
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      variant: 'default',
      icon: Wifi
    },
    connecting: {
      color: 'bg-yellow-500 animate-pulse',
      text: 'Connecting',
      variant: 'secondary',
      icon: Wifi
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      variant: 'destructive',
      icon: WifiOff
    },
    reconnecting: {
      color: 'bg-orange-500 animate-pulse',
      text: 'Reconnecting',
      variant: 'secondary',
      icon: RefreshCw
    },
    degraded: {
      color: 'bg-yellow-500',
      text: 'Limited',
      variant: 'secondary',
      icon: Wifi
    }
  };

  const config = statusConfig[status] || statusConfig.disconnected;
  const IconComponent = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", config.color)} />
        <IconComponent className="h-3 w-3" />
        <Badge variant={config.variant} className="text-xs">
          {config.text}
        </Badge>
        {showDetails && (
          <span className="text-xs text-muted-foreground">
            {feature}
          </span>
        )}
      </div>
      
      {(status === 'disconnected' || status === 'degraded') && (
        <EnhancementRetryButton
          onRetry={handleRetry}
          retryCount={retryCount}
          isRetrying={isRetrying || status === 'reconnecting'}
          operation="connection"
          size="sm"
          className="h-6 text-xs px-2"
          showProgress={false}
        />
      )}
      
      {lastError && status === 'disconnected' && showDetails && (
        <span className="text-xs text-muted-foreground truncate max-w-32">
          {lastError}
        </span>
      )}
    </div>
  );
};

/**
 * Operation progress indicator with retry on failure
 */
export const EnhancementOperationProgress = ({
  operation,
  progress = 0,
  status = 'idle', // idle, running, success, error
  error = null,
  onRetry,
  onCancel,
  retryCount = 0,
  maxRetries = 3,
  className
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const statusConfig = {
    idle: { color: 'bg-gray-500', icon: Clock },
    running: { color: 'bg-blue-500', icon: RefreshCw },
    success: { color: 'bg-green-500', icon: CheckCircle },
    error: { color: 'bg-red-500', icon: XCircle }
  };

  const config = statusConfig[status] || statusConfig.idle;
  const IconComponent = config.icon;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", config.color)} />
              <span className="text-sm font-medium">{operation}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconComponent className={cn(
                "h-4 w-4",
                status === 'running' && "animate-spin"
              )} />
              {status === 'running' && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
          
          {status === 'running' && (
            <Progress value={progress} className="h-2" />
          )}
          
          {status === 'error' && error && (
            <div className="space-y-2">
              <p className="text-sm text-red-600">{error.message}</p>
              <div className="flex items-center gap-2">
                <EnhancementRetryButton
                  onRetry={handleRetry}
                  retryCount={retryCount}
                  maxRetries={maxRetries}
                  isRetrying={isRetrying}
                  operation={operation}
                  size="sm"
                  showProgress={false}
                />
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <p className="text-sm text-green-600">
              {operation} completed successfully
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Bulk operation retry manager
 */
export const EnhancementBulkRetryManager = ({
  operations = [],
  onRetryOperation,
  onRetryAll,
  onClearAll,
  className
}) => {
  const [isRetryingAll, setIsRetryingAll] = useState(false);

  const failedOperations = operations.filter(op => op.status === 'error');
  const successfulOperations = operations.filter(op => op.status === 'success');
  const runningOperations = operations.filter(op => op.status === 'running');

  const handleRetryAll = useCallback(async () => {
    setIsRetryingAll(true);
    try {
      await onRetryAll(failedOperations);
    } finally {
      setIsRetryingAll(false);
    }
  }, [onRetryAll, failedOperations]);

  if (operations.length === 0) return null;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Bulk Operations ({operations.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {successfulOperations.length} success
            </Badge>
            <Badge variant="destructive" className="text-xs">
              {failedOperations.length} failed
            </Badge>
            {runningOperations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {runningOperations.length} running
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {failedOperations.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Button
                onClick={handleRetryAll}
                disabled={isRetryingAll}
                variant="outline"
                size="sm"
              >
                {isRetryingAll ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    Retrying All...
                  </>
                ) : (
                  `Retry All Failed (${failedOperations.length})`
                )}
              </Button>
              <Button
                onClick={onClearAll}
                variant="ghost"
                size="sm"
              >
                Clear All
              </Button>
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {operations.map((operation, index) => (
              <EnhancementOperationProgress
                key={operation.id || index}
                operation={operation.name}
                progress={operation.progress}
                status={operation.status}
                error={operation.error}
                onRetry={() => onRetryOperation(operation)}
                retryCount={operation.retryCount}
                maxRetries={operation.maxRetries}
                className="border-0 shadow-none"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  EnhancementRetryButton,
  EnhancementFailedOperationAlert,
  EnhancementRetryQueue,
  EnhancementConnectionStatus,
  EnhancementOperationProgress,
  EnhancementBulkRetryManager
};