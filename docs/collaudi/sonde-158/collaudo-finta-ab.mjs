/* [COLLAUDO PO-218 · «Finta e tiro» · A/B sulle due funzioni reali] stessa etichetta «🌀 Finta e tiro», cambia solo la chiave di esito */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const b = await launchBrowser(); const p = await b.newPage(); await installCdnRoutes(p);
await p.addInitScript(() => { window.__CPM_GLB = false; });
await p.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await p.waitForFunction(() => typeof hlOverlay === 'function' && typeof _hlOvlCat === 'function', null, { timeout: 90000 });
const r = await p.evaluate(() => {
  const lab = '🌀 Finta e tiro'; const out = {};
  for (const key of ['intercept', 'miss']) {
    const cat = _hlOvlCat(key, false, lab);
    const seen = new Set(); for (let sd = 1; sd <= 40; sd++) { try { const o = hlOverlay(key, false, lab, false, sd * 7919, 'wide', null); seen.add(typeof o === 'string' ? o : (o && (o.text || o.ovl || o.t)) || JSON.stringify(o)); } catch (e) { seen.add('ERR ' + e.message); } }
    out[key] = { categoria: cat, riquadri: [...seen].slice(0, 6) };
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close(); srv.close();
