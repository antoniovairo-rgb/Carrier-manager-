#!/usr/bin/env node
/* Collaudo 7.999.171 — sessione di CARRIERA (save fixture), GLB acceso: ingresso/walkout + due partite di fila nella stessa pagina. Sola misura. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, canvasShot } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const OUT = '../../docs/collaudi/foto-release-7.999.171-3d';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_REALWAIT = 1;
  window.__F = { n: 0 }; (function l() { window.__F.n++; requestAnimationFrame(l); })();
  localStorage.setItem('cpm-v3', JSON.stringify(s)); }, SAVE);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const out = [];
for (let g = 0; g < 2; g++) {
  const R = { g, phases: [], shots: [] }; const t0 = Date.now();
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const info = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd && window.__CPM_CAREER.thisWeekMd()); R.md = info;
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  let prev = null, walkShots = 0, fpsStart = null, autop = false, lastT = Date.now();
  const heap = () => page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null).catch(() => null);
  R.heap0 = await heap();
  while (Date.now() - t0 < 420000) {
    const p = await ph();
    if (p !== prev) { R.phases.push([Math.round((Date.now() - t0) / 1000), p]); prev = p; }
    if (p === 'matchday' || p === 'formations') {
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); });
      await sleep(800); continue; }
    if (p === 'walkout' && walkShots < 5) { await sleep(walkShots ? 6000 : 2500);
      try { await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' }); } catch (e) {}
      const f = `c${g}-walkout-${walkShots}.png`; fs.writeFileSync(`${OUT}/${f}`, await canvasShot(page)); R.shots.push(f); walkShots++; continue; }
    if (p === 'walkout' && !autop) { /* lascia finire il walkout con l'autoplay */ }
    if (p === 'playing' && !autop) { autop = true; fpsStart = await page.evaluate(() => ({ n: window.__F.n, t: performance.now() })); await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 })); }
    if (p === 'ceremony' || p === 'ended') { await sleep(1500); const f = `c${g}-fine.png`; try { fs.writeFileSync(`${OUT}/${f}`, await canvasShot(page)); R.shots.push(f); } catch (e) {} break; }
    await sleep(400);
  }
  const fe = await page.evaluate(() => ({ n: window.__F.n, t: performance.now() }));
  R.fps = fpsStart ? +((fe.n - fpsStart.n) / ((fe.t - fpsStart.t) / 1000)).toFixed(2) : null; R.heap1 = await heap(); R.dur = Math.round((Date.now() - t0) / 1000);
  R.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE()).catch(() => null);
  R.ceremonyKind = await page.evaluate(() => (window.__CPM_CER425 && window.__CPM_CER425.beats) || null).catch(() => null);
  console.log(JSON.stringify(R)); out.push(R);
  if (g === 0) { /* chiudi la partita e torna alla carriera */
    for (let k = 0; k < 8; k++) { await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Risultati|Continua|Chiudi|Torna|Avanti|Vai/i.test(b.textContent || '')); if (x) x.click(); }); await sleep(1500); }
    await sleep(2000); }
}
fs.writeFileSync(`${OUT}/carriera-dati.json`, JSON.stringify({ out, errs }));
console.log('pageerr', errs.length, errs.slice(0, 3));
await b.close(); srv.close();
