#!/usr/bin/env node
/* 7.539 — SPAZZOLA LUCE × ESPOSIZIONE. La misura giorno/notte dice che il difetto non è dove lo cercavo:
   di notte lo scarto col mondo pre-7.529 è MINORE che di giorno, e in entrambi i casi il numero grosso non
   è la saturazione (−3/−8%) ma la LUMINOSITÀ (+25/+40%) insieme al CONTRASTO (−6/−8%). «Slavato» è una
   scena troppo chiara e troppo piatta, non una scena poco colorata. Qui si spazzola la coppia
   (luce `__CPM_K533` × esposizione `__CPM_EXPO552`) su scene congelate a seed fisso e si cerca il punto in
   cui luminosità e contrasto tornano vicini al riferimento senza spegnere la saturazione. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, freeze } from './lib/harness.mjs';
import { PNG } from 'pngjs'; import fs from 'node:fs';
const SCENE = [0, 30, 120];
const DIR = '/tmp/claude-0/-home-user/6dd74479-f58d-5f3f-a846-19342f6001fd/scratchpad';
const TOD = process.env.CPM_TOD || 'day';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function braccio(tag, init) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript((a) => { window.__CPM_GLB = false; window.__CPM_TOD = a.tod; if (a.no533) window.__CPM_NO533 = 1; if (a.k) window.__CPM_K533 = a.k; if (a.e) window.__CPM_EXPO552 = a.e; if (a.tm) window.__CPM_TM552 = a.tm; }, { tod: TOD, ...init });
  await openMatch(page, port, { name: 'SatFix' });
  let sSum = 0, vSum = 0, v2 = 0, n = 0;
  for (const gi of SCENE) {
    await forceSituation(page, gi, { settle: 900, choose: true });
    await freeze(page);
    const f = `${DIR}/spz-${tag}-${gi}.png`;
    await page.screenshot({ path: f });
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    const png = PNG.sync.read(fs.readFileSync(f));
    for (let i = 0; i < png.data.length; i += 4) {
      const R = png.data[i] / 255, G = png.data[i + 1] / 255, B = png.data[i + 2] / 255;
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      if (mx < 0.08) continue;
      const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      sSum += (mx === 0 ? 0 : (mx - mn) / mx); vSum += L; v2 += L * L; n++;
    }
  }
  await page.close();
  const V = vSum / n;
  return { S: sSum / n, V, C: Math.sqrt(Math.max(0, v2 / n - V * V)) };
}
const pct = (a, r) => `${(((a - r) / r) * 100).toFixed(1)}%`.padStart(7);
const rif = await braccio('rif', { no533: 1 });
console.log(`[${TOD}] riferimento pre-7.529 — S ${rif.S.toFixed(4)} · L ${rif.V.toFixed(4)} · C ${rif.C.toFixed(4)}\n`);
console.log('  luce  espos curva    |  saturazione   luminosità    contrasto');
const GRID = process.env.CPM_GRID ? JSON.parse(process.env.CPM_GRID) : [[1, 0.60], [0.86, 0.60], [0.74, 0.60], [0.62, 0.60], [0.74, 0.52], [0.62, 0.52], [0.74, 0.68], [0.86, 0.50]];
for (const [k, e, tm] of GRID) {
  const r = await braccio(`k${k}e${e}${tm || ''}`, { k, e, tm });
  console.log(`  ${String(k).padEnd(5)} ${String(e).padEnd(5)} ${String(tm || 'aces').padEnd(9)}| ${pct(r.S, rif.S)}      ${pct(r.V, rif.V)}      ${pct(r.C, rif.C)}`);
}
await b.close(); srv.close();
