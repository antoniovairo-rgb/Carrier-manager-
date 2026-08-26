/* [7.598.0 STRUMENTO] LE PASSATE DELLA CAMERA, DALL'ANELLO DI BORDO.
   COLLAUDO PO su SIT #3: «codice 007 — lo SGUARDO della camera oscilla: 26.1 inversioni/s, ampiezza
   6.3 gradi — vista-reale 51% + lerp 49% · 3.5 passate/fotogramma».
   Le inversioni non sono misurabili qui: il laboratorio gira a ~7 fps e 26 inversioni al secondo stanno
   ben oltre Nyquist. Ma le PASSATE si': il gioco le registra nel suo anello di bordo, un campione per
   fotogramma (conteggio*10 + codice dell'ultima passata). Quello e' il numero che nel 7.581 valeva 1,0 e
   che il PO ora vede a 3,5 — ed e' anche la spiegazione dell'oscillazione, perche' ogni passata riscrive
   lo sguardo.
   NON e' un guardiano: misura e nomina. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = Number(process.env.CPM_GI || 3);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true, name: 'Cm' });
await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [GI, true]);
await sleep(800);
await page.evaluate(() => { window.__CPM_FROZEN = false; });
await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
await sleep(2500);
const snap = await page.evaluate(() => (window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP()) || null);
await b.close(); srv.close();

const NOMI = { 0: '(nessuna)', 1: 'porta', 2: 'guinzaglio', 3: 'gk', 4: 'bordo-tanh', 5: 'bordo-lift', 6: 'bisezione', 7: 'snap', 8: 'sguardo-pre', 9: 'vista-reale' };
console.log(`\n=== LE PASSATE DELLA CAMERA SU SIT #${GI} ===\n`);
if (!snap || !(Array.isArray(snap) ? snap.length : (snap.samples || []).length)) { console.log('  ⚠ anello vuoto: NON GIUDICABILE.\n'); process.exit(1); }
/* il campo 15 dell'anello: conteggio*10 + codice dell'ultima passata del fotogramma precedente */
/* [7.598.0] l'anello torna come {samples:[{...,wl}]}: `wl` e' il campo delle passate (conteggio*10 +
   codice dell'ultima). La prima stesura leggeva un array di array e trovava sempre vuoto — misurava la
   propria idea della struttura, non la struttura. */
const S = Array.isArray(snap) ? snap : (snap.samples || []);
const vals = S.map(r => (r && r.wl) || 0).filter(v => v > 0);
if (!vals.length) { console.log(`  ⚠ nessuna passata registrata in ${S.length} campioni: NON GIUDICABILE (l'anello non porta il campo).\n`); process.exit(1); }
const passate = vals.map(v => Math.floor(v / 10));
const ultime = vals.map(v => v % 10);
const media = passate.reduce((a, v) => a + v, 0) / passate.length;
console.log(`  fotogrammi con almeno una passata: ${vals.length} su ${S.length}`);
console.log(`  PASSATE PER FOTOGRAMMA · media ${media.toFixed(1)} · max ${Math.max(...passate)}   (nel 7.581, sulla scena del collaudo, valeva 1,0)`);
const per = {}; for (const u of ultime) per[u] = (per[u] || 0) + 1;
console.log('\n  chi SCRIVE PER ULTIMO lo sguardo (e quindi decide il fotogramma):');
for (const [k, n] of Object.entries(per).sort((a, c) => c[1] - a[1]))
  console.log(`    ${(n / ultime.length * 100).toFixed(0).padStart(3)}%  ${NOMI[k] || ('codice ' + k)}`);
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
