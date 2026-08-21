#!/usr/bin/env node
/* 7.539 — I COLORI DI NOTTE (nota PO «i colori sono ancora un po' slavati», screenshot delle 20:20 —
   e il PO gioca di sera). ⚠️ La taratura del 7.537 (esposizione 0,78→0,60) è stata fatta su scene
   qualunque, senza congelare l'ORA: se quelle scene erano diurne, la notte non è mai stata misurata.
   Qui l'ora si forza con l'hook `__CPM_TOD` (giorno/notte), le scene restano congelate e a seed fisso
   (nome invariato: il seed di partita nasce anche dal nome, 7.496), e oltre a saturazione e luminosità
   si misura il CONTRASTO — perché «slavato» di sera è soprattutto una scena piatta, non solo pallida. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, freeze, sleep } from './lib/harness.mjs';
import { PNG } from 'pngjs'; import fs from 'node:fs';
const SCENE = [0, 30, 120];
const DIR = '/tmp/claude-0/-home-user/6dd74479-f58d-5f3f-a846-19342f6001fd/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function braccio(tag, tod, init) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript((a) => { window.__CPM_GLB = false; window.__CPM_TOD = a.tod; if (a.no533) window.__CPM_NO533 = 1; if (a.no552) window.__CPM_NO552 = 1; if (a.no556) window.__CPM_NO556 = 1; if (a.expo) window.__CPM_EXPO552 = a.expo; }, { tod, ...init });
  await openMatch(page, port, { name: 'SatFix' });
  let sSum = 0, vSum = 0, v2 = 0, n = 0;
  for (const gi of SCENE) {
    await forceSituation(page, gi, { settle: 900, choose: true });
    await freeze(page);
    const f = `${DIR}/col-${tag}-${tod}-${gi}.png`;
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
  return { S: +(sSum / n).toFixed(4), V: +V.toFixed(4), C: +Math.sqrt(Math.max(0, v2 / n - V * V)).toFixed(4) };
}
const pct = (a, b) => `${(((a - b) / b) * 100).toFixed(1)}%`;
/* ⚠️ il braccio di RIFERIMENTO va ripetuto: fra due giri le sue stesse medie si muovono del 3-4%
   (posizioni d'apertura e meteo non sono identici), cioe' quanto l'effetto che si vuole misurare. Si
   ripete e si dichiara la dispersione invece di fidarsi di un giro solo. */
const GIRI = +(process.env.CPM_GIRI || 2);
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
for (const tod of ['day', 'night']) {
  const R = [], P = [], O = [];
  for (let g = 0; g < GIRI; g++) {
    R.push(await braccio('rif' + g, tod, { no533: 1 }));
    P.push(await braccio('prima' + g, tod, { no556: 1 }));
    O.push(await braccio('oggi' + g, tod, {}));
  }
  const m = (arr, k) => med(arr.map(x => x[k]));
  const rS = m(R, 'S'), rV = m(R, 'V'), rC = m(R, 'C');
  console.log(`\n${tod.toUpperCase()}  (${GIRI} giri per braccio, mediana)`);
  console.log(`  pre-7.529 (R5 spenta) : saturazione ${rS.toFixed(4)} · luminosità ${rV.toFixed(4)} · contrasto ${rC.toFixed(4)}`);
  console.log(`  7.538 (rosso NO556)   : ${pct(m(P, 'S'), rS)} sat · ${pct(m(P, 'V'), rV)} lum · ${pct(m(P, 'C'), rC)} contr`);
  console.log(`  7.539 (rimedio)       : ${pct(m(O, 'S'), rS)} sat · ${pct(m(O, 'V'), rV)} lum · ${pct(m(O, 'C'), rC)} contr`);
}
await b.close(); srv.close();
