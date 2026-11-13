// Korward Elite PWA — service worker (network-first, no-cache per il documento principale)
// 5.69.0: il DOCUMENTO principale viene sempre scaricato con cache:'reload' → bypassa la cache HTTP del
//   browser/CDN, così dopo un deploy si vede SUBITO l'ultima versione online (la cache resta solo per l'OFFLINE).
//
// [giro 120 · PO-322 TWA] CACHE LEGATA A GAME_VERSION + APERTURA SENZA RETE.
//   Misurato (tests/visual/sw-cache-120.mjs sulla build del sito): dopo UN avvio online la seconda apertura senza rete
//   NON partiva («This site can't be reached»): il documento del primo avvio arriva PRIMA che il service worker
//   controlli la pagina, quindi non finiva in nessuna cache; e anche dopo due visite mancavano 31 file (icone, capelli…).
//   Ora, quando la pagina lo registra come `sw.js?v=<GAME_VERSION>` (src/00-head.html):
//     - la cache si chiama `korward-<versione>`: una versione nuova la ricrea e l'attivazione cancella le vecchie;
//     - all'installazione precarica il guscio (manifest, icone) — senza mai far fallire l'installazione;
//     - la pagina gli manda l'elenco dei file stessa-origine che ha GIA' caricato (GLB, texture, audio) e lui li mette
//       in cache: cio' che e' arrivato prima che controllasse la pagina non va piu' perso;
//     - senza rete, una navigazione trova la pagina anche con un ?parametro diverso (ignoreSearch) e ripiega sulla radice.
//   La strategia resta NETWORK-FIRST per tutto: con la rete si vede sempre l'ultima versione pubblicata.
//   Registrato senza `?v=` (rosso della pagina __CPM_NO_G120S, o una pagina vecchia) si comporta ESATTAMENTE come prima.
const VERSIONE = new URL(self.location.href).searchParams.get('v');
const CACHE = VERSIONE ? 'korward-' + VERSIONE : 'korward-v4'; // [rebrand] era 'elevora-v3' — l'activate elimina le cache non correnti, quindi il rename migra da solo
// la pagina NON e' nel guscio: arriva gia' con l'elenco della pagina (location.href), e precaricarla qui la riscaricava (6,4 MB in piu' misurati)
const GUSCIO = ['./manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
// [giro 149 PO-351] i file audio CC0 (Ogg/Opus, 1,5 MB) entrano nel guscio: l'audio si scarica al PRIMO GESTO, che puo' arrivare
//   prima che il service worker controlli la pagina → senza precarica la seconda apertura senza rete restava alla sintesi.
//   Elenco generato da assets/audio/LICENZE.json (tools/audio-149/prepara-audio.py); il guardiano audio-149 lo confronta col registro.
//   [giro 161] +3 file: l'«ohh» dello stadio e i due brani delle cerimonie (sempre dal registro).
//   L'MP3 di riserva NON si precarica (serve solo ai browser senza Opus): lo mette in cache la strategia network-first al primo uso.
const AUDIO149 = ['./assets/audio/sfx/ball/calcio-1.ogg','./assets/audio/sfx/ball/calcio-2.ogg','./assets/audio/sfx/ball/calcio-3.ogg','./assets/audio/sfx/ball/calcio-4.ogg','./assets/audio/sfx/ball/passaggio-1.ogg','./assets/audio/sfx/ball/passaggio-2.ogg','./assets/audio/sfx/ball/passaggio-3.ogg','./assets/audio/sfx/ball/testa-1.ogg','./assets/audio/sfx/ball/testa-2.ogg','./assets/audio/sfx/ball/palo-1.ogg','./assets/audio/sfx/ball/palo-2.ogg','./assets/audio/sfx/ball/rete-1.ogg','./assets/audio/sfx/ball/contrasto-1.ogg','./assets/audio/sfx/ball/contrasto-2.ogg','./assets/audio/sfx/ball/parata-1.ogg','./assets/audio/sfx/ball/parata-2.ogg','./assets/audio/sfx/referee/fischio-1.ogg','./assets/audio/sfx/referee/fischio-2.ogg','./assets/audio/sfx/referee/fischio-doppio.ogg','./assets/audio/sfx/referee/fischio-finale.ogg','./assets/audio/sfx/crowd/boato-1.ogg','./assets/audio/sfx/crowd/boato-2.ogg','./assets/audio/sfx/crowd/applausi-1.ogg','./assets/audio/sfx/crowd/applausi-2.ogg','./assets/audio/sfx/crowd/esulta-1.ogg','./assets/audio/sfx/crowd/fischi-1.ogg','./assets/audio/sfx/crowd/ohh-1.ogg','./assets/audio/sfx/ui/click-1.ogg','./assets/audio/sfx/ui/click-2.ogg','./assets/audio/sfx/ui/click-3.ogg','./assets/audio/sfx/ui/nav-1.ogg','./assets/audio/sfx/ui/indietro-1.ogg','./assets/audio/sfx/ui/conferma-1.ogg','./assets/audio/sfx/ui/errore-1.ogg','./assets/audio/sfx/ui/popup-1.ogg','./assets/audio/sfx/ui/chiudi-1.ogg','./assets/audio/sfx/notifications/positiva-1.ogg','./assets/audio/sfx/notifications/negativa-1.ogg','./assets/audio/sfx/notifications/info-1.ogg','./assets/audio/sfx/ui/settimana-1.ogg','./assets/audio/sfx/career/busta-1.ogg','./assets/audio/sfx/career/contratto-1.ogg','./assets/audio/sfx/career/rinnovo-1.ogg','./assets/audio/sfx/career/record-1.ogg','./assets/audio/sfx/career/convocazione-1.ogg','./assets/audio/sfx/career/traguardo-1.ogg','./assets/audio/sfx/career/livello-1.ogg','./assets/audio/sfx/career/retrocessione-1.ogg','./assets/audio/sfx/career/rivelazione-1.ogg','./assets/audio/music/awards/fanfara-1.ogg','./assets/audio/music/menu/spiaggia-loop.ogg','./assets/audio/music/career/avventura-loop.ogg','./assets/audio/music/awards/trionfo.ogg','./assets/audio/music/ceremony/il-mondo-e-nostro.ogg','./assets/audio/sfx/crowd/letto-1.ogg','./assets/audio/sfx/crowd/letto-2.ogg','./assets/audio/sfx/crowd/caldo-1.ogg','./assets/audio/sfx/crowd/caldo-2.ogg','./assets/audio/sfx/crowd/esulta-2.ogg','./assets/audio/sfx/crowd/fischi-2.ogg','./assets/audio/sfx/crowd/ohh-2.ogg','./assets/audio/sfx/ui/conferma-morbida.ogg','./assets/audio/sfx/ui/apri-morbida.ogg','./assets/audio/sfx/notifications/positiva-morbida.ogg','./assets/audio/sfx/notifications/negativa-morbida.ogg','./assets/audio/sfx/notifications/info-morbida.ogg','./assets/audio/sfx/ui/settimana-morbida.ogg'];

self.addEventListener('install', e => {
  if (!VERSIONE) { self.skipWaiting(); return; }
  e.waitUntil(
    caches.open(CACHE)
      // uno per uno e senza propagare gli errori: un file mancante non deve impedire l'installazione
      .then(c => Promise.all(GUSCIO.concat(AUDIO149).map(u => fetch(new Request(u, { cache: 'reload' })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {}))))
      .then(() => self.skipWaiting(), () => self.skipWaiting())
  );
});

self.addEventListener('activate', e =>
  e.waitUntil(
    // cache-busting: rimuove ogni cache non corrente, poi prende il controllo di tutte le tab aperte
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);

// [giro 120] «metti in cache cio' che ho gia' caricato»: solo stessa origine, solo cio' che non c'e' gia', mai errori fuori.
self.addEventListener('message', e => {
  const d = e.data;
  if (!VERSIONE || !d || d.tipo !== 'cpm-cache' || !Array.isArray(d.urls)) return;
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(d.urls.slice(0, 400).map(u => {
    try { if (new URL(u).origin !== self.location.origin) return null; } catch (_e) { return null; }
    return c.match(u).then(h => h || fetch(u).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {}));
  }))).catch(() => {}));
});

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
      .catch(() => {
        if (!VERSIONE || req.mode !== 'navigate') return caches.match(req);
        // [giro 120] senza rete una navigazione trova la pagina anche con un ?parametro diverso, poi la radice
        return caches.match(req).then(h => h || caches.match(req, { ignoreSearch: true })).then(h => h || caches.match('./'));
      })
  );
});
