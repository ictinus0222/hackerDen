import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useMessages } from '../hooks/useMessages';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { realtimeService } from '../services/realtimeService';
import { realtimeTester } from '../utils/realtimeTester';
import { useTeam } from '../hooks/useTeam';
import { taskService } from '../services/taskService';
import { messageService } from '../services/messageService';

const RealtimeDebugPanel = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [monitoringData, setMonitoringData] = useState(null);
  const [activeMonitor, setActiveMonitor] = useState(null);

  const { team } = useTeam();
  const tasksHook = useTasks();
  const messagesHook = useMessages();
  const connectionStatus = useConnectionStatus();

  // Get subscription status with error handling
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    active: 0,
    total: 0,
    retrying: 0,
    subscriptions: []
  });

  useEffect(() => {
    try {
      const status = realtimeService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error getting subscription status:', error);
    }
  }, []);

  const runSyncTest = async () => {
    if (!team?.$id) return;
    
    setIsRunningTest(true);
    setTestResults(null);

    try {
      const results = await realtimeTester.testTaskSync(
        team.$id,
        taskService,
        messageService
      );
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunningTest(false);
    }
  };

  const startMonitoring = () => {
    if (activeMonitor) return;

    const monitor = realtimeTester.startSyncMonitoring({
      useTasks: tasksHook,
      useMessages: messagesHook,
      useConnectionStatus: connectionStatus
    });

    setActiveMonitor(monitor);
    
    // Update monitoring data every second
    const updateInterval = setInterval(() => {
      setMonitoringData({
        taskSyncCount: monitor.taskSyncTimes?.length || 0,
        messageSyncCount: monitor.messageSyncTimes?.length || 0,
        connectionIssues: monitor.connectionIssues?.length || 0,
        duration: Date.now() - monitor.startTime
      });
    }, 1000);

    monitor.updateInterval = updateInterval;
  };

  const stopMonitoring = () => {
    if (!activeMonitor) return;

    const results = realtimeTester.stopSyncMonitoring(activeMonitor);
    setMonitoringData(results);
    setActiveMonitor(null);
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getSyncStatusColor = (syncTime) => {
    if (syncTime < 500) return 'text-green-400';
    if (syncTime < 1000) return 'text-yellow-400';
    if (syncTime < 2000) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Real-time Sync Debug Panel
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Connection Status */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Connection Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${connectionStatus.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {connectionStatus.isConnected ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-gray-400">Connected</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${connectionStatus.isReconnecting ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {connectionStatus.isReconnecting ? '🔄' : '⏸️'}
                  </div>
                  <div className="text-sm text-gray-400">Reconnecting</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {connectionStatus.reconnectAttempts}
                  </div>
                  <div className="text-sm text-gray-400">Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {connectionStatus.lastDisconnect ? 
                      formatTime(Date.now() - connectionStatus.lastDisconnect.getTime()) : 
                      'Never'
                    }
                  </div>
                  <div className="text-sm text-gray-400">Last Disconnect</div>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Subscription Status</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{subscriptionStatus.active}</div>
                  <div className="text-sm text-gray-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{subscriptionStatus.retrying}</div>
                  <div className="text-sm text-gray-400">Retrying</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{subscriptionStatus.total}</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
              </div>
              
              {/* Subscription Details */}
              <div className="space-y-2">
                {subscriptionStatus.subscriptions.map((sub, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                    <span className="text-sm text-gray-300">{sub.channel}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${sub.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {sub.retryCount > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                          Retry: {sub.retryCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Status */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Last Sync Times</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {tasksHook.lastSyncTime ? 
                      formatTime(Date.now() - tasksHook.lastSyncTime.getTime()) + ' ago' : 
                      'Never'
                    }
                  </div>
                  <div className="text-sm text-gray-400">Tasks</div>
                  {tasksHook.subscriptionError && (
                    <div className="text-xs text-red-400 mt-1">{tasksHook.subscriptionError}</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {messagesHook.lastSyncTime ? 
                      formatTime(Date.now() - messagesHook.lastSyncTime.getTime()) + ' ago' : 
                      'Never'
                    }
                  </div>
                  <div className="text-sm text-gray-400">Messages</div>
                  {messagesHook.subscriptionError && (
                    <div className="text-xs text-red-400 mt-1">{messagesHook.subscriptionError}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Test Controls */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Testing Controls</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={runSyncTest}
                  disabled={isRunningTest || !team?.$id}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunningTest ? 'Running Test...' : 'Run Sync Test'}
                </button>
                
                <button
                  onClick={activeMonitor ? stopMonitoring : startMonitoring}
                  disabled={!team?.$id}
                  className={`px-4 py-2 rounded text-white ${
                    activeMonitor 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {activeMonitor ? 'Stop Monitoring' : 'Start Monitoring'}
                </button>

                <button
                  onClick={() => realtimeService.reconnectAll()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Force Reconnect
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResults && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Test Results</h3>
                {testResults.error ? (
                  <div className="text-red-400">Error: {testResults.error}</div>
                ) : (
                  <div className="space-y-3">
                    {testResults.taskCreation?.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                        <span className="text-sm text-white">Task Creation</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getSyncStatusColor(result.syncTime)}`}>
                            {formatTime(result.syncTime)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {result.success ? 'Pass' : 'Fail'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {testResults.taskUpdates?.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                        <span className="text-sm text-white">Task Update ({result.fromStatus} → {result.toStatus})</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getSyncStatusColor(result.syncTime)}`}>
                            {formatTime(result.syncTime)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {result.success ? 'Pass' : 'Fail'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {testResults.systemMessages?.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                        <span className="text-sm text-white">System Message</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getSyncStatusColor(result.syncTime)}`}>
                            {formatTime(result.syncTime)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {result.success ? 'Pass' : 'Fail'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Monitoring Data */}
            {monitoringData && (
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Monitoring Results {activeMonitor && '(Live)'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {monitoringData.taskSyncCount || 0}
                    </div>
                    <div className="text-sm text-gray-400">Task Syncs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {monitoringData.messageSyncCount || 0}
                    </div>
                    <div className="text-sm text-gray-400">Message Syncs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {monitoringData.connectionIssues || 0}
                    </div>
                    <div className="text-sm text-gray-400">Connection Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatTime(monitoringData.duration || 0)}
                    </div>
                    <div className="text-sm text-gray-400">Duration</div>
                  </div>
                </div>
                
                {/* Detailed stats for completed monitoring */}
                {!activeMonitor && monitoringData.taskSyncStats && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-600 rounded">
                      <h4 className="font-semibold text-white mb-2">Task Sync Stats</h4>
                      <div className="text-sm space-y-1 text-gray-300">
                        <div>Average: {formatTime(monitoringData.taskSyncStats.averageTime)}</div>
                        <div>Max: {formatTime(monitoringData.taskSyncStats.maxTime)}</div>
                        <div>Success Rate: {monitoringData.taskSyncStats.successRate}%</div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-600 rounded">
                      <h4 className="font-semibold text-white mb-2">Message Sync Stats</h4>
                      <div className="text-sm space-y-1 text-gray-300">
                        <div>Average: {formatTime(monitoringData.messageSyncStats.averageTime)}</div>
                        <div>Max: {formatTime(monitoringData.messageSyncStats.maxTime)}</div>
                        <div>Success Rate: {monitoringData.messageSyncStats.successRate}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('RealtimeDebugPanel render error:', error);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Debug Panel Error</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-red-400 mb-4">
            An error occurred while loading the debug panel: {error.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default RealtimeDebugPanel;