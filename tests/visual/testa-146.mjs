#!/usr/bin/env node
/* [7.999.143 decisione PO 06/10: il colpo di testa in L1] GUARDIANO GLB-ON su scene forzate gi36 e gi44 (colpo di testa riuscito):
   distanza testa-pallone quando parte l'arco del colpo (testimone __CPM_P1B2, colonna testa). Misurato: rosso 3,22 e 3,18 u (l'arco
   partiva dal punto di consegna del cross), verde 0,49 e 0,78. VERDE: <= 1,0 su entrambe. ROSSO (__CPM_NO_TESTA146): >= 2,5. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; if (r) window.__CPM_NO_TESTA146 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Testa 145' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  const out = [];
  for (const gi of [36, 44]) {
    await page.evaluate(gi => { window.__CPM_P1B2 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    const k = await page.evaluate(gi => { const s = SITUATIONS[gi]; return (s.actions || s.a || []).findIndex(a => { try { return (deriveHL(s, a) || {}).type === 'header'; } catch (e) { return false; } }); }, gi);
    await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, Math.max(0, k));
    for (let w = 0; w < 30; w++) { await sleep(700); const f = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (!/^hl_/.test(f || '')) break; }
    const L = await page.evaluate(() => (window.__CPM_P1B2 || []).filter(r => r[0] === 'header' && r[6] > 0 && r[6] <= 0.06 && r[8] >= 0).map(r => r[8]));
    out.push({ gi, k, lancio: L.length ? L[0] : null });
  }
  esito[rosso ? 'rosso' : 'verde'] = out; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(out)); await page.close();
}
await b.close(); srv.close();
const g = [];
if (!esito.verde.every(x => x.lancio != null && x.lancio <= 1.0)) g.push('verde: testa lontana dal pallone al colpo ' + JSON.stringify(esito.verde));
if (!esito.rosso.every(x => x.lancio != null && x.lancio >= 2.5)) g.push('rosso: testa vicina anche spento ' + JSON.stringify(esito.rosso));
if (g.length) { console.log('❌ testa-146'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ testa-146 verde (e il rosso si vede)');
