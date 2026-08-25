#!/usr/bin/env node
/* SONDA — QUANTI GESTI MONTA L'EROE IN UNA SCENA SOLA (collaudo PO codice 000 «gesto scoordinato»).
   Un'azione ha UN gesto. La guardia del 7.396 ne concede uno per istanza d'azione, ma la sua chiave
   include il TIPO d'azione: quando l'esito si risolve il tipo cambia, la chiave cambia con lui e la porta
   si riapre — e il secondo gesto dentro la stessa scena e' la «doppia alzata» che il PO segnala.
   IL CONTEGGIO LO FA IL GIOCO (`__CPM_G000`), non questa sonda: GLB-ON headless gira a ~0,3 fotogrammi al
   secondo e una sonda che campiona da fuori vede due fotogrammi per scena — concluderebbe sempre «un gesto
   solo». E' la stessa lezione del contatore delle esultanze (7.372).

   ⚠️ STATO: QUESTA SONDA NON MISURA ANCORA NIENTE, e lo dice invece di stampare un numero falso.
   Due passate — a viewport piena con 1,2s di assestamento, e a viewport piccola con 6s e GLB acceso —
   hanno dato ZERO scene osservate. Il contatore vive nello stesso blocco che gia' conta le esultanze
   (`__CPM_CELGST`) e con lo stesso cancello, quindi non e' il codice del contatore: e' che in questo
   laboratorio l'eroe non monta gesti nelle scene forzate, e la ragione non l'ho ancora trovata.
   Finche' resta cosi', il codice 000 del PO NON e' misurabile qui e nessun rimedio va spedito su di esso:
   sarebbe un rimedio senza prima misura, cioe' esattamente il metodo che questo progetto rifiuta.
   La sonda esce con 1 apposta — un guardiano che tace quando e' cieco e' peggio di uno rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
/* viewport piccola e tempi lunghi: GLB-ON headless e' limitato dal rasterizzatore software (~0,3 fps),
   e con la finestra intera nove secondi di orologio comprano meno di mezzo secondo di tempo-scena.
   ⚠️ NIENTE `__CPM_GLB=false`: senza avatar animati non si monta nessun gesto, e la prima stesura di
   questa sonda misurava infatti ZERO scene — cioe' il nulla. */
const page = await b.newPage({ viewport: { width: 380, height: 300 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_G000 = {}; window.__CPM_PRESENT = 1; window.__CPM_REC = true; });
const { total } = await openMatch(page, port);
const N = Math.min(+(process.env.CPM_SCENE || 10), total || 10);
for (let gi = 0; gi < N; gi++) { await forceSituation(page, gi, { settle: 6000 }); }
const G = await page.evaluate(() => window.__CPM_G000 || {});
await b.close(); srv.close();

const righe = Object.entries(G).map(([k, v]) => ({ scena: k, n: v.n | 0, gesti: v.gesti || [], tipi: v.tipi || [] }));
console.log('\n=== QUANTI GESTI MONTA L\'EROE IN UNA SCENA SOLA ===\n');
console.log('  scene osservate: ' + righe.length + ' su ' + N + ' forzate' + (errors.length ? '  ·  pageerror: ' + errors[0] : ''));
if (!righe.length) { console.log('\n  ⚠ nessuna scena ha montato un gesto: la sonda non sta misurando niente.\n'); process.exit(1); }
const uno = righe.filter(r => r.n <= 1), piu = righe.filter(r => r.n > 1);
console.log('  con UN gesto solo   ' + String(uno.length).padStart(3) + '   ← come dev\'essere');
console.log('  con PIU\' di uno     ' + String(piu.length).padStart(3) + '   ← il codice 000 del PO');
if (piu.length) {
  console.log('\n  le scene con piu\' gesti (e in che ordine sono stati montati):');
  piu.sort((a, c) => c.n - a.n).slice(0, 12).forEach(r =>
    console.log('    ' + r.scena.padEnd(22) + ' ' + r.n + ' gesti: ' + r.gesti.join(' → ') + '   ·   tipi d\'azione attraversati: ' + r.tipi.join(' → ')));
}
const tot = righe.reduce((a, r) => a + r.n, 0);
console.log('\n  gesti totali ' + tot + ' su ' + righe.length + ' scene = ' + (tot / righe.length).toFixed(2) + ' per scena (il valore giusto e\' 1,00)');
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
