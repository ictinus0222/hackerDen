import { Component } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, RefreshCw, FileX, MessageSquareX, Trophy, Vote, Upload, Bot } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Enhanced Error Boundary specifically for enhancement features
 * Provides graceful fallbacks and feature-specific error handling
 */
class EnhancementErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      errorType: 'unknown',
      affectedFeature: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      errorType: EnhancementErrorBoundary.categorizeError(error),
      affectedFeature: EnhancementErrorBoundary.identifyAffectedFeature(error)
    };
  }

  static categorizeError(error) {
    const message = error?.message?.toLowerCase() || '';
    const stack = error?.stack?.toLowerCase() || '';
    
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
    if (stack.includes('fileservice') || stack.includes('file')) {
      return 'file_sharing';
    }
    if (stack.includes('ideaservice') || stack.includes('idea')) {
      return 'idea_management';
    }
    if (stack.includes('gamificationservice') || stack.includes('achievement')) {
      return 'gamification';
    }
    if (stack.includes('pollservice') || stack.includes('poll')) {
      return 'polling';
    }
    if (stack.includes('submissionservice') || stack.includes('submission')) {
      return 'submissions';
    }
    
    return 'unknown';
  }

  static identifyAffectedFeature(error) {
    const errorType = EnhancementErrorBoundary.categorizeError(error);
    
    const featureMap = {
      file_sharing: 'File Sharing',
      idea_management: 'Idea Board',
      gamification: 'Achievements',
      polling: 'Polls',
      submissions: 'Judge Submissions',
      storage: 'File Storage',
      database: 'Data Sync',
      network: 'Connection',
      permission: 'Access Control',
      timeout: 'Performance',
      validation: 'Data Validation'
    };

    return featureMap[errorType] || 'Enhancement Features';
  }

  componentDidCatch(error, errorInfo) {
    console.error('Enhancement Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error details for debugging
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.state.errorType, this.state.affectedFeature);
    }

    // Report error to monitoring service if available
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    try {
      // In a production environment, you would send this to your error tracking service
      const errorReport = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo,
        errorType: this.state.errorType,
        affectedFeature: this.state.affectedFeature,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.props.userId || 'anonymous',
        teamId: this.props.teamId || 'unknown'
      };

      console.log('Error Report:', errorReport);
      
      // Store in localStorage for later reporting if needed
      const existingReports = JSON.parse(localStorage.getItem('enhancement_error_reports') || '[]');
      existingReports.push(errorReport);
      
      // Keep only last 10 reports
      if (existingReports.length > 10) {
        existingReports.splice(0, existingReports.length - 10);
      }
      
      localStorage.setItem('enhancement_error_reports', JSON.stringify(existingReports));
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Call onReset if provided
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
      this.setState({ 
        isRetrying: false,
        error: retryError,
        errorType: EnhancementErrorBoundary.categorizeError(retryError)
      });
    }
  };

  handleFallbackMode = () => {
    // Enable fallback mode for the affected feature
    if (this.props.onFallbackMode) {
      this.props.onFallbackMode(this.state.affectedFeature, this.state.errorType);
    }
    
    // Reset error state to show fallback UI
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  getErrorIcon = () => {
    const iconMap = {
      file_sharing: FileX,
      idea_management: MessageSquareX,
      gamification: Trophy,
      polling: Vote,
      submissions: Upload,
      storage: FileX,
      network: RefreshCw,
      permission: AlertTriangle,
      timeout: RefreshCw,
      validation: AlertTriangle,
      unknown: AlertTriangle
    };

    return iconMap[this.state.errorType] || AlertTriangle;
  };

  getErrorConfig = () => {
    const { errorType, affectedFeature } = this.state;
    
    const configs = {
      network: {
        title: 'Connection Problem',
        description: `Unable to connect to ${affectedFeature} services. Please check your internet connection.`,
        canRetry: true,
        canFallback: true,
        severity: 'high'
      },
      permission: {
        title: 'Access Denied',
        description: `You don't have permission to access ${affectedFeature}. Please contact your team administrator.`,
        canRetry: false,
        canFallback: true,
        severity: 'medium'
      },
      storage: {
        title: 'Storage Error',
        description: 'File storage is temporarily unavailable. Your files are safe, but uploads may fail.',
        canRetry: true,
        canFallback: true,
        severity: 'high'
      },
      database: {
        title: 'Data Sync Error',
        description: 'Unable to sync data with the server. Your changes may not be saved.',
        canRetry: true,
        canFallback: true,
        severity: 'high'
      },
      timeout: {
        title: 'Request Timeout',
        description: `${affectedFeature} is taking too long to respond. The service may be overloaded.`,
        canRetry: true,
        canFallback: true,
        severity: 'medium'
      },
      validation: {
        title: 'Data Validation Error',
        description: 'The data provided is invalid or incomplete. Please check your input.',
        canRetry: false,
        canFallback: false,
        severity: 'low'
      },
      file_sharing: {
        title: 'File Sharing Error',
        description: 'File sharing features are temporarily unavailable. You can still view existing files.',
        canRetry: true,
        canFallback: true,
        severity: 'medium'
      },
      idea_management: {
        title: 'Idea Board Error',
        description: 'The idea board is temporarily unavailable. Your ideas are safe.',
        canRetry: true,
        canFallback: true,
        severity: 'medium'
      },
      gamification: {
        title: 'Achievement System Error',
        description: 'Achievement tracking is temporarily unavailable. Your progress is still being recorded.',
        canRetry: true,
        canFallback: true,
        severity: 'low'
      },
      polling: {
        title: 'Polling System Error',
        description: 'Polls are temporarily unavailable. You can still view existing poll results.',
        canRetry: true,
        canFallback: true,
        severity: 'medium'
      },
      submissions: {
        title: 'Submission System Error',
        description: 'Judge submissions are temporarily unavailable. Your submission data is safe.',
        canRetry: true,
        canFallback: true,
        severity: 'high'
      },
      unknown: {
        title: 'Unexpected Error',
        description: `An unexpected error occurred with ${affectedFeature}. Please try again.`,
        canRetry: true,
        canFallback: true,
        severity: 'medium'
      }
    };

    return configs[errorType] || configs.unknown;
  };

  renderErrorContent = () => {
    const { retryCount, isRetrying, error, affectedFeature } = this.state;
    const config = this.getErrorConfig();
    const IconComponent = this.getErrorIcon();
    const maxRetries = 3;

    const severityColors = {
      low: 'border-yellow-200 bg-yellow-50',
      medium: 'border-orange-200 bg-orange-50',
      high: 'border-red-200 bg-red-50'
    };

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className={cn("max-w-md w-full", severityColors[config.severity])}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                config.severity === 'high' ? 'bg-red-100 text-red-600' :
                config.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                'bg-yellow-100 text-yellow-600'
              )}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {affectedFeature}
                  </Badge>
                  <Badge 
                    variant={config.severity === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {config.severity} priority
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <CardDescription className="text-sm">
              {config.description}
            </CardDescription>
            
            {error && (
              <details className="text-xs">
                <summary className="cursor-pointer hover:underline text-muted-foreground">
                  Technical Details
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-20 text-xs">
                  {error.message}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {config.canRetry && retryCount < maxRetries && (
                  <Button 
                    onClick={this.handleRetry}
                    variant="default"
                    size="sm"
                    disabled={isRetrying}
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
                        Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                      </>
                    )}
                  </Button>
                )}
                
                {config.canFallback && (
                  <Button 
                    onClick={this.handleFallbackMode}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Bot className="h-3 w-3" />
                    Use Basic Mode
                  </Button>
                )}
              </div>
              
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

            {retryCount >= maxRetries && config.canRetry && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Maximum retry attempts reached. Please reload the page or contact support if the problem persists.
                </AlertDescription>
              </Alert>
            )}
            
            {config.canFallback && (
              <p className="text-xs text-muted-foreground">
                Basic mode provides core functionality without advanced features.
              </p>
            )}
          </CardContent>
        </Card>
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

export default EnhancementErrorBoundary;