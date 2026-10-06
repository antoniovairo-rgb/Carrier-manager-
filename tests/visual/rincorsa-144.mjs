#!/usr/bin/env node
/* [7.999.143 decisione PO 06/10 «rincorsa»: Strike Forward Jog per lancio lungo e cross, «Entrambi» per pallonetto e volée]
   GUARDIANO GLB-ON su scene forzate: per ogni gesto (cross, lancio lungo, pallonetto, volée) si legge la clip che l'eroe suona
   (testimone __CPM_P1B2). VERDE: la clip coi passi d'appoggio (mx-strike-foward-jog o la sua specchiata) su tutti i gesti trovati.
   ROSSO (__CPM_NO_RINC144): nessuno la usa. Uso: node rincorsa-144.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = {};
const CASI = [['cross', t => t.type === 'cross' && t.variant !== 'cross_cutback' && t.variant !== 'cross_rabona'], ['lancio', t => t.type === 'pass' && /^(pass_lofted|long_pass|chip_pass)$/.test(t.variant || '')], ['pallonetto', t => t.type === 'shot' && t.variant === 'shot_chip'], ['volee', t => t.type === 'shot' && t.variant === 'shot_volley']];
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; if (r) window.__CPM_NO_RINC144 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Rincorsa 144' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  const out = {};
  for (const [nome, f] of CASI) {
    const c = await page.evaluate(src => { const f = eval(src); for (let gi = 0; gi < SITUATIONS.length; gi++) { const s = SITUATIONS[gi]; const A = s.actions || s.a || []; for (let k = 0; k < A.length; k++) { let t = null; try { t = deriveHL(s, A[k]) || {}; } catch (e) {} if (t && f(t) && !/rovesciat|sforbiciat/i.test(String(A[k].label || ''))) return { gi, k }; } } return null; }, f.toString());
    if (!c) { out[nome] = { trovato: false }; continue; }
    await page.evaluate(gi => { window.__CPM_P1B2 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, c.gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, c.k);
    for (let w = 0; w < 30; w++) { await sleep(700); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (!/^hl_/.test(ph || '')) break; }
    const clip = await page.evaluate(() => { const C = {}; for (const r of (window.__CPM_P1B2 || [])) C[r[0] + '/' + r[1]] = (C[r[0] + '/' + r[1]] | 0) + 1; return C; });
    out[nome] = { gi: c.gi, k: c.k, clip, jog: Object.keys(clip).some(k => /strike-foward-jog/.test(k)) };
  }
  esito[rosso ? 'rosso' : 'verde'] = out; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(out)); await page.close();
}
await b.close(); srv.close();
const V = Object.values(esito.verde).filter(x => x.trovato !== false), R = Object.values(esito.rosso).filter(x => x.trovato !== false), g = [];
if (!(V.length >= 3 && V.every(x => x.jog))) g.push('verde: gesti senza rincorsa ' + JSON.stringify(esito.verde));
if (!(R.length >= 3 && R.every(x => !x.jog || /shot/.test('')) && R.filter(x => x.jog).length === 0)) g.push('rosso: rincorsa presente anche spenta ' + JSON.stringify(esito.rosso));
if (g.length) { console.log('❌ rincorsa-144'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ rincorsa-144 verde (e il rosso si vede)');
