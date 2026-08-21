#!/usr/bin/env node
/* 7.542 — IL GIRO GIRO TONDO (collaudo PO «in cronaca parecchi giro giro tondo con il pallone sia a
   centrocampo che in area avversaria»). Sintomo del 3D: i ventidue ruotano attorno al pallone invece di
   tenere una forma. Sospetto dichiarato PRIMA della misura, ed è roba mia: nel 7.538 ho fatto TRASLARE lo
   slot di formazione con l'avanzamento del pallone (x0,62 in x, x0,28 in y) per ENTRAMBE le squadre; sopra
   ci sono già il pressing (che tira i due difendenti più vicini) e lo scorrimento di linea del renderer.
   Tre compressioni che si sommano possono diventare un grappolo che ruota.
   Si misura da una SOLA sorgente (le mesh, cioè quello che l'utente vede): distanza dei ventidue dal
   pallone e ampiezza della squadra in campo. Braccio rosso `__CPM_NO553` = formazione a slot fissi. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const PARTITE = +(process.env.CPM_PARTITE || 3);
const ROSSO = !!process.env.CPM_ROSSO;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const giri = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript((r) => {
    window.__CPM_GLB = false; if (r) window.__CPM_NO553 = 1;
    window.__CPM_SPR = [];
    setInterval(() => { try {
      const s = window.__CPM_STATE && window.__CPM_STATE(); if (!s || s.phase !== 'playing') return;
      const S = window.__CPM_SPR, ult = S[S.length - 1]; if (ult && ult.c === s.clock) return;
      const p = (s.players || []).filter(q => q && q.team !== 'ref' && !q.gk).concat(s.hero ? [s.hero] : []);
      if (p.length < 15) return;
      const bx = s.ball.x, by = s.ball.y;
      const d = p.map(q => Math.hypot(q.x - bx, q.y - by)).sort((a, c) => a - c);
      const xs = p.map(q => q.x), ys = p.map(q => q.y);
      const sd = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / a.length); };
      S.push({ c: s.clock, med: d[Math.floor(d.length / 2)], vicini: d.filter(v => v <= 12).length, ampX: sd(xs), ampY: sd(ys), n: p.length });
    } catch (e) {} }, 150);
  }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Spr' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 9100 + i * 19);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  giri.push(await page.evaluate(() => window.__CPM_SPR || []));
  await page.close();
}
srv.close(); await b.close();
const S = giri.flat();
if (S.length < 40) { console.log('campione insufficiente:', S.length); process.exit(1); }
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.log(`campioni: ${S.length} minuti di gioco · ${giri.length} partite (${giri.map(g => g.length).join(', ')})`);
console.log(`  distanza MEDIANA dei ventidue dal pallone : ${med(S.map(q => q.med)).toFixed(1)}u      (una squadra schierata: ~25-32u)`);
console.log(`  uomini entro 12u dal pallone              : ${med(S.map(q => q.vicini)).toFixed(1)} su ${S[0].n}   (in una partita vera 2-5)`);
console.log(`  ampiezza della squadra in LUNGHEZZA (sd x) : ${med(S.map(q => q.ampX)).toFixed(1)}u      (schieramento reale ~18-24u)`);
console.log(`  ampiezza della squadra in LARGHEZZA (sd y) : ${med(S.map(q => q.ampY)).toFixed(1)}u      (schieramento reale ~18-24u)`);
