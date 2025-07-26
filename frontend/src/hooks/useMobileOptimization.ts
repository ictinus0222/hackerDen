import { useState, useEffect, useCallback } from 'react'
import { debounce, throttle, isLowEndDevice } from '../utils/performance'
import { addNetworkListeners } from '../utils/serviceWorker'

interface MobileOptimizationConfig {
  enableReducedMotion?: boolean
  enableDataSaver?: boolean
  optimizeForLowEnd?: boolean
}

export function useMobileOptimization(config: MobileOptimizationConfig = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isLowEnd, setIsLowEnd] = useState(false)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    // Check device capabilities
    setIsLowEnd(isLowEndDevice())

    // Check connection type
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection.effectiveType || 'unknown')
      
      const updateConnection = () => {
        setConnectionType(connection.effectiveType || 'unknown')
      }
      
      connection.addEventListener('change', updateConnection)
      return () => connection.removeEventListener('change', updateConnection)
    }
  }, [])

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduceMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    // Listen for network changes
    const cleanup = addNetworkListeners(
      () => setIsOnline(true),
      () => setIsOnline(false)
    )
    
    return cleanup
  }, [])

  // Optimized debounce for mobile
  const createOptimizedDebounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number = 300
  ): T => {
    // Increase delay for low-end devices or slow connections
    const optimizedDelay = isLowEnd || connectionType === 'slow-2g' || connectionType === '2g' 
      ? delay * 2 
      : delay
    
    return debounce(func, optimizedDelay)
  }, [isLowEnd, connectionType])

  // Optimized throttle for mobile
  const createOptimizedThrottle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number = 100
  ): T => {
    // Increase limit for low-end devices
    const optimizedLimit = isLowEnd ? limit * 2 : limit
    
    return throttle(func, optimizedLimit)
  }, [isLowEnd])

  // Check if we should reduce data usage
  const shouldReduceData = useCallback(() => {
    if (config.enableDataSaver === false) return false
    
    // Reduce data on slow connections
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return true
    }
    
    // Check for data saver mode
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection.saveData === true
    }
    
    return false
  }, [connectionType, config.enableDataSaver])

  // Get optimized polling interval
  const getOptimizedPollingInterval = useCallback((baseInterval: number = 5000) => {
    if (!isOnline) return null
    
    // Increase interval for slow connections or low-end devices
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return baseInterval * 3
    }
    
    if (isLowEnd) {
      return baseInterval * 2
    }
    
    return baseInterval
  }, [isOnline, connectionType, isLowEnd])

  // Check if animations should be reduced
  const shouldReduceAnimations = useCallback(() => {
    if (config.enableReducedMotion === false) return false
    
    return shouldReduceMotion || isLowEnd
  }, [shouldReduceMotion, isLowEnd, config.enableReducedMotion])

  // Get optimized batch size for API calls
  const getOptimizedBatchSize = useCallback((baseBatchSize: number = 20) => {
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return Math.max(5, Math.floor(baseBatchSize / 4))
    }
    
    if (isLowEnd) {
      return Math.max(10, Math.floor(baseBatchSize / 2))
    }
    
    return baseBatchSize
  }, [connectionType, isLowEnd])

  return {
    isOnline,
    isLowEnd,
    connectionType,
    shouldReduceMotion,
    shouldReduceData: shouldReduceData(),
    shouldReduceAnimations: shouldReduceAnimations(),
    createOptimizedDebounce,
    createOptimizedThrottle,
    getOptimizedPollingInterval,
    getOptimizedBatchSize,
  }
}

/**
 * Hook for optimizing component updates on mobile
 */
export function useMobileComponentOptimization() {
  const { isLowEnd, shouldReduceAnimations } = useMobileOptimization()
  
  // Reduce update frequency for low-end devices
  const optimizeUpdates = useCallback(<T extends (...args: any[]) => any>(
    updateFn: T,
    delay: number = 16
  ): T => {
    if (!isLowEnd) return updateFn
    
    return throttle(updateFn, delay * 2)
  }, [isLowEnd])
  
  // Get optimized animation duration
  const getAnimationDuration = useCallback((baseDuration: number = 300) => {
    if (shouldReduceAnimations) return 0
    if (isLowEnd) return baseDuration / 2
    
    return baseDuration
  }, [shouldReduceAnimations, isLowEnd])
  
  return {
    isLowEnd,
    shouldReduceAnimations,
    optimizeUpdates,
    getAnimationDuration,
  }
}