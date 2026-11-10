#!/usr/bin/env node
/* [giro 152 PO-355] FOTO prima/dopo dell'esultanza in corsa (run_wide imposta), corpi 3D accesi. Strumento di collaudo, non
   guardiano: scatta a eventi del testimone __CPM_G152W (eroe in moto oltre 3 u/s · eroe fermo con le braccia al cielo), in
   entrambi i bracci (rosso = __CPM_NO_G152, il comportamento di prima). Uscita: docs/sviluppo/giro152/*.png */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'fs';
const OUT = new URL('../../docs/sviluppo/giro152/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 600 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_G152W = []; if (r) window.__CPM_NO_G152 = 1; }, rosso);
  await openMatch(page, port, { name: 'Foto152' }); await sleep(1400);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const gi = await page.evaluate(() => { const S = window.__CPM_SITS || []; for (let i = 0; i < S.length; i++) { const s = S[i]; if (s && s.actions && s.actions[0] && s.actions[0].rew === 'goal' && !s.def) return i; } return 0; });
  await page.evaluate(g => { const o = window.pickCelebration; window.pickCelebration = (c, opt) => (window.CELEBRATIONS || []).find(y => y.id === 'run_wide') || o(c, opt);
    window.__CPM_FORCED_MODE = true; window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(700);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
  const tag = rosso ? 'prima' : 'dopo'; const fatte = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 120000 && fatte.length < 2) {
    const st = await page.evaluate(() => { const W = window.__CPM_G152W || []; const n = W.length; if (n < 2) return null; const f = W[n - 1], p = W[n - 2];
      return { c: f.c, v: f.dt ? Math.hypot(f.x - p.x, f.z - p.z) / f.dt : 0, g: f.g, gw: f.gw, rw: f.rw, gn: f.gn, gp: f.gp, done: window.__CPM_CELDONE84 }; });
    if (st && st.c === 'cel' && st.v > 3 && !fatte.includes('corsa')) {
      await page.screenshot({ path: OUT + `${tag}-corsa.png` }); fatte.push('corsa');
      console.log(tag, 'corsa', JSON.stringify(st));
    }
    if (st && st.c === 'cel' && st.v < 0.2 && st.g === 'lift' && st.gw > 0.9 && fatte.includes('corsa') && !fatte.includes('fermo')) {
      await page.screenshot({ path: OUT + `${tag}-arrivo.png` }); fatte.push('fermo'); console.log(tag, 'arrivo', JSON.stringify(st));
    }
    if (st && st.done) break;
    await sleep(120);
  }
  await page.close();
  return fatte;
}
const p = await braccio(true), d = await braccio(false);
console.log('PRIMA', p.join(','), '· DOPO', d.join(','));
await Promise.race([b.close(), sleep(5000)]); srv.close();
