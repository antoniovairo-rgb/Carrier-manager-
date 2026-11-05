#!/usr/bin/env node
/* sonda giro 102: solo la scena gi150 di esiti-241 (verde e, con CPM_ROSSO=1, __CPM_NO_G102) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { contraddizioni } from './lib/esiti-241.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const N = +(process.env.CPM_N || 1), FLAG = process.env.CPM_FLAG || '';
for (let rep = 0; rep < N; rep++) {
  const gi = +(process.env.CPM_GI || 150), k = 0;
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(f => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_V241 = {}; if (f) for (const x of f.split(',')) window[x] = 1; }, FLAG);
  await openMatch(page, port, { skipLoadAll: true, name: 'Esiti241' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 300 }));
  await page.waitForFunction(() => window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() && typeof window.__CPM_FORCE_SIT === 'function', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY(false));
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(g => window.__CPM_FORCE_SIT((g + 61) % SITUATIONS.length, true), gi); await sleep(1500);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(2500);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_V241 = {}; window.__R241 = (window.__CPM_RES218 || []).length; });
  const lab = await page.evaluate(k => { const s = SITUATIONS[window.__CPM_LAST_FORCED_GI]; window.__CPM_RESOLVE(k); return s && s.actions[k] ? JSON.stringify({ l: s.actions[k].label, fc: s.actions[k].falloCercato, rew: s.actions[k].rew, d95: s.actions[k].drb95, cd: s._chainDepth }) : null; }, k);
  const tR = Date.now(); let s0 = null;
  while (Date.now() - tR < 40000) { await sleep(400); const s = await page.evaluate(() => (typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null)).catch(() => null); if (s != null) { if (s0 == null) s0 = s; if (s - s0 >= 4) break; } }
  const r = await page.evaluate(() => { const o = window.__CPM_OUTCOME || {}; const res = (window.__CPM_RES218 || []).slice(window.__R241 || 0).slice(-1)[0] || {}; const W = window.__CPM_V241 || {};
    return { ok: o.ok, outKey: o.outKey || null, outKind: o.outKind || null, overlay: o.overlay || null, text: o.text || null, ev: res.ev || [], v: (W.all || []).slice(-1)[0] || null, dbg: window.__CPM_G102DBG || null }; });
  r.label = lab; r.gi = gi; r.contr = contraddizioni(r);
  console.log(JSON.stringify({ ok: r.ok, k: r.outKey, kind: r.outKind, ovl: r.overlay, text: r.text, lab, ev: r.ev, contr: r.contr, pa: r.v && r.v.pa, gk: r.v && r.v.gk, fx: r.v && r.v.fx }));
  await page.close();
}
await b.close(); srv.close();
