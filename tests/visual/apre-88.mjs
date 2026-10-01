/* [7.999.88 PO-151] Guardiano dell'apertura delle scene difensive (collaudo Codex su 7.999.84: 24 «coperto dalla scheda»):
   dalla 3a lettura (~0,75 s) pallone e portatore stanno SOPRA la scheda delle azioni e l'eroe resta nel quadro.
   Rosso __CPM_NO_APRE88 (CPM_ROSSO88=1). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_GI || '31,33,128,137,157,168,133,44').split(',').map(Number);
let coperti = 0, campioni = 0, eroeFuori = 0;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_CAMT767ON = 1; if (window.localStorage && false) {} });
  if (process.env.CPM_ROSSO88) await p.addInitScript(() => { window.__CPM_NO_APRE88 = 1; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Apre' }); await sleep(800);
  const t0 = Date.now();
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  const row = [];
  for (let k = 0; k < 8; k++) {
    await sleep(250);
    const m = await p.evaluate(() => {
      const S = window.__CPM_STATE(); const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]; const R = cv.getBoundingClientRect();
      const py = n => n ? Math.round(R.top + (1 - n.y) / 2 * R.height) : null;
      const sh = document.querySelector('[data-cpm="scelte"],[data-cpm="mossa"]'); const top = sh ? Math.round(sh.getBoundingClientRect().top) : 9999;
      const pl = S.players || []; const b = S.ball; let car = null, bd = 1e9;
      pl.forEach(q => { if (q.team === 'away' && !q.gk) { const d = Math.hypot(q.x - b.x, q.y - b.y); if (d < bd) { bd = d; car = q; } } });
      const c = window.__CPM_CAMT767; const hs = c && c.hs94;
      return { ph: window.__CPM_PHASE(), top, ball: py(b.ndc), car: car ? py(car.ndc) : null, hero: hs ? Math.round(R.top + (1 - hs[1]) / 2 * R.height) : null, carD: +bd.toFixed(1) };
    });
    if (k >= 2) { campioni++; if ((m.ball != null && m.ball > m.top - 8) || (m.car != null && m.carD < 3 && m.car > m.top - 8)) coperti++; if (m.hero != null && m.hero < 130) eroeFuori++; }
    row.push(`${m.ph.replace('hl_', '')} top${m.top} b${m.ball} c${m.car}(${m.carD}) e${m.hero}`);
  }
  console.log('gi' + gi + ': ' + row.join(' | '));
  await ctx.close();
}
await b.close(); srv.close();
console.log(`campioni ${campioni} · pallone o portatore sotto la scheda ${coperti} · eroe oltre il bordo alto ${eroeFuori}`);
if (campioni < 12) { console.log('CIECO'); process.exit(2); }
if (process.env.CPM_ROSSO88) { const v = coperti > campioni * 0.3; console.log(v ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(v ? 0 : 1); }
const ok = coperti <= campioni * 0.1 && eroeFuori === 0; console.log(ok ? 'VERDE' : 'KO'); process.exit(ok ? 0 : 1);
