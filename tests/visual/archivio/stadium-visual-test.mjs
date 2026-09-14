/* Screenshot-test STADI S2 (5.88.0, non-gate): un frame del campo per OGNI template architettonico
   (forzato via __CPM_STADIUM_TPL_FORCE) → collaudo visivo del PO: out/stadiums/<template>.png.
   Verifica anche che ogni template monti senza pageerror. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/stadiums'); fs.mkdirSync(OUT, { recursive: true });

const TEMPLATES = ['provincia', 'comunale', 'storico_it', 'moderno_it', 'inglese', 'tedesco', 'spagnolo', 'francese', 'olandese', 'sudamericano'];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
let fails = 0;
for (const tpl of TEMPLATES) {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript((t) => { window.__CPM_GLB = false; window.__CPM_STADIUM_TPL_FORCE = t; }, tpl);
  try {
    await openMatch(page, port);
    await page.evaluate(() => { window.__CPM_FORCE_SIT(0, true, { x: 60, y: 50 }); });
    await sleep(900);
    const canvas = await page.$('canvas');
    if (canvas) await canvas.screenshot({ path: path.join(OUT, tpl + '.png') });
    console.log(`${errs.length === 0 && canvas ? '✅' : '❌'} ${tpl.padEnd(14)} pageerrors: ${errs.length}${errs.length ? ' → ' + errs[0] : ''}`);
    if (errs.length || !canvas) fails++;
  } catch (e) { console.log(`❌ ${tpl.padEnd(14)} ${e.message}`); fails++; }
  await page.close();
}
console.log(`\nscreenshot → tests/visual/out/stadiums/`);
console.log(fails === 0 ? '✅ TUTTI I TEMPLATE MONTANO' : `❌ ${fails} template con problemi`);
await browser.close(); srv.close();
process.exit(fails === 0 ? 0 : 1);
