#!/usr/bin/env node
/* [7.11.0] PROBE — Sprint «Emozioni»: (1) card DUELLO CAPOCANNONIERE e RECORD WATCH sul dashboard con un
   bomber in corsa; (2) sezione «Il film della stagione» nel season-end coi momenti veri dal diario. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const mh = Array.from({ length: 28 }, (_, i) => ({ week: i + 2, opponent: 'X', homeScore: 2, awayScore: 1, goals: i % 10 === 0 ? 2 : 1, assists: 0, rating: 7 + (i % 3) * 0.5, won: true }));
  // 28 gare di lega, gol totali = 28 + 3 (le tre doppiette extra) = 31
  const save = { phase: 'career', player: { name: 'Emozioni Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 32, weekLived: false, age: 23, ovr: 82, tutorialDone: true, campDone: true, popularity: 60, morale: 75,
    goals: 31, assists: 5, matches: 28, matchHistory: mh,
    diary: [{ season: 4, week: 6, type: 'milestone', e: '🏆', headline: '3 vittorie consecutive!', body: 'Striscia vincente', color: '#16a34a' }, { season: 4, week: 15, type: 'milestone', e: '🟡', headline: 'Cartellino Giallo', body: 'Ammonito', color: '#ca8a04' }],
    seasonObjectives: [{ type: 'goals', target: 15, label: 'Segna 15 gol' }],
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 82, tiro: 84, passaggio: 81, dribbling: 83, posizionamento: 82 },
    form: 78, fatigue: 15, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1600);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await sleep(1200);
const issues = [];
const hasDuel = await page.evaluate(() => /duello capocannoniere/i.test(document.body.innerText));
const hasRec = await page.evaluate(() => /Record watch|Record battuto|record stagionale/i.test(document.body.innerText));
console.log('duello:', hasDuel, '· record:', hasRec);
if (!hasDuel) issues.push('card Duello capocannoniere assente (31 gol a W32)');
if (!hasRec) issues.push('card Record watch assente (31 gol vs record Lega B)');
await page.screenshot({ path: 'tests/visual/out/emozioni-dash.png' });
// avanza fino al season-end con gli handler veri
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
let reached = false;
for (let i = 0; i < 40; i++) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); return { res, sc: C.get().screen }; });
  if (r.res === 'seasonEnd' || r.sc === 'seasonEnd') { reached = true; break; }
  if (String(r.res).startsWith('blocked')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
  if (String(r.res).startsWith('error')) { issues.push('step error: ' + r.res); break; }
  await sleep(250);
}
await sleep(1200);
// la schermata PREMI viene prima: avanza fino alla schermata Fine Stagione (dove vive il film)
for (let i = 0; i < 6; i++) {
  const f = await page.evaluate(() => /il film della stagione/i.test(document.body.innerText));
  if (f) break;
  await page.evaluate(() => { const rx = /continua|avanti|fine stagione|chiudi|prosegui/i; const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => rx.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) el.click(); });
  await sleep(1000);
}
const hasFilm = await page.evaluate(() => /il film della stagione/i.test(document.body.innerText));
const hasBest = await page.evaluate(() => /la partita dell/i.test(document.body.innerText));
console.log('seasonEnd raggiunto:', reached, '· film:', hasFilm, '· best match:', hasBest);
if (!reached) issues.push('season-end non raggiunto');
if (reached && !hasFilm) issues.push('sezione Film della stagione assente nel season-end');
await page.screenshot({ path: 'tests/visual/out/emozioni-film.png', fullPage: false });
if (errors.length) issues.push('pageerror: ' + errors[0]);
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ EMOZIONI OK (duello + record watch + film della stagione)');
await browser.close(); srv.close();
process.exit(issues.length ? 1 : 0);
