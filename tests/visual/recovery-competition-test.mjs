#!/usr/bin/env node
/* [P0 #1 — audit forense] IL RECUPERO DOPO UN RIAVVIO NON DEVE CONFONDERE LE COMPETIZIONI.
 *
 * ROOT CAUSE (confermata dal critico avversariale): il recovery del sidecar cerca la partita nel
 * calendario per AVVERSARIO e SEDE, senza mai guardare la competizione. L'avversario di Coppa viene
 * sorteggiato DALLA STESSA LEGA e il turno R16 e' cablato «in casa»: per costruzione esiste sempre una
 * voce di CAMPIONATO in casa contro quel club. Il risultato di Coppa veniva quindi committato come
 * giornata di campionato. Aggrava: `matchTypeRef` dopo il reboot vale "league" (l'unico writer "cup" e'
 * startMatch, che dopo il riavvio non e' mai passato), quindi anche il ramo di commit e' quello sbagliato.
 *
 * Questo guardiano vive nel GATE (npm run ci). Copre i casi A-G del piano di messa in sicurezza:
 *   A) coppa + lega contro lo STESSO club, stessa sede → si recupera la COPPA
 *   B) la classifica di campionato non cambia
 *   C) la voce di campionato resta NON giocata
 *   D) il risultato finisce nella competizione giusta (voce di coppa marcata + turno avanzato)
 *   E) il tipo sopravvive al reload (misurato dall'effetto: la coppa progredisce, cosa che dipende da
 *      matchTypeRef nel commit)
 *   F) R16 in casa (lo scenario strutturalmente garantito)
 *   G) avversario diverso: il recupero di una gara di LEGA resta corretto (nessuna regressione)
 *
 * ATTENZIONE (lezione dal 7.445): un guardiano puo' essere verde senza proteggere nulla. Qui gli assert
 * guardano lo STATO PERSISTITO riletto da localStorage, non la memoria, e ogni caso verifica sia cio'
 * che DEVE cambiare sia cio' che NON deve cambiare.
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = [];

const CLUB = { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' };
/* 'mall' (FC Balear) e' un club della STESSA lega: e' il caso reale del sorteggio di Coppa. */
const AVV = { id: 'mall', n: 'FC Balear' };
const ALTRO = { id: 'zgz', n: 'FC Maño' };

const mkStandings = () => ['mad', 'atm', 'sev', 'bar', 'bet', 'rsoc', 'val', 'gir', 'vill', 'cel', 'ath', 'mall', 'las', 'ray', 'osa', 'dep', 'zgz', 'mal']
  .map((id, i) => ({ id, n: 'Club ' + id, pts: 40 - i, played: 17, w: 12, d: 4, l: 1, gf: 40, ga: 20 }));

const mkSave = (cal, extra = {}) => ({ phase: 'career', player: {
  name: 'Probe Recovery', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 20, age: 25, ovr: 82,
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4,
  tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: CLUB, stats: { 'velocità': 82, tecnica: 82, fisico: 82, 'mentalità': 82, tiro: 82, passaggio: 82, dribbling: 82, posizionamento: 82 },
  form: 72, morale: 72, fatigue: 12, popularity: 50, value: 25, bankBalance: 90000,
  goals: 9, assists: 4, matches: 17, matchHistory: [], standings: mkStandings(),
  /* `active:true` e' obbligatorio: la migrazione RIMUOVE le voci di coppa non giocate quando la coppa
     non risulta attiva (riga ~25441) — comportamento corretto del gioco, ma senza questo campo lo
     scenario si autodistrugge prima ancora del recovery e il guardiano misurerebbe il nulla. */
  cup: { active: true, round: 1, champion: false, eliminated: false },
  contract: { duration: 3, wage: 30000, expiresAtSeason: 8 }, calendar: cal, ...extra } });

