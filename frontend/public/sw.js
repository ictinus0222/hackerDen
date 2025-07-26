const CACHE_NAME = 'hackerden-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets as needed
]

const API_CACHE_NAME = 'hackerden-api-v1'
const OFFLINE_URL = '/offline.html'

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS)
      }),
      caches.open(API_CACHE_NAME)
    ])
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle other requests (static assets)
  event.respondWith(handleStaticRequest(request))
})

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME)
  
  try {
    // Try network first
    const response = await fetch(request)
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.ok) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'You are currently offline. Please check your connection and try again.'
        }
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleNavigationRequest(request) {
  try {
    // Try network first
    const response = await fetch(request)
    return response
  } catch (error) {
    // Network failed, serve from cache
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match('/index.html')
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback to offline page
    return cache.match(OFFLINE_URL) || new Response('Offline')
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  
  // Try cache first for static assets
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    // Try network
    const response = await fetch(request)
    
    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Network failed and not in cache
    return new Response('Resource not available offline', { status: 503 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  // Handle queued offline actions when back online
  const cache = await caches.open(API_CACHE_NAME)
  const offlineActions = await getOfflineActions()
  
  for (const action of offlineActions) {
    try {
      await fetch(action.url, action.options)
      await removeOfflineAction(action.id)
    } catch (error) {
      console.log('Background sync failed for action:', action.id)
    }
  }
}

// Helper functions for offline action queue
async function getOfflineActions() {
  // This would typically use IndexedDB
  return []
}

async function removeOfflineAction(actionId) {
  // This would typically use IndexedDB
}