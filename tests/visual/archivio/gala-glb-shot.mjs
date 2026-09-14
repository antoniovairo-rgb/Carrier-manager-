#!/usr/bin/env node
/* [7.143.0 task #108] SCREENSHOT PROBE GLB-ON — il gala col PRESENTATORE Rocketbox reale
   (assets/actor-presenter.glb): fine stagione via step() → overlay gala col palco 3D dietro,
   screenshot busta (beat 0-1) + reveal (beat 3). Verifica __CPM_ACTOR_G (ossa matchate).
   Non-gate, iterazione visiva. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = () => ({ phase: 'career', player: { name: 'Gala Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 39, weekLived: true, age: 24, ovr: 84, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3,
  goals: 19, assists: 7, matches: 30,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 84, tecnica: 83, fisico: 82, 'mentalità': 84, tiro: 86, passaggio: 83, dribbling: 85, posizionamento: 84 },
  form: 76, fatigue: 10, morale: 74, popularity: 55, contract: { duration: 3, wage: 15000, expiresAtSeason: 6 } } });

const bctx = await browser.newContext({ viewport: { width: 480, height: 1100 }, serviceWorkers: 'block' });
const page = await bctx.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
/* GLB ON (niente __CPM_GLB=false): l'actor-presenter deve agganciarsi */
await page.addInitScript((sv) => { localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, mkSave());
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
await sleep(800);
await page.evaluate(() => window.__CPM_CAREER.dismiss());
await page.evaluate(() => window.__CPM_CAREER.step());
await sleep(2000);

const overlay = await page.evaluate(() => /La notte del Gala/i.test(document.body.innerText));
if (!overlay) issues.push('overlay gala assente');
await sleep(4500); /* attesa aggancio actor GLB */
const diag = await page.evaluate(() => window.__CPM_ACTOR_G || null);
console.log('ACTOR_G DIAG:', JSON.stringify(diag));
/* [7.144.0] diag ad ARRAY: uomo + donna, entrambi con lHand (la busta passa di mano) */
if (!diag || !diag.length) issues.push('__CPM_ACTOR_G assente (nessun actor agganciato)');
else { if (diag.length < 2) issues.push('attesi 2 presentatori (uomo+donna), agganciati ' + diag.length);
  diag.forEach((d, i) => { if (!(d.bones || []).includes('lHand')) issues.push(`actor ${i}: osso lHand non matchato (busta orfana)`); }); }
await page.screenshot({ path: 'out/gala-glb-busta.png' });
console.log('→ out/gala-glb-busta.png  (atto 1 · DONNA con la busta)');

/* avanza al reveal del 1° premio (beat 3), poi al 2° ATTO: la busta deve PASSARE ALL'UOMO */
const clickBtn = (rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return true; } return false; }, rx);
await clickBtn('Apri la busta'); await sleep(900);
if (await page.evaluate(() => /Il secondo posto/i.test(document.body.innerText))) { await clickBtn('Il secondo posto'); await sleep(700); }
if (await page.evaluate(() => /e il vincitore è/i.test(document.body.innerText))) { await clickBtn('e il vincitore è'); await sleep(1600); }
await page.screenshot({ path: 'out/gala-glb-reveal.png' });
console.log('→ out/gala-glb-reveal.png');
const next = await clickBtn('Il prossimo premio'); await sleep(2200);
if (!next) issues.push('secondo atto non raggiungibile (bottone assente)');
await page.screenshot({ path: 'out/gala-glb-act2.png' });
console.log('→ out/gala-glb-act2.png  (atto 2 · UOMO con la busta)');

await browser.close(); srv.close();
console.log(issues.length ? '❌ ISSUES\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ gala GLB-ON: actor presentatore agganciato');
process.exit(issues.length ? 1 : 0);
