import { useState, useCallback, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Enhanced retry button with exponential backoff visualization
export const RetryButton = ({ 
  onRetry, 
  retryCount = 0, 
  maxRetries = 3, 
  isRetrying = false,
  disabled = false,
  className,
  size = "sm",
  variant = "outline"
}) => {
  const [nextRetryIn, setNextRetryIn] = useState(0);

  // Calculate next retry delay (exponential backoff)
  const getRetryDelay = (attempt) => Math.pow(2, attempt) * 1000;

  useEffect(() => {
    if (isRetrying && retryCount > 0) {
      const delay = getRetryDelay(retryCount - 1);
      setNextRetryIn(delay / 1000);
      
      const interval = setInterval(() => {
        setNextRetryIn(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRetrying, retryCount]);

  const canRetry = retryCount < maxRetries && !disabled;

  return (
    <Button
      onClick={onRetry}
      disabled={!canRetry || isRetrying}
      variant={variant}
      size={size}
      className={cn("flex items-center gap-2", className)}
    >
      {isRetrying ? (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          {nextRetryIn > 0 ? `Retrying in ${nextRetryIn}s` : 'Retrying...'}
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3" />
          {retryCount > 0 ? `Retry (${retryCount}/${maxRetries})` : 'Retry'}
        </>
      )}
    </Button>
  );
};

// Failed operation indicator with retry options
export const FailedOperationAlert = ({ 
  error, 
  onRetry, 
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  operation = "operation",
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

  const canRetry = retryCount < maxRetries;

  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium">Failed to {operation}</p>
          <p className="text-sm">{error}</p>
          {!canRetry && (
            <p className="text-xs mt-1 text-muted-foreground">
              Maximum retry attempts reached
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {canRetry && (
            <RetryButton
              onRetry={handleRetry}
              retryCount={retryCount}
              maxRetries={maxRetries}
              isRetrying={isRetrying}
            />
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
      </AlertDescription>
    </Alert>
  );
};

// Retry queue manager component
export const RetryQueueManager = ({ 
  retryQueue = [], 
  onRetryItem, 
  onClearQueue,
  className 
}) => {
  if (retryQueue.length === 0) return null;

  return (
    <div className={cn("border-t border-border p-4 bg-muted/30", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium">
            Failed Operations ({retryQueue.length})
          </span>
        </div>
        <Button
          onClick={onClearQueue}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          Clear All
        </Button>
      </div>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {retryQueue.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-center justify-between p-2 bg-background rounded border"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{item.description || 'Failed operation'}</p>
              <p className="text-xs text-muted-foreground">
                Attempt {item.retryCount || 0} of {item.maxRetries || 3}
              </p>
            </div>
            <RetryButton
              onRetry={() => onRetryItem(item)}
              retryCount={item.retryCount || 0}
              maxRetries={item.maxRetries || 3}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Connection status with retry functionality
export const ConnectionStatusWithRetry = ({ 
  status, 
  onRetry, 
  lastError,
  retryCount = 0,
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
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      variant: 'default'
    },
    connecting: {
      color: 'bg-yellow-500 animate-pulse',
      text: 'Connecting',
      variant: 'secondary'
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      variant: 'destructive'
    },
    reconnecting: {
      color: 'bg-orange-500 animate-pulse',
      text: 'Reconnecting',
      variant: 'secondary'
    }
  };

  const config = statusConfig[status] || statusConfig.disconnected;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", config.color)} />
        <Badge variant={config.variant} className="text-xs">
          {config.text}
        </Badge>
      </div>
      
      {(status === 'disconnected' || status === 'reconnecting') && (
        <RetryButton
          onRetry={handleRetry}
          retryCount={retryCount}
          isRetrying={isRetrying || status === 'reconnecting'}
          size="sm"
          className="h-6 text-xs px-2"
        />
      )}
      
      {lastError && status === 'disconnected' && (
        <span className="text-xs text-muted-foreground truncate max-w-32">
          {lastError}
        </span>
      )}
    </div>
  );
};

// Auto-retry mechanism with user control
export const AutoRetryManager = ({ 
  enabled = true, 
  onToggle, 
  currentAttempt = 0, 
  maxAttempts = 3,
  nextRetryIn = 0,
  className 
}) => {
  if (!enabled && currentAttempt === 0) return null;

  return (
    <div className={cn("flex items-center justify-between p-2 bg-muted/50 rounded text-xs", className)}>
      <div className="flex items-center gap-2">
        {enabled ? (
          <CheckCircle className="h-3 w-3 text-green-500" />
        ) : (
          <XCircle className="h-3 w-3 text-red-500" />
        )}
        <span>
          Auto-retry {enabled ? 'enabled' : 'disabled'}
          {currentAttempt > 0 && ` (${currentAttempt}/${maxAttempts})`}
        </span>
        {nextRetryIn > 0 && (
          <span className="text-muted-foreground">
            Next in {nextRetryIn}s
          </span>
        )}
      </div>
      
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
      >
        {enabled ? 'Disable' : 'Enable'}
      </Button>
    </div>
  );
};