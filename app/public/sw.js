// CoAssure Service Worker
// Provides offline support for non-AI features:
//   - Cache-first for app shell (HTML, CSS, JS, images)
//   - Network-first for weather API responses
//   - Offline fallback for navigation requests
//   - Background sync queue for form submissions and reports
//   - Explicitly skips AI/Anthropic API calls

const CACHE_VERSION = 'coassure-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// App shell resources to precache on install
const APP_SHELL = [
  '/',
  '/profile',
  '/profile/setup',
  '/history',
  '/report',
  '/settings',
  '/dashboard',
];

// Patterns that should NEVER be cached (AI endpoints, auth, billing)
const NEVER_CACHE_PATTERNS = [
  /api\.anthropic\.com/,
  /\/api\/chat/,
  /\/api\/ai/,
  /\/api\/conversation/,
  /anthropic/i,
  /claude/i,
  /\/api\/auth/,
  /\/api\/billing/,
  /\/api\/stripe/,
  /supabase\.co/,
  /stripe\.com/,
];

// Patterns for API responses that CAN be cached (network-first)
const CACHEABLE_API_PATTERNS = [
  /api\.open-meteo\.com/,       // Weather API
  /\/api\/weather/,
];

// ----- Install -----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Precache app shell; don't fail install if some routes 404
      return Promise.allSettled(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to precache ${url}:`, err.message);
          })
        )
      );
    }).then(() => {
      // Activate immediately without waiting for old SW to release
      return self.skipWaiting();
    })
  );
});

// ----- Activate -----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('coassure-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => {
      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});

// ----- Fetch -----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, etc.) — those go through queueing
  if (request.method !== 'GET') {
    return;
  }

  // Skip requests that should never be cached (AI, auth, billing)
  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    return;
  }

  // Network-first for cacheable API calls (weather)
  if (CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Network-first for navigation (HTML pages) with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Default: network-first with dynamic cache
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// ----- Background Sync -----
self.addEventListener('sync', (event) => {
  if (event.tag === 'coassure-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

// ----- Message handling -----
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Allow the client to trigger a manual sync attempt
  if (event.data && event.data.type === 'PROCESS_QUEUE') {
    event.waitUntil(processOfflineQueue());
  }
});

// ===================== Strategies =====================

function isStaticAsset(url) {
  const staticExtensions = /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico|json)(\?.*)?$/;
  // Next.js static chunks
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (url.pathname.startsWith('/_next/image')) return true;
  if (staticExtensions.test(url.pathname)) return true;
  return false;
}

async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // For static assets, return a basic fallback if nothing cached
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(
      JSON.stringify({ error: 'offline', message: 'No cached data available' }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-CoAssure-Offline': 'true',
        },
      }
    );
  }
}

async function navigationStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Try to serve a cached version of the requested page
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Fall back to cached root page (SPA-style navigation will handle routing)
    const rootCached = await caches.match('/');
    if (rootCached) {
      return rootCached;
    }

    // Last resort: return a minimal offline page
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CoAssure — Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; color: #1e293b; padding: 2rem; }
    .container { text-align: center; max-width: 420px; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }
    button { background: #0284c7; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; }
    button:hover { background: #0369a1; }
    .dot { display: inline-block; width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="dot"></div>
    <h1>You're offline</h1>
    <p>CoAssure needs an internet connection for some features. Your data is saved locally and will sync when you reconnect.</p>
    <button onclick="window.location.reload()">Try again</button>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'X-CoAssure-Offline': 'true',
        },
      }
    );
  }
}

// ===================== Offline Queue Processing =====================

async function processOfflineQueue() {
  // Open IndexedDB to read queued actions
  const db = await openDB();
  const tx = db.transaction('offline_queue', 'readwrite');
  const store = tx.objectStore('offline_queue');

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = async () => {
      const actions = request.result || [];
      const failedActions = [];

      for (const action of actions) {
        try {
          const response = await fetch(action.url, {
            method: action.method || 'POST',
            headers: action.headers || { 'Content-Type': 'application/json' },
            body: action.body ? JSON.stringify(action.body) : undefined,
          });

          if (!response.ok) {
            // If server error (5xx), keep in queue for retry
            if (response.status >= 500) {
              failedActions.push(action);
            }
            // Client errors (4xx) are dropped — they won't succeed on retry
          }
        } catch (error) {
          // Network still down, keep all remaining actions
          failedActions.push(action);
        }
      }

      // Clear the store and re-add any failed actions
      const clearTx = db.transaction('offline_queue', 'readwrite');
      const clearStore = clearTx.objectStore('offline_queue');
      clearStore.clear();

      for (const action of failedActions) {
        clearStore.add(action);
      }

      // Notify all clients about sync result
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          processed: actions.length - failedActions.length,
          remaining: failedActions.length,
        });
      });

      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('coassure_offline', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline_queue')) {
        db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
