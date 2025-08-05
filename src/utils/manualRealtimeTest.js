/**
 * Manual Real-time Testing Script
 * 
 * This script can be run in the browser console to test real-time synchronization
 * across multiple tabs. Open multiple tabs and run this script in each.
 */

window.realtimeTest = {
  // Test configuration
  config: {
    testDuration: 30000, // 30 seconds
    syncThreshold: 2000, // 2 seconds
    tabId: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Test results storage
  results: {
    taskSyncs: [],
    messageSyncs: [],
    connectionIssues: [],
    startTime: null
  },

  // Start the test
  async start() {
    console.log(`🚀 Starting real-time sync test on ${this.config.tabId}`);
    this.results.startTime = Date.now();
    
    // Store tab info in localStorage for cross-tab coordination
    const tabInfo = {
      id: this.config.tabId,
      startTime: this.results.startTime,
      status: 'active'
    };
    localStorage.setItem(`realtimeTest_${this.config.tabId}`, JSON.stringify(tabInfo));

    // Monitor for other tabs
    this.monitorOtherTabs();

    // Start monitoring sync performance
    this.monitorSyncPerformance();

    // Run for configured duration
    setTimeout(() => {
      this.stop();
    }, this.config.testDuration);

    console.log(`📊 Test will run for ${this.config.testDuration / 1000} seconds`);
    console.log(`🔍 Monitoring sync times (threshold: ${this.config.syncThreshold}ms)`);
  },

  // Monitor other tabs
  monitorOtherTabs() {
    const checkOtherTabs = () => {
      const keys = Object.keys(localStorage);
      const testKeys = keys.filter(key => key.startsWith('realtimeTest_'));
      const otherTabs = testKeys
        .filter(key => key !== `realtimeTest_${this.config.tabId}`)
        .map(key => JSON.parse(localStorage.getItem(key)));

      if (otherTabs.length > 0) {
        console.log(`👥 Detected ${otherTabs.length} other test tabs:`, otherTabs.map(t => t.id));
      }
    };

    // Check every 5 seconds
    this.otherTabsInterval = setInterval(checkOtherTabs, 5000);
    checkOtherTabs(); // Initial check
  },

  // Monitor sync performance
  monitorSyncPerformance() {
    // Monitor task sync times by watching for DOM changes
    this.monitorTaskSync();
    
    // Monitor message sync times
    this.monitorMessageSync();
    
    // Monitor connection status
    this.monitorConnectionStatus();
  },

  // Monitor task synchronization
  monitorTaskSync() {
    const taskBoard = document.querySelector('[data-testid="kanban-board"]') || 
                     document.querySelector('.kanban-board') ||
                     document.querySelector('[class*="kanban"]');
    
    if (!taskBoard) {
      console.warn('⚠️ Kanban board not found - task sync monitoring disabled');
      return;
    }

    let lastTaskCount = taskBoard.querySelectorAll('[data-testid="task-card"], .task-card, [class*="task"]').length;
    let lastChangeTime = Date.now();

    const checkTaskChanges = () => {
      const currentTaskCount = taskBoard.querySelectorAll('[data-testid="task-card"], .task-card, [class*="task"]').length;
      
      if (currentTaskCount !== lastTaskCount) {
        const syncTime = Date.now() - lastChangeTime;
        const withinThreshold = syncTime <= this.config.syncThreshold;
        
        this.results.taskSyncs.push({
          timestamp: Date.now(),
          syncTime,
          withinThreshold,
          taskCount: currentTaskCount,
          change: currentTaskCount > lastTaskCount ? 'added' : 'removed'
        });

        console.log(`📝 Task sync detected: ${syncTime}ms ${withinThreshold ? '✅' : '❌'} (${currentTaskCount} tasks)`);
        
        lastTaskCount = currentTaskCount;
        lastChangeTime = Date.now();
      }
    };

    this.taskSyncInterval = setInterval(checkTaskChanges, 100);
  },

  // Monitor message synchronization
  monitorMessageSync() {
    const chatContainer = document.querySelector('[data-testid="chat-messages"]') || 
                         document.querySelector('.chat-messages') ||
                         document.querySelector('[class*="message"]').parentElement;
    
    if (!chatContainer) {
      console.warn('⚠️ Chat container not found - message sync monitoring disabled');
      return;
    }

    let lastMessageCount = chatContainer.querySelectorAll('[data-testid="message"], .message, [class*="message"]').length;
    let lastChangeTime = Date.now();

    const checkMessageChanges = () => {
      const currentMessageCount = chatContainer.querySelectorAll('[data-testid="message"], .message, [class*="message"]').length;
      
      if (currentMessageCount !== lastMessageCount) {
        const syncTime = Date.now() - lastChangeTime;
        const withinThreshold = syncTime <= this.config.syncThreshold;
        
        this.results.messageSyncs.push({
          timestamp: Date.now(),
          syncTime,
          withinThreshold,
          messageCount: currentMessageCount,
          change: currentMessageCount > lastMessageCount ? 'added' : 'removed'
        });

        console.log(`💬 Message sync detected: ${syncTime}ms ${withinThreshold ? '✅' : '❌'} (${currentMessageCount} messages)`);
        
        lastMessageCount = currentMessageCount;
        lastChangeTime = Date.now();
      }
    };

    this.messageSyncInterval = setInterval(checkMessageChanges, 100);
  },

  // Monitor connection status
  monitorConnectionStatus() {
    const connectionIndicator = document.querySelector('[data-testid="connection-status"]') ||
                               document.querySelector('.connection-status');
    
    let wasConnected = true;
    let disconnectTime = null;

    const checkConnectionStatus = () => {
      // Check if connection indicator shows disconnected state
      const isConnected = !connectionIndicator || 
                         !connectionIndicator.textContent.toLowerCase().includes('offline') &&
                         !connectionIndicator.textContent.toLowerCase().includes('reconnecting');

      if (!isConnected && wasConnected) {
        // Connection lost
        disconnectTime = Date.now();
        console.log('🔴 Connection lost detected');
        
        this.results.connectionIssues.push({
          type: 'disconnect',
          timestamp: disconnectTime
        });
      } else if (isConnected && !wasConnected && disconnectTime) {
        // Connection restored
        const downtime = Date.now() - disconnectTime;
        console.log(`🟢 Connection restored after ${downtime}ms`);
        
        this.results.connectionIssues.push({
          type: 'reconnect',
          timestamp: Date.now(),
          downtime
        });
        
        disconnectTime = null;
      }

      wasConnected = isConnected;
    };

    this.connectionInterval = setInterval(checkConnectionStatus, 1000);
  },

  // Stop the test and generate report
  stop() {
    console.log('🛑 Stopping real-time sync test...');
    
    // Clear intervals
    if (this.otherTabsInterval) clearInterval(this.otherTabsInterval);
    if (this.taskSyncInterval) clearInterval(this.taskSyncInterval);
    if (this.messageSyncInterval) clearInterval(this.messageSyncInterval);
    if (this.connectionInterval) clearInterval(this.connectionInterval);

    // Generate report
    this.generateReport();

    // Clean up localStorage
    localStorage.removeItem(`realtimeTest_${this.config.tabId}`);
  },

  // Generate test report
  generateReport() {
    const duration = Date.now() - this.results.startTime;
    
    const taskSyncStats = this.calculateStats(this.results.taskSyncs);
    const messageSyncStats = this.calculateStats(this.results.messageSyncs);
    
    const report = {
      tabId: this.config.tabId,
      duration: `${(duration / 1000).toFixed(1)}s`,
      taskSyncs: {
        count: this.results.taskSyncs.length,
        ...taskSyncStats
      },
      messageSyncs: {
        count: this.results.messageSyncs.length,
        ...messageSyncStats
      },
      connectionIssues: this.results.connectionIssues.length,
      overallScore: this.calculateOverallScore(taskSyncStats, messageSyncStats)
    };

    console.log('📋 Real-time Sync Test Report:');
    console.table(report);
    
    // Store report for potential aggregation
    localStorage.setItem(`realtimeTestReport_${this.config.tabId}`, JSON.stringify({
      ...report,
      timestamp: new Date().toISOString(),
      rawData: this.results
    }));

    return report;
  },

  // Calculate statistics for sync times
  calculateStats(syncs) {
    if (syncs.length === 0) {
      return {
        averageTime: 0,
        maxTime: 0,
        minTime: 0,
        successRate: 0
      };
    }

    const times = syncs.map(s => s.syncTime);
    const successful = syncs.filter(s => s.withinThreshold).length;

    return {
      averageTime: `${Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms`,
      maxTime: `${Math.max(...times)}ms`,
      minTime: `${Math.min(...times)}ms`,
      successRate: `${Math.round((successful / syncs.length) * 100)}%`
    };
  },

  // Calculate overall performance score
  calculateOverallScore(taskStats, messageStats) {
    const taskScore = taskStats.successRate ? parseInt(taskStats.successRate) : 100;
    const messageScore = messageStats.successRate ? parseInt(messageStats.successRate) : 100;
    const connectionPenalty = this.results.connectionIssues.length * 10;
    
    const score = Math.max(0, Math.round((taskScore + messageScore) / 2) - connectionPenalty);
    
    if (score >= 90) return `${score}% 🏆 Excellent`;
    if (score >= 75) return `${score}% 🥈 Good`;
    if (score >= 60) return `${score}% 🥉 Fair`;
    return `${score}% ❌ Needs Improvement`;
  },

  // Create a test task (if possible)
  async createTestTask() {
    const createButton = document.querySelector('[data-testid="create-task"]') ||
                        document.querySelector('button[class*="create"]') ||
                        document.querySelector('button:contains("Add Task")');
    
    if (createButton) {
      console.log('📝 Creating test task...');
      createButton.click();
      
      // Try to fill in task details
      setTimeout(() => {
        const titleInput = document.querySelector('input[placeholder*="title"], input[name*="title"]');
        const descInput = document.querySelector('textarea[placeholder*="description"], textarea[name*="description"]');
        const submitButton = document.querySelector('button[type="submit"], button:contains("Create")');
        
        if (titleInput) {
          titleInput.value = `Test Task from ${this.config.tabId}`;
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (descInput) {
          descInput.value = `Created at ${new Date().toISOString()} for real-time sync testing`;
          descInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (submitButton) {
          setTimeout(() => submitButton.click(), 500);
        }
      }, 500);
    } else {
      console.warn('⚠️ Create task button not found');
    }
  },

  // Send a test message (if possible)
  async sendTestMessage() {
    const messageInput = document.querySelector('input[placeholder*="message"], textarea[placeholder*="message"]') ||
                        document.querySelector('input[type="text"]:last-of-type');
    const sendButton = document.querySelector('button[type="submit"]:last-of-type') ||
                      document.querySelector('button:contains("Send")');
    
    if (messageInput) {
      console.log('💬 Sending test message...');
      messageInput.value = `Test message from ${this.config.tabId} at ${new Date().toLocaleTimeString()}`;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      if (sendButton) {
        setTimeout(() => sendButton.click(), 200);
      } else {
        // Try Enter key
        messageInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      }
    } else {
      console.warn('⚠️ Message input not found');
    }
  },

  // Get all test reports from localStorage
  getAllReports() {
    const keys = Object.keys(localStorage);
    const reportKeys = keys.filter(key => key.startsWith('realtimeTestReport_'));
    const reports = reportKeys.map(key => JSON.parse(localStorage.getItem(key)));
    
    console.log('📊 All Test Reports:');
    reports.forEach(report => {
      console.log(`Tab ${report.tabId}:`, report);
    });
    
    return reports;
  },

  // Clear all test data
  clearTestData() {
    const keys = Object.keys(localStorage);
    const testKeys = keys.filter(key => 
      key.startsWith('realtimeTest_') || 
      key.startsWith('realtimeTestReport_')
    );
    
    testKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared ${testKeys.length} test data entries`);
  }
};

// Auto-start if in test mode
if (window.location.search.includes('realtimeTest=true')) {
  console.log('🔄 Auto-starting real-time test...');
  setTimeout(() => window.realtimeTest.start(), 2000);
}

console.log('🧪 Real-time test utilities loaded. Use:');
console.log('- window.realtimeTest.start() - Start monitoring');
console.log('- window.realtimeTest.createTestTask() - Create test task');
console.log('- window.realtimeTest.sendTestMessage() - Send test message');
console.log('- window.realtimeTest.getAllReports() - View all reports');
console.log('- window.realtimeTest.clearTestData() - Clear test data');