#!/usr/bin/env node
/* [7.999.107 GUARDIANO — rete di sicurezza per le coppe] Carriera alla W.25 con un turno di Coppa (quarti, W.20) rimasto NON giocato e la
   coppa ancora viva (lo stato della KCC del salvataggio S.12 dopo il salto 21→28). Al caricamento la gara va rinviata alla settimana
   corrente e il passo di carriera la deve giocare: risultato del turno in cup.results. Controlli: (1) a W.38 non si rinvia nulla (decisione
   PO-186); (2) coppa gia' eliminata → nessun rinvio. CPM_RED=1 → __CPM_NO107: la gara resta indietro per sempre → deve FALLIRE. */
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
  const mk = (week, cupOver) => {
    const cal = generateSeasonCalendar(me, lg, 4242).map(m => m.week < week ? { ...m, played: true, result: { homeScore: 2, awayScore: 1, won: true, drew: false } } : m);
    const opp = lg[5];
    cal.push({ matchday: 992, week: 20, opponentId: opp.id, opponentName: opp.n, isHome: true, played: false, result: null, type: 'cup', cupRound: 2, cupRoundName: 'Quarti di Finale' });
    const p = { name: 'Test Rinvio', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 5, week, weekLived: true, age: 27, ovr: 88, tutorialDone: true, hasAgent: true, bankBalance: 50000, popularity: 60, coachTrust: 80, position: 'Attaccante',
      stats: { 'velocità': 88, tecnica: 88, fisico: 88, 'mentalità': 88, tiro: 88, passaggio: 88, dribbling: 88, posizionamento: 88 }, club: me, calendar: cal, matchHistory: [], worldMemory: [], contract: { duration: 3, wage: 150000, expiresAtSeason: 8 }, log: [], leagueOverrides: {},
      cup: { active: !cupOver, round: 2, nextWeek: 20, eliminated: !!cupOver, champion: false, results: [{ round: 1, name: 'Ottavi di Finale', opponent: lg[9].n, homeScore: 2, awayScore: 0, won: true, penalties: false }], bracket: lg.slice(0, 16).map(c => c.id), cupSurvivors: lg.slice(0, 8).map(c => c.id), cupBracketMatches: {}, season: 5 } };
    p.standings = rebuildStandingsFromCalendar(p);
    return { phase: 'career', player: p };
  };
  return { viva: mk(25, false), tardi: mk(38, false), morta: mk(25, true) };
});
await ctx0.close();
async function giro(save, passi) { const ctx = await browser.newContext(); const page = await apri(ctx, { fn: ([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO107 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, arg: [save, RED] });
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 15000 }).catch(() => {}); await sleep(1500);
  const log = [];
  for (let i = 0; i < passi; i++) { const r = await page.evaluate(() => { try { return window.__CPM_CAREER.step(); } catch (e) { return 'errore:' + e.message; } }); await sleep(800); log.push(r); }
  const s = await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('cpm-v3')).player; const e = (p.calendar || []).find(m => m.type === 'cup' && m.matchday === 992);
    return { w: p.week, voce: e ? { week: e.week, played: !!e.played, rinv: !!e.rinviata107 } : null, turni: (p.cup.results || []).map(r => r.round) }; });
  await ctx.close(); return { ...s, passi: log.join(',') }; }
const V = await giro(SAVES.viva, 4), T = await giro(SAVES.tardi, 0), M = await giro(SAVES.morta, 0);
await browser.close(); srv.close();
console.log(`viva  (W25): ${JSON.stringify(V)}`); console.log(`tardi (W38): ${JSON.stringify(T)}`); console.log(`morta (W25): ${JSON.stringify(M)}`);
const okV = V.voce && V.voce.rinv && V.voce.played && V.turni.includes(2);
const okC = T.voce && !T.voce.rinv && T.voce.week === 20 && (!M.voce || !M.voce.rinv);/* coppa chiusa: la voce la toglie gia la pulizia delle coppe zombie (6.79) */
console.log(`viva ${okV ? 'ok' : 'NO'} · controlli ${okC ? 'ok' : 'NO'}`);
if (RED) { const r = !okV && okC; console.log(r ? '✅ ROSSO come atteso: la gara resta indietro' : '❌ il rosso non riproduce'); process.exit(r ? 0 : 1); }
console.log(okV && okC ? '✅ PASS rinvio-coppe-107' : '❌ FAIL rinvio-coppe-107'); process.exit(okV && okC ? 0 : 1);
