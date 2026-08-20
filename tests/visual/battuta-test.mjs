#!/usr/bin/env node
/* GUARDIANO — IL PIAZZATO SI BATTE (7.538.0).
   Censendo le scene in cui il pallone non viaggia (<3u dall'apertura all'esito) sono emersi quattro calci
   d'angolo: gi6, gi50, gi76, gi77. La palla NASCE giusta — `hlBallSpot` la mette sulla bandierina — ma il
   ramo che la piazza NON arma la consegna d'apertura (che vive nell'`else if` accanto, riservato alle
   ricezioni e al portiere): nessuno batteva il corner, la palla restava sulla bandierina e due volte su
   quattro finiva in rete da lì. Qui si pretende che il pallone PARTA dalla bandierina e ARRIVI in area.
   ⚠️ Serve `__CPM_FORCE_INTRO`: la forzatura salta `hl_intro`, che è la fase in cui la battuta si arma —
   senza, la sonda misurerebbe un mondo in cui quel codice non gira mai (trappola già pagata nel 7.353).
   PROVA DEL ROSSO: CPM_ROSSO=1 → __CPM_NO554 (piazzato non battuto): il viaggio torna sotto i 3u. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO;
const GI = [6, 50, 76, 77];
const MIN_U = +(process.env.CPM_BAT_MIN || 15);   /* verde misurato 30-45u · rosso 2,1u */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((r) => {
  window.__CPM_PRESENT = 1; window.__CPM_GLB = false;
  window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 1600; window.__CPM_BAT554 = [];
  if (r) window.__CPM_NO554 = 1;
}, ROSSO);
await openMatch(page, port, { name: 'Bat' });
await sleep(500);
const righe = [];
for (const gi of GI) {
  await page.evaluate(() => { window.__CPM_BAT554.length = 0; });
  await page.evaluate(i => window.__CPM_FORCE_SIT(i, true), gi);
  /* si misura il PERCORSO, non gli estremi: fra il primo e l'ultimo campione la palla puo' tornare
     indietro (la conclusione la rilancia) e due estremi vicini nasconderebbero un viaggio vero. */
  const tr = [];
  for (let k = 0; k < 22; k++) { const q = await page.evaluate(() => window.__CPM_BALL()); if (q) tr.push(q); await sleep(140); }
  const armata = await page.evaluate(() => (window.__CPM_BAT554 || []).length);
  const bandiera = await page.evaluate(() => (window.__CPM_BAT554 || [])[0] || null);
  let d = 0; for (let k = 1; k < tr.length; k++) d += Math.hypot(tr[k].x - tr[k - 1].x, tr[k].y - tr[k - 1].y);
  righe.push({ gi, d, armata });
  console.log(`gi${String(gi).padStart(3)} · bandierina ${bandiera ? '(' + bandiera.fx + ',' + bandiera.fy + ')→(' + bandiera.tx + ',' + bandiera.ty + ')' : '—'} · percorso della palla ${d.toFixed(1)}u · battuta armata: ${armata}`);
}
await b.close(); srv.close();
const sotto = righe.filter(r => r.d < MIN_U);
if (ROSSO) {
  if (sotto.length >= 3) { console.log(`\n🔴 ROSSO CONFERMATO: ${sotto.length}/4 piazzati non battuti (viaggio < ${MIN_U}u)`); process.exit(0); }
  console.log(`\n❌ il rosso NON si riproduce: solo ${sotto.length}/4 sotto soglia — il guardiano non dimostra niente`); process.exit(1);
}
if (sotto.length) { console.log(`\n❌ ${sotto.length}/4 piazzati NON battuti: ${sotto.map(r => 'gi' + r.gi + ' (' + r.d.toFixed(1) + 'u)').join(', ')}`); process.exit(1); }
console.log(`\n✅ tutti e quattro i piazzati vengono battuti (viaggio ≥ ${MIN_U}u)`);
