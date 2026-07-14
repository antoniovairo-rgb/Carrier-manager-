#!/usr/bin/env node
/* [7.50.0 MIXED ZONE 2.0] SCREENSHOT PROBE GLB-ON — la scena intervista coi modelli CH38 veri:
   boot con GLB attivo (niente __CPM_GLB=false), forceInterview su win/loss/draw, attesa aggancio GLB,
   screenshot per collaudo visivo (out/interview-glb-<ctx>.png). Non-gate, iterazione visiva. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const ctxOpt = { viewport: { width: 480, height: 1000 }, serviceWorkers: 'block' };/* il SW bypassa le route CDN al 2° load */
const issues = [];

const save = { phase: 'career', player: { name: 'GLB Probe', nation: 'Italia', avatarId: Number(process.env.IV_AVATAR || 7), proStatus: 'pro', season: 3, week: 10, weekLived: true, age: 23, ovr: 76, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, drawSeen: 3, squadRole: 'titolare', coachTrust: 80, value: 20, popularity: 50,
  goals: 6, assists: 2, matches: 9, matchHistory: [{ opponent: 'FC Test', rating: 7.2, goals: 1, assists: 0, won: true, drew: false, homeScore: 2, awayScore: 1 }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 } } };

const bctx = await browser.newContext(ctxOpt);
const page = await bctx.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript((o) => { localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await page.evaluate(() => window.__CPM_CAREER.dismiss());
await sleep(400);

for (const c of (process.env.IV_CTX ? [process.env.IV_CTX] : ['win', 'loss'])) {
  const r = await page.evaluate((cc) => window.__CPM_CAREER.forceInterview(cc), c);
  if (r !== true) { issues.push(`forceInterview(${c}) fallita: ` + r); continue; }
  await sleep(5200); /* attesa aggancio GLB (prefetch al boot → in cache, ma il clone/kit richiede qualche frame) */
  await page.screenshot({ path: `out/interview-glb-${c}.png` });
  console.log(`ctx ${c} → out/interview-glb-${c}.png`);
  /* chiudi rispondendo (primo bottone tono) per poter forzare il ctx successivo */
  try { await page.getByRole('button').filter({ hasText: /Diplomatico|Ambizioso|Umile/ }).first().click({ timeout: 4000 }); } catch (e) { issues.push(`(${c}) bottone risposta non trovato`); }
  await sleep(2400);
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ ISSUES\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ screenshot GLB-ON generati');
process.exit(issues.length ? 1 : 0);
