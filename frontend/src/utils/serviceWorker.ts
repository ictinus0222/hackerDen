/**
 * Service Worker registration and management utilities
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
)

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onOfflineReady?: () => void
}

export function registerSW(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      return
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config)
        navigator.serviceWorker.ready.then(() => {
          console.log('Service worker is running in development mode')
        })
      } else {
        registerValidSW(swUrl, config)
      }
    })
  }
}

async function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  try {
    const registration = await navigator.serviceWorker.register(swUrl)
    
    registration.onupdatefound = () => {
      const installingWorker = registration.installing
      if (installingWorker == null) {
        return
      }

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available; please refresh
            console.log('New content is available; please refresh.')
            if (config && config.onUpdate) {
              config.onUpdate(registration)
            }
          } else {
            // Content is cached for offline use
            console.log('Content is cached for offline use.')
            if (config && config.onSuccess) {
              config.onSuccess(registration)
            }
            if (config && config.onOfflineReady) {
              config.onOfflineReady()
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during service worker registration:', error)
  }
}

async function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  try {
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    })
    
    const contentType = response.headers.get('content-type')
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      // No service worker found
      const registration = await navigator.serviceWorker.ready
      await registration.unregister()
      window.location.reload()
    } else {
      // Service worker found
      registerValidSW(swUrl, config)
    }
  } catch {
    console.log('No internet connection found. App is running in offline mode.')
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}

/**
 * Check if the app is running offline
 */
export function isOffline(): boolean {
  return !navigator.onLine
}

/**
 * Add offline/online event listeners
 */
export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  const handleOnline = () => onOnline()
  const handleOffline = () => onOffline()
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * Queue action for background sync when offline
 */
export async function queueOfflineAction(action: {
  id: string
  url: string
  options: RequestInit
}) {
  // In a real implementation, this would use IndexedDB
  const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]')
  offlineActions.push(action)
  localStorage.setItem('offlineActions', JSON.stringify(offlineActions))
  
  // Register for background sync if available
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready
    await (registration as any).sync?.register('background-sync')
  }
}