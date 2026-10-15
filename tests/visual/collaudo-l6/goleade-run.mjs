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
const perMatch = [];
let iter = 0, endReason = 'ok', seasonsCrossed = 0, lastMatches = start.matches;
// Conteggio dal contatore player.matches (matchHistory puo' non crescere: e' limitato in lunghezza).
const resCount = {}; let adoptedAddio = 0;
while (perMatch.length < N_MATCHES && iter++ < 1500) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); const p = C.snapshot(); const mh = p.matchHistory || []; return { res, matches: p.matches || 0, last: mh[mh.length - 1] || null, season: p.season, week: p.week, cal: (p.calendar || []).filter(c => c.week === (mh[mh.length - 1] || {}).week).map(c => ({ h: c.isHome ?? null })) }; });
  resCount[String(r.res).split(':')[0]] = (resCount[String(r.res).split(':')[0]] || 0) + 1;
  if (String(r.res).startsWith('error:')) { endReason = r.res; break; }
  if (r.res === 'seasonEnd') {
    const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
    if (ok !== true) { endReason = 'startNewSeason:' + ok; break; }
    await page.evaluate(() => window.__CPM_CAREER.dismiss());
    seasonsCrossed++; lastMatches = 0; await sleep(300); continue;
  }
  if (String(r.res).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
  if (r.res === 'opening-resolved') { adoptedAddio++; await page.evaluate(() => window.__CPM_CAREER.patch({ retireAskedSeason: window.__CPM_CAREER.get().season })); }
  if (r.matches > lastMatches && r.last) {
    perMatch.push({ season: r.season, week: r.last.week, opp: r.last.opponent, homeScore: r.last.homeScore, awayScore: r.last.awayScore, teamGoals: r.last.homeScore, oppGoals: r.last.awayScore, heroGoals: r.last.goals, heroAssists: r.last.assists, rating: r.last.rating, won: !!r.last.won, drew: !!r.last.drew, simulated: !!r.last.simulated, euro: !!r.last.euro, dMatches: r.matches - lastMatches });
    lastMatches = r.matches;
  }
  await sleep(40);
}
const data = { cal: [] };
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
const out = { collaudo: 'L6 · PO-190 goleade', version, fixture: 'tests/visual/fixtures/save-190-s12-ovr93.json', start, endReason, iter, seasonsCrossed, resCount, adoptedAddio, pageerrors: errors, summary, perMatch, calendarNow: data.cal.length };
fs.writeFileSync(path.join(OUT, 'goleade-po190-save190-sim.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(summary));
console.log(`partite ${N} · fine: ${endReason} · pageerrors ${errors.length}`);
await browser.close(); srv.close();
console.log('FINE');
