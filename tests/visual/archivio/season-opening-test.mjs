#!/usr/bin/env node
/* [7.10.0] PROBE — card «Apertura Stagione»: appare a W1 (pro, S≥2), mostra mercato+maglie+conferenza;
   la scelta del tono salva seasonPledge, applica gli effetti e fa sparire la card. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 980 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: { name: 'Opening Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, age: 22, ovr: 75, tutorialDone: true, campDone: true, popularity: 40, morale: 70,
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 75, tecnica: 74, fisico: 73, 'mentalità': 75, tiro: 77, passaggio: 74, dribbling: 76, posizionamento: 75 },
    form: 72, morale2: 0, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1600);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await sleep(1200);
const issues = [];
const cardVisible = await page.evaluate(() => [...document.querySelectorAll('div')].some(el => el.offsetParent !== null && /Apertura Stagione 3/i.test(el.textContent || '') && el.textContent.length < 80));
const hasMercato = await page.evaluate(() => document.body.innerText.includes('mercato della tua squadra') || document.body.innerText.includes('Mercato tranquillo'));
const hasMaglie = await page.evaluate(() => document.body.innerText.includes('maglie della nuova stagione'));
const hasConf = await page.evaluate(() => document.body.innerText.includes('Conferenza stampa d'));
console.log('card:', cardVisible, '· mercato:', hasMercato, '· maglie:', hasMaglie, '· conferenza:', hasConf);
if (!cardVisible) issues.push('card Apertura Stagione non visibile a W1');
if (!hasMercato) issues.push('sezione mercato assente');
if (!hasMaglie) issues.push('sezione maglie assente');
if (!hasConf) issues.push('sezione conferenza assente');
await page.screenshot({ path: 'tests/visual/out/season-opening.png', fullPage: false });
// scegli il tono ambizioso
try { await page.getByText('Puntiamo in alto', { exact: false }).first().click({ timeout: 5000 }); } catch (e) { issues.push('bottone pledge non cliccabile: ' + e.message.slice(0, 60)); }
await sleep(1000);
const st = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const p = s && s.player; return { pledge: p && p.seasonPledge, pop: p && p.popularity }; });
console.log('post-scelta:', JSON.stringify(st));
if (!st.pledge || st.pledge.season !== 3 || st.pledge.tone !== 'ambizioso') issues.push('seasonPledge non salvato correttamente: ' + JSON.stringify(st.pledge));
if (st.pop !== 44) issues.push(`popolarità attesa 44 (40+4), trovata ${st.pop}`);
const cardGone = await page.evaluate(() => ![...document.querySelectorAll('div')].some(el => el.offsetParent !== null && /Conferenza stampa d.apertura/i.test(el.textContent || '') && el.textContent.length < 200));
if (!cardGone) issues.push('card ancora visibile dopo la scelta');
if (errors.length) issues.push('pageerror: ' + errors[0]);
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ APERTURA STAGIONE OK (card completa, pledge salvato con effetti, card chiusa)');
await browser.close(); srv.close();
process.exit(issues.length ? 1 : 0);
