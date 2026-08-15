#!/usr/bin/env node
/* GUARDIANO — «PARTITA GIA' GIOCATA E VINTA! GRAVE!» (finale di Coppa Nazionale riproposta).

   Il registro delle giornate committate (`playedmd-registry`, 7.418) protegge il CAMPIONATO. La coppa
   ha un calendario suo, voci `type:"cup"` con `matchday` fisso 990, e un blocco di migrazione che
   RICREA la voce del turno corrente ogni volta che non ne trova una da giocare — senza mai chiedersi
   se quel turno sia gia' stato giocato. Il turno gia' vinto sta scritto in `cup.results`: e' quello il
   dato che non veniva letto.

   COSA MISURA. Si carica il salvataggio nello stato «finale giocata e vinta» e si chiede al gioco, coi
   suoi passaggi (`thisWeekMd`), che partita intende servire. Deve rispondere: nessuna gara di coppa.
   Casi:
     (A) finale vinta, stato coerente (round 5, champion) ⇒ niente coppa servita
     (B) finale vinta ma lo stato NON e' avanzato (round 4, champion falso: la forma in cui il difetto
         si manifesta) ⇒ niente coppa servita, perche' il risultato del turno 4 e' gia' in `results`
     (C) SENSIBILITA': semifinale vinta, finale ancora da giocare ⇒ la coppa DEVE essere servita
         (senza questo caso un guardiano che non serve mai niente sarebbe verde per inerzia)

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node cup-final-replay-test.mjs                         */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const CLUB = { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 60, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' };
const res = (r, name, won) => ({ round: r, name, opponent: 'FC Avversario ' + r, homeScore: won ? 2 : 0, awayScore: won ? 1 : 1, won, penalties: false });
const mk = (cup, cal, week) => ({ phase: 'career', player: {
  name: 'Probe Coppa', nation: 'Italia', avatarId: 1, proStatus: 'pro', season: 5, week: (week || 36), age: 25, ovr: 80,
  campDone: true, presidentModalSeason: 5, jerseyNumSeason: 5, drawSeen: 5, mercatoSeen: 5, presentSeason: 5, tutorialDone: true,
  seasonPledge: { season: 5, tone: 'equilibrato' }, club: CLUB,
  stats: { 'velocità': 80, tecnica: 80, fisico: 78, 'mentalità': 80, tiro: 81, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 80, morale: 85, fatigue: 20, coachTrust: 70, popularity: 60, value: 20, bankBalance: 90000,
  history: [{ season: 4, club: 'FC Salernum', clubId: 'sal', goals: 12, assists: 5, matches: 32, ovr: 78, league: 'Lega A' }],
  matchHistory: [], contract: { duration: 3, wage: 30000, expiresAtSeason: 8 }, cup, calendar: cal } });

const CAL = (playedFinal) => [
  { matchday: 991, week: 9, opponentId: 'x1', opponentName: 'FC Avversario 1', isHome: true, played: true, result: 'W', type: 'cup', competition: 'Coppa Nazionale', cupRound: 1, cupRoundName: 'Ottavi di Finale' },
  { matchday: 992, week: 19, opponentId: 'x2', opponentName: 'FC Avversario 2', isHome: true, played: true, result: 'W', type: 'cup', competition: 'Coppa Nazionale', cupRound: 2, cupRoundName: 'Quarti di Finale' },
  { matchday: 993, week: 28, opponentId: 'x3', opponentName: 'FC Avversario 3', isHome: true, played: true, result: 'W', type: 'cup', competition: 'Coppa Nazionale', cupRound: 3, cupRoundName: 'Semifinale' },
  ...(playedFinal ? [{ matchday: 994, week: 35, opponentId: 'x4', opponentName: 'FC Avversario 4', isHome: true, played: true, result: 'W', type: 'cup', competition: 'Coppa Nazionale', cupRound: 4, cupRoundName: 'FINALE' }] : []),
];
const RES3 = [res(1, 'Ottavi di Finale', true), res(2, 'Quarti di Finale', true), res(3, 'Semifinale', true)];
const RES4 = [...RES3, res(4, 'FINALE', true)];
const BR = ['sal', 'x1', 'x2', 'x3', 'x4'];

async function servita(save) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(c => { window.__CPM_GLB = false; if (c.no) window.__CPM_NO473 = 1; localStorage.setItem('cpm-v3', JSON.stringify(c.sv)); }, { sv: save, no: !!process.env.CPM_NO473 });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1600);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await sleep(1400);
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.thisWeekMd), { timeout: 30000 });
  const md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
  const cal = await page.evaluate(() => { try { const sv = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); return (sv.player.calendar || []).filter(m => m.type === 'cup').map(m => ({ r: m.cupRound, w: m.week, p: !!m.played })); } catch (e) { return null; } });
  await page.close();
  return { md, cal };
}

const guasti = [];
const A = await servita(mk({ active: true, round: 5, champion: true, eliminated: false, results: RES4, bracket: BR, winnerId: 'sal' }, CAL(true)));
const B = await servita(mk({ active: true, round: 4, champion: false, eliminated: false, results: RES4, bracket: BR }, CAL(true)));
const C = await servita(mk({ active: true, round: 4, champion: false, eliminated: false, results: RES3, bracket: BR },
  [...CAL(false), { matchday: 994, week: 35, opponentId: 'x4', opponentName: 'FC Avversario 4', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 4, cupRoundName: 'FINALE' }], 35));
await b.close(); srv.close();

const eCoppa = (r) => !!(r.md && r.md.type === 'cup');
console.log(`(A) finale vinta, stato coerente   → servita: ${JSON.stringify(A.md)} · voci coppa: ${JSON.stringify(A.cal)}`);
console.log(`(B) finale vinta, stato NON avanzato→ servita: ${JSON.stringify(B.md)} · voci coppa: ${JSON.stringify(B.cal)}`);
console.log(`(C) finale ANCORA DA GIOCARE       → servita: ${JSON.stringify(C.md)} · voci coppa: ${JSON.stringify(C.cal)}`);
if (eCoppa(A)) guasti.push('(A) con la coppa gia' + "'" + ' vinta il gioco serve ancora una gara di coppa');
if (eCoppa(B)) guasti.push('(B) la FINALE gia' + "'" + ' giocata e vinta viene riproposta — e' + "'" + ' il difetto del PO');
if ((B.cal || []).some(m => m.r === 4 && !m.p)) guasti.push('(B) e' + "'" + ' stata RICREATA una voce di calendario per la finale gia' + "'" + ' giocata');
if (!eCoppa(C)) guasti.push('(C) la finale ancora da giocare NON viene servita — strumento cieco, il verde non proverebbe nulla');

if (guasti.length) { console.log('\n❌ FAIL'); for (const g of guasti) console.log('  · ' + g); process.exit(1); }
console.log('\n✅ PASS — un turno di coppa gia' + "'" + ' giocato non torna, e quello da giocare arriva');
