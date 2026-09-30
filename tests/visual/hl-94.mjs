/* [7.999.83 #94] Guardiano della veste degli highlight. Misura, a 412×915 con GLB e presentazione:
   - margine fra il centro dell'eroe a schermo (testimone hs94 in __CPM_CAMT767) e il bordo alto della
     scheda del movimento: verde ≥ 70 px (gambe e pallone liberi), il rosso __CPM_NO_HL94 deve stare sotto;
   - mosse rimaste dentro il D-pad (data-cpm="dpad-mosse") e barra «in corso» (data-cpm="incorso94").
   CPM_ROSSO94=1 → il guardiano si aspetta il difetto (e fallisce se non lo vede). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO94, SCENE = (process.env.CPM_GI || '24,18').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = [];
for (const GI of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript((R) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CAMT767ON = 1; if (R) window.__CPM_NO_HL94 = 1; }, ROSSO);
  await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' }); await sleep(800);
  await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), GI).catch(() => {});
  const ph = async () => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  for (let i = 0; i < 60 && (await ph()) !== 'hl_move'; i++) await sleep(300);
  await sleep(2500);
  const m = await p.evaluate(() => {
    const c = window.__CPM_CAMT767, v = c && c.hs94;
    const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const R = cv ? cv.getBoundingClientRect() : { top: 0, height: innerHeight };
    const hy = v ? Math.round(R.top + (1 - v[1]) / 2 * R.height) : null;
    const s = document.querySelector('[data-cpm="mossa"]'); const r = s && s.getBoundingClientRect();
    return { ph: window.__CPM_PHASE(), hy, top: r ? Math.round(r.top) : null, h: r ? Math.round(r.height) : null, mosse: !!document.querySelector('[data-cpm="dpad-mosse"]'), pct: s ? /%/.test(s.textContent) : null };
  });
  const bt = await p.$('[data-cpm="scegli"]'); if (bt) await bt.click().catch(() => {});
  for (let i = 0; i < 20 && (await ph()) !== 'hl_choose'; i++) await sleep(300);
  await sleep(1500);
  await p.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); }).catch(() => {});
  let corso = false; for (let i = 0; i < 12 && !corso; i++) { corso = await p.evaluate(() => !!document.querySelector('[data-cpm="incorso94"]')); await sleep(150); }
  m.corso = corso; m.gap = (m.top != null && m.hy != null) ? m.top - m.hy : null; m.gi = GI;
  ris.push(m); console.log(JSON.stringify(m));
  await ctx.close();
}
await b.close(); srv.close();
const ok = ris.filter(r => r.ph === 'hl_move' && r.gap != null);
if (ok.length < SCENE.length) { console.log('CIECO: scena non misurata'); process.exit(2); }
const verde = ok.every(r => r.gap >= 70 && r.mosse && r.corso && r.pct === false);
const difetto = ok.some(r => r.gap < 70) && ok.every(r => !r.mosse && !r.corso);
if (ROSSO) { console.log(difetto ? 'ROSSO OK: il difetto si vede (scheda sopra le gambe dell\'eroe, niente mosse nel pad, niente barra 94)' : 'ROSSO KO: il difetto non si vede'); process.exit(difetto ? 0 : 1); }
console.log(verde ? 'VERDE: eroe libero sopra la scheda, mosse nel pad, barra in corso' : 'KO'); process.exit(verde ? 0 : 1);
