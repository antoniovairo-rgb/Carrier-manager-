#!/usr/bin/env node
/* [7.10.0] PROBE — bilancio della promessa al ROLLOVER: save a fine stagione con pledge ambizioso +
   obiettivi CENTRATI → startNewSeason → popolarità +6, diary «Promessa mantenuta», seasonPledge azzerato. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: { name: 'Pledge Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 39, weekLived: true, age: 22, ovr: 76, tutorialDone: true, campDone: true, popularity: 50, morale: 70,
    goals: 22, assists: 8, matches: 30,
    seasonPledge: { season: 3, tone: 'ambizioso' },
    seasonObjectives: [{ type: 'goals', target: 15, label: 'Segna 15 gol' }, { type: 'matches', target: 25, label: 'Gioca 25 partite' }],
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
    form: 74, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(800);
const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
await sleep(2000);
const st = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const p = s && s.player; return { season: p.season, pop: p.popularity, pledge: p.seasonPledge, diaryLast: (p.diary || []).filter(d => d.type === 'pledge').slice(-1)[0] || null, logHit: (p.log || []).some(l => /Promessa mantenuta/i.test(l)) }; });
const issues = [];
if (ok !== true) issues.push('startNewSeason: ' + ok);
console.log(JSON.stringify(st, null, 1).slice(0, 500));
if (st.season !== 4) issues.push(`stagione attesa 4, trovata ${st.season}`);
if (st.pledge) issues.push('seasonPledge NON azzerato al rollover');
if (st.pop !== 56) issues.push(`popolarità attesa 56 (50+6), trovata ${st.pop}`);
if (!st.diaryLast || !/Promessa mantenuta/i.test(st.diaryLast.headline || '')) issues.push('voce diario pledge assente/errata');
if (errors.length) issues.push('pageerror: ' + errors[0]);
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ PLEDGE AL ROLLOVER OK (+6 pop, diario, reset)');
await browser.close(); srv.close();
process.exit(issues.length ? 1 : 0);
