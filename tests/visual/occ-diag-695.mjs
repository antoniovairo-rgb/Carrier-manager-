import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const page = await ctx.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Od' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 9200, policy: 'seeded', tickMs: 300 }));
for (let k = 0; k < 900; k++) { await sleep(250);
  const c = await page.evaluate(() => { const st = window.__CPM_STATE && window.__CPM_STATE(); return st ? st.clock : null; });
  if (c != null && c >= 89) break; }
console.log(JSON.stringify(await page.evaluate(() => ({ g: window.__CPM_OCC695G || null, occ: window.__CPM_OCC695 || null, gk: window.__CPM_GK695 || null })), null, 1));
await b.close(); srv.close();
