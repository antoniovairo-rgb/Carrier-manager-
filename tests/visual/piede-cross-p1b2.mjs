#!/usr/bin/env node
/* [7.999.143 PO-068 P1-b seconda parte] GUARDIANO GLB-ON: sul CROSS dell'eroe il pallone deve arrivare al piede che crossa.
   Scene forzate gi16 e gi42 (opzione cross), esito riuscito; testimone __CPM_P1B2 (distanza pallone-piede per fotogramma del gesto).
   Misurato: rosso 4,69 e 3,76 u dal piede piu' vicino, verde 0,35 e 0,29. VERDE: distanza minima <= 0,8 su entrambe.
   ROSSO (__CPM_NO_P1B2): >= 2,5 su entrambe. Uso: node piede-cross-p1b2.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; if (r) window.__CPM_NO_P1B2 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Piede P1b2' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  const out = [];
  for (const gi of [16, 42]) {
    const k = await page.evaluate(gi => { const s = SITUATIONS[gi]; return (s.actions || s.a || []).findIndex(a => { try { return (deriveHL(s, a) || {}).type === 'cross'; } catch (e) { return false; } }); }, gi);
    await page.evaluate(gi => { window.__CPM_P1B2 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, Math.max(0, k));
    for (let w = 0; w < 30; w++) { await sleep(700); const f = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (!/^hl_/.test(f || '')) break; }
    const R = await page.evaluate(() => (window.__CPM_P1B2 || []).filter(r => r[0] === 'cross' || r[0] === 'pass'));
    out.push({ gi, k, fotogrammi: R.length, min: R.length ? Math.min(...R.map(r => Math.min(r[3], r[4]))) : null });
  }
  esito[rosso ? 'rosso' : 'verde'] = out; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(out)); await page.close();
}
await b.close(); srv.close();
const g = [];
if (!esito.verde.every(x => x.fotogrammi >= 5 && x.min != null && x.min <= 0.8)) g.push('verde: pallone lontano dal piede al cross ' + JSON.stringify(esito.verde));
if (!esito.rosso.every(x => x.fotogrammi >= 5 && x.min != null && x.min >= 2.5)) g.push('rosso: pallone vicino al piede anche spento ' + JSON.stringify(esito.rosso));
if (g.length) { console.log('❌ piede-cross-p1b2'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ piede-cross-p1b2 verde (e il rosso si vede)');
