// Elevora PWA — minimal service worker (network-first)
const CACHE = 'elevora-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e =>
  e.waitUntil(self.clients.claim())
);

self.addEventListener('fetch', e => {
  // Network-first: try network, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(r => {
        // Cache a copy of successful GET responses for the main HTML
        if (e.request.method === 'GET' && r.ok) {
          const url = e.request.url;
          if (url.includes('CARRIER-MANAGER-AV.html') || url.endsWith('/')) {
            const clone = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
