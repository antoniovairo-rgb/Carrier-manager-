/* [giro 283, PO-539] strumento di misura (non guardiano): ripete N volte la misura D14 di schermate-97 e registra, con lo stesso
   orologio della pagina (performance.now), (a) quando il gioco dichiara lo stacco (__CPM_CUTLIVE), (b) quando l'elemento nero dello
   stacco (il div `blackCut` di LiveMatch) e' nel DOM, (c) inizio/fine di ogni foto della sonda. CPM_N=giri (default 3). */
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import { INIT } from './lib/banco-g0.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const f = { w: 412, h: 915 }; const N = +(process.env.CPM_N || 3);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const luma = async (page) => { const buf = await page.screenshot({ clip: { x: 0, y: Math.round(f.h * 0.12), width: f.w, height: Math.round(f.h * 0.5) } }); const png = PNG.sync.read(buf);
  let s = 0, n = 0, neri = 0; for (let i = 0; i < png.data.length; i += 16) { const l = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]; s += l; n++; if (l < 12) neri++; } return { media: s / n, neri: neri / n }; };
for (let giro = 1; giro <= N; giro++) {
  const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [] });
  await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await openMatch(page, port, { skipLoadAll: true, name: 'Grafica Probe' });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  const ck0 = await page.evaluate(() => window.__CPM_CLOCK ? window.__CPM_CLOCK() : null);
  await page.waitForFunction((c) => window.__CPM_PHASE() === 'playing' && window.__CPM_CLOCK() > c, ck0, { timeout: 30000, polling: 20 }).catch(() => {});
  await page.evaluate(() => { const T = window.__T283 = []; let lv = null, ld = null, lp = null; const step = () => { const now = performance.now(); const v = !!(window.__CPM_CUTLIVE && window.__CPM_CUTLIVE()); const d = !!document.querySelector('div[style*="blackCut"]'); const p = window.__CPM_PHASE && window.__CPM_PHASE();
      if (v !== lv || d !== ld || p !== lp) { T.push({ t: Math.round(now), v, d, p }); lv = v; ld = d; lp = p; } }; setInterval(step, 5); const raf = () => { step(); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    window.__CPM_CER_HOLD = true; window.__CPM_T277 = performance.now(); window.__CPM_FORCE_CEREMONY({ light: true, name: 'Colpo fuori casa', festa: { titolo: 'Colpo fuori casa', punteggio: '2 – 3', avversario: 'FC Prova', casa: false, voci: [{ n: 1, et: 'gol', oro: true }] } }); });
  await page.waitForFunction(() => window.__CPM_PHASE() === 'ceremony', null, { timeout: 10000, polling: 10 }).catch(() => null);
  const t0 = Date.now(); const foto = [];
  for (const ms of [150, 500, 1000, 2000]) { while (Date.now() - t0 < ms) await sleep(20);
    for (let k = 0; k < 5; k++) { await page.waitForFunction(() => !(window.__CPM_CUTLIVE && window.__CPM_CUTLIVE()), null, { timeout: 8000, polling: 20 }).catch(() => {});
      const a = await page.evaluate(() => Math.round(performance.now())); const x = await luma(page); const z = await page.evaluate(() => [Math.round(performance.now()), !!(window.__CPM_CUTLIVE && window.__CPM_CUTLIVE())]);
      foto.push({ ms, k, a, z: z[0], vivoDopo: z[1], media: +x.media.toFixed(1), neri: Math.round(100 * x.neri) }); if (z[1]) continue; break; } }
  await sleep(300); const T = await page.evaluate(() => window.__T283);
  console.log(`\n=== giro ${giro}\n  tracciato (t, CUTLIVE, div blackCut nel DOM, fase):`); T.forEach(e => console.log(`   ${e.t}  vivo=${e.v ? 1 : 0}  div=${e.d ? 1 : 0}  ${e.p}`));
  console.log('  foto:'); foto.forEach(x => console.log(`   +${x.ms} k${x.k}  ${x.a}→${x.z} (${x.z - x.a} ms)  vivoDopo=${x.vivoDopo ? 1 : 0}  luma ${x.media}  neri ${x.neri}%${x.media < 40 ? '   <<< NERA' : ''}`));
  await ctx.close();
}
await b.close(); srv.close();
