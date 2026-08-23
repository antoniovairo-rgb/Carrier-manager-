#!/usr/bin/env node
/* MISSIONE, blocco 2 — CHI MUOVE IL PALLONE, SEPARATO PER FASE.
   Il censimento `__CPM_OWN497` esisteva dal 7.497 ma dava UN numero solo per tutta la partita: cronaca e
   highlight hanno scrittori diversi e problemi diversi, e sommarli nascondeva entrambi. Dal 7.555 il
   censimento e' bucketizzato per fase. Qui si legge.
   `anon` = fotogrammi in cui il pallone SI MUOVE e nessuno scrittore si e' dichiarato. E' il numero da cui
   parte l'arbitro del possesso: finche' e' alto, «chi ha mosso la palla» non e' una domanda a cui il codice
   sappia rispondere.
     CPM_CHROME=... node scrittori-555.mjs [CPM_MS=120000]                                                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MS = +(process.env.CPM_MS || 120000);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_OWN497 = { f: 0, dich: 0, multi: 0, mosso: 0, anon: 0, coppie: {} }; });
await openMatch(page, port, { skipLoadAll: true, name: 'Scr' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 9400, policy: 'seeded', tickMs: 300 }));
await sleep(MS);
const W = await page.evaluate(() => window.__CPM_OWN497);
srv.close(); await b.close();
const pc = (a, b2) => b2 ? (100 * a / b2).toFixed(1) + '%' : '—';
console.log(`\n=== CHI MUOVE IL PALLONE — ${W.f} fotogrammi visti ===\n`);
console.log(`  il pallone si muove          ${W.mosso}  (${pc(W.mosso, W.f)} dei fotogrammi)`);
console.log(`  ...e NESSUNO si e' dichiarato ${W.anon}  (${pc(W.anon, W.mosso)} dei movimenti)   <- il numero della fase 1`);
console.log(`  piu' di uno scrittore insieme ${W.multi}  (${pc(W.multi, W.f)})`);
console.log(`\n  --- per fase ---`);
for (const [f, v] of Object.entries(W.perFase || {})) {
  console.log(`  ${f.padEnd(12)} fotogrammi ${String(v.f).padStart(6)} · si muove ${String(v.mosso).padStart(6)} · anonimi ${String(v.anon).padStart(6)} (${pc(v.anon, v.mosso)}) · piu' scrittori ${v.multi}`);
}
const cop = Object.entries(W.coppie || {}).sort((a, c) => c[1] - a[1]).slice(0, 5);
if (cop.length) { console.log(`\n  chi si contende il fotogramma:`); for (const [k, n] of cop) console.log(`    ${k}  x${n}`); }
console.log('\nCENSIMENTO. Non e\' un guardiano: non fallisce, misura.');
