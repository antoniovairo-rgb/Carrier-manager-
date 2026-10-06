#!/usr/bin/env node
/* [7.999.145 PO-068 «doppio gesto», decisione PO 06/10] GUARDIANO GLB-ON su scene forzate: le azioni «X e cross» / «X e assist»
   / «X e tiro» mostrano PRIMA il dribbling di preparazione e POI il gesto finale. Per ogni caso si legge la sequenza dell'azione
   (__CPM_TLSEG: tratto «feint») e le clip dell'eroe (__CPM_P1B2: cambio di direzione).
   VERDE: cross e assist hanno il tratto di finta e il cambio di direzione; il tiro ha il tratto di finta.
   ROSSO (__CPM_NO_DOPPIO148): cross e assist senza tratto di finta. Uso: node doppio-gesto-148.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = {};
const CASI = [['cross', /step-?over e cross/i], ['assist', /sterzat.*assist/i], ['tiro', /doppio passo e tiro/i]];
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; if (r) window.__CPM_NO_DOPPIO148 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Doppio 148' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  const out = {};
  for (const [nome, re] of CASI) {
    const c = await page.evaluate(src => { const re = new RegExp(src, 'i'); for (let gi = 0; gi < SITUATIONS.length; gi++) { const A = SITUATIONS[gi].actions || []; for (let k = 0; k < A.length; k++) if (re.test(String(A[k].label || ''))) return { gi, k, label: A[k].label }; } return null; }, re.source);
    if (!c) { out[nome] = { trovato: false }; continue; }
    await page.evaluate(gi => { window.__CPM_P1B2 = []; window.__CPM_TLSEG = null; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, c.gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, c.k);
    for (let w = 0; w < 30; w++) { await sleep(700); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (!/^hl_/.test(ph || '')) break; }
    const r = await page.evaluate(() => { const C = {}; for (const x of (window.__CPM_P1B2 || [])) C[x[0] + '/' + x[1]] = (C[x[0] + '/' + x[1]] | 0) + 1; const T = window.__CPM_TLSEG; return { clip: C, seg: T && T.seg ? T.seg.map(g => g.tag) : null }; });
    out[nome] = { gi: c.gi, k: c.k, label: c.label, seg: r.seg, finta: !!(r.seg && r.seg.indexOf('feint') >= 0), cambio: Object.keys(r.clip).some(k => /^change\/|change-direction/.test(k)), clip: r.clip };
  }
  esito[rosso ? 'rosso' : 'verde'] = out; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(out)); await page.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
for (const n of ['cross', 'assist']) {
  if (!V[n] || V[n].trovato === false) { g.push(`verde: caso ${n} non trovato in catalogo`); continue; }
  if (!(V[n].finta && V[n].cambio)) g.push(`verde ${n}: finta=${V[n].finta} cambio=${V[n].cambio} seg=${JSON.stringify(V[n].seg)}`);
  if (R[n] && R[n].finta) g.push(`rosso ${n}: tratto di finta presente anche spento`);
}
if (V.tiro && V.tiro.trovato !== false && !V.tiro.finta) g.push('verde tiro: manca il tratto di finta');
if (g.length) { console.log('❌ doppio-gesto-148'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ doppio-gesto-148 verde (e il rosso si vede)');