/* sidecar del fischio finale: e' esattamente il formato scritto da _goEndOrCeremony (v:1) */
const mkSidecar = (p, { oid, on, ih, context, gol = 1 }) => ({
  v: 1, n: p.name, s: p.season, w: p.week, oid, on, ih,
  result: { goals: gol, assists: 0, minutesPlayed: 90, matchStatus: 'starter', homeScore: 2, awayScore: 0,
    won: true, drew: false, wasBehind: false, opponent: on, oppAbbr: 'OPP', oppCol: '#888888', rating: 7.4,
    context, isHome: ih, attendance: 30000, shots: 9, oppShots: 3, fouls: 2, corners: 5, possession: 56,
    redCard: false, yellowCards: 0, sentOff: false, heroFouls: 0, assistLinks: { given: [], received: [] },
    homeRoster: null, heroRoster: null, oppTactic: null, scoutReport: null } });

async function apriEAspettaRecovery(save, sidecar, rompi = false) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => guasti.push('pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(cfg => {
    window.__CPM_GLB = false;
    if (cfg.rompi) window.__CPM_NO_P0_1 = 1;   // ripristina la logica difettosa (prova del rosso)
    localStorage.setItem('cpm-v3', JSON.stringify(cfg.sv));
    localStorage.setItem('cpm-pending-mr', JSON.stringify(cfg.mr));
  }, { sv: save, mr: sidecar, rompi });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(5000);           // recovery: dispatch a mount+1200ms, poi autosave (debounce 600ms)
  return page;
}
const letturaSave = (page) => page.evaluate(() => {
  try {
    const p = JSON.parse(localStorage.getItem('cpm-v3')).player;
    const v = (md) => { const e = (p.calendar || []).find(x => x.matchday === md); return e ? { played: !!e.played, type: e.type || 'league', week: e.week } : null; };
    const mia = (p.standings || []).find(r => (r.id || r.clubId) === 'mad');
    return { lega: v(18), coppa: v(990), cupRound: p.cup && p.cup.round, miaPlayed: mia && (mia.played ?? mia.p),
      miaPts: mia && mia.pts, storico: (p.matchHistory || []).length, matches: p.matches, sidecar: !!localStorage.getItem('cpm-pending-mr') };
  } catch (e) { return null; }
});

/* ─────────── PROVA DEL ROSSO: con la vecchia logica il difetto DEVE riprodursi ───────────
   Senza questa fase il verde non dimostrerebbe nulla: e' la lezione del guardiano 7.445, che poteva
   restare verde pur non verificando la condizione che diceva di proteggere. */
{
  const cal = [
    { matchday: 18, week: 20, opponentId: AVV.id, opponentName: AVV.n, isHome: true, played: false },
    { matchday: 990, week: 20, opponentId: AVV.id, opponentName: AVV.n, isHome: true, played: false, type: 'cup', cupRoundName: 'Sedicesimi' },
  ];
  const save = mkSave(cal);
  const mr = mkSidecar(save.player, { oid: AVV.id, on: AVV.n, ih: true, context: 'cup' });
  const page = await apriEAspettaRecovery(save, mr, true);
  const s = await letturaSave(page);
  await page.close();
  const riprodotto = !!(s && s.lega && s.lega.played);
  console.log(`ROSSO) con __CPM_NO_P0_1 (logica pre-fix): voce LEGA ${riprodotto ? 'GIOCATA — difetto riprodotto ✓' : 'non giocata'} · classifica played ${s && s.miaPlayed}`);
  if (!riprodotto) guasti.push('(ROSSO) la logica difettosa NON riproduce il difetto: il guardiano non dimostra di proteggere nulla');
}

