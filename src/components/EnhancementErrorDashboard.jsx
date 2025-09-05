import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Download, 
  Trash2,
  Wifi,
  WifiOff,
  BarChart3,
  Clock,
  Users,
  Layers,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import enhancementErrorReporting from '../services/EnhancementErrorReporting';
import enhancementOfflineService from '../services/EnhancementOfflineService';

/**
 * Comprehensive error dashboard for monitoring enhancement features
 */
const EnhancementErrorDashboard = ({ className, onClose }) => {
  const [errorStats, setErrorStats] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [offlineStatus, setOfflineStatus] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  /**
   * Load dashboard data
   */
  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      const stats = enhancementErrorReporting.getErrorStats();
      const health = enhancementErrorReporting.getHealthMetrics();
      const offline = enhancementOfflineService.getOfflineStatus();
      
      setErrorStats(stats);
      setHealthMetrics(health);
      setOfflineStatus(offline);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * Export error data
   */
  const handleExport = useCallback((format) => {
    try {
      const data = enhancementErrorReporting.exportErrorData(format);
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhancement-errors-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  }, []);

  /**
   * Clear error data
   */
  const handleClearData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all error data?')) {
      enhancementErrorReporting.clearErrorData();
      loadDashboardData();
    }
  }, [loadDashboardData]);

  // Load data on mount and set up refresh interval
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  if (!errorStats || !healthMetrics || !offlineStatus) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading error dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhancement Error Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and analyze enhancement feature errors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadDashboardData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="ghost" size="sm">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthStatusCard
          title="Connection Status"
          value={offlineStatus.isOnline ? 'Online' : 'Offline'}
          icon={offlineStatus.isOnline ? Wifi : WifiOff}
          variant={offlineStatus.isOnline ? 'success' : 'destructive'}
          description={offlineStatus.isOnline ? 'All features available' : 'Limited functionality'}
        />
        
        <HealthStatusCard
          title="Error Rate"
          value={`${healthMetrics.errorRate}/hr`}
          icon={healthMetrics.errorRate > 10 ? TrendingUp : TrendingDown}
          variant={healthMetrics.errorRate > 10 ? 'destructive' : 'success'}
          description="Errors in the last hour"
        />
        
        <HealthStatusCard
          title="Critical Issues"
          value={healthMetrics.criticalErrors}
          icon={AlertTriangle}
          variant={healthMetrics.criticalErrors > 0 ? 'destructive' : 'success'}
          description="Require immediate attention"
        />
        
        <HealthStatusCard
          title="Sync Queue"
          value={offlineStatus.syncQueueSize}
          icon={Clock}
          variant={offlineStatus.syncQueueSize > 5 ? 'warning' : 'default'}
          description="Operations pending sync"
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Recent Errors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Error Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Errors</span>
                    <Badge variant="outline">{errorStats.totalErrors}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Critical</span>
                      <span className="text-red-600">{healthMetrics.criticalErrors}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>High Priority</span>
                      <span className="text-orange-600">{healthMetrics.highErrors}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Network Related</span>
                      <span className="text-blue-600">{healthMetrics.networkErrors}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Error Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Top Error Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(errorStats.errorsByType)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / errorStats.totalErrors) * 100} 
                            className="w-20 h-2" 
                          />
                          <span className="text-sm font-medium w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Error Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Errors by Feature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(errorStats.errorsByFeature)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([feature, count]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{feature}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Offline Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Offline Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache Status</span>
                    <Badge variant={healthMetrics.cacheHealth ? 'success' : 'destructive'}>
                      {healthMetrics.cacheHealth ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cached Items</span>
                    <span className="text-sm font-medium">
                      {offlineStatus.cacheStats?.totalItems || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache Size</span>
                    <span className="text-sm font-medium">
                      {offlineStatus.cacheStats?.cacheSizeKB || 0} KB
                    </span>
                  </div>
                  
                  {offlineStatus.syncInProgress && (
                    <Alert>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Syncing offline operations...
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>
                Latest {errorStats.recentErrors.length} errors from enhancement features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {errorStats.recentErrors.map((error) => (
                    <ErrorItem
                      key={error.id}
                      error={error}
                      onClick={() => setSelectedError(error)}
                      selected={selectedError?.id === error.id}
                    />
                  ))}
                  
                  {errorStats.recentErrors.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent errors found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Error Details */}
          {selectedError && (
            <Card>
              <CardHeader>
                <CardTitle>Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorDetails 
                  errorId={selectedError.id}
                  onClose={() => setSelectedError(null)}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Error trend visualization would go here
                    <br />
                    (Chart component integration needed)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(errorStats.errorsByUser)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([userId, count]) => (
                      <div key={userId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {userId === 'anonymous' ? 'Anonymous Users' : `User ${userId.slice(0, 8)}`}
                          </span>
                        </div>
                        <Badge variant="outline">{count} errors</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Reporting Settings</CardTitle>
              <CardDescription>
                Configure error reporting and monitoring preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Error Reporting</p>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic error reporting and monitoring
                  </p>
                </div>
                <Badge variant={errorStats.reportingEnabled ? 'success' : 'secondary'}>
                  {errorStats.reportingEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleExport('json')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                
                <Button
                  onClick={() => handleExport('csv')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                
                <Button
                  onClick={handleClearData}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Health status card component
 */
const HealthStatusCard = ({ title, value, icon: Icon, variant, description }) => {
  const variantStyles = {
    success: 'border-green-200 bg-green-50 text-green-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    destructive: 'border-red-200 bg-red-50 text-red-800',
    default: 'border-gray-200 bg-gray-50 text-gray-800'
  };

  return (
    <Card className={cn("", variantStyles[variant] || variantStyles.default)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-75">{description}</p>
          </div>
          <Icon className="h-8 w-8 opacity-75" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Error item component
 */
const ErrorItem = ({ error, onClick, selected }) => {
  const severityColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50'
  };

  return (
    <div
      className={cn(
        "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
        selected && "ring-2 ring-primary",
        severityColors[error.severity] || severityColors.medium
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {error.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {error.feature}
            </Badge>
            <Badge variant={error.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
              {error.severity}
            </Badge>
          </div>
          <p className="text-sm font-medium truncate">{error.message}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(error.timestamp).toLocaleString()}
          </p>
        </div>
        <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
      </div>
    </div>
  );
};

/**
 * Error details component
 */
const ErrorDetails = ({ errorId, onClose }) => {
  const [errorReport, setErrorReport] = useState(null);

  useEffect(() => {
    const report = enhancementErrorReporting.getErrorReport(errorId);
    setErrorReport(report);
  }, [errorId]);

  if (!errorReport) {
    return <div className="text-center py-4">Error details not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Error Report</h3>
        <Button onClick={onClose} variant="ghost" size="sm">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div><strong>ID:</strong> {errorReport.id}</div>
            <div><strong>Timestamp:</strong> {new Date(errorReport.timestamp).toLocaleString()}</div>
            <div><strong>Type:</strong> {errorReport.type}</div>
            <div><strong>Feature:</strong> {errorReport.feature}</div>
            <div><strong>Operation:</strong> {errorReport.operation}</div>
            <div><strong>Severity:</strong> {errorReport.severity}</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Context</h4>
          <div className="space-y-2 text-sm">
            <div><strong>User ID:</strong> {errorReport.userId}</div>
            <div><strong>Team ID:</strong> {errorReport.teamId}</div>
            <div><strong>Online:</strong> {errorReport.online ? 'Yes' : 'No'}</div>
            <div><strong>Retry Count:</strong> {errorReport.enhancementContext?.retryCount || 0}</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Error Message</h4>
        <div className="p-3 bg-muted rounded-lg text-sm font-mono">
          {errorReport.message}
        </div>
      </div>

      {errorReport.recoverySuggestions?.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Recovery Suggestions</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errorReport.recoverySuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {errorReport.stack && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">Stack Trace</summary>
          <pre className="mt-2 p-3 bg-muted rounded-lg overflow-auto text-xs">
            {errorReport.stack}
          </pre>
        </details>
      )}
    </div>
  );
};

export default EnhancementErrorDashboard;