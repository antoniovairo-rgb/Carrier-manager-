// Sonda di collaudo L6 (solo misura): una carriera, una stagione, dump delle chiavi utili.
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1;
  const save = { phase: 'career', player: { name: 'Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 1, week: 1, age: 20, ovr: 70, tutorialDone: true, archetype: 'bomber', position: 'ATT',
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
    form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
const t0 = Date.now();
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);
let n = 0; const res = {};
for (let i = 0; i < 300; i++) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const s = C.step(); C.dismiss(); return s; });
  res[r] = (res[r] || 0) + 1; n++;
  if (r === 'seasonEnd') break;
  if (r && String(r).startsWith('blocked:')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
  await sleep(60);
}
const snap = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return p; });
console.log('steps', n, 'ms', Date.now() - t0, JSON.stringify(res));
console.log('season', snap.season, 'week', snap.week, 'ovr', snap.ovr, 'bank', snap.bank, snap.bankBalance);
console.log('matchHistory[0]', JSON.stringify((snap.matchHistory || [])[0]).slice(0, 400));
console.log('matchHistory len', (snap.matchHistory || []).length, 'matches', snap.matches, 'goals', snap.goals);
console.log('ledger', JSON.stringify((snap.ledger || []).slice(0, 2)).slice(0, 400), 'ledger len', (snap.ledger || []).length);
console.log('impulseSeen keys', Object.keys(snap.impulseSeen || {}).length, 'recentImpulses', JSON.stringify((snap.recentImpulses || []).slice(0, 3)).slice(0, 300));
console.log('natHistory', JSON.stringify(snap.natHistory || null).slice(0, 300), 'nationalCaps', snap.nationalCaps, 'nationalGoals', snap.nationalGoals);
console.log('diary len', (snap.diary || []).length, 'log len', (snap.log || []).length, 'skip', typeof snap.chem);
console.log('pageerrors', errors.length, errors.slice(0, 2));
await browser.close(); srv.close();
