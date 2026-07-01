/* Dump 2D della canvas di makeCrowdTex (nessun 3D di mezzo): ispezione diretta del disegno. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => typeof window.__CPM_makeCrowdTex === 'function', { timeout: 40000 });
const dump = await page.evaluate(() => {
  const mk = window.__CPM_makeCrowdTex;
  const out = {};
  const cases = {
    sud_full: { key: 'curvaSud', homeHex: '#7a1f2b', awayHex: '#1f4f7a', width: 84, fill: 0.97, intensity: 1, isAway: false, seedKey: 's1', sector: { team: 0.92, ultras: true, flags: 0.11, scarves: 0.2, banner: true, seated: 0.1 } },
    est_league: { key: 'tribunaEst', homeHex: '#7a1f2b', awayHex: '#1f8f3a', width: 126, fill: 0.6, intensity: 0.55, isAway: false, seedKey: 's2', wedgeFill: 0.33, sector: { team: 0.62, flags: 0.015, scarves: 0.1, seated: 0.72, families: 0.18, wedge: 0.14 } },
    ovest_trial: { key: 'tribunaOvest', homeHex: '#7a1f2b', awayHex: '#1f4f7a', width: 126, fill: 0.025, intensity: 0.03, isAway: false, seedKey: 's3', sector: { team: 0.58, flags: 0.01, scarves: 0.08, seated: 0.78, families: 0.22, vip: true } },
  };
  for (const [k, spec] of Object.entries(cases)) {
    const r = mk(spec);
    r.redraw(1234, 0, 0);
    out[k] = r.texLow.image.toDataURL('image/png');
  }
  return out;
});
await browser.close(); srv.close();
for (const [k, url] of Object.entries(dump)) {
  writeFileSync(path.join(HERE, 'out', `tex-${k}.png`), Buffer.from(url.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('  out/tex-' + k + '.png');
}
