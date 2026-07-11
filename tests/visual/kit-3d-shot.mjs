/* [7.8.0] verifica EMPIRICA del pattern 3D sulla maglia CH38: forza il pattern sull'eroe (__CPM_FORCE_KITPAT),
   GLB ON, hl_choose (camera vicina), freeze, screenshot. Serve a decidere se le UV della maglia mappano le
   strisce in modo leggibile (altrimenti si tiene solo il 2D). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, freeze, canvasShot, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d');
fs.mkdirSync(OUT, { recursive: true });
const pat = process.argv[2] || 'stripes';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript((p) => { window.__CPM_GLB = true; window.__CPM_FORCE_KITPAT = p; }, pat);
await openMatch(page, port);
await sleep(4000);
await forceSituation(page, 0, { settle: 1000, choose: true });
await sleep(700); await freeze(page); await sleep(200);
const buf = await canvasShot(page);
const f = path.join(OUT, `hero-${pat}.png`); fs.writeFileSync(f, buf);
console.log('→', f, '· pageerror', errs.length ? errs.slice(0, 3) : 0);
await browser.close(); srv.close();
