#!/usr/bin/env node
/* CENSIMENTO — GLI EVENTI FERMI: QUANTI NE ESCONO, E QUANTI DIVENTANO UNA RECITA VERA.
   Pezzo 5 della roadmap. La baseline `fatti-546` dice `palla_ferma 0/4`: nessuna riga che annuncia un
   corner, una punizione o un rigore ferma mai il pallone. Ma le recite ESISTONO dal 7.530 (`spRef`,
   r.21413), quindi la domanda e' un'altra: quante righe `sp` escono, e cosa impedisce alla recita di
   partire. Il ramo ha QUATTRO cancelli: !spRef (nessuna recita in corso) && kickoffRef<=0 (non siamo nel
   calcio d'inizio) && !pendingGoalRef (nessun gol in sospeso) && !counterRef (nessun contropiede).
   Questa sonda conta le righe `sp` uscite, quante volte la palla si e' davvero fermata dopo, e — col
   flag di collaudo `__CPM_SPBOOST` — misura la recita in regime forzato per separare «non esce mai la
   riga» da «esce ma la recita non parte». Due regimi, due numeri, nessuna ipotesi.
   CPM_BOOST=1 per il regime forzato. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const BOOST = !!process.env.CPM_BOOST;
const PARTITE = +(process.env.CPM_PARTITE || 3);
const FERMO_U = 1.5;   /* spostamento sotto il quale il pallone e' fermo */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(bo => {
    window.__CPM_GLB = false; if (bo) window.__CPM_SPBOOST = 1;
    window.__CPM_TR = [];
    setInterval(() => { try { const q = window.__CPM_BALL3 && window.__CPM_BALL3(); if (q && q.m) window.__CPM_TR.push([q.c, q.m.x, q.m.y]); } catch (_e) {} }, 60);
  }, BOOST);
  await openMatch(page, port, { skipLoadAll: true, name: 'Fm' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7300 + i * 37);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => ({
    righe: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'),
    tr: window.__CPM_TR || []
  })));
  await page.close();
}
srv.close(); await b.close();
console.log(`\n=== GLI EVENTI FERMI${BOOST ? ' · REGIME FORZATO (__CPM_SPBOOST)' : ''} · ${tutte.length} partite ===\n`);
const perKind = {}; let tot = 0, fermate = 0, righeTot = 0;
for (const { righe, tr } of tutte) {
  righeTot += righe.length;
  for (const r of righe) {
    if (!r.sp) continue;
    tot++;
    (perKind[r.sp] ||= { n: 0, f: 0 });
    perKind[r.sp].n++;
    /* nei 4 minuti dopo la riga, il pallone resta fermo per almeno mezzo secondo? */
    const w = tr.filter(([c]) => c >= r.min && c <= r.min + 4);
    let ok = false;
    for (let k = 0; k + 8 < w.length; k++) {
      const d = Math.hypot(w[k + 8][1] - w[k][1], w[k + 8][2] - w[k][2]);
      if (d < FERMO_U) { ok = true; break; }
    }
    if (ok) { fermate++; perKind[r.sp].f++; }
  }
}
console.log(`  righe di cronaca totali        ${righeTot}  (${(righeTot / tutte.length).toFixed(0)} a partita)`);
console.log(`  righe che annunciano una palla ferma  ${tot}  (${(tot / tutte.length).toFixed(1)} a partita)   <- obiettivo del pezzo 5: >=8`);
console.log(`  di queste, il pallone si e' FERMATO   ${fermate}/${tot}${tot ? ' = ' + ((fermate / tot) * 100).toFixed(0) + '%' : ''}\n`);
for (const [k, v] of Object.entries(perKind)) console.log(`    ${k.padEnd(16)} ${v.n} uscite · ${v.f} con palla ferma`);
if (!tot) console.log('    nessuna riga `sp` uscita: la pesca non ci arriva mai');
console.log('\nCENSIMENTO. Non e\' un guardiano: non fallisce, misura.');