/* ─────────── CASO A-F: COPPA e LEGA contro lo STESSO club, entrambe in casa ─────────── */
{
  const cal = [
    { matchday: 18, week: 20, opponentId: AVV.id, opponentName: AVV.n, isHome: true, played: false },                    // LEGA
    { matchday: 990, week: 20, opponentId: AVV.id, opponentName: AVV.n, isHome: true, played: false, type: 'cup', cupRoundName: 'Sedicesimi' }, // COPPA R16 in casa
  ];
  const save = mkSave(cal);
  const mr = mkSidecar(save.player, { oid: AVV.id, on: AVV.n, ih: true, context: 'cup' });
  const page = await apriEAspettaRecovery(save, mr);
  const s = await letturaSave(page);
  await page.close();
  console.log(`A-F) recupero COPPA vs ${AVV.n} (lega stessa sede presente):`);
  console.log(`     voce COPPA  → ${s && s.coppa ? (s.coppa.played ? 'GIOCATA ✓' : 'non giocata') : '—'}`);
  console.log(`     voce LEGA   → ${s && s.lega ? (s.lega.played ? 'GIOCATA ✗' : 'non giocata ✓') : '—'}`);
  console.log(`     turno coppa ${s && s.cupRound} · classifica played ${s && s.miaPlayed} pts ${s && s.miaPts} · storico ${s && s.storico}`);
  if (!s) guasti.push('(A) save illeggibile dopo il recupero');
  else {
    if (!s.coppa || !s.coppa.played) guasti.push('(A/D) il risultato di COPPA non e\' stato committato sulla voce di coppa');
    if (s.lega && s.lega.played) guasti.push('(C) LA VOCE DI CAMPIONATO E\' STATA MARCATA GIOCATA col risultato della Coppa — e\' il P0');
    if (s.miaPlayed !== 17) guasti.push(`(B) la classifica di campionato e' cambiata: played ${s.miaPlayed} (atteso 17)`);
    if (s.miaPts !== 40) guasti.push(`(B) i punti in classifica sono cambiati: ${s.miaPts} (attesi 40)`);
    if (!(s.cupRound > 1)) guasti.push(`(E) il turno di Coppa non e' avanzato (${s.cupRound}): il commit non ha riconosciuto la competizione dopo il reload`);
    if (s.storico !== 1) guasti.push(`(D) storico con ${s.storico} gare invece di 1`);
  }
}

/* ─────────── CASO G: recupero di una gara di LEGA — deve continuare a funzionare ─────────── */
{
  const cal = [
    { matchday: 18, week: 20, opponentId: ALTRO.id, opponentName: ALTRO.n, isHome: true, played: false },                  // LEGA
    { matchday: 990, week: 20, opponentId: AVV.id, opponentName: AVV.n, isHome: true, played: false, type: 'cup' },        // COPPA altro avversario
  ];
  const save = mkSave(cal);
  const mr = mkSidecar(save.player, { oid: ALTRO.id, on: ALTRO.n, ih: true, context: 'career' });
  const page = await apriEAspettaRecovery(save, mr);
  const s = await letturaSave(page);
  await page.close();
  console.log(`\nG) recupero LEGA vs ${ALTRO.n} (nessuna regressione):`);
  console.log(`     voce LEGA  → ${s && s.lega ? (s.lega.played ? 'GIOCATA ✓' : 'non giocata ✗') : '—'}`);
  console.log(`     voce COPPA → ${s && s.coppa ? (s.coppa.played ? 'GIOCATA ✗' : 'non giocata ✓') : '—'} · storico ${s && s.storico}`);
  if (!s) guasti.push('(G) save illeggibile');
  else {
    if (!s.lega || !s.lega.played) guasti.push('(G) REGRESSIONE: il recupero di una gara di CAMPIONATO non funziona piu\'');
    if (s.coppa && s.coppa.played) guasti.push('(G) il recupero di lega ha marcato la voce di COPPA');
    if (s.storico !== 1) guasti.push(`(G) storico con ${s.storico} gare invece di 1`);
  }
}

await b.close(); srv.close();
console.log(guasti.length ? `\n❌ FAIL — ${guasti.length}\n` + guasti.map(g => '  ✗ ' + g).join('\n')
  : '\n✅ RECOVERY PER COMPETIZIONE OK (la Coppa si committa in Coppa · il campionato resta intatto · nessuna regressione sul recupero di lega)');
process.exit(guasti.length ? 1 : 0);
