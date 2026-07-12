#!/usr/bin/env node
/* [7.12.0] PROBE — notte dei sorteggi (reveal ×3 + drawSeen persistito) e Deadline Day (card a W19). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const eg = [[21, 'x1', 'FC Lusitano', true], [23, 'x2', 'SC Flandria', false], [25, 'x3', 'FC Anatolia', true], [27, 'x1', 'FC Lusitano', false], [29, 'x2', 'SC Flandria', true], [31, 'x3', 'FC Anatolia', false]]
    .map(([w, id, n, h], i) => ({ matchday: 950 + i, week: w, opponentId: id, opponentName: n, isHome: h, played: false, result: null, type: 'euro_group', competition: 'UEL', opponentData: { id, n, a: n.slice(0, 3).toUpperCase(), p: 75, nat: '🇪🇺', lg: 'X' } }));
  const save = { phase: 'career', player: { name: 'Draw Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 19, weekLived: false, age: 23, ovr: 80, tutorialDone: true, campDone: true, transferListed: true, calendar: eg,
    euro: { active: true, competition: 'UEL', phase: 'group', pts: 0, groupResults: [], qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0,
      groupOpponents: [{ id: 'x1', n: 'FC Lusitano', a: 'LUS', p: 78, nat: '🇵🇹' }, { id: 'x2', n: 'SC Flandria', a: 'FLA', p: 71, nat: '🇧🇪' }, { id: 'x3', n: 'FC Anatolia', a: 'ANA', p: 74, nat: '🇹🇷' }] },
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
    stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
    form: 74, morale: 72, fatigue: 12, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1600);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await sleep(1200);
const issues = [];
const hasDraw = await page.evaluate(() => /la notte dei sorteggi/i.test(document.body.innerText));
const hasDeadline = await page.evaluate(() => /deadline day/i.test(document.body.innerText));
console.log('sorteggi:', hasDraw, '· deadline:', hasDeadline);
if (!hasDraw) issues.push('card sorteggi assente');
if (!hasDeadline) issues.push('card deadline day assente a W19');
// estrai 3 volte
for (let i = 0; i < 3; i++) { try { await page.getByText('Estrai dall', { exact: false }).first().click({ timeout: 4000 }); } catch (e) { issues.push('estrazione #' + (i + 1) + ' fallita'); break; } await sleep(500); }
const revealed = await page.evaluate(() => /FC Lusitano/.test(document.body.innerText) && /SC Flandria/.test(document.body.innerText) && /FC Anatolia/.test(document.body.innerText));
console.log('avversarie rivelate:', revealed);
if (!revealed) issues.push('avversarie non tutte rivelate dopo 3 estrazioni');
await page.screenshot({ path: 'tests/visual/out/sorteggi.png' });
try { await page.getByText('Al lavoro', { exact: false }).first().click({ timeout: 4000 }); } catch (e) { issues.push('chiusura sorteggio fallita'); }
await sleep(900);
const st = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const p = s && s.player; return { drawSeen: p && p.drawSeen, logHit: (p && p.log || []).some(l => /Sorteggio/.test(l)) }; });
console.log('post-chiusura:', JSON.stringify(st));
if (st.drawSeen !== 4) issues.push('drawSeen non persistito (atteso 4): ' + st.drawSeen);
if (!st.logHit) issues.push('voce Notizie del sorteggio assente');
const gone = await page.evaluate(() => !/la notte dei sorteggi/i.test(document.body.innerText));
if (!gone) issues.push('card sorteggi ancora visibile dopo la chiusura');
if (errors.length) issues.push('pageerror: ' + errors[0]);
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ SORTEGGI + DEADLINE OK');
await browser.close(); srv.close();
process.exit(issues.length ? 1 : 0);
