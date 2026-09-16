import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(ctx); const page = await ctx.newPage();
await page.addInitScript(() => { window.__CPM_GLB = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
for (let i = 0; i < 40; i++) { const f = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (f === 'playing') break; await sleep(500); }
await sleep(4000);
const g = await page.evaluate(() => {
  const R = (s) => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return { t: Math.round(b.top), b: Math.round(b.bottom), h: Math.round(b.height), w: Math.round(b.width) }; };
  const pan = document.querySelector('[data-cpm="pannello918"]');
  const figli = pan ? Array.from(pan.children).map(c => { const b = c.getBoundingClientRect(); return { t: Math.round(b.top), b: Math.round(b.bottom) }; }) : [];
  return { viewport: window.innerHeight, vista2d: R('[data-cpm="vista2d"]'), campo: R('[data-cpm="campo2d"]'), pannello: R('[data-cpm="pannello918"]'), voci: R('[data-cpm="voci"]'), com661: R('[data-cpm="com661"]'), figli };
});
console.log(JSON.stringify(g, null, 1));
await browser.close(); server.close();
