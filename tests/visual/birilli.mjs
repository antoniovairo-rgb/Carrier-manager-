/* [24/09 POC] BIRILLI — collaudo PO «dalle scene togli i birilli lego»: fotografa una partita 3D coi corpi veri e conta le figure
   primitive (sfera-testa) ancora in scena, per gruppo. CPM_ROSSO=<flag>. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const OUT = '../character-lab/birilli'; fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.CPM_ROSSO ? '-rosso' : '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript((r) => { window.__CPM_GLB = true; if (r) window[r] = true; }, process.env.CPM_ROSSO || '');
await openMatch(page, port); await sleep(6000);
for (const t of [0, 4000, 8000]) { await sleep(t ? 4000 : 0); await page.screenshot({ path: `${OUT}/partita-${t}${TAG}.png` }); }
console.log(JSON.stringify({ birilli: await page.evaluate(() => window.__CPM_BIRILLI23 || null), errori: errs }));
await b.close(); srv.close();
