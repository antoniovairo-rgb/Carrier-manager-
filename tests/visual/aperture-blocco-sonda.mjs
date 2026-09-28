#!/usr/bin/env node
/* [7.999.39 sonda — blocco all'apertura delle scene] Partita vera, coda reattiva come camera-step-census-test; a ogni apertura di
   scena (fase hl_intro/hl_choose dopo il gioco) si registra il long task piu' lungo nei 4 s successivi. Sola lettura.
   CPM_GLB=1 corpi accesi · CPM_SCENES (default 5). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const GLB = process.env.CPM_GLB === '1', N = +(process.env.CPM_SCENES || 5);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(o => { if (!o.glb) window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__LT = [];
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__LT.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {} }, { glb: GLB });
await openMatch(page, port, { skipLoadAll: true }); await sleep(GLB ? 3000 : 800);
if (process.env.CPM_ATTESA) { await page.waitForFunction(() => !!window.__CPM_GLB_READY, null, { timeout: 90000 }).catch(() => {}); await sleep(+process.env.CPM_ATTESA); }
const aperture = []; let prev = null; const t0 = Date.now();
while (aperture.length < N && Date.now() - t0 < 420000) {
  const r = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), t: performance.now() })).catch(() => null);
  const ph = r && r.ph;
  if (ph === 'ended' || ph === 'ceremony') { await openMatch(page, port, { skipLoadAll: true }); prev = null; continue; }
  if (ph && /^hl_(intro|move|choose)/.test(ph) && !(prev && /^hl/.test(prev))) aperture.push(r.t);
  if (ph === 'playing') await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); }).catch(() => {});
  if (ph === 'hl_choose') await page.evaluate(() => { try { window.__CPM_RESOLVE(0); } catch (e) {} }).catch(() => {});
  if (process.env.CPM_TELE && ph !== prev) { const tl = await page.evaluate(() => [...document.querySelectorAll('canvas')].map(c => c.width + 'x' + c.height + (c.getContext && c.__ctxGL ? '' : '') + '/' + Math.round(c.getBoundingClientRect().height))).catch(() => []); console.log('fase ' + ph + ' · tele ' + tl.join(' ')); }
  prev = ph; await sleep(100);
}
await sleep(4000);
const LT = await page.evaluate(() => window.__LT).catch(() => []);
await b.close(); srv.close();
aperture.forEach((t, i) => { const lt = LT.filter(([s]) => s > t - 1500 && s < t + 4000); const m = lt.reduce((a, [, d]) => Math.max(a, d), 0);
  console.log(`scena ${i + 1}: long task massimo ${Math.round(m)} ms · somma ${Math.round(lt.reduce((a, [, d]) => a + d, 0))} ms`); });
