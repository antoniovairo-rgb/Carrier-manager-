#!/usr/bin/env node
/* [7.53.1 BL-13] PROBE — SAVE_VERSION come gate di migrazione reale:
   (1) save V7-shaped (senza bankBalance/perkTrainer/clubEvo, saveVersion:7) → al mount la migration
       riempie i campi v8/v9, TIMBRA player.saveVersion=SAVE_VERSION e scrive migratedFrom=7;
       l'autosave persistito porta lo stamp.
   (2) save GIÀ alla versione corrente → nessun migratedFrom inventato.
   (3) idempotenza: reboot del save migrato → migratedFrom resta 7 (non riscritto). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const baseP = (sv, extra) => ({ name: 'Stamp Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 6, weekLived: false, age: 22, ovr: 70, tutorialDone: true, campDone: true, jerseyNumSeason: 2, presidentModalSeason: 2, drawSeen: 2, squadRole: 'titolare', coachTrust: 70, value: 8, popularity: 40,
  goals: 2, assists: 1, matches: 4, matchHistory: [],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 65, fatigue: 10, contract: { duration: 2, wage: 4000, expiresAtSeason: 4 }, saveVersion: sv, ...(extra || {}) });

async function bootAndRead(save) {
  const bctx = await browser.newContext({ serviceWorkers: 'block' });
  const page = await bctx.newPage();
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
  await sleep(600);
  /* attesa del FLUSH dell'autosave (lezione 7.41.0: la lettura immediata può precederlo) */
  const out = await page.waitForFunction(() => {
    try { const d = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); return (d && d.player && d.player.saveVersion === 9) ? d : false; } catch (e) { return false; }
  }, null, { timeout: 20000 }).then(h => h.jsonValue());
  await bctx.close();
  return out;
}

// (1) v7-shaped
const d1 = await bootAndRead({ phase: 'career', player: baseP(7), saveVersion: 7 });
const p1 = d1.player;
console.log('(1) v7 →', JSON.stringify({ sv: p1.saveVersion, from: p1.migratedFrom, bank: typeof p1.bankBalance, clubEvo: !!p1.clubEvo, payloadSv: d1.saveVersion }));
if (p1.saveVersion !== 9) issues.push('(1) player.saveVersion non timbrato a 9: ' + p1.saveVersion);
if (p1.migratedFrom !== 7) issues.push('(1) migratedFrom atteso 7: ' + p1.migratedFrom);
if (typeof p1.bankBalance !== 'number') issues.push('(1) campo v8 bankBalance non riempito');
if (d1.saveVersion !== 9) issues.push('(1) payload saveVersion non 9: ' + d1.saveVersion);

// (2) già v9 → niente migratedFrom inventato
const d2 = await bootAndRead({ phase: 'career', player: baseP(9, { bankBalance: 100, perkTrainer: false, perkNutrition: false, clubEvo: { fanbase: 50, stadiumTier: 0, budget: 10 } }), saveVersion: 9 });
console.log('(2) v9 →', JSON.stringify({ sv: d2.player.saveVersion, from: d2.player.migratedFrom }));
if (d2.player.migratedFrom != null) issues.push('(2) migratedFrom inventato su save già corrente: ' + d2.player.migratedFrom);
if (d2.player.saveVersion !== 9) issues.push('(2) saveVersion alterato: ' + d2.player.saveVersion);

// (3) idempotenza: reboot del risultato di (1) → migratedFrom resta 7
const d3 = await bootAndRead(d1);
console.log('(3) reboot →', JSON.stringify({ sv: d3.player.saveVersion, from: d3.player.migratedFrom }));
if (d3.player.migratedFrom !== 7) issues.push('(3) migratedFrom non idempotente: ' + d3.player.migratedFrom);
if (d3.player.saveVersion !== 9) issues.push('(3) saveVersion perso al reboot: ' + d3.player.saveVersion);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ SAVE STAMP OK (v7→9 con origine · v9 intatto · idempotente)');
process.exit(issues.length ? 1 : 0);
