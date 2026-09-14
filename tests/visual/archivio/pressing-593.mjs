/* [7.593.0 STRUMENTO] QUANTO E' VICINO IL DIFENSORE PIU' VICINO AL PORTATORE.
   COLLAUDO PO, scritto due volte: «non ci sono trame di gioco, passaggi, pressing» e «non c'e' pressing».
   E il guardiano `motion` dice la stessa cosa da mesi, al limite: «nessuno reagisce al portatore in 3/8
   scene con palla in meta' offensiva — soglia 24 m». Ventiquattro metri sono un quarto di campo: nel
   calcio vero il difensore piu' vicino a chi ha la palla sta a due-cinque metri. Un guardiano che si
   accontenta di 24 m e che comunque fallisce in un terzo delle scene sta dicendo che il pressing non
   esiste — e nessuno l'ha mai misurato a GIOCO VIVO, solo dentro le situations.
   Questa sonda non giudica: misura la distribuzione, dal vivo, con le mesh che l'utente guarda. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const ROSSO = !!process.env.CPM_ROSSO;
const R595 = !!process.env.CPM_ROSSO595;/* [7.593.0] prova del rosso: stesso binario, rimedio spento */
await page.addInitScript(([rosso, r595]) => {
  if (rosso) window.__CPM_NO593 = true;
  if (r595) window.__CPM_NO595 = true;/* [7.595.0] rosso SOLO dell'anticipo: il bersaglio del 7.593 resta */
  window.__CPM_GLB = false; window.__CPM_PR = [];
  setInterval(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players || !st.ball) return;
    const R = window.__CPM_PR; if (R.length > 1500) return;
    const bx = st.ball.x, by = st.ball.y;
    /* il PORTATORE e' chi ha la palla piu' vicina: lo dichiara il gioco stesso (heldBy), e se non lo
       dichiara si prende il piu' vicino fra tutti — eroe compreso. */
    const tutti = st.players.concat(st.hero ? [st.hero] : []);
    let port = null, pd = 1e9;
    for (const p of tutti) { if (!p || p.x == null || p.gk) continue; const d = Math.hypot(p.x - bx, p.y - by); if (d < pd) { pd = d; port = p; } }
    if (!port || pd > 4) return;/* se nessuno ha davvero la palla non c'e' un portatore da pressare */
    let vic = 1e9, vic2 = 1e9, n = 0;
    for (const p of tutti) { if (!p || p.x == null || p.gk || p.team === port.team) continue;
      const d = Math.hypot(p.x - port.x, p.y - port.y); n++;
      if (d < vic) { vic2 = vic; vic = d; } else if (d < vic2) vic2 = d; }
    if (!n) return;
    R.push({ vic: +vic.toFixed(1), vic2: +vic2.toFixed(1), bx: +bx.toFixed(0), team: port.team });
  } catch (_e) {} }, 200);
}, [ROSSO, R595]);
await openMatch(page, port, { skipLoadAll: true, name: 'Pr' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await sleep(90000);
const R = await page.evaluate(() => window.__CPM_PR || []);
await b.close(); srv.close();

console.log('\n=== IL DIFENSORE PIU\' VICINO A CHI HA LA PALLA ===\n');
if (!R.length) { console.log('  ⚠ nessun campione con un portatore riconoscibile: NON GIUDICABILE.\n'); process.exit(1); }
const v = R.map(r => r.vic).sort((a, b2) => a - b2);
const q = (f) => v[Math.min(v.length - 1, Math.floor(v.length * f))];
console.log(`  campioni con un portatore: ${R.length}`);
console.log(`  distanza del piu' vicino · mediana ${q(0.5).toFixed(1)} m · quarto basso ${q(0.25).toFixed(1)} · quarto alto ${q(0.75).toFixed(1)} · min ${v[0].toFixed(1)} · max ${v[v.length - 1].toFixed(1)}`);
const v2 = R.map(r => r.vic2).filter(x => x < 1e8).sort((a, b2) => a - b2);
if (v2.length) console.log(`  distanza del SECONDO piu' vicino · mediana ${v2[Math.floor(v2.length / 2)].toFixed(1)} m`);
console.log('\n  quota di campioni con il piu\' vicino entro:');
for (const s of [3, 5, 8, 12, 16, 24]) {
  const k = v.filter(x => x <= s).length;
  console.log(`    ${String(s).padStart(2)} m : ${(k / v.length * 100).toFixed(0)}%  ${'█'.repeat(Math.round(k / v.length * 40))}`);
}
console.log('\n  (nel calcio vero il piu\' vicino sta a 2-5 m per la gran parte del tempo di possesso.)');
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
