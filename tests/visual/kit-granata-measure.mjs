/* [7.8.2] misura il colore RENDERIZZATO della maglia dell'eroe sotto le luci REALI del match, forzando
   heroKitCol a vari candidati granata (__CPM_FORCE_HEROKIT). Va in hl_choose (camera vicina all'eroe),
   freeze, e campiona il pixel centrale del busto dell'eroe. Sceglie il granata che NON degenera in rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, freeze, sleep, ROOT } from './lib/harness.mjs';
import { PNG } from 'pngjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d'); fs.mkdirSync(OUT, { recursive: true });
const cands = ['#6c1f2e', '#4a1620', '#3e141c', '#421a16', '#3a1414', '#4d1a1a'];
const rows = [];
for (const hex of cands) {
  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 700, height: 800 } });
  await installCdnRoutes(page);
  await page.addInitScript((h) => { window.__CPM_GLB = true; window.__CPM_FORCE_HEROKIT = h; }, hex);
  await openMatch(page, port);
  await sleep(4000);
  await forceSituation(page, 0, { settle: 1100, choose: true });
  await sleep(700); await freeze(page); await sleep(200);
  const buf = await page.locator('canvas').first().screenshot();
  await browser.close(); srv.close();
  const png = PNG.sync.read(buf);
  // campiona una griglia centrale-bassa (busto dell'eroe, che in hl_choose è al centro-basso)
  const cx = png.width >> 1, cy = Math.round(png.height * 0.62);
  const pick = [];
  for (let dy = -30; dy <= 30; dy += 6) for (let dx = -24; dx <= 24; dx += 6) {
    const i = ((cy + dy) * png.width + (cx + dx)) * 4; const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
    // considera solo pixel "rossastri" (kit), scarta verde prato/pelle/bianco
    if (r > 60 && r > g * 1.3 && r > b * 1.2 && !(r > 200 && g > 150)) pick.push([r, g, b]);
  }
  if (pick.length) { const avg = pick.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map(v => Math.round(v / pick.length)); rows.push({ hex, px: avg, n: pick.length }); }
  else rows.push({ hex, px: null, n: 0 });
}
console.log('granata sotto luci REALI del match (media pixel busto eroe):');
rows.forEach(r => { if (!r.px) { console.log(`  ${r.hex} → (nessun pixel kit campionato)`); return; } const [R, G, B] = r.px; const rosy = B > 70; const bright = R > 190; console.log(`  ${r.hex} → rgb(${R},${G},${B}) n=${r.n}${R >= 250 ? ' ⚠️R-CLAMP' : ''}${bright ? ' ⚠️TROPPO-CHIARO' : ''}${rosy ? ' ⚠️ROSA' : ''}`); });
