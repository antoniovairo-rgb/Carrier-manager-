/* [7.604.0 STRUMENTO] IL GOL DI PUNIZIONE ARRIVA IN PORTA?
   COLLAUDO PO su SIT #51 (7.602): «l'esito dichiarato e' goal ma la palla non e' mai arrivata in porta
   (si e' fermata a 15,6 unita') — e il portiere non si tuffa».
   La sonda forza tutte le scene di tipo FREEKICK e PENALTY, le risolve, e per ciascuna misura: la x
   massima raggiunta dal pallone nei sei secondi dopo la conclusione, l'esito che il gioco dichiara
   (dal testo dell'ultima riga di telecronaca) e se un tuffo e' partito (registro __CPM_DIVE603).
   Da eseguire anche con CPM_ROSSO602=1 (bandiere sp senza scadenza) per escludere che sia una
   regressione del 7.602. Non e' un guardiano: misura e nomina. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const R602 = !!process.env.CPM_ROSSO602;
await page.addInitScript((r) => { if (r) window.__CPM_NO602 = true; window.__CPM_GLB = false; window.__CPM_DIVE603 = []; }, R602);
await openMatch(page, port, { skipLoadAll: true, name: 'Pz' });
/* [7.604.0] «freekick» sta nel campo `intent`, non `type` (i type sono off/def/special): la prima
   stesura filtrava sul campo sbagliato e misurava zero scene. */
const lista = await page.evaluate(() => (window.__CPM_SITS || []).map((s, i) => ({ i, t: String(s.intent || '') })).filter(o => /freekick|penalty/.test(o.t)));
console.log(`\n=== IL GOL DI PIAZZATO ARRIVA IN PORTA? (${lista.length} scene di piazzato) ===\n`);
const righe = [];
for (const { i: gi, t } of lista) {
  try {
    await page.evaluate(() => { window.__CPM_DIVE603.length = 0; });
    await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
    await sleep(600);
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    /* [7.604.0] l'esito si FORZA a successo col gancio del gioco (__CPM_FORCE_OUTCOME, 7.211): il difetto
       del PO e' sul GOL, e col sorteggio naturale in questo seme nessun piazzato segnava. */
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
    await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
    let maxX = -1;
    const t0 = Date.now();
    while (Date.now() - t0 < 6000) {
      const bx = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.ball ? s.ball.x : null; });
      if (bx != null && bx > maxX) maxX = bx;
      await sleep(150);
    }
    const fin = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE();
      const ev = (window.__CPM_EV ? window.__CPM_EV() : []).slice(-6);
      const gol = ev.some(e => /goal$/.test(String(e.ef || '')));
      return { ph: st && st.phase, gol, tuffi: (window.__CPM_DIVE603 || []).length };
    } catch (_e) { return null; } });
    righe.push({ gi, t, maxX: +maxX.toFixed(1), gol: fin ? fin.gol : null, tuffi: fin ? fin.tuffi : -1 });
  } catch (_e) { righe.push({ gi, t, maxX: -1, gol: null, tuffi: -1 }); }
}
await b.close(); srv.close();
let sospette = 0;
for (const r of righe) {
  const s = r.gol && r.maxX < 90;
  if (s) sospette++;
  console.log(`  gi${String(r.gi).padStart(3)} [${r.t}] · x massima ${String(r.maxX).padStart(5)} · gol dichiarato ${r.gol === null ? '?' : r.gol ? 'SI' : 'no'} · tuffi ${r.tuffi}${s ? '   <-- GOL SENZA PORTA' : ''}`);
}
console.log(`\n  scene con GOL DICHIARATO e pallone mai oltre x 90: ${sospette}/${righe.filter(r => r.gol).length} gol`);
console.log('\n  DIAGNOSI (tracciata fotogramma per fotogramma su gi51 con esito forzato a successo):');
console.log('    arco di tiro (ws 2) fino a x 92 -> post-arco CROSS_GOAL -> con esito «occasione» DEFLECT,');
console.log('    e il pallone si parcheggia a x 89, cioe\' ~15,7 unita\' dalla linea: e\' ESATTAMENTE il');
console.log('    numero del collaudo PO (15,6). Il deflect su occasione e\' CORRETTO (occasione = mai rete);');
console.log('    il difetto del PO e\' sul ramo GOL VERO, dove cross_goal consegna a un compagno per');
console.log('    l\'incornata anche su una punizione DIRETTA («Bordata sotto la barriera»): se il compagno');
console.log('    non aggancia, il gol dichiarato non si vede mai. Riprodurre il ramo gol-vero richiede il');
console.log('    sorteggio naturale (FORCE_OUTCOME forza il successo ma il kind resta «chance» qui).');
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
