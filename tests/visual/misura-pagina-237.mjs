/* [giro 237 PO-504 B] MISURA: quanto costa aprire UNA pagina del banco, sorgente con Babel nel browser contro pagina gia' tradotta.
   Strumento di misura (non guardiano). Bracci alternati sullo stesso processo, pagine nuove, ripetizioni dichiarate (CPM_N, default 4).
   Per ogni apertura: ms da goto a #root popolato, ms al tasto «Nuova carriera», heap JS usato, se babel.min.js e' stato chiesto. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
import { paginaTradotta } from './lib/precompila-237.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const N = +(process.env.CPM_N || 4);
const t0p = Date.now(); paginaTradotta(path.join(ROOT, 'CARRIER-MANAGER-AV.html')); const tradMs = Date.now() - t0p;
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const ris = { babel: [], tradotta: [] };
for (let i = 0; i < N; i++) for (const braccio of ['babel', 'tradotta']) {
  process.env.CPM_BABEL_BROWSER = braccio === 'babel' ? '1' : '0';
  const ctx = await browser.newContext(); const page = await ctx.newPage(); await installCdnRoutes(page);
  let babelChiesto = false; page.on('request', r => { if (/babel(\.min)?\.js/.test(r.url())) babelChiesto = true; });
  const t0 = Date.now();
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  const tLoad = Date.now() - t0;
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 });
  const tRoot = Date.now() - t0;
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => /nuova carriera/i.test(b.textContent || '')), null, { timeout: 120000 });
  const tMenu = Date.now() - t0;
  const heap = await page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1);
  ris[braccio].push({ tLoad, tRoot, tMenu, heap, babelChiesto });
  console.log(`${braccio.padEnd(9)} #${i + 1}  load ${tLoad} ms · root ${tRoot} ms · menu ${tMenu} ms · heap ${heap} MB · babel chiesto ${babelChiesto}`);
  await ctx.close();
}
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
console.log(`\ntraduzione in node (una volta per build, poi cache su disco): ${tradMs} ms`);
for (const b of ['babel', 'tradotta']) console.log(`MEDIANA ${b.padEnd(9)} menu ${med(ris[b].map(x => x.tMenu))} ms · root ${med(ris[b].map(x => x.tRoot))} ms · heap ${med(ris[b].map(x => x.heap))} MB`);
console.log(`risparmio per pagina aperta (mediana menu): ${med(ris.babel.map(x => x.tMenu)) - med(ris.tradotta.map(x => x.tMenu))} ms`);
await browser.close(); srv.close();
