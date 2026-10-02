#!/usr/bin/env node
/* [7.999.104 GUARDIANO PO-181 — «settimana ferma» dei collaudi Codex (seme 6, S.8 W.21)] Carriera da professionista alla W.21 di una
   stagione d'Europeo con le due qualificazioni GIA' giocate (qualDone, fase ancora «qualificazioni» fino alla W.24). Il passo di carriera
   (__CPM_CAREER.step, quello dei banchi) deve far avanzare le settimane fino alla W.24 e aprire il girone. CPM_RED=1 → __CPM_NO181: il
   passo risponde «blocked:euroMondiale» e la settimana resta ferma → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const URL = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
async function apri(ctx, init) { const page = await ctx.newPage({ viewport: { width: 414, height: 896 } }); await installCdnRoutes(page);
  if (init) await page.addInitScript(init.fn, init.arg);
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 }); await sleep(1200); return page; }
const ctx0 = await browser.newContext(); const p0 = await apri(ctx0, { fn: () => { window.__CPM_GLB = false; }, arg: null });
const SAVE = await p0.evaluate(() => {
  const lg = CLUBS.filter(c => c.lg === 'Premier Division' && !c.isU18).slice(0, 18); const me = lg[0];
  const cal = generateSeasonCalendar(me, lg, 4242).map(m => m.week < 21 ? { ...m, played: true, result: { homeScore: 2, awayScore: 1, won: true, drew: false } } : m);
  const p = { name: 'Test Attesa', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 8, week: 21, weekLived: true, age: 27, ovr: 88, tutorialDone: true, hasAgent: true, bankBalance: 50000, popularity: 60, coachTrust: 80, position: 'Attaccante',
    stats: { 'velocità': 88, tecnica: 88, fisico: 88, 'mentalità': 88, tiro: 88, passaggio: 88, dribbling: 88, posizionamento: 88 }, club: me, calendar: cal, matchHistory: [], worldMemory: [], contract: { duration: 3, wage: 150000, expiresAtSeason: 10 }, log: [], leagueOverrides: {},
    euroMondiale: { active: true, type: 'Europeo', season: 8, phase: 'qualificazioni', host: 'Belgio', qualOpponents: ['Belgio', 'Germania'], qualMatchIdx: 2, qualPts: 6, qualDone: true, qualQualified: true, groupOpponents: ['Olanda', 'Francia', 'Portogallo'], groupMatchIdx: 0, groupPts: 0, groupMatches: [], koPhase: null, koOpponent: null, koResults: [] } };
  p.standings = rebuildStandingsFromCalendar(p);
  return { phase: 'career', player: p };
});
await ctx0.close();
const ctx = await browser.newContext(); const page = await apri(ctx, { fn: ([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO181 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, arg: [SAVE, RED] });
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 15000 }).catch(() => {}); await sleep(1000);
const passi = [];
for (let i = 0; i < 12; i++) {
  const r = await page.evaluate(() => { try { return window.__CPM_CAREER.step(); } catch (e) { return 'errore:' + e.message; } });
  await sleep(700);
  const s = await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('cpm-v3')).player; return { w: p.week, f: p.euroMondiale && p.euroMondiale.phase }; });
  passi.push(`${r}→W${s.w}/${s.f}`);
  if (s.f !== 'qualificazioni') break;
}
await browser.close(); srv.close();
const fine = passi[passi.length - 1] || '';
console.log('passi: ' + passi.join(' · '));
const ok = /W2[4-9]\/(group|done)/.test(fine);
if (RED) { console.log(!ok ? '✅ ROSSO come atteso: la settimana resta ferma' : '❌ il rosso non riproduce'); process.exit(!ok ? 0 : 1); }
console.log(ok ? '✅ PASS euro-attesa-181' : '❌ FAIL euro-attesa-181'); process.exit(ok ? 0 : 1);
