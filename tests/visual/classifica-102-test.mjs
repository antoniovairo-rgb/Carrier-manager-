#!/usr/bin/env node
/* [7.999.102 GUARDIANO — collaudo PO 01/10 «Dov'e' la verita'?»] Salvataggio da professionista in Premier Division, stagione 12,
   settimana 38: calendario di 34 giornate (18 squadre) con 33 giocate, classifica di SOLE 14 squadre ferme a 26 partite (lo stato
   della foto del PO: il tetto 2x(N-1) di updateStandings con N=14). Al caricamento la classifica deve tornare alla lega del
   calendario: 18 squadre, 33 partite ciascuna, gol fatti = gol subiti, il club dell'eroe con i punti delle sue 33 partite.
   Controllo di non regressione: un salvataggio SANO (18 squadre, 33 partite) non viene toccato.
   CPM_RED=1 → __CPM_NO_CLASSIFICA102: la classifica resta a 14 squadre/26 partite → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const URL = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
async function apri(ctx, init) { const page = await ctx.newPage({ viewport: { width: 414, height: 896 } }); await installCdnRoutes(page);
  if (init) await page.addInitScript(init.fn, init.arg);
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 }); await sleep(1200); return page; }
/* 1) costruisce i due salvataggi con le funzioni del gioco */
const ctx0 = await browser.newContext(); const p0 = await apri(ctx0, { fn: () => { window.__CPM_GLB = false; }, arg: null });
const SAVES = await p0.evaluate(() => {
  const lg = CLUBS.filter(c => c.lg === 'Premier Division' && !c.isU18).slice(0, 18); const me = lg[0];
  const cal = generateSeasonCalendar(me, lg, 12345).map(m => m.matchday <= 33 ? { ...m, played: true, result: (() => { const h = 1 + (m.matchday % 3), a = m.matchday % 2; return { homeScore: h, awayScore: a, won: h > a, drew: h === a }; })() } : m);
  const base = { name: 'Test Verita', nation: 'Spagna', avatarId: 0, proStatus: 'pro', season: 12, week: 38, age: 29, ovr: 93, tutorialDone: true, hasAgent: true, bankBalance: 50000, popularity: 60, coachTrust: 80, position: 'Attaccante',
    stats: { 'velocità': 90, tecnica: 90, fisico: 90, 'mentalità': 90, tiro: 93, passaggio: 90, dribbling: 90, posizionamento: 90 }, club: me, calendar: cal, matchHistory: [], worldMemory: [], contract: { duration: 3, wage: 150000, expiresAtSeason: 14 }, log: [], leagueOverrides: {} };
  /* rotta: 14 squadre, tutte ferme a 26 */
  const rotta = initStandings(lg.slice(0, 14)).map((r, i) => ({ ...r, played: 26, wins: 10, draws: 6, losses: 10, gf: 30, ga: 30, gd: 0, pts: 36 }));
  /* sana: ricostruita dal calendario */
  const sana = rebuildStandingsFromCalendar({ ...base, standings: [] });
  return { rotta: { phase: 'career', player: { ...base, standings: rotta } }, sana: { phase: 'career', player: { ...base, standings: sana } }, me: me.id };
});
await ctx0.close();
/* 2) carica ciascun salvataggio in un contesto nuovo e legge la classifica dopo la migrazione */
async function carica(save) { const ctx = await browser.newContext(); const page = await apri(ctx, { fn: ([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_CLASSIFICA102 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, arg: [save, RED] });
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 15000 }).catch(() => {}); await sleep(800);
  const r = await page.evaluate(me => { let st = null; try { const raw = JSON.parse(localStorage.getItem('cpm-v3')); st = (raw.player || raw).standings; } catch (e) {} /* il salvataggio, non get(): get() riassume la classifica */
    st = st || []; const mine = st.find(t => t.id === me) || {}; return { n: st.length, played: [...new Set(st.map(t => t.played))], gf: st.reduce((a, t) => a + (t.gf || 0), 0), ga: st.reduce((a, t) => a + (t.ga || 0), 0), mio: mine.played, pts: mine.pts, w102: window.__CPM_CLASSIFICA102 || null }; }, SAVES.me);
  await ctx.close(); return r; }
const R = await carica(SAVES.rotta), S = await carica(SAVES.sana);
await browser.close(); srv.close();
console.log(`rotta → squadre ${R.n} · partite ${R.played.join('/')} · GF ${R.gf} GS ${R.ga} · eroe ${R.mio} partite ${R.pts} punti · ${JSON.stringify(R.w102)}`);
console.log(`sana  → squadre ${S.n} · partite ${S.played.join('/')} · GF ${S.gf} GS ${S.ga} · eroe ${S.mio} partite ${S.pts} punti · riscritta: ${S.w102 ? 'sì' : 'no'}`);
const okR = R.n === 18 && R.played.length === 1 && R.played[0] === 33 && R.gf === R.ga, okS = S.n === 18 && S.played[0] === 33 && !S.w102;
if (RED) { const r = !okR; console.log(r ? '✅ ROSSO come atteso: la classifica resta ferma' : '❌ il rosso non riproduce'); process.exit(r ? 0 : 1); }
console.log(okR && okS ? '✅ PASS classifica-102' : '❌ FAIL classifica-102'); process.exit(okR && okS ? 0 : 1);
