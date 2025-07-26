/**
 * Performance testing utilities for mobile devices and slow networks
 */

interface PerformanceTestResult {
  testName: string
  duration: number
  success: boolean
  error?: string
  metrics?: Record<string, any>
}

interface NetworkTestResult {
  downloadSpeed: number // Mbps
  uploadSpeed: number // Mbps
  latency: number // ms
  connectionType: string
}

class PerformanceTestSuite {
  private results: PerformanceTestResult[] = []

  /**
   * Test component render performance
   */
  async testComponentRender(
    componentName: string,
    renderFn: () => void,
    iterations = 10
  ): Promise<PerformanceTestResult> {
    const testName = `Component Render: ${componentName}`
    const durations: number[] = []

    try {
      for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        renderFn()
        const end = performance.now()
        durations.push(end - start)
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const maxDuration = Math.max(...durations)
      const minDuration = Math.min(...durations)

      const result: PerformanceTestResult = {
        testName,
        duration: avgDuration,
        success: avgDuration < 16, // 60fps threshold
        metrics: {
          average: avgDuration,
          max: maxDuration,
          min: minDuration,
          iterations,
        },
      }

      this.results.push(result)
      return result
    } catch (error) {
      const result: PerformanceTestResult = {
        testName,
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      this.results.push(result)
      return result
    }
  }

  /**
   * Test API call performance
   */
  async testApiCall(
    endpoint: string,
    options?: RequestInit
  ): Promise<PerformanceTestResult> {
    const testName = `API Call: ${endpoint}`
    const start = performance.now()

    try {
      const response = await fetch(endpoint, options)
      const end = performance.now()
      const duration = end - start

      const result: PerformanceTestResult = {
        testName,
        duration,
        success: response.ok && duration < 5000, // 5 second threshold
        metrics: {
          status: response.status,
          size: response.headers.get('content-length') || 'unknown',
        },
      }

      this.results.push(result)
      return result
    } catch (error) {
      const end = performance.now()
      const result: PerformanceTestResult = {
        testName,
        duration: end - start,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      this.results.push(result)
      return result
    }
  }

  /**
   * Test bundle loading performance
   */
  async testBundleLoading(): Promise<PerformanceTestResult> {
    const testName = 'Bundle Loading'

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (!navigation) {
        throw new Error('Navigation timing not available')
      }

      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: 0,
        firstContentfulPaint: 0,
      }

      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime
        }
      })

      const result: PerformanceTestResult = {
        testName,
        duration: metrics.loadComplete,
        success: metrics.loadComplete < 3000 && metrics.firstContentfulPaint < 2000,
        metrics,
      }

      this.results.push(result)
      return result
    } catch (error) {
      const result: PerformanceTestResult = {
        testName,
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      this.results.push(result)
      return result
    }
  }

  /**
   * Test network performance
   */
  async testNetworkPerformance(): Promise<NetworkTestResult> {
    const testUrl = '/api/health' // Assuming a health check endpoint
    const testData = new Uint8Array(1024 * 100) // 100KB test data

    try {
      // Test download speed
      const downloadStart = performance.now()
      await fetch(testUrl)
      const downloadEnd = performance.now()
      const downloadTime = downloadEnd - downloadStart
      const downloadSpeed = (100 * 8) / (downloadTime / 1000) // Convert to Mbps

      // Test upload speed (if supported)
      let uploadSpeed = 0
      try {
        const uploadStart = performance.now()
        await fetch(testUrl, {
          method: 'POST',
          body: testData,
        })
        const uploadEnd = performance.now()
        const uploadTime = uploadEnd - uploadStart
        uploadSpeed = (100 * 8) / (uploadTime / 1000) // Convert to Mbps
      } catch {
        // Upload test failed, continue with download results
      }

      // Test latency
      const latencyStart = performance.now()
      await fetch(testUrl, { method: 'HEAD' })
      const latencyEnd = performance.now()
      const latency = latencyEnd - latencyStart

      // Get connection type
      let connectionType = 'unknown'
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connectionType = connection.effectiveType || 'unknown'
      }

      return {
        downloadSpeed,
        uploadSpeed,
        latency,
        connectionType,
      }
    } catch (error) {
      console.error('Network performance test failed:', error)
      return {
        downloadSpeed: 0,
        uploadSpeed: 0,
        latency: 0,
        connectionType: 'unknown',
      }
    }
  }

  /**
   * Test memory usage
   */
  testMemoryUsage(): PerformanceTestResult {
    const testName = 'Memory Usage'

    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const metrics = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        }

        const result: PerformanceTestResult = {
          testName,
          duration: 0,
          success: metrics.usagePercentage < 80, // Less than 80% memory usage
          metrics,
        }

        this.results.push(result)
        return result
      } else {
        throw new Error('Memory API not available')
      }
    } catch (error) {
      const result: PerformanceTestResult = {
        testName,
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      this.results.push(result)
      return result
    }
  }

  /**
   * Run comprehensive performance test suite
   */
  async runFullTestSuite(): Promise<{
    results: PerformanceTestResult[]
    networkResult: NetworkTestResult
    summary: {
      totalTests: number
      passedTests: number
      failedTests: number
      averageDuration: number
    }
  }> {
    console.log('Starting performance test suite...')

    // Clear previous results
    this.results = []

    // Run tests
    await this.testBundleLoading()
    this.testMemoryUsage()
    
    const networkResult = await this.testNetworkPerformance()

    // Calculate summary
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests

    const summary = {
      totalTests,
      passedTests,
      failedTests,
      averageDuration,
    }

    console.log('Performance test suite completed:', summary)

    return {
      results: [...this.results],
      networkResult,
      summary,
    }
  }

  /**
   * Get all test results
   */
  getResults(): PerformanceTestResult[] {
    return [...this.results]
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.results = []
  }
}

// Export singleton instance
export const performanceTestSuite = new PerformanceTestSuite()

/**
 * Quick performance check for mobile devices
 */
export function quickMobilePerformanceCheck(): {
  isLowEndDevice: boolean
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
  recommendations: string[]
} {
  const recommendations: string[] = []
  let isLowEndDevice = false
  let connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'good'

  // Check device memory
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory
    if (memory < 4) {
      isLowEndDevice = true
      recommendations.push('Enable data saver mode')
      recommendations.push('Reduce animation complexity')
    }
  }

  // Check CPU cores
  if ('hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency
    if (cores < 4) {
      isLowEndDevice = true
      recommendations.push('Optimize background processing')
    }
  }

  // Check connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection.effectiveType

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        connectionQuality = 'poor'
        recommendations.push('Enable offline mode')
        recommendations.push('Reduce image quality')
        recommendations.push('Increase polling intervals')
        break
      case '3g':
        connectionQuality = 'fair'
        recommendations.push('Optimize image loading')
        recommendations.push('Use progressive loading')
        break
      case '4g':
        connectionQuality = 'excellent'
        break
      default:
        connectionQuality = 'good'
    }

    if (connection.saveData) {
      recommendations.push('Data saver mode is enabled')
      recommendations.push('Minimize data usage')
    }
  }

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    recommendations.push('Reduce animations and transitions')
  }

  return {
    isLowEndDevice,
    connectionQuality,
    recommendations,
  }
}