#!/usr/bin/env node
/* [7.999.103 GUARDIANO — collaudo PO 01/10 «Dov'e' la verita'? ... Gravissimo bug che ci portiamo avanti da tempo»]
   Lo stato del salvataggio S.12 del PO, ricostruito con le funzioni del gioco (lega da 18, 34 giornate):
   A) GIA' COLPITO — settimana 38, giornate 19-25 segnate giocate SENZA risultato (healed418, la bonifica 7.418 dopo la rete (H)),
      classifica ferma a 26 per tutti. Al caricamento le sette giornate devono avere un risultato e la classifica 33 partite per tutti.
   B) LA CAUSA — settimana 29, giornate 19-25 MAI giocate (la settimana e' passata durante l'Europeo), giocata la 26: la classifica
      dice 19 partite. La rete (H) non deve ritirare la 19 senza risultato: le gare mancate si simulano (recupero) e si contano.
   C) SANO — settimana 38, 33 giornate giocate: nulla deve cambiare.
   D) IL SALTO — settimana 21, qualificazione Europeo vs Belgio gia' scritta, risultato al fischio ancora in localStorage e un'amichevole
      vs Belgio alla settimana 28: al caricamento la settimana deve restare 21 e la qualificazione non deve essere contata due volte.
   CPM_RED=1 → __CPM_NO103: A resta senza risultati, B si ritrova voci giocate senza risultato, D salta alla settimana 28 → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const URL = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
async function apri(ctx, init) { const page = await ctx.newPage({ viewport: { width: 414, height: 896 } }); await installCdnRoutes(page);
  if (init) await page.addInitScript(init.fn, init.arg);
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 }); await sleep(1200); return page; }
const ctx0 = await browser.newContext(); const p0 = await apri(ctx0, { fn: () => { window.__CPM_GLB = false; }, arg: null });
const SAVES = await p0.evaluate(() => {
  const lg = CLUBS.filter(c => c.lg === 'Premier Division' && !c.isU18).slice(0, 18); const me = lg[0];
  const res = m => { const h = 1 + (m.matchday % 3), a = m.matchday % 2; return { homeScore: h, awayScore: a, won: h > a, drew: h === a }; };
  const cal0 = generateSeasonCalendar(me, lg, 12345);
  const wk = md => (cal0.find(m => m.matchday === md) || {}).week;
  const hist = upto => cal0.filter(m => m.matchday <= upto && !(m.matchday >= 19 && m.matchday <= 25)).map(m => ({ season: 12, week: m.week, opponent: m.opponentName, isHome: m.isHome, homeScore: res(m).homeScore, awayScore: res(m).awayScore }));
  const base = { name: 'Test Verita', nation: 'Spagna', avatarId: 0, proStatus: 'pro', season: 12, age: 29, ovr: 93, tutorialDone: true, hasAgent: true, bankBalance: 50000, popularity: 60, coachTrust: 80, position: 'Attaccante',
    stats: { 'velocità': 90, tecnica: 90, fisico: 90, 'mentalità': 90, tiro: 93, passaggio: 90, dribbling: 90, posizionamento: 90 }, club: me, worldMemory: [], contract: { duration: 3, wage: 150000, expiresAtSeason: 14 }, log: [], leagueOverrides: {} };
  const buco = m => m.matchday >= 19 && m.matchday <= 25;
  /* A: gia' colpito */
  const calA = cal0.map(m => m.matchday <= 33 ? (buco(m) ? { ...m, played: true, result: null, healed418: true } : { ...m, played: true, result: res(m) }) : m);
  const pA = { ...base, week: 38, calendar: calA, matchHistory: hist(33), playedMd: { s: 12, md: calA.filter(m => m.played).map(m => m.matchday) } };
  pA.standings = rebuildStandingsFromCalendar(pA);
  /* B: la causa (settimana 29, buco mai giocato) */
  const calB = cal0.map(m => (m.matchday <= 18 || m.matchday === 26) ? { ...m, played: true, result: res(m) } : m);
  const pB = { ...base, week: wk(26) + 1, calendar: calB, matchHistory: hist(26), playedMd: { s: 12, md: calB.filter(m => m.played).map(m => m.matchday) } };
  pB.standings = rebuildStandingsFromCalendar(pB);
  /* C: sano */
  const calC = cal0.map(m => m.matchday <= 33 ? { ...m, played: true, result: res(m) } : m);
  const pC = { ...base, week: 38, calendar: calC, matchHistory: [], playedMd: { s: 12, md: calC.filter(m => m.played).map(m => m.matchday) } };
  pC.standings = rebuildStandingsFromCalendar(pC);
  /* D: il salto di settimana dal risultato recuperato della Nazionale */
  const calD = cal0.map(m => m.matchday <= 18 ? { ...m, played: true, result: res(m) } : m).concat([{ matchday: 1498, week: 28, opponentId: 'nt-be', opponentName: 'Belgio', isHome: true, played: false, result: null, type: 'national' }]);
  const pD = { ...base, week: wk(19), calendar: calD, matchHistory: hist(18), playedMd: { s: 12, md: calD.filter(m => m.played).map(m => m.matchday) },
    natHistory: [{ season: 12, week: wk(19), comp: 'Qualif. Europeo', opp: 'Belgio', hs: 5, as: 0, won: true, drew: false, goals: 1, assists: 1, rating: 8, sim: false }],
    euroMondiale: { active: true, type: 'Europeo', season: 12, phase: 'qualificazioni', host: 'Belgio', qualOpponents: ['Belgio', 'Germania'], qualMatchIdx: 1, qualPts: 3, qualDone: false, qualQualified: false, groupOpponents: ['Olanda', 'Francia', 'Portogallo'], groupMatchIdx: 0, groupPts: 0, groupMatches: [], koPhase: null, koOpponent: null, koResults: [] } };
  pD.standings = rebuildStandingsFromCalendar(pD);
  const sideD = { v: 1, n: 'Test Verita', s: 12, w: wk(19), oid: 'be-nt', on: 'Belgio', ih: true, result: { context: 'euroMondiale_qualif', opponent: 'Belgio', homeScore: 5, awayScore: 0, won: true, drew: false, goals: 1, assists: 1, rating: 8 } };
  return { D: { phase: 'career', player: pD }, sideD, wD: pD.week, A: { phase: 'career', player: pA }, B: { phase: 'career', player: pB }, C: { phase: 'career', player: pC }, me: me.id, wB: pB.week };
});
await ctx0.close();
async function carica(save, side) { const ctx = await browser.newContext(); const page = await apri(ctx, { fn: ([s, r, sd]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO103 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); if (sd) localStorage.setItem('cpm-pending-mr', JSON.stringify(sd)); }, arg: [save, RED, side || null] });
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 15000 }).catch(() => {}); await sleep(2500);
  const r = await page.evaluate(me => { let p = null; try { const raw = JSON.parse(localStorage.getItem('cpm-v3')); p = raw.player || raw; } catch (e) {}
    const st = p.standings || [], cal = (p.calendar || []).filter(m => !m.type), mine = st.find(t => t.id === me) || {};
    return { n: st.length, played: [...new Set(st.map(t => t.played))].sort((a, b) => a - b), gf: st.reduce((a, t) => a + (t.gf || 0), 0), ga: st.reduce((a, t) => a + (t.ga || 0), 0), mio: mine.played,
      senzaRis: cal.filter(m => m.played && !m.result).map(m => m.matchday), recuperate: cal.filter(m => m.recupero103).map(m => m.matchday), nonGiocatePassate: cal.filter(m => !m.played && m.week < (p.week || 1)).map(m => m.matchday),
      week: p.week, belgio: (p.natHistory || []).filter(h => h.opp === 'Belgio').length, qIdx: p.euroMondiale && p.euroMondiale.qualMatchIdx,
      log: (p.log || []).filter(l => /Recupero campionato|Bonifica calendario/.test(l)).map(l => l.slice(0, 90)), w: window.__CPM_RECUPERO103 || null }; }, SAVES.me);
  await ctx.close(); return r; }
