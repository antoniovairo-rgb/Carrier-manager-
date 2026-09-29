#!/usr/bin/env node
/* [7.999.65 guardiano — taccuino PO #107/#118 «012 verticalizzazione all'indietro» · «014 palla flipper»] Sul passaggio la costruzione
   conteneva GIA' la giocata dell'eroe (filtrante fino all'area, controllo del compagno) e poi la conclusione ripartiva, lo stesso
   filtrante, dal pallone a 22u dall'eroe; sull'intercetto il pallone tornava indietro.
   VERDE → su gi107 «Filtrante tra i centrali» (esito fallito, GLB-ON) quando parte il passaggio il pallone e' ai piedi dell'eroe (< 4u);
   ROSSO → con __CPM_NO_PASS65 il passaggio parte lontano dall'eroe (> 12u).
   Uso: node passaggio-65.mjs   ·   CPM_ROSSO=1 per il solo braccio rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TIRO34_REC = 1; window.__CPM_GLB = true; if (r) window.__CPM_NO_PASS65 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Passaggio65' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_TIRO34 = null; window.__CPM_FORCE_SIT(107, true); window.__CPM_FROZEN = false; });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); });
  await sleep(9000);
  const W = await page.evaluate(() => window.__CPM_TIRO34 || null); await page.close();
  const F = ((W && W.f) || []).filter(f => f.pb && f.arc && f.aT != null && +f.aT >= 0);
  if (!F.length) return { n: 0 };
  const f = F[0]; return { n: F.length, d: +Math.hypot(f.pb[0] - f.hx, f.pb[2] - f.hz).toFixed(1) };
}
let ok = true;
if (!process.env.CPM_ROSSO) {
  const v = await braccio(false); console.log(`VERDE: distanza pallone-eroe alla partenza del passaggio ${v.d}u`);
  if (!v.n || !(v.d < 4)) { ok = false; console.log('✗ verde fallito'); }
}
const r = await braccio(true); console.log(`ROSSO (__CPM_NO_PASS65): distanza ${r.d}u`);
if (!r.n || !(r.d > 12)) { ok = false; console.log('✗ il rosso non mostra il difetto: il guardiano sarebbe cieco'); }
await b.close(); srv.close();
console.log(ok ? '✅ passaggio-65 verde (e il rosso si vede)' : '❌ passaggio-65 ROSSO'); process.exit(ok ? 0 : 1);
