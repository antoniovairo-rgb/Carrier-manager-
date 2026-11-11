#!/usr/bin/env node
/* SONDA giro 167 (strumento, non guardiano): cosa fanno davvero pallone e cronaca a motore acceso.
   Campiona in pagina a 120 ms: fase, minuto, pallone mesh (__CPM_STATE), pallone logico del motore
   (__CPM_MOTORE), stato del possesso, scena del motore, trattenute (__CPM_HOLD). Raccoglie le righe
   `chronicle` dal registro. Stampa il riassunto. CPM_ROSSO_FLAG=<nome> accende una bandiera. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const MIN = +(process.env.CPM_MINUTI || 3), FLAG = process.env.CPM_FLAG || null, NO870 = !!process.env.CPM_NO870;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(([f, n]) => { window.__CPM_GLB = false; if (f) for (const x of f.split(',')) window[x] = 1; if (n) window.__CPM_NO870 = 1; }, [FLAG, NO870]);
await openMatch(page, port, { skipLoadAll: true, name: process.env.CPM_NOME || 'Sonda167' });
await page.evaluate(() => { window.__S = []; window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 });
  setInterval(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); const m = window.__CPM_MOTORE && window.__CPM_MOTORE(); const h = window.__CPM_HOLD && window.__CPM_HOLD();
    window.__S.push({ t: Date.now(), ph: window.__CPM_PHASE && window.__CPM_PHASE(), min: window.__CPM_CLOCK && window.__CPM_CLOCK(), bx: s && s.ball && s.ball.x, by: s && s.ball && s.ball.y, mx: m && m.palla && +m.palla.x.toFixed(2), my: m && m.palla && +m.palla.y.toFixed(2), ps: m && m.poss && m.poss.stato, sc: m && m.scena ? 1 : 0, h: h ? Object.keys(h).filter(k => h[k] === true).join('+') : '' }); } catch (e) {} }, 120); });
const t0 = Date.now(); while (Date.now() - t0 < MIN * 60000) { await sleep(2000); const ph = await matchPhase(page); if (ph === 'ended') break; }
const S = await page.evaluate(() => window.__S); const E = await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'));
await b.close(); srv.close();
const P = S.filter(s => s.ph === 'playing');
let mm = 0, mb = 0, n = 0, st = 0, maxSt = 0, stDa = null, worst = null, stB = 0, maxB = 0;
for (let i = 1; i < P.length; i++) { if (P[i].t - P[i - 1].t > 400) { st = 0; stB = 0; continue; } n++;
  const dm = Math.hypot(P[i].mx - P[i - 1].mx, P[i].my - P[i - 1].my), db = Math.hypot(P[i].bx - P[i - 1].bx, P[i].by - P[i - 1].by);
  if (dm > 0.05) { mm++; st = 0; stDa = i; } else { st += P[i].t - P[i - 1].t; if (st > maxSt) { maxSt = st; worst = { da: stDa, a: i }; } }
  if (db > 0.05) { mb++; stB = 0; } else { stB += P[i].t - P[i - 1].t; if (stB > maxB) maxB = stB; } }
console.log(`campioni ${S.length} · playing ${P.length} · coppie ${n} · minuto finale ${S.length ? S[S.length - 1].min : '-'}`);
console.log(`pallone MOTORE in moto ${(100 * mm / Math.max(1, n)).toFixed(1)}% · striscia max ${(maxSt / 1000).toFixed(1)}s`);
console.log(`pallone MESH   in moto ${(100 * mb / Math.max(1, n)).toFixed(1)}% · striscia max ${(maxB / 1000).toFixed(1)}s`);
if (worst && worst.da != null) { const seg = P.slice(worst.da, worst.a + 1); const k = {}; for (const q of seg) { const key = `ps=${q.ps} sc=${q.sc} h=${q.h || '-'}`; k[key] = (k[key] | 0) + 1; } console.log('  stati nel fermo motore piu\' lungo (min ' + P[worst.da].min + '-' + P[worst.a].min + '):', JSON.stringify(k)); }
const ps = {}; for (const q of P) ps[q.ps] = (ps[q.ps] | 0) + 1; console.log('  poss.stato in playing:', JSON.stringify(ps));
console.log(`righe chronicle ${E.length} · col narratore (mk) ${E.filter(e => e.mk).length} · rec ${E.filter(e => e.rec).length} · fasi ${JSON.stringify(E.reduce((m, e) => (m[e.fase] = (m[e.fase] | 0) + 1, m), {}))}`);
if (process.env.CPM_DUMP) console.log(JSON.stringify(E.slice(0, 40).map(e => [e.min, e.mk, e.fase, e.dec, e.pd, e.rec, (e.txt || '').slice(0, 50)])));
