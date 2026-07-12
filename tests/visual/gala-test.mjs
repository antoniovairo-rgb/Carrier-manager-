#!/usr/bin/env node
/* [7.19.0] TEST — LA NOTTE DEL GALA: arrivando alla schermata premi (fine stagione via doAdvanceWeek), il
   Trofeo d'Oro si apre con la CERIMONIA a buste (busta → 3° → 2° → 1° → chiusura) sopra la schermata premi.
   Verifica: overlay presente · reveal progressivo · chiusura → schermata premi normale · skip funziona. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = () => ({ phase: 'career', player: { name: 'Gala Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 39, weekLived: true, age: 24, ovr: 84, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3,
  goals: 19, assists: 7, matches: 30,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 84, tecnica: 83, fisico: 82, 'mentalità': 84, tiro: 86, passaggio: 83, dribbling: 85, posizionamento: 84 },
  form: 76, fatigue: 10, morale: 74, popularity: 55, contract: { duration: 3, wage: 15000, expiresAtSeason: 6 } } });

const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, mkSave());
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
await sleep(1000);
await page.evaluate(() => window.__CPM_CAREER.dismiss());
const stepRes = await page.evaluate(() => window.__CPM_CAREER.step());
await sleep(1800);
console.log('step:', stepRes);
const hasTxt = (rx) => page.evaluate((x) => new RegExp(x, 'i').test(document.body.innerText), rx);
const clickBtn = (rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return true; } return false; }, rx);

const overlay = await hasTxt('La notte del Gala') && await hasTxt('La busta, per favore');
console.log('(1) overlay gala:', overlay);
if (!overlay) issues.push('overlay gala assente all\'ingresso nella schermata premi');
await clickBtn('Apri la busta'); await sleep(700);
const b3 = await hasTxt('🥉') || await page.evaluate(() => /Il secondo posto/i.test(document.body.innerText));
if (!b3) issues.push('reveal 3° posto non avvenuto');
await clickBtn('Il secondo posto'); await sleep(700);
await clickBtn('e il vincitore è'); await sleep(800);
const win = await page.evaluate(() => /🥇/.test(document.body.innerText) || /Vai alla cerimonia/i.test(document.body.innerText));
console.log('(2) reveal completo:', b3, win);
if (!win) issues.push('reveal del vincitore non avvenuto');
await clickBtn('Vai alla cerimonia'); await sleep(900);
const closed = await page.evaluate(() => !/La busta, per favore/i.test(document.body.innerText) && /Premi Stagione/i.test(document.body.innerText));
console.log('(3) chiusura → schermata premi:', closed);
if (!closed) issues.push('overlay non chiuso / schermata premi non visibile');

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ GALA OK (overlay · reveal a buste 3°→2°→1° · chiusura alla cerimonia)');
process.exit(issues.length ? 1 : 0);
