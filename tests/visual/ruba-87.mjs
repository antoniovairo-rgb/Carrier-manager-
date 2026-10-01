/* [7.999.87 PO-146] Guardiano: passaggio intercettato (#185 «Scarico e ricevi» fallito, + controllo #24): un secondo dopo
   la rivelazione dell'esito il pallone e' ai piedi dell'intercettore (<= 1,2u). Rosso __CPM_NO_RUBA87 (CPM_ROSSO87=1). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO87;
const CASI = (process.env.CPM_GI || '185,185,185').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = [];
for (let n = 0; n < CASI.length; n++) {
  const gi = CASI[n];
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript((R) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_REC = 1; if (R) window.__CPM_NO_RUBA87 = 1; }, ROSSO);
  await openMatch(p, port, { skipLoadAll: true, name: 'Ruba' + n }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => {});
  for (let i = 0; i < 40; i++) { if ((await p.evaluate(() => window.__CPM_PHASE())) === 'hl_choose') break; await sleep(150); }
  await p.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); }).catch(() => {});
  let tRiv = null, d1 = null;
  for (let i = 0; i < 60; i++) {
    const s = await p.evaluate(() => { const S = window.__CPM_STATE(); const im = window.__CPM_INTM80 && window.__CPM_INTM80(); return { esito: !!document.querySelector('[data-cpm="esito"]'), d: im && S.ball ? Math.hypot(S.ball.x - 50 - im[0], (S.ball.y - 50) * 0.68 - im[1]) : null }; });
    if (s.esito && tRiv == null) tRiv = Date.now();
    if (tRiv != null && Date.now() - tRiv >= 1000) { d1 = s.d; break; }
    await sleep(100);
  }
  ris.push(d1); console.log(`caso ${n} gi${gi}: distanza pallone-intercettore 1 s dopo l'esito ${d1 == null ? 'non misurata' : d1.toFixed(1)}`);
  await ctx.close();
}
await b.close(); srv.close();
const ok = ris.filter(d => d != null);
if (ok.length < 2) { console.log('CIECO'); process.exit(2); }
const lontani = ok.filter(d => d > 1.2).length;
if (ROSSO) { console.log(lontani ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(lontani ? 0 : 1); }
console.log(lontani ? 'KO' : 'VERDE'); process.exit(lontani ? 1 : 0);
