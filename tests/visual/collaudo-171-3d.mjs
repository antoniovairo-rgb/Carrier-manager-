#!/usr/bin/env node
/* Collaudo 3D release 7.999.171 — partite vere complete, GLB acceso. Strumento di sola misura (non-gate). */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, canvasShot } from './lib/harness.mjs';
const OUT = '../../docs/collaudi/foto-release-7.999.171-3d';
const N = +(process.env.CPM_N || 6), START = +(process.env.CPM_START || 0), TETTO = +(process.env.CPM_TETTO || 600000);
const GLB = process.env.CPM_GLB === '0' ? false : true;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const res = [];
for (let i = START; i < START + N; i++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = [], cons = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error') cons.push(m.text().slice(0, 140)); });
  await page.addInitScript(g => {
    window.__CPM_GLB = g; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1;
    window.__F = { n: 0, dts: [] }; let last = performance.now();
    (function loop() { const t = performance.now(); window.__F.n++; const d = t - last; last = t; if (window.__F.dts.length < 200000) window.__F.dts.push(Math.round(d)); requestAnimationFrame(loop); })();
  }, GLB);
  const R = { i, shots: [], phases: [], fps: [], heap: [] };
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Coll' + i });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 1300 + i * 71);
    const t0 = Date.now(); let prev = null, nShot = {}, lastFn = 0, fin = false;
    const snap = async (tag, cap) => { nShot[tag] = (nShot[tag] || 0) + 1; if (nShot[tag] > cap) return;
      try { const buf = await canvasShot(page, { timeout: 15000 }); const f = `m${i}-${tag}-${nShot[tag]}.png`; fs.writeFileSync(`${OUT}/${f}`, buf); R.shots.push(f); } catch (e) {} };
    while (Date.now() - t0 < TETTO) {
      await sleep(350);
      const d = await page.evaluate(() => { const o = { ph: window.__CPM_PHASE && window.__CPM_PHASE(), ck: window.__CPM_CLOCK && window.__CPM_CLOCK(), sc: window.__CPM_SCORE && window.__CPM_SCORE(), n: window.__F.n, t: performance.now() };
        try { o.heap = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null; } catch (e) {} return o; });
      R.fps.push([d.t, d.n, d.ph, d.ck]); if (d.heap) R.heap.push(d.heap);
      if (d.ph !== prev) { R.phases.push({ t: Math.round(Date.now() - t0), ph: d.ph, ck: d.ck, sc: d.sc }); prev = d.ph;
        const cap = { hl_intro: 3, hl_choose: 3, hl_result: 4, walkout: 2, formations: 1, matchday: 1, ended: 2, ceremony: 3 }[d.ph];
        if (cap) { await sleep(d.ph === 'hl_result' ? 900 : 500); await snap(d.ph, cap); } }
      if (d.ph === 'playing' && d.ck - lastFn >= 20) { lastFn = d.ck; await snap('playing', 5); }
      if (d.ph === 'ended' || d.ph === 'ceremony') { await sleep(1500); await snap(d.ph + 'F', 1); fin = true; break; }
    }
    R.fin = fin; R.dur = Date.now() - t0;
    R.ev = await page.evaluate(() => { const ev = window.__CPM_EV ? window.__CPM_EV() : []; const c = {}; ev.forEach(e => c[e.ev] = (c[e.ev] || 0) + 1); return { c, fine: ev.filter(e => e.ev === 'fine').map(e => e.causa), goals: ev.filter(e => e.ev === 'goal').map(e => ({ min: e.min, via: e.via || e.src || e.k })) }; });
    R.fr480 = await page.evaluate(() => window.__CPM_FRAME480 || null);
    R.ap261 = await page.evaluate(() => window.__CPM_AP261 || 0);
    R.final = await page.evaluate(() => ({ sc: window.__CPM_SCORE && window.__CPM_SCORE(), ck: window.__CPM_CLOCK && window.__CPM_CLOCK(), glb: window.__CPM_GLB }));
    R.dts = await page.evaluate(() => { const a = window.__F.dts.slice(5).sort((x, y) => x - y); const q = p => a[Math.floor(a.length * p)] || 0; return { n: a.length, p50: q(.5), p90: q(.9), p99: q(.99), max: a[a.length - 1] }; });
  } catch (e) { R.err = String(e.message).slice(0, 200); }
  R.errs = errs.slice(0, 6); R.cons = cons.slice(0, 6);
  fs.writeFileSync(`${OUT}/m${i}-dati.json`, JSON.stringify(R));
  console.log(`M${i}: fin=${R.fin} dur=${((R.dur||0)/1000).toFixed(0)}s final=${JSON.stringify(R.final)} dts=${JSON.stringify(R.dts)} ev=${JSON.stringify(R.ev && R.ev.c)} err=${R.err||''} pageerr=${errs.length} cons=${cons.length} shots=${R.shots.length}`);
  await ctx.close();
}
await b.close(); srv.close();
