#!/usr/bin/env node
/* [giro 406] sonda: draw call della vista TV fotogramma per fotogramma, per tipologia di stadio (stessa pagina, stessa camera).
   Serve a separare la variazione dello STRUMENTO (un campione solo, preso in un momento qualunque) dal costo vero dell'impianto.
   Uso: node misura-406.mjs [tpl:cap ...]   (default: mattoni:22000 catino:24000 tedesco:50000) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const TV = { x: 0, y: 16, z: 34, lx: 0, ly: 4, lz: -30 };
const casi = (process.argv.slice(2).length ? process.argv.slice(2) : ['mattoni:22000', 'catino:24000', 'tedesco:50000']).map(s => s.split(':'));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const [tpl, cap] of casi) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_TOD = 'night'; window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = +o.cap;
    if (['provincia', 'storico_it', 'moderno_it', 'tedesco'].includes(o.tpl)) window.__CPM_NO_STADI246 = 1; }, { tpl, cap });
  await openMatch(page, port, { skipLoadAll: true, name: 'Stadi071' }); await sleep(800);
  await page.evaluate(() => window.__CPM_FORCE_SIT(13, true));
  await page.waitForFunction(() => !!window.__CPM_PALI69, null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(c => { window.__CPM_CAM904 = c; }, TV); await sleep(1800);
  const v = await page.evaluate(async () => { const out = []; let last = -1; const t0 = performance.now();
    while (out.length < 40 && performance.now() - t0 < 20000) { await new Promise(r => requestAnimationFrame(r)); const ri = window.__CPM_RINFO769(); if (ri.calls !== last || true) out.push([ri.calls, ri.tri]); last = ri.calls; }
    return { out, ph: window.__CPM_PHASE && window.__CPM_PHASE() }; });
  const c = v.out.map(x => x[0]); const u = [...new Set(c)].sort((a, b) => a - b);
  console.log(`${tpl}:${cap} fase ${v.ph} · ${c.length} campioni · min ${Math.min(...c)} · max ${Math.max(...c)} · valori ${u.join(',')}`);
  console.log('   sequenza ' + c.join(' '));
  await page.close();
}
await b.close(); srv.close();
