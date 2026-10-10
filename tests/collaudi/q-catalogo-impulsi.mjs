#!/usr/bin/env node
/* Zona Q (collaudo 7.999.155) — censimento del CATALOGO DEGLI IMPULSI: effetto DICHIARATO per ogni scelta.
   Sola lettura: legge window.__CPM_IMPULSES (src/03-eventi-narrativi.jsx, esposto al caricamento).
   Non applica nulla. Output: JSON su stdout in tests/collaudi/out/q-catalogo.json.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node q-catalogo-impulsi.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, __dirname as VIS } from '../visual/lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => Array.isArray(window.__CPM_IMPULSES) && window.__CPM_IMPULSES.length > 0, { timeout: 40000 });
await sleep(300);
const cat = await page.evaluate(() => window.__CPM_IMPULSES.map(im => ({
  id: im.id, cat: im.cat || null, cond: typeof im.cond === 'function',
  choices: (im.choices || []).map(c => ({ txt: c.txt, ef: c.ef || {} })),
})));
await page.close(); await b.close(); srv.close();

const out = path.join(path.dirname(new URL(import.meta.url).pathname), 'out');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'q-catalogo.json'), JSON.stringify(cat, null, 1));
const scelte = cat.reduce((n, im) => n + im.choices.length, 0);
const senzaEf = cat.flatMap(im => im.choices.filter(c => !Object.keys(c.ef).length).map(c => `${im.id} «${c.txt}»`));
console.log(`impulsi=${cat.length} scelte=${scelte} scelteSenzaEffetto=${senzaEf.length}`);
senzaEf.forEach(s => console.log('  SENZA EF: ' + s));
