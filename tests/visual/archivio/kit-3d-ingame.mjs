/* [7.8.3] cattura IN-GAME (camera di gioco reale, fase playing) con strisce forzate sulla squadra dell'eroe
   → verifica che le strisce si vedano DAL VIVO, non solo sul modello isolato. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 560, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_FORCE_KITPAT = 'stripes'; });
await openMatch(page, port, { skipLoadAll: true });
await sleep(6000); // lascia caricare il GLB + assestare la camera di gioco
for (let i = 0; i < 4; i++) {
  await sleep(1500);
  const buf = await page.locator('canvas').first().screenshot();
  fs.writeFileSync(path.join(OUT, `ingame-stripes-${i}.png`), buf);
}
console.log('catturati 4 frame playing → out/kit3d/ingame-stripes-*.png · pageerr', errs.length ? errs.slice(0, 3) : 0);
await browser.close(); srv.close();
