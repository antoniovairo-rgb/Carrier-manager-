/* [23/09] MATERIALI DEI CORPI DISEGNATI: quanti sono trasparenti (BLEND) e quanti in maschera (alphaTest).
   Aggancia `onBeforeRender` per un fotogramma (come corpi-disegnati.mjs) e legge i materiali delle SkinnedMesh
   disegnate. Con CPM_ROSSO=<interruttore> accende un rosso (es. __CPM_NO_ALPHAFIX spegne la rete runtime, cosi'
   si misura l'ASSET da solo). CPM_TAG nomina la foto e il json in `materiali-disegnati/`. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'materiali-disegnati'); fs.mkdirSync(out, { recursive: true });
const TAG = process.env.CPM_TAG || 'verde', ROSSO = process.env.CPM_ROSSO || '';
const server = await startServer();
const browser = await launchBrowser();
const page = await (await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 })).newPage();
const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
try {
  if (ROSSO) await page.addInitScript(n => { window[n] = true; }, ROSSO);
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'Materiali', query: { hyperCharacter: 'cgtrader-highlight-optimized', cpmForce: 'keeper' } });
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup', null, { timeout: 180000 });
  await page.evaluate(() => window.__CPM_FORCE_SIT(33, true)); await sleep(2500);
  const m = await page.evaluate(() => new Promise(res => {
    const O = THREE.Object3D.prototype, orig = O.onBeforeRender, vis = new Set();
    O.onBeforeRender = function () { if (this.isSkinnedMesh) vis.add(this); };
    requestAnimationFrame(() => requestAnimationFrame(() => {
      O.onBeforeRender = orig;
      let mat = 0, trasp = 0, noDepth = 0, maschera = 0; const nomi = {};
      vis.forEach(o => [].concat(o.material).forEach(x => { if (!x) return; mat++; if (x.transparent) trasp++; if (!x.depthWrite) noDepth++; if (x.alphaTest > 0) maschera++; nomi[x.name] = (x.transparent ? 'T' : '') + (x.alphaTest > 0 ? 'M' : '') || 'O'; }));
      res({ skinDisegnate: vis.size, materiali: mat, trasparenti: trasp, senzaProfondita: noDepth, inMaschera: maschera, nomi, retteRuntime: window.__CPM_CGTRADER_ALPHAFIX ?? null });
    }));
  }));
  await page.screenshot({ path: path.join(out, `${TAG}.png`) });
  fs.writeFileSync(path.join(out, `${TAG}.json`), JSON.stringify({ rosso: ROSSO, ...m, errori }, null, 1));
  console.log(TAG, ROSSO || '-', JSON.stringify(m), 'errori', errori.length);
} finally { await browser.close(); server.close(); }
