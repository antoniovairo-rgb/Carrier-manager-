#!/usr/bin/env node
/* [giro 47 · PO-002/PO-137] PROVINI DELLA PREMIAZIONE DI SQUADRA, GLB ACCESO (direttiva PO 2026-07-29).
   Per ogni competizione forza la cerimonia, porta il tempo a meta' (o alla frazione CPM_F) di ogni beat
   con __CPM_CERT_SET e fotografa. Larghezze da CPM_W (default 360,412). Uscita: CPM_OUT (default
   docs/sviluppo/foto-giro47). CPM_TAG prefissa i nomi (es. «prima»/«dopo»). CPM_ROSSO=__CPM_NO_X accende un rosso.
     CPM_KINDS=league,cup,int CPM_TAG=dopo node foto-premiazione-47.mjs                                  */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const OUT = process.env.CPM_OUT || '../../docs/sviluppo/foto-giro47';
fs.mkdirSync(OUT, { recursive: true });
const WS = (process.env.CPM_W || '360,412').split(',').map(Number);
const KINDS = (process.env.CPM_KINDS || 'league,cup,int').split(',');
const FR = (process.env.CPM_F || '0.5').split(',').map(Number);
const TAG = process.env.CPM_TAG || 'foto';
const ROSSO = process.env.CPM_ROSSO || '';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];
for (const W of WS) {
  const page = await b.newPage({ viewport: { width: W, height: Math.round(W * 2.22) }, deviceScaleFactor: 1 });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript((r) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CER_HOLD = true; if (r) window[r] = true; }, ROSSO);
  await openMatch(page, port); await sleep(3000);
  for (const k of KINDS) {
    await page.evaluate(k => window.__CPM_FORCE_CEREMONY({ name: k === 'int' ? 'CAMPIONI DEL MONDO' : k === 'cup' ? 'COPPA NAZIONALE' : 'CAMPIONI PREMIER DIVISION', kind: k }), k);
    await page.waitForFunction(() => window.__CPM_CER425 && window.__CPM_CER425.beatsD, null, { timeout: 30000 }).catch(() => {});
    const sc = await page.evaluate(() => window.__CPM_CER425 || null);
    if (!sc) { console.log(k, 'cerimonia assente'); continue; }
    console.log(`${W}px ${k}: ${sc.beats.join('>')}`);
    let acc = 0;
    for (let i = 0; i < sc.beats.length; i++) {
      for (const f of FR) {
        await page.evaluate(t => { window.__CPM_CERT_SET = t; }, acc + sc.beatsD[i] * f); await sleep(2600);
        const nm = `${OUT}/${TAG}-${k}-${String(i).padStart(2, '0')}-${sc.beats[i]}${FR.length > 1 ? '-' + f : ''}-${W}.png`;
        await page.screenshot({ path: nm });
        const pos = await page.evaluate(() => { const T = window.__CPM3D; if (!T) return null; let tro = null; T.scene.traverse(x => { if (!tro && x._extra425 !== undefined) tro = x; });
          const r = v => v ? [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)] : null; return { eroe: r(T.hero.position), cam: r(T.camera.position), coppa: tro ? r(tro.position) : null, cap: window.__CPM_PREMIO23 || null, mani: window.__CPM_MANI137 || null, p24: window.__CPM_PREM24 || null }; });
        if (process.env.CPM_POS) console.log('   ', sc.beats[i], f, JSON.stringify(pos));
      }
      acc += sc.beatsD[i];
    }
    await page.keyboard.press('Enter'); await sleep(1200);
  }
  await page.close();
}
await b.close(); srv.close();
console.log(errs.length ? 'pageerror: ' + errs[0] : 'zero pageerror');
