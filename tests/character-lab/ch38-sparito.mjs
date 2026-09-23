/* [23/09] «IL MODELLO CH38 DEVE SPARIRE»: apre la partita SENZA parametri, forza un highlight e conta i corpi
   disegnati per famiglia di scheletro (mixamorig = CH38/korward-regular; resto = CGTrader), piu' le richieste
   di rete dei GLB. Rosso: CPM_ROSSO=__CPM_NO_CGDEFAULT (il vecchio default). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'ch38-sparito'); fs.mkdirSync(out, { recursive: true });
const TAG = process.env.CPM_TAG || 'verde', ROSSO = process.env.CPM_ROSSO || '';
const server = await startServer();
const browser = await launchBrowser();
const page = await (await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, serviceWorkers: 'block' })).newPage();
const errori = [], glb = {}; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
page.on('request', r => { const u = r.url(); if (/\.glb(\?|$)/.test(u)) { const n = u.split('/').pop().split('?')[0]; glb[n] = (glb[n] || 0) + 1; } });
try {
  if (ROSSO) await page.addInitScript(n => { window[n] = true; }, ROSSO);
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'CH38', query: { cpmForce: 'keeper' } });
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup' || window.__CPM_NO_CGDEFAULT, null, { timeout: 180000 });
  await sleep(ROSSO ? 8000 : 500);
  await page.evaluate(() => window.__CPM_FORCE_SIT(33, true)); await sleep(3000);
  const m = await page.evaluate(() => new Promise(res => {
    const O = THREE.Object3D.prototype, orig = O.onBeforeRender, vis = new Set();
    O.onBeforeRender = function () { if (this.isSkinnedMesh) vis.add(this); };
    requestAnimationFrame(() => requestAnimationFrame(() => {
      O.onBeforeRender = orig;
      const fam = { ch38: 0, cgtrader: 0 }; const radici = new Set();
      vis.forEach(o => { const b = (o.skeleton && o.skeleton.bones[0] && o.skeleton.bones.map(x => x.name).join(' ')) || '';
        const r = o.skeleton ? o.skeleton.bones[0] : o; let top = r; while (top.parent && !top.parent.isScene) top = top.parent; if (radici.has(top)) return; radici.add(top);
        const mt = [].concat(o.material).map(x => x && x.name).join(' '); if (/^root /.test(b + ' ') || /Regular_Male|Korward_Ajax/.test(mt)) fam.ch38++; else fam.cgtrader++; });
      const campioni = {}; vis.forEach(o => { const k = (o.skeleton && o.skeleton.bones[0] ? o.skeleton.bones[0].name : '-') + '|' + o.name + '|' + [].concat(o.material)[0].name; campioni[k] = (campioni[k] || 0) + 1; });
      res({ campioni, skinDisegnate: vis.size, corpi: radici.size, ...fam, modo: window.__CPM_HYPER_CASUAL_STATUS || null });
    }));
  }));
  await page.screenshot({ path: path.join(out, `${TAG}.png`) });
  fs.writeFileSync(path.join(out, `${TAG}.json`), JSON.stringify({ rosso: ROSSO, ...m, glb, errori }, null, 1));
  console.log(TAG, ROSSO || '-', JSON.stringify(m), 'glb', JSON.stringify(glb), 'errori', errori.length);
} finally { await browser.close(); server.close(); }
