#!/usr/bin/env node
/* [giro 148] FOTO DEL TUFFO, GLB acceso: gi1 con l'eroe fissato a (88,86), parata, stesso seme del guardiano portiere-252.
   Braccio «prima» = __CPM_NO_G148 (riflesso obbligato a bruciapelo), «dopo» = gioco corretto. Fotografa il calcio, il passaggio del
   pallone sul piano del portiere e 0,3 s di scena dopo. Nel braccio «prima» ripete fino a trovare un caso col portiere lontano dal
   pallone (distanza minima > 1,2), per mostrare il difetto. Si lancia da tests/visual: node ../../docs/sviluppo/148/sonde/foto148.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, sleep } from '../../../../tests/visual/lib/harness.mjs';
import { pagina252, kDi } from '../../../../tests/visual/lib/scena-252.mjs';
const OUT = new URL('../foto/', import.meta.url).pathname;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const SEME = 1 * 7919 + 10;
for (const br of ['prima', 'dopo']) {
  for (let tent = 1; tent <= 6; tent++) {
    const page = await pagina252(b, port, Object.assign(br === 'prima' ? { __CPM_NO_G148: 1 } : {}, { __SEME252: SEME }));
    const k = await kDi(page, 1, null);
    await page.evaluate(() => { SITUATIONS[1].startZone = { x: [88, 88], y: [86, 86] }; });
    const scena = () => page.evaluate(() => window.__CPM_SCENET || 0).catch(() => 0);
    const attendi = async (ds, cap) => { const s0 = await scena(); const t0 = Date.now(); while (Date.now() - t0 < cap) { if ((await scena()) - s0 >= ds) break; await sleep(80); } };
    await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; });
    const tot = await page.evaluate(() => SITUATIONS.length);
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), (1 + 61) % tot); await attendi(0.6, 8000);
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), 1); await attendi(1.0, 12000);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = 'saved'; window.__CPM_GK229 = []; if (window.__SEME252_RESET) window.__SEME252_RESET(window.__SEME252); });
    await page.evaluate(kk => window.__CPM_RESOLVE(kk), k);
    /* fotogrammi da una seconda camera dietro la porta (solo nella pagina della sonda): __CPM3D espone scena/camera/renderer */
    const foto = () => page.evaluate(() => { const C = window.__CPM3D; if (!C) return null; const R = window.__CPM_GK229 || []; const r = R[R.length - 1];
      const cam = C.camera.clone(); cam.fov = 50; cam.aspect = C.renderer.domElement.width / C.renderer.domElement.height; cam.position.set(52, 15, 5); cam.lookAt(44, 0, 4); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
      C.renderer.render(C.scene, cam); return { url: C.renderer.domElement.toDataURL('image/png'), s: r ? { at: r.at, aT: r.aT, bx: r.bx, bz: r.bz, by: r.by, gx: r.gx, gz: r.gz, ck: r.ck } : null }; });
    const fr = []; const t0 = Date.now(); let tK = null;
    while (Date.now() - t0 < 40000) { const f = await foto(); if (f && f.s && f.s.at && f.s.aT >= 0) { if (tK == null) tK = f.s.ck; fr.push(f); if (f.s.ck - tK > 1.6) break; } await sleep(30); }
    const shots = [];
    if (fr.length) { let iM = 0; fr.forEach((f, i) => { if (Math.hypot(f.s.bx - f.s.gx, f.s.bz - f.s.gz) < Math.hypot(fr[iM].s.bx - fr[iM].s.gx, fr[iM].s.bz - fr[iM].s.gz)) iM = i; });
      const iD = fr.findIndex(f => f.s.ck >= fr[iM].s.ck + 0.3);
      for (const [n, i] of [['1-calcio', 0], ['2-vicino', iM], ['3-dopo', iD < 0 ? fr.length - 1 : iD]]) { const f = fr[i]; fs.writeFileSync(`${OUT}${br}-${n}.png`, Buffer.from(f.url.split(',')[1], 'base64')); shots.push([n, f.s]); } }
    const act = await page.evaluate(() => (window.__CPM_GKACT || {}).last || null);
    const p = shots.find(x => x[0] === '2-vicino'); const dz = p ? Math.hypot(p[1].bx - p[1].gx, p[1].bz - p[1].gz) : null;
    console.log(`${br} tentativo ${tent}: gesto ${act} · ${shots.map(([n, s]) => `${n} pallone(${s.bx.toFixed(1)},${(+s.by).toFixed(2)},${s.bz.toFixed(2)}) portiere(${s.gx.toFixed(1)},${s.gz.toFixed(2)})`).join(' · ')} · distanza minima pallone-portiere ${dz == null ? '?' : dz.toFixed(2)}`);
    await page.close();
    if (br === 'dopo' || (dz != null && dz > 1.2)) break;
  }
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(0), 100);
