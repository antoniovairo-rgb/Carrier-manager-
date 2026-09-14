/* [7.127.0] verifica visiva delle 5 varianti d'USCITA dal campo (sostituzione).
   Per ogni V: prima un ingresso forzato (riposiziona l'eroe in campo), poi l'uscita forzata;
   cattura ~camminata (subExitT~2.4s) e ~uscito (dopo la fine). 0 pageerror = OK strutturale. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { mkdirSync } from 'node:fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out', 'sub-exit'); mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await page.setViewportSize({ width: 480, height: 860 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(2200);
const names = ['applauso','saluto','thumbsup','deluso','stanco'];
for (let v = 0; v < 5; v++) {
  // riposiziona in campo con un ingresso forzato
  await page.evaluate((vv) => { window.__CPM_FORCE_SUBENTRY = vv; }, v);
  await sleep(4700);
  // uscita forzata
  await page.evaluate((vv) => { window.__CPM_FORCE_SUBEXIT = vv; }, v);
  await sleep(2400);
  await page.screenshot({ path: path.join(OUT, `v${v}-${names[v]}-walk.png`) });
  await sleep(3200);
  await page.screenshot({ path: path.join(OUT, `v${v}-${names[v]}-done.png`) });
  await sleep(300);
}
console.log('→ out/sub-exit/*.png (5 varianti × 2 frame) · pageerr', errs.length ? errs.slice(0,3) : 0);
await browser.close(); srv.close();
process.exit(errs.length === 0 ? 0 : 1);
