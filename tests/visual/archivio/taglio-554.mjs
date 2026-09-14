#!/usr/bin/env node
/* DIAGNOSI — «LA SCENA FINISCE PRIMA DEL PALLONE».
   Sospetto nato due volte nella stessa giornata: il gesto del portiere che si spegne col volo al 72-82%
   (7.552) e un provino della rovesciata caduto dentro lo stacco nero. In entrambi i casi il colpevole
   candidato e' lo STACCO DI SCENA (r.~15466 azzera la reazione su `_hlSnap`), non il gesto.
   Qui si guarda ogni taglio insieme al pallone: quanti arrivano con una conclusione ANCORA IN VOLO,
   da quale sorgente (fase · chiave · staging) e a che punto del volo.
     CPM_CHROME=... node taglio-554.mjs [CPM_PARTITE=2]                                                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const PARTITE = +(process.env.CPM_PARTITE || 2);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutti = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CUT456 = []; });
  await openMatch(page, port, { skipLoadAll: true, name: 'T' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 8100 + i * 41);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutti.push(...await page.evaluate(() => (window.__CPM_CUT456 || []).slice()));
  await page.close();
}
srv.close(); await b.close();

console.log(`\n=== ${tutti.length} tagli di scena su ${PARTITE} partite ===\n`);
const vivi = tutti.filter(c => c.arc);
const perSrc = {};
for (const c of tutti) { const s = c.src || '?'; (perSrc[s] = perSrc[s] || { n: 0, vivi: 0, us: [] }); perSrc[s].n++; if (c.arc) { perSrc[s].vivi++; perSrc[s].us.push(c.arcU); } }
for (const [s, v] of Object.entries(perSrc)) {
  const med = v.us.length ? v.us.slice().sort((a, b) => a - b)[Math.floor(v.us.length / 2)] : null;
  console.log(`  ${s.padEnd(9)} ${String(v.n).padStart(3)} tagli · ${String(v.vivi).padStart(3)} con la palla ANCORA IN VOLO${med != null ? ` · volo mediano al ${(med * 100).toFixed(0)}%` : ''}`);
}
const conGesto = vivi.filter(c => c.gk);
console.log(`\n  tagli con una conclusione ancora in volo : ${vivi.length}/${tutti.length}  (${(100 * vivi.length / Math.max(1, tutti.length)).toFixed(0)}%)`);
console.log(`  ...e con un gesto di reazione in corso   : ${conGesto.length}${conGesto.length ? '  (' + conGesto.map(c => `${c.gk}@${(c.arcU * 100).toFixed(0)}%`).join(', ') + ')' : ''}`);
const primi = vivi.filter(c => c.arcU != null && c.arcU < 0.9);
console.log(`  ...e col volo non ancora finito (<90%)   : ${primi.length}${primi.length ? '  → ' + primi.slice(0, 8).map(c => `${c.src}@${(c.arcU * 100).toFixed(0)}%`).join(', ') : ''}`);
console.log(`\n  ritardo dello stacco nero (dt), mediano  : ${(() => { const d = tutti.map(c => c.dt).filter(x => x >= 0).sort((a, b) => a - b); return d.length ? d[Math.floor(d.length / 2)] + ' ms' : '-'; })()}   (oltre 360-560 ms il taglio si VEDE, regola 7.456)`);
console.log('\n⚠️ misura su partita vera in autoplay: dice quanto spesso capita, non cosa fare.');
