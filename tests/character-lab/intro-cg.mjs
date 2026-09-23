/* [23/09] INTRO SENZA CH38: avvia l'intro cinematografica (evento `cpm-replay-intro`), fotografa tre istanti e conta i corpi
   disegnati per famiglia di scheletro (CGTrader = ossa `pelvis`/`ik_foot_root`; CH38 = materiali Regular/Korward_Ajax o ossa
   mixamorig). Rosso: CPM_ROSSO=__CPM_NO_CGINTRO. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, 'intro-cg'); fs.mkdirSync(out, { recursive: true });
const ROSSO = process.env.CPM_ROSSO || '', TAG = ROSSO ? 'rosso' : 'verde';
const srv = await startServer(); const b = await launchBrowser();
const page = await (await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' })).newPage();
const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 160)));
const glb = {}; page.on('request', r => { const u = r.url(); if (/\.glb/.test(u)) { const n = u.split('/').pop().split('?')[0]; glb[n] = (glb[n] || 0) + 1; } });
if (ROSSO) await page.addInitScript(n => { window[n] = true; }, ROSSO);
await installCdnRoutes(page);
await page.goto(`http://127.0.0.1:${srv.address().port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load' });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500);
await page.evaluate(() => window.dispatchEvent(new Event('cpm-replay-intro')));
await page.waitForFunction(() => window.__CPM_INTRO_GLB, null, { timeout: 90000 }).catch(() => {});
const conta = () => page.evaluate(() => new Promise(res => { const O = THREE.Object3D.prototype, orig = O.onBeforeRender, vis = new Set();
  O.onBeforeRender = function () { if (this.isSkinnedMesh) vis.add(this); };
  requestAnimationFrame(() => requestAnimationFrame(() => { O.onBeforeRender = orig; const fam = { cgtrader: 0, ch38: 0 }; const radici = new Set();
    vis.forEach(o => { let t = o; while (t.parent && !t.parent.isScene) t = t.parent; if (radici.has(t)) return; radici.add(t);
      let mt = ''; t.traverse(m => { if (m.isMesh) mt += ' ' + [].concat(m.material).map(x => x && x.name).join(' '); });
      if (/Hyper(Shirt|Shorts|Leg|Socks|Boots)/.test(mt)) fam.cgtrader++; else fam.ch38++; });
    res({ corpi: radici.size, ...fam, cg23: !!window.__CPM_INTRO_CG23 }); })); }));
const R = { tag: TAG, istanti: [] };
for (const [t, n] of [[4, 'corsa'], [11.6, 'tiro'], [14, 'esultanza']]) { await sleep(t * 1000 - (R.istanti.length ? [4, 11.6, 14][R.istanti.length - 1] * 1000 : 0)); R.istanti.push({ t, ...(await conta()) }); await page.screenshot({ path: path.join(out, `${TAG}-${n}.png`) }); }
R.glb = glb; R.errori = err;
fs.writeFileSync(path.join(out, `${TAG}.json`), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
await b.close(); srv.close();
