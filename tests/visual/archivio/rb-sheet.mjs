/* batch-preview dei candidati Rocketbox: 1 vista full per GLB → contact sheet */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { readdirSync } from 'node:fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const glbs = readdirSync(OUT).filter(f => f.startsWith('rb-') && f.endsWith('.glb'));
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
for (const g of glbs) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 420, height: 760 });
  await installCdnRoutes(page);
  await page.goto(`http://localhost:${port}/tests/visual/out/michelle-viewer.html?m=full&glb=${encodeURIComponent('/tests/visual/out/' + g)}`, { waitUntil: 'load', timeout: 30000 });
  try { await page.waitForFunction(() => window.__READY, null, { timeout: 25000 }); } catch (e) {}
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, g.replace('.glb', '.png')) });
  console.log('→', g.replace('.glb', '.png'));
  await page.close();
}
await browser.close(); srv.close();
