const CACHE_NAME = 'wisdom-compass-v1';
const STATIC_CACHE_NAME = 'wisdom-compass-static-v1';
const DYNAMIC_CACHE_NAME = 'wisdom-compass-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API endpoints to cache dynamically
const API_CACHE_URLS = [
  '/api/quotes/daily',
  '/api/journal',
  '/api/reminders',
  '/api/background-image'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // For authentication endpoints, always go to network
  if (url.pathname.includes('/auth/') || url.pathname.includes('/login') || url.pathname.includes('/logout')) {
    try {
      return await fetch(request);
    } catch (error) {
      console.error('[SW] Auth request failed:', error);
      return new Response(JSON.stringify({ error: 'Network unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response for cacheable endpoints
    if (networkResponse.ok && shouldCacheApiResponse(url.pathname)) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', request.url);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for specific endpoints
    return getOfflineApiResponse(url.pathname);
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network and cache the response
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Both cache and network failed for:', request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const cachedIndex = await caches.match('/');
      if (cachedIndex) {
        return cachedIndex;
      }
    }
    
    // Return a generic offline response
    return new Response('Offline - Please check your connection', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Check if API response should be cached
function shouldCacheApiResponse(pathname) {
  return API_CACHE_URLS.some(url => pathname.startsWith(url));
}

// Provide offline responses for specific API endpoints
function getOfflineApiResponse(pathname) {
  if (pathname.includes('/quotes/daily')) {
    return new Response(JSON.stringify({
      id: 0,
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      characterId: 0
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (pathname.includes('/journal')) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (pathname.includes('/reminders')) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'journal-sync') {
    event.waitUntil(syncJournalEntries());
  }
});

// Sync journal entries when back online
async function syncJournalEntries() {
  try {
    // Implementation would sync any pending journal entries
    console.log('[SW] Syncing journal entries...');
    // This would be implemented based on your specific sync needs
  } catch (error) {
    console.error('[SW] Error syncing journal entries:', error);
  }
}

// Handle push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Wisdom Compass', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});