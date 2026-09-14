/* [7.134.0] verifica la nav bar della Home (mobile + desktop) coerente con quella della carriera. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { mkdirSync } from 'node:fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out'); mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const errs = [];
async function shot(w, h, tag) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: w, height: h });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`[${tag}] ` + String(e.message).slice(0, 140)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1800);
  const nav = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('.cpm-nav-tabs button')].map(b => (b.textContent || '').trim());
    const bar = document.querySelector('.cpm-nav-bar');
    return { has: !!bar, labels };
  });
  await page.screenshot({ path: path.join(OUT, `home-navbar-${tag}.png`) });
  console.log(`[${tag}] nav=${nav.has} · cells=${JSON.stringify(nav.labels)}`);
  await page.close();
  return nav;
}
const m = await shot(480, 1000, 'mobile');
const d = await shot(1200, 900, 'desktop');
await browser.close(); srv.close();
const ok = m.has && d.has && m.labels.length === 4 && m.labels.join('').includes('Opzioni') && errs.length === 0;
console.log(ok ? '✅ home navbar OK (4 celle, mobile+desktop)' : '❌ problema', errs.slice(0, 3));
process.exit(ok ? 0 : 1);
