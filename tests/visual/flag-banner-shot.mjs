#!/usr/bin/env node
/* [7.148.0] PROBE — banner campionato con sfondo bandiera nazionale nel MatchdayCard.
   Boot carriera a una gara di lega casalinga, screenshot del banner. CLUB via env (default Lega A). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = JSON.parse(process.env.FB_CLUB || '{"id":"lec","n":"FC Salento","a":"LEC","p":62,"c":"#f5c518","c2":"#dc2626","nat":"🇮🇹","lg":"Lega A"}');
const TAG = process.env.FB_TAG || 'IT';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const errors = [];
const baseSave = { phase: 'career', player: { name: 'Flag Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 22, ovr: 78, tutorialDone: true, campDone: true, jerseyNum: 10,
  presidentModalSeason: 3, drawSeen: 3, mercatoSeen: 3, seasonPledge: { season: 3, tone: 'equilibrato' },
  club: CLUB,
  stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 74, morale: 72, fatigue: 8, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 } } };

const p1 = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(p1);
p1.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await p1.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, baseSave);
await p1.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await p1.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1400);
try { await p1.getByText('CONTINUA', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await sleep(1400);
const fhw = await p1.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const ws = ((s && s.player.calendar) || []).filter(m => m && !m.type && m.isHome && m.week > 2).map(m => m.week); return ws.length ? Math.min(...ws) : null; });
await p1.close();
if (!fhw) { console.log('❌ nessuna casalinga di lega (W>2)'); await browser.close(); srv.close(); process.exit(1); }
console.log(TAG, '· casalinga scelta: W' + fhw);

const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(page);
page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, { ...baseSave, player: { ...baseSave.player, week: fhw, weekLived: true } });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
await sleep(1000);
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 15000 });
const r = await page.evaluate(() => window.__CPM_CAREER.playMatch());
console.log(TAG, 'playMatch →', r);
await sleep(1800);
await page.screenshot({ path: `out/flag-banner-${TAG}.png` });
console.log(TAG, '→ out/flag-banner-' + TAG + '.png', errors.length ? ('⚠ ' + errors[0]) : '');
await browser.close(); srv.close();
process.exit(errors.length ? 1 : 0);
