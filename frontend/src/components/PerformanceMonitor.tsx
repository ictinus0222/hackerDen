import React, { useState, useEffect } from 'react'
import { performanceMonitor } from '../utils/performance'
import { performanceTestSuite, quickMobilePerformanceCheck } from '../utils/performanceTest'
import { useMobileOptimization } from '../hooks/useMobileOptimization'

interface PerformanceMonitorProps {
  showInProduction?: boolean
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showInProduction = false
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)
  
  const {
    isOnline,
    isLowEnd,
    connectionType,
    shouldReduceData,
    shouldReduceAnimations,
  } = useMobileOptimization()

  // Only show in development unless explicitly enabled for production
  const shouldShow = import.meta.env.DEV || showInProduction

  useEffect(() => {
    if (!shouldShow) return

    // Show performance monitor with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [shouldShow, isVisible])

  const runPerformanceTests = async () => {
    setIsRunningTests(true)
    try {
      const results = await performanceTestSuite.runFullTestSuite()
      setTestResults(results)
    } catch (error) {
      console.error('Performance tests failed:', error)
    } finally {
      setIsRunningTests(false)
    }
  }

  const quickCheck = quickMobilePerformanceCheck()
  const metrics = performanceMonitor.getMetrics()

  if (!shouldShow || !isVisible) {
    return shouldShow ? (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
          title="Show Performance Monitor (Ctrl+Shift+P)"
        >
          📊
        </button>
      </div>
    ) : null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Device Info */}
      <div className="mb-3">
        <h4 className="font-medium mb-1">Device Status</h4>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Online:</span>
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Connection:</span>
            <span>{connectionType}</span>
          </div>
          <div className="flex justify-between">
            <span>Low-end device:</span>
            <span className={isLowEnd ? 'text-orange-600' : 'text-green-600'}>
              {isLowEnd ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Data saver:</span>
            <span className={shouldReduceData ? 'text-blue-600' : 'text-gray-600'}>
              {shouldReduceData ? 'On' : 'Off'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Reduced motion:</span>
            <span className={shouldReduceAnimations ? 'text-blue-600' : 'text-gray-600'}>
              {shouldReduceAnimations ? 'On' : 'Off'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-3">
        <h4 className="font-medium mb-1">Core Web Vitals</h4>
        <div className="space-y-1">
          {metrics.fcp && (
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={metrics.fcp < 1800 ? 'text-green-600' : metrics.fcp < 3000 ? 'text-orange-600' : 'text-red-600'}>
                {metrics.fcp.toFixed(0)}ms
              </span>
            </div>
          )}
          {metrics.lcp && (
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={metrics.lcp < 2500 ? 'text-green-600' : metrics.lcp < 4000 ? 'text-orange-600' : 'text-red-600'}>
                {metrics.lcp.toFixed(0)}ms
              </span>
            </div>
          )}
          {metrics.fid && (
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={metrics.fid < 100 ? 'text-green-600' : metrics.fid < 300 ? 'text-orange-600' : 'text-red-600'}>
                {metrics.fid.toFixed(0)}ms
              </span>
            </div>
          )}
          {metrics.cls !== undefined && (
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={metrics.cls < 0.1 ? 'text-green-600' : metrics.cls < 0.25 ? 'text-orange-600' : 'text-red-600'}>
                {metrics.cls.toFixed(3)}
              </span>
            </div>
          )}
          {metrics.ttfb && (
            <div className="flex justify-between">
              <span>TTFB:</span>
              <span className={metrics.ttfb < 800 ? 'text-green-600' : metrics.ttfb < 1800 ? 'text-orange-600' : 'text-red-600'}>
                {metrics.ttfb.toFixed(0)}ms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Check Recommendations */}
      {quickCheck.recommendations.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium mb-1">Recommendations</h4>
          <ul className="space-y-1">
            {quickCheck.recommendations.map((rec, index) => (
              <li key={index} className="text-blue-600">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Performance Tests */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Performance Tests</h4>
          <button
            onClick={runPerformanceTests}
            disabled={isRunningTests}
            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunningTests ? 'Running...' : 'Run Tests'}
          </button>
        </div>

        {testResults && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tests passed:</span>
              <span className="text-green-600">
                {testResults.summary.passedTests}/{testResults.summary.totalTests}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg duration:</span>
              <span>{testResults.summary.averageDuration.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Network:</span>
              <span>{testResults.networkResult.connectionType}</span>
            </div>
            {testResults.networkResult.downloadSpeed > 0 && (
              <div className="flex justify-between">
                <span>Download:</span>
                <span>{testResults.networkResult.downloadSpeed.toFixed(1)} Mbps</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => performanceMonitor.logMetrics()}
          className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
        >
          Log Metrics
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700"
        >
          Reload
        </button>
      </div>

      <div className="mt-2 text-gray-500 text-xs">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  )
}

export default PerformanceMonitor