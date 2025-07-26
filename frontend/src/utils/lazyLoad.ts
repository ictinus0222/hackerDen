import { lazy, ComponentType } from 'react'

/**
 * Utility function to create lazy-loaded components with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3
): ComponentType<any> {
  return lazy(async () => {
    let lastError: Error | null = null
    
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport()
      } catch (error) {
        lastError = error as Error
        
        // Wait before retrying (exponential backoff)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }
    
    throw lastError
  })
}

/**
 * Preload a component for better performance
 */
export function preloadComponent(componentImport: () => Promise<any>): void {
  // Only preload if we're in a browser environment and have idle time
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      componentImport().catch(() => {
        // Silently fail preloading
      })
    })
  }
}