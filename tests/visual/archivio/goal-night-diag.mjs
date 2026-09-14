/* [7.8.11 collaudo tester «sparita nuovamente la porta»] DIAGNOSTICO: partita di CARRIERA di NOTTE
   (sfondo tribune scuro) in fase PLAYING → cattura la porta LONTANA (away, +x) per verificare se il
   contorno scuro dei pali (7.8.7, pensato per la neve) la fa sparire contro le tribune scure. */
import { startServer, launchBrowser, installCdnRoutes, sleep, canvasShot, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
import { PNG } from 'pngjs';
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
// hashStr identico al gioco → precalcolo la settimana NOTTE (season 2)
const hashStr = s => { let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; } return h; };
const hours = [12,14,15,15,15,17,18,20,20,21,21];
let nightWk = 33; for (let wk = 1; wk <= 38; wk++) { if (hours[Math.abs(hashStr('koh_' + (wk*37 + 2*7 + wk))) % 11] >= 21) { nightWk = wk; break; } }
console.log('settimana notte:', nightWk);

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript((wk) => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: { name: 'Diag', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: wk, age: 24, ovr: 78, tutorialDone: true,
    club: { id: 'bre', n: 'FC Griffin', a: 'BRE', p: 69, c: '#dc2626', c2: '#f5f5f5', nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', lg: 'Premier Division' },
    stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
    form: 76, morale: 78, fatigue: 8, contract: { duration: 3, wage: 9000, expiresAtSeason: 5 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (e) {}
}, nightWk);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 45000 });
await sleep(1500);
// il phase non è persistito → si parte da HOME: clicca CONTINUA/Riprendi per caricare il save
for (const re of [/CONTINUA/i, /Riprendi/i, /Carica/i, /Continua/i]) {
  const ok = await page.evaluate((rs) => { const rx = new RegExp(rs, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => rx.test(e.textContent || '')); if (el) { el.click(); return true; } return false; }, re.source);
  if (ok) { console.log('cliccato', re.source); break; }
}
await sleep(1200);
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
for (let a = 0; a < 16 && !(await page.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function')); a++) {
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); const pm = C.playMatch ? C.playMatch() : 'nomatch';
    if (pm !== true) { const r = C.step(); if (String(r).startsWith('blocked')) C.clearTournaments && C.clearTournaments(); } });
  await sleep(900);
}
const inMatch = await page.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function');
console.log('in match:', inMatch);
// supera matchday→formazioni→walkout ed entra in PLAYING via autoplay (flusso reale)
for (let a = 0; a < 20 && !(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function')); a++) {
  await page.evaluate(() => { const rx = /Formazioni|Salta|Entra|Gioca/i; const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => rx.test(e.textContent || '')); if (el) el.click(); }); await sleep(700);
}
const hasAP = await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function');
console.log('autoplay disponibile:', hasAP);
if (hasAP) await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded' }));
await sleep(3000);
// cattura molti frame in PLAYING; salva quelli con palla AVANZATA verso la porta lontana (attack-zoom)
let best = null, bestBx = -1;
for (let i = 0; i < 18; i++) {
  await sleep(900);
  const st = await page.evaluate(() => { const p = window.__CPM_PROBE ? window.__CPM_PROBE() : null; const s = window.__CPM_STATE ? window.__CPM_STATE() : null; return { ph: p && p.phase, ball: s && s.ball }; });
  if (st.ph !== 'playing') continue;
  const buf = await canvasShot(page);
  const bx = (st.ball && typeof st.ball.gx === 'number') ? st.ball.gx : 0;
  console.log(`frame ${i}: playing · ball.gx=${bx}`);
  if (bx > bestBx) { bestBx = bx; best = buf; }
  fs.writeFileSync(path.join(OUT, `goal-night-${i}.png`), buf);
}
if (best) {
  fs.writeFileSync(path.join(OUT, `goal-night-attack.png`), best);
  const png = PNG.sync.read(best); const cropH = Math.floor(png.height * 0.40), y0 = Math.floor(png.height * 0.30);
  const crop = new PNG({ width: png.width, height: cropH });
  for (let y = 0; y < cropH; y++) for (let x = 0; x < png.width; x++) { const s = (png.width * (y + y0) + x) << 2, d = (png.width * y + x) << 2; crop.data[d]=png.data[s];crop.data[d+1]=png.data[s+1];crop.data[d+2]=png.data[s+2];crop.data[d+3]=255; }
  fs.writeFileSync(path.join(OUT, `goal-night-attack-crop.png`), PNG.sync.write(crop));
  console.log('miglior frame attack: ball.gx=', bestBx);
}
console.log('→ out/goal-night-*.png (+ crop) · pageerr', errs.length ? errs.slice(0, 3) : 0);
await browser.close(); srv.close();
