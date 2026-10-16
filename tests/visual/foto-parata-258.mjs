#!/usr/bin/env node
/* [giro 40 PO-258] FOTO della parata su punizione fk_power, GLB acceso: scena congelata quando il pallone arriva sul portiere (e a fine
   arco), camera di sola sonda (__CPM_CAM904) di tre quarti sul portiere. CPM_ROSSO=1 → __CPM_NO_PARATA258 («prima»). */
import fs from 'fs'; import path from 'path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1', TAG = ROSSO ? 'prima' : 'dopo';
const DIR = path.join(ROOT, 'docs', 'sviluppo', 'foto-giro40'); fs.mkdirSync(DIR, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (let t = 0, fatte = 0; t < 4 && fatte < 1; t++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_CINE = 1; if (r) window.__CPM_NO_PARATA258 = 1; }, ROSSO);
  await openMatch(page, port, { name: 'Fk258 ' + t }); await sleep(800);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const gi = await page.evaluate(t => { const s = scenaDalMotorePiazzato({ tipo: 'punizione', x: [83, 84, 82, 85][t % 4], y: 50 + ((t % 3) - 1) * 4, cast: { portiere: { nome: 'Ted Tucker' } } }, { stats: {} }, 100 + t); SITUATIONS.push(s); return SITUATIONS.length - 1; }, t);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(1200);
  await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (M && M.risolviEroe && M.risolviEroe.dado) M.risolviEroe.dado = () => false; const R = window.resolveSetPieceShot; window.resolveSetPieceShot = function () { const r = R.apply(this, arguments); if (r && r.outKind !== 'goal') { r.outKind = 'saved'; r.ok = false; } return r; }; window.__CPM_FROZEN = false; window.__CPM_GK229 = []; window.__CPM_REC229 = 1;
    window.__f258 = 0; const iv = setInterval(() => { const R = window.__CPM_GK229 || []; const L = R[R.length - 1]; if (!L) return;
      if (window.__f258 === 0 && L.at && L.aT > 0 && L.bx >= L.gx - 1.2) { window.__CPM_FROZEN = true; window.__f258 = 1; window.__g258 = L; }
      if (window.__f258 === 2 && !L.at) { window.__CPM_FROZEN = true; window.__f258 = 3; window.__g258 = L; clearInterval(iv); } }, 5); });
  await page.evaluate(() => window.__CPM_SETPIECE('fk_power'));
  const scatta = async (n, nome) => { const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await page.evaluate(() => window.__f258)) < n) await sleep(50);
    const g = await page.evaluate(() => window.__g258); if (!g) return false;
    await page.evaluate(g => { window.__CPM_CAM904 = { x: g.gx - 9, y: 4.2, z: g.gz * 0.5, lx: g.gx + 1, ly: 0.8, lz: g.gz }; window.__CPM_FROZEN = false; }, g); await sleep(120); await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(250);
    await page.screenshot({ path: path.join(DIR, `parata-${TAG}-fk${t}-${nome}.jpg`), quality: 70, type: 'jpeg' }); await page.evaluate(() => { window.__CPM_CAM904 = null; }); return true; };
  const ok1 = await scatta(1, 'arrivo'); await page.evaluate(() => { window.__f258 = 2; window.__CPM_FROZEN = false; }); const ok2 = await scatta(3, 'fine-arco');
  const kind = await page.evaluate(() => window.__CPM_OUTCOME && window.__CPM_OUTCOME.outKind); console.log(`${TAG} scena ${t}: esito ${kind} foto ${ok1}/${ok2}`); if (ok1 && kind === 'saved') fatte++;
  await page.close();
}
await b.close(); srv.close();
