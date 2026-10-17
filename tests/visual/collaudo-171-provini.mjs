#!/usr/bin/env node
/* Collaudo 7.999.171 — due provini di fila nella STESSA pagina (GLB acceso): fluidita' prima vs seconda partita. Sola misura. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, canvasShot } from './lib/harness.mjs';
const OUT = '../../docs/collaudi/foto-release-7.999.171-3d';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; window.__F = { n: 0, dts: [] }; let last = performance.now();
  (function l() { const t = performance.now(); window.__F.n++; window.__F.dts.push(Math.round(t - last)); last = t; requestAnimationFrame(l); })(); });
await openMatch(page, port, { skipLoadAll: true, name: 'Provini' });
const heap = () => page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null).catch(() => null);
const btns = () => page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => (b.textContent || '').trim().slice(0, 40)));
const res = [];
for (let g = 0; g < 2; g++) {
  await page.evaluate(() => { window.__F.dts = []; }); const h0 = await heap(); const t0 = Date.now();
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 555 + g * 99);
  let ended = false; const phs = [];
  while (Date.now() - t0 < 400000) { await sleep(500); const p = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (phs[phs.length - 1] !== p) phs.push(p); if (p === 'ended' || p === 'ceremony') { ended = true; break; } }
  const d = await page.evaluate(() => { const a = window.__F.dts.slice(5).sort((x, y) => x - y); const q = p => a[Math.floor(a.length * p)] || 0; return { n: a.length, p50: q(.5), p90: q(.9), p99: q(.99), max: a[a.length - 1] }; });
  const r = { g, ended, dur: Math.round((Date.now() - t0) / 1000), h0, h1: await heap(), dts: d, score: await page.evaluate(() => window.__CPM_SCORE()) };
  console.log(JSON.stringify(r)); res.push(r);
  if (g === 0) { await sleep(1500); console.log('bottoni fine:', JSON.stringify(await btns()));
    for (let k = 0; k < 10; k++) { const bt = await btns(); console.log(' ', k, JSON.stringify(bt));
      const ok = await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Risultati provino|Vai al Provino|Prossimo|Continua|Inizia il provino|Gioca/i.test(b.textContent || '')); if (x) { x.click(); return x.textContent.trim().slice(0, 30); } return null; });
      console.log('  click', ok); await sleep(2500);
      const p = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (p === 'playing' || p === 'walkout' || p === 'matchday') { console.log('  nuova fase', p); break; } }
    await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function' && window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 120000 }).catch(e => console.log('attesa 2a partita', String(e.message).slice(0, 80))); }
}
fs.writeFileSync(`${OUT}/provini-dati.json`, JSON.stringify({ res, errs }));
console.log('pageerr', errs.length); await b.close(); srv.close();
