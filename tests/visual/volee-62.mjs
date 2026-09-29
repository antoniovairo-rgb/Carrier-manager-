#!/usr/bin/env node
/* [7.999.62 guardiano — taccuino PO #9 «volée: il gesto non e' sincronizzato con la velocita' del cross» (000)] Durante il caricamento
   l'aggancio del tiro al piede portava il pallone del cross a terra (quota 0,2): l'eroe calciava al volo un pallone fermo sul prato.
   VERDE → sulla «Volée potente» (gi9, GLB-ON) la quota minima del pallone nell'ultimo tratto del caricamento resta >= 0,4;
   ROSSO → con __CPM_NO_VOLEE62 il pallone torna a terra (< 0,35): il guardiano deve accorgersene.
   Uso: node volee-62.mjs   ·   CPM_ROSSO=1 per il solo braccio rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TIRO34_REC = 1; window.__CPM_GLB = true; if (r) window.__CPM_NO_VOLEE62 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Volee62' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_TIRO34 = null; window.__CPM_FORCE_SIT(9, true); window.__CPM_FROZEN = false; });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  await sleep(6000);
  const W = await page.evaluate(() => window.__CPM_TIRO34 || null); await page.close();
  const F = ((W && W.f) || []).filter(f => f.aT != null && +f.aT >= -0.2 && +f.aT <= 0 && f.pb);
  return F.length ? { n: F.length, yMin: +Math.min(...F.map(f => f.pb[1])).toFixed(2) } : { n: 0 };
}
let ok = true;
if (!process.env.CPM_ROSSO) {
  const v = await braccio(false); console.log(`VERDE: ${v.n} fotogrammi di caricamento · quota minima del pallone ${v.yMin}`);
  if (!v.n || !(v.yMin >= 0.4)) { ok = false; console.log('✗ verde fallito'); }
}
const r = await braccio(true); console.log(`ROSSO (__CPM_NO_VOLEE62): ${r.n} fotogrammi · quota minima ${r.yMin}`);
if (!r.n || !(r.yMin < 0.35)) { ok = false; console.log('✗ il rosso non mostra il difetto: il guardiano sarebbe cieco'); }
await b.close(); srv.close();
console.log(ok ? '✅ volee-62 verde (e il rosso si vede)' : '❌ volee-62 ROSSO'); process.exit(ok ? 0 : 1);
