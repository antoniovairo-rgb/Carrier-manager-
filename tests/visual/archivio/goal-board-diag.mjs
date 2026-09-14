/* [7.8.13 collaudo tester «non si vedono i cartelloni»] verifica i cartelloni ELEVORA dietro la porta nello
   stadio del Cagliari (cag) di GIORNO (come lo screenshot) → devono essere VISIBILI e DIETRO la porta. */
import { startServer, launchBrowser, installCdnRoutes, sleep, canvasShot, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
import { PNG } from 'pngjs';
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
const hashStr = s => { let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; } return h; };
const hours = [12,14,15,15,15,17,18,20,20,21,21];
let dayWk = 1; for (let wk = 1; wk <= 38; wk++) { if (hours[Math.abs(hashStr('koh_' + (wk*37 + 2*7 + wk))) % 11] < 19) { dayWk = wk; break; } }
console.log('settimana giorno:', dayWk);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript((wk) => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: { name: 'Diag', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: wk, age: 24, ovr: 78, tutorialDone: true,
    club: { id: 'cag', n: 'FC Sardo', a: 'CAG', p: 65, c: '#dc2626', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Lega A' },
    stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
    form: 76, morale: 78, fatigue: 8, contract: { duration: 3, wage: 9000, expiresAtSeason: 5 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (e) {}
}, dayWk);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 45000 });
await sleep(1500);
for (const re of [/CONTINUA/i, /Riprendi/i, /Continua/i]) { const ok = await page.evaluate((rs) => { const rx = new RegExp(rs, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => rx.test(e.textContent || '')); if (el) { el.click(); return true; } return false; }, re.source); if (ok) break; }
await sleep(1200);
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
for (let a = 0; a < 16 && !(await page.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function')); a++) {
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); const pm = C.playMatch ? C.playMatch() : 'nomatch'; if (pm !== true) { const r = C.step(); if (String(r).startsWith('blocked')) C.clearTournaments && C.clearTournaments(); } });
  await sleep(900);
}
for (let a = 0; a < 20 && !(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function')); a++) {
  await page.evaluate(() => { const rx = /Formazioni|Salta|Entra|Gioca/i; const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => rx.test(e.textContent || '')); if (el) el.click(); }); await sleep(700);
}
if (await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function')) await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 5, policy: 'seeded' }));
await sleep(4000);
let best = null;
for (let i = 0; i < 14; i++) {
  await sleep(1000);
  const ph = await page.evaluate(() => (window.__CPM_PROBE ? window.__CPM_PROBE().phase : null));
  if (ph !== 'playing') continue;
  best = await canvasShot(page);
  fs.writeFileSync(path.join(OUT, `goal-board-${i}.png`), best);
}
if (best) {
  const png = PNG.sync.read(best); const x0 = Math.floor(png.width*0.30), x1 = Math.floor(png.width*0.72), y0 = Math.floor(png.height*0.30), y1 = Math.floor(png.height*0.48), sc = 4;
  const w = x1-x0, h = y1-y0; const out = new PNG({ width: w*sc, height: h*sc });
  for (let y=0;y<h*sc;y++) for (let x=0;x<w*sc;x++){ const sx=x0+Math.floor(x/sc),sy=y0+Math.floor(y/sc),s=(png.width*sy+sx)<<2,d=(out.width*y+x)<<2; out.data[d]=png.data[s];out.data[d+1]=png.data[s+1];out.data[d+2]=png.data[s+2];out.data[d+3]=255; }
  fs.writeFileSync(path.join(OUT, `goal-board-zoom.png`), PNG.sync.write(out)); console.log('zoom salvato');
}
console.log('→ out/goal-board-*.png · pageerr', errs.length ? errs.slice(0, 3) : 0);
await browser.close(); srv.close();
