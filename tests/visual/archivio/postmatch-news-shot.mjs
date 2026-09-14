#!/usr/bin/env node
/* [7.99.0] PROBE — schermata ENDED = GIORNALE ricco. Gioca una partita reale (autoplay) fino a `ended`,
   poi screenshotta il riepilogo: deve contenere le sezioni giornale (L'analisi / Dalle altre testate /
   Le parole del protagonista / MIGLIORE IN CAMPO / LA CURVA) e il bottone «Torna alla dashboard». */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 460, height: 950 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: { name: 'Giovanni Pisano', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 6, age: 24, ovr: 79,
    tutorialDone: true, club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f0b33a', nat: '🇮🇹', lg: 'Lega A' },
    stats: { 'velocità': 80, tecnica: 79, fisico: 77, 'mentalità': 79, tiro: 82, passaggio: 78, dribbling: 80, posizionamento: 80 },
    form: 78, morale: 80, fatigue: 6, contract: { duration: 3, wage: 12000, expiresAtSeason: 6 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (e) {}
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 45000 });
await sleep(1200);
for (const re of [/CONTINUA/i, /Riprendi/i]) { await page.evaluate((rs) => { const rx = new RegExp(rs, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => rx.test(e.textContent || '')); if (el) el.click(); }, re.source); await sleep(400); }
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
for (let a = 0; a < 16 && !(await page.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function')); a++) {
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); const pm = C.playMatch ? C.playMatch() : 'nomatch'; if (pm !== true) { const r = C.step(); if (String(r).startsWith('blocked')) C.clearTournaments && C.clearTournaments(); } });
  await sleep(900);
}
for (let a = 0; a < 20 && !(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function')); a++) {
  await page.evaluate(() => { const rx = /Formazioni|Salta|Entra|Gioca/i; const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => rx.test(e.textContent || '')); if (el) el.click(); }); await sleep(700);
}
if (await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function')) await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 9, policy: 'seeded', tickMs: 30 }));
// wait for ended
let ended = false;
for (let i = 0; i < 60; i++) { await sleep(700); const ph = await page.evaluate(() => (window.__CPM_PROBE ? window.__CPM_PROBE().phase : (window.__CPM_PHASE || null))); if (ph === 'ended') { ended = true; break; } }
await sleep(600);
const body = await page.evaluate(() => document.body.innerText || '');
const has = s => body.toLowerCase().includes(s.toLowerCase());
const checks = { ended, analisi: has("L'analisi"), altreTestate: has('Dalle altre testate'), protagonista: has('Le parole del protagonista'), migliore: has('MIGLIORE IN CAMPO'), curva: has('LA CURVA'), dashboard: has('Torna alla dashboard') };
console.log('checks:', JSON.stringify(checks));
await page.screenshot({ path: path.join(OUT, 'postmatch-news.png'), fullPage: true });
console.log('→ out/postmatch-news.png · pageerr', errs.length ? errs.slice(0, 3) : 0);
const bad = Object.entries(checks).filter(([k, v]) => !v).map(([k]) => k);
await browser.close(); srv.close();
console.log((bad.length || errs.length) ? '❌ mancano: ' + bad.join(',') + (errs.length ? ' | pageerr' : '') : '✅ GIORNALE OK');
process.exit((bad.length || errs.length) ? 1 : 0);
