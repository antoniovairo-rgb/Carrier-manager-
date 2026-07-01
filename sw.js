// Elevora PWA — service worker (network-first, no-cache per il documento principale)
// 5.69.0: il DOCUMENTO principale viene sempre scaricato con cache:'reload' → bypassa la cache HTTP del
//   browser/CDN, così dopo un deploy si vede SUBITO l'ultima versione online (la cache resta solo per l'OFFLINE).
const CACHE = 'elevora-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e =>
  e.waitUntil(
    // cache-busting: rimuove ogni cache non corrente, poi prende il controllo di tutte le tab aperte
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = req.url;
  // documento principale (navigazione o HTML) → forza il fetch fresco, mai dalla cache HTTP
  const isDoc = req.mode === 'navigate' || url.includes('CARRIER-MANAGER-AV.html') || url.endsWith('/');
  const fetchReq = isDoc ? new Request(url, { cache: 'reload' }) : req;
  e.respondWith(
    fetch(fetchReq)
      .then(r => {
        // conserva una copia SOLO del documento principale, per il fallback offline
        if (req.method === 'GET' && r.ok && isDoc) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return r;
      })
      .catch(() => caches.match(req))
  );
});
