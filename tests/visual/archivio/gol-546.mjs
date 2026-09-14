#!/usr/bin/env node
/* SONDA — QUANDO LA CRONACA ANNUNCIA UN GOL, IL PALLONE ARRIVA IN RETE?
   Collaudo PO «non si vedono i gol». La baseline `fatti-546` dice 2/8 entro 3 minuti; questa allarga la
   finestra a 12 minuti e campiona la MESH a 60ms per distinguere DUE cose molto diverse:
     (a) il pallone non ci va MAI            -> difetto della simulazione
     (b) ci va, ma dopo la mia finestra      -> difetto della sonda precedente
   Stampa, per ogni gol, il massimo avvicinamento alla linea e QUANDO avviene. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const PARTITE = +(process.env.CPM_PARTITE || 2);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = false; window.__CPM_TR = [];
    setInterval(() => { try { const o = window.__CPM_OWN && window.__CPM_OWN(); if (o && o.ph === 'playing') window.__CPM_TR.push([o.c, o.x, o.d]); } catch (_e) {} }, 60);
  });
  await openMatch(page, port, { skipLoadAll: true, name: 'Gl' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7300 + i * 37);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  out.push(await page.evaluate(() => ({
    gol: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle' && /goal/.test(String(e.ef || ''))).map(e => ({ min: e.min, ef: e.ef })),
    tr: window.__CPM_TR || []
  })));
  await page.close();
}
srv.close(); await b.close();
console.log('\n=== QUANDO LA CRONACA ANNUNCIA UN GOL, IL PALLONE ARRIVA IN RETE? ===\n');
let dentro = 0, tot = 0, mai = 0;
for (const { gol, tr } of out) for (const g of gol) {
  tot++;
  const gx = /opp/.test(g.ef) ? 0 : 100;
  const w = tr.filter(([c]) => c >= g.min - 1 && c <= g.min + 12);
  if (!w.length) { console.log(`  ${g.min}' ${g.ef}  — nessun campione`); continue; }
  let best = 1e9, bmin = null;
  for (const [c, x] of w) { const d = Math.abs(gx - x); if (d < best) { best = d; bmin = c; } }
  const ok = best <= 6; if (ok) dentro++; if (best > 20) mai++;
  console.log(`  ${String(g.min).padStart(2)}' ${g.ef.padEnd(10)} max avvicinamento ${best.toFixed(1)}u  al ${bmin}'  (${bmin - g.min >= 0 ? '+' : ''}${bmin - g.min} dal minuto della riga)  ${ok ? 'IN RETE' : 'NO'}`);
}
console.log(`\n  in rete (<=6u): ${dentro}/${tot}   ·   mai vicino (>20u): ${mai}/${tot}   ·   finestra 12 minuti`);
