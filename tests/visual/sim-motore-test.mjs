/* [7.999.4] GUARDIANO DEL PASSO 2: LA PARTITA SIMULATA DELL'EROE LA GIOCA IL MOTORE DEL LIVE.
   A · stesso seme ⇒ stessa partita; simulateMatch(...,{motore:true}) = simulaPartitaMotore con lo stesso seme; oggetto risultato
       con le stesse chiavi di prima.
   B · bande su 200 partite a parita' di forza (gol e pareggi) e tempo per partita (headless: informativo, il giudice e' il
       telefono del PO con Opzioni → Strumenti di collaudo → «Misura»).
   C · carriera vera: avanzando le settimane, le partite dell'eroe passano dal motore (registro __CPM_SIM_LOG) senza errori.
   CPM_ROSSO=1 → __CPM_NO_SIMV2: torna il Poisson e il guardiano deve andare ROSSO. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(r => {
  window.__CPM_GLB = false; if (r) window.__CPM_NO_SIMV2 = 1;
  const save = { phase: 'career', player: { name: 'Sim Motore', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
    form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1000);
const fails = [];

/* A + B */
const AB = await page.evaluate(() => {
  const club = { id: 'a', n: 'A', p: 70 }, opp = { id: 'b', n: 'B', p: 70 };
  const r1 = window.__CPM_simMatch(club, opp, 70, true, 12345, {}, { motore: true });
  const r2 = window.__CPM_simMatch(club, opp, 70, true, 12345, {}, { motore: true });
  const m = window.__CPM_SIM_MOTORE({ seed: (12345 >>> 0) ^ 0x5a17, forzaH: 70, forzaA: 70, stadio: 'home', ovr: 70 });
  const vecchio = window.__CPM_simMatch(club, opp, 70, true, 12345);
  const N = 200; let g = 0, x = 0, T = [];
  for (let k = 0; k < N; k++) { const t0 = performance.now(); const r = window.__CPM_simMatch(club, opp, 70, k % 2 === 0, (7000 + k * 41) >>> 0, {}, { motore: true }); T.push(performance.now() - t0); g += r.homeScore + r.awayScore; x += r.homeScore === r.awayScore ? 1 : 0; }
  T.sort((a, b) => a - b);
  return { det: r1.homeScore === r2.homeScore && r1.awayScore === r2.awayScore, motore: r1.homeScore === m.home && r1.awayScore === m.away,
    chiavi: Object.keys(r1).sort().join(','), chiaviV: Object.keys(vecchio).sort().join(','), gol: g / N, pari: 100 * x / N, msMed: T[N >> 1], msMax: T[N - 1] };
});
console.log(`A · stesso seme stessa partita: ${AB.det} · partita dal motore: ${AB.motore} · chiavi invariate: ${AB.chiavi === AB.chiaviV}`);
console.log(`B · 200 partite pari forza: gol ${AB.gol.toFixed(2)} · pareggi ${AB.pari.toFixed(0)}% · ${AB.msMed.toFixed(0)} ms mediana (max ${AB.msMax.toFixed(0)}) headless`);
if (!AB.det) fails.push('A: lo stesso seme non da\' la stessa partita');
if (!AB.motore) fails.push('A: la partita dell\'eroe simulata non viene dal motore');
if (AB.chiavi !== AB.chiaviV) fails.push(`A: l'oggetto risultato ha cambiato forma (${AB.chiavi} vs ${AB.chiaviV})`);
/* bande: le stesse del banco del prototipo (4.337 partite vere, football-data.co.uk) */
if (!ROSSO && (AB.gol < 2.3 || AB.gol > 3.5)) fails.push(`B: gol a partita ${AB.gol.toFixed(2)} fuori da 2,3-3,5`);
if (!ROSSO && (AB.pari < 18 || AB.pari > 34)) fails.push(`B: pareggi ${AB.pari.toFixed(0)}% fuori da 18-34%`);

/* C — carriera vera */
const C = await page.evaluate(async () => {
  window.__CPM_SIM_LOG = []; const W = window.__CPM_CAREER; const w0 = W.get().week; let passi = 0;
  const esiti = [];
  for (let k = 0; k < 40 && (window.__CPM_SIM_LOG || []).length < 3; k++) {
    const W1 = window.__CPM_CAREER;/* l'oggetto si ricrea a ogni render: riletto a ogni passo */
    const res = W1.step(); W1.dismiss(); passi++; esiti.push(res);
    if (String(res).startsWith('error:')) return { err: res };
    if (String(res).startsWith('blocked:')) W1.clearTournaments();
    await new Promise(r => setTimeout(r, 250)); }
  const p = window.__CPM_CAREER.get(); return { passi, esiti: esiti.slice(0, 12).join(','), settimane: p.week - w0, sim: (window.__CPM_SIM_LOG || []).length, ms: (window.__CPM_SIM_LOG || []).slice(0, 6) };
});
console.log(`C · carriera: ${C.passi} passi (${C.esiti}), settimane +${C.settimane}, partite simulate dal motore ${C.sim} (ms ${JSON.stringify(C.ms)})`);
if (C.err) fails.push('C: errore avanzando la carriera: ' + C.err);
else if (C.sim === 0) fails.push('C: nessuna partita dell\'eroe simulata dal motore avanzando la carriera');
if (errors.length) fails.push('errori di pagina: ' + errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
if (ROSSO) { const ok = fails.some(f => f.startsWith('A: la partita')) && fails.some(f => f.startsWith('C: nessuna'));
  console.log(ok ? '✅ ROSSO come atteso: senza il passo 2 la simulazione torna al Poisson' : '❌ il rosso non riproduce il vecchio comportamento\n  ' + fails.join('\n  ')); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL sim-motore\n  ' + fails.join('\n  ') : '✅ PASS sim-motore'); process.exit(fails.length ? 1 : 0);
