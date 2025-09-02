import { Component } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

class ChatErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chat Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error details for debugging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call onReset if provided first
      if (this.props.onReset) {
        await this.props.onReset();
      }
      
      // Reset error state
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      });

    } catch (retryError) {
      console.error('Retry failed:', retryError);
      this.setState({ isRetrying: false });
    }
  };

  getErrorType = () => {
    const error = this.state.error;
    if (!error) return 'unknown';

    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'permission';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    
    return 'unknown';
  };

  renderErrorContent = () => {
    const errorType = this.getErrorType();
    const { retryCount, isRetrying } = this.state;
    
    const errorConfig = {
      network: {
        icon: WifiOff,
        title: 'Connection Problem',
        description: 'Unable to connect to the chat service. Please check your internet connection.',
        canRetry: true
      },
      permission: {
        icon: AlertTriangle,
        title: 'Access Denied',
        description: 'You don\'t have permission to access this chat. Please contact your team administrator.',
        canRetry: false
      },
      timeout: {
        icon: RefreshCw,
        title: 'Request Timeout',
        description: 'The chat service is taking too long to respond. Please try again.',
        canRetry: true
      },
      unknown: {
        icon: AlertTriangle,
        title: 'Something Went Wrong',
        description: 'An unexpected error occurred with the chat functionality.',
        canRetry: true
      }
    };

    const config = errorConfig[errorType];
    const IconComponent = config.icon;

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <IconComponent className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <div>
              <p className="font-medium">{config.title}</p>
              <p className="text-sm mt-1">{config.description}</p>
              {this.state.error && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer hover:underline">
                    Technical Details
                  </summary>
                  <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-20">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {config.canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  disabled={isRetrying || retryCount >= 3}
                  className="flex items-center gap-2"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      Try Again {retryCount > 0 && `(${retryCount}/3)`}
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.reload()}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Reload Page
              </Button>
            </div>

            {retryCount >= 3 && (
              <p className="text-xs text-muted-foreground">
                Maximum retry attempts reached. Please reload the page or contact support.
              </p>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.renderErrorContent();
    }

    return this.props.children;
  }
}

// Fallback component for network connectivity issues
export const NetworkFallback = ({ 
  isOnline, 
  connectionQuality, 
  onRetry, 
  retrying = false,
  children 
}) => {
  if (isOnline && connectionQuality !== 'offline') {
    return children;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-md">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="space-y-4">
          <div>
            <p className="font-medium">No Internet Connection</p>
            <p className="text-sm mt-1">
              {!isOnline 
                ? "You're currently offline. Please check your internet connection."
                : "Connection quality is too poor to use chat features."
              }
            </p>
          </div>
          
          <Button 
            onClick={onRetry}
            variant="outline"
            size="sm"
            disabled={retrying}
            className="flex items-center gap-2"
          >
            {retrying ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Checking Connection...
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3" />
                Check Connection
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ChatErrorBoundary;