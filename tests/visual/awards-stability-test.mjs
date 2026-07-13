#!/usr/bin/env node
/* [7.24.4] TEST — NOMI DEI PREMI STABILI (collaudo PO «al galà vengono indicati altri nomi!»): il season-close
   MUTA il player (trofei, leagueRecordOverrides) e i premi venivano RIGENERATI a ogni ingresso → un reload tra
   gala e schermata cambiava i candidati. Ora snapshot p.lastAwards persistito: (1) primo ingresso → nomi del
   Trofeo d'Oro letti dal DOM ed uguali allo snapshot; (2) RELOAD (nuova pagina, stesso storage) + rientro →
   nomi IDENTICI al primo ingresso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = () => ({ phase: 'career', player: { name: 'Stab Premi', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 39, weekLived: true, age: 24, ovr: 84, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3,
  goals: 31, assists: 7, matches: 30, /* capocannoniere probabile → record battuto → override persistito = il caso che divergeva */
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 84, tecnica: 83, fisico: 82, 'mentalità': 84, tiro: 86, passaggio: 83, dribbling: 85, posizionamento: 84 },
  form: 76, fatigue: 10, morale: 74, popularity: 55, contract: { duration: 3, wage: 15000, expiresAtSeason: 6 } } });

const boot = async (page) => {
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1100);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await sleep(900);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await page.evaluate(() => window.__CPM_CAREER.step());
  await sleep(1600);
  try { await page.getByText('Salta il gala', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await sleep(900);
};
const readTop3 = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('cpm-v3'));
  const snap = s.player.lastAwards && s.player.lastAwards.aw && s.player.lastAwards.aw.palloneOro && s.player.lastAwards.aw.palloneOro.top3;
  return { snap: (snap || []).map(c => c.name), body: document.body.innerText.slice(0, 40000) };
});

const ctx = await browser.newContext({ serviceWorkers: 'block' });/* ⚠️ il SW registrato dalla 1ª pagina intercetterebbe la 2ª bypassando le route CDN (pattern kickoff-hold-test) */
const p1 = await ctx.newPage();
await installCdnRoutes(p1);
p1.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await p1.addInitScript((sv) => { window.__CPM_GLB = false; if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, mkSave());
await boot(p1);
const r1 = await readTop3(p1);
console.log('(1) snapshot top3:', JSON.stringify(r1.snap));
if (!r1.snap || r1.snap.length !== 3) issues.push('snapshot lastAwards assente/incompleto: ' + JSON.stringify(r1.snap));
const onScreen1 = r1.snap.every(n => r1.body.includes(n));
console.log('(1) nomi snapshot presenti a schermo:', onScreen1);
if (!onScreen1) issues.push('nomi del Trofeo d\'Oro a schermo ≠ snapshot (primo ingresso)');
await p1.close();
// (2) RELOAD: nuova pagina, stesso storage (stesso context/origin) → rientro nei premi → nomi identici
const p2 = await ctx.newPage();
await installCdnRoutes(p2);
p2.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await p2.addInitScript(() => { window.__CPM_GLB = false; });
await boot(p2);
const r2 = await readTop3(p2);
console.log('(2) top3 dopo reload:', JSON.stringify(r2.snap));
if (JSON.stringify(r1.snap) !== JSON.stringify(r2.snap)) issues.push('snapshot CAMBIATO dopo il reload: ' + JSON.stringify(r2.snap));
const onScreen2 = r2.snap.every(n => r2.body.includes(n));
if (!onScreen2) issues.push('nomi a schermo ≠ snapshot dopo il reload');
console.log('(2) stessi nomi a schermo:', onScreen2);
await p2.close();

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ PREMI STABILI OK (snapshot persistito · reload → stessi nomi al gala e in schermata)');
process.exit(issues.length ? 1 : 0);