const A = await carica(SAVES.A), B = await carica(SAVES.B), C = await carica(SAVES.C), D = await carica(SAVES.D, SAVES.sideD);
await browser.close(); srv.close();
const fmt = (k, r) => console.log(`${k} → squadre ${r.n} · partite ${r.played.join('/')} · GF ${r.gf} GS ${r.ga} · eroe ${r.mio} · senza risultato [${r.senzaRis}] · recuperate [${r.recuperate}] · passate non giocate [${r.nonGiocatePassate}] · log ${JSON.stringify(r.log)}`);
fmt('A gia colpito', A); fmt('B la causa   ', B); fmt('C sano       ', C);
console.log(`D il salto    → settimana ${D.week} (era ${SAVES.wD}) · qualificazioni vs Belgio in natHistory ${D.belgio} · qualMatchIdx ${D.qIdx}`);
const okD = D.week === SAVES.wD && D.belgio === 1 && D.qIdx === 1;
const okA = A.senzaRis.length === 0 && A.recuperate.length === 7 && A.played.length === 1 && A.played[0] === 33 && A.gf === A.ga;
const okB = B.senzaRis.length === 0 && B.recuperate.length === 7 && B.nonGiocatePassate.length === 0 && B.mio === 26 && B.gf === B.ga;
const okC = C.senzaRis.length === 0 && C.recuperate.length === 0 && !C.w && C.played[0] === 33;
console.log(`A ${okA ? 'ok' : 'NO'} · B ${okB ? 'ok' : 'NO'} · C ${okC ? 'ok' : 'NO'} · D ${okD ? 'ok' : 'NO'}`);
if (RED) { const r = !okA && !okB && !okD; console.log(r ? '✅ ROSSO come atteso: giornate nascoste senza risultato' : '❌ il rosso non riproduce'); process.exit(r ? 0 : 1); }
const ok = okA && okB && okC && okD; console.log(ok ? '✅ PASS recupero-103' : '❌ FAIL recupero-103'); process.exit(ok ? 0 : 1);
