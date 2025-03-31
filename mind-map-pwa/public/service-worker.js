// public/service-worker.js
const CACHE_NAME = 'mind-map-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/vite.svg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests (to S3)
  if (event.request.url.includes('/api/') || 
      event.request.url.includes(self.location.origin + '/s3/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response if it's valid
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For static assets, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              // Cache the response if it's valid
              if (response.ok) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            });
        })
    );
  }
});

// Background sync for mind map data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mindmap') {
    console.log('Background sync triggered for mind map data');
    event.waitUntil(
      // This would normally call your sync function
      // For now, we'll just post a message to the client
      self.clients.matchAll()
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_REQUESTED'
            });
          });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'SYNC_COMPLETE') {
    console.log('Sync completed successfully');
    
    // Notify all clients
    self.clients.matchAll()
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_STATUS',
            status: 'success',
            timestamp: new Date().toISOString()
          });
        });
      });
  }
});
