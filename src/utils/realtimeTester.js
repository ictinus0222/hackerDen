/**
 * Real-time Synchronization Testing Utility
 * 
 * This utility helps test real-time synchronization across multiple browser tabs
 * and provides monitoring tools for sync performance.
 */

class RealtimeTester {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
    this.startTime = null;
    this.syncTimes = [];
  }

  /**
   * Test task synchronization across multiple tabs
   */
  async testTaskSync(teamId, taskService, messageService) {
    console.log('🧪 Starting task synchronization test...');
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    const testResults = {
      taskCreation: [],
      taskUpdates: [],
      systemMessages: [],
      errors: []
    };

    try {
      // Test 1: Task Creation Sync
      console.log('📝 Testing task creation sync...');
      const createStartTime = Date.now();
      
      const newTask = await taskService.createTask(teamId, {
        title: `Test Task ${Date.now()}`,
        description: 'Real-time sync test task',
        assignedTo: 'test-user',
        createdBy: 'test-user'
      }, 'Test User');

      const createEndTime = Date.now();
      const createSyncTime = createEndTime - createStartTime;
      
      testResults.taskCreation.push({
        taskId: newTask.$id,
        syncTime: createSyncTime,
        success: createSyncTime < 2000
      });

      console.log(`✅ Task creation sync: ${createSyncTime}ms`);

      // Test 2: Task Status Update Sync
      console.log('🔄 Testing task status update sync...');
      const updateStartTime = Date.now();
      
      await taskService.updateTaskStatus(
        newTask.$id, 
        'in_progress', 
        newTask.title, 
        teamId
      );

      const updateEndTime = Date.now();
      const updateSyncTime = updateEndTime - updateStartTime;
      
      testResults.taskUpdates.push({
        taskId: newTask.$id,
        fromStatus: 'todo',
        toStatus: 'in_progress',
        syncTime: updateSyncTime,
        success: updateSyncTime < 2000
      });

      console.log(`✅ Task update sync: ${updateSyncTime}ms`);

      // Test 3: System Message Sync
      console.log('💬 Testing system message sync...');
      const messageStartTime = Date.now();
      
      await messageService.sendSystemMessage(
        teamId,
        '🧪 Real-time sync test completed',
        'test'
      );

      const messageEndTime = Date.now();
      const messageSyncTime = messageEndTime - messageStartTime;
      
      testResults.systemMessages.push({
        syncTime: messageSyncTime,
        success: messageSyncTime < 2000
      });

      console.log(`✅ System message sync: ${messageSyncTime}ms`);

    } catch (error) {
      console.error('❌ Test error:', error);
      testResults.errors.push({
        error: error.message,
        timestamp: Date.now()
      });
    }

    this.isRunning = false;
    this.testResults.push({
      timestamp: new Date(),
      duration: Date.now() - this.startTime,
      results: testResults
    });

    return testResults;
  }

  /**
   * Monitor sync performance over time
   */
  startSyncMonitoring(hooks) {
    console.log('📊 Starting sync performance monitoring...');
    
    const monitor = {
      taskSyncTimes: [],
      messageSyncTimes: [],
      connectionIssues: [],
      startTime: Date.now()
    };

    // Monitor task sync times
    if (hooks.useTasks) {
      const originalLastSyncTime = hooks.useTasks.lastSyncTime;
      let lastTaskSyncTime = Date.now();

      const checkTaskSync = () => {
        if (hooks.useTasks.lastSyncTime !== originalLastSyncTime) {
          const syncTime = Date.now() - lastTaskSyncTime;
          monitor.taskSyncTimes.push({
            timestamp: Date.now(),
            syncTime,
            withinThreshold: syncTime < 2000
          });
          lastTaskSyncTime = Date.now();
        }
      };

      const taskSyncInterval = setInterval(checkTaskSync, 100);
      monitor.taskSyncInterval = taskSyncInterval;
    }

    // Monitor message sync times
    if (hooks.useMessages) {
      const originalLastSyncTime = hooks.useMessages.lastSyncTime;
      let lastMessageSyncTime = Date.now();

      const checkMessageSync = () => {
        if (hooks.useMessages.lastSyncTime !== originalLastSyncTime) {
          const syncTime = Date.now() - lastMessageSyncTime;
          monitor.messageSyncTimes.push({
            timestamp: Date.now(),
            syncTime,
            withinThreshold: syncTime < 2000
          });
          lastMessageSyncTime = Date.now();
        }
      };

      const messageSyncInterval = setInterval(checkMessageSync, 100);
      monitor.messageSyncInterval = messageSyncInterval;
    }

    // Monitor connection issues
    if (hooks.useConnectionStatus) {
      const checkConnection = () => {
        if (!hooks.useConnectionStatus.isConnected) {
          monitor.connectionIssues.push({
            timestamp: Date.now(),
            isReconnecting: hooks.useConnectionStatus.isReconnecting,
            attempts: hooks.useConnectionStatus.reconnectAttempts
          });
        }
      };

      const connectionInterval = setInterval(checkConnection, 1000);
      monitor.connectionInterval = connectionInterval;
    }

    return monitor;
  }

  /**
   * Stop sync monitoring and return results
   */
  stopSyncMonitoring(monitor) {
    console.log('🛑 Stopping sync performance monitoring...');
    
    if (monitor.taskSyncInterval) {
      clearInterval(monitor.taskSyncInterval);
    }
    if (monitor.messageSyncInterval) {
      clearInterval(monitor.messageSyncInterval);
    }
    if (monitor.connectionInterval) {
      clearInterval(monitor.connectionInterval);
    }

    const duration = Date.now() - monitor.startTime;
    
    const results = {
      duration,
      taskSyncStats: this.calculateSyncStats(monitor.taskSyncTimes),
      messageSyncStats: this.calculateSyncStats(monitor.messageSyncTimes),
      connectionIssues: monitor.connectionIssues.length,
      totalEvents: monitor.taskSyncTimes.length + monitor.messageSyncTimes.length
    };

    console.log('📊 Monitoring Results:', results);
    return results;
  }

  /**
   * Calculate sync statistics
   */
  calculateSyncStats(syncTimes) {
    if (syncTimes.length === 0) {
      return {
        count: 0,
        averageTime: 0,
        maxTime: 0,
        minTime: 0,
        withinThreshold: 0,
        successRate: 0
      };
    }

    const times = syncTimes.map(s => s.syncTime);
    const withinThreshold = syncTimes.filter(s => s.withinThreshold).length;

    return {
      count: syncTimes.length,
      averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      withinThreshold,
      successRate: Math.round((withinThreshold / syncTimes.length) * 100)
    };
  }

  /**
   * Test multi-tab synchronization
   * This function should be called from multiple browser tabs
   */
  async testMultiTabSync(teamId, taskService, tabId = 'tab-1') {
    console.log(`🔄 Testing multi-tab sync from ${tabId}...`);
    
    const testKey = `multiTabTest_${Date.now()}`;
    const testData = {
      tabId,
      timestamp: Date.now(),
      testKey
    };

    // Store test data in localStorage to coordinate between tabs
    localStorage.setItem(testKey, JSON.stringify(testData));

    // Create a task with tab identifier
    const task = await taskService.createTask(teamId, {
      title: `Multi-tab test from ${tabId}`,
      description: `Created at ${new Date().toISOString()}`,
      assignedTo: 'test-user',
      createdBy: 'test-user'
    }, `Test User (${tabId})`);

    // Listen for tasks created by other tabs
    const otherTabTasks = [];
    const startTime = Date.now();
    
    const checkForOtherTabs = () => {
      const keys = Object.keys(localStorage);
      const testKeys = keys.filter(key => key.startsWith('multiTabTest_'));
      
      testKeys.forEach(key => {
        if (key !== testKey) {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.tabId !== tabId) {
            otherTabTasks.push(data);
          }
        }
      });
    };

    // Check every 100ms for 5 seconds
    const checkInterval = setInterval(checkForOtherTabs, 100);
    
    setTimeout(() => {
      clearInterval(checkInterval);
      
      const results = {
        tabId,
        taskCreated: task.$id,
        otherTabsDetected: otherTabTasks.length,
        testDuration: Date.now() - startTime,
        success: otherTabTasks.length > 0
      };

      console.log(`📊 Multi-tab test results for ${tabId}:`, results);
      
      // Clean up test data
      localStorage.removeItem(testKey);
      
      return results;
    }, 5000);
  }

  /**
   * Generate a comprehensive test report
   */
  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.length,
      summary: {
        taskCreationTests: 0,
        taskUpdateTests: 0,
        messageTests: 0,
        errors: 0,
        averageSyncTime: 0
      },
      details: this.testResults
    };

    this.testResults.forEach(test => {
      report.summary.taskCreationTests += test.results.taskCreation.length;
      report.summary.taskUpdateTests += test.results.taskUpdates.length;
      report.summary.messageTests += test.results.systemMessages.length;
      report.summary.errors += test.results.errors.length;
    });

    // Calculate average sync time
    const allSyncTimes = [];
    this.testResults.forEach(test => {
      test.results.taskCreation.forEach(t => allSyncTimes.push(t.syncTime));
      test.results.taskUpdates.forEach(t => allSyncTimes.push(t.syncTime));
      test.results.systemMessages.forEach(t => allSyncTimes.push(t.syncTime));
    });

    if (allSyncTimes.length > 0) {
      report.summary.averageSyncTime = Math.round(
        allSyncTimes.reduce((a, b) => a + b, 0) / allSyncTimes.length
      );
    }

    console.log('📋 Test Report Generated:', report);
    return report;
  }
}

// Export singleton instance
export const realtimeTester = new RealtimeTester();

// Helper function to run all tests
export const runRealtimeTests = async (teamId, services, hooks) => {
  console.log('🚀 Running comprehensive real-time tests...');
  
  const tester = new RealtimeTester();
  
  // Run basic sync tests
  const syncResults = await tester.testTaskSync(
    teamId, 
    services.taskService, 
    services.messageService
  );
  
  // Start monitoring
  const monitor = tester.startSyncMonitoring(hooks);
  
  // Let monitoring run for 30 seconds
  setTimeout(() => {
    const monitorResults = tester.stopSyncMonitoring(monitor);
    
    const finalReport = {
      syncTests: syncResults,
      monitoring: monitorResults,
      timestamp: new Date().toISOString()
    };
    
    console.log('🎯 Final Test Results:', finalReport);
    return finalReport;
  }, 30000);
};