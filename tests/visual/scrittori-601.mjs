/* [7.601.0 STRUMENTO] CHI SCRIVE IL PALLONE, FOTOGRAMMA PER FOTOGRAMMA.
   E' la base di misura del lavoro sul possesso. Il quadro misurato alla nascita di questa sonda
   (2.375 campioni, autoplay seedato):
     35% portatore · 24% volo ad arco · 16% SCIVOLAMENTO SENZA PADRONE · 10% nessuno · 13% altro
     catena degli schemi: 0%
   Cioe': il pallone e' nei piedi di qualcuno il ~42% del tempo e per il ~40% viaggia in aria o su
   erba vuota — il «la palla viaggia da sola senza proprietario» del PO. La catena che sa fare i
   cambi di fronte non scrive MAI. Qualunque rimedio sul possesso deve muovere QUESTI numeri:
   portatore su, scivolamento giu', catena su. L'anello di bordo registra gia' tutto (campo ws).
   NON e' un guardiano: non fallisce, misura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_WSLOG = {}; 
  setInterval(() => { try {
    const s = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
    if (!s || !s.samples) return;
    const L = window.__CPM_WSLOG;
    for (const r of s.samples.slice(-8)) { const k = r.ws | 0; L[k] = (L[k] || 0) + 1; L._n = (L._n || 0) + 1; }
  } catch (_e) {} }, 400); });
await openMatch(page, port, { skipLoadAll: true, name: 'Ws' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await sleep(120000);
const L = await page.evaluate(() => window.__CPM_WSLOG || {});
await b.close(); srv.close();
const NOMI = { 0: 'NESSUNO (ball lerp ambientale/other)', 1: 'snap di scena', 4: 'portatore', 5: 'addosso', 6: 'palo', 7: 'respinta', 9: 'ricevente', 14: 'testa', 15: 'avvicinamento', 16: 'catena-557', 17: 'fermo' };
const tot = L._n || 0; delete L._n;
console.log(`campioni scrittore: ${tot}`);
for (const [k, n] of Object.entries(L).sort((a, c) => c[1] - a[1]))
  console.log(`  ${(n / tot * 100).toFixed(0).padStart(3)}%  [${k}] ${NOMI[k] || 'codice ' + k}`);
