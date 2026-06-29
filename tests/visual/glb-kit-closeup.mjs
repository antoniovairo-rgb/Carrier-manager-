/* Cattura ravvicinata kit (Step A): forza una situation, resta in hl_choose (camera vicina all'eroe),
   freeze, screenshot canvas. Verifica visiva separazione maglia/pantaloncini/calzettoni. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, freeze, canvasShot, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/glb-gestures');
fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
await openMatch(page, port);
await sleep(3500);
for (const gi of [0, 30, 60]) {
  await forceSituation(page, gi, { settle: 900, choose: true });
  await sleep(400); await freeze(page); await sleep(150);
  const buf = await canvasShot(page);
  const f = path.join(OUT, `kit-closeup-gi${gi}.png`); fs.writeFileSync(f, buf);
  console.log('→', path.basename(f));
  await page.evaluate(() => { window.__CPM_FROZEN = false; });
}
console.log('console errors:', errs.length ? errs.slice(0, 5) : '(nessuno)');
await browser.close(); srv.close();
