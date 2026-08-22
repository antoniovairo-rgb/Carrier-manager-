#!/usr/bin/env node
/* GUARDIANO — L'HIGHLIGHT NASCE DALLA CRONACA (7.545.0).
   Direttiva PO: «l'highlight non deve partire perché viene rilevato un evento dell'eroe in modo
   indipendente: deve essere innescato dall'evento di cronaca che lo giustifica — evento reale → cronaca →
   trigger → 3D». Difetto: l'innesco era `nx >= hlTimes[hlIdx]`, una griglia di minuti equidistanti
   costruita al calcio d'inizio. Qui si conta quante scene nascono da un evento di cronaca e quante dalla
   rete di sicurezza. PROVA DEL ROSSO: CPM_ROSSO=1 → __CPM_NO568 (solo tabella oraria, come prima). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 2);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_HLSRC = []; if (r) window.__CPM_NO568 = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Trg' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 6100 + i * 29);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => window.__CPM_HLSRC || []));
  await page.close();
}
srv.close(); await b.close();
const S = tutte.flat();
if (!S.length) { console.log('nessun highlight osservato'); process.exit(1); }
const cron = S.filter(q => q.cron).length;
const quota = cron / S.length;
console.log(`highlight osservati: ${S.length} su ${tutte.length} partite (${tutte.map(t => t.length).join(', ')} per partita)`);
console.log(`  nati da un evento di CRONACA : ${cron}/${S.length} = ${(quota * 100).toFixed(0)}%   (soglia ≥80%)`);
console.log(`  nati dalla rete di sicurezza : ${S.length - cron}/${S.length}`);
const dd = S.filter(q => q.cron).map(q => q.dt).filter(v => v != null);
if (dd.length) console.log(`  minuti fra la riga e la scena: max ${Math.max(...dd)}`);
const perDec = {}; S.filter(q => q.cron && q.dec).forEach(q => { perDec[q.dec] = (perDec[q.dec] || 0) + 1; });
console.log(`  decisioni che hanno innescato: ${Object.entries(perDec).map(([k, v]) => k + ' ×' + v).join(' · ') || '—'}`);
if (ROSSO) {
  if (quota <= 0.05) { console.log('\n🔴 ROSSO CONFERMATO: con la sola tabella oraria nessun highlight nasce dalla cronaca'); process.exit(0); }
  console.log('\n❌ il rosso non si riproduce'); process.exit(1);
}
if (quota < 0.8) { console.log('\n❌ troppi highlight nascono dall\'orologio invece che dalla partita'); process.exit(1); }
console.log('\n✅ la scena nasce dall\'evento che la giustifica');
