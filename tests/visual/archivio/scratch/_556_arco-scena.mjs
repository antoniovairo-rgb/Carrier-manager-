#!/usr/bin/env node
/* Dove sta la squadra LUNGO L'ARCO della scena, con la presentazione ACCESA (snap+freeze come in partita).
   apertura → lettura → esito. Piu' la cronaca, per confronto.                                   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../lib/harness.mjs';
const N = +(process.env.CPM_N || 30);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_FORCE_INTRO = 700; });
const { total } = await openMatch(page, port); await sleep(500);
const LEGGI = () => {
  const S = window.__CPM_STATE && window.__CPM_STATE(); if (!S || !S.ball) return null;
  const bx = S.ball.x, by = S.ball.y;
  const m = [];
  (S.players || []).forEach((p, i) => { if (p.gk || p.team !== 'home') return; m.push({ i, d: Math.hypot(p.x - bx, p.y - by) }); });
  if (S.hero) m.push({ i: -1, d: Math.hypot(S.hero.x - bx, S.hero.y - by) });
  m.sort((a, c) => a.d - c.d); if (m.length < 4) return null;
  const rep = { DIF: [1,2,3,4], CEN: [5,6,7], ATT: [8,9] }; const R = {};
  for (const [k, ix] of Object.entries(rep)) { const v = m.filter(z => ix.includes(z.i)).map(z => z.d); R[k] = v.length ? +(v.reduce((a,c)=>a+c,0)/v.length).toFixed(1) : null; }
  return { ph: S.phase, d1: +m[1].d.toFixed(1), d2: +m[2].d.toFixed(1), d3: +m[3].d.toFixed(1),
    vic: m.slice(1).filter(z => z.d <= 12).length, chi: m[1].i, hero: +m.find(z=>z.i===-1).d.toFixed(1), ...R };
};
const A = [], B = [], C = [];
const passo = Math.max(1, Math.floor(total / N));
for (let gi = 0; gi < total; gi += passo) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  await sleep(900); let r = await page.evaluate(LEGGI); if (r) A.push(r);
  await sleep(700); r = await page.evaluate(LEGGI); if (r) B.push(r);
  try { await page.evaluate(() => window.__CPM_RESOLVE(0)); } catch (e) {}
  await sleep(1100); r = await page.evaluate(LEGGI); if (r) C.push(r);
}
await page.close();
/* cronaca */
const p2 = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(p2); await p2.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(p2, port, { skipLoadAll: true, name: 'Cron' });
await p2.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 9100, policy: 'seeded', tickMs: 300 }));
const D = []; const t0 = Date.now();
while (Date.now() - t0 < 45000) { await sleep(400); const r = await p2.evaluate(LEGGI); if (r && r.ph === 'playing') D.push(r); }
srv.close(); await b.close();
const med = a => { const s = a.filter(Number.isFinite).slice().sort((x,y)=>x-y); return s.length ? s[Math.floor(s.length/2)] : NaN; };
const st = (n, R) => { if (!R.length) return console.log(`\n${n}: 0 campioni`);
  console.log(`\n=== ${n} — ${R.length} campioni (fasi: ${[...new Set(R.map(r=>r.ph))].join(',')}) ===`);
  console.log(`  1º ${med(R.map(r=>r.d1)).toFixed(1)} m · 2º ${med(R.map(r=>r.d2)).toFixed(1)} m · 3º ${med(R.map(r=>r.d3)).toFixed(1)} m · entro 12 m mediana ${med(R.map(r=>r.vic))} · vuote ${(100*R.filter(r=>r.vic===0).length/R.length).toFixed(0)}%`);
  console.log(`  eroe↔palla ${med(R.map(r=>r.hero)).toFixed(1)} m · reparti dal pallone: DIF ${med(R.map(r=>r.DIF)).toFixed(1)} · CEN ${med(R.map(r=>r.CEN)).toFixed(1)} · ATT ${med(R.map(r=>r.ATT)).toFixed(1)}`);
};
st('APERTURA (fine intro)', A); st('LETTURA', B); st('ESITO (dopo la scelta)', C); st('CRONACA', D);
