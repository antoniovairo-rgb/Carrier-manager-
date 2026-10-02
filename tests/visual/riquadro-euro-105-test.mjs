#!/usr/bin/env node
/* [7.999.105 GUARDIANO — riquadro «Europeo · PRIORITÀ» della home] In qualificazione il riquadro diceva «vs ?» e «Partita da eliminazione
   diretta · Nessun pareggio»; in ATTESA (qualificazioni chiuse, girone alla W.24) gridava PRIORITÀ senza gare da giocare.
   Q) qualificazione 2/2 in corso → «vs Germania», «Qualificazione 2/2», niente «eliminazione diretta», niente «vs ?».
   A) attesa → «IN ATTESA», «il girone inizia alla settimana 24», niente «PRIORITÀ», niente «vs ?».
   Foto in out/riquadro-euro-105-{Q,A}.png. CPM_RED=1 → __CPM_NO_RIQ105: torna il testo vecchio → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const URL = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
async function apri(ctx, init) { const page = await ctx.newPage({ viewport: { width: 414, height: 896 } }); await installCdnRoutes(page);
  if (init) await page.addInitScript(init.fn, init.arg);
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 }); await sleep(1200); return page; }
const ctx0 = await browser.newContext(); const p0 = await apri(ctx0, { fn: () => { window.__CPM_GLB = false; }, arg: null });
const SAVES = await p0.evaluate(() => {
  const lg = CLUBS.filter(c => c.lg === 'Premier Division' && !c.isU18).slice(0, 18); const me = lg[0];
  const cal = generateSeasonCalendar(me, lg, 4242).map(m => m.week < 21 ? { ...m, played: true, result: { homeScore: 2, awayScore: 1, won: true, drew: false } } : m);
  const base = { name: 'Test Riquadro', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 8, week: 21, weekLived: true, age: 27, ovr: 88, tutorialDone: true, hasAgent: true, bankBalance: 50000, popularity: 60, coachTrust: 80, position: 'Attaccante',
    stats: { 'velocità': 88, tecnica: 88, fisico: 88, 'mentalità': 88, tiro: 88, passaggio: 88, dribbling: 88, posizionamento: 88 }, club: me, calendar: cal, matchHistory: [], worldMemory: [], contract: { duration: 3, wage: 150000, expiresAtSeason: 10 }, log: [], leagueOverrides: {} };
  const em = { active: true, type: 'Europeo', season: 8, phase: 'qualificazioni', host: 'Belgio', qualOpponents: ['Belgio', 'Germania'], groupOpponents: ['Olanda', 'Francia', 'Portogallo'], groupMatchIdx: 0, groupPts: 0, groupMatches: [], koPhase: null, koOpponent: null, koResults: [] };
  const Q = { ...base, euroMondiale: { ...em, qualMatchIdx: 1, qualPts: 3, qualDone: false, qualQualified: false } };
  const A = { ...base, euroMondiale: { ...em, qualMatchIdx: 2, qualPts: 6, qualDone: true, qualQualified: true } };
  Q.standings = rebuildStandingsFromCalendar(Q); A.standings = rebuildStandingsFromCalendar(A);
  return { Q: { phase: 'career', player: Q }, A: { phase: 'career', player: A } };
});
await ctx0.close();
fs.mkdirSync('out', { recursive: true });
async function leggi(k) { const ctx = await browser.newContext(); const page = await apri(ctx, { fn: ([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_RIQ105 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, arg: [SAVES[k], RED] });
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 15000 }).catch(() => {}); await sleep(1500);
  const t = await page.evaluate(() => { const els = [...document.querySelectorAll('div')].filter(d => { const x = d.textContent || ''; return /Europeo · S\.8/.test(x) && /(vs |settimana 24)/.test(x) && x.length < 400; });
    const card = els.sort((a, b) => a.textContent.length - b.textContent.length)[0] || null;
    if (card) card.scrollIntoView({ block: 'center' }); return card ? card.textContent : null; });
  await sleep(400); await page.screenshot({ path: `out/riquadro-euro-105-${k}${RED ? '-rosso' : ''}.png` });
  await ctx.close(); return t || ''; }
const tQ = await leggi('Q'), tA = await leggi('A');
await browser.close(); srv.close();
console.log('Q riquadro: ' + tQ.replace(/\s+/g, ' ')); console.log('A riquadro: ' + tA.replace(/\s+/g, ' '));
const okQ = /vs Germania/.test(tQ) && /Qualificazione 2\/2/.test(tQ) && !/eliminazione diretta/.test(tQ) && !/vs \?/.test(tQ);
const okA = /IN ATTESA/.test(tA) && /settimana 24/.test(tA) && !/PRIORIT/.test(tA) && !/vs \?/.test(tA);
console.log(`Q ${okQ ? 'ok' : 'NO'} · A ${okA ? 'ok' : 'NO'}`);
if (RED) { const r = !okQ && !okA; console.log(r ? '✅ ROSSO come atteso: testo vecchio' : '❌ il rosso non riproduce'); process.exit(r ? 0 : 1); }
console.log(okQ && okA ? '✅ PASS riquadro-euro-105' : '❌ FAIL riquadro-euro-105'); process.exit(okQ && okA ? 0 : 1);
