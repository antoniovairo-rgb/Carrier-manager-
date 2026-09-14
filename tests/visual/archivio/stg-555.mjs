#!/usr/bin/env node
/* Quante volte la messa in scena degli highlight viene percorsa, per quale ramo, e quante volte i due
   rimedi nuovi (appoggio corto · copertura sul pallone) trovano davvero un uomo da spostare.
   Serve a distinguere «il rimedio non funziona» da «il rimedio non viene mai eseguito». */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; });
const { total } = await openMatch(page, port); await sleep(400);
await page.evaluate(() => { window.__CPM_STG555 = { n: 0, dif: 0, off: 0, app: 0, cop: 0, noMid: 0 }; });
const passo = Math.max(1, Math.floor(total / 50));
let scene = 0;
for (let gi = 0; gi < total; gi += passo) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue; scene++; await sleep(260);
}
const W = await page.evaluate(() => window.__CPM_STG555);
srv.close(); await b.close();
console.log(`\n=== LA MESSA IN SCENA, CONTATA — ${scene} scene forzate ===\n`);
console.log(`  fotogrammi in cui la messa in scena gira : ${W.n}`);
console.log(`   · ramo OFFENSIVO : ${W.off}  (${(100 * W.off / Math.max(1, W.n)).toFixed(0)}%)`);
console.log(`   · ramo DIFENSIVO : ${W.dif}  (${(100 * W.dif / Math.max(1, W.n)).toFixed(0)}%)`);
console.log(`\n  appoggio corto assegnato   : ${W.app}   (senza nessuno da spostare: ${W.noMid})`);
console.log(`  copertura sul pallone      : ${W.cop}`);
