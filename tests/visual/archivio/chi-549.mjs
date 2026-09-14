#!/usr/bin/env node
/* DIAGNOSI — CHI TOCCA IL PALLONE, E CHI NON LO TOCCA MAI.
   Pezzo 3 della roadmap: «la palla ha un padrone con nome», soglia >=16 uomini su 22; oggi 12.
   `possesso` conta QUANTI sono, non QUALI: se i dieci che restano fuori sono sempre gli stessi ruoli, la
   causa e' strutturale (l'aggancio del waypoint sceglie sempre la stessa fascia di campo) e si vede dai
   ruoli; se cambiano a caso, e' varianza e il numero vale meno di quanto credo.
   Legge tutto dalle MESH via __CPM_OWN (sorgente unica) e incrocia il nome dal modello logico. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const PARTITE = +(process.env.CPM_PARTITE || 3);
const PIEDI = 2.5;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = false; window.__CPM_CHI = {};
    setInterval(() => { try {
      const o = window.__CPM_OWN && window.__CPM_OWN(); if (!o || o.ph !== 'playing' || o.d > 2.5) return;
      const mp = (window.__CPM_MP && window.__CPM_MP()) || [];
      const q = mp[o.i]; const k = o.i === -2 ? 'EROE' : (q ? `${q.t}#${o.i}${q.gk ? ' GK' : ''}` : `?#${o.i}`);
      window.__CPM_CHI[k] = (window.__CPM_CHI[k] || 0) + 1;
    } catch (_e) {} }, 80);
  });
  await openMatch(page, port, { skipLoadAll: true, name: 'Chi' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7300 + i * 37);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => window.__CPM_CHI || {}));
  await page.close();
}
srv.close(); await b.close();
console.log(`\n=== CHI TOCCA IL PALLONE (${tutte.length} partite, campioni a 80ms con la palla entro ${PIEDI}u) ===\n`);
tutte.forEach((c, n) => {
  const tot = Object.values(c).reduce((a, v) => a + v, 0) || 1;
  const righe = Object.entries(c).sort((a, b) => b[1] - a[1]);
  console.log(`  partita ${n + 1}: ${righe.length} uomini diversi`);
  console.log('    ' + righe.map(([k, v]) => `${k} ${(v / tot * 100).toFixed(0)}%`).join(' · '));
});
/* chi compare in TUTTE le partite e chi in nessuna: separa lo strutturale dalla varianza */
const sempre = {}; tutte.forEach(c => Object.keys(c).forEach(k => sempre[k] = (sempre[k] || 0) + 1));
const fissi = Object.entries(sempre).filter(([, n]) => n === tutte.length).map(([k]) => k);
const saltuari = Object.entries(sempre).filter(([, n]) => n < tutte.length).map(([k, n]) => `${k}(${n}/${tutte.length})`);
console.log(`\n  presenti in TUTTE le partite (${fissi.length}): ${fissi.join(' · ') || '—'}`);
console.log(`  saltuari (${saltuari.length}): ${saltuari.join(' · ') || '—'}`);
console.log(`\n  Se i fissi sono sempre gli stessi ruoli, la causa e' strutturale e non varianza.`);
