// COLLAUDO L6 — PO-190 (solo misura). 20 partite dal salvataggio fixtures/save-190-s12-ovr93.json
// sul percorso di simulazione DEL GIOCO (simulateAndAdvance → simulateMatch), handler veri via __CPM_CAREER.
// NB: il percorso sim NON produce tiri né xG (il ritorno di simulateMatch ha solo punteggi e voto):
// tiri e xG restano NON MISURATI su questo percorso.
import fs from 'fs';
import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from '../lib/harness.mjs';

const N_MATCHES = 20;
const OUT = path.join(ROOT, 'docs', 'collaudi', 'dati-carriere-l6');
fs.mkdirSync(OUT, { recursive: true });
const saveJson = fs.readFileSync(path.join(ROOT, 'tests', 'visual', 'fixtures', 'save-190-s12-ovr93.json'), 'utf-8');

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
await page.addInitScript((s) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; try { localStorage.setItem('cpm-v3', s); } catch (e) {} }, saveJson);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1000);
const version = await page.evaluate(() => GAME_VERSION);
const start = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { season: p.season, week: p.week, ovr: p.ovr, club: p.club && p.club.n, lg: p.club && p.club.lg, matches0: (p.matchHistory || []).length, goals0: p.goals, matches: p.matches, archetype: p.archetype, nationalCaps: p.nationalCaps }; });
const target = start.matches0 + N_MATCHES;
let iter = 0, endReason = 'ok';
let mhNow = start.matches0;
while (mhNow < target && iter++ < 400) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); const p = C.snapshot(); return { res, n: (p.matchHistory || []).length }; });
  if (String(r.res).startsWith('error:')) { endReason = r.res; break; }
  if (r.res === 'seasonEnd') { endReason = 'seasonEnd prima delle N partite'; break; }
  if (String(r.res).startsWith('blocked:')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
  mhNow = r.n;
  await sleep(40);
}
const data = await page.evaluate(() => {
  const p = window.__CPM_CAREER.snapshot();
  const cal = p.calendar || [];
  return { mh: (p.matchHistory || []).slice(start_idx()).map(m => m), cal: cal.map(c => ({ w: c.week, h: c.isHome ?? null, opp: c.opponentName ?? null, pl: !!c.played, res: c.result ?? null })), goalsNow: p.goals, matchesNow: p.matches, ovrNow: p.ovr, standings: (p.standings || []).length };
  function start_idx() { return 0; }
});
// raccoglie solo le partite NUOVE (dopo lo stato iniziale)
const newMatches = data.mh.slice(start.matches0);
const perMatch = newMatches.map(m => {
  const c = data.cal.find(x => x.w === m.week) || {};
  const home = c.h;
  const team = home === true ? m.homeScore : home === false ? m.awayScore : null;
  const opp = home === true ? m.awayScore : home === false ? m.homeScore : null;
  return { season: m.season, week: m.week, opp: m.opponent, home, homeScore: m.homeScore, awayScore: m.awayScore, teamGoals: team, oppGoals: opp, heroGoals: m.goals, heroAssists: m.assists, rating: m.rating, won: !!m.won, drew: !!m.drew, simulated: !!m.simulated, minutes: m.minutesPlayed ?? null };
});
const N = perMatch.length;
const sum = f => perMatch.reduce((a, x) => a + (f(x) || 0), 0);
const teamKnown = perMatch.filter(x => x.teamGoals != null);
const summary = {
  partite: N,
  golEroePerPartita: N ? +(sum(x => x.heroGoals) / N).toFixed(2) : null,
  golSquadra: sum(x => x.teamGoals), golSquadraNota: `su ${teamKnown.length}/${N} partite con lato noto`,
  quotaGolEroe: sum(x => x.teamGoals) ? +(sum(x => x.heroGoals) / sum(x => x.teamGoals)).toFixed(3) : null,
  quotaGolEroeConLato: teamKnown.length ? +(teamKnown.reduce((a, x) => a + x.heroGoals, 0) / Math.max(1, teamKnown.reduce((a, x) => a + x.teamGoals, 0))).toFixed(3) : null,
  golSubiti: sum(x => x.oppGoals),
  risultati5plus: perMatch.filter(x => (x.teamGoals || 0) >= 5).length,
  risultati7plus: perMatch.filter(x => (x.teamGoals || 0) >= 7).length,
  scarto5plus: perMatch.filter(x => x.teamGoals != null && Math.abs(x.teamGoals - x.oppGoals) >= 5).length,
  tiriXgTiri: 'NON MISURATO sul percorso sim (nessun dato di tiro in simulateMatch)',
  incoerenzaWon: perMatch.filter(x => x.teamGoals != null && (x.won !== (x.teamGoals > x.oppGoals))).length,
};
const out = { collaudo: 'L6 · PO-190 goleade', version, fixture: 'tests/visual/fixtures/save-190-s12-ovr93.json', start, endReason, iter, pageerrors: errors, summary, perMatch, calendarNow: data.cal.length };
fs.writeFileSync(path.join(OUT, 'goleade-po190-save190-sim.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(summary));
console.log(`partite ${N} · fine: ${endReason} · pageerrors ${errors.length}`);
await browser.close(); srv.close();
console.log('FINE');
