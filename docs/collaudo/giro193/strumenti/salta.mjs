/* [giro 193] SALTO DI STAGIONI con lo strumento di prova del progetto (__CPM_CAREER, attivo solo con ?cpmtest=1):
   node salta.mjs <statoIn> <statoOut> <stagioneArrivo>
   Fa avanzare la carriera con gli stessi gestori del gioco (vivi settimana, simula, nuova stagione) senza passare dalle schermate.
   Si ferma appena la stagione d'arrivo comincia, PRIMA dell'apertura. Lo stato che esce e' quindi «costruito», non giocato a mano. */
import { apri, sleep } from './lib193.mjs';
const [sin, sout, arrivo] = process.argv.slice(2);
const H = await apri({ fmt: 'pc', stato: sin, test: true });
await H.page.evaluate(() => { window.__CPM_SIM_NAT = 1; });
try { await H.page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
await H.page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
let it = 0, ultimo = '';
while (it++ < 900) {
  const r = await H.page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); const p = C.snapshot(); return { res, s: p.season, w: p.week, age: p.age, ovr: p.ovr, g: p.goals, m: p.matches, contr: p.contract && p.contract.expiresAtSeason }; });
  if (r.res === 'seasonEnd') { console.log(`fine stagione ${r.s}: eta' ${r.age} OVR ${r.ovr} gol ${r.g} presenze ${r.m} contratto fino a ${r.contr}`);
    if (r.s + 1 >= +arrivo) { /* la nuova stagione la apro e poi mi fermo */ }
    const ok = await H.page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(1000); await H.page.evaluate(() => window.__CPM_CAREER.dismiss());
    const s2 = await H.page.evaluate(() => window.__CPM_CAREER.snapshot().season); console.log('  nuova stagione → ' + s2 + ' (' + ok + ')'); if (s2 >= +arrivo) break; continue; }
  if (String(r.res).startsWith('blocked:')) { await H.page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
  if (String(r.res).startsWith('error:')) { console.log('ERRORE', r); break; }
  const k = r.s + '/' + r.w + '/' + r.res; if (k === ultimo) await sleep(300); ultimo = k; await sleep(120);
}
console.log('STATO', JSON.stringify(await H.stato()), 'passi', it, 'errori', H.errori.slice(0, 3));
await sleep(1500); await H.salva(sout); await H.chiudi();
