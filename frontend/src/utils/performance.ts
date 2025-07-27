/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observer?: PerformanceObserver

  constructor() {
    this.initializeObserver()
    this.measureNavigationTiming()
  }

  private initializeObserver() {
    if (!('PerformanceObserver' in window)) {
      return
    }

    try {
      // Observe paint metrics
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                this.metrics.fcp = entry.startTime
              }
              break
            case 'largest-contentful-paint':
              this.metrics.lcp = entry.startTime
              break
            case 'first-input':
              this.metrics.fid = (entry as any).processingStart - entry.startTime
              break
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                this.metrics.cls = (this.metrics.cls || 0) + (entry as any).value
              }
              break
          }
        }
      })

      // Start observing
      this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('Performance observer not supported:', error)
    }
  }

  private measureNavigationTiming() {
    if (!('performance' in window) || !performance.getEntriesByType) {
      return
    }

    // Measure TTFB when navigation is complete
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart
      }
    })
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  logMetrics() {
    console.group('Performance Metrics')
    console.log('First Contentful Paint (FCP):', this.metrics.fcp ? `${this.metrics.fcp.toFixed(2)}ms` : 'Not measured')
    console.log('Largest Contentful Paint (LCP):', this.metrics.lcp ? `${this.metrics.lcp.toFixed(2)}ms` : 'Not measured')
    console.log('First Input Delay (FID):', this.metrics.fid ? `${this.metrics.fid.toFixed(2)}ms` : 'Not measured')
    console.log('Cumulative Layout Shift (CLS):', this.metrics.cls ? this.metrics.cls.toFixed(4) : 'Not measured')
    console.log('Time to First Byte (TTFB):', this.metrics.ttfb ? `${this.metrics.ttfb.toFixed(2)}ms` : 'Not measured')
    console.groupEnd()
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Measure component render time
 */
export function measureRenderTime<T extends any[]>(
  componentName: string,
  renderFn: (...args: T) => any
) {
  return (...args: T) => {
    const start = performance.now()
    const result = renderFn(...args)
    const end = performance.now()
    
    if (end - start > 16) { // Only log if render takes more than 16ms (60fps threshold)
      console.warn(`${componentName} render took ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T {
  let timeout: number | null = null
  
  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }) as T
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (!('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  })
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  
  document.head.appendChild(link)
}

/**
 * Check if device has limited resources (mobile, slow connection)
 */
export function isLowEndDevice(): boolean {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true
  }
  
  // Check for slow connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return true
    }
  }
  
  // Check for limited memory
  if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
    return true
  }
  
  // Check for limited CPU cores
  if ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4) {
    return true
  }
  
  return false
}

/**
 * Optimize images for mobile devices
 */
export function getOptimizedImageUrl(originalUrl: string, width?: number, quality = 80): string {
  // In a real implementation, this would integrate with an image optimization service
  // For now, just return the original URL
  return originalUrl
}