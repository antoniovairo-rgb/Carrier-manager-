#!/usr/bin/env node
/* [7.999.76 guardiano — taccuino PO SIT #171 «Stacco in corsa potente» (000): «la palla e' bassa e non e' sincronizzata con lo
   stacco aereo»] Il pallone passava accanto alla testa durante il caricamento del colpo, che partiva solo dopo, a quota 0,75.
   VERDE → sulla scena 171 (esito forzato riuscito, GLB-ON) il colpo di testa parte con il pallone ≥ 1,3; i controlli (scene 7 e
   64, colpi di testa) restano ≥ 1,3. ROSSO (__CPM_NO_TESTA76) → sulla 171 < 1,0. Testimone __CPM_Y063. Uso: node testa-76.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function quota(gi, rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_TESTA33_REC = 1; if (r) window.__CPM_NO_TESTA76 = 1; }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'T76' + gi }); await sleep(1200);
  await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(g => { window.__CPM_Y063 = []; window.__CPM_FORCE_SIT(g, true); window.__CPM_FROZEN = false; }, gi);
  await p.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await p.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); }); await p.waitForFunction(() => (window.__CPM_Y063 || []).length > 0, null, { timeout: 15000 }).catch(() => {}); await sleep(300);
  const y = await p.evaluate(() => (window.__CPM_Y063 || []).slice(-1)[0]); await p.close(); return y == null ? null : +y;
}
let ok = true;
const v171 = await quota(171, false), r171 = await quota(171, true);
console.log(`scena 171 · verde quota all'impatto ${v171} · rosso ${r171}`);
if (v171 == null || v171 < 1.3 || r171 == null || r171 >= 1.0) ok = false;
for (const gi of [7, 64]) { const v = await quota(gi, false); console.log(`controllo scena ${gi} · quota ${v}`); if (v == null || v < 1.3) ok = false; }
await b.close(); srv.close();
console.log(ok ? '✅ testa-76 verde (e il rosso si vede)' : '❌ testa-76 ROSSO'); process.exit(ok ? 0 : 1);
