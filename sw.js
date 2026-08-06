// Korward Elite PWA — service worker (network-first, no-cache per il documento principale)
// 5.69.0: il DOCUMENTO principale viene sempre scaricato con cache:'reload' → bypassa la cache HTTP del
//   browser/CDN, così dopo un deploy si vede SUBITO l'ultima versione online (la cache resta solo per l'OFFLINE).
const CACHE = 'korward-v4'; // [rebrand] era 'elevora-v3' — l'activate elimina le cache non correnti, quindi il rename migra da solo

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
        // [7.46.2 BL-01] cache-on-first-fetch per TUTTI gli asset GET (CDN React/Three/Babel + GLB + icone):
        //   prima si conservava SOLO il documento → CDN irraggiungibile = boot morto (single point of failure E1).
        //   Le risposte CROSS-ORIGIN dei CDN sono OPACHE (type 'opaque', ok=false): si cachano comunque (lecito)
        //   e vengono riservite identiche. Semantica network-first INVARIATA: la cache si usa solo nel .catch.
        if (req.method === 'GET' && (r.ok || r.type === 'opaque')) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return r;
      })
      .catch(() => caches.match(req))
  );
});
