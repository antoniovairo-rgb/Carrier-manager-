/* [23/09] Schermata di fine partita (provino): gioca col pilota automatico fino a `ended` e fotografa il riepilogo a 412 e 1250 px.
   Conta testi con carattere a grazie e la scritta «Enter». */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, 'fine-partita'); fs.mkdirSync(out, { recursive: true });
const srv = await startServer(); const b = await launchBrowser();
const page = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
await page.addInitScript(() => { window.__CPM_PRESENT = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
await installCdnRoutes(page);
await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Fine' });
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7 })).catch(() => {});
const t0 = Date.now(); let hl = 0;
while (Date.now() - t0 < 260000) { const f = await page.evaluate(() => window.__CPM_PHASE?.() || null).catch(() => null); if (f === 'ended') break;
  if (f === 'hl_choose') { await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k % 3), hl++).catch(() => {}); await sleep(1500); }
  if (f === 'hl_result') { await sleep(2000); await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(y => /Continua/i.test(y.textContent || '')); if (x) x.click(); }).catch(() => {}); }
  await sleep(400); }
await sleep(2500);
const R = await page.evaluate(() => { let serif = 0, enter = 0; document.querySelectorAll('body *').forEach(e => { if (e.children.length || !(e.textContent || '').trim()) return; if (/serif/i.test(getComputedStyle(e).fontFamily) && !/sans-serif/i.test(getComputedStyle(e).fontFamily)) serif++; if (/^\s*\[?Enter\]?\s*$/.test(e.textContent)) enter++; }); return { fase: window.__CPM_PHASE?.(), serif, enter }; });
await page.screenshot({ path: path.join(out, 'fine-412.png') }); await page.setViewportSize({ width: 1250, height: 640 }); await sleep(800); await page.screenshot({ path: path.join(out, 'fine-1250.png') });
console.log(JSON.stringify(R)); await b.close(); srv.close();
