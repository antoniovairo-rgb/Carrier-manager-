/* [7.126.0] verifica visiva delle 5 varianti d'ingresso dalla panchina.
   Per ogni variante V=0..4 forza l'ingresso (hook __CPM_FORCE_SUBENTRY) e cattura 2 frame:
   ~corsa (subEntryT~2s) e ~arrivo (subEntryT~4s). Nessun pageerror = OK strutturale. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { mkdirSync } from 'node:fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out', 'sub-entry'); mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await page.setViewportSize({ width: 480, height: 860 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(2200);
const names = ['carica','concentrato','showman','veterano','esplosivo'];
for (let v = 0; v < 5; v++) {
  await page.evaluate((vv) => { window.__CPM_FORCE_SUBENTRY = vv; }, v);
  await sleep(2000); // ~corsa
  await page.screenshot({ path: path.join(OUT, `v${v}-${names[v]}-run.png`) });
  await sleep(2000); // ~arrivo
  await page.screenshot({ path: path.join(OUT, `v${v}-${names[v]}-arrival.png`) });
  await sleep(400);
}
console.log('→ out/sub-entry/*.png (5 varianti × 2 frame) · pageerr', errs.length ? errs.slice(0,3) : 0);
await browser.close(); srv.close();
process.exit(errs.length === 0 ? 0 : 1);
