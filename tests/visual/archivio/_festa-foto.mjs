import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const OUT='/home/user/cm-poc/docs/collaudo-testi/festa';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 18 }; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
await openMatch(page, port, { skipLoadAll: true, name: 'Festa2' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
let k = 0; const t0 = Date.now();
while (Date.now() - t0 < 300000) { const f = await page.evaluate(() => !!document.querySelector('[data-cpm="festa942"]')).catch(() => false);
  if (f) { for (const d of [300, 1200, 2500, 4000]) { await sleep(d === 300 ? 300 : d - (k ? 0 : 0)); k++; await page.screenshot({ path: `${OUT}/festa942-${k}.png` }); } console.log(await page.evaluate(() => document.querySelector('[data-cpm="festa942"]').innerText.replace(/\n/g, ' | '))); break; }
  const ph = await page.evaluate(() => window.__CPM_PHASE()).catch(() => null); if (ph === 'ended') { console.log('finita senza festa', JSON.stringify(await page.evaluate(() => window.__CPM_FESTA942))); break; } await sleep(300); }
await b.close(); srv.close();
