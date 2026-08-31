#!/usr/bin/env node
/* [BANCO] UNA COPPA DELLE NAZIONI INTERA, DAL GIRONE ALLA FINALE.
   Collaudo PO: «ho vinto la coppa alla 3a giornata e poi dopo c'e' la finale da giocare, brutto bug!»,
   e poi «mi vuole far rigiocare la finale!». Quel difetto e' passato perche' `career-critical` verifica
   la REGOLA del trofeo (7.686) e che una giornata gia' giocata non torni (7.312), ma nessun test faceva
   girare un TORNEO INTERO — tre gare del girone piu' la finale — controllando che alla fine si chiuda.
   E' l'area dove vale la regola zero regressioni ed era proprio li' che il collaudo non arrivava.
   Qui si interroga la regola vera (`__CPM_CAREER.natCupNext`, la stessa che il gioco usa) su tutte le
   strade che un giocatore puo' percorrere. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = { phase: 'career', player: { name: 'NatCup Probe', nation: 'Spagna', avatarId: 7, proStatus: 'pro', season: 10, week: 21, weekLived: true, age: 26, ovr: 82, tutorialDone: true,
  goals: 6, assists: 2, matches: 9, matchHistory: [{ opponent: 'FC Test', rating: 7.2, goals: 1, assists: 0, won: true, drew: false, homeScore: 2, awayScore: 1 }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 8000, expiresAtSeason: 12 } } };
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
/* ⚠️ il testimone `__CPM_CAREER` nasce col componente carriera MONTATO: aprire la sola pagina non basta,
   serve un salvataggio e il «Continua». Stessa apertura della sonda 7.686, che questo banco affianca. */
await page.addInitScript((sv) => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-v3', JSON.stringify(sv)); } catch (_e) {} }, SAVE);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r2 = document.getElementById('root'); return r2 && r2.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.natCupNext), null, { timeout: 30000 });
const V = (res) => ({ won: res === 'W', drew: res === 'D', opponent: 'X', homeScore: res === 'W' ? 2 : 1, awayScore: res === 'W' ? 0 : 1 });
const gira = async (esiti) => page.evaluate(async (es) => {
  let q = { active: true, opponents: ['A', 'B', 'C'], matchIdx: 0, pts: 0, matches: [], done: false, season: 3 };
  const passi = [];
  for (const e of es) {
    const res = { won: e === 'W', drew: e === 'D', opponent: 'X', homeScore: 1, awayScore: 0 };
    const esaurita = ((q.matchIdx || 0) + 1) >= (q.opponents || []).length;
    const fo = (esaurita && !q.isFinal) ? 'FIN' : null;
    q = window.__CPM_CAREER.natCupNext(q, res, fo);
    passi.push({ idx: q.matchIdx, tot: (q.opponents || []).length, pts: q.pts, done: !!q.done, isFinal: !!q.isFinal, trofeo: window.__CPM_CAREER.natCupStake({ ...q, matchIdx: (q.matchIdx || 0) - 1 }) });
  }
  return { q, passi };
}, esiti);

const casi = [
  { n: 'tre vittorie + finale vinta', es: ['W', 'W', 'W', 'W'], attesoDone: true, attesoTot: 4, attesoFinale: true },
  { n: 'tre vittorie + finale persa', es: ['W', 'W', 'W', 'L'], attesoDone: true, attesoTot: 4, attesoFinale: true },
  { n: 'tre vittorie + finale pari', es: ['W', 'W', 'W', 'D'], attesoDone: true, attesoTot: 4, attesoFinale: true },
  { n: 'girone da 4 punti (1V 1P 1X)', es: ['W', 'L', 'D', 'W'], attesoDone: true, attesoTot: 4, attesoFinale: true },
  { n: 'girone da 3 punti: niente finale', es: ['W', 'L', 'L'], attesoDone: true, attesoTot: 3, attesoFinale: false },
  { n: 'girone da 0 punti: niente finale', es: ['L', 'L', 'L'], attesoDone: true, attesoTot: 3, attesoFinale: false },
];
let ko = 0;
console.log('\n=== UNA COPPA DELLE NAZIONI INTERA ===\n');
for (const c of casi) {
  const { q, passi } = await gira(c.es);
  const tot = (q.opponents || []).length;
  const okDone = !!q.done === c.attesoDone, okTot = tot === c.attesoTot, okFin = !!q.isFinal === c.attesoFinale;
  /* la coda non deve allungarsi DUE volte: e' la forma del difetto che il PO descrive */
  const okUnaVolta = tot <= 4;
  /* dopo l'ultima gara il torneo deve essere CHIUSO: se resta aperto, la finale si ripropone */
  const ok = okDone && okTot && okFin && okUnaVolta;
  if (!ok) ko++;
  console.log(`  ${ok ? '✅' : '❌'} ${c.n.padEnd(34)} → gare ${tot} · idx ${q.matchIdx} · pts ${q.pts} · finale ${q.isFinal ? 'si' : 'no'} · chiusa ${q.done ? 'SI' : 'NO'}`);
  if (!ok) console.log(`       atteso: gare ${c.attesoTot}, finale ${c.attesoFinale ? 'si' : 'no'}, chiusa ${c.attesoDone ? 'SI' : 'NO'}  ·  passi: ${JSON.stringify(passi)}`);
}
/* il trofeo si alza una volta sola e solo in finale — incrocio con la regola del 7.686 */
const t = await gira(['W', 'W', 'W', 'W']);
const alzate = t.passi.filter(p => p.trofeo).length;
const okTrofeo = alzate === 1 && t.passi[t.passi.length - 1].trofeo;
if (!okTrofeo) ko++;
console.log(`  ${okTrofeo ? '✅' : '❌'} il trofeo si alza una volta sola, e nell'ultima gara → alzate ${alzate}`);
await b.close(); srv.close();
console.log(ko ? `\n❌ COPPA INTERA: ${ko} casi rotti\n` : '\n✅ PASS — una Coppa intera si chiude, la coda non si allunga due volte, il trofeo si alza solo in finale.\n');
process.exit(ko ? 1 : 0);
